

importScripts('script1.js');
self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
      case 'start':
        self.postMessage('work started: ' + data.msg);
        break;
      case 'stop':
        self.postMessage('work stopped: ' + data.msg);
        self.close(); // Terminates the work.
        break;
      default:
        self.postMessage('Unknown command: ' + data);
    };
  }, false);