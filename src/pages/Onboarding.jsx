import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Users, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam) {
      // Si un plan est déjà sélectionné, passer directement à l'inscription
      if (planParam === 'mini') {
        setSelectedType('simple');
      } else {
        setSelectedType('tiktok');
      }
      setStep(1);
    }
  }, []);

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setStep(1);
  };

  const handleContinue = () => {
    const plan = selectedType === 'simple' ? 'mini' : 'starter';
    window.location.href = `/SubscriptionRequest?plan=${plan}`;
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="bg-[#6C4AB6] mb-4">
              ÉTAPE 1/2
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Quel type de vendeur êtes-vous ?
            </h1>
            <p className="text-xl text-gray-600">
              Choisissez l'option qui vous correspond le mieux
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* TikTok Seller */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-2xl transition-all border-2 hover:border-[#FF6B9D] h-full"
                onClick={() => handleTypeSelection('tiktok')}
              >
                <CardHeader className="bg-gradient-to-br from-pink-50 to-purple-50">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B9D] to-[#6C4AB6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-center">Je vends sur TikTok</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="bg-gradient-to-r from-[#FF6B9D] to-[#6C4AB6] text-white px-4 py-2 rounded-full text-center font-bold">
                    Forfaits TikTok : 5 000 ou 10 000 FCFA/mois
                  </div>
                  
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Mode Live avec QR codes dynamiques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Promotions flash et coupons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Analytics en temps réel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Preuve de performance</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full bg-gradient-to-r from-[#FF6B9D] to-[#6C4AB6] hover:opacity-90 text-white py-6"
                    onClick={() => handleTypeSelection('tiktok')}
                  >
                    Continuer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Simple Store */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-2xl transition-all border-2 hover:border-[#6C4AB6] h-full"
                onClick={() => handleTypeSelection('simple')}
              >
                <CardHeader className="bg-gradient-to-br from-gray-50 to-white">
                  <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-center">Je veux juste une vitrine</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-200 text-blue-900 px-4 py-2 rounded-full text-center font-bold">
                    Mini-boutique : 5 000 FCFA/mois
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-900 font-semibold text-center">
                      💡 Pas de TikTok ? Pas de problème.
                    </p>
                  </div>
                  
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Vitrine simple avec jusqu'à 20 produits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>QR codes produits basiques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Catalogue PDF téléchargeable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400">✗</span>
                      <span className="text-gray-500">Pas de mode live ni promotions</span>
                    </li>
                  </ul>

                  <Button 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6"
                    onClick={() => handleTypeSelection('simple')}
                  >
                    Continuer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge className="bg-[#6C4AB6] mb-4">
            ÉTAPE 2/2
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Création de votre compte
          </h1>
          
          {loading ? (
            <div className="py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#6C4AB6] mx-auto mb-4" />
              <p className="text-gray-600">Redirection en cours...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="p-6">
                <p className="text-lg text-gray-700 mb-6">
                  Vous avez choisi : <span className="font-bold">
                    {selectedType === 'simple' ? 'Mini-boutique' : 'Forfait TikTok'}
                  </span>
                </p>
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] hover:opacity-90 text-white py-6 text-lg"
                >
                  Remplir le formulaire d'inscription
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>

              <Button 
                variant="ghost"
                onClick={() => setStep(0)}
                className="text-gray-600"
              >
                ← Retour au choix du type
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}