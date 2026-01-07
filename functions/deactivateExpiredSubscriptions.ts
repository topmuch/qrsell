import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admin can run this
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Get all active subscriptions
    const allSubscriptions = await base44.asServiceRole.entities.Subscription.list();
    const expiredSubscriptions = allSubscriptions.filter(sub => {
      if (!sub.is_active) return false;
      const endDate = new Date(sub.end_date).toISOString().split('T')[0];
      return endDate < todayStr; // Expired
    });

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions to deactivate`);

    // Deactivate expired subscriptions
    let deactivatedCount = 0;
    for (const subscription of expiredSubscriptions) {
      try {
        await base44.asServiceRole.entities.Subscription.update(subscription.id, {
          is_active: false
        });

        // Get seller info for email
        const sellers = await base44.asServiceRole.entities.Seller.filter({ 
          created_by: subscription.user_email 
        });
        const seller = sellers[0];

        // Send expiration email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: subscription.user_email,
          subject: '🔴 Votre abonnement ShopQR a expiré',
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #6C4AB6 0%, #FF6B9D 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔴 Abonnement expiré</h1>
              </div>
              <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; color: #374151;">Bonjour ${seller?.shop_name || subscription.user_email},</p>
                <p style="font-size: 16px; color: #374151;">
                  Votre abonnement ShopQR a <strong style="color: #ef4444;">expiré</strong> le ${new Date(subscription.end_date).toLocaleDateString('fr-FR')}.
                </p>
                
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ef4444;">
                  <p style="margin: 0; color: #991b1b;">
                    ⚠️ Votre boutique et vos QR codes ne sont plus accessibles jusqu'au renouvellement de votre abonnement.
                  </p>
                </div>

                <p style="font-size: 16px; color: #374151;">
                  Pour réactiver votre boutique et continuer à vendre, renouvelez votre abonnement dès maintenant.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${Deno.env.get('BASE44_APP_URL') || window.location.origin}/Dashboard" 
                     style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                    💳 Renouveler maintenant
                  </a>
                </div>

                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                  Pour toute question, contactez le support.
                </p>
              </div>
            </div>
          `
        });

        deactivatedCount++;
        console.log(`Deactivated subscription for ${subscription.user_email}`);
      } catch (error) {
        console.error(`Failed to deactivate subscription for ${subscription.user_email}:`, error);
      }
    }

    return Response.json({ 
      success: true,
      expiredCount: expiredSubscriptions.length,
      deactivatedCount 
    });
  } catch (error) {
    console.error('Error deactivating expired subscriptions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});