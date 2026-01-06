import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Radio, Zap, Play, Square, ExternalLink, Copy, Check, TrendingUp, Eye, MessageCircle } from 'lucide-react';
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
    enabled: !!seller?.id
  });

  const startLiveMutation = useMutation({
    mutationFn: async (productId) => {
      if (liveSession) {
        return base44.entities.LiveSession.update(liveSession.id, {
          active_product_id: productId,
          is_live: true,
          live_started_at: new Date().toISOString()
        });
      } else {
        return base44.entities.LiveSession.create({
          seller_id: seller.id,
          shop_slug: seller.shop_slug,
          active_product_id: productId,
          is_live: true,
          live_started_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session']);
      toast.success('Live démarré !');
    }
  });

  const changeProductMutation = useMutation({
    mutationFn: (productId) => {
      return base44.entities.LiveSession.update(liveSession.id, {
        active_product_id: productId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session']);
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
                        <p className="text-lg font-bold text-blue-600 mb-3">
                          {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA
                        </p>
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