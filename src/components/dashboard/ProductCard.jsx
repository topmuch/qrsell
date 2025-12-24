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

export default function ProductCard({ product, seller, onEdit, onDelete }) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const productUrl = `${window.location.origin}/ProductPage?id=${product.public_id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

            {/* Status badge */}
            <Badge 
              className={`absolute top-2 left-2 ${
                product.is_active 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
              variant="outline"
            >
              {product.is_active ? 'Actif' : 'Inactif'}
            </Badge>
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">
              {product.name}
            </h3>
            <p className="text-lg font-bold text-[#ed477c]">
              {formatPrice(product.price)} FCFA
            </p>
            {product.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {product.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2 font-mono">
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