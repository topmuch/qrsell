import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Store, Package, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';
import SEOHead from '@/components/seo/SEOHead';

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
      const all = await base44.entities.Shop.list();
      return all.filter(s => s.is_active);
    }
  });

  // Fetch all products to count per shop
  const { data: products = [] } = useQuery({
    queryKey: ['all-products-for-count'],
    queryFn: () => base44.entities.Product.list()
  });

  const getProductCount = (shopSlug) => {
    return products.filter(p => p.shop_slug === shopSlug && p.is_active).length;
  };

  // Filter shops
  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const categoryMatch = categoryFilter === 'all' || shop.category === categoryFilter;
      const cityMatch = cityFilter === 'all' || shop.city === cityFilter;
      return categoryMatch && cityMatch;
    });
  }, [shops, categoryFilter, cityFilter]);

  // Get unique cities
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(shops.map(s => s.city).filter(Boolean))];
    return uniqueCities.sort();
  }, [shops]);

  // Category styles
  const getCategoryStyle = (category) => {
    const styles = {
      'Mode': {
        bg: 'from-pink-50 to-purple-50',
        border: 'border-pink-200',
        text: 'text-pink-600',
        hover: 'hover:border-pink-400'
      },
      'Beauté': {
        bg: 'from-rose-50 to-pink-50',
        border: 'border-rose-200',
        text: 'text-rose-600',
        hover: 'hover:border-rose-400'
      },
      'Électronique': {
        bg: 'from-slate-900 to-blue-900',
        border: 'border-blue-500',
        text: 'text-blue-400',
        hover: 'hover:border-blue-300',
        dark: true
      },
      'Électroménager': {
        bg: 'from-gray-800 to-slate-900',
        border: 'border-gray-500',
        text: 'text-gray-300',
        hover: 'hover:border-gray-400',
        dark: true
      },
      'Alimentation': {
        bg: 'from-amber-50 to-orange-50',
        border: 'border-amber-300',
        text: 'text-amber-700',
        hover: 'hover:border-amber-400'
      },
      'Accessoires': {
        bg: 'from-purple-50 to-indigo-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        hover: 'hover:border-purple-400'
      },
      'Maison': {
        bg: 'from-teal-50 to-cyan-50',
        border: 'border-teal-200',
        text: 'text-teal-600',
        hover: 'hover:border-teal-400'
      },
      'Sport': {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-600',
        hover: 'hover:border-green-400'
      }
    };
    return styles[category] || {
      bg: 'from-gray-50 to-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-600',
      hover: 'hover:border-gray-400'
    };
  };

  const isNewShop = (createdDate) => {
    if (!createdDate) return false;
    const created = new Date(createdDate);
    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 14; // 14 days
  };

  if (loadingShops) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C4AB6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      {/* SEO Head */}
      <SEOHead 
        title={shopsSEO.title}
        description={shopsSEO.description}
        keywords={shopsSEO.keywords}
        canonicalUrl={shopsSEO.canonicalUrl}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] rounded-full mb-4">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#6C4AB6] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Trouvez votre boutique préférée sur ShopQR
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              ShopQR est la plateforme de commerce QR Code leader en Afrique et en Europe. 
              Découvrez des boutiques de mode, beauté, électronique et plus encore. 
              Commandez facilement via WhatsApp ou scannez les QR codes.
            </p>
          </motion.div>
        </header>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-64 bg-white border-2 border-[#6C4AB6]/20 hover:border-[#6C4AB6]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
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

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full md:w-64 bg-white border-2 border-[#6C4AB6]/20 hover:border-[#6C4AB6]">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes villes</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm font-semibold text-[#6C4AB6]">
              {filteredShops.length} boutique{filteredShops.length > 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>

        {filteredShops.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Aucune boutique trouvée avec ces filtres</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Liste des boutiques">
            {filteredShops.map((shop, index) => {
              const productCount = getProductCount(shop.shop_slug);
              const shopUrl = createPageUrl('Shop') + `?slug=${shop.shop_slug}`;
              const categoryStyle = getCategoryStyle(shop.category);
              const isNew = isNewShop(shop.created_date);
              
              return (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <Link to={shopUrl}>
                    <div className={`relative bg-gradient-to-br ${categoryStyle.bg} border-2 ${categoryStyle.border} ${categoryStyle.hover} rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl ${categoryStyle.dark ? 'text-white' : ''}`}>
                      
                      {/* QR Code - Top Right */}
                      <div className="absolute top-4 right-4 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white border-4 border-dashed border-[#6C4AB6] rounded-2xl p-2 group-hover:scale-110 transition-transform">
                          <EnhancedQRCode
                            url={`${window.location.origin}${shopUrl}`}
                            size={80}
                            color="#6C4AB6"
                            showText={false}
                          />
                          <p className="text-[10px] text-center font-bold text-[#6C4AB6] mt-1">
                            Scannez-moi !
                          </p>
                        </div>
                      </div>

                      {/* New Badge */}
                      {isNew && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge className="bg-[#FF6B9D] text-white border-0 shadow-lg animate-pulse">
                            🔥 Nouveau
                          </Badge>
                        </div>
                      )}
                      
                      {/* Shop Image/Banner */}
                      <div className="relative h-48 overflow-hidden">
                        {shop.banner_url ? (
                          <img 
                            src={shop.banner_url} 
                            alt={shop.shop_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${categoryStyle.dark ? 'bg-opacity-50' : ''}`}>
                            <Store className={`w-16 h-16 ${categoryStyle.text}`} />
                          </div>
                        )}
                        
                        {/* Logo Overlay */}
                        {shop.logo_url && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
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
                      <div className={`p-6 ${shop.logo_url ? 'pt-14' : 'pt-6'}`}>
                        <h3 className={`text-2xl font-black text-center mb-2 ${categoryStyle.dark ? 'text-white' : 'text-[#6C4AB6]'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {shop.shop_name}
                        </h3>
                        
                        {shop.tiktok && (
                          <p className={`text-center text-sm font-semibold mb-4 ${categoryStyle.dark ? 'text-gray-300' : 'text-gray-600'}`}>
                            @{shop.tiktok.replace('@', '')}
                          </p>
                        )}

                        <div className="flex items-center justify-center gap-4 mb-4">
                          <div className={`flex items-center gap-1 ${categoryStyle.dark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <Package className="w-4 h-4" />
                            <span className="text-sm font-semibold">{productCount} produit{productCount > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {shop.city && (
                          <div className={`flex items-center justify-center gap-1 mb-4 ${categoryStyle.dark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{shop.city}</span>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                          {productCount > 8 && (
                            <Badge className="bg-[#6C4AB6]/20 text-[#6C4AB6] border-0">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Grande collection
                            </Badge>
                          )}
                          {shop.category && (
                            <Badge className={`${categoryStyle.dark ? 'bg-white/20 text-white' : 'bg-[#FF6B9D]/20 text-[#FF6B9D]'} border-0`}>
                              {shop.category}
                            </Badge>
                          )}
                        </div>

                        {/* CTA Button */}
                        <Button 
                          className={`w-full rounded-full font-bold text-base h-12 ${categoryStyle.dark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-[#FF6B9D] text-white hover:bg-[#FF6B9D]/90'}`}
                        >
                          Voir la boutique
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}