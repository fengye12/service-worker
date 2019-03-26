### service worker

是一段脚本，与web worker一样，也是在后台运行。作为一个独立的线程，运行环境与普通脚本不同，所以不能直接参与web交互行为。native app可以做到离线使用、消息推送、后台自动更新，service worker的出现是正是为了使得web app也可以具有类似的能力。  

> service worker可以

- 1.后台消息传递
- 2.网络代理，转发请求，伪造响应

- 3.离线缓存

- 4.消息推送

- 5 .  … …

> 注意事项

- 1.service worker运行在它们自己的完全独立异步的全局上下文中，也就是说它们有自己的容器。

- .service worker没有直接操作DOM的权限，但是可以通过postMessage方法来与Web页面通信，让页面操作DOM。

- .service worker是一个可编程的网络代理，允许开发者控制页面上处理的网络请求。

- .浏览器可能随时回收service worker，在不被使用的时候，它会自己终止，而当它再次被用到的时候，会被重新激活。
- 安全考虑，只能在https下使用，当然localhost除外

> Service Worker生命周期

service worker拥有一个完全独立于Web页面的生命周期  

![生命周期](https://img.alicdn.com/imgextra/i3/1641711921/O1CN01jq0pGc1Q3rLp3O2e3_!!1641711921.png)  

1. 注册service worker，在网页上生效
2. 安装成功，激活 或者 安装失败（下次加载会尝试重新安装）
3. 激活后，在sw的作用域下作用所有的页面，首次控制sw不会生效，下次加载页面才会生效。
4. sw作用页面后，处理fetch（网络请求）和message（页面消息）事件 或者 被终止（节省内存）。

> Service Worker支持使用

[service worker support](https://jakearchibald.github.io/isserviceworkerready/)  

polyfill
使用ServiceWorker cache polyfill让旧版本浏览器支持 ServiceWorker cache API，

> 调试

在调试的时候可以用于unregister、stop、start等操作

`chrome application`

![调试](https://img.alicdn.com/imgextra/i2/1641711921/O1CN016pbLnY1Q3rLrFNwGc_!!1641711921.png)

> 离线存储数据

对URL寻址资源，使用[Cache API](https://davidwalsh.name/cache)。对其他数据，使用IndexedDB。

> 离线缓存例子（效果）

目录结构

![目录结构](https://img.alicdn.com/imgextra/i3/1641711921/O1CN01OL5wOt1Q3rLsSSS72_!!1641711921.png)

本地起个服务(`http-server`)直接访问`test.html`

<!--点击`离线缓`存按钮-->
<!--![image](https://img.alicdn.com/imgextra/i1/1641711921/O1CN01HAHGKV1Q3rLr1Semn_!!1641711921.png)-->

刷新页面成功后控制台出现`installed And cached`说明页面缓存成功了。

再次刷新提示`image cached`说明图片资源缓存成功了

控制台查看状态  
`application->service workers`插件创建的service。  `application->Cache Storage`查看缓存情况

![image](https://img.alicdn.com/imgextra/i1/1641711921/O1CN01IyOdMk1Q3rLp72Ly2_!!1641711921.png)
![image](https://img.alicdn.com/imgextra/i2/1641711921/O1CN01pzGKWO1Q3rLsSgLJB_!!1641711921.png)  

断网  

![image](https://img.alicdn.com/imgextra/i3/1641711921/O1CN01AOpgRy1Q3rLr25zlG_!!1641711921.png)


刷新页面或者从其他页面返回，`页面依然存在`

> 离线缓存例子（原理）

#### 1.注册 service worker  
创建一个 JavaScript 文件（比如：sw.js）作为 service worker  
告诉浏览器注册这个JavaScript文件为service worker，检查service worker API是否可用，如果可用就注册service worker  

```
  if ('serviceWorker' in navigator && navigator.onLine) {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ',    registration.scope);
    }).catch(function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
    }
```
sw.js文件被放在这个域的根目录下，和网站同源。这个service work将会收到这个域下的所有fetch事件。 

如果将service worker文件注册为/example_service/sw.js，那么，service worker只能收到/example_service/路径下的fetch事件。 

#### 2.sw.js文件内实现缓存文件  

定义需要缓存的文件，然后在sw注册安装后使用cache Api将资源文件写入缓存。如果所有的文件都被缓存成功了，那么service worker就安装成功了。如果任何一个文件下载失败，那么安装步骤就会失败。


```
var CACHE_NAME = 'main_v1.0.6';

// Assesto catche
var assetsToCache = [
  '/example_service/test.html',
  '/example_service/extend.css',
  '/example_service/offline-sw.js',
  '/service.css',
  '/sw.js',
  'https://g.alicdn.com/sj/qnui/1.3.0/css/sui.min.css',
];

self.addEventListener('install', function(event) {
//  waitUntil()方法接收一个promise对象，直到这个promise对象成功resolve之后，才会继续运行sw.js。
  event.waitUntil(
   //caches是一个CacheStorage对象，使用open()方法打开一个缓存，缓存通过名称进行区分。

    caches.open(CACHE_NAME).then(function(cache) {
     // 获得cache实例之后，调用addAll()方法缓存文件。
        return cache.addAll(assetsToCache);
    }).then(function() {
        return self.skipWaiting();
    })
  );
});

```

#### 3.fetch拦截请求

上面只是缓存成功了，我们真正要取缓存中的文件是通过拦截fetch实现的。

```
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
});
```

通过监听fetch事件，service worker可以返回自己的响应。  

首先检缓存中是否已经缓存了这个请求，如果有，就直接返回响应，就减少了一次网络请求。否则由service workder发起请求，这时的service workder起到了一个中间代理的作用。

service worker请求的过程通过fetch api完成，得到response对象以后进行过滤，查看是否是图片文件，如果不是，就直接返回请求，不会缓存。


如果是图片，要先复制一份response，原因是request或者response对象属于stream，只能使用一次，之后一份存入缓存，另一份发送给页面。
这就是service worker的强大之处：拦截请求，伪造响应。fetch api在这里也起到了很大的作用。


#### 4.缓存版本管理

版本修改的时候会触发activate，将旧版本的缓存清理掉。

```
self.addEventListener('activate', function (event) {
  console.log('activate')
  var mainCache = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      console.log("cacheNames", cacheNames)
      return Promise.all(
        cacheNames.map(function (cacheName) {
         
          if (mainCache.indexOf(cacheName) === -1) {
           
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});
```



### Service Worker 库
- [offline-plugin](https://github.com/NekR/offline-plugin)  
- [sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox)  
- [sw-precache](https://github.com/GoogleChromeLabs/sw-precache) 

### 参考资料
- [渐进式 Web App 的离线存储](https://segmentfault.com/a/1190000006640450)

- [service worker初体验](http://www.alloyteam.com/2016/01/9274/)
- [Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
