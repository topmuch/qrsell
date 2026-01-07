import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, Download, Copy, Check, Trash2, Eye, MessageCircle, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCodeDisplay from './QRCodeDisplay';

export default function PromotionCard({ promotion, onDelete }) {
  const [showQR, setShowQR] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch promotion scans
  const { data: scans = [] } = useQuery({
    queryKey: ['promotion-scans', promotion.id],
    queryFn: () => base44.entities.PromotionScan.filter({ promotion_id: promotion.id }),
    refetchInterval: 5000
  });

  // Fetch WhatsApp clicks
  const { data: analytics = [] } = useQuery({
    queryKey: ['promotion-analytics', promotion.qr_token],
    queryFn: () => base44.entities.Analytics.filter({ product_id: promotion.id }),
    refetchInterval: 5000
  });

  const whatsappClicks = analytics.filter(a => a.event_type === 'whatsapp_click').length;
  const totalScans = scans.length;
  
  // Calculate status
  const getStatus = () => {
    if (!promotion.is_active) return { label: 'Désactivée', color: 'bg-gray-500', icon: AlertCircle };
    
    const firstScan = scans.find(s => !s.is_expired);
    if (firstScan && promotion.expires_at) {
      const expiresAt = new Date(promotion.expires_at);
      const now = new Date();
      
      if (now > expiresAt) {
        return { label: 'Expirée', color: 'bg-red-500', icon: Clock };
      }
      
      const minutesLeft = differenceInMinutes(expiresAt, now);
      return { 
        label: `Active (${minutesLeft}min)`, 
        color: 'bg-green-500 animate-pulse', 
        icon: Zap,
        minutesLeft 
      };
    }
    
    return { label: 'En attente', color: 'bg-blue-500', icon: Clock };
  };

  const status = getStatus();

  const promoUrl = `${window.location.origin}/PromotionProduct?token=${promotion.qr_token}`;
  const discountedPrice = promotion.original_price * (1 - promotion.discount_percentage / 100);

  const copyLink = () => {
    navigator.clipboard.writeText(promoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = async () => {
    const canvas = document.createElement('canvas');
    const QRCode = await import('qrcode');
    await QRCode.toCanvas(canvas, promoUrl, { width: 800, margin: 2 });
    
    const link = document.createElement('a');
    link.download = `promo-${promotion.product_name}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-orange-500" />
                  {promotion.product_name}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${status.color} text-white`}>
                    <status.icon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                  <Badge variant="outline" className="bg-orange-500 text-white">
                    -{promotion.discount_percentage}%
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => onDelete(promotion)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 line-through">
                {promotion.original_price} FCFA
              </span>
              <span className="text-xl font-bold text-orange-600">
                {Math.round(discountedPrice)} FCFA
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                <div className="text-2xl font-black text-blue-600">{totalScans}</div>
                <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3" />
                  Scans
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                <div className="text-2xl font-black text-green-600">{whatsappClicks}</div>
                <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Clics
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-200">
                <div className="text-2xl font-black text-purple-600">
                  {totalScans > 0 ? Math.round((whatsappClicks / totalScans) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-600">Conv.</div>
              </div>
            </div>

            {/* Timer for active promos */}
            {status.minutesLeft !== undefined && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg text-center font-bold">
                <Clock className="w-4 h-4 inline mr-2" />
                Expire dans {status.minutesLeft} min
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowQR(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                QR Code
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => setShowStats(true)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Stats
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showQR && (
        <QRCodeDisplay
          open={showQR}
          onClose={() => setShowQR(false)}
          url={promoUrl}
          productName={`Promo: ${promotion.product_name}`}
        />
      )}

      {/* Stats Modal */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              Statistiques de la promotion
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-center border-2 border-blue-200">
                <div className="text-3xl font-black text-blue-600">{totalScans}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                  <Eye className="w-4 h-4" />
                  Scans
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center border-2 border-green-200">
                <div className="text-3xl font-black text-green-600">{whatsappClicks}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                  <MessageCircle className="w-4 h-4" />
                  Clics
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center border-2 border-purple-200">
                <div className="text-3xl font-black text-purple-600">
                  {totalScans > 0 ? Math.round((whatsappClicks / totalScans) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Conversion</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl text-center border-2 border-orange-200">
                <div className="text-3xl font-black text-orange-600">
                  {promotion.discount_percentage}%
                </div>
                <div className="text-sm text-gray-600">Réduction</div>
              </div>
            </div>

            {/* Status Info */}
            <div className={`p-4 rounded-xl border-2 ${
              status.color.includes('green') ? 'bg-green-50 border-green-200' :
              status.color.includes('red') ? 'bg-red-50 border-red-200' :
              status.color.includes('gray') ? 'bg-gray-50 border-gray-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <status.icon className="w-5 h-5" />
                <span className="font-bold text-lg">Statut : {status.label}</span>
              </div>
              {promotion.expires_at && (
                <p className="text-sm text-gray-600">
                  Expire le {format(new Date(promotion.expires_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </p>
              )}
            </div>

            {/* Scan History */}
            {scans.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Historique des scans ({scans.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {scans.map((scan, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {format(new Date(scan.scan_timestamp), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </div>
                        <div className="text-xs text-gray-500">
                          Session : {scan.session_id?.slice(0, 8)}...
                        </div>
                      </div>
                      {scan.is_expired && (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                          Expiré
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}