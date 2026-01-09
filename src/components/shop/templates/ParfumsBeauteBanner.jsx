import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from 'lucide-react';

export default function ParfumsBeauteBanner({ shop, onWhatsAppClick }) {
  return (
    <div className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative order-2 md:order-1">
            <div className="absolute inset-0 bg-pink-300 rounded-full blur-3xl opacity-20"></div>
            <img
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80"
              alt="Parfum élégant"
              className="relative z-10 w-full max-w-md mx-auto drop-shadow-2xl rounded-2xl"
            />
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-200 rounded-full blur-2xl opacity-50"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-200 rounded-full blur-2xl opacity-50"></div>
          </div>

          {/* Content */}
          <div className="z-10 order-1 md:order-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-pink-500" />
              <span className="text-pink-600 font-semibold uppercase tracking-wider text-sm">
                Collection exclusive
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 leading-tight">
              Des parfums qui éveillent vos émotions
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-700">
              Découvrez notre sélection de parfums premium, pour hommes et femmes
            </p>
            <a
              href={shop.whatsapp_number ? `https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsAppClick}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-lg px-8 py-6 rounded-full shadow-2xl"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Découvrir la collection
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 left-32 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
}