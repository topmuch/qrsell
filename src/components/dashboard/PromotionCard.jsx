import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Download, Copy, Check, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCodeDisplay from './QRCodeDisplay';

export default function PromotionCard({ promotion, onDelete }) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

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
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  {promotion.product_name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-orange-500 text-white">
                    -{promotion.discount_percentage}%
                  </Badge>
                  <span className="text-sm text-gray-500 line-through">
                    {promotion.original_price} FCFA
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {Math.round(discountedPrice)} FCFA
                  </span>
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
            <div className="bg-white p-3 rounded-lg border border-orange-200">
              <p className="text-xs text-gray-600 mb-1">⏱️ Validité</p>
              <p className="text-sm font-medium">30 minutes après le premier scan</p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowQR(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Voir QR
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyLink}
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
    </>
  );
}