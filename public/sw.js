/* Service worker — offline support via stale-while-revalidate for static
 * assets. API requests are always network (never cached). */
const CACHE = "ai-translator-v1";
const CORE = [
  "/", "/index.html", "/styles.css", "/app.js", "/manifest.webmanifest",
  "/favicon.svg", "/icon-maskable.svg",
  "/js/dom.js", "/js/state.js", "/js/ui.js", "/js/theme.js", "/js/scrollspy.js",
  "/js/input.js", "/js/api.js", "/js/markdown.js", "/js/flags.js", "/js/icons.js",
  "/js/searchableSelect.js", "/js/translate.js",
  "/js/languages.js", "/js/tools.js", "/js/chat.js", "/js/assistant.js",
  "/js/history.js", "/js/pwa.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.pathname.startsWith("/api/")) return;

  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok && url.origin === self.location.origin) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      e.waitUntil(network);
      return cached || (await network) || Response.error();
    })()
  );
});
