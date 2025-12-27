import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Radio, Link2, Download, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import TikTokScriptTemplates from './TikTokScriptTemplates';

const methods = [
  {
    icon: Video,
    title: "Vidéo enregistrée",
    badge: "Recommandé",
    badgeColor: "bg-green-100 text-green-700",
    steps: [
      "Téléchargez le QR code de votre produit",
      "Ouvrez CapCut ou un éditeur vidéo",
      "Ajoutez le QR comme overlay sur votre vidéo",
      "Publiez sur TikTok avec #TiktocQR"
    ]
  },
  {
    icon: Radio,
    title: "Live TikTok",
    badge: "Direct",
    badgeColor: "bg-blue-100 text-blue-700",
    steps: [
      "Imprimez le QR ou affichez-le sur un écran",
      "Placez-le visible pendant votre live",
      "Invitez vos viewers à scanner",
      "Répondez aux commandes WhatsApp en direct"
    ]
  },
  {
    icon: Link2,
    title: "Bio TikTok",
    badge: "Permanent",
    badgeColor: "bg-purple-100 text-purple-700",
    steps: [
      "Copiez le lien de votre vitrine",
      "Ajoutez-le dans votre bio TikTok",
      "Mentionnez-le dans vos vidéos",
      "Épinglez un post avec le lien"
    ]
  }
];

export default function TikTokGuide({ shopUrl }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Guide TikTok</h2>
        <Badge variant="outline" className="bg-[#ed477c]/10 text-[#ed477c] border-[#ed477c]/20">
          3 méthodes
        </Badge>
      </div>

      {/* Video tutorial placeholder */}
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800')] bg-cover bg-center opacity-30" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
          >
            <Play className="w-8 h-8 text-[#ed477c] ml-1" />
          </motion.button>
          <div className="absolute bottom-4 left-4 text-white z-10">
            <p className="font-medium">Tutoriel vidéo</p>
            <p className="text-sm text-white/70">Comment utiliser TiktocQR sur TikTok</p>
          </div>
        </div>
      </Card>

      {/* Methods */}
      <div className="grid md:grid-cols-3 gap-4">
        {methods.map((method, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ed477c] to-[#ff6b9d] flex items-center justify-center">
                    <method.icon className="w-5 h-5 text-white" />
                  </div>
                  <Badge className={method.badgeColor} variant="secondary">
                    {method.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{method.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {method.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                        {stepIndex + 1}
                      </span>
                      <span className="text-gray-600">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Script Templates */}
      <TikTokScriptTemplates />

      {/* Shop link */}
      {shopUrl && (
        <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Lien de votre vitrine</p>
              <p className="text-sm text-gray-500">À partager dans votre bio TikTok</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-3 py-2 bg-white rounded-lg text-sm border">
                {shopUrl}
              </code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}