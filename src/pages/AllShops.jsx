import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, Package, CheckCircle2, MapPin } from 'lucide-react';

export default function AllShops() {
  // Fetch all active sellers
  const { data: sellers = [], isLoading: loadingSellers } = useQuery({
    queryKey: ['all-sellers'],
    queryFn: async () => {
      const all = await base44.entities.Seller.list();
      return all.filter(s => s.is_subscribed);
    }
  });

  // Fetch all products to count per seller
  const { data: products = [] } = useQuery({
    queryKey: ['all-products-for-count'],
    queryFn: () => base44.entities.Product.list()
  });

  const getProductCount = (sellerId) => {
    return products.filter(p => p.seller_id === sellerId && p.is_active).length;
  };

  if (loadingSellers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-full mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Toutes les boutiques
          </h1>
          <p className="text-xl text-gray-600">
            Découvrez {sellers.length} boutique{sellers.length > 1 ? 's' : ''} active{sellers.length > 1 ? 's' : ''} sur QRSell
          </p>
        </div>

        {sellers.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Aucune boutique active pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sellers.map(seller => {
              const productCount = getProductCount(seller.id);
              const shopUrl = createPageUrl('Shop') + `?slug=${seller.shop_slug}`;
              
              return (
                <Link key={seller.id} to={shopUrl}>
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-0">
                      {/* Banner/Logo Section */}
                      <div 
                        className="h-32 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] relative overflow-hidden"
                        style={seller.banner_url ? {
                          backgroundImage: `url(${seller.banner_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        } : {}}
                      >
                        {seller.logo_url && (
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                            <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white">
                              <img 
                                src={seller.logo_url} 
                                alt={seller.shop_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Shop Info */}
                      <div className="p-4 pt-10 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 truncate">
                            {seller.shop_name || seller.full_name}
                          </h3>
                          {seller.is_verified && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-sm text-gray-500 mb-3">@{seller.shop_slug}</p>

                        <div className="flex items-center justify-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>{productCount} produit{productCount > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {seller.address && (
                          <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{seller.address}</span>
                          </div>
                        )}

                        {/* Categories/Tags */}
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          {seller.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              Vérifié
                            </Badge>
                          )}
                          {productCount > 10 && (
                            <Badge className="text-xs bg-purple-100 text-purple-700">
                              Grande collection
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}