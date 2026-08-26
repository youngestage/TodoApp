// @ts-nocheck
// This file runs in the Deno runtime (Supabase Edge Function).
// Deno-specific globals (Deno, Deno.env) and URL-based imports are intentional.
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
    const { household_id, sender_id, title, body, url, tag } = await req.json();

    if (!household_id) {
      return new Response(JSON.stringify({ error: 'Missing household_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // ── VAPID keys set via: npx supabase secrets set VITE_VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... ──
    const vapidPublicKey = Deno.env.get('VITE_VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    // SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by Supabase into every edge function
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('[send-push] VAPID keys not set in Edge Function secrets.');
      return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    webpush.setVapidDetails(
      'mailto:support@couplesstudio.app',
      vapidPublicKey,
      vapidPrivateKey
    );

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch partner's active push subscriptions (exclude sender's own devices)
    let query = supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth, subscription')
      .eq('household_id', household_id);

    if (sender_id) {
      query = query.neq('user_id', sender_id);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('[send-push] DB error fetching subscriptions:', error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No subscriptions found for partner' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Build the payload — include tag so SW can stack correctly
    const payload = JSON.stringify({
      title: title || 'Couples Studio',
      body: body || 'Something happened in your shared space.',
      url: url || '/',
      tag: tag || 'ct-general',
      icon: '/icon-192.png',
      badge: '/badge-72.png'
    });

    let successCount = 0;
    const staleIds: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          // Use full subscription JSON if available, otherwise build from fields
          const pushSubscription = sub.subscription || {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          };
          await webpush.sendNotification(pushSubscription, payload);
          successCount++;
        } catch (err: any) {
          console.error('[send-push] Delivery failed:', sub.endpoint?.slice(0, 60), err?.statusCode, err?.message);
          // 404 or 410 = subscription expired/invalid — clean up
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            staleIds.push(sub.id);
          }
        }
      })
    );

    // Clean up expired subscriptions
    if (staleIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', staleIds);
      console.log(`[send-push] Cleaned ${staleIds.length} stale subscription(s).`);
    }

    return new Response(
      JSON.stringify({ sent: successCount, total: subscriptions.length, cleaned: staleIds.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    console.error('[send-push] Unhandled error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
