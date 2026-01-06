import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, QrCode, Eye, MessageCircle, Store } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/fr';
import BackButton from '@/components/dashboard/BackButton';
import { createPageUrl } from '@/utils/index';

moment.locale('fr');

export default function RecentActivity() {
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
    queryKey: ['analytics-activity', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Get products for enrichment
  const { data: products = [] } = useQuery({
    queryKey: ['products-activity', seller?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Sort by date and take last 50
  const recentActivities = React.useMemo(() => {
    return [...analytics]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 50);
  }, [analytics]);

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'scan': return QrCode;
      case 'view_product': return Eye;
      case 'whatsapp_click': return MessageCircle;
      case 'view_shop': return Store;
      default: return Eye;
    }
  };

  const getEventLabel = (eventType) => {
    switch (eventType) {
      case 'scan': return 'Scan QR Code';
      case 'view_product': return 'Vue produit';
      case 'whatsapp_click': return 'Clic WhatsApp';
      case 'view_shop': return 'Visite boutique';
      default: return 'Activité';
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'scan': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'view_product': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'whatsapp_click': return 'bg-green-100 text-green-600 border-green-200';
      case 'view_shop': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Produit inconnu';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <BackButton to={createPageUrl('Dashboard')} />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">Activité récente</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Toutes les interactions avec votre boutique et vos produits
            </p>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune activité récente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = getEventIcon(activity.event_type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getEventColor(activity.event_type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getEventColor(activity.event_type)}>
                            {getEventLabel(activity.event_type)}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {moment(activity.created_date).fromNow()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {activity.product_id && (
                            <span>{getProductName(activity.product_id)}</span>
                          )}
                          {activity.event_type === 'view_shop' && (
                            <span>Visite de votre boutique</span>
                          )}
                        </p>
                        {activity.product_public_id && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            #{activity.product_public_id}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}