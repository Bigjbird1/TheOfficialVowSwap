// Service Worker for handling push notifications
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/notification-icon.png'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'v1') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/notification-icon.png',
      badge: '/notification-icon.png',
      data: data.data,
      actions: data.actions,
      vibrate: [200, 100, 200],
      tag: data.tag,
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Handle background sync for offline message sending
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-message') {
    event.waitUntil(
      // Get pending messages from IndexedDB and send them
      getPendingMessages().then((messages) => {
        return Promise.all(
          messages.map((message) =>
            fetch('/api/seller/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(message),
            })
          )
        );
      })
    );
  }
});

// Helper function to get pending messages from IndexedDB
async function getPendingMessages() {
  // Implementation would depend on your IndexedDB structure
  return [];
}
