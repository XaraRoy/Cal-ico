// service.js
self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});


const showLocalNotification = (title, body, swRegistration) => {
  const options = {
      body,
      // here you can add more properties like icon, image, vibrate, etc.
  };
  swRegistration.showNotification(title, options);
}


self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // Handle the notification click event here, e.g., open a specific URL.
    clients.openWindow('https://purrfect_planner-1-z2375828.deta.app/');
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  const pushData = event.data.text();
  console.log(`[Service Worker] Push received this data - "${pushData}"`);
  let data, title, body;
  try {
    data = JSON.parse(pushData);
    title = data.title;
    body = data.body;
  } catch(e) {
    title = "Untitled";
    body = pushData;
  }
  const options = {
    body: body
  };
  console.log(title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
  showLocalNotification(body, title, self.registration)
});

  