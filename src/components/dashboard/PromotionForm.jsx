import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function PromotionForm({ open, onClose, seller, products }) {
  const [productId, setProductId] = useState('');
  const [discount, setDiscount] = useState('10');
  const [duration, setDuration] = useState('30');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const product = products.find(p => p.id === productId);
      const token = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      
      return base44.entities.Promotion.create({
        ...data,
        qr_token: token,
        product_name: product.name,
        original_price: product.price
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
      toast.success('Promotion créée avec succès !');
      onClose();
      setProductId('');
      setDiscount('10');
      setDuration('30');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!productId || !discount) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    createMutation.mutate({
      seller_id: seller.id,
      product_id: productId,
      discount_percentage: parseFloat(discount),
      duration_minutes: parseInt(duration)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Créer une promotion flash
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Produit</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {product.price} FCFA
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Réduction (%)</Label>
            <Input
              type="number"
              min="5"
              max="90"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Ex: 10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Entre 5% et 90%
            </p>
          </div>

          <div>
            <Label>Durée de validité</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
                <SelectItem value="360">6 heures</SelectItem>
                <SelectItem value="1440">1 jour</SelectItem>
                <SelectItem value="4320">3 jours</SelectItem>
                <SelectItem value="10080">7 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              ⏱️ L'offre sera valable {duration >= 1440 ? `${duration/1440} jour${duration/1440 > 1 ? 's' : ''}` : duration >= 60 ? `${duration/60} heure${duration/60 > 1 ? 's' : ''}` : `${duration} minutes`} après le premier scan du QR code
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !productId}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  En cours...
                </>
              ) : (
                'Créer la promotion'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}