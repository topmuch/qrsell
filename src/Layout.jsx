import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Menu, X } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const location = useLocation();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  // Pages qui n'ont pas besoin du menu (pages authentifiées + boutiques publiques)
  const hideMenu = ['Dashboard', 'AdminPanel', 'ProfileSetup', 'SubscriptionExpired', 'Shop'].includes(currentPageName);

  if (hideMenu) {
    return <>{children}</>;
  }

  const isActive = (pageName) => currentPageName === pageName;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')}>
              <Logo size="md" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to={createPageUrl('Home')} 
                className={`font-medium transition-colors ${
                  isActive('Home') ? 'text-[#2563eb]' : 'text-gray-700 hover:text-[#2563eb]'
                }`}
              >
                Accueil
              </Link>
              <Link 
                to={createPageUrl('AllShops')} 
                className={`font-medium transition-colors ${
                  isActive('AllShops') ? 'text-[#2563eb]' : 'text-gray-700 hover:text-[#2563eb]'
                }`}
              >
                Boutiques
              </Link>
              <Link 
                to={createPageUrl('Demo')} 
                className={`font-medium transition-colors ${
                  isActive('Demo') ? 'text-[#2563eb]' : 'text-gray-700 hover:text-[#2563eb]'
                }`}
              >
                Démo
              </Link>
              <Link 
                to={createPageUrl('Campagnes')} 
                className={`font-medium transition-colors ${
                  isActive('Campagnes') ? 'text-[#2563eb]' : 'text-gray-700 hover:text-[#2563eb]'
                }`}
              >
                Campagnes
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link to={createPageUrl('Dashboard')}>
                    <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full px-6">
                      Mon Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => base44.auth.logout(createPageUrl('Home'))}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-[#2563eb]"
                    onClick={() => base44.auth.redirectToLogin()}
                  >
                    Connexion
                  </Button>
                  <Link to={createPageUrl('DevenirVendeur')}>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white rounded-full px-6 font-bold">
                      Devenir vendeur
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
              <Link 
                to={createPageUrl('Home')} 
                className={`block py-2 font-medium ${
                  isActive('Home') ? 'text-[#2563eb]' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to={createPageUrl('AllShops')} 
                className={`block py-2 font-medium ${
                  isActive('AllShops') ? 'text-[#2563eb]' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Boutiques
              </Link>
              <Link 
                to={createPageUrl('Demo')} 
                className={`block py-2 font-medium ${
                  isActive('Demo') ? 'text-[#2563eb]' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Démo
              </Link>
              <Link 
                to={createPageUrl('Campagnes')} 
                className={`block py-2 font-medium ${
                  isActive('Campagnes') ? 'text-[#2563eb]' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Campagnes
              </Link>
              {user ? (
                <Link 
                  to={createPageUrl('Dashboard')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full mt-3">
                    Mon Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2 mt-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      base44.auth.redirectToLogin();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Connexion
                  </Button>
                  <Link 
                    to={createPageUrl('DevenirVendeur')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white rounded-full font-bold">
                      Devenir vendeur
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}