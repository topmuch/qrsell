import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, XCircle, DollarSign, Calendar, Plus, Edit, Key, Copy, Check, Mail, Trash2, Loader2 } from "lucide-react";
import { format, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function SubscriptionManagement() {
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [deletingSubscription, setDeletingSubscription] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [paymentData, setPaymentData] = useState({
    payment_method: "",
    payment_note: ""
  });
  const [formData, setFormData] = useState({
    user_email: "",
    plan_code: "",
    duration_months: "",
    start_date: "",
    payment_recorded: false,
    payment_method: "",
    payment_note: ""
  });

  const queryClient = useQueryClient();

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleResetPassword = (subscription) => {
    const newPassword = generatePassword();
    setGeneratedPassword(newPassword);
    setResetPasswordUser(subscription);
    setShowPasswordDialog(true);
    setCopied(false);
  };

  const copyAll = () => {
    const text = `Email: ${resetPasswordUser.user_email}\nMot de passe: ${generatedPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendByEmail = async () => {
    try {
      await base44.integrations.Core.SendEmail({
        to: resetPasswordUser.user_email,
        subject: 'Réinitialisation de votre mot de passe QRSell',
        body: `Bonjour,\n\nVotre mot de passe a été réinitialisé.\n\nEmail: ${resetPasswordUser.user_email}\nNouveau mot de passe: ${generatedPassword}\n\nVous pouvez vous connecter sur https://qrsell.app\n\nCordialement,\nL'équipe QRSell`
      });
      toast.success('Email envoyé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date')
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list()
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      setShowPaymentDialog(false);
      setShowEditDialog(false);
      toast.success('Abonnement mis à jour');
    }
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (subscription) => {
      // Delete seller and all related data
      const sellers = await base44.entities.Seller.filter({ created_by: subscription.user_email });
      
      for (const seller of sellers) {
        // Delete products
        const products = await base44.entities.Product.filter({ seller_id: seller.id });
        for (const product of products) {
          await base44.entities.Product.delete(product.id);
        }
        
        // Delete analytics
        const analytics = await base44.entities.Analytics.filter({ seller_id: seller.id });
        for (const analytic of analytics) {
          await base44.entities.Analytics.delete(analytic.id);
        }
        
        // Delete promotions
        const promotions = await base44.entities.Promotion.filter({ seller_id: seller.id });
        for (const promo of promotions) {
          await base44.entities.Promotion.delete(promo.id);
        }
        
        // Delete coupons
        const coupons = await base44.entities.Coupon.filter({ seller_id: seller.id });
        for (const coupon of coupons) {
          await base44.entities.Coupon.delete(coupon.id);
        }
        
        // Delete live sessions
        const liveSessions = await base44.entities.LiveSession.filter({ seller_id: seller.id });
        for (const session of liveSessions) {
          await base44.entities.LiveSession.delete(session.id);
        }
        
        // Delete seller
        await base44.entities.Seller.delete(seller.id);
      }
      
      // Delete subscription
      await base44.entities.Subscription.delete(subscription.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      queryClient.invalidateQueries(['sellers']);
      queryClient.invalidateQueries(['products']);
      setDeletingSubscription(null);
      setDeleteConfirmText('');
      toast.success('Abonnement et toutes les données associées supprimés');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: (data) => base44.entities.Subscription.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      setShowCreateDialog(false);
      setFormData({
        user_email: "",
        plan_code: "",
        duration_months: "",
        start_date: "",
        payment_recorded: false,
        payment_method: "",
        payment_note: ""
      });
      toast.success('Abonnement créé avec succès');
    }
  });

  const handleRecordPayment = () => {
    updateSubscriptionMutation.mutate({
      id: selectedSubscription.id,
      data: {
        payment_recorded: true,
        payment_method: paymentData.payment_method,
        payment_note: paymentData.payment_note
      }
    });
  };

  const toggleActiveStatus = (subscription) => {
    updateSubscriptionMutation.mutate({
      id: subscription.id,
      data: { is_active: !subscription.is_active }
    });
  };

  const openCreateDialog = () => {
    setFormData({
      user_email: "",
      plan_code: plans[0]?.code || "",
      duration_months: "3",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      payment_recorded: false,
      payment_method: "",
      payment_note: ""
    });
    setShowCreateDialog(true);
  };

  const openEditDialog = (subscription) => {
    setSelectedSubscription(subscription);
    const durationMonths = Math.ceil((new Date(subscription.end_date) - new Date(subscription.start_date)) / (1000 * 60 * 60 * 24 * 30));
    setFormData({
      user_email: subscription.user_email,
      plan_code: subscription.plan_code,
      duration_months: durationMonths.toString(),
      start_date: format(new Date(subscription.start_date), 'yyyy-MM-dd'),
      payment_recorded: subscription.payment_recorded,
      payment_method: subscription.payment_method || "",
      payment_note: subscription.payment_note || ""
    });
    setShowEditDialog(true);
  };

  const handleCreate = () => {
    const startDate = new Date(formData.start_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(formData.duration_months));

    createSubscriptionMutation.mutate({
      user_email: formData.user_email,
      plan_code: formData.plan_code,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      is_active: true,
      payment_recorded: formData.payment_recorded,
      payment_method: formData.payment_method || null,
      payment_note: formData.payment_note || null
    });
  };

  const handleEdit = () => {
    const startDate = new Date(formData.start_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(formData.duration_months));

    updateSubscriptionMutation.mutate({
      id: selectedSubscription.id,
      data: {
        plan_code: formData.plan_code,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_recorded: formData.payment_recorded,
        payment_method: formData.payment_method || null,
        payment_note: formData.payment_note || null
      }
    });
  };

  const openPaymentDialog = (subscription) => {
    setSelectedSubscription(subscription);
    setPaymentData({
      payment_method: subscription.payment_method || "",
      payment_note: subscription.payment_note || ""
    });
    setShowPaymentDialog(true);
  };

  const getSubscriptionStatus = (subscription) => {
    const isExpired = isPast(new Date(subscription.end_date));
    
    if (!subscription.is_active) return { label: "Bloqué", color: "bg-red-100 text-red-800" };
    if (isExpired) return { label: "Expiré", color: "bg-gray-100 text-gray-800" };
    return { label: "Actif", color: "bg-green-100 text-green-800" };
  };

  const activeSubscriptions = subscriptions.filter(s => s.is_active && !isPast(new Date(s.end_date)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Abonnements</h2>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Créer un abonnement
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {subscriptions.map(subscription => {
          const status = getSubscriptionStatus(subscription);
          const plan = plans.find(p => p.code === subscription.plan_code);
          const daysRemaining = Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={subscription.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{subscription.user_email}</h3>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                      {subscription.payment_recorded && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Payé
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Forfait</p>
                        <p className="font-medium">{plan?.name || subscription.plan_code}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Début</p>
                        <p className="font-medium">
                          {format(new Date(subscription.start_date), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fin</p>
                        <p className="font-medium">
                          {format(new Date(subscription.end_date), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Temps restant</p>
                        <p className={`font-medium ${daysRemaining < 7 ? 'text-red-600' : ''}`}>
                          {daysRemaining > 0 ? `${daysRemaining} jours` : 'Expiré'}
                        </p>
                      </div>
                    </div>

                    {subscription.payment_method && (
                      <div className="bg-blue-50 p-3 rounded-lg text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Paiement :</span> {subscription.payment_method}
                          {subscription.payment_note && ` - ${subscription.payment_note}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handleResetPassword(subscription)}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Key className="w-4 h-4 mr-1" />
                      Reset MDP
                    </Button>
                    <Button
                      onClick={() => openEditDialog(subscription)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    {!subscription.payment_recorded && (
                      <Button
                        onClick={() => openPaymentDialog(subscription)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Paiement reçu
                      </Button>
                    )}
                    <Button
                      onClick={() => toggleActiveStatus(subscription)}
                      variant={subscription.is_active ? "destructive" : "default"}
                      size="sm"
                    >
                      {subscription.is_active ? (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Bloquer
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Activer
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setDeletingSubscription(subscription)}
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {subscriptions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-2">Aucun abonnement actif.</p>
              <p className="text-gray-500 text-sm">Commencez par créer un nouveau compte.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Créer abonnement */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un abonnement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email de l'utilisateur *</Label>
              <Input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                placeholder="client@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Forfait *</Label>
              <Select
                value={formData.plan_code}
                onValueChange={(value) => setFormData({ ...formData, plan_code: value })}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durée (mois) *</Label>
                <Input
                  type="number"
                  value={formData.duration_months}
                  onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label>Date de début *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>Paiement déjà reçu</Label>
              <Switch
                checked={formData.payment_recorded}
                onCheckedChange={(checked) => setFormData({ ...formData, payment_recorded: checked })}
              />
            </div>

            {formData.payment_recorded && (
              <>
                <div className="space-y-2">
                  <Label>Méthode de paiement</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wave">Wave</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note de paiement</Label>
                  <Textarea
                    value={formData.payment_note}
                    onChange={(e) => setFormData({ ...formData, payment_note: e.target.value })}
                    placeholder="Détails du paiement..."
                    rows={2}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!formData.user_email || !formData.plan_code || !formData.duration_months || !formData.start_date}
              >
                Créer l'abonnement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier abonnement */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'abonnement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email de l'utilisateur</Label>
              <Input
                type="email"
                value={formData.user_email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label>Forfait *</Label>
              <Select
                value={formData.plan_code}
                onValueChange={(value) => setFormData({ ...formData, plan_code: value })}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durée (mois) *</Label>
                <Input
                  type="number"
                  value={formData.duration_months}
                  onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de début *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>Paiement reçu</Label>
              <Switch
                checked={formData.payment_recorded}
                onCheckedChange={(checked) => setFormData({ ...formData, payment_recorded: checked })}
              />
            </div>

            {formData.payment_recorded && (
              <>
                <div className="space-y-2">
                  <Label>Méthode de paiement</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wave">Wave</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note de paiement</Label>
                  <Textarea
                    value={formData.payment_note}
                    onChange={(e) => setFormData({ ...formData, payment_note: e.target.value })}
                    placeholder="Détails du paiement..."
                    rows={2}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Enregistrer paiement */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer le paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Méthode de paiement</Label>
              <Select
                value={paymentData.payment_method}
                onValueChange={(value) => setPaymentData({ ...paymentData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wave">Wave</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Note (optionnel)</Label>
              <Textarea
                value={paymentData.payment_note}
                onChange={(e) => setPaymentData({ ...paymentData, payment_note: e.target.value })}
                placeholder="Reçu via Wave le 05/01/2026, référence: TX12345"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleRecordPayment}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmer le paiement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete subscription dialog */}
      <Dialog open={!!deletingSubscription} onOpenChange={() => {
        setDeletingSubscription(null);
        setDeleteConfirmText('');
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Supprimer cet abonnement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-semibold mb-3">
                ⚠️ Cette action est irréversible et supprimera :
              </p>
              <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                <li>Tous les produits</li>
                <li>Toutes les statistiques</li>
                <li>Toutes les promotions et coupons</li>
                <li>Toutes les sessions live</li>
                <li>La page vitrine (/shop/[slug])</li>
              </ul>
            </div>
            
            <div>
              <Label>Tapez "SUPPRIMER" pour confirmer</Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="mt-2 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeletingSubscription(null);
                  setDeleteConfirmText('');
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteSubscriptionMutation.mutate(deletingSubscription)}
                disabled={deleteConfirmText !== 'SUPPRIMER' || deleteSubscriptionMutation.isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleteSubscriptionMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  'Confirmer'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Reset Password */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" />
              Réinitialisation du mot de passe
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Email</Label>
                  <p className="font-mono text-sm font-medium text-gray-900 select-all">
                    {resetPasswordUser?.user_email}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Mot de passe</Label>
                  <p className="font-mono text-lg font-bold text-purple-700 select-all break-all">
                    {generatedPassword}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyAll}
                className="flex-1"
                variant={copied ? "default" : "outline"}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                📋 {copied ? 'Copié !' : 'Copier tout'}
              </Button>
              <Button
                onClick={sendByEmail}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                📧 Envoyer par email
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              ⚠️ Attention : ces identifiants devront être utilisés pour la prochaine connexion
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}