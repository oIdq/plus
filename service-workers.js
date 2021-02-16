const version = "0.0.2"
const cacheName = `plus-${version}`;
const filesToCache = [
    "/",
    "/main.js",
    "/service-workers.js",
    "/style.css",
    "/icon-256x256.png",
    "/icon-512x512.png",
    "/manifest.json",
    "/js/core.js",
    "/service-workers.js",
    "/assets/hamburger.svg",
    "/assets/minus.svg",
    "/assets/plus.svg",
    "/assets/icon.svg"
];

self.addEventListener("install", e => {
    console.log("[ServiceWorker] Install");
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log("[ServiceWorker] Caching app shell");
            return cache.addAll(filesToCache).catch((e) => console.log(e));
        })
    );
});

self.addEventListener("activate", event => {
    caches.keys().then(keyList => {
        return Promise.all(
            keyList.map(key => {
                if (key !== cacheName) {
                    console.log(`[ServiceWorker] - Removing cache "${key}"`);
                    return caches.delete(key);
                }
            })
        );
    });
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log(`[ServiceWorker] - Cache hit for ${event.request}`)
                return response
            } else {
                return fetch(event.request)
            }
        }).catch((e) => {
            console.log(e)
        })
    );
});