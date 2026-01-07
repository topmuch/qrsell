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
  Filter,
  ArrowLeft,
  Loader2,
  FileText
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { toast } from 'sonner';

export default function LiveReports() {
  const [user, setUser] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Get seller profile
  const { data: sellers = [] } = useQuery({
    queryKey: ['seller', user?.email],
    queryFn: () => base44.entities.Seller.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  const seller = sellers[0];

  // Fetch all live sessions
  const { data: allSessions = [], isLoading } = useQuery({
    queryKey: ['all-live-sessions', seller?.id],
    queryFn: () => base44.entities.LiveSession.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products', seller?.id],
    queryFn: () => base44.entities.Product.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Fetch all analytics
  const { data: analytics = [] } = useQuery({
    queryKey: ['all-analytics', seller?.id],
    queryFn: () => base44.entities.Analytics.filter({ seller_id: seller?.id }),
    enabled: !!seller?.id
  });

  // Filter sessions
  const filteredSessions = allSessions
    .filter(session => {
      if (!dateFilter) return true;
      const sessionDate = format(new Date(session.live_started_at), 'yyyy-MM-dd');
      return sessionDate === dateFilter;
    })
    .sort((a, b) => new Date(b.live_started_at) - new Date(a.live_started_at));

  // Get stats for a session
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

  // Export to CSV
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
    a.download = `rapports-live-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Rapport exporté en CSV');
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#4CAF50]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Radio className="w-8 h-8 text-red-500" />
                Rapports de Live
              </h1>
              <p className="text-gray-500 mt-1">
                Historique complet de vos sessions live
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
                className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] hover:opacity-90"
                disabled={filteredSessions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600 mb-2">
                  {filteredSessions.length}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Radio className="w-4 h-4" />
                  Sessions
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-600 mb-2">
                  {filteredSessions.reduce((sum, s) => sum + getSessionStats(s).scans, 0)}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  Scans totaux
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-black text-green-600 mb-2">
                  {filteredSessions.reduce((sum, s) => sum + getSessionStats(s).clicks, 0)}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Clics WhatsApp
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-black text-purple-600 mb-2">
                  {(() => {
                    const totalScans = filteredSessions.reduce((sum, s) => sum + getSessionStats(s).scans, 0);
                    const totalClicks = filteredSessions.reduce((sum, s) => sum + getSessionStats(s).clicks, 0);
                    return totalScans > 0 ? Math.round((totalClicks / totalScans) * 100) : 0;
                  })()}%
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
          <Card>
            <CardContent className="py-20 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun rapport
              </h3>
              <p className="text-gray-500">
                {dateFilter 
                  ? 'Aucune session live pour cette date'
                  : 'Vous n\'avez pas encore effectué de live'}
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
                  <Card className="hover:shadow-lg transition-shadow">
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
                            <span>{stats.duration} minutes</span>
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
                        {/* Product Info */}
                        {product && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.price} FCFA</div>
                            </div>
                          </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-cyan-50 p-3 rounded-lg text-center border border-cyan-200">
                            <div className="text-2xl font-black text-cyan-600">{stats.scans}</div>
                            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                              <Eye className="w-3 h-3" />
                              Scans
                            </div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-200">
                            <div className="text-2xl font-black text-orange-600">{stats.views}</div>
                            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Vues
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                            <div className="text-2xl font-black text-green-600">{stats.clicks}</div>
                            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              Clics
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-200">
                            <div className="text-2xl font-black text-purple-600">
                              {stats.scans > 0 ? Math.round((stats.clicks / stats.scans) * 100) : 0}%
                            </div>
                            <div className="text-xs text-gray-600">Conv.</div>
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