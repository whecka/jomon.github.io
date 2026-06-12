/* Jomon service worker — network-first for same-origin GETs, cache fallback for
   offline. Skips cross-origin (fonts CDN, Anthropic API) and non-GET (feedback
   POST) so they always hit the network. */
var CACHE = 'jomon-v1';
var ASSETS = [
  './', './index.html', './css/styles.css',
  './js/parse.js', './js/store.js', './js/scripture.js', './js/flashcards.js',
  './js/phrasebook.js', './js/today.js', './js/feedback.js', './js/settings.js',
  './js/generate.js', './js/app.js',
  './data/scriptures.js', './data/decks.js', './data/placement.js', './data/lessons.js',
  './manifest.webmanifest', './icon.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (resp) {
      var copy = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
