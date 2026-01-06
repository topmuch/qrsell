import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, QrCode, MessageCircle, Store, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { motion } from 'framer-motion';

export default function ActivityDetail() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Get seller
  const { data: sellers = [] } = useQuery({
    queryKey: ['seller', user?.email],
    queryFn: () => base44.entities.Seller.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  const seller = sellers[0];

  // Get analytics
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['analytics-detail', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Get products for names
  const { data: products = [] } = useQuery({
    queryKey: ['products', seller?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  const getEventIcon = (type) => {
    switch(type) {
      case 'scan': return QrCode;
      case 'view_product': return Eye;
      case 'whatsapp_click': return MessageCircle;
      case 'view_shop': return Store;
      default: return Eye;
    }
  };

  const getEventLabel = (type) => {
    switch(type) {
      case 'scan': return 'Scan QR Code';
      case 'view_product': return 'Vue produit';
      case 'whatsapp_click': return 'Clic WhatsApp';
      case 'view_shop': return 'Visite boutique';
      default: return type;
    }
  };

  const getEventColor = (type) => {
    switch(type) {
      case 'scan': return 'bg-blue-100 text-blue-700';
      case 'view_product': return 'bg-purple-100 text-purple-700';
      case 'whatsapp_click': return 'bg-green-100 text-green-700';
      case 'view_shop': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `Il y a ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Produit inconnu';
  };

  // Sort by most recent
  const sortedAnalytics = [...analytics].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activité récente</h1>
          <p className="text-gray-600">Toutes les interactions avec vos produits</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { type: 'scan', label: 'Scans', count: analytics.filter(a => a.event_type === 'scan').length },
            { type: 'view_product', label: 'Vues', count: analytics.filter(a => a.event_type === 'view_product').length },
            { type: 'whatsapp_click', label: 'Clics', count: analytics.filter(a => a.event_type === 'whatsapp_click').length },
            { type: 'view_shop', label: 'Visites', count: analytics.filter(a => a.event_type === 'view_shop').length }
          ].map((stat, i) => {
            const Icon = getEventIcon(stat.type);
            return (
              <motion.div
                key={stat.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${getEventColor(stat.type)} flex items-center justify-center mb-2`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Activity List */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historique complet</h2>
            <div className="space-y-3">
              {sortedAnalytics.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune activité pour le moment</p>
              ) : (
                sortedAnalytics.map((activity, index) => {
                  const Icon = getEventIcon(activity.event_type);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full ${getEventColor(activity.event_type)} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getEventColor(activity.event_type)}>
                            {getEventLabel(activity.event_type)}
                          </Badge>
                          {activity.product_id && (
                            <span className="text-sm text-gray-600 truncate">
                              {getProductName(activity.product_id)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(activity.created_date)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}