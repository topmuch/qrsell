import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function SubscriptionRequestForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    user_email: "",
    phone: "",
    business_name: "",
    country: "",
    city: "",
    plan_code: "",
    duration_months: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const allPlans = await base44.entities.Plan.list();
      return allPlans.filter(p => p.is_active);
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: (data) => base44.entities.SubscriptionRequest.create(data),
    onSuccess: () => {
      setSubmitted(true);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createRequestMutation.mutate({
      ...formData,
      duration_months: parseInt(formData.duration_months),
      status: "pending"
    });
  };

  const selectedPlan = plans.find(p => p.code === formData.plan_code);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Demande envoyée !</h2>
              <p className="text-gray-600">
                Merci ! Votre demande d'abonnement est en cours de validation par notre équipe. 
                Vous recevrez un email sous 24h avec vos identifiants de connexion.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
                <p className="font-semibold mb-1">📧 Vérifiez votre email</p>
                <p>Nous vous avons envoyé une confirmation à <span className="font-medium">{formData.user_email}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Demande d'abonnement QRSell</CardTitle>
            <CardDescription>
              Remplissez ce formulaire pour accéder à votre vitrine digitale. Notre équipe validera votre demande sous 24h.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Amadou Diallo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_email">Email *</Label>
                  <Input
                    id="user_email"
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                    placeholder="amadou@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+221 77 123 45 67"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name">Nom de la boutique *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Ma Boutique Dakar"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Sénégal"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Dakar"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_code">Choix du forfait *</Label>
                <Select
                  value={formData.plan_code}
                  onValueChange={(value) => setFormData({ ...formData, plan_code: value, duration_months: "" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un forfait" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.code}>
                        {plan.name} {plan.price ? `- ${plan.price} FCFA/mois` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlan && (
                  <p className="text-sm text-gray-600 mt-2">{selectedPlan.description}</p>
                )}
              </div>

              {selectedPlan && (
                <div className="space-y-2">
                  <Label htmlFor="duration_months">Durée souhaitée *</Label>
                  <Select
                    value={formData.duration_months}
                    onValueChange={(value) => setFormData({ ...formData, duration_months: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedPlan.durations_available?.map(duration => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} mois {selectedPlan.price ? `(${duration * selectedPlan.price} FCFA)` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Parlez-nous de votre activité..."
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
                <p className="font-semibold mb-2">📋 Après validation :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Vous recevrez vos identifiants par email</li>
                  <li>Accès immédiat à votre dashboard</li>
                  <li>Instructions de paiement incluses</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={createRequestMutation.isPending}
              >
                {createRequestMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer ma demande"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}