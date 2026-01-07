import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Store, Plus, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function ShopSelector({ seller, currentShop, onShopChange, currentPlan, onUpgradeClick }) {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [newShopData, setNewShopData] = React.useState({
    shop_name: '',
    shop_slug: '',
    category: 'Autre'
  });

  const { data: shops = [], refetch } = useQuery({
    queryKey: ['shops', seller?.id],
    queryFn: () => base44.entities.Shop.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', seller?.created_by],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ user_email: seller?.created_by });
      const now = new Date();
      return subs.filter(sub => 
        sub.is_active && 
        new Date(sub.end_date) > now
      )[0];
    },
    enabled: !!seller?.created_by
  });

  // Use currentPlan from props, or fetch if not provided
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list(),
    enabled: !currentPlan
  });

  const plan = currentPlan || plans.find(p => p.code === subscription?.plan_code);
  const maxShops = plan?.max_shops || 1;
  const canCreateMore = shops.length < maxShops;
  const isPro = plan?.code === 'pro';

  const handleCreateShop = async () => {
    if (!newShopData.shop_name || !newShopData.shop_slug) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Vérifier si l'utilisateur a atteint la limite
    if (!canCreateMore) {
      if (onUpgradeClick) onUpgradeClick();
      return;
    }

    try {
      const newShop = await base44.entities.Shop.create({
        seller_id: seller.id,
        shop_name: newShopData.shop_name,
        shop_slug: newShopData.shop_slug,
        category: newShopData.category,
        primary_color: seller.primary_color || '#2563eb',
        whatsapp_number: seller.whatsapp_number,
        city: seller.address,
        is_active: true
      });

      await refetch();
      onShopChange(newShop);
      setShowCreateDialog(false);
      setNewShopData({ shop_name: '', shop_slug: '', category: 'Autre' });
      toast.success('Boutique créée avec succès !');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la création');
    }
  };

  if (shops.length === 0) return null;

  // Si le vendeur n'est pas Pro et a déjà 1 boutique, ne pas afficher le sélecteur
  if (!isPro && shops.length === 1) return null;

  return (
    <div className="mb-6 bg-white rounded-xl shadow-md p-4 border-2 border-purple-100">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Store className="w-5 h-5 text-purple-600" />
          <div className="flex-1">
            <Label className="text-xs text-gray-500 mb-1 block">Boutique actuelle</Label>
            <Select 
              value={currentShop?.id} 
              onValueChange={(shopId) => {
                const shop = shops.find(s => s.id === shopId);
                onShopChange(shop);
              }}
            >
              <SelectTrigger className="w-full bg-white border-2 font-semibold">
                <SelectValue placeholder="Sélectionner une boutique" />
              </SelectTrigger>
              <SelectContent>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.shop_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canCreateMore ? (
            <Button
              onClick={() => setShowCreateDialog(true)}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle boutique
            </Button>
          ) : (
            <>
              <div className="text-xs text-gray-500 mr-2">
                {shops.length}/{maxShops} boutiques
              </div>
              {!isPro && (
                <Button
                  onClick={onUpgradeClick}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Débloquer +2
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Shop Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle boutique</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom de la boutique</Label>
              <Input
                value={newShopData.shop_name}
                onChange={(e) => setNewShopData({ ...newShopData, shop_name: e.target.value })}
                placeholder="Beauté Amina"
              />
            </div>
            <div>
              <Label>Slug (URL unique)</Label>
              <Input
                value={newShopData.shop_slug}
                onChange={(e) => setNewShopData({ 
                  ...newShopData, 
                  shop_slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                })}
                placeholder="beaute_amina"
              />
              <p className="text-xs text-gray-500 mt-1">
                shopqr.pro/@{newShopData.shop_slug || 'votre_slug'}
              </p>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select 
                value={newShopData.category} 
                onValueChange={(val) => setNewShopData({ ...newShopData, category: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mode">Mode</SelectItem>
                  <SelectItem value="Beauté">Beauté</SelectItem>
                  <SelectItem value="Accessoires">Accessoires</SelectItem>
                  <SelectItem value="Électroménager">Électroménager</SelectItem>
                  <SelectItem value="Électronique">Électronique</SelectItem>
                  <SelectItem value="Alimentation">Alimentation</SelectItem>
                  <SelectItem value="Maison">Maison</SelectItem>
                  <SelectItem value="Sport">Sport</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900">
              <p className="font-semibold mb-1">💡 Conseil</p>
              <p>Chaque boutique aura son propre catalogue, ses QR codes et ses statistiques indépendantes.</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleCreateShop}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Créer la boutique
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}