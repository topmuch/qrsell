import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

/**
 * Sitemap Generator Page
 * Accessible at /Sitemap - generates XML sitemap for Google
 */
export default function Sitemap() {
  const [sitemapXML, setSitemapXML] = useState('');

  // Fetch all active sellers/shops
  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['sitemap-sellers'],
    queryFn: async () => {
      const allSellers = await base44.entities.Seller.list();
      return allSellers.filter(s => s.shop_slug && s.shop_name);
    }
  });

  // Fetch all active shops
  const { data: shops = [] } = useQuery({
    queryKey: ['sitemap-shops'],
    queryFn: async () => {
      const allShops = await base44.entities.Shop.list();
      return allShops.filter(s => s.shop_slug && s.is_active);
    }
  });

  useEffect(() => {
    if (isLoading) return;

    const baseUrl = 'https://shopqr.pro';
    const today = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/PricingPlans', priority: '0.9', changefreq: 'weekly' },
      { url: '/Demo', priority: '0.8', changefreq: 'weekly' },
      { url: '/AllShops', priority: '0.9', changefreq: 'daily' },
      { url: '/Campagnes', priority: '0.7', changefreq: 'weekly' },
      { url: '/DevenirVendeur', priority: '0.9', changefreq: 'weekly' },
      { url: '/TikTokGuidePublic', priority: '0.6', changefreq: 'monthly' }
    ];

    // Combine sellers and shops for shop URLs
    const allShopSlugs = new Set([
      ...sellers.map(s => s.shop_slug),
      ...shops.map(s => s.shop_slug)
    ]);

    const shopUrls = Array.from(allShopSlugs).map(slug => ({
      url: `/@${slug}`,
      priority: '0.8',
      changefreq: 'daily'
    }));

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add shop pages with images
    sellers.forEach(seller => {
      xml += `  <url>
    <loc>${baseUrl}/@${seller.shop_slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>`;
      
      // Add shop image if available
      if (seller.logo_url || seller.banner_url) {
        xml += `
    <image:image>
      <image:loc>${seller.logo_url || seller.banner_url}</image:loc>
      <image:title>${seller.shop_name}</image:title>
      <image:caption>${seller.shop_name}${seller.city ? ` à ${seller.city}` : ''}</image:caption>
    </image:image>`;
      }
      
      xml += `
  </url>
`;
    });

    xml += `</urlset>`;

    setSitemapXML(xml);

    // Set content type for XML
    document.title = 'Sitemap XML - ShopQR';

  }, [sellers, shops, isLoading]);

  // Display as downloadable/viewable XML
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sitemap XML - ShopQR</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations</h2>
          <p className="text-gray-600 mb-2">
            Ce sitemap contient {sellers.length} boutiques actives.
          </p>
          <p className="text-gray-600 mb-4">
            URL du sitemap : <code className="bg-gray-100 px-2 py-1 rounded">https://shopqr.pro/sitemap.xml</code>
          </p>
          
          <a 
            href={`data:application/xml;charset=utf-8,${encodeURIComponent(sitemapXML)}`}
            download="sitemap.xml"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Télécharger sitemap.xml
          </a>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 overflow-auto">
          <pre className="text-green-400 text-sm whitespace-pre-wrap">
            {sitemapXML || 'Génération du sitemap...'}
          </pre>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Instructions Google Search Console</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Connectez-vous à <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline">Google Search Console</a></li>
            <li>Ajoutez votre propriété : <code className="bg-blue-100 px-2 py-1 rounded">https://shopqr.pro</code></li>
            <li>Allez dans "Sitemaps" dans le menu de gauche</li>
            <li>Soumettez l'URL : <code className="bg-blue-100 px-2 py-1 rounded">https://shopqr.pro/sitemap.xml</code></li>
            <li>Google indexera automatiquement toutes vos boutiques !</li>
          </ol>
        </div>
      </div>
    </div>
  );
}