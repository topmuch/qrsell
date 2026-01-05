import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils/index';
import { Button } from "@/components/ui/button";
import { Shield, Users, Package, Activity, LogOut, Loader2, Megaphone, CreditCard, FileText, Moon, Sun, ChevronLeft, ChevronRight, BarChart3, Bug } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import StatsOverview from '@/components/admin/StatsOverview';
import SellerManagement from '@/components/admin/SellerManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import ActivityLogs from '@/components/admin/ActivityLogs';
import PlanManagement from '@/components/admin/PlanManagement';
import SubscriptionRequestManagement from '@/components/admin/SubscriptionRequestManagement';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';
import ManualClientCreation from '@/components/admin/ManualClientCreation';
import SiteSettings from '@/components/admin/SiteSettings';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsAdmin(currentUser?.role === 'admin');
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Load sidebar state
    const savedSidebar = localStorage.getItem('admin-sidebar-collapsed');
    if (savedSidebar === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    localStorage.setItem('admin-sidebar-collapsed', (!sidebarCollapsed).toString());
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accès refusé</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Cette page est réservée aux administrateurs.</p>
        <Button onClick={() => window.location.href = '/'}>
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'sellers', label: 'Vendeurs', icon: Users },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'debug', label: 'Debug QR', icon: Bug },
    { id: 'logs', label: 'Logs', icon: Activity },
    { id: 'banners', label: 'Bannières', icon: Megaphone },
    { id: 'campaigns', label: 'Campagnes', icon: Package },
    { id: 'plans', label: 'Forfaits', icon: FileText },
    { id: 'requests', label: 'Demandes', icon: CreditCard },
    { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
    { id: 'settings', label: 'Paramètres', icon: Shield }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}>
        {/* Logo & Badge */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
            <Logo size="sm" variant={darkMode ? 'dark' : 'light'} />
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1 mt-2">
              <Shield className="w-3 h-3 text-red-600 dark:text-red-400" />
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">SUPERADMIN</span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#2563eb] text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User & Theme */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            title={sidebarCollapsed ? (darkMode ? 'Mode clair' : 'Mode sombre') : ''}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!sidebarCollapsed && <span className="text-sm">{darkMode ? 'Mode clair' : 'Mode sombre'}</span>}
          </button>
          {!sidebarCollapsed && (
            <div className="text-xs text-gray-500 dark:text-gray-400 px-3 truncate">
              {user?.email}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
            title={sidebarCollapsed ? 'Déconnexion' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === 'overview' && <StatsOverview />}
          {activeTab === 'sellers' && <SellerManagement />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'debug' && (
            <iframe 
              src="/DebugProducts" 
              className="w-full h-[calc(100vh-100px)] border-0 rounded-lg bg-white dark:bg-gray-800"
              title="Debug QR Codes"
            />
          )}
          {activeTab === 'logs' && <ActivityLogs />}
          {activeTab === 'banners' && (
            <iframe 
              src="/AdminBanners" 
              className="w-full h-[calc(100vh-100px)] border-0 rounded-lg bg-white dark:bg-gray-800"
              title="Gestion des bannières"
            />
          )}
          {activeTab === 'campaigns' && (
            <iframe 
              src="/AdminCampaigns" 
              className="w-full h-[calc(100vh-100px)] border-0 rounded-lg bg-white dark:bg-gray-800"
              title="Gestion des campagnes"
            />
          )}
          {activeTab === 'plans' && <PlanManagement />}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des demandes</h2>
                  <p className="text-gray-500 dark:text-gray-400">Approuvez ou rejetez les demandes d'inscription</p>
                </div>
                <ManualClientCreation />
              </div>
              <SubscriptionRequestManagement />
            </div>
          )}
          {activeTab === 'subscriptions' && <SubscriptionManagement />}
          {activeTab === 'settings' && <SiteSettings />}
        </div>
      </main>
    </div>
  );
}