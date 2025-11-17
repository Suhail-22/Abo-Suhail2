importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded. Final attempt.`);

  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // 1. استراتيجية التخزين المؤقت لصفحات HTML (الكاش أولاً مع محاولة التحديث)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'pages',
    })
  );

  // 2. استراتيجية التخزين المؤقت لـ CSS, JS, و Assets (الكاش أولاً)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'style' ||
                     request.destination === 'script' ||
                     request.destination === 'worker',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'assets-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );
  
  // 3. توفير صفحة 'offline.html' كبديل عند فشل أي طلب (Final Fallback)
  workbox.routing.setCatchHandler(async ({ event }) => {
    if (event.request.mode === 'navigate') {
      return caches.match('offline.html');
    }
    return Response.error();
  });

} else {
  console.error(`Workbox failed to load.`);
}
