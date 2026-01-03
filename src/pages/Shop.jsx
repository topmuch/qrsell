import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Store, Loader2, MapPin, Mail, Phone, Instagram, Facebook } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { motion } from 'framer-motion';

export default function Shop() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  // Get seller by slug
  const { data: sellers = [], isLoading: loadingSeller } = useQuery({
    queryKey: ['seller', slug],
    queryFn: () => base44.entities.Seller.filter({ shop_slug: slug }),
    enabled: !!slug
  });

  const seller = sellers[0];

  // Track shop view
  React.useEffect(() => {
    if (seller) {
      base44.entities.Analytics.create({
        seller_id: seller.id,
        event_type: 'view_shop',
        user_agent: navigator.userAgent
      }).catch(() => {});
    }
  }, [seller?.id]);

  // Get products
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['shop-products', slug],
    queryFn: () => base44.entities.Product.filter({ shop_slug: slug, is_active: true }),
    enabled: !!slug
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getWhatsAppLink = (product) => {
    const phone = seller?.whatsapp_number?.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ! Je suis intéressé(e) par:\n\n` +
      `📦 *${product.name}*\n` +
      `💰 Prix: ${formatPrice(product.price)} FCFA\n\n` +
      `Réf: ${product.public_id}`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  const handleWhatsAppClick = (product) => {
    base44.entities.Analytics.create({
      product_id: product.id,
      seller_id: seller.id,
      product_public_id: product.public_id,
      event_type: 'whatsapp_click',
      user_agent: navigator.userAgent
    }).catch(() => {});
  };

  if (loadingSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Store className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Boutique introuvable</h1>
        <p className="text-gray-500">Cette boutique n'existe pas ou a été désactivée.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-white font-bold">
                {seller.shop_name?.[0]?.toUpperCase() || 'B'}
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{seller.shop_name}</h1>
                <p className="text-xs text-gray-500">{products.length} produit{products.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <Logo size="sm" />
          </div>
        </div>
      </header>

      {/* Banner (if exists) */}
      {seller.banner_url && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img 
            src={seller.banner_url} 
            alt={seller.shop_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* About section */}
      {(seller.address || seller.email || seller.tiktok || seller.instagram || seller.facebook) && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">À propos de {seller.shop_name}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {seller.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#2563eb] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Adresse</p>
                    <p className="text-gray-600">{seller.address}</p>
                  </div>
                </div>
              )}
              {seller.whatsapp_number && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#25D366] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Téléphone</p>
                    <p className="text-gray-600">{seller.whatsapp_number}</p>
                  </div>
                </div>
              )}
              {seller.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#2563eb] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">{seller.email}</p>
                  </div>
                </div>
              )}
              {(seller.tiktok || seller.instagram || seller.facebook) && (
                <div className="flex items-start gap-3">
                  <div className="flex gap-3">
                    {seller.tiktok && (
                      <a href={`https://tiktok.com/@${seller.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </a>
                    )}
                    {seller.instagram && (
                      <a href={`https://instagram.com/${seller.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                        <Instagram className="w-5 h-5 text-white" />
                      </a>
                    )}
                    {seller.facebook && (
                      <a href={seller.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <Facebook className="w-5 h-5 text-white" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      <main className="container mx-auto px-4 py-8">
        {loadingProducts ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit disponible</h2>
            <p className="text-gray-500">Cette boutique n'a pas encore de produits.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
                        <Store className="w-12 h-12 text-pink-200" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-[#2563eb] mb-2">
                      {formatPrice(product.price)} FCFA
                    </p>
                    {product.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <a 
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      onClick={() => handleWhatsAppClick(product)}
                    >
                      <Button className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Commander sur WhatsApp
                      </Button>
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">{seller.shop_name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {seller.address && <p className="flex items-start gap-2"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" /> {seller.address}</p>}
                {seller.whatsapp_number && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {seller.whatsapp_number}</p>}
                {seller.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {seller.email}</p>}
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500 mb-3">Boutique propulsée par</p>
              <Logo size="sm" />
            </div>
          </div>
          <div className="border-t pt-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} {seller.shop_name}. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}