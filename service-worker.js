// SociallyFounded Service Worker
const CACHE_NAME = 'sf-cache-v1';

// Files to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/how-it-works.html',
  '/thanks.html',
  '/styles.css',
  '/fresh-styles.css',
  '/script.js',
  '/favicon.svg',
  '/favicon.ico',
  '/sf-logo.png'
];

// Install event - caches assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting for previous service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Claim clients immediately 
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Network-first strategy for HTML pages (except the homepage)
  if (event.request.mode === 'navigate' && 
      event.request.url !== self.location.origin + '/' && 
      event.request.url !== self.location.origin + '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before caching it
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If the specific page isn't cached, return the index page
              return caches.match('/index.html');
            });
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response before caching it
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('[Service Worker] Fetch failed:', error);
            
            // For image requests, return a placeholder
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
              return caches.match('/assets/images/placeholder.svg');
            }
            
            // Let the browser handle other failed requests
            throw error;
          });
      })
  );
});

// Push Notification event
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: 'pwa/icons/icon-192x192.png',
    badge: 'pwa/icons/badge-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        const url = event.notification.data.url;
        
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no open window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'check-in-sync') {
    event.waitUntil(syncCheckIns());
  }
});

// Helper function to sync check-ins
async function syncCheckIns() {
  try {
    // Get stored check-ins from IndexedDB (implementation would be needed)
    const pendingCheckIns = await getPendingCheckIns();
    
    // Process each pending check-in
    for (const checkIn of pendingCheckIns) {
      await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkIn)
      });
      
      // Remove from pending queue after successful sync
      await removePendingCheckIn(checkIn.id);
    }
    
    // Notify user that check-ins are synced
    if (pendingCheckIns.length > 0) {
      self.registration.showNotification('SociallyFounded', {
        body: `${pendingCheckIns.length} check-ins have been synchronized!`,
        icon: 'pwa/icons/icon-192x192.png'
      });
    }
    
  } catch (error) {
    console.error('Sync failed:', error);
    // Sync will be retried automatically by the browser
  }
}

// Placeholder functions for IndexedDB operations
// These would need actual implementations in a real app
async function getPendingCheckIns() {
  // Placeholder for getting pending check-ins from IndexedDB
  return [];
}

async function removePendingCheckIn(id) {
  // Placeholder for removing a check-in from the pending queue
  console.log('Removed check-in with ID:', id);
}
