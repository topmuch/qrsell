import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, MapPin, Mail, Phone, Instagram, Facebook, Store } from 'lucide-react';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';
import SEOHead, { generateShopSchema, generateLocalizedKeywords } from '@/components/seo/SEOHead';

export default function PublicShop() {
  // Get shop_slug from URL path (/@shop_slug)
  const slug = window.location.pathname.replace('/@', '').replace('/', '');

  // Fetch shop data - NO AUTHENTICATION REQUIRED
  const { data: shops = [], isLoading: loadingShop } = useQuery({
    queryKey: ['public-shop', slug],
    queryFn: async () => {
      try {
        const result = await base44.entities.Shop.filter({ shop_slug: slug, is_active: true });
        return result;
      } catch (error) {
        console.error('Error loading shop:', error);
        return [];
      }
    },
    enabled: !!slug,
    retry: false
  });

  const shop = shops[0];

  // Fetch products - NO AUTHENTICATION REQUIRED
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['public-products', slug],
    queryFn: async () => {
      try {
        const result = await base44.entities.Product.filter({ 
          shop_slug: slug, 
          is_active: true 
        });
        return result;
      } catch (error) {
        console.error('Error loading products:', error);
        return [];
      }
    },
    enabled: !!slug && !!shop,
    retry: false
  });

  // Template configurations
  const templates = {
    vibrant: {
      bgColor: '#FAF9FC',
      primary: '#6C4AB6',
      secondary: '#FF6B9D',
      textColor: '#1F2937',
      cardBg: '#FFFFFF'
    },
    luxe: {
      bgColor: '#FFFFFF',
      primary: '#000000',
      secondary: '#D4AF37',
      textColor: '#000000',
      cardBg: '#F9FAFB'
    },
    minimal: {
      bgColor: '#FFFFFF',
      primary: '#374151',
      secondary: '#9CA3AF',
      textColor: '#111827',
      cardBg: '#F9FAFB'
    },
    marche_local: {
      bgColor: '#FEF3C7',
      primary: '#92400E',
      secondary: '#059669',
      textColor: '#78350F',
      cardBg: '#FFFBEB'
    }
  };

  const templateConfig = templates[shop?.template] || templates.vibrant;

  // Generate SEO data
  const shopSEO = React.useMemo(() => {
    if (!shop) return null;
    
    return {
      title: `${shop.shop_name}${shop.city ? ` à ${shop.city}` : ''} | ShopQR`,
      description: `Découvrez ${shop.shop_name}${shop.city ? ` à ${shop.city}` : ''}. ${products.length} produit${products.length > 1 ? 's' : ''} disponible${products.length > 1 ? 's' : ''}. Commandez via WhatsApp.`,
      keywords: generateLocalizedKeywords({
        shop_name: shop.shop_name,
        category: shop.category,
        city: shop.city,
        country: shop.country
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
      }, products.length)
    };
  }, [shop, products.length]);

  // Track view (anonymous - best effort, no blocking)
  React.useEffect(() => {
    if (shop?.seller_id) {
      base44.entities.Analytics.create({
        seller_id: shop.seller_id,
        event_type: 'view_shop',
        user_agent: navigator.userAgent
      }).catch(() => {});
    }
  }, [shop?.seller_id]);

  // Handle WhatsApp click
  const handleWhatsAppClick = (product) => {
    if (shop?.seller_id && product?.id) {
      base44.entities.Analytics.create({
        product_id: product.id,
        seller_id: shop.seller_id,
        event_type: 'whatsapp_click',
        user_agent: navigator.userAgent
      }).catch(() => {});
    }

    const message = `Bonjour, je suis intéressé(e) par ${product.name} (${new Intl.NumberFormat('fr-FR').format(product.price)} FCFA)`;
    window.open(`https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Loading state
  if (loadingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: templateConfig.bgColor }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: templateConfig.primary }} />
      </div>
    );
  }

  // Shop not found
  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#6C4AB6] to-[#FF6B9D] rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Boutique introuvable</h1>
          <p className="text-gray-600 mb-6">
            Cette boutique n'existe pas ou a été désactivée.
          </p>
          <a href="/">
            <Button className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] hover:opacity-90 text-white">
              Découvrir d'autres boutiques
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Shop exists but no products
  if (!loadingProducts && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#6C4AB6] to-[#FF6B9D] rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{shop.shop_name}</h1>
          <p className="text-xl text-gray-700 mb-6">
            Cette boutique sera bientôt ouverte !
          </p>
          <p className="text-gray-600 mb-6">
            Revenez dans quelques instants pour découvrir nos produits.
          </p>
          {shop.whatsapp_number && (
            <Button 
              onClick={() => window.open(`https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}`, '_blank')}
              className="bg-[#10B981] hover:bg-[#059669] text-white mb-4"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Nous contacter sur WhatsApp
            </Button>
          )}
          <a href="/">
            <Button variant="outline">
              Découvrir d'autres boutiques
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const shopUrl = `${window.location.origin}/@${shop.shop_slug}`;

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: templateConfig.bgColor }}
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
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {shop.logo_url ? (
                <img 
                  src={shop.logo_url} 
                  alt={shop.shop_name}
                  className="h-12 md:h-16 w-auto object-contain"
                />
              ) : (
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${shop.primary_color || templateConfig.primary} 0%, ${shop.secondary_color || templateConfig.secondary} 100%)`
                  }}
                >
                  {shop.shop_name?.[0]?.toUpperCase() || 'B'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {shop.whatsapp_number && (
                <a 
                  href={`https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-11 md:h-11 bg-[#10B981] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </a>
              )}
              {shop.instagram && (
                <a 
                  href={`https://instagram.com/${shop.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              )}
              {shop.tiktok && (
                <a 
                  href={`https://tiktok.com/@${shop.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-11 md:h-11 bg-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <span className="text-white text-lg">🎵</span>
                </a>
              )}
              {shop.facebook && (
                <a 
                  href={shop.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-11 md:h-11 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      {shop.banner_url && (
        <div className="w-full">
          <img 
            src={shop.banner_url} 
            alt="Bannière"
            className="w-full h-48 md:h-80 object-cover"
          />
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Shop Info */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ color: templateConfig.textColor }}
          >
            {shop.shop_name}
          </h1>
          
          {shop.address && (
            <div className="flex items-center justify-center gap-2 mb-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{shop.address}{shop.city ? `, ${shop.city}` : ''}</span>
            </div>
          )}
          
          {shop.whatsapp_number && (
            <div className="flex items-center justify-center gap-2 mb-2 text-gray-600">
              <Phone className="w-5 h-5" />
              <span>{shop.whatsapp_number}</span>
            </div>
          )}
          
          {shop.email && (
            <div className="flex items-center justify-center gap-2 mb-4 text-gray-600">
              <Mail className="w-5 h-5" />
              <span>{shop.email}</span>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <h2 
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: templateConfig.textColor }}
          >
            Nos produits
          </h2>
          
          {loadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: templateConfig.primary }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                >
                  {product.image_url && (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-2xl font-black mb-4" style={{ color: templateConfig.primary }}>
                      {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA
                    </p>
                    <Button
                      onClick={() => handleWhatsAppClick(product)}
                      className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Commander
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-6" style={{ color: templateConfig.textColor }}>
            Scannez pour commander
          </h3>
          <div className="bg-gray-50 p-6 rounded-xl inline-block">
            <EnhancedQRCode
              url={shopUrl}
              size={250}
              color={shop.primary_color || templateConfig.primary}
              logo={shop.logo_url}
            />
          </div>
          <p className="mt-4 text-gray-600">
            Scannez ce QR code avec votre téléphone
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-2">
            © 2024 {shop.shop_name}. Propulsé par ShopQR.
          </p>
          {shop.address && (
            <p className="text-sm text-gray-500">
              📍 {shop.address}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}