const SHELL_CACHE   = 'shell-v1';
const CONTENT_CACHE = 'content-v1';

const SHELL_ASSETS = [
  '/', '/index.html', '/app.js', '/style.css', '/manifest.json',
  '/icons/icon-32.png', '/icons/icon-192.png', '/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const validCaches = [SHELL_CACHE, CONTENT_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !validCaches.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (url.port === '3002') return;

  if (url.pathname.startsWith('/content/')) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(CONTENT_CACHE);
  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    return await cache.match(request) || caches.match('/content/home.html');
  }
}

// PUSH — показываем уведомление
// Если это напоминание (есть reminderId) — добавляем кнопку "Отложить"

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Уведомление', body: '', reminderId: null };

  const options = {
    body:  data.body,
    icon:  '/icons/icon-192.png',
    badge: '/icons/icon-32.png',
    data:  { reminderId: data.reminderId },
  };

  if (data.reminderId) {
    options.actions = [{ action: 'snooze', title: 'Отложить на 5 минут' }];
  }

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// NOTIFICATION CLICK — обрабатываем кнопку "Отложить"

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action       = event.action;

  if (action === 'snooze') {
    const reminderId = notification.data.reminderId;
    event.waitUntil(
      fetch(`https://localhost:3002/snooze?reminderId=${reminderId}`, { method: 'POST' })
        .then(() => notification.close())
        .catch(err => console.error('Snooze error:', err))
    );
  } else {
    notification.close();
  }
});
