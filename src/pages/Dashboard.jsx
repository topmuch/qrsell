import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from 'moment';
import { 
  Plus, 
  Package, 
  BookOpen, 
  Settings, 
  Store, 
  Copy, 
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
  Zap,
  Ticket,
  LogOut,
  TrendingUp,
  Eye,
  MessageCircle,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import SellerProfileForm from '@/components/dashboard/SellerProfileForm';
import ProductForm from '@/components/dashboard/ProductForm';
import ProductCard from '@/components/dashboard/ProductCard';
import TikTokGuide from '@/components/dashboard/TikTokGuide';
import SettingsTabs from '@/components/dashboard/SettingsTabs';
import ProductImportExport from '@/components/dashboard/ProductImportExport';
import KPICards from '@/components/dashboard/KPICards';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ActionCards from '@/components/dashboard/ActionCards';
import SellerStatus from '@/components/dashboard/SellerStatus';
import BannerDisplay from '@/components/dashboard/BannerDisplay';
import Banner from '@/components/Banner';
import HotDemandAlert from '@/components/dashboard/HotDemandAlert';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';
import PromotionForm from '@/components/dashboard/PromotionForm';
import PromotionCard from '@/components/dashboard/PromotionCard';
import CouponForm from '@/components/dashboard/CouponForm';
import CouponCard from '@/components/dashboard/CouponCard';
import EnhancedQRCode from '@/components/ui/EnhancedQRCode';
import LiveControl from '@/components/dashboard/LiveControl';
import CatalogGenerator from '@/components/dashboard/CatalogGenerator';
import ShopSelector from '@/components/dashboard/ShopSelector';
import TrendAlerts from '@/components/dashboard/TrendAlerts';
import UpgradeModal from '@/components/dashboard/UpgradeModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentShop, setCurrentShop] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async (retryCount = 0) => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        if (retryCount < 3) {
          setTimeout(() => loadUser(retryCount + 1), 1000);
        } else {
          base44.auth.redirectToLogin('/Dashboard');
        }
      }
    };
    loadUser();
  }, []);

  // Get seller profile FIRST
  const { data: sellers = [], isLoading: loadingSeller, refetch: refetchSeller } = useQuery({
    queryKey: ['seller', user?.email],
    queryFn: () => base44.entities.Seller.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  // Check subscription
  const { data: subscriptions = [], isLoading: loadingSubscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ user_email: user?.email });
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const filtered = subs.filter(sub => {
        const endDate = new Date(sub.end_date);
        return sub.is_active && endDate > now;
      });
      return filtered;
    },
    enabled: !!user?.email,
    retry: false
  });

  const activeSubscription = subscriptions[0];
  const seller = sellers[0];

  // Get plan details
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list()
  });

  const currentPlan = plans.find(p => p.code === activeSubscription?.plan_code);
  const isPro = currentPlan?.code === 'pro';
  const hasTrendAlerts = currentPlan?.has_trend_alerts || false;
  const isMini = currentPlan?.code === 'mini';

  // Get shops for this seller
  const { data: shops = [] } = useQuery({
    queryKey: ['shops', seller?.id],
    queryFn: async () => {
      const allShops = await base44.entities.Shop.filter({ seller_id: seller?.id });
      // If no shops exist, create one from seller data
      if (allShops.length === 0 && seller) {
        const newShop = await base44.entities.Shop.create({
          seller_id: seller.id,
          shop_name: seller.shop_name,
          shop_slug: seller.shop_slug,
          logo_url: seller.logo_url,
          banner_url: seller.banner_url,
          banner_images: seller.banner_images,
          primary_color: seller.primary_color,
          secondary_color: seller.secondary_color,
          category: 'Autre',
          address: seller.address,
          whatsapp_number: seller.whatsapp_number,
          email: seller.email,
          tiktok: seller.tiktok,
          instagram: seller.instagram,
          facebook: seller.facebook,
          whatsapp_business: seller.whatsapp_business,
          payment_methods: seller.payment_methods,
          partner_logos: seller.partner_logos,
          featured_product_id: seller.featured_product_id,
          use_manual_featured: seller.use_manual_featured,
          show_live_public_counter: seller.show_live_public_counter,
          is_active: true
        });
        return [newShop];
      }
      return allShops;
    },
    enabled: !!seller?.id
  });

  // Set current shop
  React.useEffect(() => {
    if (shops.length > 0 && !currentShop) {
      setCurrentShop(shops[0]);
    }
  }, [shops, currentShop]);

  // Get products for current shop
  const { data: products = [], isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['products', currentShop?.id],
    queryFn: () => base44.entities.Product.filter({ shop_slug: currentShop?.shop_slug }),
    enabled: !!currentShop?.shop_slug
  });

  // Get analytics
  const { data: analytics = [] } = useQuery({
    queryKey: ['analytics', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Fetch active campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns-for-seller'],
    queryFn: async () => {
      const all = await base44.entities.Campaign.list();
      return all.filter(c => c.status === 'active');
    }
  });

  // Fetch promotions for current shop
  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions', currentShop?.id],
    queryFn: async () => {
      const allPromotions = await base44.entities.Promotion.filter({ seller_id: seller?.id });
      // Filter by shop_slug if available in promotion data
      return allPromotions;
    },
    enabled: !!seller?.id && !!currentShop
  });

  // Fetch coupons for current shop
  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons', currentShop?.id],
    queryFn: async () => {
      const allCoupons = await base44.entities.Coupon.filter({ seller_id: seller?.id });
      return allCoupons;
    },
    enabled: !!seller?.id && !!currentShop
  });

  const deletePromotionMutation = useMutation({
    mutationFn: (promotionId) => base44.entities.Promotion.delete(promotionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (couponId) => base44.entities.Coupon.delete(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries(['coupons']);
    }
  });

  // Calculate stats
  const totalScans = analytics.filter(a => a.event_type === 'scan').length;
  
  // Get recent activity
  const recentActivity = analytics.length > 0 
    ? (() => {
        const latest = analytics.sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        )[0];
        const product = products.find(p => p.id === latest.product_id);
        const timeAgo = Math.floor((new Date() - new Date(latest.created_date)) / (1000 * 60));
        
        if (latest.event_type === 'whatsapp_click' && product) {
          return `Un client a cliqué sur "${product.name}" il y a ${timeAgo}min`;
        }
        return null;
      })()
    : null;

  const handleExportAnalytics = () => {
    const csvData = products.map(product => {
      const productAnalytics = analytics.filter(a => a.product_id === product.id);
      return {
        Produit: product.name,
        Prix: product.price,
        Scans: productAnalytics.filter(a => a.event_type === 'scan').length,
        Vues: productAnalytics.filter(a => a.event_type === 'view_product').length,
        Clics: productAnalytics.filter(a => a.event_type === 'whatsapp_click').length
      };
    });

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const deleteMutation = useMutation({
    mutationFn: (productId) => base44.entities.Product.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });

  const handleProfileComplete = () => {
    refetchSeller();
  };

  const handleProductSuccess = () => {
    refetchProducts();
    setEditProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (product) => {
    if (confirm(`Supprimer "${product.name}" ?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const shopUrl = currentShop ? `${window.location.origin}/Shop?slug=${currentShop.shop_slug}` : '';

  const copyShopLink = () => {
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  // Wait for seller and subscription data to load
  if (loadingSeller || loadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  // Check access: admin OR (subscription active) OR (seller.is_subscribed)
  const hasAccess = user?.role === 'admin' || activeSubscription || seller?.is_subscribed;
  
  if (!hasAccess) {
    window.location.href = '/SubscriptionExpired';
    return null;
  }

  // Show profile form if seller profile not completed
  if (!loadingSeller && !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/50 to-white py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          <SellerProfileForm user={user} onProfileComplete={handleProfileComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#4CAF50] text-white p-3 rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 md:transform-none overflow-y-auto
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ backgroundColor: '#4CAF50' }}
      >
        {/* Logo & Profile */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <Store className="w-6 h-6" style={{ color: '#4CAF50' }} />
            </div>
            <span className="text-white font-bold text-xl">ShopQR</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {seller?.shop_name?.charAt(0) || user?.full_name?.charAt(0) || 'V'}
              </span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">
                {seller?.shop_name || user?.full_name || 'Vendeur'}
              </div>
              <div className="text-white/70 text-xs truncate max-w-[120px]">
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            <li>
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-5 h-5 mr-3" />
                Tableau de bord
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('products');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'products'
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Package className="w-5 h-5 mr-3" />
                Produits
              </button>
            </li>
            {!isMini && (
              <li>
                <button
                  onClick={() => {
                    setActiveTab('promotions');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'promotions'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Zap className="w-5 h-5 mr-3" />
                  Promotions
                </button>
              </li>
            )}
            {!isMini && (
              <li>
                <button
                  onClick={() => {
                    setActiveTab('live');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'live'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-3">🔴</span>
                  Mode Live
                </button>
              </li>
            )}
            {!isMini && (
              <li>
                <button
                  onClick={() => window.location.href = '/PerformanceReports'}
                  className="w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors text-white/80 hover:text-white hover:bg-white/10"
                >
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Preuve de performance
                </button>
              </li>
            )}
            {!isMini && (
              <li>
                <button
                  onClick={() => {
                    setActiveTab('campaigns');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'campaigns'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  Campagnes
                </button>
              </li>
            )}
            <li>
              <button
                onClick={() => {
                  setActiveTab('guide');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'guide'
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-5 h-5 mr-3" />
                Guide TikTok
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Paramètres
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors text-white/80 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Déconnexion
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto pt-20 md:pt-8">
        {/* Shop Selector - Always show to demonstrate multi-shop feature */}
        {seller && shops.length > 0 && currentShop && (
          <ShopSelector 
            seller={seller}
            currentShop={currentShop}
            onShopChange={setCurrentShop}
            currentPlan={currentPlan}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        )}

        {/* Banners */}
        <BannerDisplay position="dashboard" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour, {seller?.shop_name || 'Vendeur'} !
              </h1>
              <p className="text-gray-500">Analyses des ventes et mises à jour récentes</p>
            </div>
            <div className="flex items-center gap-6">
              {seller?.is_verified && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="font-semibold">Vérifié</span>
                  </div>
                </div>
              )}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{totalScans}</div>
                <div className="text-sm text-gray-500">Total Scans</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                <div className="text-sm text-gray-500">Produits</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">

          {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Trend Alerts - Always show with upgrade prompt for non-Pro */}
            {currentShop && (
              hasTrendAlerts ? (
                <TrendAlerts seller={seller} currentShop={currentShop} />
              ) : (
                <div 
                  onClick={() => setShowUpgradeModal(true)}
                  className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-2xl cursor-pointer hover:shadow-3xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6" />
                        🔥 Alertes de tendances (Pro)
                      </h2>
                      <p className="text-white/90 mb-3">
                        Découvrez les produits en forte demande dans votre ville et optimisez votre catalogue pour doubler vos ventes.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Check className="w-4 h-4" />
                        <span>Tendances localisées par ville et catégorie</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Check className="w-4 h-4" />
                        <span>Suggestions de produits basées sur 68% des vendeurs</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Check className="w-4 h-4" />
                        <span>Comparaisons de performance avec la moyenne</span>
                      </div>
                    </div>
                    <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold">
                      Débloquer maintenant
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
                      SCANS TOTAUX
                    </div>
                    <Eye className="w-6 h-6 opacity-80" />
                  </div>
                  <div className="text-3xl font-black mb-2">
                    {analytics.filter(a => a.event_type === 'scan').length}
                  </div>
                  <div className="text-xs opacity-80 mb-1">Cette semaine</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
                      VUES PRODUITS
                    </div>
                    <Package className="w-6 h-6 opacity-80" />
                  </div>
                  <div className="text-3xl font-black mb-2">
                    {analytics.filter(a => a.event_type === 'view_product').length}
                  </div>
                  <div className="text-xs opacity-80 mb-1">Cette semaine</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
                      CLICS WHATSAPP
                    </div>
                    <MessageCircle className="w-6 h-6 opacity-80" />
                  </div>
                  <div className="text-3xl font-black mb-2">
                    {analytics.filter(a => a.event_type === 'whatsapp_click').length}
                  </div>
                  <div className="text-xs opacity-80 mb-1">Cette semaine</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
                      TAUX CONVERSION
                    </div>
                    <TrendingUp className="w-6 h-6 opacity-80" />
                  </div>
                  <div className="text-3xl font-black mb-2">
                    {analytics.filter(a => a.event_type === 'scan').length > 0 
                      ? ((analytics.filter(a => a.event_type === 'whatsapp_click').length / analytics.filter(a => a.event_type === 'scan').length) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <div className="text-xs opacity-80 mb-1">Cette semaine</div>
                </div>
              </motion.div>
            </div>

            {/* Hot Demand Alert */}
            <HotDemandAlert sellerId={seller?.id} products={products} />

            {/* Shop QR Code Card */}
            {currentShop && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 shadow-lg border"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      QR Code de {currentShop.shop_name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Scannez ce code pour accéder directement à votre vitrine en ligne. Partagez-le sur vos réseaux sociaux, flyers ou vidéos TikTok.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={copyShopLink}
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copier le lien
                      </Button>
                      <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Voir la boutique
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <EnhancedQRCode
                      url={shopUrl}
                      size={300}
                      color={currentShop.primary_color || '#4CAF50'}
                      logo={currentShop.logo_url}
                      showText={true}
                      text="Scanner pour voir la boutique"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Two columns layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Chart + Actions */}
              <div className="lg:col-span-2 space-y-8">
                <PerformanceChart products={products} analytics={analytics} />
                <ActionCards 
                  recentActivity={recentActivity}
                  analytics={analytics}
                  onExport={handleExportAnalytics}
                />
              </div>

              {/* Right: Seller Status + Subscription */}
              <div className="space-y-6">
                <SellerStatus 
                  seller={seller}
                  productsCount={products.length}
                  totalScans={totalScans}
                />
                <SubscriptionStatus user={user} />
              </div>
            </div>
          </div>
          )}

          {activeTab === 'products' && (
          <div className="space-y-6">

            {/* Import/Export & Catalog */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <ProductImportExport 
                seller={seller}
                products={products}
                onImportComplete={refetchProducts}
              />
              <CatalogGenerator 
                seller={seller}
                products={products.filter(p => p.is_active)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mes produits</h2>
                <p className="text-gray-500">{products.length} produit{products.length > 1 ? 's' : ''}</p>
              </div>
              <Button 
                onClick={() => {
                  setEditProduct(null);
                  setShowProductForm(true);
                }}
                className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] hover:opacity-90 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>

            {loadingProducts ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"
              >
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit</h3>
                <p className="text-gray-500 mb-6">Commencez par ajouter votre premier produit</p>
                <Button 
                  onClick={() => setShowProductForm(true)}
                  className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] hover:opacity-90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence>
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      seller={seller}
                      analytics={analytics}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
          )}

          {activeTab === 'live' && (
          <div className="space-y-6">
            <LiveControl seller={seller} currentShop={currentShop} products={products} />
          </div>
          )}

          {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Promotions Flash */}
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Zap className="w-6 h-6 text-orange-500" />
                      Promotions Flash
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Offres limitées à 30 minutes après scan
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowPromotionForm(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer
                  </Button>
                </div>

                {promotions.length === 0 ? (
                  <div className="text-center py-12 bg-orange-50 rounded-lg border-2 border-dashed border-orange-200">
                    <Zap className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                    <p className="text-gray-600">Aucune promotion flash</p>
                    <Button 
                      onClick={() => setShowPromotionForm(true)}
                      className="mt-4 bg-orange-500 hover:bg-orange-600"
                      size="sm"
                    >
                      Créer ma première promo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {promotions.map(promo => (
                      <PromotionCard 
                        key={promo.id}
                        promotion={promo}
                        onDelete={(p) => {
                          if (confirm('Supprimer cette promotion ?')) {
                            deletePromotionMutation.mutate(p.id);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Coupons */}
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Ticket className="w-6 h-6 text-purple-500" />
                      Coupons
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Valables 7 jours, utilisables une fois
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowCouponForm(true)}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer
                  </Button>
                </div>

                {coupons.length === 0 ? (
                  <div className="text-center py-12 bg-purple-50 rounded-lg border-2 border-dashed border-purple-200">
                    <Ticket className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <p className="text-gray-600">Aucun coupon</p>
                    <Button 
                      onClick={() => setShowCouponForm(true)}
                      className="mt-4 bg-purple-500 hover:bg-purple-600"
                      size="sm"
                    >
                      Créer mon premier coupon
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coupons.map(coupon => (
                      <CouponCard 
                        key={coupon.id}
                        coupon={coupon}
                        onDelete={(c) => {
                          if (confirm('Supprimer ce coupon ?')) {
                            deleteCouponMutation.mutate(c.id);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                <Sparkles className="w-6 h-6 text-green-500" />
                🔥 Campagnes sponsorisées
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Participez à des campagnes et gagnez jusqu'à 5 € par intégration.
              </p>

              {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {campaigns.map(camp => {
                    const participationCount = queryClient.getQueryData(['all-participations'])?.filter(p => 
                      p.campaign_id === camp.id && p.status !== 'rejected'
                    ).length || 0;
                    const conversionRate = camp.total_scans > 0 
                      ? ((camp.total_conversions || 0) / camp.total_scans * 100).toFixed(1) 
                      : 0;

                    return (
                      <div key={camp.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {camp.product_image && (
                          <img 
                            src={camp.product_image} 
                            alt={camp.product_name} 
                            className="w-full h-32 object-cover rounded mb-3" 
                          />
                        )}
                        <h3 className="font-bold text-lg mb-1 dark:text-white">{camp.product_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{camp.partner_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-3 line-clamp-2">{camp.product_description}</p>

                        {/* Campaign Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                          <div className="text-center">
                            <div className="font-bold text-blue-600 dark:text-blue-400">{participationCount}</div>
                            <div className="text-gray-500 dark:text-gray-400">Participants</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600 dark:text-green-400">{camp.budget_total}€</div>
                            <div className="text-gray-500 dark:text-gray-400">Budget</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-purple-600 dark:text-purple-400">{conversionRate}%</div>
                            <div className="text-gray-500 dark:text-gray-400">Conv.</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-green-600 dark:text-green-400 font-bold">
                            {camp.commission_value} {camp.commission_type === 'percentage' ? '%' : '€'}
                          </span>
                          <Button 
                            onClick={() => window.location.href = '/SellerCampaigns'}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Participer
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Aucune campagne disponible pour l'instant.</p>
                </div>
              )}
            </div>
          </div>
          )}

          {activeTab === 'guide' && (
          <div>
            <TikTokGuide shopUrl={shopUrl} />
          </div>
          )}

          {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres de la boutique</h2>
                <p className="text-gray-500">Personnalisez votre vitrine en ligne</p>

                {/* Shop URL */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">URL de votre boutique</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-white rounded-lg text-sm truncate shadow-sm">
                      {shopUrl}
                    </code>
                    <Button variant="outline" onClick={copyShopLink} className="shadow-sm">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="shadow-sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              <SettingsTabs seller={seller} />
            </div>
          </div>
          )}
        </div>
        </div>
      </main>

      {/* Product form modal */}
      {showProductForm && seller && currentShop && (
        <ProductForm 
          open={showProductForm}
          onClose={() => {
            setShowProductForm(false);
            setEditProduct(null);
          }}
          seller={seller}
          currentShop={currentShop}
          editProduct={editProduct}
          onSuccess={handleProductSuccess}
        />
      )}

      {/* Promotion form modal */}
      {showPromotionForm && seller && (
        <PromotionForm 
          open={showPromotionForm}
          onClose={() => setShowPromotionForm(false)}
          seller={seller}
          products={products}
        />
      )}

      {/* Coupon form modal */}
      {showCouponForm && seller && (
        <CouponForm 
          open={showCouponForm}
          onClose={() => setShowCouponForm(false)}
          seller={seller}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal 
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      </div>
      );
      }