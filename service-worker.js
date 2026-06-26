const CACHE = 'hablakids-v3';
const PRECACHE = [
  '/hablakids/',
  '/hablakids/index.html',
  '/hablakids/css/reset.css',
  '/hablakids/css/variables.css',
  '/hablakids/css/global.css',
  '/hablakids/css/home.css',
  '/hablakids/css/game.css',
  '/hablakids/css/rewards.css',
  '/hablakids/css/parent-panel.css',
  '/hablakids/js/sounds.js',
  '/hablakids/js/store.js',
  '/hablakids/js/speech.js',
  '/hablakids/js/audio-processor.js',
  '/hablakids/js/app.js',
  '/hablakids/js/levels/level0.js',
  '/hablakids/js/levels/level1.js',
  '/hablakids/js/levels/level2.js',
  '/hablakids/js/levels/level3.js',
  '/hablakids/js/levels/level4.js',
  '/hablakids/js/levels/level5.js',
  '/hablakids/js/levels/expert.js',
  '/hablakids/js/games/fonetica.js',
  '/hablakids/js/games/vocabulario.js',
  '/hablakids/js/games/historia.js',
  '/hablakids/js/games/ritmo.js',
  '/hablakids/js/games/espejo.js',
  '/hablakids/data/rewards.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(PRECACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      return fetch(e.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => {
            try { cache.put(e.request, clone); } catch (_) {}
          });
        }
        return response;
      }).catch(() => {
        return caches.match('/hablakids/index.html');
      });
    })
  );
});
