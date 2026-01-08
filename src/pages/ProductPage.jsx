import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Loader2,
  AlertCircle,
  Download,
  Truck,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle
} from 'lucide-react';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';

export default function ProductPage() {
  const params = new URLSearchParams(window.location.search);
  const publicId = params.get('id');
  const isLiveScan = params.get('live') === 'true';
  const [imageZoom, setImageZoom] = useState(false);
  const qrRef = useRef(null);

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

  // Fetch active live session if this is a live scan
  const { data: liveSessions = [] } = useQuery({
    queryKey: ['live-session-product-page', seller?.id],
    queryFn: () => base44.entities.LiveSession.filter({ seller_id: seller?.id, is_live: true }),
    enabled: !!seller?.id && isLiveScan,
    refetchInterval: 5000
  });

  const liveSession = liveSessions[0];
  const isFlashOfferActive = liveSession?.flash_offer_active && 
    liveSession?.flash_offer_ends_at && 
    new Date(liveSession.flash_offer_ends_at) > new Date();

  // Fetch similar products (same category, different product)
  const { data: similarProducts = [] } = useQuery({
    queryKey: ['similar-products', product?.category, product?.id],
    queryFn: async () => {
      if (!product?.category) return [];
      const allProducts = await base44.entities.Product.filter({ 
        category: product.category,
        is_active: true 
      });
      return allProducts.filter(p => p.id !== product.id).slice(0, 3);
    },
    enabled: !!product?.category
  });

  // Track scan and product view
  useEffect(() => {
    if (product && seller) {
      console.log('📊 Tracking analytics - Scan + Product view');
      console.log('Product ID:', product.id);
      console.log('Seller ID:', seller.id);
      console.log('Public ID:', product.public_id);
      
      // Track QR scan
      base44.entities.Analytics.create({
        product_id: product.id,
        seller_id: seller.id,
        product_public_id: product.public_id,
        event_type: 'scan',
        user_agent: navigator.userAgent
      }).then(() => {
        console.log('✅ Scan tracked successfully');
      }).catch((error) => {
        console.error('❌ Scan tracking error:', error);
      });

      // Track product view
      base44.entities.Analytics.create({
        product_id: product.id,
        seller_id: seller.id,
        product_public_id: product.public_id,
        event_type: 'view_product',
        user_agent: navigator.userAgent
      }).then(() => {
        console.log('✅ Product view tracked successfully');
      }).catch((error) => {
        console.error('❌ Product view tracking error:', error);
      });
    }
  }, [product, seller]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const calculateDiscountedPrice = () => {
    if (!isFlashOfferActive || !product) return product?.price;
    
    if (liveSession.flash_offer_type === 'percentage') {
      return product.price - (product.price * liveSession.flash_offer_value / 100);
    } else {
      return product.price - liveSession.flash_offer_value;
    }
  };

  const generateProfessionalWhatsAppMessage = () => {
    return `Bonjour, je viens de votre QR Code et je souhaite commander ${product.name}.`;
  };

  const downloadQRCode = async () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-${product.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.click();
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
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

  const finalPrice = calculateDiscountedPrice();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        
        {/* Main Product Section */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16">
          
          {/* Left: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div 
              className={`relative bg-gray-50 rounded-3xl overflow-hidden ${imageZoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
            >
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className={`w-full aspect-square object-cover transition-transform duration-500 ${imageZoom ? 'scale-110' : 'scale-100'}`}
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                    <p className="text-gray-500">Aucune image</p>
                  </div>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && (
                  <Badge className="bg-[#FF6B9D] text-white border-0 shadow-lg">
                    ✨ Nouveauté
                  </Badge>
                )}
                {isFlashOfferActive && (
                  <Badge className="bg-red-500 text-white border-0 shadow-lg animate-pulse">
                    🔥 Promo
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#6C4AB6] mb-4 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {product.name}
              </h1>
              
              {isFlashOfferActive ? (
                <div className="mb-6">
                  <p className="text-2xl text-gray-400 line-through mb-2">{formatPrice(product.price)} FCFA</p>
                  <p className="text-4xl md:text-5xl font-black text-[#FF6B9D] mb-2">
                    {formatPrice(finalPrice)} FCFA
                  </p>
                  {liveSession?.flash_offer_type === 'percentage' && (
                    <p className="text-lg text-green-600 font-bold">
                      -{liveSession.flash_offer_value}% de réduction !
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-4xl md:text-5xl font-black text-[#FF6B9D] mb-6">
                  {formatPrice(product.price)} FCFA
                </p>
              )}
              
              {product.description && (
                <p className="text-lg text-gray-700 leading-relaxed mb-8" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}>
                  {product.description}
                </p>
              )}
            </div>

            {/* QR Code Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#6C4AB6] mb-2">Scannez pour commander</h3>
                  <p className="text-sm text-gray-600 mb-4">Montrez ce QR code à vos amis ou sauvegardez-le</p>
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    className="border-2 border-[#6C4AB6] text-[#6C4AB6] hover:bg-[#6C4AB6] hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le QR
                  </Button>
                </div>
                <div 
                  ref={qrRef}
                  className="border-4 border-dashed border-[#6C4AB6] rounded-2xl p-3 bg-white"
                >
                  <EnhancedQRCode
                    url={window.location.href}
                    size={120}
                    color="#6C4AB6"
                    showText={false}
                  />
                  <p className="text-xs text-center font-bold text-[#6C4AB6] mt-2">
                    Scannez-moi !
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleWhatsAppClick}
                className="w-full h-16 text-xl font-black rounded-full shadow-2xl bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <MessageCircle className="w-6 h-6 mr-3" />
                💬 Commander sur WhatsApp
              </Button>
            </motion.div>
            
            <p className="text-center text-sm text-gray-600 mt-3">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
              Vendeur disponible 24h/7 — Réponse en moins de 5 min
            </p>
          </motion.div>
        </div>

        {/* Delivery & Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 mb-16"
        >
          <h2 className="text-2xl font-black text-[#6C4AB6] mb-8 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            📦 Livraison & Paiement
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Delivery */}
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Livraison</h3>
              <p className="text-sm text-gray-600">
                {seller.city && seller.city === 'Dakar' ? (
                  <>
                    <span className="font-semibold">Médina : 500 FCFA</span><br />
                    <span className="text-xs">Autres quartiers : 1000 FCFA</span>
                  </>
                ) : (
                  'À venir chercher en magasin'
                )}
              </p>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Paiement</h3>
              <div className="flex justify-center gap-2 mt-2">
                {seller.payment_methods && seller.payment_methods.length > 0 ? (
                  seller.payment_methods.map((method, idx) => (
                    <img key={idx} src={method} alt="Payment" className="h-6 object-contain" />
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Wave • Orange Money • Cash</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Localisation</h3>
              <p className="text-sm text-gray-600">
                {seller.city || 'Nous contacter'}
                {seller.address && (
                  <><br /><span className="text-xs">{seller.address}</span></>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-[#6C4AB6] mb-8 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ✨ Vous aimerez aussi…
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProducts.map((prod) => (
                <motion.div
                  key={prod.id}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-[#6C4AB6] transition-all shadow-lg hover:shadow-2xl"
                >
                  <div className="relative aspect-square bg-gray-50">
                    {prod.image_url ? (
                      <img 
                        src={prod.image_url} 
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{prod.name}</h3>
                    <p className="text-2xl font-black text-[#FF6B9D] mb-4">
                      {formatPrice(prod.price)} FCFA
                    </p>
                    <div className="border-2 border-dashed border-[#6C4AB6] rounded-xl p-2 bg-purple-50">
                      <EnhancedQRCode
                        url={`${window.location.origin}/ProductPage?id=${prod.public_id}`}
                        size={80}
                        color="#6C4AB6"
                        showText={false}
                      />
                      <p className="text-xs text-center font-bold text-[#6C4AB6] mt-1">
                        Scannez-moi !
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}