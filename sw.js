const appName = "restaurant-reviews";
const staticCacheName = appName + "-v1.0";

const imgsCache = appName + "-images";

let allCaches = [
  staticCacheName,
  imgsCache
];

// Static asset caching
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(function(cache) {
        return cache.addAll([
          '/',
          '/restaurant.html',
          '/css/styles.css',
          '/js/dbhelper.js',
          '/js/main.js',
          '/js/register-sw.js',
          'data/restaurants.json'
        ]);
      })
  );
});

// Old static cache deletion on new service work activation
// Updating the staticCacheName version will fire this
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith(appName) &&
              !allCaches.includes(cacheName);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
  );
});

// Respond to fetch requests with cached files (just one image size returned to keep cache small)
// Then request response from server
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return; 
    }
    if (requestUrl.pathname.startsWith('/img')) {
      event.respondWith(serveImage(event.request));
      return; // Done handling request, so exit early.
    }
  }
  
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

function serveImage(request) {
  let imgStorageUrl = request.url;

  imgStorageUrl = imgStorageUrl.replace(/-small\.\w{3}|-large\.\w{3}/i, '')

  return caches.open(imgsCache)
    .then(function(cache) {
      return cache.match(imgStorageUrl)
        .then(function(response) {
          return response || fetch(request)
            .then(function(networkResponse) {
              cache.put(imgStorageUrl, networkResponse.clone());
              return networkResponse;
            });
        });
    });
}