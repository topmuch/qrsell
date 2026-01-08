import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if user is admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all shops using service role
    const shops = await base44.asServiceRole.entities.Shop.list();
    
    let updated = 0;
    let skipped = 0;
    const errors = [];

    // Update each shop
    for (const shop of shops) {
      try {
        // Only update shops without a template or with old templates
        if (!shop.template || ['luxe', 'vibrant', 'marche_local', 'minimal'].includes(shop.template)) {
          await base44.asServiceRole.entities.Shop.update(shop.id, {
            template: 'lumiere'
          });
          updated++;
        } else {
          skipped++;
        }
      } catch (error) {
        errors.push({ shop_id: shop.id, shop_name: shop.shop_name, error: error.message });
      }
    }

    return Response.json({
      success: true,
      message: `Migration terminée: ${updated} boutiques mises à jour, ${skipped} conservées`,
      updated,
      skipped,
      total: shops.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});