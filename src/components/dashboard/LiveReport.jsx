import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye, MessageCircle, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveReport({ liveSession, analytics, products, productStats }) {
  if (!liveSession || liveSession.is_live) return null;

  const liveStartTime = new Date(liveSession.live_started_at);
  const liveEndTime = new Date(liveSession.live_ended_at);
  const duration = Math.round((liveEndTime - liveStartTime) / (1000 * 60)); // minutes

  const liveAnalytics = analytics.filter(a => 
    new Date(a.created_date) >= liveStartTime &&
    new Date(a.created_date) <= liveEndTime
  );

  const totalScans = liveAnalytics.filter(a => a.event_type === 'scan').length;
  const totalViews = liveAnalytics.filter(a => a.event_type === 'view_product').length;
  const totalClicks = liveAnalytics.filter(a => a.event_type === 'whatsapp_click').length;
  const conversionRate = totalScans > 0 ? ((totalClicks / totalScans) * 100).toFixed(1) : 0;

  // Stats by product
  const productStatsData = productStats.map(stat => {
    const product = products.find(p => p.id === stat.product_id);
    if (!product) return null;

    const productAnalytics = liveAnalytics.filter(a => 
      a.product_id === product.id &&
      new Date(a.created_date) >= new Date(stat.time_started) &&
      (!stat.time_ended || new Date(a.created_date) <= new Date(stat.time_ended))
    );

    return {
      product,
      scans: productAnalytics.filter(a => a.event_type === 'scan').length,
      clicks: productAnalytics.filter(a => a.event_type === 'whatsapp_click').length,
      duration: stat.time_ended ? 
        Math.round((new Date(stat.time_ended) - new Date(stat.time_started)) / (1000 * 60)) : 
        Math.round((liveEndTime - new Date(stat.time_started)) / (1000 * 60))
    };
  }).filter(Boolean).sort((a, b) => b.scans - a.scans);

  const bestProduct = productStatsData[0];

  // Peak hour analysis
  const scansByMinute = {};
  liveAnalytics.filter(a => a.event_type === 'scan').forEach(scan => {
    const minute = Math.floor((new Date(scan.created_date) - liveStartTime) / (1000 * 60));
    scansByMinute[minute] = (scansByMinute[minute] || 0) + 1;
  });

  const peakMinute = Object.entries(scansByMinute).sort((a, b) => b[1] - a[1])[0];
  const peakTime = peakMinute ? `Minute ${peakMinute[0]} (${peakMinute[1]} scans)` : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Award className="w-6 h-6 text-purple-600" />
            Rapport de Live
          </CardTitle>
          <p className="text-gray-600">
            Durée: {duration} minutes • {new Date(liveStartTime).toLocaleString('fr-FR')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{totalScans}</div>
                <div className="text-sm text-gray-600 mt-1">Scans totaux</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-purple-600">{totalViews}</div>
                <div className="text-sm text-gray-600 mt-1">Vues</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600">{totalClicks}</div>
                <div className="text-sm text-gray-600 mt-1">Clics WhatsApp</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-orange-600">{conversionRate}%</div>
                <div className="text-sm text-gray-600 mt-1">Taux conversion</div>
              </CardContent>
            </Card>
          </div>

          {/* Peak Time */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="font-bold text-lg text-gray-900">Pic d'activité</p>
                  <p className="text-gray-600">{peakTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Product */}
          {bestProduct && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    {bestProduct.product.image_url ? (
                      <img 
                        src={bestProduct.product.image_url} 
                        alt={bestProduct.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Produit
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Badge className="bg-green-500 text-white mb-2">
                      🏆 Produit Star
                    </Badge>
                    <p className="font-bold text-xl text-gray-900">{bestProduct.product.name}</p>
                    <p className="text-gray-600">
                      {bestProduct.scans} scans • {bestProduct.clicks} clics • {bestProduct.duration} min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Performance */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Performance par produit</h3>
            <div className="space-y-3">
              {productStatsData.map((stat, index) => (
                <Card key={stat.product.id} className={index === 0 ? 'border-green-300' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {stat.product.image_url ? (
                            <img 
                              src={stat.product.image_url} 
                              alt={stat.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              IMG
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{stat.product.name}</p>
                          <p className="text-sm text-gray-500">Durée: {stat.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{stat.scans}</div>
                          <div className="text-gray-500">scans</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{stat.clicks}</div>
                          <div className="text-gray-500">clics</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}