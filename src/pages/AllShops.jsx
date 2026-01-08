import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Package, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';
import { motion } from 'framer-motion';

export default function AllShops() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  // SEO Configuration
  const shopsSEO = {
    title: "Toutes les boutiques ShopQR – Commerce QR Code Afrique & Europe",
    description: "Découvrez les boutiques actives sur ShopQR. Mode, beauté, électronique à Dakar, Abidjan, Paris. Commandez via WhatsApp, scannez les QR codes.",
    keywords: "boutiques QR code, magasins en ligne Afrique, commerce WhatsApp Sénégal, boutiques Dakar, e-commerce Abidjan, vente en ligne Cameroun",
    canonicalUrl: "https://shopqr.pro/AllShops"
  };

  // Fetch all active shops
  const { data: shops = [], isLoading: loadingShops } = useQuery({
    queryKey: ['all-shops'],
    queryFn: async () => {
      const all = await base44.entities.Shop.list('-created_date', 1000);
      return all.filter(s => s.is_active);
    }
  });

  // Fetch all products to count per shop
  const { data: products = [] } = useQuery({
    queryKey: ['all-products-for-count'],
    queryFn: () => base44.entities.Product.list('-created_date', 10000)
  });

  const getProductCount = (shopSlug) => {
    return products.filter(p => p.shop_slug === shopSlug && p.is_active).length;
  };

  // Get category style based on shop category
  const getCategoryStyle = (category) => {
    const styles = {
      'Mode': {
        bg: 'from-pink-50 to-purple-50',
        border: 'border-pink-200',
        text: 'text-pink-900',
        badge: 'bg-pink-100 text-pink-700'
      },
      'Beauté': {
        bg: 'from-rose-50 to-pink-50',
        border: 'border-rose-200',
        text: 'text-rose-900',
        badge: 'bg-rose-100 text-rose-700'
      },
      'Électroménager': {
        bg: 'from-slate-900 to-slate-800',
        border: 'border-blue-400',
        text: 'text-white',
        badge: 'bg-blue-500 text-white',
        dark: true
      },
      'Électronique': {
        bg: 'from-slate-900 to-blue-900',
        border: 'border-cyan-400',
        text: 'text-white',
        badge: 'bg-cyan-500 text-white',
        dark: true
      },
      'Alimentation': {
        bg: 'from-amber-50 to-orange-50',
        border: 'border-amber-300',
        text: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-700',
        texture: true
      },
      'Accessoires': {
        bg: 'from-violet-50 to-purple-50',
        border: 'border-violet-200',
        text: 'text-violet-900',
        badge: 'bg-violet-100 text-violet-700'
      },
      'Maison': {
        bg: 'from-emerald-50 to-teal-50',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        badge: 'bg-emerald-100 text-emerald-700'
      },
      'Sport': {
        bg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-700'
      }
    };
    return styles[category] || {
      bg: 'from-gray-50 to-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-900',
      badge: 'bg-gray-100 text-gray-700'
    };
  };

  // Check if shop is new (created in last 7 days)
  const isNewShop = (createdDate) => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  // Filter shops
  const filteredShops = shops.filter(shop => {
    const categoryMatch = categoryFilter === 'all' || shop.category === categoryFilter;
    const cityMatch = cityFilter === 'all' || shop.city === cityFilter;
    return categoryMatch && cityMatch;
  });

  // Get unique cities
  const cities = [...new Set(shops.map(s => s.city).filter(Boolean))];

  if (loadingShops) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C4AB6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Head */}
      <SEOHead 
        title={shopsSEO.title}
        description={shopsSEO.description}
        keywords={shopsSEO.keywords}
        canonicalUrl={shopsSEO.canonicalUrl}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] text-white px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold text-sm">{filteredShops.length} boutiques actives</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-[#6C4AB6] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Trouvez votre boutique préférée sur ShopQR
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}>
            ShopQR est la plateforme de commerce QR Code leader en Afrique et en Europe. Découvrez des boutiques de mode, beauté, électronique et plus encore. Commandez facilement via WhatsApp ou scannez les QR codes.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#6C4AB6] mb-2">Catégorie</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full border-2 border-[#6C4AB6]/30">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="Mode">Mode</SelectItem>
                  <SelectItem value="Beauté">Beauté</SelectItem>
                  <SelectItem value="Électronique">Électronique</SelectItem>
                  <SelectItem value="Électroménager">Électroménager</SelectItem>
                  <SelectItem value="Alimentation">Alimentation</SelectItem>
                  <SelectItem value="Accessoires">Accessoires</SelectItem>
                  <SelectItem value="Maison">Maison</SelectItem>
                  <SelectItem value="Sport">Sport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6C4AB6] mb-2">Ville</label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full border-2 border-[#6C4AB6]/30">
                  <SelectValue placeholder="Toutes les villes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Shops Grid */}
        {filteredShops.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏪</span>
            </div>
            <p className="text-xl text-gray-600">Aucune boutique ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShops.map((shop, idx) => {
              const productCount = getProductCount(shop.shop_slug);
              const shopUrl = `/@${shop.shop_slug}`;
              const style = getCategoryStyle(shop.category);
              const isNew = isNewShop(shop.created_date);
              
              return (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <div className={`bg-gradient-to-br ${style.bg} rounded-3xl overflow-hidden border-2 ${style.border} shadow-lg hover:shadow-2xl transition-all duration-300 relative`}>
                    
                    {/* New Badge */}
                    {isNew && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                      >
                        🔥 Nouveau
                      </motion.div>
                    )}

                    {/* QR Code - Top Right */}
                    <div className="absolute top-4 right-4 z-10 group-hover:scale-110 transition-transform">
                      <div className="bg-white border-4 border-dashed border-[#6C4AB6] rounded-2xl p-2 shadow-xl group-hover:animate-pulse">
                        <EnhancedQRCode
                          url={`${window.location.origin}${shopUrl}`}
                          size={80}
                          color="#6C4AB6"
                          showText={false}
                        />
                      </div>
                      <p className="text-xs text-center font-bold text-[#6C4AB6] mt-1">
                        Scannez-moi !
                      </p>
                    </div>

                    {/* Shop Banner/Image */}
                    <div className="relative h-48 overflow-hidden">
                      {shop.banner_url ? (
                        <img 
                          src={shop.banner_url} 
                          alt={shop.shop_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${style.dark ? 'text-white' : 'text-gray-400'}`}>
                          <span className="text-6xl">🏪</span>
                        </div>
                      )}
                      
                      {/* Logo Overlay */}
                      {shop.logo_url && (
                        <div className="absolute bottom-4 left-4">
                          <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
                            <img 
                              src={shop.logo_url} 
                              alt={shop.shop_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shop Info */}
                    <div className={`p-6 ${style.dark ? 'text-white' : ''}`}>
                      <h3 className={`text-2xl font-black mb-2 line-clamp-1 ${style.text}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {shop.shop_name}
                      </h3>
                      
                      {shop.tiktok && (
                        <a 
                          href={`https://tiktok.com/@${shop.tiktok.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm font-semibold hover:underline inline-block mb-3 ${style.dark ? 'text-pink-300' : 'text-[#6C4AB6]'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          @{shop.tiktok.replace('@', '')}
                        </a>
                      )}
                      
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className={`flex items-center gap-1 ${style.dark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Package className="w-4 h-4" />
                          <span>{productCount} produit{productCount > 1 ? 's' : ''}</span>
                        </div>
                        
                        {shop.city && (
                          <div className={`flex items-center gap-1 ${style.dark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <MapPin className="w-4 h-4" />
                            <span>{shop.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {shop.category && (
                          <Badge className={style.badge}>
                            {shop.category}
                          </Badge>
                        )}
                        {productCount > 8 && (
                          <Badge className="bg-[#6C4AB6]/20 text-[#6C4AB6] border-0">
                            ✨ Grande collection
                          </Badge>
                        )}
                      </div>

                      {/* CTA Button */}
                      <a href={shopUrl}>
                        <Button className="w-full bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white font-bold rounded-full h-12 shadow-lg">
                          Voir la boutique
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}