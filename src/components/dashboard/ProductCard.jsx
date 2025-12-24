import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, ExternalLink, Trash2, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProductCard({ product, index, onRefresh }) {
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const productUrl = `${window.location.origin}${product.public_id ? `/p/${product.public_id}` : ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    
    setDeleting(true);
    try {
      await base44.entities.Product.delete(product.id);
      toast.success('Produit supprimé');
      onRefresh();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!product.qr_code_url) {
      toast.error('QR code non disponible');
      return;
    }
    
    try {
      const response = await fetch(product.qr_code_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${product.public_id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('QR code téléchargé');
    } catch (err) {
      toast.error('Erreur lors du téléchargement');
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all border-2 hover:border-[#ed477c]">
        {product.image_url && (
          <div className="relative h-48 bg-gray-200">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1">{product.name}</h3>
          <p className="text-2xl font-bold text-[#ed477c] mb-2">
            {product.price?.toLocaleString()} FCFA
          </p>
          {product.description && (
            <p className="text-sm text-gray-600 mb-4">{product.description}</p>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleDownloadQR}
              className="w-full bg-[#ed477c] hover:bg-[#d63d6c] text-white"
              size="sm"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Télécharger QR
            </Button>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier lien
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                asChild
              >
                <a href={productUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              
              <Button 
                onClick={handleDelete}
                disabled={deleting}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">ID: {product.public_id}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}