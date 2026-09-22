// Service Worker для Shloka App
const CACHE_NAME = 'shloka-v3';

// Установка Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Активация
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Push-уведомления — максимально заметные
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || '🙏 Shloka — время повторять!';
  const options = {
    body: data.body || 'Ваши шлоки ждут повторения. Даже 5 минут в день делают разницу!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // Длинная вибрация чтобы точно заметить
    vibrate: [200, 100, 200, 100, 200],
    // Не исчезает автоматически — нужно нажать
    requireInteraction: true,
    // Повторное уведомление с тем же тегом всё равно привлекает внимание
    tag: 'shloka-reminder',
    renotify: true,
    // Данные для клика
    data: {
      url: data.url || '/?status=learning'
    },
    actions: [
      { action: 'open', title: data.openLabel || '📖 Повторять' },
      { action: 'close', title: data.laterLabel || 'Позже' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Если приложение уже открыто - переходим туда
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        // Иначе открываем новое окно
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
