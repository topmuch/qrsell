import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

const features = [
  "Produits illimités",
  "QR codes personnalisés",
  "Vitrine publique",
  "Redirection WhatsApp",
  "Téléchargement QR TikTok",
  "Support prioritaire"
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Un prix simple, transparent
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pas de frais cachés, pas de commission sur vos ventes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-[#ed477c] relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] text-white px-3 py-1 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Populaire
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Vendeur</h3>
            <p className="text-gray-600 mb-6">Tout ce qu'il faut pour vendre sur TikTok</p>

            <div className="mb-8">
              <span className="text-5xl font-bold text-gray-900">3 000</span>
              <span className="text-xl text-gray-600"> FCFA/mois</span>
              <p className="text-sm text-gray-500 mt-1">≈ 5 €/mois</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to={createPageUrl('Dashboard')} className="block">
              <Button className="w-full bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white py-6 text-lg rounded-xl">
                Commencer maintenant
              </Button>
            </Link>

            <p className="text-center text-sm text-gray-500 mt-4">
              Essai gratuit 7 jours • Annulation à tout moment
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}