// Cache only this app's public shell. Never cache room traffic or case notes.
const PREFIX = "relaydesk-static:" + self.registration.scope + ":";
const CACHE = PREFIX + "v6";
const FILES = [
  "./index.html",
  "./css/main.css?v=4",
  "./js/app.js?v=6",
  "./js/ringer.js?v=2",
  "./js/network-config.js?v=6",
  "./js/network.js?v=6",
  "./js/room-setup.js?v=6",
  "./js/p2p.js?v=6",
  "./js/storage.js?v=1",
  "./js/reset.js?v=1",
  "./vendor/peerjs.min.js",
  "./manifest.json",
  "./assets/fonts/source-sans-3-latin.woff2",
  "./assets/headset.jpg",
  "./assets/icons.svg",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  ...["HLC", "NET", "RTL", "BNK", "TRV", "TEL"].map(
    (code) => "./assets/desks/" + code + ".svg",
  ),
];
const assets = new Set(
  FILES.map((p) => new URL(p, self.registration.scope).href),
);
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const k of await caches.keys())
        if (k.startsWith(PREFIX) && k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.registration.scope))
    return;
  const nav = req.mode === "navigate";
  if (!nav && !assets.has(req.url)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const key = nav
        ? new URL("./index.html", self.registration.scope).href
        : req.url;
      try {
        const res = await fetch(req);
        if (res.ok) {
          try {
            await cache.put(key, res.clone());
          } catch {}
        }
        return res;
      } catch {
        return (await cache.match(key)) || Response.error();
      }
    })(),
  );
});
