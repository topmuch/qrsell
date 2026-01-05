import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function EnhancedQRCode({ 
  url, 
  size = 300, 
  color = '#2563eb',
  logo = null,
  showText = true,
  text = 'Scanner pour acheter'
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    const generateQR = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      const qrSize = size;
      const textHeight = showText ? 40 : 0;
      canvas.width = qrSize;
      canvas.height = qrSize + textHeight;
      
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Generate QR code
      const tempCanvas = document.createElement('canvas');
      await QRCode.toCanvas(tempCanvas, url, {
        width: qrSize,
        margin: 2,
        color: {
          dark: color,
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H' // High error correction for logo
      });

      // Draw QR code
      ctx.drawImage(tempCanvas, 0, 0);

      // Add logo or text in center
      const centerX = qrSize / 2;
      const centerY = qrSize / 2;
      const logoSize = qrSize * 0.2; // 20% of QR size

      if (logo) {
        // Draw white background circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 8, 0, 2 * Math.PI);
        ctx.fill();

        // Draw logo
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(
            img,
            centerX - logoSize / 2,
            centerY - logoSize / 2,
            logoSize,
            logoSize
          );
          
          // Add text below if needed
          if (showText) {
            drawText();
          }
        };
        img.src = logo;
      } else {
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw "QRSell" text
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('QRSell', centerX, centerY);

        // Add text below
        if (showText) {
          drawText();
        }
      }

      function drawText() {
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(text, qrSize / 2, qrSize + 10);
      }

      // If no logo, draw text immediately
      if (!logo && showText) {
        drawText();
      }
    };

    generateQR();
  }, [url, size, color, logo, showText, text]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}

// Utility function to download QR code
export function downloadQRCode(canvas, filename = 'qrcode.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}