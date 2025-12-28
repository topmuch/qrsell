import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Eye, MessageCircle, TrendingUp as TrendingUpIcon, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KPICards({ analytics }) {
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = analytics.filter(a => new Date(a.created_date) >= weekAgo);
    const lastWeek = analytics.filter(a => 
      new Date(a.created_date) >= twoWeeksAgo && new Date(a.created_date) < weekAgo
    );

    const calcTrend = (thisWeekCount, lastWeekCount) => {
      if (lastWeekCount === 0) return thisWeekCount > 0 ? 100 : 0;
      return Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);
    };

    const thisWeekScans = thisWeek.filter(a => a.event_type === 'scan').length;
    const lastWeekScans = lastWeek.filter(a => a.event_type === 'scan').length;

    const thisWeekViews = thisWeek.filter(a => a.event_type === 'view_product').length;
    const lastWeekViews = lastWeek.filter(a => a.event_type === 'view_product').length;

    const thisWeekClicks = thisWeek.filter(a => a.event_type === 'whatsapp_click').length;
    const lastWeekClicks = lastWeek.filter(a => a.event_type === 'whatsapp_click').length;

    const conversionRate = thisWeekViews > 0 ? (thisWeekClicks / thisWeekViews) * 100 : 0;
    const lastWeekConversionRate = lastWeekViews > 0 ? (lastWeekClicks / lastWeekViews) * 100 : 0;

    return [
      {
        title: 'Scans QR Code',
        value: analytics.filter(a => a.event_type === 'scan').length,
        trend: calcTrend(thisWeekScans, lastWeekScans),
        icon: QrCode,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Vues produits',
        value: analytics.filter(a => a.event_type === 'view_product').length,
        trend: calcTrend(thisWeekViews, lastWeekViews),
        icon: Eye,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Clics WhatsApp',
        value: analytics.filter(a => a.event_type === 'whatsapp_click').length,
        trend: calcTrend(thisWeekClicks, lastWeekClicks),
        icon: MessageCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Conversion',
        value: `${conversionRate.toFixed(1)}%`,
        trend: Math.round(conversionRate - lastWeekConversionRate),
        icon: TrendingUpIcon,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        isPercentage: true
      }
    ];
  }, [analytics]);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend !== 0 && (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend > 0 ? (
                      <TrendingUpIcon className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stat.trend)}%
                  </div>
                )}
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              
              <p className="text-sm text-gray-500">
                {stat.title}
              </p>
              
              {stat.trend !== 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  vs semaine précédente
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}