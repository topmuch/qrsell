import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function FeaturedProductSelector({ seller, products }) {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const updateSellerMutation = useMutation({
    mutationFn: (data) => base44.entities.Seller.update(seller.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller']);
      toast.success('Paramètres mis à jour');
    }
  });

  const bioLinkUrl = `${window.location.origin}/BioLink?slug=${seller.shop_slug}`;

  const copyBioLink = () => {
    navigator.clipboard.writeText(bioLinkUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualToggle = (checked) => {
    updateSellerMutation.mutate({
      use_manual_featured: checked
    });
  };

  const handleProductSelect = (productId) => {
    updateSellerMutation.mutate({
      featured_product_id: productId
    });
  };

  const getAutoSelectedProduct = () => {
    // Simplified logic for display only
    if (products.length === 0) return null;
    return products.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  };

  const autoProduct = getAutoSelectedProduct();
  const activeProduct = seller.use_manual_featured && seller.featured_product_id
    ? products.find(p => p.id === seller.featured_product_id)
    : autoProduct;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Lien Bio Intelligent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bio Link URL */}
        <Alert>
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Votre lien bio unique à mettre dans votre bio TikTok/Instagram
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 p-3 rounded-lg text-sm font-mono border">
                  {bioLinkUrl}
                </code>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={copyBioLink}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <a href={bioLinkUrl} target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
              <p className="text-sm text-gray-600">
                Ce lien affiche automatiquement votre meilleur produit (promos, scans récents, ou dernier ajouté)
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Manual/Auto Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="manual-mode" className="font-medium">
              Choisir manuellement le produit du jour
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              Sinon, le système sélectionne automatiquement
            </p>
          </div>
          <Switch
            id="manual-mode"
            checked={seller.use_manual_featured || false}
            onCheckedChange={handleManualToggle}
          />
        </div>

        {/* Product Selection */}
        {seller.use_manual_featured ? (
          <div className="space-y-3">
            <Label>Produit mis en avant</Label>
            <Select
              value={seller.featured_product_id || ''}
              onValueChange={handleProductSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit..." />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  Mode automatique activé
                </p>
                <p className="text-sm text-gray-600">
                  Le système sélectionne automatiquement :
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>1️⃣ Produit en Promotion Flash (si active)</li>
                  <li>2️⃣ Produit le plus scanné ces 24h</li>
                  <li>3️⃣ Dernier produit ajouté</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Product Preview */}
        {activeProduct && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm text-gray-600">Produit actuellement affiché</Label>
              <Badge>
                {seller.use_manual_featured ? 'Manuel' : 'Auto'}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {activeProduct.image_url && (
                <img 
                  src={activeProduct.image_url} 
                  alt={activeProduct.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activeProduct.name}</p>
                <p className="text-sm text-gray-600">
                  {new Intl.NumberFormat('fr-FR').format(activeProduct.price)} FCFA
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}