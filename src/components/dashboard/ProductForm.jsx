import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductForm({ open, onClose, seller, currentShop, editProduct, onSuccess }) {
  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    price: editProduct?.price || '',
    description: editProduct?.description || '',
    image_url: editProduct?.image_url || '',
    category: editProduct?.category || 'Autre',
    is_new: editProduct?.is_new || false,
    is_on_promo: editProduct?.is_on_promo || false,
    is_out_of_stock: editProduct?.is_out_of_stock || false
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const generatePublicId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PROD-${year}-${random}`;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, image_url: result.file_url }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        seller_id: seller.id,
        shop_slug: currentShop?.shop_slug || seller.shop_slug,
        is_active: true
      };

      if (editProduct) {
        // Générer un public_id si manquant
        if (!editProduct.public_id) {
          productData.public_id = generatePublicId();
        }
        await base44.entities.Product.update(editProduct.id, productData);
        toast.success('Produit modifié avec succès !');
      } else {
        productData.public_id = generatePublicId();
        await base44.entities.Product.create(productData);
        toast.success('Produit ajouté avec succès !');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editProduct ? 'Modifier le produit' : 'Ajouter un produit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>Photo du produit</Label>
            <div className="relative">
              {formData.image_url ? (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={formData.image_url} 
                    alt="Product" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#ed477c] cursor-pointer transition-colors bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-[#ed477c] animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <span className="text-sm text-gray-500">Cliquez pour ajouter</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Robe Wax Élégante"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prix (FCFA)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="15000"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description courte</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value.substring(0, 100) }))}
              placeholder="Belle robe en wax africain, taille M-L"
              maxLength={100}
              className="resize-none"
              rows={2}
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.description.length}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mode">👔 Mode</SelectItem>
                <SelectItem value="Électroménager">🔌 Électroménager</SelectItem>
                <SelectItem value="Beauté">💄 Beauté</SelectItem>
                <SelectItem value="Accessoires">👜 Accessoires</SelectItem>
                <SelectItem value="Alimentation">🍎 Alimentation</SelectItem>
                <SelectItem value="Électronique">📱 Électronique</SelectItem>
                <SelectItem value="Maison">🏠 Maison</SelectItem>
                <SelectItem value="Sport">⚽ Sport</SelectItem>
                <SelectItem value="Autre">📦 Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_new" className="cursor-pointer">Badge "Nouveauté"</Label>
              <Switch
                id="is_new"
                checked={formData.is_new}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, is_new: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_on_promo" className="cursor-pointer">Badge "Promo"</Label>
              <Switch
                id="is_on_promo"
                checked={formData.is_on_promo}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, is_on_promo: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_out_of_stock" className="cursor-pointer">En rupture de stock</Label>
              <Switch
                id="is_out_of_stock"
                checked={formData.is_out_of_stock}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, is_out_of_stock: checked}))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90 text-white shadow-lg font-semibold"
              disabled={loading || uploading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  En cours...
                </>
              ) : editProduct ? (
                'Sauvegarder les modifications'
              ) : (
                'Ajouter le produit'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}