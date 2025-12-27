import React from 'react';
import Logo from '@/components/ui/Logo';
import { createPageUrl } from '@/utils/index';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo size="md" showText={true} />
            <p className="text-gray-400 mt-4 max-w-md">
              La solution la plus simple pour transformer vos vues TikTok en ventes WhatsApp. 
              Sans site web, sans paiement en ligne, sans friction.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Produit</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Guide TikTok</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 TiktocQR. Tous droits réservés.
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