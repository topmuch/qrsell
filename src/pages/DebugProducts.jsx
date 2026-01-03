import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from 'lucide-react';

export default function DebugProducts() {
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['all-products-debug'],
    queryFn: async () => {
      try {
        const result = await base44.entities.Product.list();
        return result;
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    }
  });

  const { data: sellers = [] } = useQuery({
    queryKey: ['all-sellers-debug'],
    queryFn: async () => {
      try {
        const result = await base44.entities.Seller.list();
        return result;
      } catch (error) {
        console.error('Error fetching sellers:', error);
        return [];
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🔍 Diagnostic des Produits</h1>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Avec public_id</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {products.filter(p => p.public_id).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sans public_id</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-600">
                {products.filter(p => !p.public_id).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste détaillée des produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xl text-red-600 font-bold">❌ Aucun produit trouvé</p>
                  <p className="text-gray-600 mt-2">La requête a retourné 0 produits</p>
                </div>
              ) : (
                products.map(product => {
                  const seller = sellers.find(s => s.id === product.seller_id);
                  return (
                    <div 
                      key={product.id} 
                      className={`border rounded-lg p-4 ${product.public_id ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Nom du produit</p>
                          <p className="font-semibold">{product.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Prix</p>
                          <p className="font-semibold">{product.price} FCFA</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Public ID</p>
                          <p className={`font-mono ${product.public_id ? 'text-green-600' : 'text-red-600'}`}>
                            {product.public_id || '❌ MANQUANT'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Seller ID</p>
                          <p className="font-mono text-xs">{product.seller_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Vendeur</p>
                          <p className="font-semibold">
                            {seller ? seller.shop_name : '❌ Vendeur introuvable'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Créé le</p>
                          <p className="text-sm">{new Date(product.created_date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">URL du QR Code (si public_id existe)</p>
                          {product.public_id ? (
                            <a 
                              href={`/ProductPage?id=${product.public_id}`}
                              target="_blank"
                              className="text-blue-600 hover:underline text-sm break-all"
                            >
                              {window.location.origin}/ProductPage?id={product.public_id}
                            </a>
                          ) : (
                            <p className="text-red-600">Impossible de générer l'URL sans public_id</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sellers List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des vendeurs ({sellers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sellers.map(seller => (
                <div key={seller.id} className="border rounded p-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nom boutique</p>
                      <p className="font-semibold">{seller.shop_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Slug</p>
                      <p className="font-mono text-sm">{seller.shop_slug}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="font-mono text-xs">{seller.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}