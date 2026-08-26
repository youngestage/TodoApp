import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { household_id, sender_id, title, body, url } = await req.json();

    if (!household_id) {
      return new Response(JSON.stringify({ error: 'Missing household_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://gerlqjxmyenddsxlnilm.supabase.co';
    const supabaseServiceKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcmxxanhteWVuZGRzeGxuaWxtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI2MjA0NCwiZXhwIjoyMTAxODM4MDQ0fQ.NPp6EGal9rgQyAMGnxy7jr9dlnxPc_eKxoKa2GoV9cE';

    const vapidPublicKey =
      Deno.env.get('VITE_VAPID_PUBLIC_KEY') ||
      'BGxZOAJNcO0mSHKAUx7wkckR6EKfA3itwJSvVNy6PXfKt-SiX83LIanZ2hQVkt21_jaAS5m4UE5LBvaXOqQ-KGQ';

    const vapidPrivateKey =
      Deno.env.get('VAPID_PRIVATE_KEY') || 't-SiX83LIanZ2hQVkt21_jaAS5m4UE5LBvaXOqQ-KGQ';

    webpush.setVapidDetails(
      'mailto:support@coupletodo.app',
      vapidPublicKey,
      vapidPrivateKey
    );

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch active push subscriptions for partner in household
    let query = supabase.from('push_subscriptions').select('*').eq('household_id', household_id);

    if (sender_id) {
      query = query.neq('user_id', sender_id);
    }

    const { data: subscriptions, error } = await query;

    if (error || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No subscriptions found for partner' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const payload = JSON.stringify({
      title: title || 'Couples Studio Update',
      body: body || 'New action performed in your shared household.',
      url: url || '/'
    });

    let successCount = 0;

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = sub.subscription || {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          };
          await webpush.sendNotification(pushSubscription, payload);
          successCount++;
        } catch (err: any) {
          console.error('Error delivering Web Push payload:', sub.endpoint, err?.message);
          // If subscription is invalid or expired (404 / 410), clean up stale subscription row
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      })
    );

    return new Response(JSON.stringify({ sent: successCount, total: subscriptions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
