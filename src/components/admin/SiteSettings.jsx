import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Settings as SettingsIcon } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SiteSettings() {
  const [settings, setSettings] = useState({
    site_name: 'QRSell',
    logo_url: '',
    default_currency: 'FCFA',
    default_language: 'fr',
    smtp_host: '',
    smtp_port: '587',
    smtp_email: '',
    smtp_api_key: ''
  });
  const [success, setSuccess] = useState(false);

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
          logo_url: data.logo_url || '',
          default_currency: data.default_currency || 'FCFA',
          default_language: data.default_language || 'fr',
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port || '587',
          smtp_email: data.smtp_email || '',
          smtp_api_key: data.smtp_api_key || ''
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
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

      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✅ Paramètres enregistrés avec succès !
          </AlertDescription>
        </Alert>
      )}

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
            <Label htmlFor="logo_url">URL du logo</Label>
            <Input
              id="logo_url"
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
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