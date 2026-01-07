import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, QrCode, Radio, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Logo from '@/components/ui/Logo';
import { createPageUrl } from '@/utils/index';

export default function OnboardingSuccess() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserName(params.get('name') || 'Cher vendeur');

    // Confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const actions = [
    {
      icon: Package,
      title: 'Ajoutez votre premier produit',
      description: 'Créez votre catalogue et commencez à vendre',
      action: () => window.location.href = createPageUrl('Dashboard'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: QrCode,
      title: 'Téléchargez votre QR code TikTok',
      description: 'Partagez-le dans vos vidéos pour générer des ventes',
      action: () => window.location.href = createPageUrl('Dashboard'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Radio,
      title: 'Lancez votre premier live',
      description: 'Montrez vos produits en direct et boostez vos ventes',
      action: () => window.location.href = createPageUrl('Dashboard'),
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Success Message */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Félicitations, {userName} !
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Votre boutique est prête 🎉
          </p>
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardContent className="py-6">
              <p className="text-gray-700 text-center">
                <Sparkles className="w-5 h-5 inline mr-2 text-yellow-500" />
                Votre demande est en cours de validation par notre équipe.
                <br />
                <span className="font-semibold">Un email de confirmation vous sera envoyé sous peu.</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Cards */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            Prochaines étapes
          </h2>
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
              >
                <Card 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={action.action}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 text-gray-900">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {action.description}
                        </p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            onClick={() => window.location.href = createPageUrl('Dashboard')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-12 py-6 text-lg shadow-2xl transform hover:scale-105 transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Accéder à mon dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}