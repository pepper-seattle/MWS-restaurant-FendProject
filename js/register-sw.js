// If possible, register service worker
if(navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js')
    .then(function(register) {
      console.log('Service worker has been registered.');
    })
    .catch((error) => {
      console.log('Could not register service worker.');
    });
}

