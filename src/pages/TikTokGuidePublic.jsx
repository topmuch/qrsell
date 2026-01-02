import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { Play, Download, Smartphone, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function TikTokGuidePublic() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-4">
            <Play className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-600">GUIDE TIKTOK</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comment vendre vos produits sur TikTok avec QRSell
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transformez vos vidéos TikTok en machine à vendre grâce aux QR codes
          </p>
        </div>

        {/* Video placeholder */}
        <Card className="mb-12 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className="text-lg opacity-75">Vidéo tutoriel à venir</p>
            </div>
          </div>
        </Card>

        {/* Steps */}
        <div className="space-y-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Les 3 étapes simples</h2>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <CardTitle className="text-2xl">Créez vos produits sur QRSell</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Ajoutez vos produits (nom, prix, photo) en moins de 2 minutes. Chaque produit génère automatiquement un QR code unique.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Smartphone className="w-4 h-4" />
                <span>Accessible depuis votre dashboard vendeur</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <CardTitle className="text-2xl">Téléchargez votre QR code</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Téléchargez le QR code et ajoutez-le dans vos vidéos TikTok (en overlay) ou affichez-le pendant vos lives.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-2">💡 Astuce TikTok :</p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Placez le QR en bas à droite de la vidéo</li>
                  <li>• Gardez-le visible pendant 3-5 secondes minimum</li>
                  <li>• Dites à voix haute "Scannez le QR pour commander"</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <CardTitle className="text-2xl">Vos clients scannent → achètent sur WhatsApp</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Le QR code mène directement à votre vitrine. Le client clique sur un produit et arrive sur WhatsApp pour finaliser l'achat avec vous.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Pas de paiement en ligne → transaction simple et directe</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Best practices */}
        <Card className="mb-12 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Meilleures pratiques pour vendre sur TikTok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">✅ À faire :</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Montrez le produit en action</li>
                  <li>• Parlez du prix et des avantages</li>
                  <li>• Dites "Scannez pour commander"</li>
                  <li>• Mettez le QR visible 5 secondes minimum</li>
                  <li>• Faites des lives pour vendre en direct</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">❌ À éviter :</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• QR code trop petit ou flou</li>
                  <li>• Ne pas mentionner le QR vocalement</li>
                  <li>• Mettre plusieurs QR codes en même temps</li>
                  <li>• Oublier de répondre sur WhatsApp rapidement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Créez votre première vidéo TikTok avec QR code dès aujourd'hui
            </p>
            <Link to={createPageUrl('SubscriptionRequest')}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Créer mon compte vendeur
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}