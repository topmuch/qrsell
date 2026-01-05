import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Check, Smartphone, Video } from 'lucide-react';
import QRCode from 'qrcode';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';

export default function QRCodeDisplay({ product, seller, onClose, url, productName, open }) {
  const canvasRef = useRef(null);
  const tiktokCanvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('standard');
  
  const productUrl = url || (product?.public_id ? `${window.location.origin}/ProductPage?id=${product.public_id}` : '');
  const displayName = productName || product?.name;

  console.log('🔍 QRCodeDisplay - Product:', product);
  console.log('🔍 QRCodeDisplay - Product URL:', productUrl);

  // Generate enhanced QR code for download
  const generateDownloadQR = async (canvas, size, forTikTok = false) => {
    if (!canvas || !productUrl) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size + (forTikTok ? 60 : 0);
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    try {
      const tempCanvas = document.createElement('canvas');
      await QRCode.toCanvas(tempCanvas, productUrl, {
        width: size,
        margin: 2,
        color: {
          dark: seller?.primary_color || '#2563eb',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      
      ctx.drawImage(tempCanvas, 0, 0);
      
      // Add logo or text in center
      const centerX = size / 2;
      const centerY = size / 2;
      const logoSize = size * 0.18;
      
      if (seller?.logo_url) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 10, 0, 2 * Math.PI);
        ctx.fill();
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize);
          
          if (forTikTok) {
            ctx.fillStyle = '#1f2937';
            ctx.font = `bold ${Math.floor(size * 0.04)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('Scanner pour acheter', centerX, size + 40);
          }
        };
        img.src = seller.logo_url;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = seller?.primary_color || '#2563eb';
        ctx.font = `bold ${Math.floor(size * 0.035)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('QRSell', centerX, centerY);
        
        if (forTikTok) {
          ctx.fillStyle = '#1f2937';
          ctx.font = `bold ${Math.floor(size * 0.04)}px Arial`;
          ctx.textBaseline = 'top';
          ctx.fillText('Scanner pour acheter', centerX, size + 40);
        }
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  useEffect(() => {
    if (productUrl) {
      setTimeout(() => {
        if (canvasRef.current) {
          generateDownloadQR(canvasRef.current, 800, false);
        }
        if (tiktokCanvasRef.current) {
          generateDownloadQR(tiktokCanvasRef.current, 1000, true);
        }
      }, 150);
    }
  }, [productUrl, seller]);

  if (!productUrl) {
    return (
      <Dialog open={open !== undefined ? open : true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - {displayName || 'Produit'}</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-red-600 mb-4 font-semibold">⚠️ URL manquante.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const downloadQR = (canvas, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open !== undefined ? open : true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {displayName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="standard" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Standard
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              TikTok
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="mt-4">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <EnhancedQRCode
                  url={productUrl}
                  size={280}
                  color={seller?.primary_color || '#2563eb'}
                  logo={seller?.logo_url}
                  showText={false}
                />
              </div>
              <canvas ref={canvasRef} style={{display: 'none'}} />
              <Button 
                onClick={() => downloadQR(canvasRef.current, `qrcode-${Date.now()}.png`)}
                className="mt-4 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger QR (HD)
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tiktok" className="mt-4">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <EnhancedQRCode
                  url={productUrl}
                  size={300}
                  color={seller?.primary_color || '#2563eb'}
                  logo={seller?.logo_url}
                  showText={true}
                  text="Scanner pour acheter"
                />
              </div>
              <canvas ref={tiktokCanvasRef} style={{display: 'none'}} />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Optimisé pour vos vidéos et lives TikTok
              </p>
              <Button 
                onClick={() => downloadQR(tiktokCanvasRef.current, `qrcode-tiktok-${Date.now()}.png`)}
                className="mt-4 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger pour TikTok (HD)
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Copy link */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
          <input 
            type="text" 
            value={productUrl} 
            readOnly 
            className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
          />
          <Button size="sm" variant="outline" onClick={copyLink}>
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}