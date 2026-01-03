import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Share2, 
  MessageCircle, 
  Loader2,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from 'qrcode';

export default function ProductPage() {
  const params = new URLSearchParams(window.location.search);
  const publicId = params.get('id');
  const [showQR, setShowQR] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  console.log('🔍 ProductPage - Public ID from URL:', publicId);

  // Get product by public_id
  const { data: products = [], isLoading: loadingProduct } = useQuery({
    queryKey: ['product', publicId],
    queryFn: async () => {
      console.log('📡 Fetching product with public_id:', publicId);
      const result = await base44.entities.Product.filter({ public_id: publicId });
      console.log('📦 Product fetch result:', result);
      return result;
    },
    enabled: !!publicId
  });

  const product = products[0];

  console.log('🔍 ProductPage - Product found:', product);

  // Get seller info
  const { data: seller, isLoading: loadingSeller } = useQuery({
    queryKey: ['seller', product?.seller_id],
    queryFn: async () => {
      console.log('📡 Fetching seller with ID:', product?.seller_id);
      const allSellers = await base44.entities.Seller.list();
      const foundSeller = allSellers.find(s => s.id === product?.seller_id);
      console.log('👤 Seller fetch result:', foundSeller);
      return foundSeller;
    },
    enabled: !!product?.seller_id
  });

  console.log('🔍 ProductPage - Seller found:', seller);

  // Track product view
  useEffect(() => {
    if (product && seller) {
      console.log('📊 Tracking analytics - Product view');
      console.log('Product ID:', product.id);
      console.log('Seller ID:', seller.id);
      console.log('Public ID:', product.public_id);
      
      base44.entities.Analytics.create({
        product_id: product.id,
        seller_id: seller.id,
        product_public_id: product.public_id,
        event_type: 'view_product',
        user_agent: navigator.userAgent
      }).then(() => {
        console.log('✅ Analytics tracked successfully');
      }).catch((error) => {
        console.error('❌ Analytics tracking error:', error);
      });
    }
  }, [product, seller]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const generateProfessionalWhatsAppMessage = () => {
    const now = new Date();
    const hour = now.getHours();
    
    let timePhrase = "";
    if (hour >= 6 && hour < 12) timePhrase = "ce matin";
    else if (hour >= 12 && hour < 18) timePhrase = "cet après-midi";
    else if (hour >= 18 && hour < 22) timePhrase = "ce soir";
    else timePhrase = "aujourd'hui";

    return `Bonjour, je souhaite commander le/la « ${product.name} » (${product.public_id}) à ${formatPrice(product.price)} FCFA.

${product.image_url || ''}

Est-ce toujours disponible ${timePhrase} ?`;
  };

  const handleWhatsAppClick = () => {
    if (!seller || !product) return;

    console.log('📱 WhatsApp click - Tracking analytics');
    
    // Track click
    base44.entities.Analytics.create({
      product_id: product.id,
      seller_id: seller.id,
      product_public_id: product.public_id,
      event_type: 'whatsapp_click',
      user_agent: navigator.userAgent
    }).then(() => {
      console.log('✅ WhatsApp click tracked');
    }).catch((error) => {
      console.error('❌ WhatsApp tracking error:', error);
    });

    // Redirect to WhatsApp
    const message = generateProfessionalWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${seller.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Découvrez ${product.name} à ${formatPrice(product.price)} FCFA sur QRSell`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!publicId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
            <p className="text-gray-600">L'identifiant du produit est manquant dans l'URL.</p>
            <p className="text-sm text-gray-500 mt-2">URL actuelle: {window.location.href}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingProduct || loadingSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
            <p className="text-gray-600">Ce produit n'existe pas ou a été supprimé.</p>
            <p className="text-sm text-gray-500 mt-2">Public ID recherché: {publicId}</p>
            <p className="text-sm text-gray-500">Vérifiez que le QR code est correct.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Vendeur introuvable</h2>
            <p className="text-gray-600">Les informations du vendeur ne sont pas disponibles.</p>
            <p className="text-sm text-gray-500 mt-2">Seller ID: {product.seller_id}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${seller.primary_color || '#ed477c'}15 0%, ${seller.secondary_color || '#ff6b9d'}15 100%)`
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Product Card */}
        <Card className="overflow-hidden">
          {/* Product Image */}
          <div className="relative h-80 bg-gray-100">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>
                  <p className="text-gray-500">Aucune image</p>
                </div>
              </div>
            )}
            
            {/* Share & QR buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-white/90 hover:bg-white"
                onClick={() => setShowQR(true)}
              >
                <QrCode className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <CardContent className="p-6 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p 
                className="text-3xl font-bold mb-4"
                style={{ color: seller.primary_color || '#ed477c' }}
              >
                {formatPrice(product.price)} FCFA
              </p>
              {product.description && (
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Seller Info */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-1">Vendu par</p>
              <div className="flex items-center gap-3">
                {seller.logo_url && (
                  <img 
                    src={seller.logo_url} 
                    alt={seller.shop_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{seller.shop_name || seller.full_name}</p>
                  {seller.is_verified && (
                    <span className="text-xs text-green-600">✓ Vendeur vérifié</span>
                  )}
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <Button
              onClick={handleWhatsAppClick}
              className="w-full h-14 text-lg font-semibold"
              style={{
                background: `linear-gradient(135deg, ${seller.primary_color || '#ed477c'} 0%, ${seller.secondary_color || '#ff6b9d'} 100%)`
              }}
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Commander sur WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <QRCodeModal 
          productUrl={window.location.href}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          url={window.location.href}
          title={product.name}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

// QR Code Modal Component
function QRCodeModal({ productUrl, onClose }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, productUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
    }
  }, [productUrl]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code de ce produit</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          <div className="bg-white p-4 rounded-xl border">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Scannez ce code pour accéder directement à ce produit
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Share Modal Component
function ShareModal({ url, title, onClose }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager ce produit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 break-all">{url}</p>
          </div>
          <Button onClick={handleCopy} className="w-full">
            {copied ? 'Lien copié !' : 'Copier le lien'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}