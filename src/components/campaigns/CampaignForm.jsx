import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

export default function CampaignForm({ campaign, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(campaign || {
    partner_name: "",
    partner_email: "",
    product_name: "",
    product_image: "",
    product_description: "",
    product_link: "",
    budget_total: 500,
    budget_remaining: 500,
    commission_type: "fixed",
    commission_value: 5,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    target_location: "",
    script_text: "",
    status: "draft",
    payment_status: "pending",
    max_participants: null,
    total_scans: 0,
    total_conversions: 0
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, product_image: file_url });
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // S'assurer que budget_remaining est défini
    if (!formData.budget_remaining || formData.budget_remaining === 0) {
      formData.budget_remaining = formData.budget_total;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partner_name">Nom du partenaire *</Label>
          <Input
            id="partner_name"
            value={formData.partner_name}
            onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
            placeholder="Ex: Nike"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="partner_email">Email du partenaire *</Label>
          <Input
            id="partner_email"
            type="email"
            value={formData.partner_email}
            onChange={(e) => setFormData({ ...formData, partner_email: e.target.value })}
            placeholder="contact@partenaire.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_name">Nom du produit *</Label>
        <Input
          id="product_name"
          value={formData.product_name}
          onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          placeholder="Ex: Air Max 2024"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_image">Image du produit</Label>
        <div className="flex items-center gap-4">
          <Input
            id="product_image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="flex-1"
          />
          {formData.product_image && (
            <img 
              src={formData.product_image} 
              alt="Preview" 
              className="w-20 h-20 object-cover rounded-lg border"
            />
          )}
        </div>
        <Input
          value={formData.product_image}
          onChange={(e) => setFormData({ ...formData, product_image: e.target.value })}
          placeholder="ou entrez une URL d'image"
          className="mt-2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_description">Description du produit *</Label>
        <Textarea
          id="product_description"
          value={formData.product_description}
          onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
          placeholder="Décrivez le produit à promouvoir..."
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_link">Lien du produit</Label>
        <Input
          id="product_link"
          type="url"
          value={formData.product_link}
          onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget_total">Budget total (€) *</Label>
          <Input
            id="budget_total"
            type="number"
            min="0"
            step="0.01"
            value={formData.budget_total}
            onChange={(e) => setFormData({ 
              ...formData, 
              budget_total: parseFloat(e.target.value),
              budget_remaining: parseFloat(e.target.value)
            })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Type de commission *</Label>
          <Select
            value={formData.commission_type}
            onValueChange={(value) => setFormData({ ...formData, commission_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Montant fixe</SelectItem>
              <SelectItem value="percentage">Pourcentage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commission_value">
            {formData.commission_type === "fixed" ? "Montant (€)" : "Pourcentage (%)"} *
          </Label>
          <Input
            id="commission_value"
            type="number"
            min="0"
            step={formData.commission_type === "fixed" ? "0.01" : "0.1"}
            value={formData.commission_value}
            onChange={(e) => setFormData({ ...formData, commission_value: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date de début *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(new Date(formData.start_date), 'PPP', { locale: fr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(formData.start_date)}
                onSelect={(date) => setFormData({ ...formData, start_date: date.toISOString() })}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Date de fin *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(new Date(formData.end_date), 'PPP', { locale: fr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(formData.end_date)}
                onSelect={(date) => setFormData({ ...formData, end_date: date.toISOString() })}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target_location">Cible géographique (optionnel)</Label>
          <Input
            id="target_location"
            value={formData.target_location}
            onChange={(e) => setFormData({ ...formData, target_location: e.target.value })}
            placeholder="Ex: France, Paris..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_participants">Nombre max de participants</Label>
          <Input
            id="max_participants"
            type="number"
            min="1"
            value={formData.max_participants || ""}
            onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Illimité"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="script_text">Script vocal suggéré</Label>
        <Textarea
          id="script_text"
          value={formData.script_text}
          onChange={(e) => setFormData({ ...formData, script_text: e.target.value })}
          placeholder="Ex: Merci à [Marque] pour ce partenariat ! Vous pouvez retrouver ce produit dans ma bio ou via ce QR."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Statut de la campagne</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">En pause</SelectItem>
            <SelectItem value="completed">Terminée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          {campaign ? 'Mettre à jour' : 'Créer la campagne'}
        </Button>
      </div>
    </form>
  );
}