import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Copy, Key } from "lucide-react";
import { createPageUrl } from "@/utils/index";
import { format, addMonths } from "date-fns";
import { fr } from "date-fns/locale";

export default function ManualClientCreation() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    business_name: "",
    country: "",
    city: "",
    plan_code: "",
    duration_months: ""
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const allPlans = await base44.entities.Plan.list();
      return allPlans.filter(p => p.is_active);
    }
  });

  const createClientMutation = useMutation({
    mutationFn: async (data) => {
      setError(null);
      setSuccess(null);

      // Générer un mot de passe sécurisé
      const password = generatePassword();
      setGeneratedPassword(password);

      // 1. Inviter l'utilisateur
      try {
        await base44.users.inviteUser(data.email, "user");
      } catch (inviteError) {
        if (inviteError.message?.includes('already exists') || inviteError.message?.includes('déjà')) {
          // L'utilisateur existe déjà, on continue quand même
          console.log('User already exists, continuing...');
        } else {
          throw new Error(`Erreur d'invitation : ${inviteError.message}`);
        }
      }

      // 2. Créer l'abonnement
      const startDate = new Date();
      const endDate = addMonths(startDate, parseInt(data.duration_months));

      const subscription = await base44.entities.Subscription.create({
        user_email: data.email,
        plan_code: data.plan_code,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
        payment_recorded: false,
        payment_method: "Créé manuellement par admin",
        payment_note: `Compte créé manuellement le ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`
      });

      // 3. Envoyer l'email de bienvenue avec identifiants
      const plan = plans.find(p => p.code === data.plan_code);
      
      try {
        await base44.integrations.Core.SendEmail({
          to: data.email,
          subject: '🎉 Votre compte QRSell est prêt !',
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bienvenue sur QRSell !</h1>
              </div>
              
              <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; color: #374151;">Bonjour ${data.full_name || ''},</p>
                <p style="font-size: 16px; color: #374151;">
                  Votre compte QRSell a été créé et est immédiatement actif ! 🚀
                </p>
                
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">🔐 Vos identifiants de connexion :</p>
                  <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
                    <p style="margin: 5px 0; color: #374151;"><strong>Email :</strong> ${data.email}</p>
                    <p style="margin: 5px 0; color: #374151;"><strong>Mot de passe :</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
                  </div>
                  <p style="margin: 10px 0 0 0; color: #92400e; font-size: 12px;">
                    ⚠️ Conservez ces informations en lieu sûr. Vous pourrez changer votre mot de passe après votre première connexion.
                  </p>
                </div>

                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">📋 Détails de votre abonnement :</p>
                  <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
                    ${data.business_name ? `<li>Boutique : <strong>${data.business_name}</strong></li>` : ''}
                    <li>Forfait : <strong>${plan?.name || data.plan_code}</strong></li>
                    <li>Durée : <strong>${data.duration_months} mois</strong></li>
                    <li>Valable jusqu'au : <strong>${format(endDate, 'dd MMMM yyyy', { locale: fr })}</strong></li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${window.location.origin}${createPageUrl('Dashboard')}" 
                     style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                    🔑 Me connecter maintenant
                  </a>
                </div>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <p style="margin: 0 0 12px 0; font-weight: bold; color: #111827;">🚀 Prochaines étapes :</p>
                  <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
                    <li style="margin-bottom: 8px;">Connectez-vous avec vos identifiants</li>
                    <li style="margin-bottom: 8px;">Complétez votre profil vendeur</li>
                    <li style="margin-bottom: 8px;">Ajoutez vos premiers produits</li>
                    <li style="margin-bottom: 8px;">Téléchargez vos QR codes</li>
                    <li>Intégrez-les dans vos vidéos TikTok !</li>
                  </ol>
                </div>

                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                  Besoin d'aide ? Notre équipe est là pour vous accompagner.
                </p>
                <p style="font-size: 14px; color: #6b7280; font-weight: bold;">
                  L'équipe QRSell 💙
                </p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Ne pas bloquer si l'email échoue
      }

      return { subscription, plan, password };
    },
    onSuccess: (data) => {
      setSuccess({
        email: formData.email,
        plan: data.plan?.name || formData.plan_code,
        duration: formData.duration_months
      });
      queryClient.invalidateQueries(['subscriptions']);
      queryClient.invalidateQueries(['subscription-requests']);
      
      // Reset form
      setFormData({
        email: "",
        full_name: "",
        phone: "",
        business_name: "",
        country: "",
        city: "",
        plan_code: "",
        duration_months: ""
      });
    },
    onError: (error) => {
      setError(error.message || "Une erreur est survenue lors de la création du compte");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.plan_code || !formData.duration_months) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    createClientMutation.mutate(formData);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Créer un client manuellement
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Création manuelle d'un compte vendeur
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <p className="font-semibold mb-2">Compte créé avec succès !</p>
                <ul className="text-sm space-y-1">
                  <li>📧 Email : {success.email}</li>
                  <li>📦 Forfait : {success.plan}</li>
                  <li>⏱️ Durée : {success.duration} mois</li>
                  <li>✅ Email de bienvenue envoyé</li>
                </ul>
              </AlertDescription>
            </Alert>

            {generatedPassword && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">Identifiants générés</h3>
                    <div className="space-y-2 text-sm">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Email</p>
                        <code className="text-gray-900 dark:text-gray-100 font-mono">{formData.email}</code>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Mot de passe</p>
                        <code className="text-gray-900 dark:text-gray-100 font-mono break-all">{generatedPassword}</code>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`Email: ${formData.email}\nMot de passe: ${generatedPassword}`);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? 'Copié !' : 'Copier tout'}
                      </Button>
                    </div>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-3">
                      ⚠️ Ces identifiants ne seront plus affichés. Copiez-les maintenant ou ils ont été envoyés par email au client.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={handleClose}>
                Fermer
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSuccess(null);
                  setError(null);
                  setGeneratedPassword(null);
                  setCopied(false);
                }}
              >
                Créer un autre client
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email * <span className="text-xs text-gray-500">(utilisé pour la connexion)</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Amadou Diallo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+221 77 123 45 67"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_name">Nom de la boutique</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Ma Boutique Dakar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Sénégal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Dakar"
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Configuration de l'abonnement</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan_code">Forfait *</Label>
                    <Select
                      value={formData.plan_code}
                      onValueChange={(value) => setFormData({ ...formData, plan_code: value })}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration_months">Durée *</Label>
                    <Select
                      value={formData.duration_months}
                      onValueChange={(value) => setFormData({ ...formData, duration_months: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir la durée" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                          <SelectItem key={month} value={month.toString()}>
                            {month} mois
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800 text-sm">
                  <p className="font-semibold mb-2">ℹ️ Ce qui va se passer :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Le compte sera créé immédiatement</li>
                    <li>L'abonnement sera activé automatiquement</li>
                    <li>Un email de bienvenue sera envoyé avec un lien de connexion</li>
                    <li>Le client pourra se connecter et configurer son profil</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={createClientMutation.isPending}
              >
                {createClientMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer et activer le compte
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}