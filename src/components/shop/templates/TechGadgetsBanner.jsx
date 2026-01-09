import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';

export default function TechGadgetsBanner({ shop, onWhatsAppClick }) {
  return (
    <div className="relative bg-gradient-to-r from-slate-900 to-blue-900 overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white z-10">
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Les montres intelligentes simplifient votre quotidien
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200">
              Découvrez notre sélection de gadgets tech innovants pour améliorer votre vie
            </p>
            <a
              href={shop.whatsapp_number ? `https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsAppClick}
            >
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-full shadow-2xl"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Commander maintenant
              </Button>
            </a>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
              alt="Montre connectée"
              className="relative z-10 w-full max-w-md mx-auto drop-shadow-2xl rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10"></div>
    </div>
  );
}