import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function SubscriptionRequestForm() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [isEditMode, setIsEditMode] = React.useState(false);

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

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Check if edit mode
        const urlParams = new URLSearchParams(window.location.search);
        const editMode = urlParams.get('edit') === 'true';
        const currentPlan = urlParams.get('current_plan');

        setIsEditMode(editMode);

        if (editMode && currentUser) {
          // Pre-fill with current user data
          const sellers = await base44.entities.Seller.filter({ created_by: currentUser.email });
          const seller = sellers[0];

          setFormData({
            full_name: seller?.full_name || currentUser.full_name || "",
            user_email: currentUser.email,
            phone: seller?.whatsapp_number || "",
            business_name: seller?.shop_name || "",
            country: "",
            city: "",
            plan_code: currentPlan || "",
            duration_months: "",
            message: "Demande de modification d'abonnement"
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const allPlans = await base44.entities.Plan.list();
      return allPlans.filter(p => p.is_active);
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      try {
        // Check if user has existing subscription (edit mode)
        if (isEditMode && user) {
          const existingSubs = await base44.entities.Subscription.filter({ 
            user_email: user.email,
            is_active: true 
          });

          if (existingSubs.length > 0) {
            // Create a request for modification, not a new subscription
            data.message = `Modification d'abonnement demandée. Forfait actuel: ${existingSubs[0].plan_code}. Nouveau forfait souhaité: ${data.plan_code} pour ${data.duration_months} mois.`;
          }
        }

        const request = await base44.entities.SubscriptionRequest.create(data);
        
        // Envoyer email de confirmation
        try {
          await base44.integrations.Core.SendEmail({
            to: data.user_email,
            subject: '✅ Votre demande d\'abonnement QRSell',
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Merci pour votre demande !</h2>
                <p>Bonjour ${data.full_name},</p>
                <p>Nous avons bien reçu votre demande d'abonnement pour <strong>${data.business_name}</strong>.</p>
                <p>Notre équipe la validera manuellement sous <strong>24 heures</strong>.</p>
                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>📋 Récapitulatif de votre demande :</strong></p>
                  <ul style="margin-top: 10px;">
                    <li>Boutique : ${data.business_name}</li>
                    <li>Durée : ${data.duration_months} mois</li>
                    <li>Localisation : ${data.city}, ${data.country}</li>
                  </ul>
                </div>
                <p>En attendant, découvrez comment utiliser QRSell avec TikTok :</p>
                <p><a href="${window.location.origin}${createPageUrl('TikTokGuidePublic')}" style="color: #2563eb; text-decoration: none; font-weight: bold;">📖 Consulter le Guide TikTok</a></p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Vous recevrez un nouvel email dès que votre compte sera activé.
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                  L'équipe QRSell
                </p>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Ne pas bloquer l'inscription si l'email échoue
        }
        
        return request;
      } catch (error) {
        console.error('Error creating subscription request:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Rediriger vers Home avec paramètre de succès
      navigate(createPageUrl('Home') + '?signup_success=true');
    },
    onError: (error) => {
      alert('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
      console.error(error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.plan_code || !formData.duration_months) {
      alert('Veuillez sélectionner un forfait et une durée');
      return;
    }
    
    createRequestMutation.mutate({
      ...formData,
      duration_months: parseInt(formData.duration_months),
      status: "pending"
    });
  };

  const selectedPlan = plans.find(p => p.code === formData.plan_code);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              {isEditMode ? 'Modifier mon abonnement' : 'Demande d\'abonnement ShopQR'}
            </CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Choisissez votre nouveau forfait et la durée souhaitée. Notre équipe traitera votre demande sous 24h.'
                : 'Remplissez ce formulaire pour accéder à votre vitrine digitale. Notre équipe validera votre demande sous 24h.'
              }
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
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {month} mois {selectedPlan.price ? `(${month * selectedPlan.price} FCFA)` : ""}
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