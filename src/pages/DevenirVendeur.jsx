import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { Check, Sparkles, TrendingUp, Loader2, ArrowRight } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

export default function DevenirVendeur() {
  // SEO Configuration
  const vendeurSEO = {
    title: "Devenir vendeur ShopQR – Créez votre boutique QR Code dès 5 000 FCFA",
    description: "Inscrivez-vous comme vendeur ShopQR. Créez votre boutique en ligne avec QR codes, vendez sur TikTok Live et WhatsApp. Sans site web, sans compétences techniques.",
    keywords: "devenir vendeur QR code, créer boutique en ligne Afrique, vendre sur TikTok, inscription vendeur ShopQR, commerce WhatsApp Sénégal, boutique digitale",
    canonicalUrl: "https://shopqr.pro/DevenirVendeur"
  };
  // Get available plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans-public'],
    queryFn: async () => {
      const allPlans = await base44.entities.Plan.list();
      return allPlans.filter(p => p.is_active);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const miniPlan = plans.find(p => p.code === 'mini') || {
    name: 'Mini-boutique',
    code: 'mini',
    price: 5000,
    description: 'Une vitrine simple sans TikTok',
    features: [
      "Jusqu'à 20 produits actifs",
      "Vitrine en ligne publique",
      "QR codes produits basiques",
      "Téléchargement catalogue PDF",
      "Support par email"
    ]
  };

  const starterPlan = plans.find(p => p.code === 'starter') || {
    name: 'TikTok Starter',
    code: 'starter',
    price: 5000,
    description: 'Idéal pour les nouveaux vendeurs TikTok',
    features: [
      "Jusqu'à 30 produits actifs",
      "Mode Live TikTok",
      "QR codes dynamiques",
      "Promotions flash",
      "Statistiques en temps réel"
    ]
  };

  const proPlan = plans.find(p => p.code === 'pro') || {
    name: 'TikTok Pro',
    code: 'pro',
    price: 10000,
    description: 'Pour les vendeurs TikTok confirmés',
    features: [
      "Jusqu'à 100 produits actifs",
      "3 boutiques",
      "Alertes de tendances",
      "Campagnes sponsorisées",
      "Support prioritaire"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16 px-4">
      {/* SEO Head */}
      <SEOHead 
        title={vendeurSEO.title}
        description={vendeurSEO.description}
        keywords={vendeurSEO.keywords}
        canonicalUrl={vendeurSEO.canonicalUrl}
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <Badge className="bg-[#2563eb] mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            DEVENIR VENDEUR
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Créez votre boutique QR Code
          </h1>
          <h2 className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vendez sur TikTok Live et WhatsApp dès 5 000 FCFA/mois. Sans site web, sans compétences techniques.
          </h2>
        </header>

        {/* Redirect to full pricing page */}
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = createPageUrl('PricingPlans')}
            className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] hover:opacity-90 text-white text-lg px-8 py-6"
          >
            Voir tous les forfaits
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Quick overview */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          {/* Starter Plan */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-white border-b">
              <CardTitle className="text-2xl text-[#2563eb]">{starterPlan.name}</CardTitle>
              <p className="text-sm text-gray-500">Code: {starterPlan.code}</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {starterPlan.price?.toLocaleString('fr-FR') || '5 000'} <span className="text-xl font-normal text-gray-600">FCFA</span>
                </p>
                <p className="text-gray-500">par mois</p>
              </div>

              <p className="text-gray-600">{starterPlan.description}</p>

              <ul className="space-y-3">
                {(starterPlan.features || []).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={createPageUrl('Onboarding') + '?plan=starter'}>
                <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-lg py-6">
                  Choisir ce forfait
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative overflow-hidden border-2 border-[#2563eb] hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 bg-[#2563eb] text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
              POPULAIRE
            </div>
            <CardHeader className="bg-gradient-to-br from-blue-100 to-purple-50 border-b">
              <CardTitle className="text-2xl text-[#2563eb] flex items-center gap-2">
                {proPlan.name}
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </CardTitle>
              <p className="text-sm text-gray-500">Code: {proPlan.code}</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {proPlan.price?.toLocaleString('fr-FR') || '10 000'} <span className="text-xl font-normal text-gray-600">FCFA</span>
                </p>
                <p className="text-gray-500">par mois</p>
              </div>

              <p className="text-gray-600">{proPlan.description}</p>

              <ul className="space-y-3">
                {(proPlan.features || []).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={createPageUrl('Onboarding') + '?plan=pro'}>
                <Button className="w-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90 text-white text-lg py-6">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Choisir ce forfait
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Besoin d'aide pour choisir ? Contactez-nous sur WhatsApp
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to={createPageUrl('TikTokGuidePublic')}>
              <Button variant="outline">
                Voir le guide TikTok
              </Button>
            </Link>
            <Link to={createPageUrl('Demo')}>
              <Button variant="outline">
                Essayer la démo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}