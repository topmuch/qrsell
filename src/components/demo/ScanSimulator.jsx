import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScanSimulator({ isOpen, onClose, product }) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const timer1 = setTimeout(() => setStep(2), 800);
      const timer2 = setTimeout(() => setStep(3), 1600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const whatsappMessage = `Merci d'avoir scanné le QR Code pour le produit ${product?.name} ! 😊

Voici un petit résumé du produit :

Nom du produit : ${product?.name}
Prix : ${formatPrice(product?.price)} FCFA
Description rapide : ${product?.description}

Si vous souhaitez procéder à l'achat, il vous suffit de répondre avec "Oui, je veux l'acheter" ou poser toutes vos questions !`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-0">
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Phone Frame */}
          <div className="bg-gray-900 rounded-t-3xl pt-3 pb-1">
            <div className="flex items-center justify-center gap-2">
              <div className="w-16 h-1.5 bg-gray-700 rounded-full" />
              <div className="w-2 h-2 bg-gray-700 rounded-full" />
            </div>
          </div>

          {/* Phone Screen */}
          <div className="bg-white min-h-[500px] relative">
            <AnimatePresence mode="wait">
              {/* Step 1: QR Scanner */}
              {step === 1 && (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gray-900 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="relative w-48 h-48 border-4 border-white/30 rounded-2xl mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-[#ed477c] animate-pulse rounded-2xl" />
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#ed477c] animate-scan" />
                    </div>
                    <p className="text-white font-medium">Scan en cours...</p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Success */}
              {step === 2 && (
                <motion.div
                  key="success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <span className="text-5xl">✓</span>
                    </motion.div>
                    <p className="text-white font-bold text-xl">Scan réussi !</p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Product Page */}
              {step === 3 && (
                <motion.div
                  key="product"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  className="absolute inset-0 bg-white p-6 overflow-y-auto"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
                    <img
                      src={product?.image}
                      alt={product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {product?.name}
                  </h3>
                  <p className="text-3xl font-bold text-[#ed477c] mb-3">
                    {formatPrice(product?.price)} FCFA
                  </p>
                  <p className="text-gray-600 text-sm mb-6">
                    {product?.description}
                  </p>

                  {/* WhatsApp Preview */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 border-2 border-dashed border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Message WhatsApp pré-rempli :
                    </p>
                    <p className="text-xs text-gray-700 whitespace-pre-line line-clamp-6">
                      {whatsappMessage}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white h-14 text-lg font-bold rounded-xl"
                    onClick={onClose}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Commander sur WhatsApp
                  </Button>

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    className="w-full mt-3"
                    onClick={onClose}
                  >
                    Fermer
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Phone Bottom */}
          <div className="bg-gray-900 h-4 rounded-b-3xl" />
        </div>
      </DialogContent>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  );
}