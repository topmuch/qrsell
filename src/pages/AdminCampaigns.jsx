import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Users, TrendingUp, DollarSign, Eye, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CampaignForm from "../components/campaigns/CampaignForm";
import CampaignCard from "../components/campaigns/CampaignCard";

export default function AdminCampaignsPage() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.role !== 'admin') {
        window.location.href = '/';
      }
    };
    checkAuth();
  }, []);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date'),
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['campaignParticipations'],
    queryFn: () => base44.entities.CampaignParticipation.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
      setShowForm(false);
      setEditingCampaign(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
      setShowForm(false);
      setEditingCampaign(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Campaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
    },
  });

  const handleSubmit = (data) => {
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      deleteMutation.mutate(id);
    }
  };

  // Calculer les statistiques globales
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget_total || 0), 0);
  const totalParticipants = participations.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  // Obtenir les participations pour une campagne
  const getCampaignParticipations = (campaignId) => {
    return participations.filter(p => p.campaign_id === campaignId);
  };

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
        {/* En-tête avec stats */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Campagnes
              </h1>
              <p className="text-gray-600">
                Gérez les campagnes de placement de produit
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingCampaign(null);
                setShowForm(!showForm);
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle campagne
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Campagnes actives</p>
                    <p className="text-2xl font-bold text-gray-900">{activeCampaigns}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total campagnes</p>
                    <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-indigo-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Budget total</p>
                    <p className="text-2xl font-bold text-gray-900">{totalBudget.toFixed(0)} €</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Participants</p>
                    <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
                  </div>
                  <Users className="w-10 h-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Formulaire */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <CampaignForm
                campaign={editingCampaign}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCampaign(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des campagnes */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucune campagne créée</p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
              >
                Créer la première campagne
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const campaignParticipations = getCampaignParticipations(campaign.id);
              
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <CampaignCard 
                        campaign={campaign} 
                        showAdminView={true}
                      />
                      
                      <div className="p-4 border-t bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{campaignParticipations.length} participants</span>
                          </div>
                          <Badge variant="outline">
                            {campaign.budget_remaining?.toFixed(0) || 0}€ restants
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(campaign)}
                            className="flex-1"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(campaign.id)}
                            className="flex-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}