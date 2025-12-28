import React from 'react';
import { Badge } from "@/components/ui/badge";

export default function ProductBadges({ product, scanCount = 0 }) {
  const createdDate = new Date(product.created_date);
  const now = new Date();
  const daysSinceCreated = (now - createdDate) / (1000 * 60 * 60 * 24);
  
  const isNew = daysSinceCreated <= 7;
  const isHot = scanCount >= 20;
  const isPromo = product.is_on_promo;

  return (
    <div className="flex flex-wrap gap-2">
      {isNew && (
        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
          💎 Nouveauté
        </Badge>
      )}
      {isHot && (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          🔥 Forte demande
        </Badge>
      )}
      {isPromo && (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          🎉 Promo
        </Badge>
      )}
    </div>
  );
}