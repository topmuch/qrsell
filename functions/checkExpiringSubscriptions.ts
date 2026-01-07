import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admin can run this
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get site settings for reminder days
    const settings = await base44.asServiceRole.entities.SiteSettings.list();
    const reminderDays = settings[0]?.subscription_reminder_days || 5;

    // Calculate reminder date
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + reminderDays);
    const reminderDateStr = reminderDate.toISOString().split('T')[0];

    // Get all active subscriptions expiring in X days
    const allSubscriptions = await base44.asServiceRole.entities.Subscription.list();
    const expiringSubscriptions = allSubscriptions.filter(sub => {
      if (!sub.is_active) return false;
      const endDate = new Date(sub.end_date).toISOString().split('T')[0];
      return endDate === reminderDateStr;
    });

    console.log(`Found ${expiringSubscriptions.length} subscriptions expiring in ${reminderDays} days`);

    // Send reminder emails
    let emailsSent = 0;
    for (const subscription of expiringSubscriptions) {
      try {
        // Get user info
        const sellers = await base44.asServiceRole.entities.Seller.filter({ 
          created_by: subscription.user_email 
        });
        const seller = sellers[0];

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: subscription.user_email,
          subject: '⚠️ Votre abonnement ShopQR expire bientôt',
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #6C4AB6 0%, #FF6B9D 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Rappel d'expiration</h1>
              </div>
              <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; color: #374151;">Bonjour ${seller?.shop_name || subscription.user_email},</p>
                <p style="font-size: 16px; color: #374151;">
                  Votre abonnement ShopQR expire dans <strong style="color: #ef4444;">${reminderDays} jours</strong>.
                </p>
                
                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ef4444;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #991b1b;">📅 Date d'expiration :</p>
                  <p style="margin: 0; font-size: 18px; color: #991b1b;">${new Date(subscription.end_date).toLocaleDateString('fr-FR')}</p>
                </div>

                <p style="font-size: 16px; color: #374151;">
                  Pour continuer à profiter de votre boutique ShopQR et de tous vos QR codes TikTok, pensez à renouveler votre abonnement avant cette date.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${Deno.env.get('BASE44_APP_URL') || window.location.origin}/Dashboard" 
                     style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                    💳 Renouveler mon abonnement
                  </a>
                </div>

                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                  Pour toute question, contactez-nous sur WhatsApp : ${settings[0]?.whatsapp_support || '+221771234567'}
                </p>
              </div>
            </div>
          `
        });

        emailsSent++;
        console.log(`Reminder email sent to ${subscription.user_email}`);
      } catch (error) {
        console.error(`Failed to send reminder to ${subscription.user_email}:`, error);
      }
    }

    return Response.json({ 
      success: true,
      expiringCount: expiringSubscriptions.length,
      emailsSent 
    });
  } catch (error) {
    console.error('Error checking expiring subscriptions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});