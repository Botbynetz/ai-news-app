// Minimal service worker for offline caching of core assets and runtime caching
const CACHE_NAME = 'gnews-core-v1';
const RUNTIME_CACHE = 'gnews-runtime-v1';

const CORE_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/next.svg',
  '/vercel.svg',
  '/globals.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME && k !== RUNTIME_CACHE ? caches.delete(k) : Promise.resolve())))
    )
  );
  self.clients.claim();
  // notify clients that a new service worker has activated
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED' }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Network-first for API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for navigation and static resources
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      // Put in runtime cache for future
      if (request.method === 'GET' && res && res.status === 200 && request.headers.get('accept')?.includes('text/html')) {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
      }
      return res;
    }).catch(() => caches.match('/')))
  );
});

// Listen for messages from the client (e.g., skip waiting)
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
