import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileDown, Share2, Loader2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { toast } from 'sonner';

export default function CatalogGenerator({ seller, products }) {
  const [generating, setGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const generateCatalog = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Header with logo
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(seller.primary_color || '#2563eb');
      
      if (seller.logo_url) {
        try {
          const logoImg = await loadImage(seller.logo_url);
          doc.addImage(logoImg, 'PNG', margin, yPosition, 30, 30);
          doc.text(seller.shop_name || 'Ma Boutique', margin + 35, yPosition + 15);
        } catch (e) {
          doc.text(seller.shop_name || 'Ma Boutique', margin, yPosition + 15);
        }
      } else {
        doc.text(seller.shop_name || 'Ma Boutique', margin, yPosition + 15);
      }

      yPosition += 40;

      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Catalogue de produits', margin, yPosition);
      yPosition += 15;

      // Products
      const productsPerPage = 3;
      let productCount = 0;

      for (const product of products.filter(p => p.is_active)) {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = margin;
        }

        // Product box
        const boxHeight = 70;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, boxHeight);

        // Product image placeholder or actual image
        if (product.image_url) {
          try {
            const img = await loadImage(product.image_url);
            doc.addImage(img, 'JPEG', margin + 5, yPosition + 5, 25, 25);
          } catch (e) {
            // If image fails, draw placeholder
            doc.setFillColor(240, 240, 240);
            doc.rect(margin + 5, yPosition + 5, 25, 25, 'F');
          }
        } else {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin + 5, yPosition + 5, 25, 25, 'F');
        }

        // Product info
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(product.name, margin + 35, yPosition + 12);

        doc.setFontSize(16);
        doc.setTextColor(seller.primary_color || '#2563eb');
        doc.text(`${new Intl.NumberFormat('fr-FR').format(product.price)} FCFA`, margin + 35, yPosition + 22);

        if (product.description) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          const description = doc.splitTextToSize(product.description, 90);
          doc.text(description.slice(0, 2), margin + 35, yPosition + 30);
        }

        // QR Code
        const qrUrl = `${window.location.origin}/ProductPage?id=${product.public_id}`;
        const qrDataUrl = await QRCode.toDataURL(qrUrl, { 
          width: 200,
          color: {
            dark: seller.primary_color || '#2563eb',
            light: '#ffffff'
          }
        });
        doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - 25, yPosition + 10, 20, 20);

        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Scannez', pageWidth - margin - 20, yPosition + 35, { align: 'center' });

        yPosition += boxHeight + 10;
        productCount++;
      }

      // Footer - Shop QR Code
      if (yPosition > pageHeight - 70) {
        doc.addPage();
        yPosition = margin;
      }

      yPosition = pageHeight - 60;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      const shopUrl = `${window.location.origin}/Shop?slug=${seller.shop_slug}`;
      const shopQrDataUrl = await QRCode.toDataURL(shopUrl, { 
        width: 300,
        color: {
          dark: seller.primary_color || '#2563eb',
          light: '#ffffff'
        }
      });

      doc.addImage(shopQrDataUrl, 'PNG', pageWidth / 2 - 20, yPosition, 40, 40);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Scannez pour voir toute notre boutique', pageWidth / 2, yPosition + 45, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`Catalogue généré par ${seller.shop_name} - Propulsé par QRSell`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Generate blob
      const blob = doc.output('blob');
      setPdfBlob(blob);
      setShowModal(true);
      toast.success('Catalogue généré !');
    } catch (error) {
      console.error('Error generating catalog:', error);
      toast.error('Erreur lors de la génération du catalogue');
    } finally {
      setGenerating(false);
    }
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogue-${seller.shop_slug}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Catalogue téléchargé !');
  };

  const handleWhatsAppShare = () => {
    if (!pdfBlob) return;
    
    // Create a shareable message
    const message = `Bonjour ! Voici mon catalogue de produits. Scannez les QR codes pour commander directement.\n\n${window.location.origin}/Shop?slug=${seller.shop_slug}`;
    
    // Open WhatsApp with message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Message WhatsApp préparé ! Envoyez le PDF manuellement après.');
  };

  return (
    <>
      <Button
        onClick={generateCatalog}
        disabled={generating || products.length === 0}
        variant="outline"
        className="flex items-center gap-2"
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        Télécharger mon catalogue
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Catalogue généré avec succès</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Votre catalogue professionnel est prêt ! Téléchargez-le ou partagez-le sur WhatsApp.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleDownload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le PDF
              </Button>
              <Button
                onClick={handleWhatsAppShare}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager sur WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}