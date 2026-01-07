import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, Eye, Mail, Copy, Send, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { createPageUrl } from '@/utils/index';
import moment from 'moment';

export default function SubscriptionRequestManagement() {
  const [filter, setFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [actionData, setActionData] = useState({
    plan_code: "",
    duration_months: "",
    rejection_reason: ""
  });

  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: ['subscription-requests', filter],
    queryFn: async () => {
      const allRequests = await base44.entities.SubscriptionRequest.list('-created_date');
      return filter === 'all' 
        ? allRequests 
        : allRequests.filter(r => r.status === filter);
    }
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list()
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubscriptionRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription-requests']);
      setShowDialog(false);
      setSelectedRequest(null);
    }
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: (data) => base44.entities.Subscription.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
    }
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleApprove = async (request) => {
    const user = await base44.auth.me();
    const password = generatePassword();
    
    const startDate = moment.utc();
    const endDate = moment.utc().add(parseInt(actionData.duration_months || request.duration_months), 'months');

    const plan = plans.find(p => p.code === (actionData.plan_code || request.plan_code));

    try {
      // 1. Inviter l'utilisateur
      try {
        await base44.users.inviteUser(request.user_email, "user");
      } catch (inviteError) {
        if (!inviteError.message?.includes('already exists')) {
          throw inviteError;
        }
      }

      // 2. Créer l'abonnement
      await createSubscriptionMutation.mutateAsync({
        user_email: request.user_email,
        plan_code: actionData.plan_code || request.plan_code,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
        payment_recorded: false
      });

      // 3. Créer le profil Seller automatiquement
      try {
        await base44.asServiceRole.entities.Seller.create({
          full_name: request.full_name,
          whatsapp_number: request.phone,
          shop_slug: request.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30),
          shop_name: request.business_name,
          address: request.city,
          is_subscribed: true,
          profile_completed: true,
          created_by: request.user_email
        });
      } catch (sellerError) {
        console.error('Error creating seller profile:', sellerError);
        // Continue even if seller creation fails - user can create it later
      }

      // 4. Mettre à jour la demande
      await updateRequestMutation.mutateAsync({
        id: request.id,
        data: {
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user.email
        }
      });

      // 5. Stocker les identifiants pour affichage
      setGeneratedCredentials({
        email: request.user_email,
        password: password,
        name: request.full_name,
        plan: plan?.name || request.plan_code,
        endDate: format(endDate, 'dd/MM/yyyy', { locale: fr })
      });

      // 6. Envoyer email avec identifiants
      await base44.integrations.Core.SendEmail({
        to: request.user_email,
        subject: '🎉 Votre compte ShopQR est activé !',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bienvenue sur ShopQR !</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #374151;">Bonjour ${request.full_name},</p>
              <p style="font-size: 16px; color: #374151;">Votre compte ShopQR est maintenant <strong style="color: #059669;">activé</strong> ! 🚀</p>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">🔐 Vos identifiants de connexion :</p>
                <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
                  <p style="margin: 5px 0;"><strong>Email :</strong> ${request.user_email}</p>
                  <p style="margin: 5px 0;"><strong>Mot de passe :</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code></p>
                </div>
                <p style="margin: 10px 0 0 0; color: #92400e; font-size: 13px;">⚠️ Changez votre mot de passe après la première connexion</p>
              </div>

              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">📋 Détails de votre abonnement :</p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
                  <li>Boutique : <strong>${request.business_name}</strong></li>
                  <li>Forfait : <strong>${plan?.name || 'Pro'}</strong></li>
                  <li>Valable jusqu'au : <strong>${format(endDate, 'dd/MM/yyyy', { locale: fr })}</strong></li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                  🔑 Se connecter maintenant
                </a>
              </div>
            </div>
          </div>
        `
      });

      // Fermer le dialog d'approbation et ouvrir le modal des identifiants
      setShowDialog(false);
      setShowCredentialsModal(true);
      toast.success('Compte créé avec succès !');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(`Erreur : ${error.message}`);
    }
  };

  const handleReject = async (request) => {
    const user = await base44.auth.me();
    
    await updateRequestMutation.mutateAsync({
      id: request.id,
      data: {
        status: "rejected",
        approved_by: user.email,
        rejection_reason: actionData.rejection_reason
      }
    });

    // Envoyer email de rejet
    try {
      await base44.integrations.Core.SendEmail({
        to: request.user_email,
        subject: 'Mise à jour de votre demande ShopQR',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
              <p style="font-size: 16px; color: #374151;">Bonjour ${request.full_name},</p>
              <p style="font-size: 16px; color: #374151;">
                Nous avons examiné votre demande d'abonnement ShopQR et malheureusement nous ne pouvons pas l'accepter pour le moment.
              </p>
              ${actionData.rejection_reason ? `
                <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <p style="margin: 0; color: #991b1b;"><strong>Raison :</strong> ${actionData.rejection_reason}</p>
                </div>
              ` : ''}
              <p style="font-size: 16px; color: #374151;">
                N'hésitez pas à nous recontacter si vous avez des questions ou souhaitez soumettre une nouvelle demande.
              </p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Cordialement,<br/>
                L'équipe ShopQR
              </p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error('Error sending rejection email:', error);
    }

    setShowDialog(false);
    toast.success('Demande rejetée et email envoyé');
  };

  const openDialog = (request, action) => {
    setSelectedRequest(request);
    setActionData({
      plan_code: request.plan_code,
      duration_months: request.duration_months.toString(),
      rejection_reason: ""
    });
    setShowDialog(action);
  };

  const openModifyDialog = (request) => {
    setSelectedRequest(request);
    setActionData({
      plan_code: request.plan_code,
      duration_months: request.duration_months.toString(),
      rejection_reason: ""
    });
    setShowModifyDialog(true);
  };

  const handleModify = async () => {
    await updateRequestMutation.mutateAsync({
      id: selectedRequest.id,
      data: {
        plan_code: actionData.plan_code,
        duration_months: parseInt(actionData.duration_months)
      }
    });
    setShowModifyDialog(false);
    toast.success('Demande modifiée avec succès');
  };

  const statusConfig = {
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    approved: { label: "Approuvée", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    rejected: { label: "Rejetée", color: "bg-red-100 text-red-800", icon: XCircle }
  };

  const handleLoginAsClient = (request) => {
    // Cette fonctionnalité nécessite une implémentation backend spéciale
    toast.info('Fonctionnalité en cours de développement');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié !');
  };

  const sendCredentialsByEmail = async () => {
    if (!generatedCredentials) return;

    try {
      await base44.integrations.Core.SendEmail({
        to: generatedCredentials.email,
        subject: 'Rappel - Vos identifiants QRSell',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #111827;">Rappel de vos identifiants ShopQR</h2>
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 5px 0;"><strong>Email :</strong> ${generatedCredentials.email}</p>
                <p style="margin: 5px 0;"><strong>Mot de passe :</strong> ${generatedCredentials.password}</p>
              </div>
              <a href="${window.location.origin}/login" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                Se connecter
              </a>
            </div>
          </div>
        `
      });
      toast.success('Email envoyé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {requests.map(request => {
          const StatusIcon = statusConfig[request.status]?.icon || Clock;
          const plan = plans.find(p => p.code === request.plan_code);
          
          return (
            <Card key={request.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg dark:text-white">{request.full_name}</h3>
                      <Badge className={statusConfig[request.status]?.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[request.status]?.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium dark:text-gray-200">{request.user_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Téléphone</p>
                        <p className="font-medium dark:text-gray-200">{request.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Boutique</p>
                        <p className="font-medium dark:text-gray-200">{request.business_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Localisation</p>
                        <p className="font-medium dark:text-gray-200">{request.city}, {request.country}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pt-2 border-t">
                      <div>
                        <p className="text-gray-500">Forfait</p>
                        <p className="font-medium">{plan?.name || request.plan_code}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Durée</p>
                        <p className="font-medium">{request.duration_months} mois</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date de demande</p>
                        <p className="font-medium">
                          {format(new Date(request.created_date), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="text-gray-500 mb-1">Message :</p>
                        <p className="text-gray-700">{request.message}</p>
                      </div>
                    )}

                    {request.rejection_reason && (
                      <div className="bg-red-50 p-3 rounded-lg text-sm">
                        <p className="text-red-600 font-medium">Raison du rejet : {request.rejection_reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4 flex-wrap flex-col">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => openDialog(request, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          onClick={() => openModifyDialog(request)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          onClick={() => openDialog(request, 'reject')}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <Button
                        onClick={() => handleLoginAsClient(request)}
                        variant="outline"
                        size="sm"
                      >
                        <User className="w-4 h-4 mr-1" />
                        Se connecter
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {requests.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Aucune demande {filter !== 'all' ? statusConfig[filter]?.label?.toLowerCase() : ''}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Approuver */}
      <Dialog open={showDialog === 'approve'} onOpenChange={() => setShowDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la demande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Forfait</Label>
              <Select
                value={actionData.plan_code}
                onValueChange={(value) => setActionData({ ...actionData, plan_code: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.code}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Durée (en mois)</Label>
              <Input
                type="number"
                value={actionData.duration_months}
                onChange={(e) => setActionData({ ...actionData, duration_months: e.target.value })}
                placeholder="3"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-900">Un email de bienvenue sera envoyé avec :</p>
              <ul className="list-disc list-inside mt-2 text-blue-800">
                <li>Lien de connexion au dashboard</li>
                <li>Date d'expiration de l'abonnement</li>
                <li>Instructions de paiement</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={() => handleApprove(selectedRequest)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Approuver et envoyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejeter */}
      <Dialog open={showDialog === 'reject'} onOpenChange={() => setShowDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Raison du rejet (optionnel)</Label>
              <Textarea
                value={actionData.rejection_reason}
                onChange={(e) => setActionData({ ...actionData, rejection_reason: e.target.value })}
                placeholder="Informations incomplètes, activité non conforme..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={() => handleReject(selectedRequest)}
                variant="destructive"
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Identifiants générés */}
      <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Compte créé avec succès !
            </DialogTitle>
          </DialogHeader>
          
          {generatedCredentials && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-900 mb-3">
                  🔐 Identifiants du client :
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between bg-white rounded p-2">
                    <div>
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="font-mono font-semibold">{generatedCredentials.email}</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedCredentials.email)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded p-2">
                    <div>
                      <p className="text-gray-500 text-xs">Mot de passe</p>
                      <p className="font-mono font-semibold">{generatedCredentials.password}</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedCredentials.password)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-blue-900 mb-2">📋 Détails de l'abonnement :</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Nom : {generatedCredentials.name}</li>
                  <li>• Forfait : {generatedCredentials.plan}</li>
                  <li>• Valable jusqu'au : {generatedCredentials.endDate}</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    copyToClipboard(`Email: ${generatedCredentials.email}\nMot de passe: ${generatedCredentials.password}`);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier tout
                </Button>
                <Button 
                  onClick={sendCredentialsByEmail}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer par email
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                ⚠️ Ces identifiants ont déjà été envoyés au client par email
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}