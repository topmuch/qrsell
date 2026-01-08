import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Shield, Users, Package, Activity, LogOut, Loader2, Megaphone, CreditCard, FileText, BarChart3, Bug, ShoppingCart, TrendingUp, DollarSign, Eye, Settings } from 'lucide-react';
import StatsOverview from '@/components/admin/StatsOverview';
import SellerManagement from '@/components/admin/SellerManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import ActivityLogs from '@/components/admin/ActivityLogs';
import PlanManagement from '@/components/admin/PlanManagement';
import SubscriptionRequestManagement from '@/components/admin/SubscriptionRequestManagement';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';
import ManualClientCreation from '@/components/admin/ManualClientCreation';
import SiteSettings from '@/components/admin/SiteSettings';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';


export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
  }, []);

  // Fetch stats
  const { data: sellers = [] } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => base44.entities.Seller.list(),
    enabled: isAdmin
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
    enabled: isAdmin
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => base44.entities.Analytics.list(),
    enabled: isAdmin
  });

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#4CAF50' }}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Shield className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
        <p className="text-gray-500 mb-6">Cette page est réservée aux administrateurs.</p>
        <Button onClick={() => window.location.href = '/'}>
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'sellers', label: 'Vendeurs', icon: Users },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'logs', label: 'Journaux', icon: Activity },
    { id: 'debug', label: '🐛 Debug Boutiques', icon: Bug },
    { id: 'banners', label: 'Bannières', icon: Megaphone },
    { id: 'campaigns', label: 'Campagnes', icon: Package },
    { id: 'plans', label: 'Forfaits', icon: FileText },
    { id: 'requests', label: 'Demandes', icon: CreditCard },
    { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  // Calculate stats
  const totalUsers = sellers.length;
  const totalRevenue = sellers.filter(s => s.is_subscribed).length * 5000;
  const todayOrders = analytics.filter(a => {
    const today = new Date().toDateString();
    return new Date(a.created_date).toDateString() === today;
  }).length;
  const todayEarnings = todayOrders * 150;
  const totalEarnings = analytics.length * 150;
  const productsSold = analytics.filter(a => a.event_type === 'whatsapp_click').length;

  const stats = [
    {
      title: 'COMMANDES DU JOUR',
      value: todayOrders,
      subtitle: 'Par rapport à la semaine dernière',
      change: '+51,483',
      color: 'from-cyan-400 to-cyan-500',
      icon: ShoppingCart
    },
    {
      title: 'REVENUS DU JOUR',
      value: `${(todayEarnings / 1000).toFixed(1)}K`,
      subtitle: 'Par rapport à la semaine dernière',
      change: '-35.36%',
      color: 'from-orange-400 to-orange-500',
      icon: DollarSign
    },
    {
      title: 'REVENUS TOTAUX',
      value: `${(totalEarnings / 1000).toFixed(1)}K`,
      subtitle: 'Par rapport à la semaine dernière',
      change: '+54.98%',
      color: 'from-purple-500 to-purple-600',
      icon: TrendingUp
    },
    {
      title: 'PRODUITS VENDUS',
      value: productsSold,
      subtitle: 'Par rapport à la semaine dernière',
      change: '-75.93%',
      color: 'from-pink-500 to-pink-600',
      icon: Package
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col" style={{ backgroundColor: '#4CAF50' }}>
        {/* Logo & Profile */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <Shield className="w-6 h-6" style={{ color: '#4CAF50' }} />
            </div>
            <span className="text-white font-bold text-xl">ShopQR Admin</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">
                {user?.full_name || 'Admin'}
              </div>
              <div className="text-white/70 text-xs">Super Admin</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'overview' ? (
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Bonjour, Bienvenue !</h1>
                  <p className="text-gray-500">Analyses des ventes et mises à jour récentes</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span>⭐⭐⭐⭐⭐</span>
                      <span className="font-semibold">(42,459)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('fr-FR').format(totalRevenue / 1000)}K
                    </div>
                    <div className="text-sm text-gray-500">Revenus totaux</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('fr-FR').format(totalUsers * 354)}
                    </div>
                    <div className="text-sm text-gray-500">Utilisateurs totaux</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
                          {stat.title}
                        </div>
                        <Icon className="w-6 h-6 opacity-80" />
                      </div>
                      <div className="text-3xl font-black mb-2">{stat.value}</div>
                      <div className="text-xs opacity-80 mb-1">{stat.subtitle}</div>
                      <div className="text-sm font-semibold">{stat.change}</div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10">
                      <svg width="150" height="80" viewBox="0 0 150 80" fill="none">
                        <path d="M0 40 L30 35 L60 45 L90 30 L120 40 L150 20" stroke="white" strokeWidth="3" fill="none" />
                      </svg>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts & Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Order Status Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">STATUT DES COMMANDES</h3>
                    <p className="text-sm text-gray-500">Revenus des commandes et suivi de votre boutique jusqu'à la livraison</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-xl font-bold text-gray-900">30,900.00</div>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Réussi</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">18,300.00</div>
                      <div className="text-xs text-blue-600 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>En attente</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">10,240.00</div>
                      <div className="text-xs text-red-600 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>Échoué</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between h-48 gap-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                    const heights = [60, 80, 70, 85, 75, 90, 65, 95, 70, 80, 75, 85];
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex flex-col gap-1 w-full">
                          <div className="bg-green-500 rounded-t" style={{ height: `${heights[idx]}%` }} />
                          <div className="bg-blue-500" style={{ height: `${heights[idx] * 0.6}%` }} />
                          <div className="bg-red-500 rounded-b" style={{ height: `${heights[idx] * 0.4}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sales Map */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">REVENUS DES VENTES</h3>
                <p className="text-sm text-gray-500 mb-4">Performance des ventes dans toutes les régions</p>
                <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center">
                  <div className="text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Visualisation carte mondiale</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">CLIENTS RÉCENTS</h3>
                <div className="space-y-4">
                  {sellers.slice(0, 5).map((seller, idx) => (
                    <div key={seller.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {seller.shop_name?.charAt(0) || 'S'}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">{seller.shop_name}</div>
                        <div className="text-xs text-gray-500">{seller.email || 'Pas d\'email'}</div>
                      </div>
                      <div className="text-xs text-gray-400">Actif</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">ACTIVITÉ DES VENTES</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Total Produits', count: products.length, color: 'bg-green-500' },
                    { label: 'Total Ventes', count: analytics.filter(a => a.event_type === 'whatsapp_click').length, color: 'bg-blue-500' },
                    { label: 'Revenus Totaux', count: `${(totalRevenue / 1000).toFixed(0)}K`, color: 'bg-purple-500' },
                    { label: 'Visites Clients', count: analytics.filter(a => a.event_type === 'view_shop').length, color: 'bg-pink-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{item.count}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">Il y a {idx + 3} jours</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">COMMANDES RÉCENTES</h3>
                <div className="flex items-center justify-center h-32">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="10" fill="none" />
                      <circle cx="50" cy="50" r="40" stroke="#4CAF50" strokeWidth="10" fill="none"
                        strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black text-green-600">80%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-lg font-bold text-gray-900">4,982.00</div>
                    <div className="text-xs text-gray-500">● Annulées 6 derniers mois</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">$188.02</div>
                    <div className="text-xs text-gray-500">● Livrées 6 derniers mois</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {activeTab === 'sellers' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des vendeurs</h2>
                  <Button
                    onClick={async () => {
                      if (!confirm('Synchroniser tous les vendeurs avec la table Shop ?')) return;
                      try {
                        const response = await base44.functions.invoke('migrateSellerShops');
                        alert(`Succès ! ${response.data.details.shops_created} boutiques créées.`);
                        window.location.reload();
                      } catch (error) {
                        alert(`Erreur: ${error.message}`);
                      }
                    }}
                    className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                  >
                    🔄 Synchroniser les boutiques
                  </Button>
                </div>
                <SellerManagement />
              </div>
            )}
            {activeTab === 'products' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des produits</h2>
                <ProductManagement />
              </div>
            )}
            {activeTab === 'logs' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Journaux d'activité</h2>
                <ActivityLogs />
              </div>
            )}
            {activeTab === 'banners' && (
              <iframe 
                src="/AdminBanners" 
                className="w-full h-[calc(100vh-100px)] border-0 rounded-lg bg-white"
                title="Gestion des bannières"
              />
            )}
            {activeTab === 'campaigns' && (
              <iframe 
                src="/AdminCampaigns" 
                className="w-full h-[calc(100vh-100px)] border-0 rounded-lg bg-white"
                title="Gestion des campagnes"
              />
            )}
            {activeTab === 'plans' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des forfaits</h2>
                <PlanManagement />
              </div>
            )}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des demandes</h2>
                    <p className="text-gray-500">Approuvez ou rejetez les demandes d'inscription</p>
                  </div>
                  <ManualClientCreation />
                </div>
                <SubscriptionRequestManagement />
              </div>
            )}
            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des abonnements</h2>
                <SubscriptionManagement />
              </div>
            )}
            {activeTab === 'settings' && <SiteSettings />}
            {activeTab === 'debug' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🐛 Debug des Boutiques Publiques</h2>
                <DebugShopTester />
              </div>
            )}
            </div>
            )}
            </main>
    </div>
  );
}

function DebugShopTester() {
  const [testSlug, setTestSlug] = React.useState('');
  const [testResults, setTestResults] = React.useState(null);
  const [testing, setTesting] = React.useState(false);

  const { data: shops = [] } = useQuery({
    queryKey: ['all-shops-debug'],
    queryFn: () => base44.entities.Shop.list('-created_date', 100)
  });

  const runTest = async () => {
    setTesting(true);
    setTestResults({ logs: [] });

    try {
      const logs = [];
      logs.push({ type: 'info', message: `🔍 Test de la boutique: ${testSlug}` });

      // Test 1: Fetch shop
      logs.push({ type: 'info', message: '📦 Test 1: Chargement de la boutique...' });
      const shopResult = await base44.entities.Shop.filter({ shop_slug: testSlug, is_active: true });
      if (shopResult.length === 0) {
        logs.push({ type: 'error', message: '❌ Boutique introuvable ou inactive' });
        setTestResults({ logs, success: false });
        setTesting(false);
        return;
      }
      logs.push({ type: 'success', message: `✅ Boutique trouvée: ${shopResult[0].shop_name}` });
      const shop = shopResult[0];

      // Test 2: Fetch products
      logs.push({ type: 'info', message: '📦 Test 2: Chargement des produits...' });
      const productResult = await base44.entities.Product.filter({ shop_slug: testSlug, is_active: true });
      logs.push({ type: 'success', message: `✅ ${productResult.length} produit(s) trouvé(s)` });

      // Test 3: Try analytics
      logs.push({ type: 'info', message: '📦 Test 3: Test Analytics (création)...' });
      try {
        await base44.entities.Analytics.create({
          seller_id: shop.seller_id,
          event_type: 'view_shop',
          user_agent: 'DEBUG_TEST'
        });
        logs.push({ type: 'success', message: '✅ Analytics fonctionne' });
      } catch (error) {
        logs.push({ type: 'warning', message: `⚠️ Analytics échoue: ${error.message}` });
      }

      // Test 4: Build public URL
      const publicUrl = `${window.location.origin}/@${testSlug}`;
      logs.push({ type: 'info', message: `🌐 URL publique: ${publicUrl}` });

      // Test 5: Try to fetch the page
      logs.push({ type: 'info', message: '📦 Test 4: Test de chargement de la page...' });
      try {
        const response = await fetch(publicUrl);
        if (response.ok) {
          logs.push({ type: 'success', message: `✅ Page accessible (status: ${response.status})` });
        } else {
          logs.push({ type: 'error', message: `❌ Page retourne erreur ${response.status}` });
        }
      } catch (error) {
        logs.push({ type: 'error', message: `❌ Impossible de charger la page: ${error.message}` });
      }

      setTestResults({ logs, success: true, shop, products: productResult, publicUrl });
    } catch (error) {
      setTestResults({ 
        logs: [...(testResults?.logs || []), { type: 'error', message: `❌ Erreur globale: ${error.message}` }], 
        success: false 
      });
    }

    setTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Quick shop selector */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">Boutiques actives</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {shops.filter(s => s.is_active).map(shop => (
            <button
              key={shop.id}
              onClick={() => setTestSlug(shop.shop_slug)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                testSlug === shop.shop_slug 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="font-semibold text-sm truncate">{shop.shop_name}</div>
              <div className="text-xs text-gray-500">@{shop.shop_slug}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Test controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">Tester une boutique</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={testSlug}
            onChange={(e) => setTestSlug(e.target.value)}
            placeholder="Entrez le shop_slug..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <Button
            onClick={runTest}
            disabled={!testSlug || testing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔍 Tester'}
          </Button>
        </div>
      </div>

      {/* Test results */}
      {testResults && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Résultats du test</h3>
          <div className="space-y-2">
            {testResults.logs.map((log, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg font-mono text-sm ${
                  log.type === 'error' ? 'bg-red-50 text-red-900' :
                  log.type === 'success' ? 'bg-green-50 text-green-900' :
                  log.type === 'warning' ? 'bg-yellow-50 text-yellow-900' :
                  'bg-blue-50 text-blue-900'
                }`}
              >
                {log.message}
              </div>
            ))}
          </div>

          {testResults.publicUrl && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold mb-2">URL de test:</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testResults.publicUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border rounded"
                />
                <Button
                  onClick={() => window.open(testResults.publicUrl, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ouvrir
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(testResults.publicUrl);
                    alert('URL copiée!');
                  }}
                  variant="outline"
                >
                  Copier
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}