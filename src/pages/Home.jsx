import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, MessageCircle, Store, Zap, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    {
      icon: Store,
      title: "Vitrine unique partageable",
      description: "Une page boutique personnalisée dans votre bio TikTok"
    },
    {
      icon: QrCode,
      title: "QR codes prêts pour TikTok",
      description: "Téléchargeables en 1 clic, avec votre branding"
    },
    {
      icon: MessageCircle,
      title: "Redirection WhatsApp",
      description: "Vos clients vous contactent avec le produit pré-rempli"
    },
    {
      icon: Zap,
      title: "Backoffice simple",
      description: "Ajoutez vos produits en 30 secondes"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ed477c] rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">TikTokQR</span>
          </div>
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="outline" className="border-[#ed477c] text-[#ed477c] hover:bg-[#ed477c] hover:text-white">
              Se connecter
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transformez vos vues TikTok<br />
            <span className="text-[#ed477c]">en ventes WhatsApp</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Générez un QR code par produit — vos clients vous contactent directement, prêts à acheter.
          </p>
          <Link to={createPageUrl('ProfileSetup')}>
            <Button 
              size="lg" 
              className="bg-[#ed477c] hover:bg-[#d63d6c] text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Commencez maintenant — 5 €/mois
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="max-w-sm mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-8 border-gray-900">
              <div className="bg-gradient-to-br from-[#ed477c] to-[#c93b63] rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Robe Élégante</h3>
                <p className="text-2xl font-bold mb-4">15,000 FCFA</p>
                <Button className="w-full bg-white text-[#ed477c] hover:bg-gray-100 font-semibold">
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Commander sur WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Problem/Solution */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-300">Le problème</h2>
              <p className="text-xl text-gray-400">
                Vos clients voient vos produits sur TikTok… mais ne savent pas comment commander.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4 text-[#ed477c]">La solution</h2>
              <p className="text-xl">
                Avec TikTokQR, un scan = un message WhatsApp avec le produit et le prix.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h2 className="text-4xl font-bold text-center mb-16">Tout ce dont vous avez besoin</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 hover:shadow-xl transition-shadow border-2 hover:border-[#ed477c]">
                <div className="w-12 h-12 bg-[#ed477c] bg-opacity-10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#ed477c]" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-gradient-to-br from-[#ed477c] to-[#c93b63] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-2xl lg:text-3xl font-medium mb-6 italic">
              "Depuis que j'utilise TikTokQR, je reçois 10 à 15 commandes par jour directement sur WhatsApp !"
            </p>
            <p className="text-lg font-semibold">— Aminata, vendeuse de robes à Dakar</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Vos produits méritent d'être vendus.<br />
            <span className="text-[#ed477c]">Pas juste vus.</span>
          </h2>
          <Link to={createPageUrl('ProfileSetup')}>
            <Button 
              size="lg" 
              className="bg-[#ed477c] hover:bg-[#d63d6c] text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Créer ma boutique — 2 minutes
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="w-8 h-8 bg-[#ed477c] rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">TikTokQR</span>
            <span className="ml-2">© 2025 - Tous droits réservés</span>
          </div>
        </div>
      </footer>
    </div>
  );
}