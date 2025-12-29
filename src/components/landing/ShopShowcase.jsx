import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Store, ExternalLink, MessageCircle } from 'lucide-react';

const mockProducts = [
{ name: "Sneakers Premium", price: "25.000", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop" },
{ name: "Sac à main cuir", price: "18.500", image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=300&h=300&fit=crop" },
{ name: "Montre élégante", price: "32.000", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop" }];


export default function ShopShowcase() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6">

            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 text-sm font-medium">
              <Store className="w-4 h-4" />
              Votre vitrine en ligne
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#222222]">
              Votre boutique en ligne,{' '}
              <span className="text-[#425dd7]">sans site web</span>
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed">
              Chaque vendeur obtient une page boutique unique avec tous ses produits. 
              Partageable sur TikTok, Instagram, WhatsApp — partout où sont vos clients.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[#222222] mb-1">URL personnalisée</h4>
                  <p className="text-gray-600">votresite.com/shop/votre-boutique</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[#222222] mb-1">Commander direct WhatsApp</h4>
                  <p className="text-gray-600">Chaque produit a un bouton "Commander"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[#222222] mb-1">Mobile-first</h4>
                  <p className="text-gray-600">Optimisé pour smartphone, là où sont vos clients</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative">

            {/* Phone frame */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Phone header */}
                  <div className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] px-6 py-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                        M
                      </div>
                      <div>
                        <h3 className="font-bold">Ma Boutique</h3>
                        <p className="text-xs text-white/80">3 produits</p>
                      </div>
                    </div>
                  </div>

                  {/* Products grid */}
                  <div className="p-4 space-y-3 bg-gray-50 max-h-[500px] overflow-y-auto">
                    {mockProducts.map((product, index) =>
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.4 }}>

                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="flex gap-3 p-3">
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover" />

                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-[#222222] mb-1 truncate">
                                {product.name}
                              </h4>
                              <p className="text-[#ed477c] font-bold text-sm mb-2">
                                {product.price} FCFA
                              </p>
                              <Button
                              size="sm"
                              className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white text-xs h-7">

                                <MessageCircle className="w-3 h-3 mr-1" />
                                Commander
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{
                y: [0, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border-2 border-[#ed477c]">

              <div className="text-center">
                <ExternalLink className="w-6 h-6 text-[#ed477c] mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-600">Partageable!</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>);

}