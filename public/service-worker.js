const CACHE_VERSION = 1;
const CACHE_NAME = 'offline-cache-v' + CACHE_VERSION;
const CACHE_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

const URLS_TO_CACHE = [
    '/',
    '/offline',
    '/offline2',
    // Add other URLs you want to cache
];


const ROUTES_TO_UPDATE = ['/update'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return Promise.all(
                    URLS_TO_CACHE.map(url => {
                        return fetch(url).then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to fetch ' + url);
                            }
                            return cache.put(url, new Response(response.body, {
                                headers: {
                                    ...response.headers,
                                    'Cache-Control': `max-age=${CACHE_DURATION}`,
                                    'X-Cached-At': Date.now().toString()
                                }
                            }));
                        });
                    })
                );
            })
            .then(() => self.skipWaiting())
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
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (ROUTES_TO_UPDATE.some(route => event.request.url.includes(route))) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the new response
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, new Response(clonedResponse.body, {
                            headers: {
                                ...clonedResponse.headers,
                                'Cache-Control': `max-age=${CACHE_DURATION}`,
                                'X-Cached-At': Date.now().toString()
                            }
                        }));
                    });
                    return response;
                })
                .catch(() => {
                    // If fetch fails, try to return from cache
                    return caches.match(event.request);
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    // Check if the cached response has expired
                    const cachedAt = response.headers.get('X-Cached-At');
                    const ageInSeconds = (Date.now() - parseInt(cachedAt)) / 1000;
                    if (ageInSeconds < CACHE_DURATION) {
                        return response; // Return cached version if not expired
                    }
                }

                // Fetch from network if cache miss or expired
                return fetch(event.request).then(networkResponse => {
                    // Cache the new response
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, new Response(clonedResponse.body, {
                            headers: {
                                ...clonedResponse.headers,
                                'Cache-Control': `max-age=${CACHE_DURATION}`,
                                'X-Cached-At': Date.now().toString()
                            }
                        }));
                    });
                    return networkResponse;
                }).catch(() => {
                    // If both cache and network fail, return a basic error response
                    return new Response('Network error occurred', {
                        status: 408,
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
            })
        );
    }
});

// Add a message event listener to handle cache updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_ROUTES_CACHE') {
        event.waitUntil(
            Promise.all(ROUTES_TO_UPDATE.map(route =>
                fetch(route)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch ' + route);
                        }
                        return caches.open(CACHE_NAME).then(cache => {
                            return cache.put(route, new Response(response.body, {
                                headers: {
                                    ...response.headers,
                                    'Cache-Control': `max-age=${CACHE_DURATION}`,
                                    'X-Cached-At': Date.now().toString()
                                }
                            }));
                        });
                    })
                    .then(() => {
                        console.log('Cache updated for ' + route);
                    })
                    .catch(error => {
                        console.error('Failed to update cache for ' + route + ':', error);
                    })
            ))
        );
    }
});