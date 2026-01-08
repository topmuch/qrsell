/**
 * Generate robots.txt for SEO
 */
Deno.serve(async (req) => {
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
Disallow: /SellerCampaigns
Disallow: /PerformanceReports

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

  return new Response(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});