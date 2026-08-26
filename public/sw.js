const CACHE_NAME = 'coupletodo-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg'
];

// ─────────────────────────────────────────────
// INSTALL
// ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ─────────────────────────────────────────────
// ACTIVATE
// ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// ─────────────────────────────────────────────
// PUSH — Rich, Stackable Notifications
// Each notification type gets its OWN tag so they
// stack independently (task, chat, finance, etc.)
// renotify: true = user gets alerted every time
// ─────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Couples Studio 💑';
  const body = data.body || 'Something new happened in your shared space.';
  const url = data.url || '/';
  const tag = data.tag || 'coupletodo-general';
  const icon = data.icon || '/icon-192.png';
  const badge = data.badge || '/badge-72.png';
  const requireInteraction = data.requireInteraction ?? false;

  const options = {
    body,
    icon,
    badge,
    tag,                       // unique per event type → independent stacking
    renotify: true,            // alert user even when replacing a same-tag notification
    requireInteraction,        // keep notification until user explicitly dismisses
    vibrate: [100, 50, 100, 50, 200],
    silent: false,
    data: { url },
    actions: [
      { action: 'open', title: '👀 View' },
      { action: 'dismiss', title: '✕ Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─────────────────────────────────────────────
// NOTIFICATION CLICK
// ─────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing open window if found
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          // Navigate to the correct section if URL differs
          if (client.url !== urlToOpen) {
            client.navigate(urlToOpen);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ─────────────────────────────────────────────
// NOTIFICATION CLOSE (optional analytics hook)
// ─────────────────────────────────────────────
self.addEventListener('notificationclose', (_event) => {
  // Notification was dismissed without clicking — no action needed
});

// ─────────────────────────────────────────────
// FETCH — Cache-first with network fallback
// ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
