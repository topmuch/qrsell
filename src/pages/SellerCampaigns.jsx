import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  Download, 
  Euro, 
  Clock, 
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Megaphone
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SellerCampaigns() {
  const [user, setUser] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Fetch active campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns-active'],
    queryFn: async () => {
      const all = await base44.entities.Campaign.list();
      return all.filter(c => c.status === 'active');
    }
  });

  // Fetch user's participations
  const { data: participations = [] } = useQuery({
    queryKey: ['my-participations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.CampaignParticipation.filter({ 
        seller_email: user.email 
      });
    },
    enabled: !!user?.email
  });

  // Participate mutation
  const participateMutation = useMutation({
    mutationFn: async (campaign) => {
      await base44.entities.CampaignParticipation.create({
        campaign_id: campaign.id,
        seller_email: user.email,
        seller_name: user.full_name || user.email,
        integration_type: 'video',
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-participations']);
      setShowSuccessModal(true);
      setSelectedCampaign(null);
    }
  });

  const handleParticipate = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const confirmParticipation = () => {
    if (selectedCampaign) {
      participateMutation.mutate(selectedCampaign);
    }
  };

  const downloadImage = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    link.click();
  };

  const isParticipating = (campaignId) => {
    return participations.some(p => p.campaign_id === campaignId);
  };

  const getParticipation = (campaignId) => {
    return participations.find(p => p.campaign_id === campaignId);
  };

  // Calculate total earnings
  const totalEarnings = participations.reduce((sum, p) => sum + (p.earnings || 0), 0);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campagnes Sponsorisées</h1>
              <p className="text-gray-600">Participez et gagnez de l'argent</p>
            </div>
          </div>

          {/* Earnings Card */}
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Vos gains totaux</p>
                  <p className="text-4xl font-bold">{totalEarnings.toLocaleString()} €</p>
                </div>
                <Euro className="w-12 h-12 text-white/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Campaigns */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🔥 Campagnes disponibles</h2>
          
          {loadingCampaigns ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
            </div>
          ) : campaigns.length === 0 ? (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Aucune campagne disponible pour le moment. Revenez bientôt !
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map(campaign => {
                const participating = isParticipating(campaign.id);
                const participation = getParticipation(campaign.id);
                
                return (
                  <Card key={campaign.id} className={participating ? 'border-green-500 border-2' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2">{campaign.product_name}</CardTitle>
                          <CardDescription>{campaign.partner_name}</CardDescription>
                        </div>
                        {participating && (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Participant
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {campaign.product_image && (
                        <img 
                          src={campaign.product_image} 
                          alt={campaign.product_name}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      )}
                      
                      <p className="text-sm text-gray-600">
                        {campaign.product_description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">
                            {campaign.commission_value} {campaign.commission_type === 'percentage' ? '%' : '€'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-xs">
                            Jusqu'au {format(new Date(campaign.end_date), 'dd MMM', { locale: fr })}
                          </span>
                        </div>
                      </div>

                      {participating ? (
                        <div className="space-y-2">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm font-semibold text-green-800 mb-1">
                              Statut : {participation?.status === 'approved' ? '✅ Approuvé' : '⏳ En attente'}
                            </p>
                            {participation?.earnings > 0 && (
                              <p className="text-sm text-green-700">
                                Gains : {participation.earnings} €
                              </p>
                            )}
                          </div>
                          {campaign.product_image && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => downloadImage(campaign.product_image, `${campaign.product_name}-sponsor.jpg`)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Télécharger l'image
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleParticipate(campaign)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Participer maintenant
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Participation History */}
        {participations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📊 Historique de vos participations</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {participations.map(participation => {
                    const campaign = campaigns.find(c => c.id === participation.campaign_id);
                    return (
                      <div key={participation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{campaign?.product_name || 'Campagne'}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(participation.participated_at || participation.created_date), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={participation.status === 'approved' ? 'success' : 'secondary'}>
                            {participation.status === 'approved' ? 'Approuvé' : 'En attente'}
                          </Badge>
                          {participation.earnings > 0 && (
                            <p className="text-green-600 font-bold mt-1">
                              +{participation.earnings} €
                            </p>
                          )}
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

      {/* Participation Confirmation Dialog */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la participation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Vous allez participer à la campagne <strong>{selectedCampaign.product_name}</strong>.
              </p>
              <Alert>
                <AlertDescription>
                  Après validation de votre participation, vous pourrez télécharger l'image sponsorisée 
                  et l'intégrer dans vos vidéos TikTok.
                </AlertDescription>
              </Alert>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                  Annuler
                </Button>
                <Button 
                  onClick={confirmParticipation}
                  disabled={participateMutation.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {participateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Participation...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                Participation enregistrée !
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Votre participation a été enregistrée avec succès. Un administrateur va examiner 
                votre demande et vous pourrez ensuite télécharger les ressources de la campagne.
              </p>
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full"
              >
                Compris
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}