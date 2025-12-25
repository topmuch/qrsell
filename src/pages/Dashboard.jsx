import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Package, 
  BookOpen, 
  Settings, 
  Store, 
  Copy, 
  Check,
  ExternalLink,
  Loader2,
  QrCode,
  Eye,
  MessageCircle
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import SellerProfileForm from '@/components/dashboard/SellerProfileForm';
import ProductForm from '@/components/dashboard/ProductForm';
import ProductCard from '@/components/dashboard/ProductCard';
import TikTokGuide from '@/components/dashboard/TikTokGuide';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import ShopCustomization from '@/components/dashboard/ShopCustomization';
import ProductImportExport from '@/components/dashboard/ProductImportExport';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Get seller profile
  const { data: sellers = [], isLoading: loadingSeller, refetch: refetchSeller } = useQuery({
    queryKey: ['seller', user?.email],
    queryFn: () => base44.entities.Seller.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  const seller = sellers[0];

  // Get products
  const { data: products = [], isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['products', seller?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Get analytics
  const { data: analytics = [] } = useQuery({
    queryKey: ['analytics', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Calculate stats
  const stats = {
    totalScans: analytics.filter(a => a.event_type === 'scan').length,
    totalViews: analytics.filter(a => a.event_type === 'view_product').length,
    whatsappClicks: analytics.filter(a => a.event_type === 'whatsapp_click').length,
    shopViews: analytics.filter(a => a.event_type === 'view_shop').length
  };

  const deleteMutation = useMutation({
    mutationFn: (productId) => base44.entities.Product.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });

  const handleProfileComplete = () => {
    refetchSeller();
  };

  const handleProductSuccess = () => {
    refetchProducts();
    setEditProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (product) => {
    if (confirm(`Supprimer "${product.name}" ?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const shopUrl = seller ? `${window.location.origin}/Shop?slug=${seller.shop_slug}` : '';

  const copyShopLink = () => {
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  // Show profile form if seller profile not completed
  if (!loadingSeller && !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/50 to-white py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          <SellerProfileForm user={user} onProfileComplete={handleProfileComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            
            <div className="flex items-center gap-4">
              {seller && (
                <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <Store className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 truncate max-w-[150px]">
                    {seller.shop_name}
                  </span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6"
                    onClick={copyShopLink}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                  <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white border p-1 rounded-xl">
            <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ed477c] data-[state=active]:to-[#ff6b9d] data-[state=active]:text-white rounded-lg">
              <Package className="w-4 h-4" />
              Mes produits
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ed477c] data-[state=active]:to-[#ff6b9d] data-[state=active]:text-white rounded-lg">
              <BookOpen className="w-4 h-4" />
              Guide TikTok
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ed477c] data-[state=active]:to-[#ff6b9d] data-[state=active]:text-white rounded-lg">
              <Settings className="w-4 h-4" />
              Boutique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {/* Analytics Overview */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <AnalyticsCard 
                title="Scans QR Code"
                value={stats.totalScans}
                icon={QrCode}
                color="text-[#ed477c]"
              />
              <AnalyticsCard 
                title="Vues produits"
                value={stats.totalViews}
                icon={Eye}
                color="text-blue-500"
              />
              <AnalyticsCard 
                title="Clics WhatsApp"
                value={stats.whatsappClicks}
                icon={MessageCircle}
                color="text-green-500"
              />
              <AnalyticsCard 
                title="Vues boutique"
                value={stats.shopViews}
                icon={Store}
                color="text-purple-500"
              />
            </div>

            {/* Import/Export */}
            <div className="mb-6">
              <ProductImportExport 
                seller={seller}
                products={products}
                onImportComplete={refetchProducts}
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes produits</h1>
                <p className="text-gray-500">{products.length} produit{products.length > 1 ? 's' : ''}</p>
              </div>
              <Button 
                onClick={() => {
                  setEditProduct(null);
                  setShowProductForm(true);
                }}
                className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>

            {loadingProducts ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"
              >
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit</h3>
                <p className="text-gray-500 mb-6">Commencez par ajouter votre premier produit</p>
                <Button 
                  onClick={() => setShowProductForm(true)}
                  className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                </Button>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      seller={seller}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="guide">
            <TikTokGuide shopUrl={shopUrl} />
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-4xl space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Personnalisation de la boutique</h2>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Shop Customization */}
                <ShopCustomization seller={seller} />

                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Informations</h3>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nom de la boutique</label>
                      <p className="text-lg text-gray-900">{seller?.shop_name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Numéro WhatsApp</label>
                      <p className="text-lg text-gray-900">{seller?.whatsapp_number}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">URL de la boutique</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-3 bg-gray-50 rounded-lg text-sm truncate">
                          {shopUrl}
                        </code>
                        <Button variant="outline" onClick={copyShopLink}>
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Product form modal */}
      {showProductForm && seller && (
        <ProductForm 
          open={showProductForm}
          onClose={() => {
            setShowProductForm(false);
            setEditProduct(null);
          }}
          seller={seller}
          editProduct={editProduct}
          onSuccess={handleProductSuccess}
        />
      )}
    </div>
  );
}