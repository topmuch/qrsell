import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Check, Smartphone, Video } from 'lucide-react';

export default function QRCodeDisplay({ product, seller, onClose }) {
  const canvasRef = useRef(null);
  const tiktokCanvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  
  const productUrl = `${window.location.origin}/ProductPage?id=${product.public_id}`;

  // Generate QR code using canvas
  const generateQRCode = (canvas, size, withBranding = false) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const qrData = productUrl;
    
    // Simple QR-like pattern (in production, use a real QR library)
    const moduleCount = 25;
    const moduleSize = size / moduleCount;
    
    canvas.width = withBranding ? size : size;
    canvas.height = withBranding ? size + 80 : size;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Generate QR pattern based on URL hash
    const hash = qrData.split('').reduce((acc, char, i) => {
      return acc + char.charCodeAt(0) * (i + 1);
    }, 0);
    
    ctx.fillStyle = '#1f2937';
    
    // Position patterns (corners)
    const drawPositionPattern = (x, y, size) => {
      ctx.fillRect(x, y, size * 7, size * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + size, y + size, size * 5, size * 5);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(x + size * 2, y + size * 2, size * 3, size * 3);
    };
    
    drawPositionPattern(0, 0, moduleSize);
    drawPositionPattern(moduleSize * 18, 0, moduleSize);
    drawPositionPattern(0, moduleSize * 18, moduleSize);
    
    // Data modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip position patterns
        if ((row < 9 && col < 9) || (row < 9 && col > 15) || (row > 15 && col < 9)) continue;
        
        const seed = (hash + row * 31 + col * 17) % 100;
        if (seed > 45) {
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize - 1, moduleSize - 1);
        }
      }
    }
    
    if (withBranding) {
      // Add branding below QR
      ctx.fillStyle = '#ed477c';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scannez pour commander !', size / 2, size + 30);
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('TiktocQR', size / 2, size + 55);
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
                <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
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
                <canvas ref={tiktokCanvasRef} className="w-[300px]" />
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