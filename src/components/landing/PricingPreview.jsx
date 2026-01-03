import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre forfait
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des prix simples et transparents pour tous les vendeurs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
              <CardTitle className="text-2xl text-[#2563eb]">TikTok Starter</CardTitle>
              <p className="text-sm text-gray-500">Idéal pour débuter</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  5 000 <span className="text-lg font-normal text-gray-600">FCFA</span>
                </p>
                <p className="text-gray-500">par mois</p>
              </div>

              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Jusqu'à 30 produits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">QR codes générés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Vitrine personnalisée</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Statistiques de base</span>
                </li>
              </ul>

              <Link to={createPageUrl('DevenirVendeur') + '?plan=starter'}>
                <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]">
                  Choisir Starter
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative overflow-hidden border-2 border-[#2563eb] hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 bg-[#2563eb] text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
              POPULAIRE
            </div>
            <CardHeader className="bg-gradient-to-br from-blue-100 to-purple-50">
              <CardTitle className="text-2xl text-[#2563eb] flex items-center gap-2">
                TikTok Business
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </CardTitle>
              <p className="text-sm text-gray-500">Pour les pros</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  10 000 <span className="text-lg font-normal text-gray-600">FCFA</span>
                </p>
                <p className="text-gray-500">par mois</p>
              </div>

              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Jusqu'à 100 produits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">QR codes TikTok optimisés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Campagnes sponsorisées</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Statistiques avancées</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Support prioritaire</span>
                </li>
              </ul>

              <Link to={createPageUrl('DevenirVendeur') + '?plan=pro'}>
                <Button className="w-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90">
                  Choisir Business
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link to={createPageUrl('DevenirVendeur')}>
            <Button variant="outline" size="lg" className="text-[#2563eb]">
              Voir tous les détails
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}