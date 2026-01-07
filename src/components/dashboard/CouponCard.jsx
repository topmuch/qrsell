import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ticket, Download, Copy, Check, Trash2, Calendar, QrCode, Ban, FileText, Eye, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCodeDisplay from './QRCodeDisplay';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CouponCard({ coupon, onDelete }) {
  const [showQR, setShowQR] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const couponUrl = `${window.location.origin}/CouponRedeem?token=${coupon.qr_token}`;
  const isExpired = new Date(coupon.valid_until) < new Date();
  const daysLeft = differenceInDays(new Date(coupon.valid_until), new Date());

  // Fetch coupon scans
  const { data: scans = [] } = useQuery({
    queryKey: ['coupon-scans', coupon.id],
    queryFn: () => base44.entities.Analytics.filter({ 
      product_id: coupon.id,
      event_type: 'scan'
    })
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: () => base44.entities.Coupon.update(coupon.id, { 
      is_active: !coupon.is_active 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['coupons']);
      toast.success(coupon.is_active ? 'Coupon désactivé' : 'Coupon activé');
    }
  });

  const copyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = async () => {
    const canvas = document.createElement('canvas');
    const QRCode = await import('qrcode');
    await QRCode.toCanvas(canvas, couponUrl, { width: 800, margin: 2 });
    
    const link = document.createElement('a');
    link.download = `coupon-${coupon.code}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportLogs = () => {
    const csvData = scans.map(scan => ({
      Date: format(new Date(scan.created_date), 'dd/MM/yyyy HH:mm', { locale: fr }),
      'User Agent': scan.user_agent,
      'Utilisé': coupon.is_used ? 'Oui' : 'Non'
    }));

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-coupon-${coupon.code}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Logs exportés avec succès');
  };

  const getStatus = () => {
    if (!coupon.is_active) return { label: 'Désactivé', color: 'bg-gray-500' };
    if (coupon.is_used) return { label: 'Utilisé', color: 'bg-gray-600' };
    if (isExpired) return { label: 'Expiré', color: 'bg-red-500' };
    return { label: 'Actif', color: 'bg-green-500' };
  };

  const status = getStatus();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`border-2 ${!coupon.is_active || isExpired ? 'opacity-60 border-gray-300' : 'border-purple-300 bg-gradient-to-br from-purple-50 to-white'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base md:text-lg flex items-center gap-2 mb-3">
                  <Ticket className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="truncate">{coupon.code}</span>
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${status.color} text-white text-xs`}>
                    {status.label}
                  </Badge>
                  <span className="text-lg font-black text-purple-600">
                    -{coupon.discount_amount} FCFA
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 flex-shrink-0"
                onClick={() => onDelete(coupon)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Description */}
            {coupon.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{coupon.description}</p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-white p-3 rounded-lg border border-purple-100 text-center">
                <div className="text-xs text-gray-500 mb-1">Créé le</div>
                <div className="text-sm font-bold text-gray-900">
                  {format(new Date(coupon.created_date), 'dd/MM/yyyy', { locale: fr })}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100 text-center">
                <div className="text-xs text-gray-500 mb-1">Expire le</div>
                <div className="text-sm font-bold text-gray-900">
                  {format(new Date(coupon.valid_until), 'dd/MM/yyyy', { locale: fr })}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100 text-center">
                <div className="text-xs text-gray-500 mb-1">Scans</div>
                <div className="text-xl font-black text-purple-600">
                  {scans.length}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100 text-center">
                <div className="text-xs text-gray-500 mb-1">Utilisations</div>
                <div className="text-xl font-black text-purple-600">
                  {coupon.is_used ? 1 : 0}
                </div>
              </div>
            </div>

            {/* Days Left Badge */}
            {!isExpired && !coupon.is_used && coupon.is_active && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg text-center text-sm font-semibold">
                {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}` : 'Expire aujourd\'hui'}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowQR(true)}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Voir QR
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => setShowLogs(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Logs
              </Button>
              {!coupon.is_used && !isExpired && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => toggleActiveMutation.mutate()}
                  disabled={toggleActiveMutation.isPending}
                >
                  {coupon.is_active ? (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Activer
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={exportLogs}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* QR Code Modal */}
      {showQR && (
        <QRCodeDisplay
          open={showQR}
          onClose={() => setShowQR(false)}
          url={couponUrl}
          productName={`Coupon: ${coupon.code}`}
        />
      )}

      {/* Logs Modal */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Logs du coupon {coupon.code}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-purple-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-black text-purple-600">{scans.length}</div>
                <div className="text-xs text-gray-600">Scans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-purple-600">{coupon.is_used ? 1 : 0}</div>
                <div className="text-xs text-gray-600">Utilisations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-purple-600">
                  {coupon.discount_amount}
                </div>
                <div className="text-xs text-gray-600">FCFA économisés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-purple-600">
                  {daysLeft > 0 ? daysLeft : 0}
                </div>
                <div className="text-xs text-gray-600">Jours restants</div>
              </div>
            </div>

            {/* Scan History */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Historique des scans ({scans.length})
              </h3>
              {scans.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Aucun scan pour le moment</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {scans.map((scan, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {format(new Date(scan.created_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {scan.user_agent}
                        </div>
                      </div>
                      {coupon.is_used && idx === 0 && (
                        <Badge className="bg-green-500 text-white">
                          Utilisé
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export Button */}
            <Button 
              onClick={exportLogs}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter en CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}