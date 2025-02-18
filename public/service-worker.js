const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  static: `${CACHE_VERSION}-static`,
  dynamic: `${CACHE_VERSION}-dynamic`,
  images: `${CACHE_VERSION}-images`,
  api: `${CACHE_VERSION}-api`
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/icons/icon-512x512.png',
  '/icons/icon-384x384.png',
  '/icons/icon-192x192.png',
  '/icons/icon-152x152.png',
  '/icons/icon-144x144.png',
  '/icons/icon-128x128.png',
  '/icons/icon-96x96.png',
  '/icons/icon-72x72.png'
];

const API_ROUTES = [
  '/api/seller/messages',
  '/api/seller/conversations',
  '/api/notifications'
];

// IndexedDB configuration
const DB_NAME = 'VowSwapOfflineDB';
const DB_VERSION = 1;
const STORES = {
  messages: 'pendingMessages',
  orders: 'pendingOrders',
  analytics: 'pendingAnalytics'
};

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains(STORES.messages)) {
        db.createObjectStore(STORES.messages, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORES.orders)) {
        db.createObjectStore(STORES.orders, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORES.analytics)) {
        db.createObjectStore(STORES.analytics, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Store pending item
async function storePendingItem(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get and clear pending items
async function getPendingItems(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      // Clear the store after reading
      store.clear();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.static).then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - implement stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API routes - Network first, then cache
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAMES.api)
            .then(cache => cache.put(request, clonedResponse));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and no cache, store the request for later
          if (request.method === 'POST') {
            await storePendingItem(STORES.messages, {
              url: request.url,
              method: request.method,
              body: await request.json(),
              timestamp: Date.now()
            });
          }
          return new Response(JSON.stringify({ error: 'Currently offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Image caching - Cache first, then network
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Revalidate the cache in the background
            fetch(request)
              .then(response => {
                caches.open(CACHE_NAMES.images)
                  .then(cache => cache.put(request, response));
              });
            return cachedResponse;
          }
          return fetch(request)
            .then(response => {
              const clonedResponse = response.clone();
              caches.open(CACHE_NAMES.images)
                .then(cache => cache.put(request, clonedResponse));
              return response;
            });
        })
    );
    return;
  }

  // HTML pages - Network first, then cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAMES.static)
            .then(cache => cache.put(request, clonedResponse));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          return cachedResponse || caches.match('/offline.html');
        })
    );
    return;
  }

  // Default stale-while-revalidate strategy
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        const fetchPromise = fetch(request)
          .then(response => {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAMES.dynamic)
              .then(cache => cache.put(request, clonedResponse));
            return response;
          });
        return cachedResponse || fetchPromise;
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data.data,
      actions: data.actions,
      vibrate: [200, 100, 200],
      tag: data.tag,
      renotify: true,
      requireInteraction: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data?.url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(windowClients => {
          // If a window is already open, focus it
          for (const client of windowClients) {
            if (client.url === event.notification.data.url && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise open a new window
          return clients.openWindow(event.notification.data.url);
        })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages());
  } else if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  } else if (event.tag === 'sync-analytics') {
    event.waitUntil(syncPendingAnalytics());
  }
});

// Sync pending messages
async function syncPendingMessages() {
  const messages = await getPendingItems(STORES.messages);
  return Promise.all(
    messages.map(message =>
      fetch(message.url, {
        method: message.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message.body)
      })
    )
  );
}

// Sync pending orders
async function syncPendingOrders() {
  const orders = await getPendingItems(STORES.orders);
  return Promise.all(
    orders.map(order =>
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      })
    )
  );
}

// Sync pending analytics
async function syncPendingAnalytics() {
  const analytics = await getPendingItems(STORES.analytics);
  return Promise.all(
    analytics.map(event =>
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
    )
  );
}
