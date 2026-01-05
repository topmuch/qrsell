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
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import SellerProfileForm from '@/components/dashboard/SellerProfileForm';
import ProductForm from '@/components/dashboard/ProductForm';
import ProductCard from '@/components/dashboard/ProductCard';
import TikTokGuide from '@/components/dashboard/TikTokGuide';
import SettingsTabs from '@/components/dashboard/SettingsTabs';
import ProductImportExport from '@/components/dashboard/ProductImportExport';
import KPICards from '@/components/dashboard/KPICards';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ActionCards from '@/components/dashboard/ActionCards';
import SellerStatus from '@/components/dashboard/SellerStatus';
import BannerDisplay from '@/components/dashboard/BannerDisplay';
import Banner from '@/components/Banner';
import HotDemandAlert from '@/components/dashboard/HotDemandAlert';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();

    // Load theme preference
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dashboard-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dashboard-theme', 'light');
    }
  };

  // Check subscription
  const { data: subscriptions = [], isLoading: loadingSubscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ user_email: user?.email });
      const now = new Date();
      return subs.filter(sub => 
        sub.is_active && 
        new Date(sub.end_date) > now
      );
    },
    enabled: !!user?.email
  });

  const activeSubscription = subscriptions[0];

  // Get seller profile
  const { data: sellers = [], isLoading: loadingSeller, refetch: refetchSeller } = useQuery({
    queryKey: ['seller', user?.email],
    queryFn: () => base44.entities.Seller.filter({ created_by: user?.email }),
    enabled: !!user?.email && !!activeSubscription
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

  // Fetch active campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns-for-seller'],
    queryFn: async () => {
      const all = await base44.entities.Campaign.list();
      return all.filter(c => c.status === 'active');
    }
  });

  // Calculate stats
  const totalScans = analytics.filter(a => a.event_type === 'scan').length;
  
  // Get recent activity
  const recentActivity = analytics.length > 0 
    ? (() => {
        const latest = analytics.sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        )[0];
        const product = products.find(p => p.id === latest.product_id);
        const timeAgo = Math.floor((new Date() - new Date(latest.created_date)) / (1000 * 60));
        
        if (latest.event_type === 'whatsapp_click' && product) {
          return `Un client a cliqué sur "${product.name}" il y a ${timeAgo}min`;
        }
        return null;
      })()
    : null;

  const handleExportAnalytics = () => {
    const csvData = products.map(product => {
      const productAnalytics = analytics.filter(a => a.product_id === product.id);
      return {
        Produit: product.name,
        Prix: product.price,
        Scans: productAnalytics.filter(a => a.event_type === 'scan').length,
        Vues: productAnalytics.filter(a => a.event_type === 'view_product').length,
        Clics: productAnalytics.filter(a => a.event_type === 'whatsapp_click').length
      };
    });

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
    base44.auth.logout(createPageUrl('Home'));
  };

  if (!user || loadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  // Check if user has active subscription
  if (!activeSubscription) {
    window.location.href = '/SubscriptionExpired';
    return null;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleDarkMode}
                className="dark:text-gray-300"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              {seller && (
                <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <Store className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
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
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Banner publicitaire */}
        <Banner position="dashboard" />

        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-2xl p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Bonjour, {seller?.full_name || 'Vendeur'} !
              </h1>
              <p className="text-white/90">
                Voici un aperçu de vos performances cette semaine
              </p>
            </div>
            {seller?.is_verified && (
              <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Vérifié</span>
              </div>
            )}
          </div>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563eb] data-[state=active]:to-[#3b82f6] data-[state=active]:text-white rounded-lg">
              <Sparkles className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563eb] data-[state=active]:to-[#3b82f6] data-[state=active]:text-white rounded-lg">
              <Package className="w-4 h-4" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563eb] data-[state=active]:to-[#3b82f6] data-[state=active]:text-white rounded-lg">
              <Sparkles className="w-4 h-4" />
              Campagnes
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563eb] data-[state=active]:to-[#3b82f6] data-[state=active]:text-white rounded-lg">
              <BookOpen className="w-4 h-4" />
              Guide TikTok
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563eb] data-[state=active]:to-[#3b82f6] data-[state=active]:text-white rounded-lg">
              <Settings className="w-4 h-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Hot Demand Alert */}
            <HotDemandAlert sellerId={seller?.id} products={products} />

            {/* KPIs */}
            <KPICards analytics={analytics} />

            {/* Shop QR Code Card */}
            {seller && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border dark:border-gray-700"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      QR Code de votre boutique
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Scannez ce code pour accéder directement à votre vitrine en ligne. Partagez-le sur vos réseaux sociaux, flyers ou vidéos TikTok.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={copyShopLink}
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copier le lien
                      </Button>
                      <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Voir la boutique
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <canvas 
                      ref={(canvas) => {
                        if (canvas && seller) {
                          import('qrcode').then(QRCode => {
                            QRCode.toCanvas(canvas, shopUrl, {
                              width: 300,
                              margin: 2,
                              color: {
                                dark: '#2563eb',
                                light: '#ffffff'
                              }
                            });
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Two columns layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Chart + Actions */}
              <div className="lg:col-span-2 space-y-8">
                <PerformanceChart products={products} analytics={analytics} />
                <ActionCards 
                  recentActivity={recentActivity}
                  onExport={handleExportAnalytics}
                />
              </div>

              {/* Right: Seller Status + Subscription */}
              <div className="space-y-6">
                <SellerStatus 
                  seller={seller}
                  productsCount={products.length}
                  totalScans={totalScans}
                />
                <SubscriptionStatus user={user} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">

            {/* Import/Export */}
            <ProductImportExport 
              seller={seller}
              products={products}
              onImportComplete={refetchProducts}
            />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mes produits</h2>
                <p className="text-gray-500">{products.length} produit{products.length > 1 ? 's' : ''}</p>
              </div>
              <Button 
                onClick={() => {
                  setEditProduct(null);
                  setShowProductForm(true);
                }}
                className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90 text-white shadow-lg"
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
                  className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90 text-white"
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
                      analytics={analytics}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-green-500" />
                🔥 Campagnes sponsorisées
              </h2>
              <p className="text-gray-600 mb-6">
                Participez à des campagnes et gagnez jusqu'à 5 € par intégration.
              </p>
              
              {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {campaigns.map(camp => (
                    <div key={camp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      {camp.product_image && (
                        <img 
                          src={camp.product_image} 
                          alt={camp.product_name} 
                          className="w-full h-32 object-cover rounded mb-3" 
                        />
                      )}
                      <h3 className="font-bold text-lg mb-1">{camp.product_name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{camp.partner_name}</p>
                      <p className="text-sm text-gray-500 mb-3">{camp.product_description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-green-600 font-bold">
                          {camp.commission_value} {camp.commission_type === 'percentage' ? '%' : '€'}
                        </span>
                        <Button 
                          onClick={() => window.location.href = '/SellerCampaigns'}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Participer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune campagne disponible pour l'instant.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="guide">
            <TikTokGuide shopUrl={shopUrl} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres de la boutique</h2>
                <p className="text-gray-500">Personnalisez votre vitrine en ligne</p>

                {/* Shop URL */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">URL de votre boutique</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-white rounded-lg text-sm truncate shadow-sm">
                      {shopUrl}
                    </code>
                    <Button variant="outline" onClick={copyShopLink} className="shadow-sm">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="shadow-sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              <SettingsTabs seller={seller} />
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