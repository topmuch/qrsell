import React from 'react';
import { motion } from 'framer-motion';
import { Upload, QrCode, Smartphone, MessageCircle } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Ajoutez vos produits",
    description: "Photo, nom, prix — c'est tout. En 30 secondes, votre produit est en ligne."
  },
  {
    number: "02",
    icon: QrCode,
    title: "Téléchargez le QR code",
    description: "Chaque produit génère automatiquement un QR code prêt pour TikTok."
  },
  {
    number: "03",
    icon: Smartphone,
    title: "Partagez sur TikTok",
    description: "Intégrez le QR dans vos vidéos, lives ou utilisez le lien dans votre bio."
  },
  {
    number: "04",
    icon: MessageCircle,
    title: "Recevez les commandes",
    description: "Vos clients vous contactent directement sur WhatsApp, prêts à acheter."
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            En 4 étapes simples, commencez à recevoir des commandes directement sur WhatsApp.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#ed477c] to-pink-200" />
              )}
              
              <div className="relative bg-gradient-to-br from-pink-50 to-white rounded-2xl p-8 border border-pink-100">
                <span className="absolute -top-4 -left-2 text-6xl font-bold text-pink-100">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ed477c] to-[#ff6b9d] flex items-center justify-center mb-6">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}