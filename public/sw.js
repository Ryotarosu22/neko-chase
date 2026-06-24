// シンプルなサービスワーカー：アプリシェルをキャッシュしてオフライン起動を可能にする。
// ビルドのたびにファイル名（ハッシュ）が変わるため、ナビゲーションはネット優先・
// 失敗時キャッシュ、静的アセットはキャッシュ優先で扱う。

const CACHE = 'neko-chase-v1';
const CORE = ['/', '/index.html', '/icon-512.png', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // ページ遷移：ネット優先、失敗したらキャッシュのトップページ
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // それ以外（JS/CSS/画像）：キャッシュ優先、無ければ取得して保存
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached)
    )
  );
});
