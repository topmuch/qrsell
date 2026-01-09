import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Apple, Carrot, Milk, Beef, Bird, Coffee, Pizza } from 'lucide-react';

export default function FraisNatureBanner({ shop, onWhatsAppClick }) {
  const categories = [
    { name: 'Légumes', icon: Carrot, color: 'text-green-600' },
    { name: 'Fruits', icon: Apple, color: 'text-red-500' },
    { name: 'Laiterie', icon: Milk, color: 'text-blue-400' },
    { name: 'Viande', icon: Beef, color: 'text-red-700' },
    { name: 'Volaille', icon: Bird, color: 'text-orange-500' },
    { name: 'Thé', icon: Coffee, color: 'text-green-700' },
    { name: 'Pâtes', icon: Pizza, color: 'text-amber-600' }
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="z-10">
              <h1 className="text-4xl md:text-5xl font-black mb-6 text-green-900 leading-tight">
                Des fruits et légumes frais, directement du producteur
              </h1>
              <p className="text-lg md:text-xl mb-8 text-green-800">
                Qualité garantie, fraîcheur assurée, produits locaux
              </p>
              <a
                href={shop.whatsapp_number ? `https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onWhatsAppClick}
              >
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-full shadow-xl"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Découvrir la boutique
                </Button>
              </a>
            </div>

            {/* Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80"
                alt="Panier de légumes frais"
                className="w-full max-w-lg mx-auto drop-shadow-2xl rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#FAF8F5"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-12 bg-[#FAF8F5]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-gray-900">
            Nos catégories
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {categories.map(({ name, icon: Icon, color }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <Icon className={`w-10 h-10 ${color}`} />
                <span className="text-sm font-semibold text-gray-800">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}