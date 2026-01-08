import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Store, Loader2, Search, Instagram, Facebook, Phone, MapPin, Mail } from 'lucide-react';
import BannerSlider from '@/components/shop/BannerSlider';
import CategoryBar from '@/components/shop/CategoryBar';
import ProductGrid from '@/components/shop/ProductGrid';
import LazyImage from '@/components/seo/LazyImage';
import SEOHead, { generateShopSchema, generateLocalizedKeywords } from '@/components/seo/SEOHead';

export default function Shop() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get shop by slug
  const { data: shops = [], isLoading: loadingShop, refetch: refetchShop } = useQuery({
    queryKey: ['shop', slug],
    queryFn: () => base44.entities.Shop.filter({ shop_slug: slug }),
    enabled: !!slug,
    staleTime: 0, // Always fetch fresh data immediately
    gcTime: 0 // No caching - always refetch
  });

  // Refetch shop data when page comes into focus
  React.useEffect(() => {
    // Refetch immediately on mount
    refetchShop();

    const handleFocus = () => {
      refetchShop();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchShop();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [slug, refetchShop]);

  const shop = shops[0];

  // Template configurations
  const getTemplateConfig = (templateId) => {
    const configs = {
      luxe: {
        bgColor: '#F8F6F3',
        textColor: '#2C2C2C',
        headerBg: '#FFFFFF',
        buttonBg: '#6C4AB6',
        buttonText: '#FFFFFF',
        accentColor: '#D4AF37',
        fontFamily: 'Poppins, serif',
        fontWeight: '300',
        headerShadow: 'shadow-lg',
        cardBg: '#FFFFFF'
      },
      vibrant: {
        bgColor: 'linear-gradient(135deg, #FF6B9D 0%, #6C4AB6 100%)',
        textColor: '#FFFFFF',
        headerBg: '#FFFFFF',
        buttonBg: '#FF6B9D',
        buttonText: '#FFFFFF',
        accentColor: '#FFD700',
        fontFamily: 'Poppins',
        fontWeight: '700',
        headerShadow: 'shadow-xl',
        cardBg: 'rgba(255,255,255,0.95)'
      },
      marche_local: {
        bgColor: '#FEFDF7',
        textColor: '#3D3D3D',
        headerBg: '#E8D4B8',
        buttonBg: '#2E8B57',
        buttonText: '#FFFFFF',
        accentColor: '#8B4513',
        fontFamily: 'Georgia, serif',
        fontWeight: '500',
        headerShadow: 'shadow-md',
        cardBg: '#FFFBF0'
      },
      minimal: {
        bgColor: '#FFFFFF',
        textColor: '#1A1A1A',
        headerBg: '#F5F5F5',
        buttonBg: '#000000',
        buttonText: '#FFFFFF',
        accentColor: '#CCCCCC',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '300',
        headerShadow: 'shadow-sm',
        cardBg: '#FAFAFA'
      }
    };
    return configs[templateId] || configs.vibrant;
  };

  const templateConfig = shop ? getTemplateConfig(shop.template || 'vibrant') : getTemplateConfig('vibrant');

  // Get products
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['shop-products', slug],
    queryFn: () => base44.entities.Product.filter({ shop_slug: slug, is_active: true }),
    enabled: !!slug
  });

  // Get analytics for featured products
  const { data: analytics = [] } = useQuery({
    queryKey: ['shop-analytics', shop?.seller_id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: shop?.seller_id }),
    enabled: !!shop?.seller_id
  });

  // Track shop view (anonymous - no auth required)
  React.useEffect(() => {
    if (shop?.seller_id) {
      base44.entities.Analytics.create({
        seller_id: shop.seller_id,
        event_type: 'view_shop',
        user_agent: navigator.userAgent
      }).catch(() => {
        // Silently ignore - analytics not critical for public view
      });
    }
  }, [shop?.seller_id]);

  const handleWhatsAppClick = (product) => {
    // Track analytics anonymously (no auth required)
    if (shop?.seller_id && product?.id) {
      base44.entities.Analytics.create({
        product_id: product.id,
        seller_id: shop.seller_id,
        product_public_id: product.public_id,
        event_type: 'whatsapp_click',
        user_agent: navigator.userAgent
      }).catch(() => {
        // Silently ignore
      });
    }
  };

  // Get available categories
  const availableCategories = React.useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  // Filter products
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Get featured products
  const featuredProducts = React.useMemo(() => {
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
  }, [products, analytics]);

  // Generate SEO data
  const shopSEO = React.useMemo(() => {
    if (!shop) return null;
    
    const productsCount = products.length;
    const pageTitle = `${shop.shop_name}${shop.category ? ` – ${shop.category}` : ''}${shop.city ? ` à ${shop.city}` : ''} | ShopQR`;
    const metaDesc = `Découvrez ${shop.shop_name}${shop.city ? ` à ${shop.city}` : ''}. ${productsCount} produit${productsCount > 1 ? 's' : ''} disponible${productsCount > 1 ? 's' : ''}. Commandez via WhatsApp.`;
    
    return {
      title: pageTitle,
      description: metaDesc,
      keywords: generateLocalizedKeywords({
        shop_name: shop.shop_name,
        category: shop.category,
        city: shop.city,
        country: shop.country,
        shop_slug: shop.shop_slug
      }),
      canonicalUrl: `https://shopqr.pro/@${shop.shop_slug}`,
      ogImage: shop.logo_url || shop.banner_url,
      schema: generateShopSchema({
        shop_name: shop.shop_name,
        city: shop.city,
        country: shop.country,
        whatsapp_number: shop.whatsapp_number,
        email: shop.email,
        address: shop.address,
        logo_url: shop.logo_url,
        banner_url: shop.banner_url,
        instagram: shop.instagram,
        tiktok: shop.tiktok,
        facebook: shop.facebook,
        shop_slug: shop.shop_slug
      }, productsCount)
    };
  }, [shop, products.length]);

  if (loadingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFFFF' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#6C4AB6]" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#6C4AB6] to-[#FF6B9D] rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Boutique non trouvée</h1>
          <p className="text-gray-600 mb-6">
            Cette boutique n'existe pas ou a été supprimée.
          </p>
          <a href="/" className="inline-block">
            <Button className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] hover:opacity-90 text-white">
              Retour à l'accueil
            </Button>
          </a>
        </div>
      </div>
    );
  }

  if (!loadingProducts && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#6C4AB6] to-[#FF6B9D] rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Boutique prête ! Produits bientôt disponibles
          </h1>
          <p className="text-gray-600 mb-4">
            <strong>{shop.shop_name}</strong> prépare son catalogue de produits.
          </p>
          <div className="flex flex-col gap-3">
            {shop.whatsapp_number && (
              <a 
                href={`https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Nous contacter sur WhatsApp
                </Button>
              </a>
            )}
            <a href="/" className="inline-block w-full">
              <Button variant="outline" className="w-full">
                Découvrir d'autres boutiques
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: templateConfig.bgColor,
        fontFamily: templateConfig.fontFamily,
        fontWeight: templateConfig.fontWeight,
        color: templateConfig.textColor
      }}
    >
      {/* SEO Head */}
      {shopSEO && (
        <SEOHead 
          title={shopSEO.title}
          description={shopSEO.description}
          keywords={shopSEO.keywords}
          canonicalUrl={shopSEO.canonicalUrl}
          ogImage={shopSEO.ogImage}
          schema={shopSEO.schema}
        />
      )}
      
      {/* Header */}
      <header 
        className={`sticky top-0 z-50 ${templateConfig.headerShadow}`}
        style={{ 
          backgroundColor: templateConfig.headerBg,
          borderBottom: `2px solid ${templateConfig.accentColor}`
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              {shop?.logo_url ? (
                <img 
                  src={shop.logo_url} 
                  alt={shop.shop_name}
                  className="h-12 md:h-16 w-auto object-contain"
                />
              ) : (
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg"
                  style={{
                    background: templateConfig.buttonBg
                  }}
                >
                  {shop.shop_name?.[0]?.toUpperCase() || 'B'}
                </div>
              )}
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2 md:gap-3">
              {shop.whatsapp_number && (
                <a 
                  href={`https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-11 md:h-11 bg-[#10B981] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </a>
              )}
              {shop.instagram && (
                <a 
                  href={`https://instagram.com/${shop.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-11 md:h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <Instagram className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </a>
              )}
              {shop.tiktok && (
                <a 
                  href={`https://tiktok.com/@${shop.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-11 md:h-11 bg-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              {shop.facebook && (
                <a 
                  href={shop.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-11 md:h-11 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <Facebook className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Banner Slider */}
      {shop.banner_images && shop.banner_images.length > 0 && (
        <div className="w-full">
          <BannerSlider images={shop.banner_images} />
        </div>
      )}

      <main className="container mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <header className="mb-12" itemScope itemType="https://schema.org/LocalBusiness">
          <h1 
            className="text-4xl md:text-5xl font-black mb-4" 
            itemProp="name"
            style={{ 
              color: templateConfig.textColor
            }}
          >
            {shop.shop_name}
          </h1>
          {shop.address && (
            <div 
              className="flex items-center gap-2 mb-2" 
              itemProp="address" 
              itemScope 
              itemType="https://schema.org/PostalAddress"
              style={{ color: templateConfig.textColor }}
            >
              <MapPin className="w-5 h-5" />
              <span>
                <span itemProp="streetAddress">{shop.address}</span>
                {shop.city && <span itemProp="addressLocality">, {shop.city}</span>}
              </span>
            </div>
          )}
          {shop.whatsapp_number && (
            <div className="flex items-center gap-2 mb-2" style={{ color: templateConfig.textColor }}>
              <Phone className="w-5 h-5" />
              <span itemProp="telephone">{shop.whatsapp_number}</span>
            </div>
          )}
        </header>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="mb-16" aria-label="Produits populaires">
            <h2 
              className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-3"
              style={{ color: templateConfig.textColor }}
            >
              <span className="text-4xl">🔥</span>
              <span>Produits populaires</span>
            </h2>
            <ProductGrid 
              products={featuredProducts}
              seller={shop}
              onWhatsAppClick={handleWhatsAppClick}
              showQR={templateConfig.qrVisible}
            />
          </section>
        )}

        {/* All Products */}
        <section aria-label="Catalogue complet">
          <h2 
            className="text-3xl md:text-4xl font-black mb-8"
            style={{ color: templateConfig.textColor }}
          >
            Tous les produits
          </h2>

          {loadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: templateConfig.textColor }} />
            </div>
          ) : (
            <ProductGrid 
              products={products.filter(p => p.is_active)}
              seller={shop}
              onWhatsAppClick={handleWhatsAppClick}
              showQR={templateConfig.qrVisible}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20 py-12">
        <div className="container mx-auto px-4">
          {shop.payment_methods && shop.payment_methods.length > 0 && (
            <div className="mb-12">
              <h3 className="text-center font-bold text-gray-900 mb-8 text-xl">Méthodes de paiement</h3>
              <div className="flex flex-wrap items-center justify-center gap-12">
                {shop.payment_methods.map((logo, index) => (
                  <img 
                    key={index}
                    src={logo} 
                    alt={`Paiement ${index + 1}`}
                    className="h-12 object-contain filter grayscale hover:grayscale-0"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{shop.shop_name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {shop.address && <p>{shop.address}</p>}
                {shop.whatsapp_number && <p>{shop.whatsapp_number}</p>}
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-400 mb-1">Propulsé par</p>
              <a 
                href="https://shopqr.pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block opacity-30 hover:opacity-50 transition-opacity"
              >
                <span className="text-xs font-semibold bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] bg-clip-text text-transparent">
                  ShopQR
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}