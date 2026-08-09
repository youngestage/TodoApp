/**
 * PWA Push Notification Utility for Couples Studio
 * Uses ServiceWorkerRegistration.showNotification with /logo.svg icon.
 */

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
