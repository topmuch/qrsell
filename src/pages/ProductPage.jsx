import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Loader2, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const publicId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    if (publicId) {
      loadProduct();
    }
  }, [publicId]);

  const loadProduct = async () => {
    try {
      const products = await base44.entities.Product.filter({ public_id: publicId });
      
      if (products.length === 0) {
        setLoading(false);
        return;
      }

      const foundProduct = products[0];
      setProduct(foundProduct);

      const sellers = await base44.entities.Seller.filter({ created_by: foundProduct.seller_email });
      if (sellers.length > 0) {
        setSeller(sellers[0]);
      }
    } catch (err) {
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!seller || !product) return;

    const message = encodeURIComponent(
      `Bonjour, je suis intéressé(e) par votre produit:\n\n` +
      `📦 ${product.name}\n` +
      `💰 ${product.price?.toLocaleString()} FCFA\n\n` +
      `Pourriez-vous me donner plus d'informations ?`
    );

    const whatsappUrl = `https://wa.me/${seller.whatsapp_number.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="max-w-md text-center p-8">
          <CardContent>
            <h1 className="text-2xl font-bold mb-4">Produit introuvable</h1>
            <p className="text-gray-600">Ce produit n'existe pas ou a été supprimé.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden shadow-2xl border-2">
            {product.image_url && (
              <div className="relative h-96 bg-gray-200">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="p-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-3">{product.name}</h1>
                <p className="text-5xl font-bold text-[#ed477c]">
                  {product.price?.toLocaleString()} FCFA
                </p>
              </div>

              {product.description && (
                <p className="text-lg text-gray-700 mb-8">
                  {product.description}
                </p>
              )}

              {seller && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Vendu par</p>
                  <p className="text-xl font-semibold">{seller.full_name}</p>
                </div>
              )}

              <Button 
                onClick={handleWhatsAppContact}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-8 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="mr-3 w-6 h-6" />
                Commander sur WhatsApp
              </Button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Vous serez redirigé vers WhatsApp pour finaliser votre commande
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <div className="w-8 h-8 bg-[#ed477c] rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">Propulsé par TikTokQR</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}