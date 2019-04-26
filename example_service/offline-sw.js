// 注册 serviceWorker
var registe=null;
function registerServiceWorker () {
  return navigator.serviceWorker
    .register('/sw.js')
    .then(registration => {
      alert('success registe serviceworker');
      registe=registration;
      return registration;
    })
    .catch(err => console.error('Unable to register service worker.', err));
}

// 注册后显示通知
function execute () {
  registerServiceWorker().then(registration => {
    // 延缓一下，可能sw还没激活
    setTimeout(function () {
      registration.showNotification && registration.showNotification('来自coral的消息推送了');
    }, 1000)
    update();
  });
}

window.addEventListener('load', function () {
  // 测试兼容性
  // 支持 serviceWorker
  if (!('serviceWorker' in navigator)) {
    alert('no serviceWorker');
    return;
  }
  // 支持 push API
  if (!('PushManager' in window)) {
    alert('no PushManager');
    return;
  }

  // 获取通知权限
  let promiseChain = new Promise((resolve, reject) => {
    // 允许通知提示
    return Notification.requestPermission(result => resolve(result));
  }).then(result => {
    if (result === 'granted') {
      // 有权限就直接执行，弹出通知
      execute();
    } else {
      alert('no permission');
    }
  });
});

function update () {
  $('body').on('click', '#btnUpdate', function () {
    registe.update().then(() => alert('update'));
  })
}


$('body').on('click', '#btn', function () {
  if (savedPrompt) {
    // 异步触发横幅显示，弹出选择框，代替浏览器默认动作
    savedPrompt.prompt();
    // 接收选择结果
    savedPrompt.userChoice.then(result => {
      console.log(result);
    });
  }
})
