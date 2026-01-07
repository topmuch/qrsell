import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  QrCode, 
  Copy, 
  Download, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  ExternalLink,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import QRCodeDisplay from './QRCodeDisplay';

export default function ProductCard({ product, seller, onEdit, onDelete, analytics = [] }) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const productUrl = `${window.location.origin}/ProductPage?id=${product.public_id}`;

  // Calculate stats from analytics
  const scanCount = analytics.filter(a => a.product_id === product.id && a.event_type === 'scan').length;
  const clickCount = analytics.filter(a => a.product_id === product.id && a.event_type === 'whatsapp_click').length;
  const isHotProduct = scanCount > 20;

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = async () => {
    setDownloading(true);
    try {
      const QRCode = await import('qrcode');
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, productUrl, {
        width: 1000,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      const link = document.createElement('a');
      link.download = `QR_${product.public_id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading QR:', error);
    } finally {
      setDownloading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <div className="relative aspect-square bg-gray-100">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
                <QrCode className="w-16 h-16 text-pink-200" />
              </div>
            )}
            
            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setShowQR(true)}
                className="bg-white hover:bg-gray-100"
              >
                <QrCode className="w-4 h-4 mr-1" />
                QR
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={copyLink}
                className="bg-white hover:bg-gray-100"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white shadow-sm"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(productUrl, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir la page
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(product)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Badge 
                className={`${
                  product.is_active 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
                variant="outline"
              >
                {product.is_active ? 'Actif' : 'Inactif'}
              </Badge>
              {isHotProduct && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 animate-pulse">
                  🔥 Forte demande
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                {product.name}
              </h3>
              <p className="text-xl font-bold text-[#6C4AB6] mb-3">
                {formatPrice(product.price)} FCFA
              </p>
            </div>

            {/* QR Code Section */}
            <div className="bg-white p-3 rounded-xl border-2 border-dashed border-[#6C4AB6] relative mb-3">
              <div 
                className="cursor-pointer"
                onClick={() => setShowQR(true)}
              >
                <div className="flex items-center justify-center mb-2">
                  <QrCode className="w-20 h-20 text-[#6C4AB6]" />
                </div>
                <p className="text-center text-xs font-semibold text-[#6C4AB6]">
                  Scannez-moi !
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadQRCode();
                }}
                disabled={downloading}
                className="absolute bottom-1 right-1 text-[#6C4AB6] hover:bg-purple-50 h-7 text-xs px-2"
              >
                <Download className="w-3 h-3 mr-1" />
                {downloading ? '...' : 'Télécharger'}
              </Button>
            </div>

            {product.description && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t">
              <span>📊 {scanCount} scans</span>
              <span className="text-gray-300">|</span>
              <span>👆 {clickCount} clics</span>
            </div>

            {/* Action button */}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={copyLink}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-green-500" />
                  Lien copié
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copier le lien
                </>
              )}
            </Button>

            <p className="text-xs text-gray-400 font-mono text-center">
              {product.public_id}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {showQR && (
        <QRCodeDisplay 
          product={product}
          seller={seller}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
}