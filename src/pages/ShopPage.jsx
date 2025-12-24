import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Loader2, Store, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug');
  
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (slug) {
      loadShop();
    }
  }, [slug]);

  const loadShop = async () => {
    try {
      const sellers = await base44.entities.Seller.filter({ shop_slug: slug });
      
      if (sellers.length === 0) {
        setLoading(false);
        return;
      }

      const foundSeller = sellers[0];
      setSeller(foundSeller);

      const sellerProducts = await base44.entities.Product.filter(
        { seller_email: foundSeller.created_by, is_active: true },
        '-created_date'
      );
      setProducts(sellerProducts);
    } catch (err) {
      console.error('Error loading shop:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = (product) => {
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

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="max-w-md text-center p-8">
          <CardContent>
            <h1 className="text-2xl font-bold mb-4">Boutique introuvable</h1>
            <p className="text-gray-600">Cette boutique n'existe pas.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#ed477c] to-[#c93b63] rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{seller.full_name}</h1>
              <p className="text-gray-600">@{seller.shop_slug}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Aucun produit disponible</h3>
              <p className="text-gray-600">Cette boutique n'a pas encore de produits.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-8">Nos produits ({products.length})</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all border-2 hover:border-[#ed477c] h-full flex flex-col">
                    {product.image_url && (
                      <div className="relative h-56 bg-gray-200">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                      <p className="text-3xl font-bold text-[#ed477c] mb-3">
                        {product.price?.toLocaleString()} FCFA
                      </p>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-4 flex-1">
                          {product.description}
                        </p>
                      )}
                      <Button 
                        onClick={() => handleWhatsAppContact(product)}
                        className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white mt-auto"
                      >
                        <MessageCircle className="mr-2 w-4 h-4" />
                        Commander
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="w-8 h-8 bg-[#ed477c] rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">Propulsé par TikTokQR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}