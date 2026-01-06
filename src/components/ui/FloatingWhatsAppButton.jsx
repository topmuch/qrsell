import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FloatingWhatsAppButton({ 
  onClick, 
  text = "Je veux ce produit",
  className = "" 
}) {
  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      onClick={onClick}
      className={`fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50 bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 ${className}`}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="text-lg">{text}</span>
    </motion.button>
  );
}