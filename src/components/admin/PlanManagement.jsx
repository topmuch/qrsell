import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Check, X, Store, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function PlanManagement() {
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ['all-plans'],
    queryFn: () => base44.entities.Plan.list()
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Plan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-plans']);
      setShowEditDialog(false);
      setEditingPlan(null);
      toast.success('Forfait mis à jour avec succès');
    }
  });

  const handleEdit = (plan) => {
    setEditingPlan({
      ...plan,
      features: plan.features || [],
      feature_options: plan.feature_options || {
        qr_codes_tiktok: true,
        analytics_realtime: true,
        campaigns_access: false,
        verified_badge: false,
        team_management: false,
        priority_support: false
      }
    });
    setShowEditDialog(true);
  };

  const handleSave = () => {
    if (!editingPlan) return;

    const { id, created_date, updated_date, created_by, ...planData } = editingPlan;
    
    updatePlanMutation.mutate({
      id: editingPlan.id,
      data: planData
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des forfaits</h2>
          <p className="text-gray-500">Configurez les limites et fonctionnalités de chaque forfait</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map(plan => (
          <Card key={plan.id} className={`${plan.code === 'pro' ? 'border-2 border-purple-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    {plan.code === 'pro' && (
                      <Badge className="bg-purple-600">⭐ Premium</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(plan)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {new Intl.NumberFormat('fr-FR').format(plan.price)} FCFA
                </div>
                <div className="text-sm text-gray-500">par mois</div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-500">Boutiques max</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    <Store className="w-5 h-5 text-purple-600" />
                    {plan.max_shops || 1}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Produits max</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    {plan.max_products || 100}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="text-sm font-semibold text-gray-700 mb-2">Fonctionnalités :</div>
                <div className="flex items-center gap-2">
                  {plan.has_multi_shops ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm">Multi-boutiques</span>
                </div>
                <div className="flex items-center gap-2">
                  {plan.has_trend_alerts ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm">Alertes de tendances</span>
                </div>
                <div className="flex items-center gap-2">
                  {plan.feature_options?.priority_support ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm">Support prioritaire</span>
                </div>
                <div className="flex items-center gap-2">
                  {plan.feature_options?.verified_badge ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm">Badge vérifié</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le forfait : {editingPlan?.name}</DialogTitle>
          </DialogHeader>

          {editingPlan && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom du forfait</Label>
                    <Input
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      placeholder="TikTok Pro"
                    />
                  </div>
                  <div>
                    <Label>Prix mensuel (FCFA)</Label>
                    <Input
                      type="number"
                      value={editingPlan.price}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingPlan.description || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    placeholder="Description du forfait..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">Limites</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Nombre max de boutiques
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.max_shops}
                      onChange={(e) => setEditingPlan({ ...editingPlan, max_shops: parseInt(e.target.value) })}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Nombre max de produits
                    </Label>
                    <Input
                      type="number"
                      value={editingPlan.max_products}
                      onChange={(e) => setEditingPlan({ ...editingPlan, max_products: parseInt(e.target.value) })}
                      min="10"
                      step="50"
                    />
                  </div>
                </div>
              </div>

              {/* Main Features */}
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">Fonctionnalités principales</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="multi-shops" className="cursor-pointer">
                      Gestion multi-boutiques
                    </Label>
                    <Switch
                      id="multi-shops"
                      checked={editingPlan.has_multi_shops}
                      onCheckedChange={(checked) => setEditingPlan({ 
                        ...editingPlan, 
                        has_multi_shops: checked 
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trend-alerts" className="cursor-pointer">
                      Alertes de tendances
                    </Label>
                    <Switch
                      id="trend-alerts"
                      checked={editingPlan.has_trend_alerts}
                      onCheckedChange={(checked) => setEditingPlan({ 
                        ...editingPlan, 
                        has_trend_alerts: checked 
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">Options supplémentaires</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="priority-support" className="cursor-pointer">
                      Support prioritaire
                    </Label>
                    <Switch
                      id="priority-support"
                      checked={editingPlan.feature_options?.priority_support}
                      onCheckedChange={(checked) => setEditingPlan({
                        ...editingPlan,
                        feature_options: { ...editingPlan.feature_options, priority_support: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verified-badge" className="cursor-pointer">
                      Badge vérifié disponible
                    </Label>
                    <Switch
                      id="verified-badge"
                      checked={editingPlan.feature_options?.verified_badge}
                      onCheckedChange={(checked) => setEditingPlan({
                        ...editingPlan,
                        feature_options: { ...editingPlan.feature_options, verified_badge: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="campaigns" className="cursor-pointer">
                      Accès aux campagnes sponsorisées
                    </Label>
                    <Switch
                      id="campaigns"
                      checked={editingPlan.feature_options?.campaigns_access}
                      onCheckedChange={(checked) => setEditingPlan({
                        ...editingPlan,
                        feature_options: { ...editingPlan.feature_options, campaigns_access: checked }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <Label htmlFor="is-active" className="cursor-pointer">
                  Forfait actif (disponible à la souscription)
                </Label>
                <Switch
                  id="is-active"
                  checked={editingPlan.is_active}
                  onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_active: checked })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updatePlanMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                >
                  {updatePlanMutation.isPending ? 'Enregistrement...' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}