import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Logo from '@/components/ui/Logo';
import { MessageCircle, QrCode, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

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
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getWhatsAppLink = (product) => {
    const message = encodeURIComponent(
      `Bonjour ! Je souhaite acheter:\n\n` +
      `📦 *${product.name}*\n` +
      `💰 Prix: ${formatPrice(product.price)} FCFA\n\n` +
      `Réf: ${product.id}`
    );
    return `https://wa.me/${demoWhatsApp.replace(/[^0-9]/g, '')}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">

        </div>
      </header>

      {/* Hero demo */}
      <section className="py-16 bg-gradient-to-br from-[#ed477c]/5 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-6">

            <Badge className="bg-[#ed477c]/10 text-[#ed477c] border-[#ed477c]/20 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Démo interactive
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#222222]">Découvrez QR sell en action


            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Voici une vitrine de démonstration. Cliquez sur "Commander" pour voir comment vos clients vous contactent directement sur WhatsApp.
            </p>

            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-700">
                C'est une simulation — aucun message réel ne sera envoyé
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vitrine démo */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Shop header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-sm border mb-8 max-w-5xl mx-auto">

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ed477c] to-[#ff6b9d] flex items-center justify-center text-white text-2xl font-bold">
                M
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#222222]">Mode Dakar</h2>
                <p className="text-gray-500">Boutique de démonstration • {demoProducts.length} produits</p>
              </div>
            </div>
            <p className="text-gray-600">
              Voici ce que vos clients voient quand ils cliquent sur votre lien TikTok ou scannent votre QR code.
            </p>
          </motion.div>

          {/* Products grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {demoProducts.map((product, index) =>
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}>

                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-[#ed477c] border-white/50">
                        Démo
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {product.id}
                    </Badge>
                    
                    <h3 className="font-bold text-lg text-[#222222] mb-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-2xl font-bold text-[#ed477c] mb-2">
                      {formatPrice(product.price)} FCFA
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <a
                    href={getWhatsAppLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block">

                      <Button className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Commander sur WhatsApp
                      </Button>
                    </a>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* QR Code section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 max-w-3xl mx-auto">

            <Card className="p-8 text-center">
              <QrCode className="w-16 h-16 text-[#ed477c] mx-auto mb-4" />
              
              <h3 className="text-2xl font-bold text-[#222222] mb-3">
                Et voici le QR code TikTok
              </h3>
              
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                Vos clients scannent ce code → atterrissent sur une page comme celle-ci → cliquent "Commander" → vous contactent sur WhatsApp.
              </p>

              <div className="inline-flex items-center justify-center p-6 bg-white border-2 border-[#ed477c] rounded-2xl shadow-lg">
                <div className="w-48 h-48 bg-gray-50 rounded-xl flex flex-col items-center justify-center">
                  <QrCode className="w-32 h-32 text-[#ed477c] mb-2" />
                  <span className="text-sm text-gray-500">QR Code simulé</span>
                </div>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Dans la vraie version, ce QR code est téléchargeable en PNG, optimisé pour vos vidéos et lives TikTok.
              </p>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }} className="bg-gray-700 mt-16 mx-auto p-12 text-center rounded-3xl from-[#ed477c] to-[#ff6b9d] max-w-4xl">


            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à transformer vos vues en ventes ?
            </h3>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Créez votre boutique en 2 minutes. Sans carte bancaire, sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Dashboard')}>
                <Button
                  size="lg" className="bg-white text-[#ed4a7e] px-8 py-6 text-lg font-bold rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 hover:bg-gray-50 shadow-xl">


                  Créer ma boutique — 5000 CFA/mois
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-white/70 text-sm">
              ✓ Configuration en 2 minutes  •  ✓ Annulation libre  •  ✓ Support inclus
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <Logo size="sm" />
          <p className="text-gray-500 text-sm mt-4">
            © 2025 Verdiq TikQR. Transformez vos vues en ventes.
          </p>
        </div>
      </footer>
    </div>);

}