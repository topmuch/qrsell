import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Store, Loader2, Search, Instagram, Facebook, Phone, MapPin, Mail } from 'lucide-react';
import BannerSlider from '@/components/shop/BannerSlider';
import CategoryBar from '@/components/shop/CategoryBar';
import ProductGrid from '@/components/shop/ProductGrid';
import SEOHead, { generateShopSchema, generateLocalizedKeywords } from '@/components/seo/SEOHead';

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

  // Generate SEO data for shop
  const shopSEO = React.useMemo(() => {
    if (!seller) return null;
    
    const productsCount = products.length;
    const pageTitle = `${seller.shop_name}${seller.category ? ` – ${seller.category}` : ''}${seller.city ? ` à ${seller.city}` : ''} | ShopQR`;
    const metaDesc = `Découvrez ${seller.shop_name}${seller.city ? ` à ${seller.city}` : ''}. ${productsCount} produit${productsCount > 1 ? 's' : ''} disponible${productsCount > 1 ? 's' : ''}. Commandez via WhatsApp ou scannez le QR code.${seller.city ? ` Livraison à ${seller.city}.` : ''}`;
    
    return {
      title: pageTitle,
      description: metaDesc,
      keywords: generateLocalizedKeywords(seller),
      canonicalUrl: `https://shopqr.pro/@${seller.shop_slug}`,
      ogImage: seller.logo_url || seller.banner_url,
      schema: generateShopSchema(seller, productsCount)
    };
  }, [seller, products.length]);

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
    <div className="min-h-screen bg-white">
      {/* SEO Head - Dynamic per shop */}
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
      
      {/* Header - Logo uniquement à gauche, réseaux sociaux à droite */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo vendeur uniquement */}
            <div className="flex items-center">
              {seller?.logo_url ? (
                <img 
                  src={seller.logo_url} 
                  alt={seller.shop_name}
                  className="h-12 md:h-16 w-auto object-contain"
                />
              ) : (
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${seller.primary_color || '#6C4AB6'} 0%, ${seller.secondary_color || '#FF6B9D'} 100%)`
                  }}
                >
                  {seller.shop_name?.[0]?.toUpperCase() || 'B'}
                </div>
              )}
            </div>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-2 md:gap-3">
              {seller.whatsapp_number && (
                <a 
                  href={`https://wa.me/${seller.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-11 md:h-11 bg-[#10B981] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </a>
              )}
              {seller.instagram && (
                <a 
                  href={`https://instagram.com/${seller.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-11 md:h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <Instagram className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </a>
              )}
              {seller.tiktok && (
                <a 
                  href={`https://tiktok.com/@${seller.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-11 md:h-11 bg-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              {seller.facebook && (
                <a 
                  href={seller.facebook}
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
      {seller.banner_images && seller.banner_images.length > 0 && (
        <div className="w-full">
          <BannerSlider images={seller.banner_images} />
        </div>
      )}

      <main className="container mx-auto px-4 py-6 md:py-12">
        {/* SEO-friendly content header with semantic HTML */}
        <header className="mb-12" itemScope itemType="https://schema.org/LocalBusiness">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" itemProp="name">
            {seller.shop_name}
          </h1>
          {seller.address && (
            <div className="flex items-center gap-2 text-gray-600 mb-2" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <MapPin className="w-5 h-5" />
              <span>
                <span itemProp="streetAddress">{seller.address}</span>
                {seller.city && <span itemProp="addressLocality">, {seller.city}</span>}
                {seller.country && <meta itemProp="addressCountry" content={seller.country} />}
              </span>
            </div>
          )}
          {seller.whatsapp_number && (
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Phone className="w-5 h-5" />
              <span itemProp="telephone">{seller.whatsapp_number}</span>
            </div>
          )}
          {seller.email && (
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Mail className="w-5 h-5" />
              <span itemProp="email">{seller.email}</span>
            </div>
          )}
          {/* Hidden SEO content */}
          {seller.logo_url && <meta itemProp="image" content={seller.logo_url} />}
          <meta itemProp="url" content={`https://shopqr.pro/@${seller.shop_slug}`} />
        </header>

        {/* Featured Products - SEO optimized section */}
        {featuredProducts.length > 0 && (
          <section className="mb-16" aria-label="Produits populaires">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <span>Produits populaires chez {seller.shop_name}</span>
            </h2>
            <ProductGrid 
              products={featuredProducts}
              seller={seller}
              onWhatsAppClick={handleWhatsAppClick}
              showQR={true}
            />
          </section>
        )}

        {/* All Products - SEO optimized catalogue */}
        <section aria-label="Catalogue complet">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">
            Tous les produits de {seller.shop_name}{seller.city ? ` à ${seller.city}` : ''}
          </h2>

          {loadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6B9D]" />
            </div>
          ) : (
            <ProductGrid 
              products={products.filter(p => p.is_active)}
              seller={seller}
              onWhatsAppClick={handleWhatsAppClick}
              showQR={true}
            />
          )}
          
          {/* SEO-friendly product list for crawlers */}
          <div className="sr-only" aria-hidden="true">
            <h3>Liste des produits disponibles :</h3>
            <ul>
              {products.filter(p => p.is_active).map(product => (
                <li key={product.id}>
                  {product.name} - {product.price} FCFA - {product.category || 'Divers'}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20 py-12">
        <div className="container mx-auto px-4">
          {/* Payment Methods */}
          {seller.payment_methods && seller.payment_methods.length > 0 && (
            <div className="mb-12">
              <h3 className="text-center font-bold text-gray-900 mb-8 text-xl">Méthodes de paiement acceptées</h3>
              <div className="flex flex-wrap items-center justify-center gap-12">
                {seller.payment_methods.map((logo, index) => (
                  <img 
                    key={index}
                    src={logo} 
                    alt={`Paiement ${index + 1}`}
                    className="h-12 object-contain hover:scale-110 transition-transform filter grayscale hover:grayscale-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Partners */}
          {seller.partner_logos && seller.partner_logos.length > 0 && (
            <div className="mb-12 pb-12 border-b">
              <h3 className="text-center font-bold text-gray-900 mb-8 text-xl">Nos partenaires</h3>
              <div className="flex flex-wrap items-center justify-center gap-14">
                {seller.partner_logos.map((logo, index) => (
                  <img 
                    key={index}
                    src={logo} 
                    alt={`Partenaire ${index + 1}`}
                    className="h-16 object-contain hover:scale-110 transition-transform filter grayscale hover:grayscale-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{seller.shop_name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {seller.address && <p>{seller.address}</p>}
                {seller.whatsapp_number && <p>{seller.whatsapp_number}</p>}
                {seller.email && <p>{seller.email}</p>}
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-400 mb-1">Boutique propulsée par</p>
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
          
          {/* SEO Footer Links */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400 mb-2">
              {seller.shop_name} - Boutique {seller.category || 'en ligne'}{seller.city ? ` à ${seller.city}` : ''}{seller.country ? `, ${seller.country}` : ''}
            </p>
            <p className="text-xs text-gray-400">
              Commandez facilement via WhatsApp ou scannez nos QR codes. Livraison disponible.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}