import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, QrCode, Eye, MessageCircle, Loader2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 10;

export default function ActivityLogs() {
  const [filterType, setFilterType] = useState('all');
  const [filterSeller, setFilterSeller] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => base44.entities.Analytics.list('-created_date', 500)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: sellers = [] } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => base44.entities.Seller.list()
  });

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Produit inconnu';
  };

  const getSellerName = (sellerId) => {
    const seller = sellers.find(s => s.id === sellerId);
    return seller?.shop_name || 'Vendeur inconnu';
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'scan':
        return <QrCode className="w-4 h-4" />;
      case 'view_product':
        return <Eye className="w-4 h-4" />;
      case 'whatsapp_click':
        return <MessageCircle className="w-4 h-4" />;
      case 'view_shop':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventLabel = (eventType) => {
    switch (eventType) {
      case 'scan':
        return '📲 Scan QR';
      case 'view_product':
        return '👁️ Produit vu';
      case 'whatsapp_click':
        return '💬 Clic WhatsApp';
      case 'view_shop':
        return '📌 Visite boutique';
      default:
        return eventType;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'scan':
        return 'bg-purple-100 text-purple-700';
      case 'view_product':
        return 'bg-blue-100 text-blue-700';
      case 'whatsapp_click':
        return 'bg-green-100 text-green-700';
      case 'view_shop':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return `Il y a ${seconds}s`;
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
  };

  // Filter and search logic
  const filteredAnalytics = useMemo(() => {
    let filtered = analytics;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.event_type === filterType);
    }

    // Filter by seller
    if (filterSeller !== 'all') {
      filtered = filtered.filter(a => a.seller_id === filterSeller);
    }

    // Search by shop name or product ID
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => {
        const seller = sellers.find(s => s.id === a.seller_id);
        const shopName = seller?.shop_name?.toLowerCase() || '';
        const productId = a.product_public_id?.toLowerCase() || '';
        return shopName.includes(query) || productId.includes(query);
      });
    }

    return filtered;
  }, [analytics, filterType, filterSeller, searchQuery, sellers]);

  // Pagination
  const totalPages = Math.ceil(filteredAnalytics.length / ITEMS_PER_PAGE);
  const paginatedAnalytics = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAnalytics.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAnalytics, currentPage]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterSeller, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  // Group by event type
  const eventCounts = filteredAnalytics.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  // Get unique sellers for filter
  const uniqueSellers = [...new Set(analytics.map(a => a.seller_id))].map(id => 
    sellers.find(s => s.id === id)
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'événement</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="view_shop">📌 Visite boutique</SelectItem>
                  <SelectItem value="scan">📲 Scan QR</SelectItem>
                  <SelectItem value="whatsapp_click">💬 Clic WhatsApp</SelectItem>
                  <SelectItem value="view_product">👁️ Produit vu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vendeur</label>
              <Select value={filterSeller} onValueChange={setFilterSeller}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les vendeurs</SelectItem>
                  {uniqueSellers.map(seller => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.shop_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Nom de boutique ou ID produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              {filteredAnalytics.length} événement{filteredAnalytics.length > 1 ? 's' : ''} trouvé{filteredAnalytics.length > 1 ? 's' : ''}
            </p>
            {(filterType !== 'all' || filterSeller !== 'all' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType('all');
                  setFilterSeller('all');
                  setSearchQuery('');
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event summary */}
      <div className="grid md:grid-cols-4 gap-4">
        {Object.entries(eventCounts).map(([type, count], index) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${getEventColor(type)} flex items-center justify-center`}>
                    {getEventIcon(type)}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500">{getEventLabel(type)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activité récente</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Page {currentPage} / {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedAnalytics.map((event, index) => (
              <motion.div
                key={`${event.id}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border"
              >
                <div className={`w-10 h-10 rounded-lg ${getEventColor(event.event_type)} flex items-center justify-center flex-shrink-0`}>
                  {getEventIcon(event.event_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getEventColor(event.event_type)}>
                      {getEventLabel(event.event_type)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(event.created_date)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    {event.event_type === 'view_shop' ? (
                      <span className="text-gray-900">
                        Visite de la boutique <span className="font-medium">{getSellerName(event.seller_id)}</span>
                      </span>
                    ) : (
                      <span className="text-gray-900">
                        {event.product_id ? (
                          <>
                            <span className="font-medium">{getProductName(event.product_id)}</span>
                            {' de '}
                            <span className="font-medium">{getSellerName(event.seller_id)}</span>
                          </>
                        ) : (
                          <span className="font-medium">{getSellerName(event.seller_id)}</span>
                        )}
                      </span>
                    )}
                  </div>
                  
                  {event.product_public_id && (
                    <code className="text-xs text-gray-400 block mt-1">
                      {event.product_public_id}
                    </code>
                  )}
                </div>
              </motion.div>
            ))}

            {paginatedAnalytics.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Aucun événement trouvé avec ces filtres</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}