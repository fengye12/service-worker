
  if ('serviceWorker' in navigator && navigator.onLine) {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ',    registration.scope);
    }).catch(function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });

  // var currentPath = window.location.pathname;
  // var cacheButton = document.querySelector('.offline-btn');
  // var imageArray = document.querySelectorAll('img');
  // // Event listener
  // if(cacheButton) {
  //   cacheButton.addEventListener('click', function(event) {
  //     event.preventDefault();
  //     // Build an array of the page-specific resources.
  //     var pageResources = [currentPath];
  //     for (i = 0; i < imageArray.length; i++) {
  //       pageResources.push(imageArray[i].src);
  //     }
  //     // Open the unique cache for this URL.
  //     caches.open('offline-' + currentPath).then(function(cache) {
  //       var updateCache = cache.addAll(pageResources);
  //       // Update UI to indicate success.
  //       updateCache.then(function() {
  //         console.log('Article is now available offline.');
  //         cacheButton.innerHTML = "页面html以及图片缓存成功了哦☺";
  //       });
  //       // Catch any errors and report.
  //       updateCache.catch(function (error) {
  //         console.log('Article could not be saved offline.');
  //         cacheButton.innerHTML = "缓存失败☹";
  //       });
  //     });
  //   });
  // }
}