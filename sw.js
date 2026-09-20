const CACHE_NAME = 'forest-shield-v4.1';
const PRECACHE = ['./','./index.html','./manifest.json','./assets/icon-192.png','./assets/icon-512.png'];
const RUNTIME = /unpkg\.com|gstatic\.com|openstreetmap\.org/;

self.addEventListener('install', e => { self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE).catch(()=>{}))); });

self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ns =>
  Promise.all(ns.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n)))).then(()=>self.clients.claim())); });

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // قاعدة البيانات وOSRM وخرائط جوجل: شبكة مباشرة دون تخزين
  if (u.hostname.includes('firestore') || u.hostname.includes('osrm') ||
      u.hostname.includes('googleapis.com') && !u.hostname.includes('gstatic')) return;
  if (u.origin === location.origin || RUNTIME.test(u.hostname)) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        if (res.ok) { const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => caches.match('./index.html')))
    );
  }
});