import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Settings as SettingsIcon, Upload, Palette } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function SiteSettings() {
  const [settings, setSettings] = useState({
    site_name: 'QRSell',
    logo_url: 'https://drive.google.com/uc?export=view&id=1eveFkGHiW-tM5vck1UDR00SaO42huoKU',
    primary_color: '#2563eb',
    secondary_color: '#3b82f6',
    default_currency: 'FCFA',
    default_language: 'fr',
    smtp_host: '',
    smtp_port: '587',
    smtp_email: '',
    smtp_api_key: '',
    whatsapp_support: ''
  });
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      try {
        const allSettings = await base44.entities.SiteSettings.list();
        return allSettings[0] || null;
      } catch (error) {
        console.error('Error loading settings:', error);
        return null;
      }
    },
    onSuccess: (data) => {
      if (data) {
        setSettings({
          site_name: data.site_name || 'QRSell',
          logo_url: data.logo_url || 'https://drive.google.com/uc?export=view&id=1eveFkGHiW-tM5vck1UDR00SaO42huoKU',
          primary_color: data.primary_color || '#2563eb',
          secondary_color: data.secondary_color || '#3b82f6',
          default_currency: data.default_currency || 'FCFA',
          default_language: data.default_language || 'fr',
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port || '587',
          smtp_email: data.smtp_email || '',
          smtp_api_key: data.smtp_api_key || '',
          whatsapp_support: data.whatsapp_support || ''
        });
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (siteSettings?.id) {
        return base44.entities.SiteSettings.update(siteSettings.id, data);
      } else {
        return base44.entities.SiteSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['site-settings']);
      toast.success('✅ Paramètres mis à jour avec succès !');
      
      // Appliquer les changements en temps réel
      document.documentElement.style.setProperty('--primary-color', settings.primary_color);
      document.documentElement.style.setProperty('--secondary-color', settings.secondary_color);
    },
    onError: (error) => {
      toast.error(`❌ Échec de la sauvegarde : ${error.message}`);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setSettings({ ...settings, logo_url: result.file_url });
      toast.success('Logo uploadé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-[#2563eb]" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres du site</h2>
          <p className="text-gray-500 dark:text-gray-400">Configuration globale de la plateforme</p>
        </div>
      </div>

      {/* Général */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_name">Nom du site</Label>
            <Input
              id="site_name"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              placeholder="QRSell"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo du site</Label>
            <div className="flex gap-3">
              <Input
                id="logo_url"
                value={settings.logo_url}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="flex-1"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button type="button" variant="outline" disabled={uploading} asChild>
                    <span>
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            {settings.logo_url && (
              <div className="mt-2">
                <img 
                  src={settings.logo_url} 
                  alt="Logo preview" 
                  className="h-12 object-contain border rounded p-2"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Couleurs du site
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_color" className="text-xs text-gray-500">Couleur principale</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    id="primary_color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="flex-1"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary_color" className="text-xs text-gray-500">Couleur secondaire</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    id="secondary_color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="flex-1"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Devise par défaut</Label>
              <Select
                value={settings.default_currency}
                onValueChange={(value) => setSettings({ ...settings, default_currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCFA">FCFA (XOF)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="MAD">MAD (DH)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Langue par défaut</Label>
              <Select
                value={settings.default_language}
                onValueChange={(value) => setSettings({ ...settings, default_language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="wo">Wolof</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Support */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Support WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp_support">Numéro WhatsApp du support</Label>
            <Input
              id="whatsapp_support"
              value={settings.whatsapp_support}
              onChange={(e) => setSettings({ ...settings, whatsapp_support: e.target.value })}
              placeholder="+221771234567"
            />
            <p className="text-xs text-gray-500">
              Ce numéro sera utilisé pour le bouton WhatsApp flottant sur la page d'accueil. Format international requis (ex: +221771234567)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SMTP */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Configuration SMTP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">Hôte SMTP</Label>
              <Input
                id="smtp_host"
                value={settings.smtp_host}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                placeholder="smtp.resend.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_port">Port</Label>
              <Input
                id="smtp_port"
                value={settings.smtp_port}
                onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                placeholder="587"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_email">Email expéditeur</Label>
            <Input
              id="smtp_email"
              type="email"
              value={settings.smtp_email}
              onChange={(e) => setSettings({ ...settings, smtp_email: e.target.value })}
              placeholder="noreply@qrsell.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_api_key">Clé API SMTP</Label>
            <Input
              id="smtp_api_key"
              type="password"
              value={settings.smtp_api_key}
              onChange={(e) => setSettings({ ...settings, smtp_api_key: e.target.value })}
              placeholder="••••••••••••••••"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isLoading}
          className="bg-[#2563eb] hover:bg-[#1d4ed8]"
        >
          {saveMutation.isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  );
}