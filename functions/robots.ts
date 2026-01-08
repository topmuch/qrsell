Deno.serve(async (req) => {
  const baseUrl = 'https://shopqr.pro';
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Allow crawling of all shops
Allow: /Shop

# Disallow admin and private pages
Disallow: /Dashboard
Disallow: /AdminPanel
Disallow: /ProfileSetup
Disallow: /SubscriptionExpired

# Crawl-delay
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});