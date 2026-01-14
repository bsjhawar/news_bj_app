console.log('Service Worker Loaded');

self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Push Received', data);

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/254/254638.png' // A simple news icon
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
