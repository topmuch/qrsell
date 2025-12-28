import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Trophy, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function SellerStatus({ seller, productsCount, totalScans }) {
  // Calculate progress towards verification
  const accountAge = seller?.created_date 
    ? Math.floor((new Date() - new Date(seller.created_date)) / (1000 * 60 * 60 * 24))
    : 0;

  const criteria = {
    age: accountAge >= 14,
    products: productsCount >= 5,
    scans: totalScans >= 20,
    subscription: seller?.is_subscribed
  };

  const completedCriteria = Object.values(criteria).filter(Boolean).length;
  const progress = (completedCriteria / 4) * 100;

  return (
    <Card className="bg-gradient-to-br from-[#ed477c]/5 to-purple-50/30 border-[#ed477c]/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {seller?.is_verified ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Vendeur vérifié
                </Badge>
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5 text-[#ed477c]" />
                <span className="font-semibold text-gray-900">
                  Statut vendeur
                </span>
              </>
            )}
          </div>
        </div>

        {!seller?.is_verified && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progression vers la vérification
                </span>
                <span className="text-sm font-bold text-[#ed477c]">
                  {completedCriteria}/4
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-2 mb-4">
              <CriteriaItem 
                completed={criteria.age}
                text={`Compte actif ${accountAge >= 14 ? '✓' : `depuis ${accountAge}j (14j requis)`}`}
              />
              <CriteriaItem 
                completed={criteria.products}
                text={`${productsCount} produit${productsCount > 1 ? 's' : ''} ${productsCount >= 5 ? '✓' : '(5 requis)'}`}
              />
              <CriteriaItem 
                completed={criteria.scans}
                text={`${totalScans} scan${totalScans > 1 ? 's' : ''} ${totalScans >= 20 ? '✓' : '(20 requis)'}`}
              />
              <CriteriaItem 
                completed={criteria.subscription}
                text={`Abonnement Pro ${criteria.subscription ? '✓' : '(requis)'}`}
              />
            </div>
          </>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Cette semaine</span>
            <span className="font-semibold text-gray-900">
              {totalScans} interactions
            </span>
          </div>
          
          {!seller?.is_verified && (
            <Button 
              variant="outline" 
              className="w-full mt-3 border-[#ed477c] text-[#ed477c] hover:bg-[#ed477c] hover:text-white group"
            >
              Débloquer le badge vérifié
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CriteriaItem({ completed, text }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
      }`}>
        {completed && '✓'}
      </div>
      <span className={completed ? 'text-gray-900' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  );
}