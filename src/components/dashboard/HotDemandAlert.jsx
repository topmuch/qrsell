import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HotDemandAlert({ sellerId, products }) {
  const [dismissed, setDismissed] = useState([]);

  // Fetch recent analytics (last 10 minutes)
  const { data: recentAnalytics = [], refetch } = useQuery({
    queryKey: ['hot-demand', sellerId],
    queryFn: async () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const analytics = await base44.entities.Analytics.filter({ 
        seller_id: sellerId,
        event_type: 'scan'
      });
      
      // Filter last 10 minutes
      return analytics.filter(a => new Date(a.created_date) > tenMinutesAgo);
    },
    enabled: !!sellerId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    // Auto-refresh every 30s
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Count scans per product in last 10 minutes
  const hotProducts = products
    .map(product => {
      const scanCount = recentAnalytics.filter(a => a.product_id === product.id).length;
      return { product, scanCount };
    })
    .filter(item => item.scanCount >= 5 && !dismissed.includes(item.product.id))
    .sort((a, b) => b.scanCount - a.scanCount);

  if (hotProducts.length === 0) return null;

  return (
    <AnimatePresence>
      {hotProducts.map(({ product, scanCount }) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <Flame className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    🔥 Demande chaude détectée !
                  </h3>
                  <button
                    onClick={() => setDismissed([...dismissed, product.id])}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-700 mb-4">
                  Votre produit <span className="font-bold text-orange-600">"{product.name}"</span> est scanné{' '}
                  <span className="font-bold text-red-600">{scanCount}x</span> en 10 minutes !{' '}
                  <span className="font-semibold">Lancez un live maintenant.</span>
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://www.tiktok.com/live"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white">
                      <Video className="w-4 h-4 mr-2" />
                      Planifier un live TikTok
                    </Button>
                  </a>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const url = `${window.location.origin}/Shop?slug=${product.shop_slug}`;
                      navigator.clipboard.writeText(url);
                    }}
                  >
                    Copier le lien boutique
                  </Button>
                </div>
              </div>
              
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-md"
                />
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}