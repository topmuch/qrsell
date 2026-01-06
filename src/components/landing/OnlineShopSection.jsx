import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Store, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

export default function OnlineShopSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Store className="w-4 h-4" />
              Boutique sans site web
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Votre vitrine digitale,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                en un scan
              </span>
            </h2>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Chaque vendeur obtient une page boutique unique avec tous ses produits. 
              Partageable sur <span className="font-bold text-purple-600">TikTok</span>, 
              <span className="font-bold text-pink-600"> Instagram</span>, 
              <span className="font-bold text-blue-600"> Facebook</span> — 
              partout où sont vos clients.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg text-gray-700">
                  <span className="font-bold">URL unique</span> — facile à partager (qrsell.app/votre-boutique)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg text-gray-700">
                  <span className="font-bold">Design professionnel</span> — personnalisable avec vos couleurs et logo
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg text-gray-700">
                  <span className="font-bold">Mobile-first</span> — optimisé pour smartphones, tablettes, desktop
                </span>
              </li>
            </ul>

            <Link to={createPageUrl('AllShops')}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-8 py-6 text-lg font-bold rounded-full shadow-xl"
              >
                Voir des exemples de boutiques
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative mx-auto max-w-sm">
              {/* Floating QR Code */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -left-8 top-20 z-10 bg-white rounded-2xl p-4 shadow-2xl border-4 border-purple-500"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-20 h-20">
                    <rect fill="#9333ea" x="10" y="10" width="20" height="20"/>
                    <rect fill="#9333ea" x="70" y="10" width="20" height="20"/>
                    <rect fill="#9333ea" x="10" y="70" width="20" height="20"/>
                    <rect fill="#9333ea" x="40" y="40" width="20" height="20"/>
                  </svg>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                >
                  Scan !
                </motion.div>
              </motion.div>

              {/* Phone */}
              <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <div>
                        <h4 className="font-bold text-gray-900">Mode Dakar</h4>
                        <p className="text-xs text-gray-600">8 produits</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-[400px] overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm border p-3 flex gap-3">
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm text-gray-900 mb-1">Produit {i}</h5>
                          <p className="text-xs text-purple-600 font-bold">15 000 FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}