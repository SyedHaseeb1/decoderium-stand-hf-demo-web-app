// Minimal service worker: lets the browser treat the app as installable.
// Requests always go to the network; nothing is cached yet.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => event.respondWith(fetch(event.request)));
