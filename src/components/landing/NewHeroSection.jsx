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
              <Link to={createPageUrl('Dashboard')}>
                <Button 
                  size="lg" 
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white text-lg px-8 py-6 rounded-full group transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Voir comment ça marche
              </Button>
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
                className="absolute -left-8 top-20 z-20"
              >
                <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-[#2563eb]">
                  <QrCode className="w-16 h-16 text-[#2563eb]" />
                  <div className="text-xs text-center mt-2 font-semibold text-gray-600">Scannez-moi!</div>
                </div>
              </motion.div>

              {/* WhatsApp indicator */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -right-8 bottom-32 z-20"
              >
                <div className="bg-[#25D366] p-3 rounded-full shadow-2xl">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Main phone frame */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  {/* Status bar */}
                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between text-xs">
                    <span className="font-semibold">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-3 border border-gray-400 rounded-sm" />
                    </div>
                  </div>

                  {/* TikTok-style content */}
                  <div className="relative h-full bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
                    {/* Simulated video content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&h=800&fit=crop"
                        alt="TikTok seller"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* QR overlay on video */}
                    <div className="absolute bottom-24 right-4 bg-white p-3 rounded-xl shadow-lg border-2 border-white/50">
                      <div className="w-24 h-24 bg-[#2563eb]/20 rounded-lg flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-[#2563eb]" />
                      </div>
                    </div>

                    {/* Video info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#2563eb] border-2 border-white" />
                        <span className="text-white font-semibold">@ma_boutique_sn</span>
                      </div>
                      <p className="text-white text-sm">
                        🔥 Nouveaux modèles disponibles ! Scannez le QR pour commander 👆
                      </p>
                    </div>
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