import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Zap, DollarSign, Globe } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: "Zéro technique",
    description: "Pas besoin de site web, de code, ni de paiement en ligne. Juste votre téléphone et vos produits.",
    color: "from-yellow-400 to-orange-500"
  },
  {
    icon: DollarSign,
    title: "Gagnez de l'argent",
    description: "Abonnement à partir de 5 €/mois. Pas de frais cachés, pas de commission sur vos ventes.",
    color: "from-green-400 to-emerald-500"
  },
  {
    icon: Globe,
    title: "Pour tous les marchés",
    description: "Conçu pour les vendeurs africains, latinos, asiatiques — où WhatsApp est roi.",
    color: "from-blue-400 to-purple-500"
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-4">
            Pourquoi QRSell ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Votre vitrine digitale, en un scan
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card className="p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#2563eb]/20 group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-[#222222] mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-3xl p-8 text-white max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white/80">Vendeurs actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Produits en ligne</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-white/80">QR scannés</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-white/80">Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}