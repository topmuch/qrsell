import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Video, Radio, User, Download, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TikTokGuide() {
  const navigate = useNavigate();

  const methods = [
    {
      icon: Video,
      title: "Vidéo enregistrée",
      description: "Utilisez CapCut pour ajouter votre QR code sur vos vidéos",
      steps: [
        "Téléchargez votre QR code depuis le dashboard",
        "Ouvrez CapCut et importez votre vidéo",
        "Ajoutez le QR code comme overlay (sticker)",
        "Positionnez-le dans un coin visible",
        "Exportez et publiez sur TikTok"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Radio,
      title: "TikTok Live",
      description: "Affichez votre QR code pendant vos lives",
      steps: [
        "Imprimez votre QR code ou affichez-le sur un écran",
        "Lancez votre TikTok Live",
        "Positionnez le QR code bien visible à l'écran",
        "Incitez vos viewers à scanner pour commander",
        "Répondez aux questions en direct"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: User,
      title: "Lien dans la bio",
      description: "Partagez le lien de votre vitrine complète",
      steps: [
        "Copiez le lien de votre boutique depuis le dashboard",
        "Allez dans les paramètres de votre profil TikTok",
        "Collez le lien dans la section 'Site web'",
        "Créez une vidéo épinglée mentionnant le lien",
        "Rappelez régulièrement à vos followers de visiter votre boutique"
      ],
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Dashboard'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-[#ed477c] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Guide TikTok</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les 3 meilleures façons d'utiliser vos QR codes et votre boutique sur TikTok
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {methods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all border-2 hover:border-[#ed477c]">
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{method.title}</CardTitle>
                  <p className="text-gray-600">{method.description}</p>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {method.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#ed477c] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {stepIndex + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Video Tutorial Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Video className="w-6 h-6 text-[#ed477c]" />
                Tutoriel vidéo (30 secondes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Tutoriel vidéo à venir</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Une démonstration complète de toutes les méthodes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-br from-[#ed477c] to-[#c93b63] text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">💡 Conseils Pro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>✅ Assurez-vous que votre QR code est bien visible et net</p>
              <p>✅ Mentionnez verbalement dans vos vidéos de scanner le QR code</p>
              <p>✅ Testez votre QR code avant de publier pour vérifier qu'il fonctionne</p>
              <p>✅ Combinez plusieurs méthodes pour maximiser vos ventes</p>
              <p>✅ Répondez rapidement aux messages WhatsApp de vos clients</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}