import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Download, Copy, Check, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import QRCodeDisplay from './QRCodeDisplay';

export default function CouponCard({ coupon, onDelete }) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const couponUrl = `${window.location.origin}/CouponRedeem?token=${coupon.qr_token}`;
  const isExpired = new Date(coupon.valid_until) < new Date();

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`border-purple-200 ${isExpired ? 'opacity-50' : 'bg-gradient-to-br from-purple-50 to-white'}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-500" />
                  {coupon.code}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {coupon.is_used ? (
                    <Badge variant="outline" className="bg-gray-500 text-white">
                      Utilisé
                    </Badge>
                  ) : isExpired ? (
                    <Badge variant="outline" className="bg-red-500 text-white">
                      Expiré
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-500 text-white">
                      Actif
                    </Badge>
                  )}
                  <span className="text-lg font-bold text-purple-600">
                    -{coupon.discount_amount} FCFA
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => onDelete(coupon)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {coupon.description && (
              <p className="text-sm text-gray-600">{coupon.description}</p>
            )}

            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Valable jusqu'au {format(new Date(coupon.valid_until), 'dd/MM/yyyy')}</span>
              </div>
            </div>

            {!coupon.is_used && !isExpired && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowQR(true)}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Voir QR
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyCode}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadQR}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {showQR && (
        <QRCodeDisplay
          open={showQR}
          onClose={() => setShowQR(false)}
          url={couponUrl}
          productName={`Coupon: ${coupon.code}`}
        />
      )}
    </>
  );
}