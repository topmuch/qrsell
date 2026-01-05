import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Store } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductGrid({ products, seller, onWhatsAppClick }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const generateWhatsAppMessage = (product) => {
    const now = new Date();
    const hour = now.getHours();
    
    let timePhrase = "";
    if (hour >= 6 && hour < 12) timePhrase = "ce matin";
    else if (hour >= 12 && hour < 18) timePhrase = "cet après-midi";
    else if (hour >= 18 && hour < 22) timePhrase = "ce soir";
    else timePhrase = "aujourd'hui";

    return `Bonjour, je souhaite commander le/la « ${product.name} » (${product.public_id}) à ${formatPrice(product.price)} FCFA.

${product.image_url || ''}

Est-ce toujours disponible ${timePhrase} ?`;
  };

  const getWhatsAppLink = (product) => {
    const phone = seller?.whatsapp_number?.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(generateWhatsAppMessage(product));
    return `https://wa.me/${phone}?text=${message}`;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit disponible</h2>
        <p className="text-gray-500">Aucun produit ne correspond à vos critères.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <Store className="w-12 h-12 text-gray-200" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_new && (
                  <Badge className="bg-blue-500 text-white">Nouveauté</Badge>
                )}
                {product.is_on_promo && (
                  <Badge className="bg-red-500 text-white">Promo</Badge>
                )}
                {product.is_out_of_stock && (
                  <Badge className="bg-gray-800 text-white">Rupture</Badge>
                )}
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-2xl font-bold text-[#10b981] mb-2">
                {formatPrice(product.price)} FCFA
              </p>
              {product.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                  {product.description}
                </p>
              )}
              
              <a 
                href={getWhatsAppLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-auto"
                onClick={() => onWhatsAppClick(product)}
              >
                <Button 
                  className="w-full text-white"
                  style={{
                    background: `linear-gradient(135deg, ${seller.primary_color || '#2563eb'} 0%, ${seller.secondary_color || '#3b82f6'} 100%)`
                  }}
                  disabled={product.is_out_of_stock}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {product.is_out_of_stock ? 'Indisponible' : 'Commander sur WhatsApp'}
                </Button>
              </a>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}