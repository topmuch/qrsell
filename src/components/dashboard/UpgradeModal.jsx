import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils/index';

export default function UpgradeModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-600">
            <Sparkles className="w-6 h-6" />
            Fonctionnalité Premium
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">
              Cette fonctionnalité est réservée au forfait TikTok Pro
            </p>
            <p className="text-3xl font-black text-purple-600 mb-1">
              10 000 FCFA/mois
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-gray-900">✨ Avec le forfait Pro, débloquez :</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Gérez jusqu'à 3 boutiques</strong> depuis un seul compte</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Alertes de tendances</strong> localisées par ville</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>500 produits max</strong> (vs 100 sur le forfait de base)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Support prioritaire</strong></span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-medium">💡 Doublez vos ventes avec plusieurs marques !</p>
            <p className="text-xs mt-1 text-blue-700">
              Exemple : "Mode Amina", "Beauté Amina", "Accessoires Amina" → 3 boutiques séparées, 3 audiences ciblées.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Plus tard
            </Button>
            <Button 
              onClick={() => window.location.href = createPageUrl('DevenirVendeur')}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
            >
              Mettre à niveau
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}