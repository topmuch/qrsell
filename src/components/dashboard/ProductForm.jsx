import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ProductForm({ open, onClose, seller, onSuccess, editProduct }) {
  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    price: editProduct?.price || '',
    description: editProduct?.description || '',
    image_url: editProduct?.image_url || ''
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
    setLoading(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      seller_id: seller.id,
      shop_slug: seller.shop_slug,
      is_active: true
    };

    if (editProduct) {
      // Générer un public_id si manquant
      if (!editProduct.public_id) {
        productData.public_id = generatePublicId();
      }
      await base44.entities.Product.update(editProduct.id, productData);
    } else {
      productData.public_id = generatePublicId();
      await base44.entities.Product.create(productData);
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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

          <div className="flex gap-3 pt-2">
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
              className="flex-1 bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white"
              disabled={loading || uploading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : editProduct ? (
                'Modifier'
              ) : (
                'Ajouter'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}