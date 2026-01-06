import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Eye, Trash2, ExternalLink, Loader2, Package, AlertCircle, RefreshCw, Download, Copy, Check, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellerFilter, setSellerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date')
  });

  const { data: sellers = [] } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => base44.entities.Seller.list()
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => base44.entities.Analytics.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) => base44.entities.Product.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
    }
  });

  const fixPublicIdMutation = useMutation({
    mutationFn: async () => {
      const productsWithoutId = products.filter(p => !p.public_id);
      const updates = productsWithoutId.map(product => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const public_id = `PROD-${year}-${random}`;
        return base44.entities.Product.update(product.id, { public_id });
      });
      await Promise.all(updates);
      return productsWithoutId.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries(['admin-products']);
      alert(`${count} produit(s) mis à jour avec succès !`);
    }
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.public_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeller = sellerFilter === 'all' || product.seller_id === sellerFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active);
    
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === '0-50000' && product.price < 50000) ||
      (priceFilter === '50000-100000' && product.price >= 50000 && product.price < 100000) ||
      (priceFilter === '100000-200000' && product.price >= 100000 && product.price < 200000) ||
      (priceFilter === '200000+' && product.price >= 200000);
    
    return matchesSearch && matchesSeller && matchesStatus && matchesPrice;
  });

  const getProductStats = (productId) => {
    const productAnalytics = analytics.filter(a => a.product_id === productId);
    return {
      scans: productAnalytics.filter(a => a.event_type === 'scan').length,
      views: productAnalytics.filter(a => a.event_type === 'view_product').length,
      clicks: productAnalytics.filter(a => a.event_type === 'whatsapp_click').length
    };
  };

  const getSellerName = (sellerId) => {
    const seller = sellers.find(s => s.id === sellerId);
    return seller?.shop_name || 'Inconnu';
  };

  const handleDelete = (product) => {
    if (confirm(`Supprimer "${product.name}" ?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const handleCopyLink = (product) => {
    const productUrl = `${window.location.origin}/ProductPage?id=${product.public_id}`;
    navigator.clipboard.writeText(productUrl);
    setCopiedId(product.id);
    toast.success('Lien copié !');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const csvHeaders = ['Nom', 'Boutique', 'Prix (FCFA)', 'ID Public', 'Statut', 'Scans', 'Vues', 'Clics', 'Catégorie'];
    const csvRows = filteredProducts.map(product => {
      const stats = getProductStats(product.id);
      return [
        product.name,
        getSellerName(product.seller_id),
        product.price,
        product.public_id || 'N/A',
        product.is_active ? 'Actif' : 'Inactif',
        stats.scans,
        stats.views,
        stats.clicks,
        product.category || 'N/A'
      ].map(cell => `"${cell}"`).join(',');
    });

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produits-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Export CSV réussi');
  };

  const uniqueSellers = [...new Set(products.map(p => p.seller_id))].map(sellerId => {
    return sellers.find(s => s.id === sellerId);
  }).filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const productsWithoutPublicId = products.filter(p => !p.public_id);

  return (
    <div className="space-y-6">
      {/* Alert for products without public_id */}
      {productsWithoutPublicId.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-yellow-800">
              <strong>{productsWithoutPublicId.length}</strong> produit(s) sans ID public. Les QR codes ne fonctionneront pas.
            </span>
            <Button
              size="sm"
              onClick={() => fixPublicIdMutation.mutate()}
              disabled={fixPublicIdMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {fixPublicIdMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Correction...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Corriger automatiquement
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Filtres</span>
              </div>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger CSV
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={sellerFilter} onValueChange={setSellerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les vendeurs" />
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">✅ Actif</SelectItem>
                  <SelectItem value="inactive">❌ Inactif</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les prix</SelectItem>
                  <SelectItem value="0-50000">0 – 50 000 FCFA</SelectItem>
                  <SelectItem value="50000-100000">50 000 – 100 000 FCFA</SelectItem>
                  <SelectItem value="100000-200000">100 000 – 200 000 FCFA</SelectItem>
                  <SelectItem value="200000+">200 000+ FCFA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Badge variant="outline" className="px-4 py-2">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
              </Badge>
              {(sellerFilter !== 'all' || statusFilter !== 'all' || priceFilter !== 'all' || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSellerFilter('all');
                    setStatusFilter('all');
                    setPriceFilter('all');
                  }}
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => {
          const stats = getProductStats(product.id);
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {product.is_active ? (
                        <Badge className="bg-green-500 text-white">Actif</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-white/90 text-gray-600">Inactif</Badge>
                      )}
                    </div>
                    {!product.public_id && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white">❌ ID manquant</Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Name */}
                    <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    {/* Shop */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="truncate">{getSellerName(product.seller_id)}</span>
                    </div>

                    {/* Price */}
                    <div className="text-xl font-bold text-[#2563eb]">
                      {formatPrice(product.price)} FCFA
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 py-2 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{stats.scans}</div>
                        <div className="text-xs text-gray-500">Scans</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{stats.clicks}</div>
                        <div className="text-xs text-gray-500">Clics</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 pt-2 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedProduct({ ...product, stats })}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/ProductPage?id=${product.public_id}`, '_blank')}
                        disabled={!product.public_id}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Aucun produit trouvé</p>
              <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product details dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {selectedProduct.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedProduct.image_url && (
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Prix</label>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(selectedProduct.price)} FCFA
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ID Public</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedProduct.public_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Boutique</label>
                  <p className="text-gray-900">{getSellerName(selectedProduct.seller_id)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date de création</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(selectedProduct.created_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedProduct.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedProduct.stats.scans}</div>
                      <div className="text-sm text-gray-500">Scans</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedProduct.stats.views}</div>
                      <div className="text-sm text-gray-500">Vues</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedProduct.stats.clicks}</div>
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