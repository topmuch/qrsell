import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Eye, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Loader2,
  Store
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import ManualClientCreation from '@/components/admin/ManualClientCreation';

export default function SellerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [editingSeller, setEditingSeller] = useState(null);
  const queryClient = useQueryClient();

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => base44.entities.Seller.list('-created_date')
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => base44.entities.Analytics.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Seller.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-sellers']);
      setEditingSeller(null);
    }
  });

  const filteredSellers = sellers.filter(seller =>
    seller.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.shop_slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSellerStats = (sellerId) => {
    const sellerProducts = products.filter(p => p.seller_id === sellerId);
    const sellerAnalytics = analytics.filter(a => a.seller_id === sellerId);
    return {
      products: sellerProducts.length,
      scans: sellerAnalytics.filter(a => a.event_type === 'scan').length,
      clicks: sellerAnalytics.filter(a => a.event_type === 'whatsapp_click').length
    };
  };

  const handleToggleVerification = (seller) => {
    updateMutation.mutate({
      id: seller.id,
      data: { is_verified: !seller.is_verified }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des vendeurs</h2>
          <p className="text-gray-500 dark:text-gray-400">Liste et gestion des comptes vendeurs</p>
        </div>
        <ManualClientCreation />
      </div>

      {/* Search bar */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="px-4 py-2">
              {filteredSellers.length} vendeur{filteredSellers.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sellers table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Liste des vendeurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Boutique</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Vendeur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Slug</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Produits</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Scans</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Statut</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.map((seller, index) => {
                  const stats = getSellerStats(seller.id);
                  return (
                    <motion.tr
                      key={seller.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{seller.shop_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">{seller.full_name}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{seller.whatsapp_number}</div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300">
                          {seller.shop_slug}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">{stats.products}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">{stats.scans}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {seller.is_verified ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Vérifié
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Non vérifié
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedSeller({ ...seller, stats })}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/Shop?slug=${seller.shop_slug}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleVerification(seller)}
                          >
                            {seller.is_verified ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Seller details dialog */}
      {selectedSeller && (
        <Dialog open={!!selectedSeller} onOpenChange={() => setSelectedSeller(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                {selectedSeller.shop_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nom complet</label>
                  <p className="text-gray-900">{selectedSeller.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                  <p className="text-gray-900">{selectedSeller.whatsapp_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Slug</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedSeller.shop_slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date de création</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(selectedSeller.created_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedSeller.stats.products}</div>
                      <div className="text-sm text-gray-500">Produits</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedSeller.stats.scans}</div>
                      <div className="text-sm text-gray-500">Scans</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedSeller.stats.clicks}</div>
                      <div className="text-sm text-gray-500">Clics</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}