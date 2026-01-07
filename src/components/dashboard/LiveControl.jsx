import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Radio, Zap, Play, Square, ExternalLink, Copy, Check, TrendingUp, Eye, MessageCircle, Settings } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import LiveReport from './LiveReport';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function LiveControl({ seller, products }) {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { data: liveSessions = [] } = useQuery({
    queryKey: ['live-session', seller?.id],
    queryFn: () => base44.entities.LiveSession.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id,
    refetchInterval: 3000
  });

  const liveSession = liveSessions[0];

  const { data: analytics = [] } = useQuery({
    queryKey: ['live-analytics', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id,
    refetchInterval: 5000 // Auto-refresh every 5 seconds
  });

  const { data: productStats = [] } = useQuery({
    queryKey: ['live-product-stats', liveSession?.id],
    queryFn: () => base44.entities.LiveProductStats.filter({ live_session_id: liveSession?.id }),
    enabled: !!liveSession?.id,
    refetchInterval: 5000
  });

  const startLiveMutation = useMutation({
    mutationFn: async (productId) => {
      let session;
      if (liveSession) {
        session = await base44.entities.LiveSession.update(liveSession.id, {
          active_product_id: productId,
          is_live: true,
          live_started_at: new Date().toISOString()
        });
      } else {
        session = await base44.entities.LiveSession.create({
          seller_id: seller.id,
          shop_slug: seller.shop_slug,
          active_product_id: productId,
          is_live: true,
          live_started_at: new Date().toISOString()
        });
      }

      // Create initial product stats
      await base44.entities.LiveProductStats.create({
        live_session_id: session.id,
        product_id: productId,
        time_started: new Date().toISOString()
      });

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session']);
      queryClient.invalidateQueries(['live-product-stats']);
      toast.success('Live démarré !');
    }
  });

  const changeProductMutation = useMutation({
    mutationFn: async (productId) => {
      // End stats for current product
      const currentStats = productStats.find(s => s.product_id === liveSession.active_product_id && !s.time_ended);
      if (currentStats) {
        await base44.entities.LiveProductStats.update(currentStats.id, {
          time_ended: new Date().toISOString()
        });
      }

      // Create new stats for next product
      await base44.entities.LiveProductStats.create({
        live_session_id: liveSession.id,
        product_id: productId,
        time_started: new Date().toISOString()
      });

      return base44.entities.LiveSession.update(liveSession.id, {
        active_product_id: productId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session']);
      queryClient.invalidateQueries(['live-product-stats']);
      toast.success('Produit changé !');
    }
  });

  const stopLiveMutation = useMutation({
    mutationFn: () => {
      return base44.entities.LiveSession.update(liveSession.id, {
        is_live: false,
        live_ended_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session']);
      toast.success('Live terminé');
    }
  });

  const liveUrl = `${window.location.origin}/Live?slug=${seller?.shop_slug}`;

  const copyLiveLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const getLiveStats = () => {
    if (!liveSession?.live_started_at) return null;

    const liveStartTime = new Date(liveSession.live_started_at);
    const liveAnalytics = analytics.filter(a => 
      new Date(a.created_date) >= liveStartTime &&
      (liveSession.is_live || new Date(a.created_date) <= new Date(liveSession.live_ended_at || Date.now()))
    );

    const scans = liveAnalytics.filter(a => a.event_type === 'scan').length;
    const clicks = liveAnalytics.filter(a => a.event_type === 'whatsapp_click').length;
    const views = liveAnalytics.filter(a => a.event_type === 'view_product').length;

    return { scans, clicks, views };
  };

  const stats = getLiveStats();

  return (
    <div className="space-y-6">
      {/* Live Reports Button */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Rapports de Live</h3>
              <p className="text-sm text-gray-600">
                Consultez l'historique complet de vos sessions live
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/LiveReports'}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Voir les rapports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Report */}
      <LiveReport 
        liveSession={liveSession}
        analytics={analytics}
        products={products}
        productStats={productStats}
      />

      {/* Live Status & URL */}
      <Card className={liveSession?.is_live ? 'border-2 border-red-500' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className={`w-5 h-5 ${liveSession?.is_live ? 'text-red-500' : 'text-gray-400'}`} />
              Mode Live TikTok
            </div>
            {liveSession?.is_live && (
              <Badge className="bg-red-500 text-white animate-pulse">
                EN DIRECT
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {liveSession?.is_live ? (
            <>
              <Alert className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium text-gray-900">
                      🔴 Votre live est actif ! Partagez ce lien sur votre écran :
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white p-3 rounded-lg text-sm font-mono border-2 border-red-300 text-red-700">
                        {liveUrl}
                      </code>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={copyLiveLink}
                        className="border-red-300"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="border-red-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Live Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-blue-600">{stats.scans}</div>
                      <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                        <Eye className="w-4 h-4" />
                        Scans
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-purple-600">{stats.views}</div>
                      <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4" />
                        Vues
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.clicks}</div>
                      <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                        <MessageCircle className="w-4 h-4" />
                        Clics
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Public Counter Toggle */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <div>
                        <Label htmlFor="public-counter" className="text-base font-medium text-gray-900 cursor-pointer">
                          Afficher le compteur aux clients
                        </Label>
                        <p className="text-sm text-gray-600">
                          Les clients verront le nombre de scans en temps réel
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="public-counter"
                      checked={seller.show_live_public_counter || false}
                      onCheckedChange={(checked) => {
                        base44.entities.Seller.update(seller.id, {
                          show_live_public_counter: checked
                        }).then(() => {
                          queryClient.invalidateQueries(['seller']);
                          toast.success(checked ? 'Compteur public activé' : 'Compteur public désactivé');
                        });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => stopLiveMutation.mutate()}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <Square className="w-5 h-5 mr-2" />
                Terminer le live
              </Button>
            </>
          ) : (
            <Alert>
              <AlertDescription>
                <p className="text-gray-600">
                  Le mode live vous permet d'afficher un produit à la fois avec un QR code géant pendant vos lives TikTok. 
                  Sélectionnez un produit ci-dessous pour démarrer.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {liveSession?.is_live ? 'Changer de produit' : 'Sélectionner un produit'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {products.map(product => {
                const isActive = liveSession?.is_live && liveSession?.active_product_id === product.id;
                
                // Get product stats
                const productStat = productStats.find(s => s.product_id === product.id && !s.time_ended);
                const productScans = productStat ? 
                  analytics.filter(a => 
                    a.product_id === product.id && 
                    new Date(a.created_date) >= new Date(productStat.time_started)
                  ).filter(a => a.event_type === 'scan').length : 0;
                
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className={`relative ${isActive ? 'ring-4 ring-red-500 shadow-lg shadow-red-200' : ''}`}>
                      {isActive && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-red-500 text-white shadow-lg">
                            <Radio className="w-3 h-3 mr-1 animate-pulse" />
                            EN LIVE
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              Pas d'image
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-sm mb-2 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-lg font-bold text-blue-600 mb-2">
                          {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA
                        </p>
                        {liveSession?.is_live && productScans > 0 && (
                          <div className="text-sm text-gray-600 mb-3 flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold">{productScans} scans</span>
                          </div>
                        )}
                        <Button
                          onClick={() => {
                            if (liveSession?.is_live) {
                              changeProductMutation.mutate(product.id);
                            } else {
                              startLiveMutation.mutate(product.id);
                            }
                          }}
                          className={`w-full ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'}`}
                          disabled={isActive}
                        >
                          {isActive ? (
                            <>
                              <Radio className="w-4 h-4 mr-2 animate-pulse" />
                              Produit actif
                            </>
                          ) : liveSession?.is_live ? (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Changer
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Démarrer le live
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}