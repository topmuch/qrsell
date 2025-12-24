import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

export default function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 md:p-16 overflow-hidden text-center"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ed477c]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ff6b9d]/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Vos produits méritent d'être{' '}
              <span className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] bg-clip-text text-transparent">
                vendus
              </span>
              .<br />Pas juste vus.
            </h2>
            
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Rejoignez les centaines de vendeurs qui transforment déjà leurs vues TikTok en ventes réelles.
            </p>
            
            <Link to={createPageUrl('Dashboard')}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-pink-500/30"
              >
                Créer ma boutique — 2 minutes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500 mt-4">
              Pas de carte bancaire requise pour l'essai
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}