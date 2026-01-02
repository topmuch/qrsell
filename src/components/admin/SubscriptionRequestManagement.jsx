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
import { CheckCircle2, XCircle, Clock, Eye, Mail } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SubscriptionRequestManagement() {
  const [filter, setFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
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

  const handleApprove = async (request) => {
    const user = await base44.auth.me();
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(actionData.duration_months || request.duration_months));

    const plan = plans.find(p => p.code === (actionData.plan_code || request.plan_code));

    // Créer l'abonnement
    await createSubscriptionMutation.mutateAsync({
      user_email: request.user_email,
      plan_code: actionData.plan_code || request.plan_code,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      is_active: true,
      payment_recorded: false
    });

    // Mettre à jour la demande
    await updateRequestMutation.mutateAsync({
      id: request.id,
      data: {
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: user.email
      }
    });

    // Envoyer email d'activation
    try {
      await base44.integrations.Core.SendEmail({
        to: request.user_email,
        subject: '🎉 Votre compte QRSell est activé !',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bienvenue sur QRSell !</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #374151;">Bonjour ${request.full_name},</p>
              <p style="font-size: 16px; color: #374151;">Excellente nouvelle ! Votre abonnement <strong>${plan?.name || 'QRSell'}</strong> est maintenant <strong style="color: #059669;">activé</strong> ! 🚀</p>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">📋 Détails de votre abonnement :</p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
                  <li>Boutique : <strong>${request.business_name}</strong></li>
                  <li>Forfait : <strong>${plan?.name || 'Pro'}</strong></li>
                  <li>Valable jusqu'au : <strong>${format(endDate, 'dd/MM/yyyy', { locale: fr })}</strong></li>
                  <li>Durée : <strong>${actionData.duration_months || request.duration_months} mois</strong></li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}${createPageUrl('Dashboard')}" 
                   style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                  🔑 Accéder à mon Dashboard
                </a>
              </div>

              <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-weight: bold; color: #92400e;">💰 Informations de paiement :</p>
                <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                  Veuillez effectuer votre paiement pour garantir la continuité de votre service. Les instructions détaillées sont disponibles dans votre dashboard.
                </p>
              </div>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 12px 0; font-weight: bold; color: #111827;">🚀 Prochaines étapes :</p>
                <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
                  <li style="margin-bottom: 8px;">Connectez-vous à votre dashboard</li>
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
      alert(`Demande approuvée ! Email d'activation envoyé à ${request.user_email}`);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      alert(`Demande approuvée, mais erreur lors de l'envoi de l'email. Veuillez contacter ${request.user_email} manuellement.`);
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

    alert(`Demande rejetée.`);
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

  const statusConfig = {
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    approved: { label: "Approuvée", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    rejected: { label: "Rejetée", color: "bg-red-100 text-red-800", icon: XCircle }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Demandes d'abonnement</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              size="sm"
            >
              {status === 'all' ? 'Toutes' : statusConfig[status]?.label || status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map(request => {
          const StatusIcon = statusConfig[request.status]?.icon || Clock;
          const plan = plans.find(p => p.code === request.plan_code);
          
          return (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{request.full_name}</h3>
                      <Badge className={statusConfig[request.status]?.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[request.status]?.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium">{request.user_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Téléphone</p>
                        <p className="font-medium">{request.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Boutique</p>
                        <p className="font-medium">{request.business_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Localisation</p>
                        <p className="font-medium">{request.city}, {request.country}</p>
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

                  {request.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => openDialog(request, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        onClick={() => openDialog(request, 'reject')}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
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
    </div>
  );
}