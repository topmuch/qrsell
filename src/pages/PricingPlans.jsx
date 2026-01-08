import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { Check, Sparkles, Loader2, X, Store } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

export default function PricingPlans() {
  // SEO Configuration
  const pricingSEO = {
    title: "Forfaits ShopQR – Boutique QR dès 5 000 FCFA/mois | TikTok Commerce",
    description: "Comparez nos forfaits : Mini-boutique à 5 000 FCFA, TikTok Pro à 7 500 FCFA. Créez votre boutique QR code, vendez sur WhatsApp et TikTok Live. Sans engagement.",
    keywords: "forfait boutique QR, prix QR code commerce, abonnement vente TikTok, tarif e-commerce Afrique, mini-boutique prix, vendre sur WhatsApp tarif",
    canonicalUrl: "https://shopqr.pro/PricingPlans"
  };
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans-public'],
    queryFn: async () => {
      const allPlans = await base44.entities.Plan.list();
      return allPlans.filter(p => p.is_active).sort((a, b) => a.price - b.price);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C4AB6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16 px-4">
      {/* SEO Head */}
      <SEOHead 
        title={pricingSEO.title}
        description={pricingSEO.description}
        keywords={pricingSEO.keywords}
        canonicalUrl={pricingSEO.canonicalUrl}
      />
      
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <Badge className="bg-[#6C4AB6] mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            FORFAITS
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Forfaits boutique QR – Tarifs e-commerce Afrique
          </h1>
          <h2 className="text-xl text-gray-600 max-w-2xl mx-auto">
            Que vous vendiez sur TikTok ou non, nous avons une solution pour vous. Dès 5 000 FCFA/mois.
          </h2>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isPro = plan.code === 'pro';
            const isMini = plan.code === 'mini';
            
            return (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  isPro ? 'border-2 border-purple-500' : 'border-2 border-gray-200'
                }`}
              >
                {isPro && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                    POPULAIRE
                  </div>
                )}
                {isMini && (
                  <div className="absolute top-0 right-0 bg-gray-900 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                    SIMPLE
                  </div>
                )}
                
                <CardHeader className={`${
                  isPro ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 
                  isMini ? 'bg-gradient-to-br from-gray-50 to-white' :
                  'bg-gradient-to-br from-blue-50 to-white'
                } border-b`}>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    {plan.name}
                    {isPro && <Sparkles className="w-5 h-5 text-purple-500" />}
                    {isMini && <Store className="w-5 h-5 text-gray-600" />}
                  </CardTitle>
                  <p className="text-sm text-gray-500">Code: {plan.code}</p>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <p className="text-4xl font-bold text-gray-900">
                      {plan.price?.toLocaleString('fr-FR')} <span className="text-xl font-normal text-gray-600">FCFA</span>
                    </p>
                    <p className="text-gray-500">par mois</p>
                  </div>

                  {isMini && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 text-center">
                        💡 Pas de TikTok ? Pas de problème.
                      </p>
                    </div>
                  )}

                  <p className="text-gray-600">{plan.description}</p>

                  <div className="space-y-2">
                    <p className="font-semibold text-gray-700 text-sm">Inclus :</p>
                    <ul className="space-y-2">
                      {(plan.features || []).map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isMini && (
                    <div className="space-y-2 pt-3 border-t">
                      <p className="font-semibold text-gray-700 text-sm">Non inclus :</p>
                      <ul className="space-y-2">
                        {['Mode Live TikTok', 'QR codes dynamiques', 'Offres flash', 'Alertes de tendances'].map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-500 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link to={createPageUrl('Onboarding') + `?plan=${plan.code}`}>
                    <Button className={`w-full text-lg py-6 ${
                      isPro ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90' :
                      isMini ? 'bg-gray-900 hover:bg-gray-800' :
                      'bg-[#2563eb] hover:bg-[#1d4ed8]'
                    } text-white`}>
                      Choisir ce forfait
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Besoin d'aide pour choisir ? Contactez-nous
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to={createPageUrl('Demo')}>
              <Button variant="outline">Essayer la démo</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}