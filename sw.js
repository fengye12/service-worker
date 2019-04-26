var CACHE_NAME = 'main_v1.0.7';

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

// 安装
self.addEventListener('install', function (event) {
  console.log('install')
  //  waitUntil()方法接收一个promise对象，直到这个promise对象成功resolve之后，才会继续运行sw.js。
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      //caches是一个CacheStorage对象，使用open()方法打开一个缓存，缓存通过名称进行区分。
      console.log('installed And cached')
      // 获得cache实例之后，调用addAll()方法缓存文件。
      return cache.addAll(assetsToCache);
    }).then(function (error) {
      // 触发 activate 事件，告知 Service Worker 立即开始工作
      return self.skipWaiting();
    })
  );
});
// skipWaiting() 函数强制等待中的 Service Worker 被激活，如果配合 self.clients.claim() 一起使用，可以确保底层 Service Worker 的更新立即生效

self.addEventListener('activate', function (event) {
  console.log('activate')
  var mainCache = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      console.log("cacheNames", cacheNames)
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (mainCache.indexOf(cacheName) === -1) {
            console.info('SW: deleting ' + cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 允许一个激活的 service worker 将自己设置为其scope 内所有 clients 的 controller . 
  return self.clients.claim();
});


// 拦截fetch 第一次加载不会拦截，因为sw还没有激活
self.addEventListener('fetch', function (evt) {
  console.log("fetch");
  evt.respondWith(
    caches.match(evt.request).then(function (response) {
      if (response) {
        return response;
      }
      // 请求是一个流，只能使用一次，为了再次使用这里需要克隆
      var request = evt.request.clone();
      return fetch(request).then(function (response) {
        // 请求结果不是200，不缓存
        if (!response || !response.status == 200) {
          return response;
        }
        // 缓存图片等其他get请求
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          console.log("image cached")
          cache.put(evt.request, responseClone);
        });
        return response;
      });
    })
  )
}, function (err) {
  console.log("fetch err", err)
});


// 监听点击推送消息
self.addEventListener('notificationclick', event => {
  const data = event.notification.data;
  let promiseChain = Promise.resolve();
  if (!event.action) {
    // 没有点击在按钮上
    console.log('Notification click.');
    // data 中有跳转页面信息则安排跳转
    if (data && data.page) {
      promiseChain = clients.openWindow(data.page);
    }

    return;
  }

  event.waitUntil(promiseChain);
});

// 获取推送消息
self.addEventListener('push', function (event) {
  console.log('get push');
  var payload = {
    msg: event.data.text(),
    url: "http://www.baidu.com",
    icon: ""
  };
  var title = '测试通知！！';
  event.waitUntil(
    // 接收到通知后，显示
    self.registration.showNotification(title, {
      body: payload.msg,
      data: {
        page: payload.url,
      },
      icon: payload.icon
    })
  );
});

// 点击关闭通知后触发
self.addEventListener('notificationclose', event => {
  console.log('notification close');
});