import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, MessageCircle, Store, Zap, Smartphone, Share2 } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: "QR codes prêts pour TikTok",
    description: "Téléchargez vos QR en 1 clic, optimisés pour vos vidéos et lives TikTok.",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: MessageCircle,
    title: "Redirection WhatsApp automatique",
    description: "Vos clients scannent → reçoivent un message pré-rempli avec le produit et le prix.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Store,
    title: "Vitrine unique partageable",
    description: "Une page élégante avec tous vos produits. Parfait pour votre bio TikTok.",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: Zap,
    title: "Ajout rapide de produits",
    description: "Créez un produit en 30 secondes. Nom, prix, photo — c'est tout ce qu'il faut.",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: Smartphone,
    title: "100% mobile-first",
    description: "Gérez votre boutique depuis votre téléphone, où que vous soyez.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Share2,
    title: "Partage multi-plateforme",
    description: "TikTok, Instagram, Facebook — partagez vos produits partout.",
    color: "from-red-500 to-pink-500"
  }
];

export default function FeaturesSection() {
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
            Tout ce dont vous avez besoin pour{' '}
            <span className="bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] bg-clip-text text-transparent">
              vendre plus
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une solution simple et complète pour transformer vos réseaux sociaux en canal de vente efficace.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}