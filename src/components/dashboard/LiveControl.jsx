import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Radio, Zap, Play, Square, ExternalLink, Copy, Check, TrendingUp, Eye, MessageCircle, Settings, Clock, Gift } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function LiveControl({ seller, products }) {
  const [copied, setCopied] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFlashOffer, setShowFlashOffer] = useState(false);
  const [flashOfferType, setFlashOfferType] = useState('percentage');
  const [flashOfferValue, setFlashOfferValue] = useState(10);
  const [flashOfferDuration, setFlashOfferDuration] = useState(5);
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
    refetchInterval: 5000
  });

  const startLiveMutation = useMutation({
    mutationFn: async () => {
      if (selectedProducts.length === 0) {
        throw new Error('Sélectionnez au moins 1 produit');
      }

      const firstProduct = selectedProducts[0];
      
      if (liveSession) {
        return await base44.entities.LiveSession.update(liveSession.id, {
          active_product_id: firstProduct,
          preloaded_products: selectedProducts,
          is_live: true,
          live_started_at: new Date().toISOString()
        });
      } else {
        return await base44.entities.LiveSession.create({
          seller_id: seller.id,
          shop_slug: seller.shop_slug,
          active_product_id: firstProduct,
          preloaded_products: selectedProducts,
          is_live: true,
          live_started_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session']);
      toast.success('Live démarré ! 🔴');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const changeProductMutation = useMutation({
    mutationFn: async (productId) => {
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
        live_ended_at: new Date().toISOString(),
        flash_offer_active: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session']);
      setSelectedProducts([]);
      toast.success('Live terminé');
    }
  });

  const activateFlashOfferMutation = useMutation({
    mutationFn: async () => {
      const endsAt = new Date();
      endsAt.setMinutes(endsAt.getMinutes() + flashOfferDuration);
      
      return base44.entities.LiveSession.update(liveSession.id, {
        flash_offer_active: true,
        flash_offer_type: flashOfferType,
        flash_offer_value: flashOfferValue,
        flash_offer_ends_at: endsAt.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-session']);
      setShowFlashOffer(false);
      toast.success('🔥 Offre flash activée !');
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

  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      if (selectedProducts.length >= 5) {
        toast.error('Maximum 5 produits');
        return;
      }
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const preloadedProductIds = liveSession?.preloaded_products || [];

  return (
    <div className="space-y-6">
      {/* Live Reports Button */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Preuve de performance</h3>
              <p className="text-sm text-gray-600">
                Consultez vos résultats et statistiques live
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/PerformanceReports'}
              className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] hover:opacity-90"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Voir les rapports
            </Button>
          </div>
        </CardContent>
      </Card>

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

              {/* Flash Offer Control */}
              {!liveSession.flash_offer_active ? (
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Gift className="w-6 h-6 text-orange-600" />
                          <div>
                            <Label className="text-base font-bold text-gray-900">Offre flash</Label>
                            <p className="text-sm text-gray-600">Créez l'urgence avec un compte à rebours</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowFlashOffer(!showFlashOffer)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                        >
                          {showFlashOffer ? 'Annuler' : 'Activer'}
                        </Button>
                      </div>

                      {showFlashOffer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4 pt-4 border-t"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Type de réduction</Label>
                              <Select value={flashOfferType} onValueChange={setFlashOfferType}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Pourcentage (-10%)</SelectItem>
                                  <SelectItem value="fixed">Montant fixe (-2000 FCFA)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Valeur</Label>
                              <Select 
                                value={flashOfferValue.toString()} 
                                onValueChange={(v) => setFlashOfferValue(parseInt(v))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {flashOfferType === 'percentage' ? (
                                    <>
                                      <SelectItem value="5">-5%</SelectItem>
                                      <SelectItem value="10">-10%</SelectItem>
                                      <SelectItem value="15">-15%</SelectItem>
                                      <SelectItem value="20">-20%</SelectItem>
                                    </>
                                  ) : (
                                    <>
                                      <SelectItem value="1000">-1000 FCFA</SelectItem>
                                      <SelectItem value="2000">-2000 FCFA</SelectItem>
                                      <SelectItem value="5000">-5000 FCFA</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Durée</Label>
                            <Select 
                              value={flashOfferDuration.toString()} 
                              onValueChange={(v) => setFlashOfferDuration(parseInt(v))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="10">10 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={() => activateFlashOfferMutation.mutate()}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                            disabled={activateFlashOfferMutation.isPending}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Lancer l'offre flash
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-400">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Gift className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                      <p className="font-bold text-gray-900 text-lg">🔥 Offre flash active !</p>
                      <p className="text-sm text-gray-600">
                        {flashOfferType === 'percentage' ? `-${liveSession.flash_offer_value}%` : `-${liveSession.flash_offer_value} FCFA`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
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
                          Preuve sociale : "X personnes ont scanné"
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
                <p className="text-gray-600 mb-4">
                  🚀 <strong>Mode Live avancé</strong> : Préparez jusqu'à 5 produits et changez-les en direct sans recharger !
                </p>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-900 font-medium mb-2">
                    💡 Comment ça marche :
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Sélectionnez 1 à 5 produits ci-dessous</li>
                    <li>Démarrez le live avec le premier produit</li>
                    <li>Changez de produit en 1 clic pendant le live</li>
                    <li>Le QR code reste identique, seul le contenu change !</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Products Selection/Management */}
      <Card>
        <CardHeader>
          <CardTitle>
            {liveSession?.is_live ? 'Vos produits en live' : 'Préparez votre live'}
          </CardTitle>
          {!liveSession?.is_live && (
            <p className="text-sm text-gray-600 mt-1">
              Sélectionnez entre 1 et 5 produits ({selectedProducts.length}/5)
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {(liveSession?.is_live ? products.filter(p => preloadedProductIds.includes(p.id)) : products).map(product => {
                const isActive = liveSession?.is_live && liveSession?.active_product_id === product.id;
                const isSelected = selectedProducts.includes(product.id);
                const isPreloaded = preloadedProductIds.includes(product.id);
                
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className={`relative ${
                      isActive ? 'ring-4 ring-red-500 shadow-lg shadow-red-200' : 
                      isSelected ? 'ring-2 ring-purple-500' : ''
                    }`}>
                      {isActive && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
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

                        {liveSession?.is_live ? (
                          <Button
                            onClick={() => changeProductMutation.mutate(product.id)}
                            className={`w-full ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'}`}
                            disabled={isActive || changeProductMutation.isPending}
                          >
                            {isActive ? (
                              <>
                                <Radio className="w-4 h-4 mr-2 animate-pulse" />
                                Actif
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                Afficher
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => toggleProductSelection(product.id)}
                            variant={isSelected ? "default" : "outline"}
                            className={`w-full ${isSelected ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Sélectionné
                              </>
                            ) : (
                              'Sélectionner'
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {!liveSession?.is_live && selectedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Button
                onClick={() => startLiveMutation.mutate()}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white shadow-lg"
                size="lg"
                disabled={startLiveMutation.isPending}
              >
                <Play className="w-5 h-5 mr-2" />
                Démarrer le live avec {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}