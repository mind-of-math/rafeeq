// دروسي التفاعلية — يحفظ الدروس على الجهاز لتعمل بدون إنترنت (العرض فقط)
const CACHE = "durus-v7";
const CORE = ["./", "./index.html", "./lessons.json", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.hostname.endsWith("supabase.co")) return;            // البيانات المباشرة دائمًا من الإنترنت
  const sameOrigin = u.origin === location.origin;
  const isAsset = /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(u.hostname);
  if (!sameOrigin && !isAsset) return;
  // network first for our pages (fresh lessons), fall back to cache offline
  e.respondWith(fetch(e.request).then((r) => {
    if (r && (r.ok || r.type === "opaque")) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((m) => m || caches.match("./index.html"))));
});
