const CACHE_NAME = 'dictum-limpieza-v1.2';
const urlsToCache = [
  '/',
  '/index.html',
  'logo-favicon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalar Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar Service Worker y limpiar cachés viejas
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Devuelve la respuesta en caché o busca en la red
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(function(response) {
          // Verifica si la respuesta es válida
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona la respuesta para guardarla en caché
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(function() {
        // Fallback para cuando no hay conexión
        return new Response('Estás navegando sin conexión. Por favor, revisa tu conexión a internet.');
      })
  );
});
