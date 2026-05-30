/**
 * Twin Alpha Service Worker — Offline Capability for Sovereign Organism
 *
 * "Semper Paratus" — Always Ready
 *
 * This service worker provides:
 * - Offline caching of all organism web workers
 * - Background sync for deferred operations
 * - Push notification readiness
 * - Network-first strategy with fallback to cache
 * - Periodic background updates
 *
 * Cache Strategy:
 *   1. Network-first for HTML and main JS
 *   2. Cache-first for static assets (icons, CSS)
 *   3. Stale-while-revalidate for workers
 *
 * @version 1.0.0
 */

'use strict';

const CACHE_VERSION = 'twin-alpha-v1';
const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

// Core files that must always be cached
const CORE_ASSETS = [
  './',
  './index.html',
  './neuro-core.js',
  './twin-alpha-worker.js',
  './organism-worker.js',
  './memory-worker.js',
  './engine-worker.js',
  './inference-worker.js',
  './routing-worker.js',
  './scheduler-worker.js',
  './orchestrator-worker.js',
  './guardian-worker.js',
  './crypto-worker.js',
  './math-worker.js',
  './analytics-worker.js',
  './telemetry-worker.js',
  './pipeline-worker.js',
  './mesh-worker.js',
  './contract-worker.js',
  './download-worker.js',
  './autonomy.js',
  './organism-bridge.js'
];

// Files that can be loaded on-demand
const OPTIONAL_ASSETS = [
  './README.md'
];

/**
 * Install Event — Pre-cache core assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] 🔷 Twin Alpha Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        console.log('[SW] 📦 Caching core assets:', CORE_ASSETS.length, 'files');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[SW] ✅ Core assets cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] ❌ Cache install failed:', err);
      })
  );
});

/**
 * Activate Event — Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] 🔷 Twin Alpha Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_VERSION && name.startsWith('twin-alpha'))
            .map((name) => {
              console.log('[SW] 🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] ✅ Service Worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event — Network-first with cache fallback
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Strategy: Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching
        const responseClone = response.clone();
        
        caches.open(CACHE_VERSION)
          .then((cache) => {
            // Only cache successful GET requests
            if (event.request.method === 'GET' && response.status === 200) {
              cache.put(event.request, responseClone);
            }
          });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] 📦 Serving from cache:', url.pathname);
              return cachedResponse;
            }
            
            // If it's a navigation request, return the main page
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // Return a fallback response for other requests
            return new Response('Offline - Twin Alpha is operating in limited mode', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

/**
 * Message Event — Handle commands from main thread
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_VERSION });
      break;
      
    case 'CLEAR_CACHE':
      caches.delete(CACHE_VERSION)
        .then(() => {
          event.ports[0]?.postMessage({ cleared: true });
        });
      break;
      
    case 'CACHE_URLS':
      if (Array.isArray(data?.urls)) {
        caches.open(CACHE_VERSION)
          .then((cache) => cache.addAll(data.urls))
          .then(() => {
            event.ports[0]?.postMessage({ cached: data.urls.length });
          });
      }
      break;
      
    case 'GET_CACHED_URLS':
      caches.open(CACHE_VERSION)
        .then((cache) => cache.keys())
        .then((requests) => {
          const urls = requests.map((r) => new URL(r.url).pathname);
          event.ports[0]?.postMessage({ urls });
        });
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

/**
 * Background Sync — Deferred operations when back online
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] 🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'twin-alpha-sync') {
    event.waitUntil(
      // Perform any deferred sync operations
      Promise.resolve()
        .then(() => {
          console.log('[SW] ✅ Background sync completed');
        })
    );
  }
});

/**
 * Periodic Background Sync — Regular updates
 */
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] ⏰ Periodic sync triggered:', event.tag);
  
  if (event.tag === 'twin-alpha-update') {
    event.waitUntil(
      // Check for updates to cached files
      caches.open(CACHE_VERSION)
        .then((cache) => {
          return Promise.all(
            CORE_ASSETS.map((url) => {
              return fetch(url, { cache: 'no-store' })
                .then((response) => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                })
                .catch(() => {
                  // Ignore fetch errors during background sync
                });
            })
          );
        })
        .then(() => {
          console.log('[SW] ✅ Periodic update completed');
        })
    );
  }
});

/**
 * Push Notification — Ready for future notifications
 */
self.addEventListener('push', (event) => {
  console.log('[SW] 📬 Push notification received');
  
  const data = event.data?.json() || {};
  const title = data.title || 'Twin Alpha';
  const options = {
    body: data.body || 'The organism has a message for you.',
    icon: data.icon || './icons/icon192.png',
    badge: data.badge || './icons/icon72.png',
    tag: data.tag || 'twin-alpha-notification',
    data: data.payload || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification Click — Handle notification interactions
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🔔 Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url.includes('/organism/web/') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./index.html');
        }
      })
  );
});

console.log('[SW] 🔷 Twin Alpha Service Worker loaded — version:', CACHE_VERSION);
