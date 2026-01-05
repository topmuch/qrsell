import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Ticket, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function CouponRedeem() {
  const [redeemed, setRedeemed] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupon', token],
    queryFn: () => base44.entities.Coupon.filter({ qr_token: token }),
    enabled: !!token
  });

  const coupon = coupons[0];

  const { data: sellers = [] } = useQuery({
    queryKey: ['seller', coupon?.seller_id],
    queryFn: () => base44.entities.Seller.filter({ id: coupon?.seller_id }),
    enabled: !!coupon?.seller_id
  });

  const seller = sellers[0];

  const redeemMutation = useMutation({
    mutationFn: (couponId) => base44.entities.Coupon.update(couponId, { is_used: true })
  });

  useEffect(() => {
    if (coupon && !coupon.is_used && !redeemed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [coupon]);

  const handleRedeem = () => {
    if (!coupon || !seller) return;

    redeemMutation.mutate(coupon.id);
    setRedeemed(true);

    const message = `🎟️ Coupon activé !\n\nUtilisez le code *${coupon.code}* dans votre prochaine commande pour bénéficier de -${coupon.discount_amount} FCFA.\n\nValable jusqu'au ${new Date(coupon.valid_until).toLocaleDateString('fr-FR')}`;
    
    const whatsappUrl = `https://wa.me/${seller.whatsapp_number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!coupon || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coupon introuvable</h2>
          <p className="text-gray-600">Ce coupon n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  const isExpired = new Date(coupon.valid_until) < new Date();

  if (coupon.is_used) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coupon déjà utilisé</h2>
          <p className="text-gray-600 mb-6">
            Ce coupon a déjà été utilisé et ne peut être activé qu'une seule fois.
          </p>
          <Button onClick={() => window.location.href = `/Shop?slug=${seller.shop_slug}`}>
            Voir la boutique
          </Button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coupon expiré</h2>
          <p className="text-gray-600 mb-6">
            Ce coupon était valable jusqu'au {new Date(coupon.valid_until).toLocaleDateString('fr-FR')}.
          </p>
          <Button onClick={() => window.location.href = `/Shop?slug=${seller.shop_slug}`}>
            Voir la boutique
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white text-center">
            <Ticket className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Félicitations ! 🎉</h1>
            <p className="text-purple-100">Vous avez un coupon de réduction</p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <Badge className="bg-purple-500 text-white text-2xl px-6 py-3 mb-4">
                {coupon.code}
              </Badge>
              <p className="text-5xl font-bold text-purple-600 mb-2">
                -{coupon.discount_amount} FCFA
              </p>
              {coupon.description && (
                <p className="text-gray-600">{coupon.description}</p>
              )}
            </div>

            <div className="bg-purple-50 p-6 rounded-2xl mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Comment utiliser ce coupon ?</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">1.</span>
                  <span>Cliquez sur le bouton ci-dessous pour activer votre coupon</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">2.</span>
                  <span>Vous recevrez un message WhatsApp avec le code {coupon.code}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">3.</span>
                  <span>Utilisez ce code lors de votre prochaine commande</span>
                </li>
              </ol>
            </div>

            <Button 
              onClick={handleRedeem}
              disabled={redeemMutation.isPending || redeemed}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white text-lg py-6 rounded-xl shadow-lg"
            >
              {redeemMutation.isPending ? (
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              ) : redeemed ? (
                <CheckCircle className="w-6 h-6 mr-3" />
              ) : (
                <MessageCircle className="w-6 h-6 mr-3" />
              )}
              {redeemed ? 'Coupon activé !' : 'Activer mon coupon'}
            </Button>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Vendeur : {seller.shop_name}</p>
              <p>Valable jusqu'au {new Date(coupon.valid_until).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-purple-100 border-2 border-purple-300 rounded-xl p-4">
          <p className="text-sm text-purple-800 text-center">
            🎟️ Ce coupon est utilisable une seule fois et expire dans 7 jours.
          </p>
        </div>
      </motion.div>
    </div>
  );
}