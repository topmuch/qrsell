import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Check } from "lucide-react";

export default function PlanManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    price: "",
    durations_available: "1,2,3,6,12",
    features: "",
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list('-created_date')
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.Plan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['plans']);
      setShowDialog(false);
      resetForm();
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Plan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['plans']);
      setShowDialog(false);
      resetForm();
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => base44.entities.Plan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['plans']);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      price: "",
      durations_available: "1,2,3,6,12",
      features: "",
      is_active: true
    });
    setEditingPlan(null);
  };

  const openDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        code: plan.code,
        description: plan.description || "",
        price: plan.price || "",
        durations_available: plan.durations_available?.join(",") || "1,2,3,6,12",
        features: plan.features?.join("\n") || "",
        is_active: plan.is_active
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const planData = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      durations_available: formData.durations_available.split(",").map(d => parseInt(d.trim())),
      features: formData.features.split("\n").filter(f => f.trim())
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des forfaits</h2>
        <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau forfait
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Code: {plan.code}</p>
                </div>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.price && (
                <div className="text-2xl font-bold text-blue-600">
                  {plan.price.toLocaleString()} FCFA/mois
                </div>
              )}
              
              <p className="text-sm text-gray-600">{plan.description}</p>

              <div>
                <p className="text-xs text-gray-500 mb-1">Durées disponibles :</p>
                <div className="flex flex-wrap gap-1">
                  {plan.durations_available?.map(duration => (
                    <Badge key={duration} variant="outline" className="text-xs">
                      {duration} mois
                    </Badge>
                  ))}
                </div>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Fonctionnalités :</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => openDialog(plan)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Supprimer ce forfait ?')) {
                      deletePlanMutation.mutate(plan.id);
                    }
                  }}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {plans.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="py-12 text-center text-gray-500">
              Aucun forfait créé. Commencez par créer votre premier forfait.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Créer/Modifier */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Modifier le forfait' : 'Nouveau forfait'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du forfait *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Pro TikTok"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code unique *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                  placeholder="pro"
                  required
                  disabled={!!editingPlan}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Idéal pour les créateurs TikTok actifs..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix mensuel (FCFA) - optionnel</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durations">Durées disponibles (en mois, séparées par des virgules) *</Label>
              <Input
                id="durations"
                value={formData.durations_available}
                onChange={(e) => setFormData({ ...formData, durations_available: e.target.value })}
                placeholder="1,2,3,6,12"
                required
              />
              <p className="text-xs text-gray-500">Ex: 1,2,3,6,12</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Fonctionnalités (une par ligne)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="QR codes illimités&#10;Analytics avancés&#10;Personnalisation complète"
                rows={5}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="is_active" className="cursor-pointer">Forfait actif (visible aux utilisateurs)</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingPlan ? 'Mettre à jour' : 'Créer le forfait'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}