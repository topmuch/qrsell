import React, { useEffect } from 'react';

/**
 * SEO Head Component - Gère toutes les balises meta SEO
 * @param {Object} props
 * @param {string} props.title - Titre de la page
 * @param {string} props.description - Meta description
 * @param {string} props.keywords - Mots-clés séparés par des virgules
 * @param {string} props.canonicalUrl - URL canonique
 * @param {string} props.ogImage - Image Open Graph
 * @param {string} props.ogType - Type Open Graph (website, article, product)
 * @param {Object} props.schema - Schema.org structured data
 */
export default function SEOHead({ 
  title, 
  description, 
  keywords, 
  canonicalUrl,
  ogImage,
  ogType = 'website',
  schema
}) {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title;
    }

    // Helper function to set meta tags
    const setMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      const attr = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Meta description
    setMetaTag('description', description);
    
    // Keywords
    setMetaTag('keywords', keywords);

    // Robots
    setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Open Graph
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', canonicalUrl || window.location.href, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:site_name', 'ShopQR', true);
    setMetaTag('og:locale', 'fr_FR', true);

    // Twitter Cards
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Mobile optimization
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1, maximum-scale=5';

    // Theme color
    setMetaTag('theme-color', '#6C4AB6');

    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }

    // Schema.org structured data
    if (schema) {
      // Remove existing schema
      const existingSchema = document.getElementById('seo-schema');
      if (existingSchema) {
        existingSchema.remove();
      }

      // Add new schema
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'seo-schema';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    // Cleanup
    return () => {
      const schemaScript = document.getElementById('seo-schema');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, schema]);

  return null;
}

/**
 * Generate LocalBusiness schema for shops
 */
export function generateShopSchema(seller, productsCount) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": seller.shop_name,
    "description": `Découvrez ${seller.shop_name}${seller.city ? ` à ${seller.city}` : ''}. ${productsCount} produit${productsCount > 1 ? 's' : ''} disponible${productsCount > 1 ? 's' : ''}.`,
    "url": `https://shopqr.pro/@${seller.shop_slug}`,
    "image": seller.logo_url || seller.banner_url,
    "telephone": seller.whatsapp_number,
    "email": seller.email,
    "priceRange": "$$",
    "paymentAccepted": "Cash, Mobile Money, Wave, Orange Money",
    "currenciesAccepted": "XOF, EUR",
    "sameAs": [
      seller.instagram ? `https://instagram.com/${seller.instagram.replace('@', '')}` : null,
      seller.tiktok ? `https://tiktok.com/@${seller.tiktok.replace('@', '')}` : null,
      seller.facebook
    ].filter(Boolean)
  };

  // Add address if available
  if (seller.address || seller.city || seller.country) {
    schema.address = {
      "@type": "PostalAddress",
      "streetAddress": seller.address,
      "addressLocality": seller.city,
      "addressCountry": seller.country
    };
  }

  // Add geo coordinates if city is known
  const cityCoordinates = {
    'Dakar': { lat: 14.6928, lng: -17.4467 },
    'Abidjan': { lat: 5.3600, lng: -4.0083 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Douala': { lat: 4.0511, lng: 9.7679 },
    'Yaoundé': { lat: 3.8480, lng: 11.5021 },
    'Casablanca': { lat: 33.5731, lng: -7.5898 }
  };

  if (seller.city && cityCoordinates[seller.city]) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": cityCoordinates[seller.city].lat,
      "longitude": cityCoordinates[seller.city].lng
    };
  }

  return schema;
}

/**
 * Generate keywords based on location
 */
export function generateLocalizedKeywords(seller) {
  const baseKeywords = [
    seller.shop_name,
    seller.category,
    seller.city,
    seller.country,
    'QR code',
    'boutique en ligne',
    'WhatsApp commerce',
    'achat en ligne',
    'livraison'
  ].filter(Boolean);

  // Country-specific keywords
  const countryKeywords = {
    'Sénégal': [
      'QR code Dakar',
      'vendre en ligne Sénégal',
      'commerce WhatsApp Senegal',
      'boutique Dakar',
      'acheter Sénégal',
      'livraison Dakar'
    ],
    'France': [
      'boutique QR France',
      'vendre sur TikTok Europe',
      'commerce en ligne France',
      'livraison France'
    ],
    "Côte d'Ivoire": [
      'boutique Abidjan',
      'commerce Côte d\'Ivoire',
      'QR code Abidjan',
      'acheter Abidjan',
      'livraison Côte d\'Ivoire'
    ],
    'Cameroun': [
      'boutique Douala',
      'boutique Yaoundé',
      'commerce Cameroun',
      'QR code Cameroun',
      'acheter Cameroun'
    ]
  };

  // Category-specific keywords
  const categoryKeywords = {
    'Mode': ['mode africaine', 'wax', 'vêtements africains', 'prêt-à-porter'],
    'Beauté': ['cosmétiques', 'soins', 'maquillage', 'beauté africaine'],
    'Électroménager': ['appareils', 'électronique', 'high-tech'],
    'Accessoires': ['bijoux', 'sacs', 'montres', 'accessoires mode'],
    'Alimentation': ['épicerie', 'produits locaux', 'alimentation africaine']
  };

  // Add country keywords
  if (seller.country && countryKeywords[seller.country]) {
    baseKeywords.push(...countryKeywords[seller.country]);
  }

  // Add category keywords
  if (seller.category && categoryKeywords[seller.category]) {
    baseKeywords.push(...categoryKeywords[seller.category]);
  }

  // Add city-specific keywords
  if (seller.city && seller.category) {
    baseKeywords.push(`${seller.category.toLowerCase()} ${seller.city}`);
    baseKeywords.push(`acheter ${seller.category.toLowerCase()} ${seller.city}`);
  }

  return [...new Set(baseKeywords)].join(', ');
}

/**
 * Generate WebSite schema for homepage
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ShopQR",
    "alternateName": "ShopQR - Commerce QR Code",
    "url": "https://shopqr.pro",
    "description": "Vendez via QR Code, WhatsApp et TikTok Live. Sans site web, sans carte bancaire. Créez votre boutique digitale dès 5 000 FCFA/mois.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://shopqr.pro/AllShops?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ShopQR",
      "logo": {
        "@type": "ImageObject",
        "url": "https://shopqr.pro/logo.png"
      }
    }
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ShopQR",
    "url": "https://shopqr.pro",
    "logo": "https://shopqr.pro/logo.png",
    "description": "Plateforme de commerce QR Code pour l'Afrique et l'Europe",
    "foundingDate": "2024",
    "areaServed": [
      { "@type": "Country", "name": "Sénégal" },
      { "@type": "Country", "name": "Côte d'Ivoire" },
      { "@type": "Country", "name": "Cameroun" },
      { "@type": "Country", "name": "France" }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["French", "English"]
    },
    "sameAs": [
      "https://instagram.com/shopqr",
      "https://tiktok.com/@shopqr",
      "https://facebook.com/shopqr"
    ]
  };
}