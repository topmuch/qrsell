import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Calendar, Euro, ExternalLink, Users, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Campaigns() {
  // Fetch active campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['public-campaigns'],
    queryFn: async () => {
      const all = await base44.entities.Campaign.list();
      const now = new Date();
      return all.filter(c => 
        c.status === 'active' && 
        new Date(c.start_date) <= now && 
        new Date(c.end_date) >= now
      );
    }
  });

  // Fetch participations for each campaign
  const { data: participations = [] } = useQuery({
    queryKey: ['all-participations'],
    queryFn: () => base44.entities.CampaignParticipation.list()
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-600">CAMPAGNES EN COURS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Découvrez les campagnes sponsorisées
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des marques partenaires recherchent des vendeurs actifs pour promouvoir leurs produits
          </p>
        </div>

        {/* Campaigns grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune campagne active</h2>
              <p className="text-gray-600 mb-6">
                Revenez bientôt pour découvrir de nouvelles opportunités !
              </p>
              <Link to={createPageUrl('SubscriptionRequest')}>
                <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]">
                  Devenir vendeur partenaire
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-all">
                {campaign.product_image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={campaign.product_image} 
                      alt={campaign.product_name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{campaign.product_name}</CardTitle>
                    <Badge className="bg-green-600">
                      {campaign.commission_value} {campaign.commission_type === 'percentage' ? '%' : '€'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{campaign.partner_name}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-700">{campaign.product_description}</p>
                  
                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {participations.filter(p => p.campaign_id === campaign.id && p.status !== 'rejected').length} participants
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {campaign.budget_total?.toLocaleString()} € total
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">
                        {campaign.total_conversions || 0} conversions ({campaign.total_scans > 0 ? ((campaign.total_conversions || 0) / campaign.total_scans * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Jusqu'au {format(new Date(campaign.end_date), 'dd MMMM yyyy', { locale: fr })}</span>
                  </div>

                  {campaign.budget_remaining && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Euro className="w-4 h-4" />
                      <span>Budget restant : {campaign.budget_remaining?.toLocaleString()} €</span>
                    </div>
                  )}

                  {campaign.product_link && (
                    <a 
                      href={campaign.product_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir le produit
                      </Button>
                    </a>
                  )}

                  <Link to={createPageUrl('SellerCampaigns')}>
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Participer à cette campagne
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Vous êtes vendeur ?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Participez aux campagnes et gagnez des revenus supplémentaires
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('SubscriptionRequest')}>
              <Button size="lg" className="bg-white text-[#2563eb] hover:bg-gray-100">
                Devenir vendeur
              </Button>
            </Link>
            <Link to={createPageUrl('SellerCampaigns')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Mes campagnes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}