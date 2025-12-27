import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Smartphone, Download, MessageCircle } from 'lucide-react';

const steps = [
  {
    icon: Smartphone,
    title: "Ajoutez votre produit",
    subtitle: "Nom, prix, image — 30 secondes chrono.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Download,
    title: "Téléchargez votre QR code TikTok",
    subtitle: "Prêt à être ajouté dans vos vidéos ou lives.",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: MessageCircle,
    title: "Vos clients scannent → WhatsApp",
    subtitle: "Pas de site, pas de paiement — juste des ventes.",
    color: "from-green-500 to-green-600"
  }
];

export default function HowItWorksNew() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#222222] mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            3 étapes simples pour transformer vos vues en ventes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#ed477c]/20 relative overflow-hidden group">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ed477c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ed477c]/10 text-[#ed477c] font-bold text-xl mb-6">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} mb-6 shadow-lg`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-[#222222] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.subtitle}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Connecting line */}
        <div className="hidden md:block relative -mt-[280px] mb-[280px] pointer-events-none">
          <svg className="w-full h-8" viewBox="0 0 1000 30">
            <motion.path
              d="M 50 15 Q 250 15 500 15 T 950 15"
              stroke="#ed477c"
              strokeWidth="2"
              fill="none"
              strokeDasharray="8 8"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.3 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </svg>
        </div>
      </div>
    </section>
  );
}