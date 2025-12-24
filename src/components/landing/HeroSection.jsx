import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-pink-50/30 to-white" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#ed477c]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ff6b9d]/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#ed477c]/10 text-[#ed477c] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Nouveau : QR codes optimisés TikTok
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Transformez vos vues TikTok en{' '}
              <span className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] bg-clip-text text-transparent">
                ventes WhatsApp
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Générez un QR code par produit — vos clients vous contactent directement, prêts à acheter. 
              Sans site web, sans paiement en ligne, sans friction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-pink-200 w-full sm:w-auto"
                >
                  Commencer maintenant
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-200 hover:border-[#ed477c] hover:text-[#ed477c] px-8 py-6 text-lg rounded-xl"
              >
                Voir une démo
              </Button>
            </div>
            
            <div className="mt-10 flex items-center gap-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 border-2 border-white flex items-center justify-center text-xs font-medium text-[#ed477c]"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">500+</span> vendeurs actifs
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Right - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Phone frame */}
              <div className="w-72 md:w-80 bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-gray-300">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-gray-100 h-6 flex items-center justify-center">
                    <div className="w-20 h-4 bg-gray-900 rounded-full" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 min-h-[500px]">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-white rounded-xl shadow-sm mx-auto mb-3 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-24 h-24">
                            {/* QR Code pattern */}
                            <rect fill="#1f2937" x="10" y="10" width="20" height="20"/>
                            <rect fill="#1f2937" x="70" y="10" width="20" height="20"/>
                            <rect fill="#1f2937" x="10" y="70" width="20" height="20"/>
                            <rect fill="#1f2937" x="40" y="10" width="10" height="10"/>
                            <rect fill="#1f2937" x="40" y="40" width="20" height="20"/>
                            <rect fill="#1f2937" x="70" y="40" width="10" height="10"/>
                            <rect fill="#1f2937" x="10" y="40" width="10" height="10"/>
                            <rect fill="#1f2937" x="50" y="70" width="10" height="10"/>
                            <rect fill="#1f2937" x="70" y="80" width="20" height="10"/>
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500">Scannez pour commander</p>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Robe Wax Élégante</h3>
                    <p className="text-[#ed477c] font-bold text-xl mb-3">15 000 FCFA</p>
                    
                    <button className="w-full bg-[#25D366] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Commander sur WhatsApp
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -left-10 top-20 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nouvelle commande!</p>
                  <p className="text-sm font-medium">+221 77 123 45 67</p>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -right-5 bottom-32 bg-white rounded-xl shadow-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#ed477c] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    +12
                  </div>
                  <p className="text-sm font-medium">Ventes aujourd'hui</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}