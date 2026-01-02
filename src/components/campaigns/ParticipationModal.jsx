import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Video, Radio, BookOpen, User, Check } from "lucide-react";

export default function ParticipationModal({ campaign, onConfirm, onCancel, sellerInfo }) {
  const [integrationType, setIntegrationType] = useState("live");
  const [agreed, setAgreed] = useState(false);

  const integrationTypes = [
    { value: "live", label: "Live TikTok/Instagram", icon: Radio, description: "Mentionnez le produit durant votre live" },
    { value: "video", label: "Vidéo TikTok/Reel", icon: Video, description: "Intégrez le produit dans une vidéo" },
    { value: "story", label: "Story Instagram", icon: BookOpen, description: "Partagez le produit en story" },
    { value: "bio", label: "Lien dans la bio", icon: User, description: "Ajoutez le lien dans votre bio" }
  ];

  const handleConfirm = () => {
    if (!agreed) {
      alert("Veuillez accepter les conditions de participation");
      return;
    }
    onConfirm({ integrationType, campaign_id: campaign.id });
  };

  const commissionText = campaign.commission_type === "fixed"
    ? `${campaign.commission_value} €`
    : `${campaign.commission_value}% par vente`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Participer à la campagne</CardTitle>
          <p className="text-sm text-gray-600 mt-2">{campaign.product_name} - {campaign.partner_name}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informations sur la campagne */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="font-semibold text-indigo-900 mb-2">💰 Rémunération</h3>
            <p className="text-2xl font-bold text-indigo-700">{commissionText}</p>
          </div>

          {/* Type d'intégration */}
          <div className="space-y-3">
            <Label>Comment souhaitez-vous intégrer ce produit ? *</Label>
            <div className="grid grid-cols-1 gap-3">
              {integrationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setIntegrationType(type.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      integrationType === type.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-1 ${
                        integrationType === type.value ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Script suggéré */}
          {campaign.script_text && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">📝 Script suggéré</h3>
              <p className="text-sm text-gray-700 italic">"{campaign.script_text}"</p>
            </div>
          )}

          {/* Ressources */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">📦 Ressources disponibles</h3>
            <div className="grid grid-cols-1 gap-2">
              {campaign.product_image && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(campaign.product_image, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger l'image du produit
                </Button>
              )}
              {campaign.product_link && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(campaign.product_link, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Voir le lien du produit
                </Button>
              )}
            </div>
          </div>

          {/* Conditions */}
          <div className="border-t pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                J'accepte de promouvoir ce produit selon les conditions définies et je m'engage à respecter 
                les directives de la campagne. Je comprends que ma rémunération sera versée après validation 
                de ma participation.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!agreed}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmer ma participation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}