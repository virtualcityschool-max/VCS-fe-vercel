/* Virtual City School app — service worker.
 *
 * Security first: only this site's own static files are cached. API calls go
 * to another origin (the Django backend) and are never touched, so no one's
 * data is ever stored in the shared cache. Pages always come from the network
 * (they change on every deploy); with no network the app shows /offline.html.
 *
 * Bump VERSION when this file's caching rules change.
 */
const VERSION = "v1";
const STATIC = `vcs-static-${VERSION}`;
const ASSETS = `vcs-assets-${VERSION}`;
const PRECACHE = [
  "/offline.html",
  "/app-icons/icon-192.png",
  "/app-icons/icon-512.png",
  "/app-icons/apple-touch-icon.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)));
  // No skipWaiting here: the page shows "New version available" and the
  // user chooses when to refresh (never in the middle of a class or a form).
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC, ASSETS]);
      for (const key of await caches.keys()) {
        if (key.startsWith("vcs-") && !keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

const isHashedAsset = (p) => p.startsWith("/assets/") && /-[A-Za-z0-9_-]{6,}\.(js|css)$/.test(p);
const isStaticFile = (p) =>
  p.startsWith("/fonts/") || p.startsWith("/app-icons/") ||
  /^\/(assets|images)\/.*\.(png|jpe?g|webp|svg|gif|avif|ico|woff2?)$/.test(p);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API, Google, Meet: browser as normal

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(async () => (await caches.match("/offline.html")) || Response.error()),
    );
    return;
  }

  // Build files have their content hash in the name: safe to keep.
  if (isHashedAsset(url.pathname)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Fonts, icons, images: show the saved copy, refresh it in the background.
  if (isStaticFile(url.pathname)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        // Any cache: the app icons are saved at install time in STATIC.
        const hit = await caches.match(req);
        const fresh = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit || Response.error());
        return hit || fresh;
      }),
    );
  }
  // Everything else (sitemap, robots, JSON…): network as normal.
});

/* ---- Class reminders (web push) ---- */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data && event.data.text() };
  }
  const title = data.title || "Virtual City School";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/app-icons/icon-192.png",
      badge: "/app-icons/icon-192.png",
      tag: data.tag || "vcs-class",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const w of wins) {
        if (w.url.startsWith(self.location.origin)) {
          await w.focus();
          if ("navigate" in w) await w.navigate(target).catch(() => {});
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
