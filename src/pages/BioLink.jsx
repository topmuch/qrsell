import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';
import FloatingWhatsAppButton from '@/components/ui/FloatingWhatsAppButton';

export default function BioLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  // Fetch seller
  const { data: sellers = [], isLoading: loadingSeller } = useQuery({
    queryKey: ['biolink-seller', slug],
    queryFn: () => base44.entities.Seller.filter({ shop_slug: slug }),
    refetchInterval: 300000, // Refresh every 5 minutes
    enabled: !!slug
  });

  const seller = sellers[0];

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['biolink-products', seller?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: seller?.id, is_active: true }),
    refetchInterval: 300000,
    enabled: !!seller?.id
  });

  // Fetch promotions
  const { data: promotions = [] } = useQuery({
    queryKey: ['biolink-promotions', seller?.id],
    queryFn: () => base44.entities.Promotion.filter({ seller_id: seller?.id, is_active: true }),
    refetchInterval: 300000,
    enabled: !!seller?.id
  });

  // Fetch analytics (last 24h)
  const { data: analytics = [] } = useQuery({
    queryKey: ['biolink-analytics', seller?.id],
    queryFn: async () => {
      const allAnalytics = await base44.entities.Analytics.filter({ seller_id: seller?.id });
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return allAnalytics.filter(a => new Date(a.created_date) >= yesterday);
    },
    refetchInterval: 300000,
    enabled: !!seller?.id
  });

  // Select featured product
  const getFeaturedProduct = () => {
    // Manual selection (priority 0)
    if (seller?.use_manual_featured && seller?.featured_product_id) {
      const manualProduct = products.find(p => p.id === seller.featured_product_id);
      if (manualProduct) return manualProduct;
    }

    // Priority 1: Active promotion
    if (promotions.length > 0) {
      const activePromo = promotions[0];
      const promoProduct = products.find(p => p.id === activePromo.product_id);
      if (promoProduct) return promoProduct;
    }

    // Priority 2: Most scanned in last 24h
    if (analytics.length > 0) {
      const scans = analytics.filter(a => a.event_type === 'scan');
      const scanCounts = {};
      scans.forEach(scan => {
        scanCounts[scan.product_id] = (scanCounts[scan.product_id] || 0) + 1;
      });
      const topProductId = Object.keys(scanCounts).sort((a, b) => scanCounts[b] - scanCounts[a])[0];
      if (topProductId) {
        const topProduct = products.find(p => p.id === topProductId);
        if (topProduct) return topProduct;
      }
    }

    // Priority 3: Latest product
    if (products.length > 0) {
      return products.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
    }

    return null;
  };

  const featuredProduct = getFeaturedProduct();

  // Track view
  useEffect(() => {
    if (seller && featuredProduct) {
      base44.entities.Analytics.create({
        product_id: featuredProduct.id,
        seller_id: seller.id,
        product_public_id: featuredProduct.public_id,
        event_type: 'view_product',
        user_agent: navigator.userAgent
      }).catch(() => {});
    }
  }, [featuredProduct?.id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const handleWhatsAppClick = () => {
    if (!seller || !featuredProduct) return;
    
    const message = `Bonjour, je viens de votre lien bio et je veux le produit : ${featuredProduct.name}\nPrix : ${formatPrice(featuredProduct.price)} FCFA`;
    const whatsappUrl = `https://wa.me/${seller.whatsapp_number}?text=${encodeURIComponent(message)}`;
    
    // Track click
    base44.entities.Analytics.create({
      product_id: featuredProduct.id,
      seller_id: seller.id,
      product_public_id: featuredProduct.public_id,
      event_type: 'whatsapp_click',
      user_agent: navigator.userAgent
    }).catch(() => {});

    window.open(whatsappUrl, '_blank');
  };

  if (loadingSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!seller || !featuredProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Boutique introuvable</h2>
          <p className="text-gray-600">Cette boutique n'existe pas ou n'a pas de produits actifs.</p>
        </div>
      </div>
    );
  }

  const qrUrl = `${window.location.origin}/ProductPage?id=${featuredProduct.public_id}`;
  const activePromo = promotions.find(p => p.product_id === featuredProduct.id);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${seller.primary_color || '#2563eb'}10 0%, ${seller.secondary_color || '#3b82f6'}10 100%)`
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header avec logo */}
          <div className="p-8 text-center border-b">
            {seller.logo_url ? (
              <img 
                src={seller.logo_url} 
                alt={seller.shop_name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4"
                style={{ borderColor: seller.primary_color || '#2563eb' }}
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${seller.primary_color || '#2563eb'} 0%, ${seller.secondary_color || '#3b82f6'} 100%)` }}
              >
                {seller.shop_name?.charAt(0) || '?'}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{seller.shop_name}</h1>
            {seller.is_verified && (
              <p className="text-sm text-green-600 mt-1">✓ Vendeur vérifié</p>
            )}
          </div>

          {/* Produit mis en avant */}
          <div className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: seller.primary_color || '#2563eb' }} />
                Produit du moment
              </p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Une seule chose à l'honneur aujourd'hui.
              </h2>
              <p className="text-sm text-gray-600">
                Scannez ou cliquez pour commander.
              </p>
            </div>

            {/* Image produit */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              {featuredProduct.image_url ? (
                <img 
                  src={featuredProduct.image_url} 
                  alt={featuredProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                  📦
                </div>
              )}
              {activePromo && (
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 text-white font-bold px-4 py-2 rounded-full shadow-lg">
                    -{activePromo.discount_percentage}%
                  </div>
                </div>
              )}
            </div>

            {/* Info produit */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {featuredProduct.name}
              </h3>
              {featuredProduct.description && (
                <p className="text-gray-600 mb-3">
                  {featuredProduct.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-3">
                {activePromo && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(featuredProduct.price)} FCFA
                  </span>
                )}
                <span 
                  className="text-4xl font-bold"
                  style={{ color: seller.primary_color || '#2563eb' }}
                >
                  {activePromo 
                    ? formatPrice(featuredProduct.price * (1 - activePromo.discount_percentage / 100))
                    : formatPrice(featuredProduct.price)
                  } FCFA
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <p className="text-sm font-medium text-gray-700 mb-4">
                👇 Ou scannez ici
              </p>
              <div className="inline-block bg-white p-4 rounded-2xl shadow">
                <EnhancedQRCode
                  url={qrUrl}
                  size={200}
                  color={seller.primary_color || '#2563eb'}
                  showText={false}
                />
              </div>
            </div>

            {/* Social links */}
            {(seller.tiktok || seller.instagram) && (
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p className="mb-2">Retrouvez-nous sur :</p>
                <div className="flex items-center justify-center gap-4">
                  {seller.tiktok && (
                    <a 
                      href={`https://tiktok.com/@${seller.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      TikTok
                    </a>
                  )}
                  {seller.instagram && (
                    <a 
                      href={`https://instagram.com/${seller.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton 
        onClick={handleWhatsAppClick}
        text="💬 Commander maintenant"
      />
    </div>
  );
}