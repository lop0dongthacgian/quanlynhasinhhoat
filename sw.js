// ═══════════════════════════════════════════════════════════════
// SERVICE WORKER — sw.js  v2.0.0
// ✏️  Đổi VERSION mỗi khi deploy bản mới để tự clear cache cũ
// ═══════════════════════════════════════════════════════════════

const VERSION    = 'v1.0.0';
const CACHE_NAME = `app-cache-${VERSION}`;

/** Các file tĩnh cache ngay lúc install */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-core.js',
  '/icon-1000.png',
  '/icon-512.png',
  '/icon-192.png',
];

/* ─── INSTALL — pre-cache tài nguyên tĩnh ─────────────────────── */
self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing…`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW] Pre-caching ${PRECACHE_ASSETS.length} assets`);
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

/* ─── ACTIVATE — xoá cache cũ ─────────────────────────────────── */
self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating…`);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log(`[SW] Deleting stale cache: ${name}`);
            return caches.delete(name);
          })
      ))
      .then(() => self.clients.claim())
  );
});

/* ─── MESSAGE — nhận lệnh SKIP_WAITING từ pwa-core.js ─────────── */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log(`[SW] SKIP_WAITING received — activating new SW`);
    self.skipWaiting();
  }
});

/* ─── FETCH — Network First → Cache Fallback ───────────────────── */
self.addEventListener('fetch', (event) => {
  // Bỏ qua non-GET và non-http(s)
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // Bỏ qua chrome-extension, analytics…
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return; // tuỳ chỉnh nếu có API riêng

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache lại nếu response hợp lệ
        if (networkResponse.ok) {
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, cloned));
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline → trả từ cache
        return caches.match(event.request)
          .then((cached) => {
            if (cached) return cached;
            // Fallback: document request → trả index.html
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            // Không có gì → undefined (browser hiển thị offline mặc định)
          });
      })
  );
});
