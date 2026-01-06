import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingUp, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

export default function ActionCards({ recentActivity, onExport, analytics = [] }) {
  // Get last 5 activities
  const recentActivities = [...analytics]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
  };

  const getEventLabel = (type) => {
    switch(type) {
      case 'scan': return 'Scan QR';
      case 'view_product': return 'Vue produit';
      case 'whatsapp_click': return 'Clic WhatsApp';
      case 'view_shop': return 'Visite boutique';
      default: return type;
    }
  };

  const activitySummary = recentActivities.length > 0 
    ? `${getEventLabel(recentActivities[0].event_type)} · Il y a ${formatTimeAgo(recentActivities[0].created_date)}`
    : 'Aucune activité récente';

  const actions = [
    {
      icon: Bell,
      title: 'Activité récente',
      description: activitySummary,
      cta: 'Voir le détail',
      color: 'bg-blue-50 text-blue-600',
      badge: recentActivities.length > 0 ? 'Nouveau' : null,
      badgeColor: 'bg-blue-500',
      link: createPageUrl('ActivityDetail')
    },
    {
      icon: TrendingUp,
      title: 'Gagnez plus',
      description: 'Conseils personnalisés pour booster vos ventes',
      cta: 'Voir les conseils',
      color: 'bg-green-50 text-green-600',
      link: createPageUrl('GrowthTips')
    },
    {
      icon: Download,
      title: 'Exportez vos données',
      description: 'Téléchargez vos stats en CSV pour votre comptabilité',
      cta: 'Exporter',
      color: 'bg-purple-50 text-purple-600',
      onClick: onExport
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-6 h-6" />
                </div>
                {action.badge && (
                  <Badge className={`${action.badgeColor} text-white`}>
                    {action.badge}
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {action.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {action.description}
              </p>
              
              {action.link ? (
                <Link to={action.link} className="w-full">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between group-hover:bg-gray-50"
                  >
                    {action.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="ghost" 
                  className="w-full justify-between group-hover:bg-gray-50"
                  onClick={action.onClick}
                >
                  {action.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}