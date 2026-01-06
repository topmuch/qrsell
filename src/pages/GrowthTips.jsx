import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Package, QrCode, Zap, Users, Target, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import BackButton from '@/components/dashboard/BackButton';
import { createPageUrl } from '@/utils/index';
import { Link } from 'react-router-dom';

export default function GrowthTips() {
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

  // Get products
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products-tips', seller?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Get analytics
  const { data: analytics = [], isLoading: loadingAnalytics } = useQuery({
    queryKey: ['analytics-tips', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Generate personalized tips
  const tips = React.useMemo(() => {
    const allTips = [];

    // Tip 1: Add more products
    if (products.length < 10) {
      allTips.push({
        id: 'add-products',
        icon: Package,
        title: 'Ajoutez plus de produits',
        description: `Vous avez ${products.length} produit${products.length > 1 ? 's' : ''}. Les boutiques avec 10+ produits génèrent 3x plus de ventes.`,
        action: 'Ajouter un produit',
        actionTo: createPageUrl('Dashboard') + '?tab=products',
        color: 'from-blue-500 to-cyan-500',
        priority: 'high'
      });
    }

    // Tip 2: Share QR codes
    const totalScans = analytics.filter(a => a.event_type === 'scan').length;
    if (totalScans < 50) {
      allTips.push({
        id: 'share-qr',
        icon: QrCode,
        title: 'Partagez vos QR codes TikTok',
        description: `Vous avez ${totalScans} scan${totalScans > 1 ? 's' : ''}. Intégrez vos QR codes dans vos vidéos et lives pour booster vos conversions.`,
        action: 'Voir le guide TikTok',
        actionTo: createPageUrl('Dashboard') + '?tab=guide',
        color: 'from-purple-500 to-pink-500',
        priority: 'high'
      });
    }

    // Tip 3: Use promotions
    allTips.push({
      id: 'use-promotions',
      icon: Zap,
      title: 'Créez des promotions flash',
      description: 'Les offres limitées génèrent 50% de conversions en plus. Créez votre première promo dès maintenant !',
      action: 'Créer une promo',
      actionTo: createPageUrl('Dashboard') + '?tab=promotions',
      color: 'from-orange-500 to-red-500',
      priority: 'medium'
    });

    // Tip 4: Complete shop profile
    if (!seller?.banner_url || !seller?.logo_url) {
      allTips.push({
        id: 'complete-profile',
        icon: Users,
        title: 'Complétez votre profil boutique',
        description: 'Les boutiques avec logo et bannière ont 2x plus de confiance client.',
        action: 'Personnaliser ma boutique',
        actionTo: createPageUrl('Dashboard') + '?tab=settings',
        color: 'from-green-500 to-emerald-500',
        priority: 'high'
      });
    }

    // Tip 5: Track performance
    allTips.push({
      id: 'track-performance',
      icon: Target,
      title: 'Analysez vos performances',
      description: 'Consultez vos stats régulièrement pour identifier vos produits stars et optimiser votre stratégie.',
      action: 'Voir mes stats',
      actionTo: createPageUrl('Dashboard'),
      color: 'from-indigo-500 to-purple-500',
      priority: 'low'
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return allTips.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [products, analytics, seller]);

  if (loadingProducts || loadingAnalytics) {
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

        <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl">Gagnez plus avec QRSell</CardTitle>
                <p className="text-gray-600 mt-1">
                  Conseils personnalisés pour booster vos ventes
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {tips.map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center flex-shrink-0`}>
                      <tip.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{tip.title}</h3>
                        {tip.priority === 'high' && (
                          <Badge className="bg-red-100 text-red-600 border-red-200">
                            Prioritaire
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                  <Link to={tip.actionTo}>
                    <Button 
                      className={`w-full bg-gradient-to-r ${tip.color} hover:opacity-90 text-white`}
                    >
                      {tip.action}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Success metrics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Vos progrès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{products.length}</div>
                <div className="text-sm text-gray-600">Produits actifs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {analytics.filter(a => a.event_type === 'scan').length}
                </div>
                <div className="text-sm text-gray-600">Scans QR Code</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {analytics.filter(a => a.event_type === 'whatsapp_click').length}
                </div>
                <div className="text-sm text-gray-600">Contacts WhatsApp</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}