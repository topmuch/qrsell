import React, { useState, useEffect } from "react";
import { X, Flame, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BannerDisplay({ banner, onClose }) {
  if (!banner) return null;

  const positionStyles = {
    header: "top-0",
    footer: "bottom-0",
    sidebar: "right-0 top-20",
    "product-page": ""
  };

  const handleClose = () => {
    // Enregistrer dans localStorage que l'utilisateur a fermé cette bannière
    localStorage.setItem(`banner_closed_${banner.id}`, "true");
    if (onClose) onClose();
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm p-4 mb-4 relative">
      <div className="flex items-start gap-3">
        {/* Icône */}
        <div className="flex-shrink-0">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>

        {/* Contenu */}
        <div className="flex-1 space-y-2">
          {/* Image si présente */}
          {banner.image_url && (
            <img 
              src={banner.image_url} 
              alt="Bannière" 
              className="w-full h-32 object-cover rounded-md"
            />
          )}

          {/* Texte */}
          <p className="text-gray-800 font-medium">
            {banner.text}
          </p>

          {/* Bouton d'action */}
          {banner.link && (
            <Button
              onClick={() => window.open(banner.link, '_blank')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              En savoir plus
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}