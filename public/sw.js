const CACHE_NAME = "fcda-shell-v2";
const APP_SHELL = ["/", "/manifest.json"];
const PUBLIC_ASSETS = /^\/(?:manifest\.json|pwa-(?:192|512)\.svg)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("fcda-shell-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/").then((response) => {
          if (!response) throw new Error("Offline app shell is not cached");
          return response;
        }),
      ),
    );
    return;
  }

  if (!url.pathname.startsWith("/assets/") && !PUBLIC_ASSETS.test(url.pathname)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) event.waitUntil(cache.put(request, response.clone()));
          return response;
        });
      }),
    ),
  );
});
