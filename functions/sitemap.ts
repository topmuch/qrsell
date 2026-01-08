import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all active sellers/shops
    const sellers = await base44.asServiceRole.entities.Seller.list();
    const activeSellers = sellers.filter(s => s.shop_slug && s.is_subscribed);

    // Get all active shops
    const shops = await base44.asServiceRole.entities.Shop.list();
    const activeShops = shops.filter(s => s.is_active);

    const baseUrl = 'https://shopqr.pro';
    
    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Homepage
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/</loc>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';

    // Static pages
    const staticPages = [
      { path: '/PricingPlans', priority: '0.9' },
      { path: '/Demo', priority: '0.8' },
      { path: '/AllShops', priority: '0.8' },
      { path: '/DevenirVendeur', priority: '0.9' },
      { path: '/TikTokGuidePublic', priority: '0.7' }
    ];

    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    // All seller shops (from both Seller and Shop entities)
    const allShopSlugs = new Set();
    
    // Add from Seller entity
    activeSellers.forEach(seller => {
      if (seller.shop_slug) {
        allShopSlugs.add(seller.shop_slug);
      }
    });

    // Add from Shop entity
    activeShops.forEach(shop => {
      if (shop.shop_slug) {
        allShopSlugs.add(shop.shop_slug);
      }
    });

    // Generate URLs for all shops
    Array.from(allShopSlugs).forEach(slug => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/Shop?slug=${slug}</loc>\n`;
      sitemap += '    <changefreq>daily</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});