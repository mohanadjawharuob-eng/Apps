/* Offline shell for Mashghal. Scope: /Apps/mashghal/ */
var CACHE = 'pwa-mashghal-v63';
var PRECACHE = [
  "./",
  "../icons/mashghal-192.png",
  "../icons/mashghal-512.png",
  "../icons/mashghal-512-maskable.png",
  "./manifest.webmanifest"
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      // Individually, because addAll is all-or-nothing and one bad entry would
      // stop the whole app installing. And with cache:'reload', because
      // cache.add() goes through the HTTP cache — GitHub Pages serves HTML with
      // a ten-minute max-age, so the new cache was being seeded with the OLD
      // page. That is half of why a fix took three launches to appear.
      .then(function (c) { return Promise.all(PRECACHE.map(function (u) {
        return fetch(new Request(u, { cache: 'reload' }))
          .then(function (res) { return res && res.ok ? c.put(u, res) : null; })
          .catch(function () {});
      })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          // Only tidy up this app's own older caches. The sibling apps share an
          // origin, so a blanket delete would wipe their offline copies. Mashghal
          // has never lived under /deep/apps/, so there is no legacy prefix here.
          if (k === CACHE) return null;
          return k.indexOf('pwa-mashghal-') === 0 ? caches.delete(k) : null;
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function isDoc(req) {
  return req.mode === 'navigate' ||
         req.destination === 'document' ||
         (req.headers.get('accept') || '').indexOf('text/html') > -1;
}

/* The page is the one thing that changes between deploys, so serving it
   cache-first pinned the old app on the phone: it rendered the cached copy,
   installed the new worker behind it, claimed the client without reloading,
   and only showed the change on the NEXT launch. Two launches minimum, three
   if the HTTP cache was also stale.

   So the document is network-first with a short timeout and a cache fallback —
   current whenever there is a connection, instant offline when there is not.
   Everything else stays cache-first with a background refresh, because icons
   and the manifest genuinely do not change and should not wait on the network. */
var DOC_TIMEOUT = 2500;

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isDoc(req)) {
    e.respondWith(
      new Promise(function (resolve) {
        var settled = false;
        var fallback = setTimeout(function () {
          if (settled) return;
          caches.match(req).then(function (hit) {
            if (!settled && hit) { settled = true; resolve(hit); }
          });
        }, DOC_TIMEOUT);

        fetch(req).then(function (res) {
          clearTimeout(fallback);
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          if (!settled) { settled = true; resolve(res); }
        }).catch(function () {
          clearTimeout(fallback);
          caches.match(req).then(function (hit) {
            if (settled) return;
            settled = true;
            resolve(hit || new Response(
              '<!doctype html><meta charset=utf-8><title>Mashghal</title>' +
              '<body style="margin:0;background:#1b1e24;color:#e9e5dd;font:15px system-ui;' +
              'display:grid;place-items:center;height:100vh"><p>Offline, and this device has no copy yet.</p>',
              { headers: { 'Content-Type': 'text/html' } }
            ));
          });
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
