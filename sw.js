// Service worker de Nido de recetas: funciona sin conexión y se actualiza solo.
const V = 'nido-v1';
const SHELL = ['./', 'index.html', 'recipes.json', 'manifest.webmanifest', 'img/logo.png', 'img/mercadona-logo.png', 'icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const fresh = req.mode === 'navigate' || /\.(json|html)$/.test(url.pathname) || url.pathname.endsWith('/');
  if (fresh) { // red primero (para ver siempre la última versión), caché si no hay conexión
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(V).then(k => k.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  } else { // imágenes, iconos y fuentes: caché primero
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { if (n.ok || n.type === 'opaque') { const c = n.clone(); caches.open(V).then(k => k.put(req, c)); } return n; })));
  }
});
