import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Logo from '@/components/ui/Logo';
import { MessageCircle, QrCode, ArrowRight, Sparkles, Smartphone, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';
import ScanSimulator from '@/components/demo/ScanSimulator';

const demoProducts = [
{
  id: 'DEMO-001',
  name: 'Robe Wax Élégante',
  price: 25000,
  image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
  description: 'Robe africaine moderne en tissu wax authentique'
},
{
  id: 'DEMO-002',
  name: 'Sac en Cuir Artisanal',
  price: 18000,
  image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=400&fit=crop',
  description: 'Sac à main fait main, cuir véritable'
},
{
  id: 'DEMO-003',
  name: 'Montre Classique',
  price: 12000,
  image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  description: 'Montre élégante pour toutes occasions'
}];


const demoWhatsApp = '+221771234567';

export default function Demo() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const handleQRClick = (product) => {
    setSelectedProduct(product);
    setShowSimulator(true);
  };

  const getProductUrl = (product) => {
    return `${window.location.origin}/ProductPage?id=${product.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      {/* Hero demo */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-white relative overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto text-center space-y-8">

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] text-white border-0 px-6 py-2 text-base shadow-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Démo interactive — Essayez maintenant !
              </Badge>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#222222] leading-tight">
              Voyez votre boutique<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ed477c] to-[#ff6b9d]">
                en 3 secondes
              </span>
            </h1>

            <p className="text-2xl md:text-3xl font-medium text-gray-700">
              Scannez • Commandez • Vendez
            </p>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Cliquez sur les <span className="font-bold text-[#ed477c]">QR codes roses</span> ci-dessous pour vivre l'expérience complète de vos clients — du scan jusqu'à la commande WhatsApp.
            </p>

            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border-2 border-[#ed477c]/20 rounded-full px-8 py-4 shadow-xl">
              <div className="w-3 h-3 bg-[#ed477c] rounded-full animate-pulse" />
              <span className="text-base font-semibold text-gray-800">
                Démo 100% interactive — Aucun message réel envoyé
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vitrine démo */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Shop header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-pink-100 mb-12 max-w-6xl mx-auto">

            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ed477c] to-[#ff6b9d] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                M
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#222222]">Mode Dakar</h2>
                <p className="text-gray-600 text-lg">Boutique de démonstration • {demoProducts.length} produits</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              ✨ Voici ce que vos clients voient quand ils cliquent sur votre lien TikTok ou scannent votre QR code.
            </p>
          </motion.div>

          {/* Products grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {demoProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.15 }}
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 hover:border-[#ed477c]/30">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* QR Code Badge */}
                    <motion.div
                      className="absolute top-4 right-4 cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQRClick(product)}
                    >
                      <div className="bg-white rounded-xl p-2 shadow-2xl border-4 border-[#ed477c] hover:border-[#ff6b9d] transition-colors">
                        <div className="w-16 h-16">
                          <EnhancedQRCode
                            url={getProductUrl(product)}
                            size={64}
                            color="#ed477c"
                            showText={false}
                          />
                        </div>
                      </div>
                    </motion.div>

                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] text-white border-0 shadow-lg">
                        Démo
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <Badge variant="outline" className="mb-3 text-xs font-mono border-pink-200">
                      {product.id}
                    </Badge>
                    
                    <h3 className="font-bold text-xl text-[#222222] mb-2 group-hover:text-[#ed477c] transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-3xl font-bold text-[#ed477c] mb-3">
                      {formatPrice(product.price)} FCFA
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-5 line-clamp-2">
                      {product.description}
                    </p>

                    {/* QR Scan Button */}
                    <Button
                      onClick={() => handleQRClick(product)}
                      className="w-full bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white h-12 rounded-xl font-bold shadow-lg mb-3"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Scannez-moi !
                    </Button>

                    <p className="text-center text-xs text-gray-500 italic">
                      👆 Cliquez pour voir le parcours client complet
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* QR Code TikTok section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20 max-w-5xl mx-auto">

            <Card className="p-12 bg-gradient-to-br from-white to-pink-50 border-2 border-pink-200 shadow-2xl overflow-hidden relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ed477c]/10 to-transparent rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  {/* Left: Phone illustration */}
                  <div className="flex-1 relative">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="relative"
                    >
                      {/* Phone mockup */}
                      <div className="relative mx-auto w-64 h-[500px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                          {/* QR Code floating */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                              transition={{ duration: 4, repeat: Infinity }}
                              className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-[#ed477c]"
                            >
                              <div className="w-48 h-48">
                                <EnhancedQRCode
                                  url="https://qrsell.app/demo"
                                  size={192}
                                  color="#ed477c"
                                  showText={false}
                                />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Arrow pointing to QR */}
                      <motion.div
                        animate={{ x: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -right-16 top-1/2 -translate-y-1/2"
                      >
                        <div className="bg-[#ed477c] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg whitespace-nowrap">
                          Votre lien TikTok ➜
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 text-left">
                    <div className="inline-block p-3 bg-[#ed477c]/10 rounded-2xl mb-6">
                      <Smartphone className="w-12 h-12 text-[#ed477c]" />
                    </div>

                    <h3 className="text-4xl font-bold text-[#222222] mb-4">
                      Votre QR code TikTok
                    </h3>
                    
                    <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                      <span className="font-bold text-[#ed477c]">Un seul scan</span> et vos clients accèdent à toute votre boutique.
                    </p>

                    <ul className="space-y-4 mb-8">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#ed477c] flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">
                          <span className="font-bold">Format PNG haute qualité</span> — parfait pour vos vidéos TikTok et lives
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#ed477c] flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">
                          <span className="font-bold">Personnalisé à votre marque</span> — avec votre logo et couleurs
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#ed477c] flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">
                          <span className="font-bold">Téléchargeable en 1 clic</span> depuis votre dashboard
                        </span>
                      </li>
                    </ul>

                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white font-bold px-8 h-14 rounded-xl shadow-xl"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Télécharger en PNG
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features showcase */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-bold text-[#222222] mb-2">Scan & Commander</h4>
              <p className="text-sm text-gray-600">
                Client scanne → voit le produit → commande sur WhatsApp
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-bold text-[#222222] mb-2">Design professionnel</h4>
              <p className="text-sm text-gray-600">
                Vitrine élégante, mobile-first, rapide
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-bold text-[#222222] mb-2">Analytics inclus</h4>
              <p className="text-sm text-gray-600">
                Suivez vos scans, vues et conversions
              </p>
            </Card>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-24 mx-auto max-w-5xl"
          >
            <div className="bg-gradient-to-br from-[#ed477c] via-[#ff6b9d] to-[#ed477c] p-16 text-center rounded-[3rem] shadow-2xl relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-6"
                >
                  <span className="text-6xl">🚀</span>
                </motion.div>

                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Créez votre boutique en 2 minutes
                </h3>
                
                <p className="text-2xl text-white/95 font-medium mb-10">
                  Sans carte bancaire • Sans engagement
                </p>

                <Link to={createPageUrl('DevenirVendeur')}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="bg-white text-[#ed477c] hover:bg-gray-50 px-12 h-20 text-2xl font-bold rounded-full shadow-2xl"
                    >
                      🚀 Créer ma boutique — 5 000 FCFA/mois
                      <ArrowRight className="ml-3 w-7 h-7" />
                    </Button>
                  </motion.div>
                </Link>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/95 text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✓</span>
                    <span className="font-medium">Configuration en 2 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✓</span>
                    <span className="font-medium">Annulation libre</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✓</span>
                    <span className="font-medium">Support inclus</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-24 py-12">
        <div className="container mx-auto px-4 text-center">
          <Logo size="md" />
          <p className="text-gray-600 text-base mt-6 font-medium">
            Transformez vos vues TikTok en ventes réelles
          </p>
          <p className="text-gray-400 text-sm mt-4">
            © {new Date().getFullYear()} QRSell. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Scan Simulator Modal */}
      <ScanSimulator
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        product={selectedProduct}
      />
    </div>
  );
}