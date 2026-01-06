import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';
import FloatingWhatsAppButton from '@/components/ui/FloatingWhatsAppButton';

export default function Live() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  // Fetch live session with auto-refresh
  const { data: liveSessions = [], isLoading } = useQuery({
    queryKey: ['live-session', slug],
    queryFn: () => base44.entities.LiveSession.filter({ shop_slug: slug, is_live: true }),
    refetchInterval: 3000, // Refresh every 3 seconds
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

  const handleWhatsAppClick = () => {
    if (!seller || !product) return;
    
    const message = `Bonjour, je viens de votre live TikTok et je veux le produit : ${product.name}\nPrix : ${formatPrice(product.price)} FCFA`;
    const whatsappUrl = `https://wa.me/${seller.whatsapp_number}?text=${encodeURIComponent(message)}`;
    
    // Track click
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun live actif</h2>
          <p className="text-gray-600">Cette boutique n'est pas en live pour le moment.</p>
        </div>
      </div>
    );
  }

  const qrUrl = `${window.location.origin}/ProductPage?id=${product.public_id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 flex items-center justify-center">
      <motion.div
        key={product.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
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

            <div className="text-6xl font-black text-green-500">
              {formatPrice(product.price)} FCFA
            </div>

            {product.description && (
              <p className="text-xl text-gray-600">
                {product.description}
              </p>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 my-6">
              <p className="text-2xl font-bold text-gray-900 mb-4">
                Scanne pour commander sur WhatsApp
              </p>
              
              {/* QR Code with Glow */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.3)',
                    '0 0 40px rgba(59, 130, 246, 0.6)',
                    '0 0 20px rgba(59, 130, 246, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block bg-white p-8 rounded-3xl"
              >
                <EnhancedQRCode
                  url={qrUrl}
                  size={300}
                  color="#2563eb"
                  showText={false}
                />
              </motion.div>

              <motion.p
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl font-bold text-purple-600 mt-4"
              >
                👆 Scan ici
              </motion.p>
            </div>

            <p className="text-sm text-gray-500">
              Offre disponible pendant le live uniquement
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