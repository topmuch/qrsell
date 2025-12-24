import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, Loader2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image_url: ''
  });
  
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      setImagePreview(URL.createObjectURL(file));
    } catch (err) {
      setError('Erreur lors de l\'upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const generatePublicId = async () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PROD-${timestamp}-${random}`;
  };

  const generateQRCodeUrl = async (productUrl) => {
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(productUrl)}`;
      return qrApiUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price) {
      setError('Le nom et le prix sont requis');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Le prix doit être un nombre positif');
      return;
    }

    if (formData.description && formData.description.length > 100) {
      setError('La description ne doit pas dépasser 100 caractères');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      const publicId = await generatePublicId();
      const productUrl = `${window.location.origin}/p/${publicId}`;
      const qrCodeUrl = await generateQRCodeUrl(productUrl);

      await base44.entities.Product.create({
        name: formData.name,
        price: price,
        description: formData.description || '',
        image_url: formData.image_url || '',
        seller_email: user.email,
        public_id: publicId,
        qr_code_url: qrCodeUrl,
        is_active: true
      });

      navigate(createPageUrl('Dashboard'));
    } catch (err) {
      setError('Erreur lors de la création: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Dashboard'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Ajouter un nouveau produit</CardTitle>
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
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Robe élégante"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Prix (FCFA) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15000"
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description courte</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du produit (max 100 caractères)"
                    maxLength={100}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/100 caractères
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image du produit</Label>
                  <div className="flex flex-col gap-4">
                    {imagePreview && (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <label 
                      htmlFor="image" 
                      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#ed477c] transition-colors"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-[#ed477c]" />
                          <span>Upload en cours...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">
                            {imagePreview ? 'Changer l\'image' : 'Choisir une image'}
                          </span>
                        </>
                      )}
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Format: JPG, PNG (max 5 MB)</p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || uploading}
                  className="w-full bg-[#ed477c] hover:bg-[#d63d6c] text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    'Créer le produit'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}