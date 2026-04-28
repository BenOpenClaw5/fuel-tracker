/* FUEL service worker — offline app shell + network-first HTML */
const VERSION = "fuel-v1";
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

const SHELL_URLS = [
  "/",
  "/log",
  "/trends",
  "/settings",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(SHELL_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isNavigation(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" && request.headers.get("accept")?.includes("text/html"))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache /api — always go to network.
  if (url.pathname.startsWith("/api/")) return;

  if (isNavigation(request)) {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(request);
          const cache = await caches.open(RUNTIME);
          cache.put(request, net.clone());
          return net;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          const shell = await caches.match("/");
          if (shell) return shell;
          return new Response("offline", { status: 503 });
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        fetch(request)
          .then((res) =>
            caches.open(RUNTIME).then((c) => c.put(request, res.clone())),
          )
          .catch(() => undefined);
        return cached;
      }
      try {
        const res = await fetch(request);
        if (
          res.ok &&
          (url.pathname.startsWith("/_next/") ||
            url.pathname.startsWith("/icon") ||
            url.pathname.endsWith(".png") ||
            url.pathname.endsWith(".svg"))
        ) {
          const cache = await caches.open(RUNTIME);
          cache.put(request, res.clone());
        }
        return res;
      } catch {
        return new Response("offline", { status: 503 });
      }
    })(),
  );
});
