import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Loader2, Package, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

export default function AllShops() {
  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['all-sellers'],
    queryFn: async () => {
      const allSellers = await base44.entities.Seller.list();
      return allSellers.filter(s => s.is_subscribed);
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['all-products-count'],
    queryFn: () => base44.entities.Product.filter({ is_active: true })
  });

  const getProductCount = (sellerId) => {
    return products.filter(p => p.seller_id === sellerId).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
            <Store className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">TOUTES LES BOUTIQUES</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Découvrez nos vendeurs
          </h1>
          <p className="text-xl text-gray-600">
            {sellers.length} boutique{sellers.length > 1 ? 's' : ''} active{sellers.length > 1 ? 's' : ''} sur QRSell
          </p>
        </div>

        {/* Shops grid */}
        {sellers.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune boutique disponible</h2>
            <p className="text-gray-500">Revenez bientôt pour découvrir nos vendeurs !</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => {
              const productCount = getProductCount(seller.id);
              return (
                <Card key={seller.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  {/* Banner or colored header */}
                  <div 
                    className="h-32 relative"
                    style={{
                      background: seller.banner_url 
                        ? `url(${seller.banner_url}) center/cover` 
                        : `linear-gradient(135deg, ${seller.primary_color || '#2563eb'} 0%, ${seller.secondary_color || '#3b82f6'} 100%)`
                    }}
                  >
                    {seller.logo_url && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <img 
                          src={seller.logo_url} 
                          alt={seller.shop_name}
                          className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Shop Info */}
                  <div className="p-6 pt-10 text-center">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">
                      {seller.shop_name}
                    </h3>
                    {seller.is_verified && (
                      <span className="inline-block text-xs text-green-600 mb-2">✓ Vendeur vérifié</span>
                    )}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                      <Package className="w-4 h-4" />
                      <span>{productCount} produit{productCount > 1 ? 's' : ''}</span>
                    </div>
                    
                    <a 
                      href={`${createPageUrl('Shop')}?slug=${seller.shop_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button 
                        className="w-full"
                        style={{
                          background: `linear-gradient(135deg, ${seller.primary_color || '#2563eb'} 0%, ${seller.secondary_color || '#3b82f6'} 100%)`
                        }}
                      >
                        Voir la boutique
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}