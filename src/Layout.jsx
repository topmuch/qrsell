import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import Logo from './components/ui/Logo';
import { Button } from "./components/ui/button";
import { base44 } from '@/api/base44Client';

export default function Layout({ children }) {
  const location = useLocation();
  const isPublicPage = ['/', '/Home', '/SubscriptionRequest', '/TikTokGuidePublic'].includes(location.pathname);

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  // Menu principal pour les pages publiques
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-white">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to={createPageUrl('Home')}>
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to={createPageUrl('Home')} 
                className="text-gray-700 hover:text-[#2563eb] font-medium transition-colors"
              >
                Accueil
              </Link>
              <Link 
                to={createPageUrl('SubscriptionRequest')} 
                className="text-gray-700 hover:text-[#2563eb] font-medium transition-colors"
              >
                Devenir vendeur
              </Link>
              <Link 
                to={createPageUrl('TikTokGuidePublic')} 
                className="text-gray-700 hover:text-[#2563eb] font-medium transition-colors"
              >
                Guide TikTok
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="text-gray-700 hover:text-[#2563eb]"
              >
                Connexion
              </Button>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={handleLogin}>
                Connexion
              </Button>
            </div>
          </div>
        </header>
        <main className="pt-16">
          {children}
        </main>
      </div>
    );
  }

  // Pas de layout pour les pages privées (elles ont leur propre navigation)
  return <>{children}</>;
}