import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { motion } from 'framer-motion';

export default function InteractiveHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-pink-400/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-pink-200 text-gray-800 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-[#ed477c]" />
            Rejoignez 500+ vendeurs qui transforment leurs vues en ventes
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8"
          >
            Transformez vos vues TikTok en ventes —{' '}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ed477c] via-[#ff6b9d] to-purple-500">
                en un scan
              </span>
              <motion.div
                className="absolute -right-8 -top-4"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <QrCode className="w-12 h-12 text-[#ed477c]" />
              </motion.div>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto"
          >
            Vos clients scannent votre QR code TikTok → voient le produit → vous contactent sur WhatsApp. 
            <span className="font-bold text-[#ed477c]"> Sans site web, sans friction.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to={createPageUrl('DevenirVendeur')}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white px-10 py-7 text-xl font-bold rounded-full shadow-2xl shadow-pink-300 w-full sm:w-auto"
              >
                🚀 Créer ma boutique
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <Link to={createPageUrl('Demo')}>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 hover:border-[#ed477c] hover:bg-[#ed477c]/5 hover:text-[#ed477c] px-10 py-7 text-xl font-semibold rounded-full bg-white/80 backdrop-blur-sm w-full sm:w-auto"
              >
                Voir la démo interactive
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span className="font-medium">Configuration en 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span className="font-medium">Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span className="font-medium">5 000 FCFA/mois</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}