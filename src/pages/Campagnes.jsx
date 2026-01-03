import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { 
  Megaphone, 
  TrendingUp, 
  Euro, 
  Calendar, 
  ExternalLink, 
  Loader2,
  Sparkles 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Campagnes() {
  // Fetch active campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['public-campaigns'],
    queryFn: async () => {
      const allCampaigns = await base44.entities.Campaign.list();
      const now = new Date();
      return allCampaigns.filter(c => 
        c.status === 'active' && 
        new Date(c.start_date) <= now && 
        new Date(c.end_date) >= now
      );
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-2 mb-4">
            <Megaphone className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">CAMPAGNES ACTIVES</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Découvrez les campagnes en cours
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Participez aux campagnes sponsorisées et gagnez de l'argent en promouvant des produits sur TikTok
          </p>
        </div>

        {campaigns.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune campagne active</h2>
              <p className="text-gray-600 mb-6">
                Les campagnes sponsorisées apparaîtront ici. Revenez bientôt !
              </p>
              <Link to={createPageUrl('DevenirVendeur')}>
                <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]">
                  Devenir vendeur partenaire
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{campaigns.length}</p>
                  <p className="text-green-100">Campagnes actives</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <CardContent className="pt-6">
                  <Euro className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">
                    {campaigns.reduce((sum, c) => sum + (c.budget_remaining || 0), 0).toLocaleString()}€
                  </p>
                  <p className="text-purple-100">Budget total disponible</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <CardContent className="pt-6">
                  <Sparkles className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">Jusqu'à 5€</p>
                  <p className="text-blue-100">Par intégration</p>
                </CardContent>
              </Card>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                  {campaign.product_image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={campaign.product_image} 
                        alt={campaign.product_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 text-white">
                          {campaign.commission_value} {campaign.commission_type === 'fixed' ? '€' : '%'}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-xl">{campaign.product_name}</CardTitle>
                    <p className="text-sm text-gray-500">{campaign.partner_name}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {campaign.product_description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Euro className="w-4 h-4" />
                        <span>Budget restant : {campaign.budget_remaining?.toLocaleString() || 0}€</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Jusqu'au {format(new Date(campaign.end_date), 'dd MMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
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
                      
                      <Link to={createPageUrl('DevenirVendeur')}>
                        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Participer à cette campagne
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        {campaigns.length > 0 && (
          <Card className="mt-16 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Prêt à gagner de l'argent ?</h2>
              <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                Inscrivez-vous comme vendeur et commencez à participer aux campagnes sponsorisées dès aujourd'hui
              </p>
              <Link to={createPageUrl('DevenirVendeur')}>
                <Button size="lg" className="bg-white text-[#2563eb] hover:bg-gray-100 text-lg px-8 py-6">
                  <Megaphone className="w-5 h-5 mr-2" />
                  Devenir vendeur partenaire
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}