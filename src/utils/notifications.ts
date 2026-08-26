import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────
// VAPID KEY — matches the key pair set in .env + Edge Function
// ─────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPID_PUBLIC_KEY) ||
  'BAmuBUCUQJ08t3PbquY7KnbMkZVQjOrai6B2WrutUlF1yQkRnfet1KZ3okvoW4HjelSb58yEf7XRiAd1B6pmQ-0';

// ─────────────────────────────────────────────────────────────
// NOTIFICATION TAGS — each event type gets its own tag so
// notifications from different events STACK independently.
// Within the same type, renotify:true ensures re-alerting.
// ─────────────────────────────────────────────────────────────
export const NOTIFICATION_TAGS = {
  TASK_ADD: 'ct-task-add',
  TASK_COMPLETE: 'ct-task-complete',
  TASK_DELETE: 'ct-task-delete',
  CHAT_MESSAGE: 'ct-chat-message',
  CHAT_BUZZ: 'ct-chat-buzz',
  TRANSACTION: 'ct-transaction',
  RECURRING_BILL: 'ct-recurring-bill',
  SAVINGS_DEPOSIT: 'ct-savings-deposit',
  SAVINGS_NUDGE: 'ct-savings-nudge',
  DEBT_PAYMENT: 'ct-debt-payment',
  QUICK_NOTE: 'ct-quick-note',
  PARTNER_JOINED: 'ct-partner-joined',
  PARTNER_LEFT: 'ct-partner-left',
  GENERAL: 'ct-general'
} as const;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** True when running as an installed PWA (standalone mode) */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as any).standalone === true)
  );
}

/** True when running on iOS/iPadOS */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/** True when the browser supports Web Push */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/** Returns current notification permission state */
export function getNotificationPermissionState(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  return Notification.permission;
}

/** Request permission — must be called from a user gesture for iOS */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// SAVE SUBSCRIPTION TO DB (upsert to prevent duplicates)
// ─────────────────────────────────────────────────────────────
export async function savePushSubscriptionToDB(
  userId: string,
  householdId: string,
  subJson: PushSubscriptionJSON
): Promise<void> {
  if (!userId || !householdId || !subJson?.endpoint) return;

  const payload = {
    user_id: userId,
    household_id: householdId,
    endpoint: subJson.endpoint,
    p256dh: subJson.keys?.p256dh || null,
    auth: subJson.keys?.auth || null,
    subscription: subJson,
    user_agent: navigator.userAgent,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(payload, { onConflict: 'user_id,endpoint', ignoreDuplicates: false });

  if (error) {
    console.warn('Error saving push subscription:', error.message);
  }
}

// ─────────────────────────────────────────────────────────────
// SUBSCRIBE TO WEB PUSH
// ⚠️ On iOS: this MUST be called directly from a user tap handler
//    (not inside a useEffect or setTimeout)
// ─────────────────────────────────────────────────────────────
export async function subscribeUserToWebPush(
  userId: string,
  householdId: string,
  isUserGesture: boolean = false
): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('[Push] Web Push not supported on this browser.');
    return null;
  }
  if (!userId || userId.startsWith('usr_')) return null;
  if (!householdId || householdId.startsWith('hh_')) return null;

  try {
    // Only prompt for permission if explicitly invoked by a user gesture.
    // If called in background without permission, return null quietly to avoid browser violations.
    if (Notification.permission === 'default') {
      if (!isUserGesture) {
        return null;
      }
      const granted = await requestNotificationPermission();
      if (!granted) return null;
    } else if (Notification.permission !== 'granted') {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration?.pushManager) {
      console.warn('[Push] PushManager not available.');
      return null;
    }

    // Check for existing subscription first
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,  // required by all browsers
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });
    }

    if (subscription) {
      const subJson = subscription.toJSON();
      await savePushSubscriptionToDB(userId, householdId, subJson);
      console.log('[Push] Subscribed:', subscription.endpoint.slice(0, 60) + '...');
    }

    return subscription;
  } catch (err: any) {
    // NotAllowedError = user denied, AbortError = iOS not-installed or gesture issue
    if (err?.name === 'NotAllowedError') {
      console.warn('[Push] Permission denied by user.');
    } else if (err?.name === 'AbortError') {
      console.warn('[Push] Subscribe aborted — on iOS, the app must be added to Home Screen and this must be called from a user tap.');
    } else {
      console.warn('[Push] Subscribe error:', err);
    }
    return null;
  }
}

/** Unsubscribe this device from push and remove from DB */
export async function unsubscribeFromWebPush(userId: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration?.pushManager?.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      if (userId && !userId.startsWith('usr_')) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', endpoint);
      }
      console.log('[Push] Unsubscribed and removed from DB.');
    }
  } catch (err) {
    console.warn('[Push] Unsubscribe error:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// SEND LOCAL NOTIFICATION (when app is open / in foreground)
// Shows immediately via Service Worker for proper PWA feel.
// Each tag stacks independently; renotify re-alerts the user.
// ─────────────────────────────────────────────────────────────
export async function sendPushNotification(
  title: string,
  body: string,
  options?: {
    tag?: string;
    url?: string;
    requireInteraction?: boolean;
  }
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'default') {
    // Don't auto-prompt here — let the user gesture in Settings do it
    return;
  }
  if (Notification.permission !== 'granted') return;

  const tag = options?.tag || NOTIFICATION_TAGS.GENERAL;

  // Use type assertion to access extended Notification API properties
  // (renotify, vibrate, actions, silent are part of the Web Push spec but
  // not always in the TypeScript lib DOM definitions)
  const notificationOptions = {
    body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag,
    renotify: true,            // re-alert user even if same tag already showing
    silent: false,
    vibrate: [100, 50, 100, 50, 200],
    data: { url: options?.url || '/' },
    requireInteraction: options?.requireInteraction ?? false,
    actions: [
      { action: 'open', title: '\ud83d\udc40 View' },
      { action: 'dismiss', title: '\u2715' }
    ]
  } as NotificationOptions;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg?.showNotification) {
        await reg.showNotification(title, notificationOptions);
        return;
      }
    }
    // Fallback (won't work on iOS, but fine for Chrome desktop/Android)
    new Notification(title, notificationOptions);
  } catch (err) {
    console.error('[Push] Failed to show local notification:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// SEND BACKGROUND PUSH TO PARTNER (app closed / background)
// Calls the Supabase Edge Function which sends a real Web Push
// to all of the partner's registered device subscriptions.
// ─────────────────────────────────────────────────────────────
export async function sendBackgroundPushToPartner(
  householdId: string,
  senderId: string,
  title: string,
  body: string,
  url: string = '/',
  tag: string = NOTIFICATION_TAGS.GENERAL
): Promise<void> {
  if (!householdId || householdId.startsWith('hh_') || !senderId) return;
  if (senderId.startsWith('usr_')) return;

  try {
    await supabase.functions.invoke('send-push', {
      body: {
        household_id: householdId,
        sender_id: senderId,
        title,
        body,
        url,
        tag
      }
    });
  } catch (err) {
    console.warn('[Push] Background push to partner failed:', err);
  }
}
