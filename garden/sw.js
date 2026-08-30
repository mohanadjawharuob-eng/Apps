/* Offline shell for Bustan. Scope: /Apps/garden/

   Cache-first, like its four siblings. The one difference is that this app
   also talks to a weather API: those requests must never be served from cache
   (a stale forecast is worse than none) and never cached either. The app keeps
   its own copy of the last good forecast in storage, which is what makes it
   work offline. */
var CACHE = 'pwa-garden-v3';
var PRECACHE = [
  "./",
  "./sprites.js",
  "./icons.js",
  "./species.js",
  "./app.js",
  "./ui.js",
  "./manifest.webmanifest",
  "../icons/garden-192.png",
  "../icons/garden-512.png",
  "../icons/garden-512-maskable.png"
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      // addAll is all-or-nothing; cache individually so one bad entry
      // can't stop the whole app from installing
      .then(function (c) { return Promise.all(PRECACHE.map(function (u) {
        return c.add(u).catch(function () {});
      })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          // Only this app's own older caches. The sibling apps share an origin,
          // and so do the old /deep/apps/ installs, so a blanket delete would
          // wipe someone else's offline copy.
          if (k === CACHE) return null;
          return k.indexOf('pwa-garden-') === 0 ? caches.delete(k) : null;
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Never cache or serve a cached forecast - let it fail and let the app fall
  // back to the copy it already holds in storage.
  if (url.hostname.indexOf('open-meteo.com') > -1) return;

  // The pixel typeface lives on Google's CDN. Cache it once so the app still
  // looks like itself offline; if it never arrives the CSS falls back to a
  // monospace stack and nothing breaks.
  var isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;

  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
