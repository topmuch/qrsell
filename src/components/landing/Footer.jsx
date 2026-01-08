import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { createPageUrl } from '@/utils/index';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo size="md" showText={true} variant="dark" />
            <p className="text-gray-400 mt-4 max-w-md">
              ShopQR - La plateforme de commerce QR Code pour l'Afrique et l'Europe. 
              Vendez via WhatsApp et TikTok Live sans site web.
            </p>
            {/* SEO Keywords */}
            <p className="text-gray-600 text-xs mt-4">
              Boutique QR • Commerce WhatsApp • Vendre sur TikTok • E-commerce Afrique
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Produit</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to={createPageUrl('PricingPlans')} className="hover:text-white transition-colors">
                  Tarifs & Forfaits
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Demo')} className="hover:text-white transition-colors">
                  Démo gratuite
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('TikTokGuidePublic')} className="hover:text-white transition-colors">
                  Guide TikTok Live
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('AllShops')} className="hover:text-white transition-colors">
                  Toutes les boutiques
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to={createPageUrl('DevenirVendeur')} className="hover:text-white transition-colors">
                  Devenir vendeur
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Campagnes')} className="hover:text-white transition-colors">
                  Campagnes partenaires
                </Link>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">Contact WhatsApp</a></li>
            </ul>
          </div>
        </div>
        
        {/* SEO-friendly location section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <h5 className="text-sm font-semibold text-gray-500 mb-4">Disponible dans ces pays :</h5>
          <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-8">
            <span>🇸🇳 Sénégal (Dakar)</span>
            <span>🇨🇮 Côte d'Ivoire (Abidjan)</span>
            <span>🇨🇲 Cameroun (Douala, Yaoundé)</span>
            <span>🇫🇷 France (Paris)</span>
            <span>🇲🇦 Maroc (Casablanca)</span>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 ShopQR. Tous droits réservés. Commerce QR Code Afrique & Europe.
          </p>
          <div className="flex gap-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}