import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

export default function ReinforcedCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-[#ed477c] to-purple-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <span className="text-8xl">🚀</span>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Créez votre boutique en 2 minutes
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl text-white/95 font-semibold mb-4"
          >
            Sans carte bancaire • Sans engagement
          </motion.p>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full px-8 py-4 mb-10"
          >
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <span className="text-3xl font-bold text-white">5 000 FCFA/mois</span>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <Link to={createPageUrl('DevenirVendeur')}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-white text-[#ed477c] hover:bg-gray-50 px-14 py-8 text-2xl md:text-3xl font-bold rounded-full shadow-2xl"
                >
                  🚀 Créer ma boutique maintenant
                  <ArrowRight className="ml-3 w-8 h-8" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 text-white/95"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg font-medium">Configuration en 2 min</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg font-medium">Annulation libre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg font-medium">Support inclus</span>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="mt-12 pt-8 border-t border-white/20"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 border-2 border-white flex items-center justify-center text-sm font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg">500+ vendeurs actifs</p>
                <p className="text-white/80 text-sm">Transforment déjà leurs vues en ventes</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}