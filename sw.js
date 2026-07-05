/* CWA Strahan Recipes — service worker
   Bump CACHE_VERSION whenever index.html or the icons change. */
const CACHE_VERSION = "cwa-recipes-v7";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./install-gate.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/emblem.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  /* Recipe data (Google Sheets CSV) and fonts: straight to network.
     The app keeps its own localStorage copy of the recipe book,
     so offline recipes are already handled in index.html. */
  if (url.origin !== location.origin) return;

  /* Navigations: network-first so a new commit shows up on next load,
     falling back to the cached shell when offline. */
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  /* Everything else same-origin (icons, manifest, scripts): cache-first,
     refreshed quietly in the background. */
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const refresh = fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
