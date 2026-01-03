import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Package, Activity, LogOut, Loader2, Megaphone, CreditCard, FileText } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import StatsOverview from '@/components/admin/StatsOverview';
import SellerManagement from '@/components/admin/SellerManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import ActivityLogs from '@/components/admin/ActivityLogs';
import PlanManagement from '@/components/admin/PlanManagement';
import SubscriptionRequestManagement from '@/components/admin/SubscriptionRequestManagement';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';
import ManualClientCreation from '@/components/admin/ManualClientCreation';
import { motion } from 'framer-motion';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                <Shield className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-600">SUPERADMIN</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden md:inline">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panneau d'administration</h1>
          <p className="text-gray-500">Gestion globale de la plateforme QRSell</p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white rounded-lg">
              <Activity className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="sellers" className="flex items-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white rounded-lg">
              <Users className="w-4 h-4" />
              Vendeurs
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white rounded-lg">
              <Package className="w-4 h-4" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white rounded-lg">
              <Activity className="w-4 h-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white rounded-lg">
              <Megaphone className="w-4 h-4" />
              Bannières
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white rounded-lg">
              <Package className="w-4 h-4" />
              Campagnes
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white rounded-lg">
              <FileText className="w-4 h-4" />
              Forfaits
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white rounded-lg">
              <CreditCard className="w-4 h-4" />
              Demandes
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white rounded-lg">
              <CreditCard className="w-4 h-4" />
              Abonnements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StatsOverview />
          </TabsContent>

          <TabsContent value="sellers">
            <SellerManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="logs">
            <ActivityLogs />
          </TabsContent>

          <TabsContent value="banners">
            <iframe 
              src="/AdminBanners" 
              className="w-full h-[calc(100vh-300px)] border-0 rounded-lg bg-white"
              title="Gestion des bannières"
            />
          </TabsContent>

          <TabsContent value="campaigns">
            <iframe 
              src="/AdminCampaigns" 
              className="w-full h-[calc(100vh-300px)] border-0 rounded-lg bg-white"
              title="Gestion des campagnes"
            />
          </TabsContent>

          <TabsContent value="plans">
            <PlanManagement />
          </TabsContent>

          <TabsContent value="requests">
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
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}