import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  Loader2, 
  X, 
  Image as ImageIcon,
  Store,
  Palette,
  Globe,
  CreditCard,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsTabs({ seller }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState({
    logo: false,
    banner: false,
    payment: false,
    partner: false
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Seller.update(seller.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller']);
      toast.success('Modifications enregistrées');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading({ ...uploading, logo: true });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateMutation.mutateAsync({ logo_url: file_url });
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading({ ...uploading, logo: false });
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const currentBanners = seller.banner_images || [];
    if (currentBanners.length >= 3) {
      toast.error('Maximum 3 images');
      return;
    }

    setUploading({ ...uploading, banner: true });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateMutation.mutateAsync({ 
        banner_images: [...currentBanners, file_url] 
      });
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading({ ...uploading, banner: false });
    }
  };

  const handleRemoveBanner = async (index) => {
    const newBanners = seller.banner_images.filter((_, i) => i !== index);
    await updateMutation.mutateAsync({ banner_images: newBanners });
  };

  const handlePaymentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading({ ...uploading, payment: true });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const current = seller.payment_methods || [];
      await updateMutation.mutateAsync({ 
        payment_methods: [...current, file_url] 
      });
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading({ ...uploading, payment: false });
    }
  };

  const handleRemovePayment = async (index) => {
    const newMethods = seller.payment_methods.filter((_, i) => i !== index);
    await updateMutation.mutateAsync({ payment_methods: newMethods });
  };

  const handlePartnerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const current = seller.partner_logos || [];
    if (current.length >= 6) {
      toast.error('Maximum 6 partenaires');
      return;
    }

    setUploading({ ...uploading, partner: true });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateMutation.mutateAsync({ 
        partner_logos: [...current, file_url] 
      });
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading({ ...uploading, partner: false });
    }
  };

  const handleRemovePartner = async (index) => {
    const newPartners = seller.partner_logos.filter((_, i) => i !== index);
    await updateMutation.mutateAsync({ partner_logos: newPartners });
  };

  const handleFieldUpdate = async (field, value) => {
    await updateMutation.mutateAsync({ [field]: value });
  };

  const tabs = [
    { id: 'basic', label: 'Informations', icon: Store },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'social', label: 'Réseaux sociaux', icon: Globe },
    { id: 'payment', label: 'Paiement & Partenaires', icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom de la boutique</Label>
                <p className="text-lg font-medium text-gray-900 mt-1">{seller.shop_name}</p>
              </div>
              <div>
                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={seller.whatsapp_number || ''}
                  onChange={(e) => handleFieldUpdate('whatsapp_number', e.target.value)}
                  placeholder="+221771234567"
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse physique</Label>
                <Textarea
                  id="address"
                  value={seller.address || ''}
                  onChange={(e) => handleFieldUpdate('address', e.target.value)}
                  placeholder="Dakar, Sénégal"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="email">Email de contact (optionnel)</Label>
                <Input
                  id="email"
                  type="email"
                  value={seller.email || ''}
                  onChange={(e) => handleFieldUpdate('email', e.target.value)}
                  placeholder="contact@boutique.com"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
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
              {seller.logo_url && (
                <div className="flex items-center gap-4">
                  <img 
                    src={seller.logo_url} 
                    alt="Logo"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleFieldUpdate('logo_url', '')}
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
                      {seller.logo_url ? 'Changer le logo' : 'Ajouter un logo'}
                    </span>
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Bannières */}
          <Card>
            <CardHeader>
              <CardTitle>Bannières (Slider) - Max 3 images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {seller.banner_images && seller.banner_images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {seller.banner_images.map((banner, index) => (
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

              {(!seller.banner_images || seller.banner_images.length < 3) && (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
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
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Couleurs de la boutique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Couleur principale</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    type="color"
                    value={seller.primary_color || '#2563eb'}
                    onChange={(e) => handleFieldUpdate('primary_color', e.target.value)}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={seller.primary_color || '#2563eb'}
                    onChange={(e) => handleFieldUpdate('primary_color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Couleur secondaire</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    type="color"
                    value={seller.secondary_color || '#3b82f6'}
                    onChange={(e) => handleFieldUpdate('secondary_color', e.target.value)}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={seller.secondary_color || '#3b82f6'}
                    onChange={(e) => handleFieldUpdate('secondary_color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Aperçu */}
              <div className="mt-6 p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-3">Aperçu des couleurs :</p>
                <div className="flex gap-3">
                  <div 
                    className="flex-1 h-16 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${seller.primary_color || '#2563eb'} 0%, ${seller.secondary_color || '#3b82f6'} 100%)`
                    }}
                  >
                    Bouton Commander
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'social' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Réseaux sociaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tiktok">TikTok (ex: @maboutique)</Label>
              <Input
                id="tiktok"
                value={seller.tiktok || ''}
                onChange={(e) => handleFieldUpdate('tiktok', e.target.value)}
                placeholder="@maboutique"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={seller.instagram || ''}
                onChange={(e) => handleFieldUpdate('instagram', e.target.value)}
                placeholder="@maboutique"
              />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook (URL complète)</Label>
              <Input
                id="facebook"
                value={seller.facebook || ''}
                onChange={(e) => handleFieldUpdate('facebook', e.target.value)}
                placeholder="https://facebook.com/maboutique"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp_business">WhatsApp Business (si différent)</Label>
              <Input
                id="whatsapp_business"
                value={seller.whatsapp_business || ''}
                onChange={(e) => handleFieldUpdate('whatsapp_business', e.target.value)}
                placeholder="+221771234567"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6">
          {/* Méthodes de paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Méthodes de paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {seller.payment_methods && seller.payment_methods.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {seller.payment_methods.map((logo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={logo} 
                        alt={`Paiement ${index + 1}`}
                        className="h-14 object-contain border rounded p-2"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePayment(index)}
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
                  onChange={handlePaymentUpload}
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
              </div>
            </CardContent>
          </Card>

          {/* Partenaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Logos partenaires - Max 6
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {seller.partner_logos && seller.partner_logos.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {seller.partner_logos.map((logo, index) => (
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

              {(!seller.partner_logos || seller.partner_logos.length < 6) && (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePartnerUpload}
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
        </div>
      )}
    </div>
  );
}