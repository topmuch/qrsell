import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const products = [
  {
    id: 1,
    name: 'Robe Wax',
    price: 25000,
    description: 'Robe élégante en tissu Wax africain, parfaite pour toutes occasions',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop'
  },
  {
    id: 2,
    name: 'Sac en Cuir',
    price: 18000,
    description: 'Sac à main en cuir véritable, design moderne et intemporel',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop'
  },
  {
    id: 3,
    name: 'Montre Classique',
    price: 15000,
    description: 'Montre élégante au style classique, bracelet en acier inoxydable',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
  }
];

export default function MiniShop() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleScan = (product) => {
    setSelectedProduct(product);
  };

  const handleWhatsAppOrder = () => {
    const message = `Bonjour ! Je suis intéressé(e) par le produit "${selectedProduct.name}" à ${selectedProduct.price.toLocaleString('fr-FR')} FCFA. Pouvez-vous me donner plus d'informations ?`;
    window.open(`https://wa.me/221771234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mini boutique — <span className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] bg-clip-text text-transparent">Testez en 30 secondes</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Pas encore prêt à créer votre boutique ? Essayez notre version miniature avec 3 produits fictifs.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                <p className="text-2xl font-black mb-3" style={{ color: '#10B981' }}>
                  {product.price.toLocaleString('fr-FR')} FCFA
                </p>

                {/* QR Code Visual */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#6C4AB6] to-[#FF6B9D] rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-white rounded-sm" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scan Button */}
                <Button
                  onClick={() => handleScan(product)}
                  className="w-full font-bold py-5 text-base"
                  style={{
                    background: 'linear-gradient(135deg, #6C4AB6 0%, #FF6B9D 100%)',
                    color: 'white'
                  }}
                >
                  Scan-moi ! 📱
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          💡 Ceci est une démo — les QR codes ne sont pas scannables. Cliquez sur "Scan-moi !" pour tester l'expérience.
        </motion.p>
      </div>

      {/* Scan Success Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Success Icon */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Scan réussi !
                </h3>
              </div>

              {/* Product Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 leading-relaxed">
                  Merci d'avoir scanné le QR Code pour le produit <strong>{selectedProduct.name}</strong> ! 😊
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <p><strong>Nom du produit :</strong> {selectedProduct.name}</p>
                  <p><strong>Prix :</strong> {selectedProduct.price.toLocaleString('fr-FR')} FCFA</p>
                  <p><strong>Description :</strong> {selectedProduct.description}</p>
                </div>
              </div>

              {/* Message */}
              <p className="text-gray-600 text-sm text-center mb-4">
                Si vous souhaitez procéder à l'achat, il vous suffit de répondre avec "Oui, je veux l'acheter" ou poser toutes vos questions ! Je suis là pour vous aider à finaliser votre commande.
              </p>

              {/* WhatsApp Button */}
              <Button
                onClick={handleWhatsAppOrder}
                className="w-full font-bold py-5 text-base bg-[#10B981] hover:bg-[#059669] text-white"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Commander sur WhatsApp
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}