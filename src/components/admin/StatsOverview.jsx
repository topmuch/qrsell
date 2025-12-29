import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, QrCode, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StatsOverview() {
  const { data: sellers = [], isLoading: loadingSellers } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => base44.entities.Seller.list()
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: analytics = [], isLoading: loadingAnalytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => base44.entities.Analytics.list()
  });

  if (loadingSellers || loadingProducts || loadingAnalytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const totalScans = analytics.filter(a => a.event_type === 'scan').length;
  const totalViews = analytics.filter(a => a.event_type === 'view_product').length;
  const totalClicks = analytics.filter(a => a.event_type === 'whatsapp_click').length;

  // Top sellers by activity
  const sellerStats = sellers.map(seller => {
    const sellerAnalytics = analytics.filter(a => a.seller_id === seller.id);
    return {
      name: seller.shop_name,
      scans: sellerAnalytics.filter(a => a.event_type === 'scan').length,
      products: products.filter(p => p.seller_id === seller.id).length
    };
  }).sort((a, b) => b.scans - a.scans).slice(0, 5);

  const stats = [
    {
      title: 'Vendeurs actifs',
      value: sellers.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Produits en ligne',
      value: products.length,
      icon: Package,
      color: 'from-green-500 to-green-600',
      change: '+23%'
    },
    {
      title: 'QR scannés',
      value: totalScans,
      icon: QrCode,
      color: 'from-purple-500 to-purple-600',
      change: '+45%'
    },
    {
      title: 'Clics WhatsApp',
      value: totalClicks,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      change: '+31%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top sellers chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 vendeurs par activité</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sellerStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="scans" fill="#2563eb" name="Scans" />
              <Bar dataKey="products" fill="#10b981" name="Produits" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent activity summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Vues produits</span>
                <span className="font-semibold text-gray-900">{totalViews}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Scans QR</span>
                <span className="font-semibold text-gray-900">{totalScans}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Clics WhatsApp</span>
                <span className="font-semibold text-gray-900">{totalClicks}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques globales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Taux de conversion</span>
                <span className="font-semibold text-green-600">
                  {totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Produits par vendeur</span>
                <span className="font-semibold text-gray-900">
                  {sellers.length > 0 ? Math.round(products.length / sellers.length) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Scans par produit</span>
                <span className="font-semibold text-gray-900">
                  {products.length > 0 ? Math.round(totalScans / products.length) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}