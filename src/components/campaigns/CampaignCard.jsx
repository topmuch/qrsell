import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Euro, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function CampaignCard({ campaign, onParticipate, hasParticipated = false, showAdminView = false }) {
  const isActive = campaign.status === "active";
  const daysLeft = Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24));
  
  const commissionText = campaign.commission_type === "fixed" 
    ? `${campaign.commission_value} €` 
    : `${campaign.commission_value}% par vente`;

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800"
  };

  const statusLabels = {
    draft: "Brouillon",
    active: "Active",
    paused: "En pause",
    completed: "Terminée"
  };

  return (
    <Card className={`overflow-hidden ${!isActive && 'opacity-75'}`}>
      <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
        {campaign.product_image ? (
          <img 
            src={campaign.product_image} 
            alt={campaign.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TrendingUp className="w-16 h-16 text-indigo-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={statusColors[campaign.status]}>
            {statusLabels[campaign.status]}
          </Badge>
        </div>
        {hasParticipated && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-600 text-white">
              Vous participez
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-1">{campaign.product_name}</CardTitle>
            <p className="text-sm text-gray-600">Par {campaign.partner_name}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-700 line-clamp-2">{campaign.product_description}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Euro className="w-4 h-4 text-green-600" />
            <span className="font-medium">{commissionText}</span>
          </div>

          {campaign.target_location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{campaign.target_location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{daysLeft > 0 ? `${daysLeft}j restants` : 'Terminée'}</span>
          </div>

          {showAdminView && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{campaign.max_participants || '∞'} places</span>
            </div>
          )}
        </div>

        {!showAdminView && isActive && !hasParticipated && (
          <Button 
            onClick={() => onParticipate(campaign)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Participer à cette campagne
          </Button>
        )}

        {hasParticipated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-medium">
              ✓ Vous participez déjà à cette campagne
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}