import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

export default function SubscriptionStatus({ user }) {
  const navigate = useNavigate();

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['user-subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ user_email: user?.email });
      return subs.filter(sub => sub.is_active);
    },
    enabled: !!user?.email
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const allPlans = await base44.entities.Plan.list();
      return allPlans.filter(p => p.is_active);
    }
  });

  const activeSubscription = subscriptions[0];
  const plan = plans.find(p => p.code === activeSubscription?.plan_code);

  if (!activeSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucun abonnement actif</p>
        </CardContent>
      </Card>
    );
  }

  const endDate = new Date(activeSubscription.end_date);
  const daysRemaining = differenceInDays(endDate, new Date());
  const isExpiringSoon = daysRemaining <= 7;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>Mon abonnement</CardTitle>
          <Badge 
            className={
              isExpiringSoon 
                ? 'bg-orange-100 text-orange-700 border-orange-200' 
                : 'bg-green-100 text-green-700 border-green-200'
            }
          >
            {activeSubscription.is_active ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Forfait</p>
              <p className="font-semibold text-gray-900">
                {plan?.name || activeSubscription.plan_code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Valable jusqu'au</p>
              <p className="font-semibold text-gray-900">
                {format(endDate, 'dd MMMM yyyy', { locale: fr })}
              </p>
              <p className={`text-xs mt-0.5 ${isExpiringSoon ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                {daysRemaining > 0 
                  ? `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
                  : 'Expiré'
                }
              </p>
            </div>
          </div>

          {activeSubscription.payment_method && (
            <div className="text-sm">
              <p className="text-gray-500">Mode de paiement</p>
              <p className="font-medium text-gray-900">{activeSubscription.payment_method}</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={() => navigate(createPageUrl('SubscriptionRequest') + `?edit=true&current_plan=${activeSubscription.plan_code}`)}
            className="w-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Modifier l'abonnement
          </Button>
        </div>

        {isExpiringSoon && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              ⚠️ Votre abonnement expire bientôt. Renouvelez-le pour continuer à utiliser QRSell.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}