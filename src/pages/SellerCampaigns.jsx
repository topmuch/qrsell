import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, CheckCircle2, Clock } from "lucide-react";
import CampaignCard from "../components/campaigns/CampaignCard";
import ParticipationModal from "../components/campaigns/ParticipationModal";

export default function SellerCampaignsPage() {
  const [user, setUser] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['activeCampaigns'],
    queryFn: async () => {
      const allCampaigns = await base44.entities.Campaign.list('-created_date');
      // Filtrer seulement les campagnes actives
      return allCampaigns.filter(c => c.status === 'active');
    },
  });

  const { data: myParticipations = [] } = useQuery({
    queryKey: ['myParticipations', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const allParticipations = await base44.entities.CampaignParticipation.list();
      return allParticipations.filter(p => p.seller_email === user.email);
    },
    enabled: !!user,
  });

  const participateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.CampaignParticipation.create({
        campaign_id: data.campaign_id,
        seller_email: user.email,
        seller_name: user.full_name || user.email,
        integration_type: data.integrationType,
        status: 'pending',
        earnings: 0,
        participated_at: new Date().toISOString(),
        scans_generated: 0,
        conversions: 0,
        payment_status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myParticipations']);
      setShowParticipationModal(false);
      setSelectedCampaign(null);
    },
  });

  const handleParticipate = (campaign) => {
    setSelectedCampaign(campaign);
    setShowParticipationModal(true);
  };

  const handleConfirmParticipation = (data) => {
    participateMutation.mutate(data);
  };

  // Vérifier si l'utilisateur participe déjà à une campagne
  const hasParticipated = (campaignId) => {
    return myParticipations.some(p => p.campaign_id === campaignId);
  };

  // Calculer les gains totaux
  const totalEarnings = myParticipations.reduce((sum, p) => sum + (p.earnings || 0), 0);
  const pendingEarnings = myParticipations
    .filter(p => p.payment_status === 'pending')
    .reduce((sum, p) => sum + (p.earnings || 0), 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Campagnes disponibles
          </h1>
          <p className="text-gray-600">
            Participez aux campagnes de placement de produit et gagnez de l'argent
          </p>
        </div>

        {/* Statistiques du vendeur */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mes participations</p>
                  <p className="text-2xl font-bold text-gray-900">{myParticipations.length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gains totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEarnings.toFixed(2)} €</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">En attente</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingEarnings.toFixed(2)} €</p>
                </div>
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des campagnes */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Campagnes actives</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune campagne disponible pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onParticipate={handleParticipate}
                  hasParticipated={hasParticipated(campaign.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mes participations */}
        {myParticipations.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mes participations</h2>
            <div className="space-y-4">
              {myParticipations.map((participation) => {
                const campaign = campaigns.find(c => c.id === participation.campaign_id);
                
                const statusColors = {
                  pending: "bg-yellow-100 text-yellow-800",
                  approved: "bg-green-100 text-green-800",
                  rejected: "bg-red-100 text-red-800",
                  completed: "bg-blue-100 text-blue-800"
                };

                const statusLabels = {
                  pending: "En attente",
                  approved: "Approuvée",
                  rejected: "Rejetée",
                  completed: "Terminée"
                };

                return (
                  <Card key={participation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {campaign?.product_name || 'Campagne supprimée'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {campaign?.partner_name || ''}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge className={statusColors[participation.status]}>
                              {statusLabels[participation.status]}
                            </Badge>
                            <Badge variant="outline">
                              {participation.integration_type}
                            </Badge>
                            {participation.earnings > 0 && (
                              <Badge className="bg-green-100 text-green-800">
                                +{participation.earnings.toFixed(2)} €
                              </Badge>
                            )}
                          </div>
                        </div>

                        {participation.status === 'approved' && (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal de participation */}
        {showParticipationModal && selectedCampaign && (
          <ParticipationModal
            campaign={selectedCampaign}
            sellerInfo={user}
            onConfirm={handleConfirmParticipation}
            onCancel={() => {
              setShowParticipationModal(false);
              setSelectedCampaign(null);
            }}
          />
        )}
      </div>
    </div>
  );
}