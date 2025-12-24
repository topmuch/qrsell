import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from './utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    whatsapp_number: '',
    shop_slug: ''
  });
  
  const [slugStatus, setSlugStatus] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const sellers = await base44.entities.Seller.filter({ created_by: currentUser.email });
      if (sellers.length > 0) {
        navigate(createPageUrl('Dashboard'));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkSlugAvailability = async (slug) => {
    if (!slug || slug.length < 3) {
      setSlugStatus(null);
      return;
    }
    
    setCheckingSlug(true);
    try {
      const existing = await base44.entities.Seller.filter({ shop_slug: slug });
      setSlugStatus(existing.length === 0 ? 'available' : 'taken');
    } catch (err) {
      console.error('Error checking slug:', err);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSlugChange = (value) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setFormData({ ...formData, shop_slug: cleaned });
    
    const timeoutId = setTimeout(() => checkSlugAvailability(cleaned), 500);
    return () => clearTimeout(timeoutId);
  };

  const validateWhatsApp = (number) => {
    const regex = /^\+[1-9]\d{1,14}$/;
    return regex.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name || !formData.whatsapp_number || !formData.shop_slug) {
      setError('Tous les champs sont requis');
      return;
    }

    if (!validateWhatsApp(formData.whatsapp_number)) {
      setError('Format WhatsApp invalide. Utilisez le format international (ex: +221771234567)');
      return;
    }

    if (slugStatus !== 'available') {
      setError('Ce slug de boutique n\'est pas disponible');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Seller.create({
        ...formData,
        is_subscribed: true,
        subscription_date: new Date().toISOString().split('T')[0]
      });
      
      navigate(createPageUrl('Dashboard'));
    } catch (err) {
      setError('Erreur lors de la création du profil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#ed477c] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Créez votre profil vendeur</h1>
          <p className="text-gray-600">Complétez ces informations pour commencer à vendre</p>
        </div>

        <Card className="shadow-xl border-2">
          <CardHeader>
            <CardTitle>Informations de la boutique</CardTitle>
            <CardDescription>Ces informations seront visibles par vos clients</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Nom complet *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Ex: Aminata Diallo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Numéro WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="+221771234567"
                  required
                />
                <p className="text-xs text-gray-500">Format international requis (ex: +221771234567)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug de boutique *</Label>
                <div className="relative">
                  <Input
                    id="slug"
                    value={formData.shop_slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="ma_boutique_sn"
                    required
                    className="pr-10"
                  />
                  {checkingSlug && (
                    <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                  )}
                  {!checkingSlug && slugStatus === 'available' && (
                    <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                  )}
                  {!checkingSlug && slugStatus === 'taken' && (
                    <XCircle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Votre boutique sera accessible sur: tiktokqr.com/shop/{formData.shop_slug || 'votre_slug'}
                </p>
                {slugStatus === 'taken' && (
                  <p className="text-xs text-red-500">Ce slug est déjà pris</p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={saving || slugStatus !== 'available'}
                className="w-full bg-[#ed477c] hover:bg-[#d63d6c] text-white py-6 text-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer ma boutique'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}