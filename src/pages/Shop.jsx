import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Store, Loader2, Search, Instagram, Facebook, Phone, MapPin, Mail } from 'lucide-react';
import BannerSlider from '@/components/shop/BannerSlider';
import CategoryBar from '@/components/shop/CategoryBar';
import ProductGrid from '@/components/shop/ProductGrid';

export default function Shop() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get seller by slug
  const { data: sellers = [], isLoading: loadingSeller } = useQuery({
    queryKey: ['seller', slug],
    queryFn: () => base44.entities.Seller.filter({ shop_slug: slug }),
    enabled: !!slug
  });

  const seller = sellers[0];

  // Track shop view
  React.useEffect(() => {
    if (seller) {
      base44.entities.Analytics.create({
        seller_id: seller.id,
        event_type: 'view_shop',
        user_agent: navigator.userAgent
      }).catch(() => {});
    }
  }, [seller?.id]);

  // Get products
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['shop-products', slug],
    queryFn: () => base44.entities.Product.filter({ shop_slug: slug, is_active: true }),
    enabled: !!slug
  });

  // Get analytics for featured products
  const { data: analytics = [] } = useQuery({
    queryKey: ['shop-analytics', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  const handleWhatsAppClick = (product) => {
    base44.entities.Analytics.create({
      product_id: product.id,
      seller_id: seller.id,
      product_public_id: product.public_id,
      event_type: 'whatsapp_click',
      user_agent: navigator.userAgent
    }).catch(() => {});
  };

  // Get available categories
  const availableCategories = React.useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  // Filter products
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Get featured products (top 4 by scans or most recent)
  const featuredProducts = React.useMemo(() => {
    if (!seller?.show_featured_products) return [];
    
    const productScans = products.map(product => ({
      product,
      scans: analytics.filter(a => 
        a.product_id === product.id && a.event_type === 'scan'
      ).length
    }));

    return productScans
      .sort((a, b) => {
        if (b.scans !== a.scans) return b.scans - a.scans;
        return new Date(b.product.created_date) - new Date(a.product.created_date);
      })
      .slice(0, 4)
      .map(item => item.product);
  }, [products, analytics, seller]);

  if (loadingSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Store className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Boutique introuvable</h1>
        <p className="text-gray-500">Cette boutique n'existe pas ou a été désactivée.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Shop Name - centered on mobile */}
            <div className="flex items-center gap-4 flex-1">
              {seller.logo_url ? (
                <img 
                  src={seller.logo_url} 
                  alt={seller.shop_name}
                  className="w-16 h-16 md:w-14 md:h-14 rounded-full object-cover border-2 border-gray-100"
                />
              ) : (
                <div 
                  className="w-16 h-16 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${seller.primary_color || '#2563eb'} 0%, ${seller.secondary_color || '#3b82f6'} 100%)`
                  }}
                >
                  {seller.shop_name?.[0]?.toUpperCase() || 'B'}
                </div>
              )}
              <div>
                <h1 className="font-bold text-gray-900 text-xl md:text-2xl">{seller.shop_name}</h1>
                <p className="text-sm text-gray-500">{products.length} produit{products.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Social Icons */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {seller.whatsapp_number && (
                <a 
                  href={`https://wa.me/${seller.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </a>
              )}
              {seller.instagram && (
                <a 
                  href={`https://instagram.com/${seller.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              )}
              {seller.tiktok && (
                <a 
                  href={`https://tiktok.com/@${seller.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              {seller.facebook && (
                <a 
                  href={seller.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Banner Slider */}
      {seller.banner_images && seller.banner_images.length > 0 && (
        <BannerSlider images={seller.banner_images} />
      )}

      {/* Categories */}
      <CategoryBar 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        availableCategories={availableCategories}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Featured Products */}
        {featuredProducts.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🔥</span>
              <span>Produits populaires</span>
            </h2>
            <ProductGrid 
              products={featuredProducts}
              seller={seller}
              onWhatsAppClick={handleWhatsAppClick}
            />
          </div>
        )}

        {/* All Products */}
        <div>
          {selectedCategory !== 'all' || searchQuery ? (
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {searchQuery ? `Résultats pour "${searchQuery}"` : `Catégorie: ${selectedCategory}`}
            </h2>
          ) : featuredProducts.length > 0 ? (
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tous nos produits</h2>
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos produits</h2>
          )}

          {loadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
            </div>
          ) : (
            <ProductGrid 
              products={filteredProducts}
              seller={seller}
              onWhatsAppClick={handleWhatsAppClick}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 py-10">
        <div className="container mx-auto px-4">
          {/* Payment Methods */}
          {seller.payment_methods && seller.payment_methods.length > 0 && (
            <div className="mb-10">
              <h3 className="text-center font-semibold text-gray-700 mb-6 text-lg">Méthodes de paiement</h3>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {seller.payment_methods.map((logo, index) => (
                  <img 
                    key={index}
                    src={logo} 
                    alt={`Paiement ${index + 1}`}
                    className="h-10 object-contain hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Partners */}
          {seller.partner_logos && seller.partner_logos.length > 0 && (
            <div className="mb-10">
              <h3 className="text-center font-semibold text-gray-700 mb-6 text-lg">Nos partenaires</h3>
              <div className="flex flex-wrap items-center justify-center gap-10">
                {seller.partner_logos.map((logo, index) => (
                  <img 
                    key={index}
                    src={logo} 
                    alt={`Partenaire ${index + 1}`}
                    className="h-14 object-contain hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="border-t pt-8">
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">{seller.shop_name}</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  {seller.address && (
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" /> 
                      {seller.address}
                    </p>
                  )}
                  {seller.whatsapp_number && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> 
                      {seller.whatsapp_number}
                    </p>
                  )}
                  {seller.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> 
                      {seller.email}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-end">
                <p className="text-xs text-gray-400 mb-1">Propulsé par</p>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6951cb5c7a9163102135b23b/bd5ee73bd_qrsell-logo.png" 
                  alt="QRSell" 
                  className="h-5 opacity-40 hover:opacity-60 transition-opacity"
                />
              </div>
            </div>
            
            <div className="border-t pt-4 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} {seller.shop_name}. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}