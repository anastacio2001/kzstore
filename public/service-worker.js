// KZSTORE Service Worker - PWA + Push Notifications
const CACHE_NAME = 'kzstore-v2.1';
const STATIC_CACHE = 'kzstore-static-v2';
const DYNAMIC_CACHE = 'kzstore-dynamic-v2';
const IMAGE_CACHE = 'kzstore-images-v2';

// Static resources (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/uploads/icon-192x192.png',
  '/uploads/icon-512x512.png'
];

// Dynamic API routes to cache
const API_CACHE_URLS = [
  '/api/products',
  '/api/categories',
  '/api/banners'
];

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING received, activating new version');
    self.skipWaiting();
  }
});

// Install Event - Cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v2.1...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      }),
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE)
    ]).then(() => {
      console.log('[SW] Install complete');
      // Don't skip waiting automatically, wait for user confirmation
    })
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v2.1...');
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete, claiming clients');
    })
  );
});

// Fetch Event - Advanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external domains
  if (url.origin !== location.origin && !url.hostname.includes('kzstore')) {
    return;
  }

  // Strategy 1: Network first for API calls (with cache fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Strategy 2: Cache first for images
  if (request.destination === 'image' || url.pathname.includes('/uploads/') || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Strategy 3: Stale-while-revalidate for static assets
  if (request.destination === 'script' || request.destination === 'style' || url.pathname.match(/\.(js|css)$/i)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Strategy 4: Network first with offline fallback for HTML
  event.respondWith(networkFirstWithOffline(request));
});

// Network First Strategy (for API)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline JSON for API calls
    return new Response(JSON.stringify({ 
      error: 'offline', 
      message: 'Você está offline. Alguns dados podem estar desatualizados.' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

// Cache First Strategy (for images)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch image:', request.url);
    // Return placeholder image or default
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}

// Stale While Revalidate (for static assets)
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Network First with Offline Fallback (for HTML)
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    return new Response('Network error', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Push Event - Show notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: 'KZSTORE',
    body: 'Nova notificação',
    icon: '/uploads/icon-192x192.png',
    badge: '/uploads/icon-72x72.png',
    tag: 'default',
    requireInteraction: false
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/uploads/icon-192x192.png',
    badge: data.badge || '/uploads/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      orderId: data.orderId,
      action: data.action
    },
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if window is already open
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background Sync (for offline orders)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('[SW] Syncing orders...');
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // TODO: Implement offline order sync
  console.log('[SW] Orders synced');
}
