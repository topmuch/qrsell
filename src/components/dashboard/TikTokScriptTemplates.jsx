import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const scriptTemplates = [
  {
    title: "Vidéo produit classique",
    duration: "15-30 sec",
    category: "Débutant",
    categoryColor: "bg-green-100 text-green-700",
    script: [
      "🎬 Ouverture : Montrez le produit en gros plan",
      "💬 Hook (3s) : \"Tu cherches [type de produit] à [ville] ?\"",
      "✨ Présentation : Montrez 2-3 caractéristiques clés",
      "💰 Prix : Affichez le prix clairement",
      "📱 CTA : \"Scanne le QR ou clique sur le lien dans ma bio !\"",
      "⏱️ Fin : QR visible pendant 3-5 secondes"
    ],
    example: "\"Tu cherches des chaussures stylées à Dakar ? Voici mes nouveaux modèles à partir de 15.000 FCFA. Scanne le QR pour commander sur WhatsApp !\""
  },
  {
    title: "Live selling dynamique",
    duration: "5-30 min",
    category: "Intermédiaire",
    categoryColor: "bg-blue-100 text-blue-700",
    script: [
      "👋 Intro (30s) : Saluez et montrez le QR",
      "🎯 Rappel régulier : \"Scannez le QR pour commander\"",
      "💬 Interaction : Répondez aux questions en direct",
      "🔥 Urgence : \"Stock limité, commandez maintenant !\"",
      "📦 Témoignages : Lisez des messages clients satisfaits",
      "🎁 Bonus : Offre spéciale pour les viewers du live"
    ],
    example: "\"Bonsoir la famille ! Scannez le QR à l'écran pour commander directement sur WhatsApp. Les 10 premiers ont -10% !\""
  },
  {
    title: "Storytelling émotionnel",
    duration: "30-60 sec",
    category: "Avancé",
    categoryColor: "bg-purple-100 text-purple-700",
    script: [
      "💔 Problème : Décrivez un problème commun",
      "✨ Solution : Présentez votre produit comme solution",
      "🎬 Démonstration : Montrez le produit en action",
      "⭐ Bénéfices : Expliquez ce que ça change",
      "🤝 Confiance : Parlez de vos clients satisfaits",
      "📱 CTA fort : \"Rejoins-nous via le QR !\""
    ],
    example: "\"Marre de perdre tes clés ? Voici mon porte-clés intelligent avec alarme. Mes clients adorent ! Scanne pour commander.\""
  }
];

export default function TikTokScriptTemplates() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyScript = (script, index) => {
    const fullScript = script.join('\n');
    navigator.clipboard.writeText(fullScript);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#ed477c]" />
        <h3 className="text-lg font-semibold text-gray-900">Templates de scripts</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {scriptTemplates.map((template, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={template.categoryColor} variant="secondary">
                    {template.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{template.duration}</span>
                </div>
                <CardTitle className="text-base">{template.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-2">
                  {template.script.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-sm text-gray-600">
                      {step}
                    </li>
                  ))}
                </ol>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Exemple :</p>
                  <p className="text-sm text-gray-700 italic">"{template.example}"</p>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => copyScript(template.script, index)}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 mr-2 text-green-500" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-2" />
                      Copier le script
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}