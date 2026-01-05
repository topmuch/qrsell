import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Store, 
  Palette, 
  Share2, 
  CreditCard,
  Loader2, 
  Upload, 
  X,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShopSettings({ seller }) {
  const [uploading, setUploading] = useState({});
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    shop_name: seller?.shop_name || '',
    address: seller?.address || '',
    email: seller?.email || '',
    whatsapp_number: seller?.whatsapp_number || '',
    logo_url: seller?.logo_url || '',
    banner_images: seller?.banner_images || [],
    primary_color: seller?.primary_color || '#2563eb',
    secondary_color: seller?.secondary_color || '#3b82f6',
    tiktok: seller?.tiktok || '',
    instagram: seller?.instagram || '',
    facebook: seller?.facebook || '',
    whatsapp_business: seller?.whatsapp_business || '',
    payment_methods: seller?.payment_methods || [],
    partner_logos: seller?.partner_logos || [],
    show_featured_products: seller?.show_featured_products ?? true
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Seller.update(seller.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller']);
      toast.success('Modifications enregistrées');
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde');
    }
  });

  const handleUpdate = async (field, value) => {
    setFormData({ ...formData, [field]: value });
    await updateMutation.mutateAsync({ [field]: value });
  };

  const handleUpload = async (type, file) => {
    if (!file) return;
    
    setUploading({ ...uploading, [type]: true });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === 'logo') {
        await handleUpdate('logo_url', file_url);
      } else if (type === 'banner') {
        if (formData.banner_images.length >= 3) {
          toast.error('Maximum 3 images de bannière');
          return;
        }
        const newBanners = [...formData.banner_images, file_url];
        await handleUpdate('banner_images', newBanners);
      } else if (type === 'payment') {
        const newMethods = [...formData.payment_methods, file_url];
        await handleUpdate('payment_methods', newMethods);
      } else if (type === 'partner') {
        if (formData.partner_logos.length >= 6) {
          toast.error('Maximum 6 logos partenaires');
          return;
        }
        const newPartners = [...formData.partner_logos, file_url];
        await handleUpdate('partner_logos', newPartners);
      }
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleRemoveImage = async (type, index) => {
    if (type === 'banner') {
      const newBanners = formData.banner_images.filter((_, i) => i !== index);
      await handleUpdate('banner_images', newBanners);
    } else if (type === 'payment') {
      const newMethods = formData.payment_methods.filter((_, i) => i !== index);
      await handleUpdate('payment_methods', newMethods);
    } else if (type === 'partner') {
      const newPartners = formData.partner_logos.filter((_, i) => i !== index);
      await handleUpdate('partner_logos', newPartners);
    }
  };

  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full max-w-2xl">
        <TabsTrigger value="basic" className="flex items-center gap-2">
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline">Informations</span>
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Apparence</span>
        </TabsTrigger>
        <TabsTrigger value="social" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Réseaux</span>
        </TabsTrigger>
        <TabsTrigger value="payment" className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Paiement</span>
        </TabsTrigger>
      </TabsList>

      {/* Informations de base */}
      <TabsContent value="basic" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de la boutique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de la boutique</Label>
              <Input
                value={formData.shop_name}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                onBlur={() => handleUpdate('shop_name', formData.shop_name)}
                placeholder="Ma Boutique"
              />
            </div>
            <div>
              <Label>Adresse physique</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                onBlur={() => handleUpdate('address', formData.address)}
                placeholder="123 Rue Exemple, Dakar"
              />
            </div>
            <div>
              <Label>Email de contact</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleUpdate('email', formData.email)}
                placeholder="contact@maboutique.sn"
              />
            </div>
            <div>
              <Label>Numéro WhatsApp</Label>
              <Input
                value={formData.whatsapp_number}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Apparence */}
      <TabsContent value="appearance" className="space-y-6">
        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logo de la boutique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.logo_url && (
              <div className="flex items-center gap-4">
                <img 
                  src={formData.logo_url} 
                  alt="Logo"
                  className="w-20 h-20 rounded-full object-cover border-2"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUpdate('logo_url', '')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            )}
            
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload('logo', e.target.files[0])}
              disabled={uploading.logo}
              className="hidden"
              id="logo-upload"
            />
            <Label htmlFor="logo-upload">
              <Button variant="outline" disabled={uploading.logo} asChild>
                <span>
                  {uploading.logo ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {formData.logo_url ? 'Changer' : 'Ajouter un logo'}
                </span>
              </Button>
            </Label>
          </CardContent>
        </Card>

        {/* Bannières */}
        <Card>
          <CardHeader>
            <CardTitle>Bannières (Slider) - Max 3 images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.banner_images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.banner_images.map((banner, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={banner} 
                      alt={`Bannière ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage('banner', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {formData.banner_images.length < 3 && (
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload('banner', e.target.files[0])}
                  disabled={uploading.banner}
                  className="hidden"
                  id="banner-upload"
                />
                <Label htmlFor="banner-upload">
                  <Button variant="outline" disabled={uploading.banner} asChild>
                    <span>
                      {uploading.banner ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Ajouter une bannière
                    </span>
                  </Button>
                </Label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Couleurs */}
        <Card>
          <CardHeader>
            <CardTitle>Couleurs de la boutique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Couleur principale</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleUpdate('primary_color', e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => handleUpdate('primary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label>Couleur secondaire</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => handleUpdate('secondary_color', e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => handleUpdate('secondary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 border rounded-lg">
              <Label className="mb-3 block">Aperçu des couleurs</Label>
              <div className="flex gap-3">
                <div 
                  className="h-20 flex-1 rounded-lg shadow-sm flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: formData.primary_color }}
                >
                  Principale
                </div>
                <div 
                  className="h-20 flex-1 rounded-lg shadow-sm flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: formData.secondary_color }}
                >
                  Secondaire
                </div>
                <div 
                  className="h-20 flex-1 rounded-lg shadow-sm flex items-center justify-center text-white font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`
                  }}
                >
                  Gradient
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Options d'affichage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Afficher les produits populaires</Label>
              <Switch
                id="featured"
                checked={formData.show_featured_products}
                onCheckedChange={(checked) => handleUpdate('show_featured_products', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Réseaux sociaux */}
      <TabsContent value="social" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Réseaux sociaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>TikTok (ex: @maboutique)</Label>
              <Input
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                onBlur={() => handleUpdate('tiktok', formData.tiktok)}
                placeholder="@maboutique"
              />
            </div>
            <div>
              <Label>Instagram (ex: @maboutique)</Label>
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                onBlur={() => handleUpdate('instagram', formData.instagram)}
                placeholder="@maboutique"
              />
            </div>
            <div>
              <Label>Facebook (URL de la page)</Label>
              <Input
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                onBlur={() => handleUpdate('facebook', formData.facebook)}
                placeholder="https://facebook.com/maboutique"
              />
            </div>
            <div>
              <Label>WhatsApp Business (si différent)</Label>
              <Input
                value={formData.whatsapp_business}
                onChange={(e) => setFormData({ ...formData, whatsapp_business: e.target.value })}
                onBlur={() => handleUpdate('whatsapp_business', formData.whatsapp_business)}
                placeholder="+221771234567"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Paiement & Partenaires */}
      <TabsContent value="payment" className="space-y-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Méthodes de paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.payment_methods.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {formData.payment_methods.map((logo, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={logo} 
                      alt={`Paiement ${index + 1}`}
                      className="h-12 object-contain border rounded p-2"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage('payment', index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload('payment', e.target.files[0])}
              disabled={uploading.payment}
              className="hidden"
              id="payment-upload"
            />
            <Label htmlFor="payment-upload">
              <Button variant="outline" disabled={uploading.payment} asChild>
                <span>
                  {uploading.payment ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Ajouter une méthode
                </span>
              </Button>
            </Label>
          </CardContent>
        </Card>

        {/* Partners */}
        <Card>
          <CardHeader>
            <CardTitle>Logos partenaires - Max 6</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.partner_logos.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {formData.partner_logos.map((logo, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={logo} 
                      alt={`Partenaire ${index + 1}`}
                      className="h-16 object-contain border rounded p-2"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage('partner', index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {formData.partner_logos.length < 6 && (
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload('partner', e.target.files[0])}
                  disabled={uploading.partner}
                  className="hidden"
                  id="partner-upload"
                />
                <Label htmlFor="partner-upload">
                  <Button variant="outline" disabled={uploading.partner} asChild>
                    <span>
                      {uploading.partner ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Ajouter un partenaire
                    </span>
                  </Button>
                </Label>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}