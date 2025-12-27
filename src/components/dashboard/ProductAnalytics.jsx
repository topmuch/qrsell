import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Eye, MessageCircle, TrendingUp, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductAnalytics({ products, analytics }) {
  // Calculate stats per product
  const productStats = products.map(product => {
    const productAnalytics = analytics.filter(a => a.product_id === product.id);
    return {
      ...product,
      scans: productAnalytics.filter(a => a.event_type === 'scan').length,
      views: productAnalytics.filter(a => a.event_type === 'view_product').length,
      whatsappClicks: productAnalytics.filter(a => a.event_type === 'whatsapp_click').length,
      totalInteractions: productAnalytics.length
    };
  }).sort((a, b) => b.totalInteractions - a.totalInteractions);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getPerformanceBadge = (interactions) => {
    if (interactions >= 20) return { label: 'Top', color: 'bg-green-100 text-green-700 border-green-200' };
    if (interactions >= 10) return { label: 'Bon', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (interactions >= 5) return { label: 'Moyen', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'Faible', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  };

  if (products.length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Ajoutez des produits pour voir les statistiques</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Analytics par produit</h3>
        <Badge variant="outline">{products.length} produit{products.length > 1 ? 's' : ''}</Badge>
      </div>

      <div className="space-y-3">
        {productStats.map((product, index) => {
          const performance = getPerformanceBadge(product.totalInteractions);
          const conversionRate = product.views > 0 
            ? ((product.whatsappClicks / product.views) * 100).toFixed(1) 
            : 0;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Product image */}
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
                          <Package className="w-6 h-6 text-pink-200" />
                        </div>
                      )}
                    </div>

                    {/* Product info & stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-[#ed477c] font-medium">{formatPrice(product.price)} FCFA</p>
                        </div>
                        <Badge className={performance.color} variant="outline">
                          {performance.label}
                        </Badge>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <QrCode className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Scans</p>
                            <p className="text-sm font-semibold text-gray-900">{product.scans}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Vues</p>
                            <p className="text-sm font-semibold text-gray-900">{product.views}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">WhatsApp</p>
                            <p className="text-sm font-semibold text-gray-900">{product.whatsappClicks}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Conversion</p>
                            <p className="text-sm font-semibold text-gray-900">{conversionRate}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}