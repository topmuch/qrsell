import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate dynamic sitemap.xml for SEO
 * Returns XML sitemap with all active shops
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all active sellers
    const sellers = await base44.asServiceRole.entities.Seller.list();
    const activeSellers = sellers.filter(s => s.shop_slug && s.shop_name && s.is_subscribed);
    
    // Fetch all active shops
    const shops = await base44.asServiceRole.entities.Shop.list();
    const activeShops = shops.filter(s => s.shop_slug && s.is_active);
    
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

    // Combine unique shop slugs
    const allShopSlugs = new Set([
      ...activeSellers.map(s => s.shop_slug),
      ...activeShops.map(s => s.shop_slug)
    ]);

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
    activeSellers.forEach(seller => {
      xml += `  <url>
    <loc>${baseUrl}/@${seller.shop_slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>`;
      
      // Add shop image if available
      if (seller.logo_url || seller.banner_url) {
        const imageUrl = seller.logo_url || seller.banner_url;
        xml += `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(seller.shop_name)}</image:title>
      <image:caption>${escapeXml(seller.shop_name)}${seller.city ? ` à ${escapeXml(seller.city)}` : ''}</image:caption>
    </image:image>`;
      }
      
      xml += `
  </url>
`;
    });

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper to escape XML special characters
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}