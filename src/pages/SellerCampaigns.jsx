import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Download, CheckCircle2, Coins } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SellerCampaigns() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['active-campaigns'],
    queryFn: async () => {
      const allCampaigns = await base44.entities.Campaign.list();
      return allCampaigns.filter(c => c.status === 'active');
    }
  });

  const { data: myParticipations = [], isLoading: loadingParticipations } = useQuery({
    queryKey: ['my-participations', user?.email],
    queryFn: () => base44.entities.CampaignParticipation.filter({ seller_email: user.email }),
    enabled: !!user?.email
  });

  const participateMutation = useMutation({
    mutationFn: async ({ campaignId, integrationType }) => {
      return await base44.entities.CampaignParticipation.create({
        campaign_id: campaignId,
        seller_email: user.email,
        seller_name: user.full_name,
        integration_type: integrationType,
        status: 'pending',
        participated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-participations']);
    }
  });

  const hasParticipated = (campaignId) => {
    return myParticipations.some(p => p.campaign_id === campaignId);
  };

  const getTotalEarnings = () => {
    return myParticipations.reduce((sum, p) => sum + (p.earnings || 0), 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔥 Campagnes sponsorisées</h1>
          <p className="text-gray-600">Participez et gagnez jusqu'à 5 € par intégration</p>
        </div>

        {/* Earnings card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mes gains totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalEarnings().toFixed(2)} €</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white">
                {myParticipations.length} participation{myParticipations.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Active campaigns */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Campagnes disponibles</h2>
          {loadingCampaigns ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : campaigns.length === 0 ? (
            <Alert>
              <TrendingUp className="w-4 h-4" />
              <AlertDescription>
                Aucune campagne disponible pour le moment. Revenez bientôt !
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {campaigns.map(campaign => (
                <Card key={campaign.id} className="overflow-hidden">
                  {campaign.product_image && (
                    <img 
                      src={campaign.product_image} 
                      alt={campaign.product_name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{campaign.product_name}</span>
                      <Badge variant="default" className="bg-green-600">
                        {campaign.commission_value} {campaign.commission_type === 'fixed' ? '€' : '%'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{campaign.product_description}</p>
                    
                    {campaign.script_text && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 mb-1">📝 Script suggéré :</p>
                        <p className="text-sm text-blue-800">{campaign.script_text}</p>
                      </div>
                    )}

                    {hasParticipated(campaign.id) ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Vous participez à cette campagne</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => participateMutation.mutate({ 
                          campaignId: campaign.id, 
                          integrationType: 'live' 
                        })}
                        disabled={participateMutation.isPending}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        {participateMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Participation en cours...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Participer maintenant
                          </>
                        )}
                      </Button>
                    )}

                    {campaign.product_link && (
                      <a 
                        href={campaign.product_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block text-center"
                      >
                        Voir le produit →
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* My participations history */}
        {myParticipations.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mon historique</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {myParticipations.map(participation => {
                    const campaign = campaigns.find(c => c.id === participation.campaign_id);
                    return (
                      <div key={participation.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <p className="font-medium">{campaign?.product_name || 'Campagne'}</p>
                          <p className="text-sm text-gray-500">
                            {participation.integration_type} • {new Date(participation.participated_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{participation.earnings || 0} €</p>
                          <Badge variant="outline">{participation.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}