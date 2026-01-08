import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Sparkles, 
  TrendingUp, 
  MessageCircle, 
  Eye, 
  Zap, 
  CheckCircle2, 
  X,
  ArrowRight,
  QrCode,
  ShoppingBag,
  Clock,
  Gift,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TestimonialSection from '@/components/landing/TestimonialSection';
import MiniShop from '@/components/landing/MiniShop';
import Footer from '@/components/landing/Footer';
import FloatingWhatsAppButton from '@/components/ui/FloatingWhatsAppButton';
import { createPageUrl } from '@/utils/index';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import BannerDisplay from '@/components/dashboard/BannerDisplay';

export default function Home() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);

  // Fetch site settings for WhatsApp support number
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const settings = await base44.entities.SiteSettings.list();
      return settings[0] || null;
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signup_success') === 'true') {
      setShowSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch real products from "Mode Dakar" or first active seller
  const { data: sellers = [] } = useQuery({
    queryKey: ['home-sellers'],
    queryFn: async () => {
      const allSellers = await base44.entities.Seller.list();
      return allSellers.filter(s => s.shop_name);
    }
  });

  const demoPetShop = sellers.find(s => s.shop_name?.toLowerCase().includes('mode')) || sellers[0];

  const { data: demoProducts = [] } = useQuery({
    queryKey: ['home-demo-products', demoPetShop?.id],
    queryFn: async () => {
      const allProducts = await base44.entities.Product.filter({ seller_id: demoPetShop?.id, is_active: true });
      // Mélanger les produits de manière aléatoire
      const shuffled = [...allProducts];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, 3);
    },
    enabled: !!demoPetShop?.id,
    staleTime: 0,
    cacheTime: 0
  });

  // Demo products with real data or fallback
  const products = demoProducts.length > 0 ? demoProducts : [
    {
      id: '1',
      name: 'Robe Wax Élégante',
      price: 25000,
      description: 'Robe traditionnelle en tissu wax de qualité supérieure',
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      badge: '-10%'
    },
    {
      id: '2',
      name: 'Sac en Cuir Artisanal',
      price: 18000,
      description: 'Sac fait main par des artisans locaux',
      image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
      badge: 'Nouveauté'
    },
    {
      id: '3',
      name: 'Montre Classique',
      price: 32000,
      description: 'Montre élégante pour toutes occasions',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      badge: 'Promo'
    }
  ];

  const handleProductScan = (product) => {
    setSelectedProduct(product);
    setShowScanModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#FAF9FC' }}>
      {/* Success Banner */}
      {showSuccess && (
        <div className="fixed top-20 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 max-w-2xl mx-auto">
          <div className="bg-green-50 border-2 border-green-400 text-green-800 px-4 sm:px-6 py-4 rounded-xl shadow-xl flex items-start gap-3 animate-in slide-in-from-top">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-base sm:text-lg">Demande envoyée avec succès !</p>
              <p className="text-xs sm:text-sm mt-1">Notre équipe validera votre demande sous 24h. Vous recevrez un email de confirmation.</p>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-block bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] text-white px-4 sm:px-6 py-2 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm font-semibold">
              🚀 La révolution e-commerce pour l'Afrique
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight px-2">
              Votre boutique en ligne avec
              <span className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] bg-clip-text text-transparent"> QR codes intelligents</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-10 max-w-3xl mx-auto px-4">
              Pour vendeurs TikTok ou artisans : créez votre vitrine en ligne. Vos clients scannent et commandent sur WhatsApp.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4 px-4">
              <Button 
                onClick={() => window.location.href = createPageUrl('DevenirVendeur')}
                className="w-full bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] hover:opacity-90 text-white text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-full shadow-2xl transform hover:scale-105 transition-all"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Créer ma boutique — 5 000 FCFA/mois
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = createPageUrl('Demo')}
                className="w-full border-2 border-[#6C4AB6] text-[#6C4AB6] hover:bg-[#6C4AB6] hover:text-white text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 rounded-full"
              >
                Voir la démo
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 px-4">
              ✓ Configuration en 2 min • ✓ Annulation libre • ✓ Support inclus
            </p>
          </motion.div>
        </div>
      </section>

      {/* Banners */}
      <BannerDisplay position="homepage" />

      {/* Interactive Scan Simulator */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-xl my-6 sm:my-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 px-2">
              <span className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] bg-clip-text text-transparent">
                Essayez maintenant
              </span>
              <br />
              Scannez un QR Code 👇
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
              Cliquez sur un QR code ci-dessous pour voir la magie en action
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-200 hover:border-[#6C4AB6] transition-all hover:shadow-2xl cursor-pointer group"
                onClick={() => handleProductScan(product)}
              >
                <div className="relative mb-3 sm:mb-4">
                  {product.image_url && (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-40 sm:h-48 object-cover rounded-lg sm:rounded-xl"
                    />
                  )}
                  {product.badge && (
                    <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 ${
                      product.badge === '-10%' ? 'bg-red-500' : 
                      product.badge === 'Nouveauté' ? 'bg-[#FF6B9D]' : 
                      'bg-[#6C4AB6]'
                    } text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg`}>
                      {product.badge}
                    </div>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
                <p className="text-xl sm:text-2xl font-black text-[#6C4AB6] mb-3 sm:mb-4">
                  {formatPrice(product.price)} FCFA
                </p>
                <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-dashed border-[#6C4AB6] group-hover:border-[#FF6B9D] transition-all">
                  <QrCode className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-[#6C4AB6] group-hover:text-[#FF6B9D] transition-colors" />
                  <p className="text-center text-xs sm:text-sm font-semibold text-[#6C4AB6] group-hover:text-[#FF6B9D] mt-2">
                    Scannez-moi !
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions & Fidélité Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-[#FF6B9D] to-[#6C4AB6] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white shadow-2xl">
            <div className="flex flex-col gap-8 sm:gap-12">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold text-sm sm:text-base">Promotions Flash</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6">
                  Créez des offres exclusives via QR Code
                </h2>
                <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 text-white/90">
                  Offres limitées, coupons numériques, récompenses fidélité — tout est géré via QR Code.
                </p>
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <li className="flex items-center gap-2 sm:gap-3">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg">Valables seulement 30 minutes</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg">Coupons de fidélité automatiques</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg">+50% de conversions en moyenne</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = createPageUrl('DevenirVendeur')}
                  className="w-full sm:w-auto bg-white text-[#6C4AB6] hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full font-bold shadow-xl"
                >
                  Découvrir les promotions
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </div>
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-white/20 max-w-xs mx-auto">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
                    <div className="text-center">
                      <div className="inline-block bg-red-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-base sm:text-lg mb-3 sm:mb-4">
                        -10% Flash
                      </div>
                      <QrCode className="w-24 h-24 sm:w-32 sm:h-32 mx-auto text-[#6C4AB6]" />
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-3 sm:mt-4">
                        Scannez avant expiration !
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-red-500 font-bold text-sm sm:text-base">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>28:45</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics en temps réel */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-xl my-6 sm:my-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 px-2">
              <span className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] bg-clip-text text-transparent">
                Analytics en temps réel
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
              Suivez chaque scan, chaque vue, chaque commande — en direct
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
            {[
              { label: 'Scans QR', value: '47', icon: Eye, color: '#6C4AB6' },
              { label: 'Vues produits', value: '124', icon: ShoppingBag, color: '#FF6B9D' },
              { label: 'Clics WhatsApp', value: '38', icon: MessageCircle, color: '#10B981' },
              { label: 'Taux de conversion', value: '30.6%', icon: TrendingUp, color: '#6C4AB6' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 hover:shadow-xl transition-all"
                style={{ borderColor: stat.color }}
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" style={{ color: stat.color }} />
                <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-gray-200 overflow-x-auto">
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-4 sm:mb-6 text-gray-900">Performance cette semaine</h3>
            <div className="flex items-end justify-between gap-1 sm:gap-2 h-32 sm:h-40 md:h-48 min-w-[300px]">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, idx) => {
                const heights = [60, 80, 70, 90, 85, 95, 75];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center min-w-0">
                    <div 
                      className="w-full rounded-t-lg sm:rounded-t-xl transition-all hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${heights[idx]}%`,
                        background: `linear-gradient(to top, #6C4AB6, #FF6B9D)`
                      }}
                    />
                    <p className="text-xs sm:text-sm font-semibold mt-1 sm:mt-2 text-gray-600">{day}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white shadow-2xl text-center"
          >
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6 px-2">
              Créez votre boutique en 2 minutes
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-2 text-white/90">
              Sans carte bancaire, sans engagement
            </p>
            <p className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">
              Seulement 5 000 FCFA/mois
            </p>
            <Button 
              onClick={() => window.location.href = createPageUrl('DevenirVendeur')}
              className="w-full bg-white text-[#6C4AB6] hover:bg-gray-100 text-base sm:text-lg md:text-xl px-8 sm:px-12 py-6 sm:py-8 rounded-full font-black shadow-2xl transform hover:scale-105 transition-all"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Créer ma boutique maintenant
            </Button>
            <p className="text-xs sm:text-sm mt-4 sm:mt-6 text-white/80 px-4">
              ✓ Configuration en 2 min • ✓ Annulation libre • ✓ Support inclus
            </p>
          </motion.div>
        </div>
      </section>

      <TestimonialSection />
      <MiniShop />
      <Footer />

      {/* WhatsApp Floating Button */}
      {siteSettings?.whatsapp_support && (
        <FloatingWhatsAppButton 
          phoneNumber={siteSettings.whatsapp_support}
          message="Bonjour, je viens de QRSell et j'ai une question."
        />
      )}

      {/* Scan Modal */}
      <Dialog open={showScanModal} onOpenChange={setShowScanModal}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Scan réussi ! 😊
            </h3>
            {selectedProduct && (
              <div className="text-left bg-gray-50 rounded-2xl p-6 mb-6">
                <p className="text-gray-700 mb-4">
                  Merci d'avoir scanné le QR Code pour le produit <span className="font-bold">{selectedProduct.name}</span> !
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-semibold">Nom du produit :</span> {selectedProduct.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Prix :</span> {formatPrice(selectedProduct.price)} FCFA
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Description :</span> {selectedProduct.description}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Si vous souhaitez procéder à l'achat, il vous suffit de répondre avec "Oui, je veux l'acheter" ou poser toutes vos questions ! Je suis là pour vous aider à finaliser votre commande.
                </p>
              </div>
            )}
            <Button 
              onClick={() => setShowScanModal(false)}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-6 rounded-full text-lg font-bold"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Commander sur WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}