import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Eye, Trash2, ExternalLink, Loader2, Package, AlertCircle, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from 'framer-motion';

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.public_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="px-4 py-2">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Produit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Boutique</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Prix</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Scans</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Clics</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const stats = getProductStats(product.id);
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            {product.public_id ? (
                              <code className="text-xs text-gray-400">{product.public_id}</code>
                            ) : (
                              <span className="text-xs text-red-500">❌ ID manquant</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {getSellerName(product.seller_id)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(product.price)} FCFA
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">{stats.scans}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">{stats.clicks}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {product.is_active ? (
                          <Badge className="bg-green-100 text-green-700">Actif</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">Inactif</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedProduct({ ...product, stats })}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/ProductPage?id=${product.public_id}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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