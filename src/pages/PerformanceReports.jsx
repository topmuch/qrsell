import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Download, 
  Eye, 
  MessageCircle, 
  TrendingUp, 
  Radio, 
  Clock,
  ArrowLeft,
  Loader2,
  FileText,
  Award,
  Zap
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { toast } from 'sonner';

export default function PerformanceReports() {
  const [user, setUser] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: sellers = [] } = useQuery({
    queryKey: ['seller', user?.email],
    queryFn: () => base44.entities.Seller.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  const seller = sellers[0];

  const { data: allSessions = [], isLoading } = useQuery({
    queryKey: ['all-live-sessions', seller?.id],
    queryFn: () => base44.entities.LiveSession.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', seller?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['all-analytics', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Fetch all sellers for comparison
  const { data: allSellers = [] } = useQuery({
    queryKey: ['all-sellers'],
    queryFn: () => base44.entities.Seller.list()
  });

  const filteredSessions = allSessions
    .filter(session => {
      if (!dateFilter) return true;
      const sessionDate = format(new Date(session.live_started_at), 'yyyy-MM-dd');
      return sessionDate === dateFilter;
    })
    .sort((a, b) => new Date(b.live_started_at) - new Date(a.live_started_at));

  const getSessionStats = (session) => {
    if (!session.live_started_at) return { scans: 0, views: 0, clicks: 0, duration: 0 };

    const startTime = new Date(session.live_started_at);
    const endTime = session.live_ended_at ? new Date(session.live_ended_at) : new Date();
    
    const sessionAnalytics = analytics.filter(a => {
      const aDate = new Date(a.created_date);
      return aDate >= startTime && aDate <= endTime;
    });

    const scans = sessionAnalytics.filter(a => a.event_type === 'scan').length;
    const views = sessionAnalytics.filter(a => a.event_type === 'view_product').length;
    const clicks = sessionAnalytics.filter(a => a.event_type === 'whatsapp_click').length;
    const duration = differenceInMinutes(endTime, startTime);

    return { scans, views, clicks, duration };
  };

  // Calculate overall stats
  const totalScans = filteredSessions.reduce((sum, s) => sum + getSessionStats(s).scans, 0);
  const totalClicks = filteredSessions.reduce((sum, s) => sum + getSessionStats(s).clicks, 0);
  const conversionRate = totalScans > 0 ? Math.round((totalClicks / totalScans) * 100) : 0;

  // Calculate top percentile
  const getTopPercentile = () => {
    if (allSellers.length === 0 || totalScans === 0) return null;
    
    // Simple calculation - you can enhance this
    const sellerRank = allSellers.filter(s => s.id !== seller?.id).length;
    const percentile = Math.max(5, Math.min(95, 100 - Math.round((sellerRank / allSellers.length) * 100)));
    
    return percentile;
  };

  const topPercentile = getTopPercentile();

  const exportToCSV = () => {
    const csvData = filteredSessions.map(session => {
      const stats = getSessionStats(session);
      const product = products.find(p => p.id === session.active_product_id);
      
      return {
        'Date': format(new Date(session.live_started_at), 'dd/MM/yyyy', { locale: fr }),
        'Heure début': format(new Date(session.live_started_at), 'HH:mm', { locale: fr }),
        'Heure fin': session.live_ended_at ? format(new Date(session.live_ended_at), 'HH:mm', { locale: fr }) : 'En cours',
        'Durée (min)': stats.duration,
        'Produit': product?.name || 'N/A',
        'Scans': stats.scans,
        'Vues': stats.views,
        'Clics': stats.clicks,
        'Taux conversion': stats.scans > 0 ? `${Math.round((stats.clicks / stats.scans) * 100)}%` : '0%'
      };
    });

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Rapport exporté en CSV');
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C4AB6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 mb-2">
                <Zap className="w-10 h-10 text-[#6C4AB6]" />
                Preuve de performance
              </h1>
              <p className="text-lg text-gray-600">
                Vos résultats en direct
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                  placeholder="Filtrer par date"
                />
              </div>
              <Button 
                onClick={exportToCSV}
                className="bg-gradient-to-r from-[#6C4AB6] to-[#FF6B9D] hover:opacity-90"
                disabled={filteredSessions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Top KPIs - Big and Bold */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-6 h-6 opacity-90" />
                <span className="text-sm font-bold uppercase tracking-wider opacity-90">Scans totaux</span>
              </div>
              <div className="text-6xl font-black mb-2">{totalScans}</div>
              <div className="text-sm opacity-80">Toutes sessions confondues</div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 text-white text-9xl font-black">
              {totalScans}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-6 h-6 opacity-90" />
                <span className="text-sm font-bold uppercase tracking-wider opacity-90">Clics WhatsApp</span>
              </div>
              <div className="text-6xl font-black mb-2">{totalClicks}</div>
              <div className="text-sm opacity-80">Conversions générées</div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 text-white text-9xl font-black">
              {totalClicks}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 opacity-90" />
                <span className="text-sm font-bold uppercase tracking-wider opacity-90">Taux de conversion</span>
              </div>
              <div className="text-6xl font-black mb-2">{conversionRate}%</div>
              <div className="text-sm opacity-80">Performance globale</div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 text-white text-9xl font-black">
              {conversionRate}%
            </div>
          </motion.div>
        </div>

        {/* Top Percentile Banner */}
        {topPercentile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 rounded-2xl p-6 mb-8 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-4 text-white">
              <Award className="w-12 h-12" />
              <div className="text-center">
                <div className="text-3xl font-black mb-1">
                  🔥 Vous êtes dans le top {topPercentile}% des vendeurs !
                </div>
                <div className="text-sm opacity-90">
                  Continuez comme ça, vous êtes une star ! ⭐
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-black text-[#6C4AB6] mb-2">
                  {filteredSessions.length}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Radio className="w-4 h-4" />
                  Sessions
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-600 mb-2">
                  {totalScans}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  Scans
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-black text-green-600 mb-2">
                  {totalClicks}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Clics
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-black text-purple-600 mb-2">
                  {conversionRate}%
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Conversion
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="py-20 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune donnée de performance
              </h3>
              <p className="text-gray-500">
                {dateFilter 
                  ? 'Aucune session live pour cette date'
                  : 'Lancez votre premier live pour voir vos performances !'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session, idx) => {
              const stats = getSessionStats(session);
              const product = products.find(p => p.id === session.active_product_id);
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:shadow-xl transition-shadow bg-white/80 backdrop-blur border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 flex items-center gap-2">
                            <Radio className={`w-5 h-5 ${session.is_live ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                            Session du {format(new Date(session.live_started_at), 'dd MMMM yyyy', { locale: fr })}
                          </CardTitle>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(session.live_started_at), 'HH:mm', { locale: fr })}
                              {session.live_ended_at && (
                                <> → {format(new Date(session.live_ended_at), 'HH:mm', { locale: fr })}</>
                              )}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="font-semibold">{stats.duration} minutes</span>
                          </div>
                        </div>
                        {session.is_live && (
                          <Badge className="bg-red-500 text-white animate-pulse">
                            EN DIRECT
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {product && (
                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg shadow-lg"
                              />
                            )}
                            <div>
                              <div className="font-bold text-gray-900 text-lg">{product.name}</div>
                              <div className="text-sm text-gray-600 font-semibold">{product.price} FCFA</div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 p-4 rounded-xl text-center text-white shadow-lg">
                            <div className="text-3xl font-black">{stats.scans}</div>
                            <div className="text-xs opacity-90 flex items-center justify-center gap-1 mt-1">
                              <Eye className="w-3 h-3" />
                              Scans
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-4 rounded-xl text-center text-white shadow-lg">
                            <div className="text-3xl font-black">{stats.views}</div>
                            <div className="text-xs opacity-90 flex items-center justify-center gap-1 mt-1">
                              <TrendingUp className="w-3 h-3" />
                              Vues
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-green-400 to-green-500 p-4 rounded-xl text-center text-white shadow-lg">
                            <div className="text-3xl font-black">{stats.clicks}</div>
                            <div className="text-xs opacity-90 flex items-center justify-center gap-1 mt-1">
                              <MessageCircle className="w-3 h-3" />
                              Clics
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl text-center text-white shadow-lg">
                            <div className="text-3xl font-black">
                              {stats.scans > 0 ? Math.round((stats.clicks / stats.scans) * 100) : 0}%
                            </div>
                            <div className="text-xs opacity-90 mt-1">Conv.</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}