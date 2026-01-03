import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

const plans = [
  {
    code: 'starter',
    name: 'TikTok',
    subtitle: 'Pour les nouveaux vendeurs et micro-entrepreneurs',
    price: '5 000',
    priceCode: '12345674',
    currency: 'FCFA/mois',
    popular: false,
    features: [
      'Jusqu\'à 30 produits actifs',
      'Vitrine en ligne partageable',
      'QR codes illimités',
      'Redirection WhatsApp automatique',
      'Support par email',
      'Statistiques de base'
    ]
  },
  {
    code: 'pro',
    name: 'TikTok Business',
    subtitle: 'Pour les vendeurs actifs et boutiques établies',
    price: '10 000',
    priceCode: '12345678',
    currency: 'FCFA/mois',
    popular: true,
    features: [
      'Jusqu\'à 100 produits actifs',
      'QR codes TikTok optimisés',
      'Personnalisation avancée',
      'Badge "Vendeur Vérifié"',
      'Statistiques détaillées',
      'Support prioritaire',
      'Accès aux campagnes sponsorisées'
    ]
  }
];

export default function PlansSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">TARIFS TRANSPARENTS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre forfait
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des prix simples, pas de frais cachés. Commencez dès aujourd'hui.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden h-full ${
                plan.popular ? 'border-2 border-[#2563eb] shadow-xl' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-[#2563eb] text-white px-4 py-1 rounded-bl-lg rounded-tr-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      POPULAIRE
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-bold text-[#2563eb] mb-2">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mb-4">Code: {plan.priceCode}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-lg text-gray-600 ml-2">{plan.currency}</span>
                    <p className="text-xs text-gray-500 mt-1">≈ {parseInt(plan.price.replace(/\s/g, '')) / 600} €/mois</p>
                  </div>
                  <p className="text-sm text-gray-600">{plan.subtitle}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={`${createPageUrl('SubscriptionRequest')}?plan=${plan.code}`} className="block">
                    <Button 
                      className={`w-full py-6 text-lg ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90' 
                          : 'bg-gray-800 hover:bg-gray-900'
                      }`}
                    >
                      Choisir {plan.name}
                    </Button>
                  </Link>

                  <p className="text-center text-xs text-gray-500">
                    Sans engagement • Annulation à tout moment
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            Besoin d'un forfait personnalisé pour votre entreprise ?
          </p>
          <Link to={createPageUrl('SubscriptionRequest')}>
            <Button variant="outline" size="lg">
              Contactez-nous
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}