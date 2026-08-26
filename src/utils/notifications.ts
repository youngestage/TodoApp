import { savePushSubscriptionToDB } from '../services';
import { supabase } from '../lib/supabase';

const DEFAULT_VAPID_PUBLIC_KEY = 'BGxZOAJNcO0mSHKAUx7wkckR6EKfA3itwJSvVNy6PXfKt-SiX83LIanZ2hQVkt21_jaAS5m4UE5LBvaXOqQ-KGQ';

/**
 * Converts VAPID Base64 string to Uint8Array for Web Push PushManager registration.
 */
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

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported in this browser environment.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermissionState(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  return Notification.permission;
}

/**
 * Registers Web Push subscription via ServiceWorker PushManager and saves endpoint to Supabase DB.
 */
export async function subscribeUserToWebPush(
  userId: string,
  householdId: string,
  vapidPublicKey?: string
): Promise<PushSubscription | null> {
  if (!isNotificationSupported() || !userId || userId.startsWith('usr_')) return null;

  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    const registration = await navigator.serviceWorker.ready;
    if (!registration || !registration.pushManager) {
      console.warn('PushManager not supported on this ServiceWorker registration.');
      return null;
    }

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const keyToUse =
        vapidPublicKey ||
        (import.meta.env && import.meta.env.VITE_VAPID_PUBLIC_KEY) ||
        DEFAULT_VAPID_PUBLIC_KEY;

      try {
        const convertedKey = urlBase64ToUint8Array(keyToUse);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      } catch (subErr) {
        console.warn('PushManager subscribe notice:', subErr);
      }
    }

    if (subscription) {
      const subJson = subscription.toJSON();
      await savePushSubscriptionToDB(userId, householdId, subJson);
    }

    return subscription;
  } catch (err) {
    console.warn('Web Push subscription notice:', err);
    return null;
  }
}

export async function sendPushNotification(
  title: string,
  body: string,
  options?: { tag?: string; url?: string }
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  // Auto request permission if default
  if (Notification.permission === 'default') {
    const granted = await requestNotificationPermission();
    if (!granted) return;
  } else if (Notification.permission !== 'granted') {
    return;
  }

  const notificationOptions: NotificationOptions = {
    body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: options?.tag || 'coupletodo-action',
    vibrate: [100, 50, 100],
    data: {
      url: options?.url || '/'
    }
  };

  try {
    // Try sending via registered Service Worker for true PWA push feel
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notificationOptions);
        return;
      }
    }

    // Fallback to standard Browser Notification
    new Notification(title, notificationOptions);
  } catch (err) {
    console.error('Failed to trigger notification:', err);
  }
}

/**
 * Dispatches Web Push payload to partner's background device via Supabase Edge Function.
 * Delivers notifications even when partner's browser or app is completely CLOSED.
 */
export async function sendBackgroundPushToPartner(
  householdId: string,
  senderId: string,
  title: string,
  body: string,
  url: string = '/'
): Promise<void> {
  if (!householdId || householdId.startsWith('hh_') || !senderId) return;

  try {
    await supabase.functions.invoke('send-push', {
      body: {
        household_id: householdId,
        sender_id: senderId,
        title,
        body,
        url
      }
    });
  } catch (err) {
    console.warn('Background push to partner notice:', err);
  }
}
