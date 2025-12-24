import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Aminata Diallo",
    role: "Vendeuse de robes, Dakar",
    content: "Depuis que j'utilise TiktocQR, je reçois 10 à 15 commandes par jour directement sur WhatsApp ! Mes clientes adorent scanner le QR code pendant mes lives.",
    avatar: "A"
  },
  {
    name: "Fatou Ndiaye",
    role: "Accessoires mode, Abidjan",
    content: "Enfin une solution simple ! Je n'ai pas besoin de site web compliqué. Je poste ma vidéo, les gens scannent, et hop, ils m'écrivent sur WhatsApp.",
    avatar: "F"
  },
  {
    name: "Moussa Traoré",
    role: "Électronique, Bamako",
    content: "Le QR code dans mes vidéos TikTok a changé ma façon de vendre. Plus besoin de répondre 100 fois 'DM pour le prix'. Tout est automatique !",
    avatar: "M"
  }
];

export default function TestimonialSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#ed477c] to-[#ff6b9d]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ils ont transformé leurs ventes
          </h2>
          <p className="text-lg text-pink-100 max-w-2xl mx-auto">
            Découvrez comment nos vendeurs utilisent TiktocQR pour développer leur business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-xl relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-pink-100" />
              
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ed477c] to-[#ff6b9d] flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}