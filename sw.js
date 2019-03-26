// var OFFLINE_PREFIX = 'offline-';
var CACHE_NAME = 'main_v1.0.2';

// Assesto catche
var assetsToCache = [
  '/example_service/test.html',
  '/example_service/extend.css',
  '/example_service/offline-sw.js',
  '/service.css',
  '/sw.js',
  'https://g.alicdn.com/sj/qnui/1.3.0/css/sui.min.css',
  // 'http://gtms04.alicdn.com/tps/i4/T17w5xFr4dXXXt9EcX-1200-800.jpg',
  // 'https://img.alicdn.com/imgextra/i3/1641711921/O1CN01qk7pju1Q3rLk3TKzU_!!1641711921.jpg'
];

self.addEventListener('install', function (event) {
  console.log('install')
  //  waitUntil()方法接收一个promise对象，直到这个promise对象成功resolve之后，才会继续运行sw.js。
  event.waitUntil(
    // Create cache with the name supplied above and
    // return a promise for it
    caches.open(CACHE_NAME).then(function (cache) {
      //caches是一个CacheStorage对象，使用open()方法打开一个缓存，缓存通过名称进行区分。

      // Important to `return` the promise here to have `skipWaiting()`
      // fire after the cache has been updated.
      console.log('installed And cached')
      // 获得cache实例之后，调用addAll()方法缓存文件。
      return cache.addAll(assetsToCache);
    }).then(function (error) {
      // `skipWaiting()` forces the waiting ServiceWorker to become the
      // active ServiceWorker, triggering the `onactivate` event.
      // Together with `Clients.claim()` this allows a worker to take effect
      // immediately in the client(s).
      // console.log('Pre-fetching failed:', error);
      return self.skipWaiting();
    })
  );
});

// Activate event
// Be sure to call self.clients.claim()
self.addEventListener('activate', function (event) {
  console.log('activate')
  var mainCache = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      console.log("cacheNames", cacheNames)
      return Promise.all(
        cacheNames.map(function (cacheName) {
          // Two conditions must be met to delete a cache:
          // 1. It must NOT be found in the main SW cache list.
          // 2. It must NOT contain our offline prefix.
          if (mainCache.indexOf(cacheName) === -1) {
            // When it doesn't match any condition, delete it.
            console.info('SW: deleting ' + cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // `claim()` sets this worker as the active worker for all clients that
  // match the workers scope and triggers an `oncontrollerchange` event for
  // the clients.
  // 允许一个激活的 service worker 将自己设置为其scope 内所有 clients 的 controller . 
  return self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
  console.log("fetch");
  evt.respondWith(
    caches.match(evt.request).then(function (response) {
      if (response) {
        return response;
      }
      var request = evt.request.clone();
      return fetch(request).then(function (response) {
        if (response && response.status == 200 && !response.headers.get('Content-type').match(/image/)) {
          return response;
        }
        // 缓存图片
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          console.log("image cached")
          cache.put(evt.request, responseClone);
        });
        return response;
      });
    })
  )
},function(err){
  console.log("fetch err",err)
});