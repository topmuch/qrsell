import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Check, Smartphone, Video } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRCodeDisplay({ product, seller, onClose }) {
  const canvasRef = useRef(null);
  const tiktokCanvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  
  const productUrl = `${window.location.origin}/ProductPage?id=${product.public_id}`;

  // Generate real QR code using qrcode library
  const generateQRCode = async (canvas, size, withBranding = false) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const padding = 20;
    const brandingHeight = withBranding ? 80 : 0;
    canvas.width = size + (padding * 2);
    canvas.height = size + (padding * 2) + brandingHeight;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Generate QR code
    const tempCanvas = document.createElement('canvas');
    await QRCode.toCanvas(tempCanvas, productUrl, {
      width: size,
      margin: 0,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    });
    
    // Draw QR code on main canvas
    ctx.drawImage(tempCanvas, padding, padding);
    
    if (withBranding) {
      // Add branding below QR
      const textY = size + padding + 20;
      
      ctx.fillStyle = '#ed477c';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scan pour acheter sur WhatsApp !', canvas.width / 2, textY);
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('TiktocQR', canvas.width / 2, textY + 30);
    }
  };

  useEffect(() => {
    generateQRCode(canvasRef.current, 200, false);
    generateQRCode(tiktokCanvasRef.current, 300, true);
  }, [product]);

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {product.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="standard" className="w-full">
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
                <canvas ref={canvasRef} width={240} height={240} style={{display: 'block'}} />
              </div>
              <Button 
                onClick={() => downloadQR(canvasRef.current, `${product.public_id}-qr.png`)}
                className="mt-4 bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger QR
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tiktok" className="mt-4">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
                <canvas ref={tiktokCanvasRef} width={340} height={420} style={{display: 'block'}} />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Optimisé pour vos vidéos et lives TikTok
              </p>
              <Button 
                onClick={() => downloadQR(tiktokCanvasRef.current, `${product.public_id}-tiktok.png`)}
                className="mt-4 bg-gradient-to-r from-[#ed477c] to-[#ff6b9d] hover:opacity-90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger pour TikTok
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