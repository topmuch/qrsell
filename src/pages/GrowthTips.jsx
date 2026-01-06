import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Zap, QrCode, Camera, Package, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { motion } from 'framer-motion';

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

  // Get products and analytics
  const { data: products = [] } = useQuery({
    queryKey: ['products', seller?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['analytics', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  const totalScans = analytics.filter(a => a.event_type === 'scan').length;
  const totalClicks = analytics.filter(a => a.event_type === 'whatsapp_click').length;

  // Generate personalized tips
  const tips = [
    {
      icon: QrCode,
      title: 'Ajoutez des QR codes TikTok',
      description: 'Intégrez vos QR codes dans vos vidéos TikTok pour augmenter vos scans de 300%',
      status: totalScans > 10 ? 'completed' : 'todo',
      color: 'from-blue-500 to-cyan-500',
      action: 'Voir le guide TikTok',
      link: createPageUrl('Dashboard') + '#guide'
    },
    {
      icon: Package,
      title: 'Ajoutez au moins 8 produits',
      description: 'Plus vous avez de produits, plus vous générez de ventes. Visez au moins 8 produits actifs.',
      status: products.length >= 8 ? 'completed' : 'todo',
      color: 'from-purple-500 to-pink-500',
      progress: Math.min(products.length, 8),
      total: 8,
      action: 'Ajouter un produit',
      link: createPageUrl('Dashboard') + '#products'
    },
    {
      icon: Camera,
      title: 'Utilisez des photos de qualité',
      description: 'Les produits avec de belles photos ont 5x plus de clics WhatsApp',
      status: products.some(p => p.image_url) ? 'completed' : 'todo',
      color: 'from-orange-500 to-red-500',
      action: 'Améliorer mes photos',
      link: createPageUrl('Dashboard') + '#products'
    },
    {
      icon: Zap,
      title: 'Créez des promotions flash',
      description: 'Les offres limitées augmentent vos conversions de 150%',
      status: 'todo',
      color: 'from-green-500 to-emerald-500',
      action: 'Créer une promo',
      link: createPageUrl('Dashboard') + '#promotions'
    },
    {
      icon: Users,
      title: 'Participez aux campagnes',
      description: 'Gagnez jusqu\'à 5€ par intégration en participant aux campagnes sponsorisées',
      status: 'todo',
      color: 'from-indigo-500 to-purple-500',
      action: 'Voir les campagnes',
      link: createPageUrl('Dashboard') + '#campaigns'
    }
  ];

  const completedTips = tips.filter(t => t.status === 'completed').length;
  const progress = (completedTips / tips.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gagnez plus</h1>
              <p className="text-gray-600">Conseils personnalisés pour booster vos ventes</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/90 text-sm mb-1">Votre progression</p>
                <p className="text-3xl font-bold">{completedTips}/{tips.length} objectifs</p>
              </div>
              <div className="text-right">
                <Badge className="bg-white/20 text-white border-white/30">
                  {Math.round(progress)}% complété
                </Badge>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tips Grid */}
        <div className="space-y-6">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            const isCompleted = tip.status === 'completed';
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden ${isCompleted ? 'border-green-200 bg-green-50/30' : 'hover:shadow-lg transition-shadow'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tip.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{tip.title}</h3>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              ✓ Complété
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{tip.description}</p>
                        
                        {tip.progress !== undefined && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600">Progression</span>
                              <span className="font-semibold text-gray-900">{tip.progress}/{tip.total}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`bg-gradient-to-r ${tip.color} h-2 rounded-full`}
                                style={{ width: `${(tip.progress / tip.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {!isCompleted && (
                          <a href={tip.link}>
                            <Button className={`bg-gradient-to-r ${tip.color} hover:opacity-90 text-white`}>
                              {tip.action}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Vos performances actuelles</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-3xl font-bold text-[#2563eb]">{products.length}</p>
                <p className="text-sm text-gray-600">Produits</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">{totalScans}</p>
                <p className="text-sm text-gray-600">Scans</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{totalClicks}</p>
                <p className="text-sm text-gray-600">Clics</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">
                  {totalScans > 0 ? Math.round((totalClicks / totalScans) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}