import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Lightbulb, Award, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrendAlerts({ seller, currentShop }) {
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['trend-alerts', currentShop?.city, currentShop?.category],
    queryFn: async () => {
      const all = await base44.entities.TrendAlert.list();
      const now = new Date();
      
      return all.filter(alert => {
        const isActive = alert.is_active;
        const notExpired = !alert.expires_at || new Date(alert.expires_at) > now;
        const matchesLocation = !alert.city || alert.city === currentShop?.city || !currentShop?.city;
        const matchesCategory = !alert.category || alert.category === currentShop?.category;
        
        return isActive && notExpired && matchesLocation && matchesCategory;
      }).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    },
    enabled: !!currentShop
  });

  const { data: userAlerts = [] } = useQuery({
    queryKey: ['user-alerts', seller?.created_by],
    queryFn: () => base44.entities.UserAlert.filter({ user_email: seller?.created_by }),
    enabled: !!seller?.created_by
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId) => {
      const existing = userAlerts.find(ua => ua.alert_id === alertId);
      if (existing) {
        return base44.entities.UserAlert.update(existing.id, { is_dismissed: true });
      } else {
        return base44.entities.UserAlert.create({
          user_email: seller.created_by,
          alert_id: alertId,
          is_dismissed: true,
          is_read: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-alerts']);
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId) => {
      const existing = userAlerts.find(ua => ua.alert_id === alertId);
      if (existing) {
        return base44.entities.UserAlert.update(existing.id, { 
          is_read: true,
          read_at: new Date().toISOString()
        });
      } else {
        return base44.entities.UserAlert.create({
          user_email: seller.created_by,
          alert_id: alertId,
          is_read: true,
          read_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-alerts']);
    }
  });

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter(alert => {
    const userAlert = userAlerts.find(ua => ua.alert_id === alert.id);
    return !userAlert?.is_dismissed;
  });

  const iconMap = {
    trend: TrendingUp,
    suggestion: Lightbulb,
    performance: Award
  };

  const colorMap = {
    trend: 'from-orange-500 to-red-500',
    suggestion: 'from-purple-500 to-pink-500',
    performance: 'from-green-500 to-emerald-500'
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-purple-600" />
        Tendances & Suggestions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {visibleAlerts.slice(0, 6).map((alert, idx) => {
            const Icon = iconMap[alert.alert_type] || TrendingUp;
            const isRead = userAlerts.find(ua => ua.alert_id === alert.id)?.is_read;
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    !isRead ? 'border-2 border-purple-300' : ''
                  }`}
                  onClick={() => markAsReadMutation.mutate(alert.id)}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[alert.alert_type]}`} />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorMap[alert.alert_type]} flex items-center justify-center text-white`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm font-bold line-clamp-2">
                            {alert.icon} {alert.title}
                          </CardTitle>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlertMutation.mutate(alert.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {alert.description}
                    </p>
                    
                    {alert.metric_value && (
                      <Badge variant="outline" className="mb-2">
                        {alert.metric_value}
                      </Badge>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex gap-1">
                        {alert.city && (
                          <Badge variant="secondary" className="text-xs">
                            {alert.city}
                          </Badge>
                        )}
                        {alert.category && (
                          <Badge variant="secondary" className="text-xs">
                            {alert.category}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>

                    {!isRead && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}