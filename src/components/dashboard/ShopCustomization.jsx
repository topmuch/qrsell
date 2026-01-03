import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ShopCustomization({ seller }) {
  const [formData, setFormData] = useState({
    logo_url: seller?.logo_url || '',
    banner_url: seller?.banner_url || '',
    primary_color: seller?.primary_color || '#ed477c',
    secondary_color: seller?.secondary_color || '#ff6b9d',
    address: seller?.address || '',
    email: seller?.email || '',
    tiktok: seller?.tiktok || '',
    instagram: seller?.instagram || '',
    facebook: seller?.facebook || '',
    whatsapp_business: seller?.whatsapp_business || ''
  });
  const [uploading, setUploading] = useState({ logo: false, banner: false });
  
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Seller.update(seller.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller']);
    }
  });

  const handleImageUpload = async (file, type) => {
    if (!file || file.size > 5 * 1024 * 1024) {
      alert('Image trop volumineuse (max 5 Mo)');
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ 
        ...prev, 
        [type === 'logo' ? 'logo_url' : 'banner_url']: file_url 
      }));
    } catch (error) {
      alert('Erreur lors du téléchargement');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personnalisation de la vitrine</CardTitle>
        <CardDescription>Personnalisez l'apparence de votre boutique</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo */}
        <div>
          <Label>Logo de la boutique</Label>
          <div className="flex items-center gap-4 mt-2">
            {formData.logo_url ? (
              <img 
                src={formData.logo_url} 
                alt="Logo" 
                className="w-16 h-16 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <label className="cursor-pointer">
              <Button 
                type="button" 
                variant="outline" 
                disabled={uploading.logo}
                asChild
              >
                <span>
                  {uploading.logo ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upload...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Choisir</>
                  )}
                </span>
              </Button>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
              />
            </label>
          </div>
        </div>

        {/* Banner */}
        <div>
          <Label>Bannière (optionnel)</Label>
          <div className="mt-2">
            {formData.banner_url ? (
              <div className="relative">
                <img 
                  src={formData.banner_url} 
                  alt="Banner" 
                  className="w-full h-32 rounded-lg object-cover border"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                >
                  Retirer
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="w-full h-32 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
                  {uploading.banner ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <span className="text-sm text-gray-500">Ajouter une bannière</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
                />
              </label>
            )}
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Couleur principale</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={formData.secondary_color}
                onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-gray-900">Informations de contact</h3>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Rue de Dakar, Sénégal"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optionnel)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contact@maboutique.com"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-gray-900">Réseaux sociaux</h3>
          
          <div className="space-y-2">
            <Label htmlFor="tiktok">TikTok</Label>
            <Input
              id="tiktok"
              value={formData.tiktok}
              onChange={(e) => setFormData(prev => ({ ...prev, tiktok: e.target.value }))}
              placeholder="@maboutique"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
              placeholder="@maboutique"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook (URL)</Label>
            <Input
              id="facebook"
              value={formData.facebook}
              onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
              placeholder="https://facebook.com/maboutique"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_business">WhatsApp Business (si différent)</Label>
            <Input
              id="whatsapp_business"
              value={formData.whatsapp_business}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_business: e.target.value }))}
              placeholder="+221 77 123 45 67"
            />
          </div>
        </div>

        {/* Preview */}
        <div>
          <Label>Aperçu</Label>
          <div 
            className="mt-2 p-6 rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})`
            }}
          >
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="font-semibold text-gray-900">Votre boutique</p>
              <p className="text-sm text-gray-500">Aperçu des couleurs</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="w-full bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white"
        >
          {updateMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
          ) : (
            'Enregistrer les modifications'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}