import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Zap, MessageCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PromotionProduct() {
  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // Get promotion
  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['promotion', token],
    queryFn: () => base44.entities.Promotion.filter({ qr_token: token, is_active: true }),
    enabled: !!token,
    refetchInterval: false
  });

  const promotion = promotions[0];

  // Get or create scan session
  const { data: scanSessions = [] } = useQuery({
    queryKey: ['promotion-scan', token],
    queryFn: () => base44.entities.PromotionScan.filter({ qr_token: token }),
    enabled: !!promotion,
    refetchInterval: 5000
  });

  const createScanMutation = useMutation({
    mutationFn: (data) => base44.entities.PromotionScan.create(data)
  });

  // Get product and seller
  const { data: products = [] } = useQuery({
    queryKey: ['product', promotion?.product_id],
    queryFn: () => base44.entities.Product.filter({ id: promotion?.product_id }),
    enabled: !!promotion?.product_id
  });

  const product = products[0];

  const { data: sellers = [] } = useQuery({
    queryKey: ['seller', promotion?.seller_id],
    queryFn: () => base44.entities.Seller.filter({ id: promotion?.seller_id }),
    enabled: !!promotion?.seller_id
  });

  const seller = sellers[0];

  // Initialize or get session
  useEffect(() => {
    if (!promotion) return;

    const existingSession = scanSessions.find(s => !s.is_expired);
    
    if (existingSession) {
      setSessionId(existingSession.session_id);
    } else {
      const newSessionId = Math.random().toString(36).substring(2, 15);
      setSessionId(newSessionId);
      createScanMutation.mutate({
        promotion_id: promotion.id,
        qr_token: token,
        scan_timestamp: new Date().toISOString(),
        session_id: newSessionId
      });
    }
  }, [promotion, scanSessions]);

  // Countdown timer
  useEffect(() => {
    if (!sessionId || scanSessions.length === 0) return;

    const session = scanSessions.find(s => s.session_id === sessionId);
    if (!session) return;

    const scanTime = new Date(session.scan_timestamp);
    const expiryTime = new Date(scanTime.getTime() + 30 * 60 * 1000); // 30 minutes

    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft({ minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, scanSessions]);

  const discountedPrice = product ? 
    Math.round(product.price * (1 - promotion.discount_percentage / 100)) : 0;

  const handleWhatsAppClick = () => {
    if (!seller || !product) return;
    
    const message = `Bonjour ! Je suis intéressé par votre promotion flash ⚡\n${product.name}\nPrix promo : ${discountedPrice} FCFA (au lieu de ${product.price} FCFA)\n\nOffrevalable encore : ${timeLeft?.minutes || 0}:${String(timeLeft?.seconds || 0).padStart(2, '0')}`;
    
    const whatsappUrl = `https://wa.me/${seller.whatsapp_number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!promotion || !product || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Promotion introuvable</h2>
          <p className="text-gray-600">Cette promotion n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  if (timeLeft === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
        <div className="text-center max-w-md">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offre expirée</h2>
          <p className="text-gray-600 mb-6">
            Cette promotion flash était valable 30 minutes et a maintenant expiré.
          </p>
          <Button onClick={() => window.location.href = `/Shop?slug=${seller.shop_slug}`}>
            Voir tous les produits
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Timer Banner */}
        {timeLeft && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl mb-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8" />
                <div>
                  <p className="text-sm font-medium opacity-90">Offre valable encore</p>
                  <p className="text-4xl font-bold tracking-tight">
                    {timeLeft.minutes}:{String(timeLeft.seconds).padStart(2, '0')}
                  </p>
                </div>
              </div>
              <Badge className="bg-white text-orange-600 text-lg px-4 py-2">
                -{promotion.discount_percentage}%
              </Badge>
            </div>
          </div>
        )}

        {/* Product Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {product.image_url && (
            <div className="relative h-80">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-orange-500 text-white text-lg px-4 py-2">
                  PROMO FLASH ⚡
                </Badge>
              </div>
            </div>
          )}

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-600 mb-6">{product.description}</p>
            )}

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prix original</p>
                  <p className="text-2xl text-gray-400 line-through">
                    {product.price.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Prix promo</p>
                  <p className="text-4xl font-bold text-orange-600">
                    {discountedPrice.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-orange-200">
                <p className="text-lg font-bold text-green-600">
                  Vous économisez {(product.price - discountedPrice).toLocaleString()} FCFA !
                </p>
              </div>
            </div>

            <Button 
              onClick={handleWhatsAppClick}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white text-lg py-6 rounded-xl shadow-lg"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Commander sur WhatsApp
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Vendeur : <span className="font-semibold">{seller.shop_name}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-orange-100 border-2 border-orange-300 rounded-xl p-4">
          <p className="text-sm text-orange-800 text-center">
            ⚠️ Cette offre n'est accessible que via ce QR code et expire automatiquement après 30 minutes.
          </p>
        </div>
      </motion.div>
    </div>
  );
}