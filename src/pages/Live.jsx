import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Eye, MessageCircle, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';
import FloatingWhatsAppButton from '@/components/ui/FloatingWhatsAppButton';

export default function Live() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Fetch live session with auto-refresh
  const { data: liveSessions = [], isLoading } = useQuery({
    queryKey: ['live-session', slug],
    queryFn: () => base44.entities.LiveSession.filter({ shop_slug: slug, is_live: true }),
    refetchInterval: 3000,
    enabled: !!slug
  });

  const liveSession = liveSessions[0];

  // Fetch active product
  const { data: products = [] } = useQuery({
    queryKey: ['live-product', liveSession?.active_product_id],
    queryFn: () => base44.entities.Product.filter({ id: liveSession?.active_product_id }),
    enabled: !!liveSession?.active_product_id,
    refetchInterval: 3000
  });

  const product = products[0];

  // Fetch seller
  const { data: sellers = [] } = useQuery({
    queryKey: ['live-seller', liveSession?.seller_id],
    queryFn: () => base44.entities.Seller.filter({ id: liveSession?.seller_id }),
    enabled: !!liveSession?.seller_id
  });

  const seller = sellers[0];

  // Fetch live analytics with auto-refresh
  const { data: liveAnalytics = [] } = useQuery({
    queryKey: ['live-analytics', liveSession?.seller_id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: liveSession?.seller_id }),
    enabled: !!liveSession?.seller_id,
    refetchInterval: 5000
  });

  // Calculate live stats
  const getLiveStats = () => {
    if (!liveSession?.live_started_at) return { scans: 0, views: 0, clicks: 0 };

    const liveStartTime = new Date(liveSession.live_started_at);
    const relevantAnalytics = liveAnalytics.filter(a => 
      new Date(a.created_date) >= liveStartTime
    );

    return {
      scans: relevantAnalytics.filter(a => a.event_type === 'scan').length,
      views: relevantAnalytics.filter(a => a.event_type === 'view_product').length,
      clicks: relevantAnalytics.filter(a => a.event_type === 'whatsapp_click').length
    };
  };

  const liveStats = getLiveStats();

  // Flash offer countdown
  useEffect(() => {
    if (!liveSession?.flash_offer_active || !liveSession?.flash_offer_ends_at) {
      setTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const endsAt = new Date(liveSession.flash_offer_ends_at);
      const diff = endsAt - now;

      if (diff <= 0) {
        setTimeRemaining(null);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [liveSession?.flash_offer_active, liveSession?.flash_offer_ends_at]);

  // Track scan
  useEffect(() => {
    if (product && liveSession) {
      base44.entities.Analytics.create({
        product_id: product.id,
        seller_id: liveSession.seller_id,
        product_public_id: product.public_id,
        event_type: 'scan',
        user_agent: navigator.userAgent
      }).catch(() => {});
    }
  }, [product?.id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const calculateDiscountedPrice = () => {
    if (!liveSession?.flash_offer_active || !product) return product?.price;
    
    if (liveSession.flash_offer_type === 'percentage') {
      return product.price - (product.price * liveSession.flash_offer_value / 100);
    } else {
      return product.price - liveSession.flash_offer_value;
    }
  };

  const handleWhatsAppClick = () => {
    if (!seller || !product) return;
    
    const finalPrice = calculateDiscountedPrice();
    const message = `Bonjour, je viens de votre live TikTok et je veux le produit : ${product.name}\nPrix : ${formatPrice(finalPrice)} FCFA${
      liveSession?.flash_offer_active && timeRemaining ? ' (Offre flash)' : ''
    }`;
    const whatsappUrl = `https://wa.me/${seller.whatsapp_number}?text=${encodeURIComponent(message)}`;
    
    base44.entities.Analytics.create({
      product_id: product.id,
      seller_id: liveSession.seller_id,
      product_public_id: product.public_id,
      event_type: 'whatsapp_click',
      user_agent: navigator.userAgent
    }).catch(() => {});

    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C4AB6]" />
      </div>
    );
  }

  if (!liveSession || !product || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ce live est terminé</h2>
          <p className="text-gray-600">Revenez pour le prochain live !</p>
        </div>
      </div>
    );
  }

  const qrUrl = `${window.location.origin}/ProductPage?id=${product.public_id}`;
  const discountedPrice = calculateDiscountedPrice();
  const isFlashActive = liveSession?.flash_offer_active && timeRemaining;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6C4AB6] via-[#FF6B9D] to-red-500 p-4 flex items-center justify-center">
      {/* Top Banner - Public Counter */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-4 shadow-2xl z-50"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg md:text-xl font-black"
          >
            🔥 {liveStats.scans} personnes ont scanné ce produit — vous aussi ?
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        key={product.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mt-16"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Live Badge */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4">
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 bg-white rounded-full"
              />
              <span className="text-white font-bold text-xl">EN DIRECT</span>
              <Badge className="bg-white text-red-500">
                {seller.shop_name}
              </Badge>
            </div>
          </div>

          {/* Flash Offer Banner */}
          {isFlashActive && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-center text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <p className="text-2xl md:text-3xl font-black mb-2">
                  🔥 OFFRE FLASH ACTIVE !
                </p>
                <div className="flex items-center justify-center gap-4">
                  <p className="text-xl font-bold">
                    {liveSession.flash_offer_type === 'percentage' 
                      ? `-${liveSession.flash_offer_value}%` 
                      : `-${liveSession.flash_offer_value} FCFA`}
                  </p>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                    <Clock className="w-5 h-5" />
                    <span className="text-2xl font-mono font-black">
                      {timeRemaining}
                    </span>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-red-700/30"
              />
            </motion.div>
          )}

          {!isFlashActive && liveSession?.flash_offer_active && (
            <div className="bg-gray-200 p-4 text-center">
              <p className="font-bold text-gray-600">⏰ Offre expirée</p>
            </div>
          )}

          {/* Product Image */}
          {product.image_url && (
            <div className="relative aspect-square bg-gray-100">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Product Info */}
          <div className="p-8 text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              {product.name}
            </h1>

            <div className="space-y-2">
              {isFlashActive ? (
                <>
                  <div className="text-3xl text-gray-400 line-through">
                    {formatPrice(product.price)} FCFA
                  </div>
                  <div className="text-6xl font-black text-red-500 flex items-center justify-center gap-3">
                    <Zap className="w-12 h-12" />
                    {formatPrice(discountedPrice)} FCFA
                  </div>
                </>
              ) : (
                <div className="text-6xl font-black text-green-500">
                  {formatPrice(product.price)} FCFA
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-xl text-gray-600">
                {product.description}
              </p>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 my-6">
              <p className="text-2xl font-bold text-gray-900 mb-4">
                Scanne pour commander sur WhatsApp
              </p>
              
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(108, 74, 182, 0.3)',
                    '0 0 40px rgba(108, 74, 182, 0.6)',
                    '0 0 20px rgba(108, 74, 182, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block bg-white p-8 rounded-3xl"
              >
                <EnhancedQRCode
                  url={qrUrl}
                  size={300}
                  color="#6C4AB6"
                  showText={false}
                />
              </motion.div>

              <motion.p
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl font-bold text-[#6C4AB6] mt-4"
              >
                👆 Scan ici
              </motion.p>
            </div>

            {isFlashActive && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="bg-red-100 border-2 border-red-500 rounded-xl p-4"
              >
                <p className="text-red-700 font-bold text-lg">
                  ⚡ Plus que {timeRemaining} pour profiter de cette offre !
                </p>
              </motion.div>
            )}

            <p className="text-sm text-gray-500">
              {isFlashActive ? 'Offre valable pendant le live uniquement' : 'Disponible pendant le live'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton 
        onClick={handleWhatsAppClick}
        text="Commander maintenant"
      />
    </div>
  );
}