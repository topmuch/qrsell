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

export default function LiveControl({ seller, currentShop, products }) {
  const [copied, setCopied] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFlashOffer, setShowFlashOffer] = useState(false);
  const [flashOfferType, setFlashOfferType] = useState('percentage');
  const [flashOfferValue, setFlashOfferValue] = useState(10);
  const [flashOfferDuration, setFlashOfferDuration] = useState(5);
  const queryClient = useQueryClient();

  const { data: liveSessions = [] } = useQuery({
    queryKey: ['live-session', currentShop?.shop_slug],
    queryFn: () => base44.entities.LiveSession.filter({ shop_slug: currentShop?.shop_slug }),
    enabled: !!currentShop?.shop_slug,
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

      // Vérifier s'il y a une session active pour cette boutique
      const activeLiveSessions = await base44.entities.LiveSession.filter({
        shop_slug: currentShop.shop_slug,
        is_live: true
      });

      if (activeLiveSessions.length > 0) {
        throw new Error('Une session live est déjà active pour cette boutique. Arrêtez-la avant d\'en démarrer une nouvelle.');
      }

      const firstProduct = selectedProducts[0];
      
      // Créer une NOUVELLE session à chaque fois (historisation)
      return await base44.entities.LiveSession.create({
        seller_id: seller.id,
        shop_slug: currentShop.shop_slug,
        active_product_id: firstProduct,
        preloaded_products: selectedProducts,
        is_live: true,
        live_started_at: new Date().toISOString(),
        total_scans: 0
      });
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
    mutationFn: async () => {
      // Calculer les stats finales avant d'arrêter
      const liveAnalytics = analytics.filter(a => {
        const eventTime = new Date(a.created_date);
        const liveStart = new Date(liveSession.live_started_at);
        return eventTime >= liveStart && 
               liveSession.preloaded_products?.includes(a.product_id);
      });

      const totalScans = liveAnalytics.filter(a => a.event_type === 'scan').length;

      return base44.entities.LiveSession.update(liveSession.id, {
        is_live: false,
        live_ended_at: new Date().toISOString(),
        total_scans: totalScans,
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

  const liveUrl = `${window.location.origin}/Live?slug=${currentShop?.shop_slug}`;

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
                      🔴 Votre live est actif ! Ce QR code unique fonctionne pour tous vos produits :
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-1 space-y-2 w-full">
                        <code className="block bg-white p-3 rounded-lg text-sm font-mono border-2 border-red-300 text-red-700 break-all">
                          {liveUrl}
                        </code>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={copyLiveLink}
                            className="border-red-300 flex-1"
                          >
                            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            Copier
                          </Button>
                          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="border-red-300 w-full bg-blue-50 hover:bg-blue-100"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir ce que voit le client
                            </Button>
                          </a>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-2 border-red-300 shadow-lg">
                        <div className="text-xs text-center mb-2 font-bold text-red-600">QR CODE UNIQUE</div>
                        <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(liveUrl)}`}
                            alt="QR Code Live"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="text-xs text-center mt-2 text-gray-600">Affiche-le une fois</div>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-900">
                        ✅ <strong>Changez de produit ci-dessous</strong> → vos clients verront le nouveau produit automatiquement (mise à jour toutes les 3 secondes)
                      </p>
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
                      checked={currentShop?.show_live_public_counter || false}
                      onCheckedChange={(checked) => {
                        base44.entities.Shop.update(currentShop.id, {
                          show_live_public_counter: checked
                        }).then(() => {
                          queryClient.invalidateQueries(['shops']);
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
            <div className="space-y-4">
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
                      <li><strong>Le QR code reste identique</strong>, seul le contenu change automatiquement !</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
              {selectedProducts.length === 0 && (
                <Alert variant="destructive">
                  <AlertDescription className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <span className="font-medium">Aucun produit sélectionné. Sélectionnez au moins 1 produit pour commencer.</span>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Selection/Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {liveSession?.is_live ? 'Changez de produit en direct' : 'Préparez votre live'}
            </span>
            {liveSession?.is_live && liveSession.active_product_id && (
              <Badge className="bg-green-500 text-white">
                <Eye className="w-3 h-3 mr-1" />
                Produit actif visible par les clients
              </Badge>
            )}
          </CardTitle>
          {!liveSession?.is_live ? (
            <p className="text-sm text-gray-600 mt-1">
              Sélectionnez entre 1 et 5 produits ({selectedProducts.length}/5)
            </p>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-blue-900">
                💡 <strong>Cliquez sur un produit</strong> pour le montrer instantanément à vos clients. Le QR code reste le même !
              </p>
            </div>
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
                          <div className="space-y-2">
                            <Button
                              onClick={() => changeProductMutation.mutate(product.id)}
                              className={`w-full ${isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'}`}
                              disabled={isActive || changeProductMutation.isPending}
                            >
                              {isActive ? (
                                <>
                                  <Radio className="w-4 h-4 mr-2 animate-pulse" />
                                  🔴 EN DIRECT
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Afficher ce produit
                                </>
                              )}
                            </Button>
                            {isActive && (
                              <p className="text-xs text-center text-green-600 font-medium">
                                👁️ Visible par les clients maintenant
                              </p>
                            )}
                          </div>
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