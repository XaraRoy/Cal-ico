// service.js


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
});





self.addEventListener('install', function(event) {

  console.log('Service Worker installing.');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');

  
  async function subscribeUser(publicKey) {
    console.log('attempting subscription')
    try {
        const subscription = await self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
        });
        
        // Send the subscription data to your server
        const response = await fetch('/setup/subscription', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });

        if (response.ok) {
          console.log('Subscription stored successfuly');
        } else {
          console.error('Failed to store subscription on the server');
        }

        
        await fetch(origin + '/send_push', {
            method: 'POST',
            body: JSON.stringify(subscription),
        });

        console.log('Subscription successful');


    } catch (error) {
        console.error('Subscription failed:', error);
    }
  }
  fetch('/node/')
  .then(response => {
      if (!response.ok) {
          throw new Error('Error populating the vapid keys');
      }
  })
  .then(() => {
      fetch('/setup/public_key')
      .then(response => {
          if (!response.ok) {
              throw new Error('Error Fetching the keys');
          }
          return response.json();
      })
      .then(publicKeyData => {
          console.log('public key grabbed');
          const publicKey = publicKeyData;
          subscribeUser(publicKey)
      })
      .catch(error => {
          console.error('Fetch error:', error);
      });
  })
  .catch(error => {
      console.error('setup key error:', error);
  });

});

