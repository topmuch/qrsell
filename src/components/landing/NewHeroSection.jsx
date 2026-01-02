import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { motion } from 'framer-motion';
import { ArrowRight, Play, QrCode, MessageCircle } from 'lucide-react';

export default function NewHeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#2563eb]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#2563eb]/10 border border-[#2563eb]/20 rounded-full px-4 py-2"
            >
              <span className="w-2 h-2 bg-[#2563eb] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-[#2563eb]">
                Votre vitrine digitale, en un scan
              </span>
            </motion.div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#222222] leading-tight">
                Transformez vos{' '}
                <span className="text-[#2563eb] relative">
                  produits
                  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C60 4 140 4 198 10" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
                {' '}en{' '}
                <span className="text-[#2563eb]">ventes — en un scan</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl leading-relaxed">
                Créez votre vitrine en 2 minutes. Partagez sur TikTok, Instagram, Facebook. Vendez directement sur WhatsApp.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('SubscriptionRequest')}>
                <Button 
                  size="lg" 
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <a href="#comment-ca-marche">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white text-lg px-8 py-6 rounded-full group transition-all duration-300"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Voir comment ça marche
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Configuration en 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Annulation libre</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Visual mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Phone mockup with content */}
            <div className="relative mx-auto w-full max-w-sm">
              {/* Floating notification badges */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  x: [0, 10, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -left-12 top-16 z-30"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-2xl text-sm font-bold flex items-center gap-2">
                  🔥 +1 vente
                </div>
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  x: [0, -10, 0]
                }}
                transition={{ 
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -right-16 top-32 z-30"
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-2xl text-sm font-bold flex items-center gap-2">
                  📈 +3K vues
                </div>
              </motion.div>

              {/* Floating QR code */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -left-16 bottom-32 z-30"
              >
                <div className="bg-white p-3 rounded-2xl shadow-2xl border-4 border-[#2563eb]">
                  <QrCode className="w-20 h-20 text-[#2563eb]" />
                  <div className="text-xs text-center mt-2 font-bold text-gray-700">Scan moi!</div>
                </div>
              </motion.div>

              {/* TikTok logo floating */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -right-12 bottom-24 z-30"
              >
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="#25F4EE"/>
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="#FE2C55"/>
                  </svg>
                </div>
              </motion.div>

              {/* Main phone frame - Premium mockup */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[3.5rem] p-4 shadow-2xl">
                <div className="bg-white rounded-[3rem] overflow-hidden aspect-[9/19.5] relative">
                  {/* Status bar */}
                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between text-xs">
                    <span className="font-semibold">9:41</span>
                    <div className="flex gap-1 items-center">
                      <div className="w-4 h-4">📶</div>
                      <div className="w-4 h-3 border border-gray-400 rounded-sm relative">
                        <div className="absolute inset-0.5 bg-gray-800 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* TikTok interface */}
                  <div className="relative h-full bg-black">
                    {/* Video background */}
                    <div className="absolute inset-0">
                      <img 
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=800&fit=crop"
                        alt="Shop products"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>

                    {/* Performance stats overlay - TOP */}
                    <div className="absolute top-4 left-4 right-4 z-20 space-y-2">
                      <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/20">
                        <div className="grid grid-cols-2 gap-3 text-white text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              👁️
                            </div>
                            <div>
                              <div className="text-gray-300">Vues</div>
                              <div className="font-bold text-sm">125.4K</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                              ❤️
                            </div>
                            <div>
                              <div className="text-gray-300">Likes</div>
                              <div className="font-bold text-sm">8.2K</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                              💬
                            </div>
                            <div>
                              <div className="text-gray-300">Comments</div>
                              <div className="font-bold text-sm">342</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              🛒
                            </div>
                            <div>
                              <div className="text-gray-300">Ventes</div>
                              <div className="font-bold text-sm">47</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code in video */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-white/80">
                        <QrCode className="w-20 h-20 text-[#2563eb]" />
                      </div>
                    </div>

                    {/* Bottom section - WhatsApp CTA */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 z-20">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563eb] to-blue-600 border-3 border-white flex items-center justify-center text-white font-bold text-lg">
                          M
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">@ma_boutique</div>
                          <div className="text-gray-300 text-xs">Boutique officielle 🔥</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl">
                        <p className="text-gray-800 text-xs font-medium mb-2">
                          ⚡ Nouveaux produits disponibles ! Scannez le QR
                        </p>
                        <button className="w-full bg-gradient-to-r from-[#25D366] to-green-600 text-white rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
                          <MessageCircle className="w-4 h-4" />
                          Commander via WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Phone button */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}