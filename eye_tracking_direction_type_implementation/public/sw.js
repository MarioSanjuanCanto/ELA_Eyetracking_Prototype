// Service Worker to cache WebGazer models and libraries
const CACHE_NAME = 'webgazer-cache-v1';
const MODEL_URLS = [
    'tfhub.dev',
    'cdn.jsdelivr.net',
    'storage.googleapis.com',
    'models.s3.amazonaws.com'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Check if the request is for a model or library we want to cache
    const url = new URL(event.request.url);
    const isModelRequest = MODEL_URLS.some(domain => url.hostname.includes(domain));

    if (isModelRequest) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    // Return cached response if found
                    if (response) {
                        return response;
                    }

                    // Otherwise fetch from network, cache it, and return it
                    return fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    }
});
