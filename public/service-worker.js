const CACHE_VERSION = 1;
const CACHE_NAME = 'offline-cache-v' + CACHE_VERSION;

const URLS_TO_CACHE = [
    '/',
    '/offline',
    '/offline2',
    // Add other URLs you want to cache
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
            .then(() => (self).skipWaiting())
);
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => (self).clients.claim())
);
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // If a cache is hit, return the cached version
                }
                return fetch(event.request); // Otherwise, fetch from network
            })
            .catch(() => {
                // If both cache and network fail, return a basic error response
                return new Response('Network error occurred', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
    );
});