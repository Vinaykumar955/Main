// sw.js - Service Worker for offline cache
const CACHE = 'codelens-ai-v1';
const ASSETS = [
  '/', '/index.html', '/css/app.css', '/js/app.js', 
  '/js/editor.js', '/js/api.js', '/js/parser.js', '/js/renderer.js',
  '/js/learner.js', '/js/glossary.js', '/js/storage.js', '/js/visualizer.js',
  '/js/ui.js', '/js/utils.js', '/favicon.svg', '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('openrouter.ai')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
