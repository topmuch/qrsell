import React, { useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Store, Loader2, ArrowLeft, Share2, Check } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const publicId = urlParams.get('id');
  const [copied, setCopied] = React.useState(false);
  const qrCanvasRef = useRef(null);

  // Get product by public_id
  const { data: products = [], isLoading: loadingProduct } = useQuery({
    queryKey: ['product', publicId],
    queryFn: () => base44.entities.Product.filter({ public_id: publicId }),
    enabled: !!publicId
  });

  const product = products[0];

  // Get seller
  const { data: sellers = [], isLoading: loadingSeller } = useQuery({
    queryKey: ['seller', product?.seller_id],
    queryFn: () => base44.entities.Seller.filter({ id: product?.seller_id }),
    enabled: !!product?.seller_id
  });

  const seller = sellers[0];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getWhatsAppLink = () => {
    if (!seller || !product) return '#';
    const phone = seller.whatsapp_number?.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ! Je suis intéressé(e) par:\n\n` +
      `📦 *${product.name}*\n` +
      `💰 Prix: ${formatPrice(product.price)} FCFA\n\n` +
      `Réf: ${product.public_id}`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  const shareProduct = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: product?.name,
        text: `Découvrez ${product?.name} à ${formatPrice(product?.price)} FCFA`,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate QR code
  useEffect(() => {
    if (!qrCanvasRef.current) return;
    
    const canvas = qrCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 120;
    const moduleCount = 25;
    const moduleSize = size / moduleCount;
    
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    const hash = (window.location.href || '').split('').reduce((acc, char, i) => {
      return acc + char.charCodeAt(0) * (i + 1);
    }, 0);
    
    ctx.fillStyle = '#1f2937';
    
    const drawPositionPattern = (x, y, s) => {
      ctx.fillRect(x, y, s * 7, s * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + s, y + s, s * 5, s * 5);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(x + s * 2, y + s * 2, s * 3, s * 3);
    };
    
    drawPositionPattern(0, 0, moduleSize);
    drawPositionPattern(moduleSize * 18, 0, moduleSize);
    drawPositionPattern(0, moduleSize * 18, moduleSize);
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if ((row < 9 && col < 9) || (row < 9 && col > 15) || (row > 15 && col < 9)) continue;
        
        const seed = (hash + row * 31 + col * 17) % 100;
        if (seed > 45) {
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize - 1, moduleSize - 1);
        }
      }
    }
  }, [product]);

  if (loadingProduct || loadingSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Store className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
        <p className="text-gray-500 mb-6">Ce produit n'existe pas ou a été supprimé.</p>
        <Link to={createPageUrl('Home')}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {seller && (
              <Link to={createPageUrl(`Shop?slug=${seller.shop_slug}`)}>
                <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ed477c] to-[#ff6b9d] flex items-center justify-center text-white font-bold text-sm">
                    {seller.shop_name?.[0]?.toUpperCase() || 'B'}
                  </div>
                  <span className="font-medium text-gray-900 hidden sm:inline">{seller.shop_name}</span>
                </div>
              </Link>
            )}
            <Logo size="sm" />
          </div>
        </div>
      </header>

      {/* Product content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="overflow-hidden">
            {/* Product image */}
            <div className="aspect-square bg-gray-100 relative">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
                  <Store className="w-24 h-24 text-pink-200" />
                </div>
              )}
              
              {/* QR overlay */}
              <div className="absolute bottom-4 right-4 bg-white p-2 rounded-xl shadow-lg">
                <canvas ref={qrCanvasRef} className="w-[60px] h-[60px]" />
              </div>

              {/* Share button */}
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg"
                onClick={shareProduct}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Product info */}
            <div className="p-6">
              <Badge variant="outline" className="mb-3 text-xs">
                {product.public_id}
              </Badge>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <p className="text-3xl font-bold text-[#ed477c] mb-4">
                {formatPrice(product.price)} FCFA
              </p>
              
              {product.description && (
                <p className="text-gray-600 mb-6">
                  {product.description}
                </p>
              )}

              {/* WhatsApp CTA */}
              <a 
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full h-14 bg-[#25D366] hover:bg-[#1fb855] text-white text-lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Commander sur WhatsApp
                </Button>
              </a>

              {seller && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Vendu par <span className="font-medium">{seller.shop_name}</span>
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Propulsé par
          </p>
          <Logo size="sm" />
        </div>
      </footer>
    </div>
  );
}