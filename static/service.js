console.log('Hello from service worker')
// service.js

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // Handle the notification click event here, e.g., open a specific URL.
    clients.openWindow('https://purrfect_planner-1-z2375828.deta.app/');
});

self.addEventListener('push', function(event) {
    const options = {
        body: event.data.text(),
    };

    event.waitUntil(
        self.registration.showNotification('Push Notification', options)
    );
});
