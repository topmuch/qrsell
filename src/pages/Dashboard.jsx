import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, QrCode, Store, ExternalLink, Loader2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/dashboard/ProductCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const user = await base44.auth.me();
      const sellers = await base44.entities.Seller.filter({ created_by: user.email });
      
      if (sellers.length === 0) {
        navigate(createPageUrl('ProfileSetup'));
        return;
      }

      setSeller(sellers[0]);
      
      const sellerProducts = await base44.entities.Product.filter(
        { seller_email: user.email },
        '-created_date'
      );
      setProducts(sellerProducts);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ed477c]" />
      </div>
    );
  }

  const shopUrl = `${window.location.origin}/shop/${seller?.shop_slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ed477c] rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{seller?.full_name}</h1>
                <p className="text-sm text-gray-500">@{seller?.shop_slug}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-600">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-[#ed477c] to-[#c93b63] text-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Produits actifs</span>
                  <Package className="w-6 h-6" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{products.length}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Boutique</span>
                  <Store className="w-6 h-6 text-[#ed477c]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={shopUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#ed477c] hover:underline flex items-center gap-2"
                >
                  Voir ma vitrine
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Guide TikTok</span>
                  <QrCode className="w-6 h-6 text-[#ed477c]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={createPageUrl('TikTokGuide')}>
                  <Button variant="outline" className="w-full border-[#ed477c] text-[#ed477c] hover:bg-[#ed477c] hover:text-white">
                    Voir le guide
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Products Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes produits</h2>
          <Link to={createPageUrl('AddProduct')}>
            <Button className="bg-[#ed477c] hover:bg-[#d63d6c] text-white">
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un produit
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Aucun produit pour le moment</h3>
              <p className="text-gray-600 mb-6">Ajoutez votre premier produit pour commencer à vendre</p>
              <Link to={createPageUrl('AddProduct')}>
                <Button className="bg-[#ed477c] hover:bg-[#d63d6c] text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter un produit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index}
                onRefresh={loadDashboard}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}