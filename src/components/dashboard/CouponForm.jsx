import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponForm({ open, onClose, seller }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const code = 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const token = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 7); // 7 days

      return base44.entities.Coupon.create({
        ...data,
        code,
        qr_token: token,
        valid_until: validUntil.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coupons']);
      toast.success('Coupon créé avec succès !');
      onClose();
      setAmount('');
      setDescription('');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    createMutation.mutate({
      seller_id: seller.id,
      discount_amount: parseFloat(amount),
      description: description || `Réduction de ${amount} FCFA`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-500" />
            Créer un coupon
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Montant de réduction (FCFA)</Label>
            <Input
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 1500"
            />
          </div>

          <div>
            <Label>Description (optionnel)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Réduction sur votre prochaine commande"
              rows={3}
            />
          </div>

          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">
              🎟️ Le coupon sera valable 7 jours et utilisable une seule fois
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !amount}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  En cours...
                </>
              ) : (
                'Créer le coupon'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}