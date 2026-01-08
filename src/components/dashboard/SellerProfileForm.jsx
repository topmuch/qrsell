import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { Loader2, Check, AlertCircle, Store, Phone, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDefaultTemplateByCategory } from './TemplateSelector';

export default function SellerProfileForm({ user, onProfileComplete }) {
  const [formData, setFormData] = useState({
    full_name: '',
    whatsapp_number: '',
    shop_slug: '',
    shop_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [error, setError] = useState('');
  const [prefilledData, setPrefilledData] = useState(false);

  // Load subscription request data on mount
  useEffect(() => {
    const loadRequestData = async () => {
      try {
        const requests = await base44.entities.SubscriptionRequest.filter({ 
          user_email: user.email,
          status: 'approved'
        });
        
        if (requests.length > 0) {
          const request = requests[0];
          setFormData({
            full_name: request.full_name || '',
            whatsapp_number: request.phone || '',
            shop_slug: request.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30) || '',
            shop_name: request.business_name || ''
          });
          setPrefilledData(true);
          setSlugAvailable(true);
        }
      } catch (error) {
        console.error('Error loading request data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRequestData();
  }, [user.email]);

  // Generate slug from shop name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 30);
  };

  // Check if slug is available
  const checkSlugAvailability = async (slug) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }
    
    setCheckingSlug(true);
    const existing = await base44.entities.Seller.filter({ shop_slug: slug });
    setSlugAvailable(existing.length === 0);
    setCheckingSlug(false);
  };

  // Debounce slug check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.shop_slug) {
        checkSlugAvailability(formData.shop_slug);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.shop_slug]);

  const handleShopNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      shop_name: name,
      shop_slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate WhatsApp number
    const phoneRegex = /^\+?[1-9]\d{8,14}$/;
    if (!phoneRegex.test(formData.whatsapp_number.replace(/\s/g, ''))) {
      setError('Veuillez entrer un numéro WhatsApp valide (format international)');
      return;
    }

    if (!slugAvailable) {
      setError('Ce nom de boutique est déjà pris');
      return;
    }

    setLoading(true);
    
    try {
      const sellerData = {
        ...formData,
        is_subscribed: true,
        profile_completed: true
      };

      const newSeller = await base44.entities.Seller.create(sellerData);

      // Automatically create default shop
      await base44.entities.Shop.create({
        seller_id: newSeller.id,
        shop_name: formData.shop_name,
        shop_slug: formData.shop_slug,
        primary_color: '#4CAF50',
        secondary_color: '#45a049',
        category: 'Autre',
        whatsapp_number: formData.whatsapp_number,
        is_active: true
      });

      onProfileComplete();
    } catch (error) {
      setError('Erreur lors de la création du profil');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-[#ed477c] to-[#ff6b9d] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Créez votre profil vendeur</CardTitle>
          <CardDescription>
            {prefilledData 
              ? "Ces informations ont été récupérées depuis votre inscription. Vous pouvez les modifier si nécessaire."
              : "Ces informations seront utilisées pour votre boutique"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Votre nom complet
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Aminata Diallo"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Numéro WhatsApp
              </Label>
              <Input
                id="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                placeholder="+221 77 123 45 67"
                required
                className="h-12"
              />
              <p className="text-xs text-gray-500">
                Format international avec indicatif pays
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop_name" className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-500" />
                Nom de votre boutique
              </Label>
              <Input
                id="shop_name"
                value={formData.shop_name}
                onChange={handleShopNameChange}
                placeholder="Ma Boutique Mode"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop_slug">URL de votre vitrine</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">tiktocqr.com/shop/</span>
                <div className="relative flex-1">
                  <Input
                    id="shop_slug"
                    value={formData.shop_slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, shop_slug: generateSlug(e.target.value) }))}
                    placeholder="ma_boutique"
                    required
                    className="h-12 pr-10"
                  />
                  {checkingSlug && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                  {!checkingSlug && slugAvailable === true && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {!checkingSlug && slugAvailable === false && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {slugAvailable === false && (
                <p className="text-xs text-red-500">Ce nom est déjà pris</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white text-lg"
              disabled={loading || checkingSlug || slugAvailable === false}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Création...
                </>
              ) : (
                'Créer ma boutique'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}