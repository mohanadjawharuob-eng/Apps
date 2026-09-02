/* Offline shell for Bustan. Scope: /Apps/garden/

   Cache-first, like its four siblings. The one difference is that this app
   also talks to a weather API: those requests must never be served from cache
   (a stale forecast is worse than none) and never cached either. The app keeps
   its own copy of the last good forecast in storage, which is what makes it
   work offline. */
var CACHE = 'pwa-garden-v4';
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

  var isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;

  // The app itself is network-first: cache-first on the HTML meant a shipped
  // change could sit unseen behind a stale copy for days, which is exactly
  // what happened. Online you always get the current app; offline you get the
  // last good one. Everything else stays cache-first, because it is small,
  // unchanging and wanted instantly.
  var isDoc = req.mode === 'navigate' ||
              (req.headers.get('accept') || '').indexOf('text/html') > -1;

  if (isDoc) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
