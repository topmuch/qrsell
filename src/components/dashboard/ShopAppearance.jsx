import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Upload, 
  Loader2, 
  X, 
  Image as ImageIcon,
  Palette,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShopAppearance({ seller }) {
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [uploadingPartner, setUploadingPartner] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    logo_url: seller?.logo_url || '',
    banner_images: seller?.banner_images || [],
    primary_color: seller?.primary_color || '#2563eb',
    secondary_color: seller?.secondary_color || '#3b82f6',
    show_featured_products: seller?.show_featured_products ?? true,
    payment_methods: seller?.payment_methods || [],
    partner_logos: seller?.partner_logos || []
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Seller.update(seller.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller']);
      toast.success('Apparence mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
      await updateMutation.mutateAsync({ logo_url: file_url });
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (formData.banner_images.length >= 3) {
      toast.error('Maximum 3 images de bannière');
      return;
    }

    setUploadingBanner(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newBanners = [...formData.banner_images, file_url];
      setFormData({ ...formData, banner_images: newBanners });
      await updateMutation.mutateAsync({ banner_images: newBanners });
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleRemoveBanner = async (index) => {
    const newBanners = formData.banner_images.filter((_, i) => i !== index);
    setFormData({ ...formData, banner_images: newBanners });
    await updateMutation.mutateAsync({ banner_images: newBanners });
  };

  const handlePaymentMethodUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPayment(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newMethods = [...formData.payment_methods, file_url];
      setFormData({ ...formData, payment_methods: newMethods });
      await updateMutation.mutateAsync({ payment_methods: newMethods });
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploadingPayment(false);
    }
  };

  const handleRemovePaymentMethod = async (index) => {
    const newMethods = formData.payment_methods.filter((_, i) => i !== index);
    setFormData({ ...formData, payment_methods: newMethods });
    await updateMutation.mutateAsync({ payment_methods: newMethods });
  };

  const handlePartnerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (formData.partner_logos.length >= 6) {
      toast.error('Maximum 6 logos partenaires');
      return;
    }

    setUploadingPartner(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newPartners = [...formData.partner_logos, file_url];
      setFormData({ ...formData, partner_logos: newPartners });
      await updateMutation.mutateAsync({ partner_logos: newPartners });
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploadingPartner(false);
    }
  };

  const handleRemovePartner = async (index) => {
    const newPartners = formData.partner_logos.filter((_, i) => i !== index);
    setFormData({ ...formData, partner_logos: newPartners });
    await updateMutation.mutateAsync({ partner_logos: newPartners });
  };

  const handleColorChange = async (field, value) => {
    setFormData({ ...formData, [field]: value });
    await updateMutation.mutateAsync({ [field]: value });
  };

  const handleToggleFeature = async (field, value) => {
    setFormData({ ...formData, [field]: value });
    await updateMutation.mutateAsync({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo de la boutique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.logo_url && (
            <div className="flex items-center gap-4">
              <img 
                src={formData.logo_url} 
                alt="Logo"
                className="w-20 h-20 rounded-full object-cover border"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleColorChange('logo_url', '')}
              >
                <X className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          )}
          
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
              className="hidden"
              id="logo-upload"
            />
            <Label htmlFor="logo-upload">
              <Button variant="outline" disabled={uploading} asChild>
                <span>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {formData.logo_url ? 'Changer le logo' : 'Ajouter un logo'}
                </span>
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Bannières */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Bannières (Slider) - Max 3 images
          </CardTitle>
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
                    onClick={() => handleRemoveBanner(index)}
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
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
                className="hidden"
                id="banner-upload"
              />
              <Label htmlFor="banner-upload">
                <Button variant="outline" disabled={uploadingBanner} asChild>
                  <span>
                    {uploadingBanner ? (
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

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Couleurs de la boutique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Couleur principale</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="color"
                value={formData.primary_color}
                onChange={(e) => handleColorChange('primary_color', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.primary_color}
                onChange={(e) => handleColorChange('primary_color', e.target.value)}
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
                onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.secondary_color}
                onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Méthodes de paiement
          </CardTitle>
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
                    onClick={() => handleRemovePaymentMethod(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handlePaymentMethodUpload}
              disabled={uploadingPayment}
              className="hidden"
              id="payment-upload"
            />
            <Label htmlFor="payment-upload">
              <Button variant="outline" disabled={uploadingPayment} asChild>
                <span>
                  {uploadingPayment ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Ajouter une méthode
                </span>
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logos partenaires - Max 6
          </CardTitle>
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
                    onClick={() => handleRemovePartner(index)}
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
                onChange={handlePartnerUpload}
                disabled={uploadingPartner}
                className="hidden"
                id="partner-upload"
              />
              <Label htmlFor="partner-upload">
                <Button variant="outline" disabled={uploadingPartner} asChild>
                  <span>
                    {uploadingPartner ? (
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

      {/* Features */}
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
              onCheckedChange={(checked) => handleToggleFeature('show_featured_products', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}