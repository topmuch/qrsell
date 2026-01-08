import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if user is admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all shops
    const shops = await base44.asServiceRole.entities.Shop.list();
    
    let updated = 0;
    let skipped = 0;

    // Update each shop
    for (const shop of shops) {
      // Only update shops without a template or with old templates
      if (!shop.template || ['luxe', 'vibrant', 'marche_local', 'minimal'].includes(shop.template)) {
        await base44.asServiceRole.entities.Shop.update(shop.id, {
          template: 'lumiere'
        });
        updated++;
      } else {
        skipped++;
      }
    }

    return Response.json({
      success: true,
      message: `Migration terminée: ${updated} boutiques mises à jour, ${skipped} conservées`,
      updated,
      skipped,
      total: shops.length
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});