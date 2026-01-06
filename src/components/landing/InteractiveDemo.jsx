import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Package, Download, MessageCircle, X } from 'lucide-react';

const steps = [
  {
    number: "1",
    icon: Package,
    title: "Ajoutez votre produit",
    description: "Nom, prix, image — 30 secondes chrono",
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "2",
    icon: Download,
    title: "Téléchargez votre QR code TikTok",
    description: "Prêt à être ajouté dans vos vidéos ou lives",
    color: "from-purple-500 to-pink-500"
  },
  {
    number: "3",
    icon: MessageCircle,
    title: "Vos clients scannent",
    description: "Ils vous contactent directement sur WhatsApp",
    color: "from-green-500 to-emerald-500"
  }
];

export default function InteractiveDemo() {
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorStep, setSimulatorStep] = useState(0);

  const startSimulator = () => {
    setShowSimulator(true);
    setSimulatorStep(0);
    setTimeout(() => setSimulatorStep(1), 1000);
    setTimeout(() => setSimulatorStep(2), 2500);
    setTimeout(() => setSimulatorStep(3), 4000);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-white">
      <div className="container mx-auto px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comment ça marche ? — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ed477c] to-purple-500">Simple comme un scan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            3 étapes pour transformer vos vues en ventes
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-shadow h-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-5xl font-bold text-gray-100">{step.number}</span>
                  <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-lg text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Simulator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            onClick={startSimulator}
            size="lg"
            className="bg-gradient-to-r from-[#ed477c] to-purple-500 hover:opacity-90 text-white px-12 py-8 text-2xl font-bold rounded-full shadow-2xl"
          >
            <QrCode className="w-8 h-8 mr-3" />
            Voir le simulateur de scan
          </Button>
          <p className="mt-4 text-gray-600">👆 Cliquez pour vivre l'expérience client complète</p>
        </motion.div>
      </div>

      {/* Simulator Modal */}
      <AnimatePresence>
        {showSimulator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSimulator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full"
            >
              {/* Close button */}
              <button
                onClick={() => setShowSimulator(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Phone Frame */}
              <div className="bg-gray-900 rounded-t-3xl pt-3 pb-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full" />
                  <div className="w-2 h-2 bg-gray-700 rounded-full" />
                </div>
              </div>

              {/* Phone Screen */}
              <div className="bg-white min-h-[550px] relative">
                <AnimatePresence mode="wait">
                  {/* Step 0: QR Scanner */}
                  {simulatorStep === 0 && (
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
                          <motion.div
                            className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#ed477c]"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <p className="text-white font-medium text-lg">Scan en cours...</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Success */}
                  {simulatorStep === 1 && (
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
                        <p className="text-white font-bold text-2xl">Scan réussi !</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Product Page */}
                  {simulatorStep === 2 && (
                    <motion.div
                      key="product"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      className="absolute inset-0 bg-white p-6 overflow-y-auto"
                    >
                      <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl overflow-hidden mb-4">
                        <img
                          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop"
                          alt="Robe Wax"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-bold text-2xl text-gray-900 mb-2">Robe Wax Élégante</h3>
                      <p className="text-4xl font-bold text-[#ed477c] mb-3">25 000 FCFA</p>
                      <p className="text-gray-600 text-sm mb-6">
                        Robe africaine moderne en tissu wax authentique
                      </p>
                      <Button
                        className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white h-14 text-lg font-bold rounded-xl"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Commander sur WhatsApp
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 3: WhatsApp Message */}
                  {simulatorStep === 3 && (
                    <motion.div
                      key="whatsapp"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      className="absolute inset-0 bg-[#0b141a] p-6 overflow-y-auto"
                    >
                      <div className="bg-[#202c33] rounded-t-2xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-600" />
                          <div>
                            <p className="text-white font-medium">Mode Dakar</p>
                            <p className="text-xs text-gray-400">en ligne</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#005c4b] rounded-2xl p-4 ml-auto max-w-[85%] mb-4">
                        <p className="text-white text-sm whitespace-pre-line">
                          Merci d'avoir scanné le QR Code pour le produit Robe Wax Élégante ! 😊

Voici un petit résumé du produit :

Nom du produit : Robe Wax Élégante
Prix : 25 000 FCFA
Description : Robe africaine moderne en tissu wax authentique

Si vous souhaitez procéder à l'achat, il vous suffit de répondre avec "Oui, je veux l'acheter" ou poser toutes vos questions !
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-[#202c33] rounded-full px-4 py-2">
                        <input
                          type="text"
                          placeholder="Message"
                          className="flex-1 bg-transparent text-white text-sm outline-none"
                          disabled
                        />
                        <div className="w-8 h-8 bg-[#00a884] rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Phone Bottom */}
              <div className="bg-gray-900 h-4 rounded-b-3xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}