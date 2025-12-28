import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-[#222222] to-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2563eb] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#10b981] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3"
          >
            <Sparkles className="w-5 h-5 text-[#10b981]" />
            <span className="text-white font-medium">Rejoignez 500+ vendeurs qui transforment leurs produits en ventes</span>
          </motion.div>

          {/* Main heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Vos produits méritent d'être{' '}
            <span className="text-[#10b981]">vendus</span>.{' '}
            <br className="hidden md:block" />
            Pas juste vus.
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Commencez à vendre en moins de 2 minutes. Sans technique, sans stress, sans paiement compliqué.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button 
                size="lg" 
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xl px-12 py-8 rounded-full shadow-2xl hover:shadow-[#2563eb]/50 transition-all duration-300 group"
              >
                <Sparkles className="mr-3 w-6 h-6" />
                Créer ma boutique — 2 minutes
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col items-center gap-3 pt-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Aucune carte bancaire requise</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Annulation libre à tout moment</span>
            </div>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="pt-8 flex items-center justify-center gap-2"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] border-2 border-gray-900 flex items-center justify-center text-white font-bold text-sm"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm ml-2">
              <span className="text-white font-semibold">500+ vendeurs</span> utilisent déjà QRSell
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}