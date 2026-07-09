/// <reference types="vite-plugin-pwa/client" />

// Service Worker EcoLoop AI — PWA Offline + Cache Strategy
const CACHE_NAME = 'ecoloop-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

const CACHE_STRATEGIES = {
  // Cache First pour assets statiques
  static: ['/assets/', '/images/', '/fonts/', '.js', '.css', '.woff2', '.woff'],
  // Network First pour API
  api: ['/api/'],
  // Stale While Revalidate pour pages
  pages: ['/'],
};

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Skip chrome-extension, data:, blob:
  if (!url.protocol.startsWith('http')) return;

  // Stratégie selon le type de ressource
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(url)) {
    event.respondWith(networkFirst(request));
  } else if (isPageRequest(url)) {
    event.respondWith(staleWhileRevalidate(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// ============ Strategies ============

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// ============ Helpers ============

function isStaticAsset(url) {
  return CACHE_STRATEGIES.static.some((pattern) => url.pathname.includes(pattern));
}

function isApiRequest(url) {
  return CACHE_STRATEGIES.api.some((pattern) => url.pathname.startsWith(pattern));
}

function isPageRequest(url) {
  return CACHE_STRATEGIES.pages.some((pattern) => url.pathname === pattern || url.pathname.startsWith(pattern));
}

// ============ Background Sync for Offline Queue ============

self.addEventListener('sync', (event) => {
  if (event.tag === 'ecoloop-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

async function processOfflineQueue() {
  const queue = await getOfflineQueue();
  if (!queue.length) return;

  for (const action of queue) {
    try {
      await executeAction(action);
      await removeFromQueue(action.id);
    } catch (err) {
      console.error('[SW] Sync failed for action:', action.id, err);
    }
  }
}

async function getOfflineQueue(): Promise<any[]> {
  // Utilise IndexedDB dans le SW
  return [];
}

async function removeFromQueue(id: string) {
  // IndexedDB remove
}

async function executeAction(action: any) {
  switch (action.type) {
    case 'payment':
      return fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      });
    case 'message':
      return fetch('/api/v1/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      });
    case 'collection':
      return fetch('/api/v1/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      });
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options: NotificationOptions = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag,
    data: data.data,
    actions: data.actions,
    requireInteraction: data.requireInteraction ?? false,
    silent: data.silent ?? false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action
    const url = new URL('/', self.location.origin).href;
    event.waitUntil(clients.openWindow(url));
  } else {
    // Default click
    event.waitUntil(clients.openWindow('/'));
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});