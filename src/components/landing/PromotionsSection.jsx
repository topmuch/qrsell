import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Zap, Clock, Ticket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

export default function PromotionsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative max-w-sm mx-auto">
              {/* Main QR Code with badge */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, -2, 2, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative bg-white rounded-3xl p-8 shadow-2xl border-4 border-orange-500"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg viewBox="0 0 100 100" className="w-48 h-48">
                    <rect fill="#ea580c" x="10" y="10" width="20" height="20"/>
                    <rect fill="#ea580c" x="70" y="10" width="20" height="20"/>
                    <rect fill="#ea580c" x="10" y="70" width="20" height="20"/>
                    <rect fill="#ea580c" x="40" y="40" width="20" height="20"/>
                    <circle fill="#ea580c" cx="50" cy="50" r="8"/>
                  </svg>
                </div>
                
                {/* Discount Badge */}
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full w-24 h-24 flex items-center justify-center shadow-2xl border-4 border-white"
                >
                  <div className="text-center">
                    <p className="text-3xl font-bold">-10%</p>
                    <p className="text-xs">PROMO</p>
                  </div>
                </motion.div>

                {/* Timer Badge */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-bold text-sm">30 min restantes</span>
                </motion.div>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute top-10 -right-8 bg-white rounded-xl p-3 shadow-lg"
              >
                <Zap className="w-8 h-8 text-orange-500" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-20 -left-8 bg-white rounded-xl p-3 shadow-lg"
              >
                <Ticket className="w-8 h-8 text-purple-500" />
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Promotions & Fidélité
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Créez des offres exclusives via QR Code —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                valables seulement 30 minutes !
              </span>
            </h2>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Offres limitées, coupons numériques, récompenses fidélité — tout est géré via QR Code. 
              <span className="font-bold text-orange-600"> Scannez, activez, vendez.</span>
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100 mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Promotions Flash
              </h3>
              <p className="text-gray-600 mb-3">
                Réductions de -5% à -50% valables 30 minutes après scan du QR code. Créez l'urgence et boostez vos ventes.
              </p>
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>Compte à rebours automatique</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-500" />
                Coupons Numériques
              </h3>
              <p className="text-gray-600 mb-3">
                Codes promo uniques valables 7 jours. Récompensez vos clients fidèles et attirez-en de nouveaux.
              </p>
              <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                <span className="font-mono bg-purple-50 px-2 py-1 rounded">PROMO123</span>
                <span>— 5 000 FCFA de réduction</span>
              </div>
            </div>

            <Link to={createPageUrl('Dashboard')}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white px-8 py-6 text-lg font-bold rounded-full shadow-xl"
              >
                Découvrir les promotions
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}