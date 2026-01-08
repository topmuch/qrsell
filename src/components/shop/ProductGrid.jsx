import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import LazyImage from '@/components/seo/LazyImage';
import ProductVariants from './ProductVariants';

export default function ProductGrid({ products, seller, onWhatsAppClick, showQR = false }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const generateWhatsAppMessage = (product) => {
    return `Merci d'avoir scanné le QR Code pour le produit ${product.name} ! 😊

Voici un petit résumé du produit :

Nom du produit : ${product.name}
Prix : ${formatPrice(product.price)} FCFA
${product.description ? `Description rapide : ${product.description}` : ''}
${product.image_url ? `\nPhoto : ${product.image_url}` : ''}

Si vous souhaitez procéder à l'achat, il vous suffit de répondre avec "Oui, je veux l'acheter" ou poser toutes vos questions ! Je suis là pour vous aider à finaliser votre commande.`;
  };

  const getWhatsAppLink = (product) => {
    const phone = seller?.whatsapp_number?.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(generateWhatsAppMessage(product));
    return `https://wa.me/${phone}?text=${message}`;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit disponible</h2>
        <p className="text-gray-500">Aucun produit ne correspond à vos critères.</p>
      </div>
    );
  }

  const ProductQRCode = ({ product }) => {
    const canvasRef = React.useRef(null);
    
    React.useEffect(() => {
      if (canvasRef.current) {
        const productUrl = `${window.location.origin}/ProductPage?id=${product.public_id}`;
        QRCode.toCanvas(canvasRef.current, productUrl, {
          width: 80,
          margin: 1,
          color: {
            dark: '#FF6B9D',
            light: '#FFFFFF'
          }
        });
      }
    }, [product]);

    return (
      <div className="flex flex-col items-center gap-1 mt-3 p-2 bg-pink-50 rounded-lg">
        <canvas ref={canvasRef} className="rounded" />
        <p className="text-[10px] text-center text-gray-500 leading-tight">
          Scannez-moi pour voir comment vos clients vous contactent !
        </p>
      </div>
    );
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" itemScope itemType="https://schema.org/ItemList">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/Product"
        >
          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group h-full flex flex-col border-0 shadow-md bg-white">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              {product.image_url ? (
                <LazyImage 
                  src={product.image_url} 
                  alt={`${product.name} - ${seller?.shop_name || 'ShopQR'}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <Store className="w-16 h-16 text-gray-200" />
                </div>
              )}
              {product.image_url && <meta itemProp="image" content={product.image_url} />}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.is_new && (
                  <Badge className="bg-blue-500 text-white shadow-lg font-semibold">✨ Nouveauté</Badge>
                )}
                {product.is_on_promo && (
                  <Badge className="bg-red-500 text-white shadow-lg font-semibold">🔥 Promo</Badge>
                )}
                {product.is_out_of_stock && (
                  <Badge className="bg-gray-800 text-white shadow-lg font-semibold">Rupture</Badge>
                )}
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 leading-tight" itemProp="name">
                {product.name}
              </h3>
              
              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed" itemProp="description">
                  {product.description}
                </p>
              )}
              
              <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <p className="text-3xl font-black text-[#10B981] mb-4">
                  <span itemProp="price" content={product.price}>{formatPrice(product.price)}</span> 
                  <span className="text-lg" itemProp="priceCurrency" content="XOF">FCFA</span>
                </p>
                <meta itemProp="availability" content={product.is_out_of_stock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"} />
              </div>

              {/* Product Variants */}
              <ProductVariants product={product} seller={seller} />
              
              <a 
                href={getWhatsAppLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-auto"
                onClick={() => onWhatsAppClick(product)}
              >
                <Button 
                  className="w-full text-white font-bold text-base py-6 shadow-lg hover:shadow-xl transition-all"
                  style={{
                    background: '#FF6B9D'
                  }}
                  disabled={product.is_out_of_stock}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {product.is_out_of_stock ? 'Indisponible' : '💬 Commander sur WhatsApp'}
                </Button>
              </a>
              
              {showQR && !product.is_out_of_stock && <ProductQRCode product={product} />}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}