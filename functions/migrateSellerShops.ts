import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can run this migration
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all sellers
    const sellers = await base44.asServiceRole.entities.Seller.list();
    const shops = await base44.asServiceRole.entities.Shop.list();

    const results = {
      total_sellers: sellers.length,
      shops_created: 0,
      already_had_shops: 0,
      errors: []
    };

    for (const seller of sellers) {
      try {
        // Check if seller already has a shop
        const existingShop = shops.find(s => s.seller_id === seller.id);
        
        if (existingShop) {
          results.already_had_shops++;
          continue;
        }

        // Create shop from seller data
        await base44.asServiceRole.entities.Shop.create({
          seller_id: seller.id,
          shop_name: seller.shop_name || 'Ma Boutique',
          shop_slug: seller.shop_slug || `shop_${seller.id}`,
          logo_url: seller.logo_url,
          banner_url: seller.banner_url,
          banner_images: seller.banner_images || [],
          primary_color: seller.primary_color || '#4CAF50',
          secondary_color: seller.secondary_color || '#45a049',
          category: 'Autre',
          address: seller.address,
          whatsapp_number: seller.whatsapp_number,
          email: seller.email,
          tiktok: seller.tiktok,
          instagram: seller.instagram,
          facebook: seller.facebook,
          whatsapp_business: seller.whatsapp_business,
          payment_methods: seller.payment_methods || [],
          partner_logos: seller.partner_logos || [],
          featured_product_id: seller.featured_product_id,
          use_manual_featured: seller.use_manual_featured || false,
          show_live_public_counter: seller.show_live_public_counter || false,
          is_active: true,
          created_by: seller.created_by
        });

        results.shops_created++;
      } catch (error) {
        results.errors.push({
          seller_id: seller.id,
          seller_email: seller.created_by,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Migration completed: ${results.shops_created} shops created, ${results.already_had_shops} sellers already had shops`,
      details: results
    });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});