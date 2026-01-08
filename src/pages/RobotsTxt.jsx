import React, { useEffect } from 'react';

/**
 * Robots.txt Generator Page
 * Displays robots.txt content for SEO
 */
export default function RobotsTxt() {
  const robotsContent = `# Robots.txt for ShopQR
# https://shopqr.pro

User-agent: *
Allow: /
Allow: /@*
Allow: /Shop
Allow: /AllShops
Allow: /PricingPlans
Allow: /Demo
Allow: /Campagnes
Allow: /DevenirVendeur
Allow: /TikTokGuidePublic

# Disallow admin and dashboard pages
Disallow: /Dashboard
Disallow: /AdminPanel
Disallow: /ProfileSetup
Disallow: /SubscriptionExpired
Disallow: /SubscriptionRequest
Disallow: /Onboarding

# Crawl delay for politeness
Crawl-delay: 1

# Sitemap location
Sitemap: https://shopqr.pro/sitemap.xml

# Google specific
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bing specific
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Allow all shop pages for indexing
User-agent: *
Allow: /Shop?slug=*
`;

  useEffect(() => {
    document.title = 'Robots.txt - ShopQR';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Robots.txt - ShopQR</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <p className="text-gray-600 mb-4">
            Ce fichier robots.txt autorise les moteurs de recherche à indexer toutes les boutiques ShopQR.
          </p>
          
          <a 
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(robotsContent)}`}
            download="robots.txt"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Télécharger robots.txt
          </a>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <pre className="text-green-400 text-sm whitespace-pre-wrap">
            {robotsContent}
          </pre>
        </div>

        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-900">Note importante</h2>
          <p className="text-yellow-800">
            Pour que ce fichier soit accessible à l'URL racine (shopqr.pro/robots.txt), 
            vous devez configurer votre hébergement pour servir ce contenu statiquement.
          </p>
        </div>
      </div>
    </div>
  );
}