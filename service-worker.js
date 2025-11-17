importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded.`);

  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // الملفات التي يجب تخزينها (تعديل المسارات لضمان تغطية جميع الأصول)
  workbox.precaching.precacheAndRoute([
      // الملفات الأساسية
      {url: '/', revision: null},
      {url: '/index.html', revision: null},
      {url: '/offline.html', revision: null},
      {url: '/manifest.json', revision: null},

      // الأصول الثابتة (يجب أن توجد في assets/)
      {url: '/assets/icon.svg', revision: null},
      {url: '/assets/icon-192.png', revision: null},
      {url: '/assets/icon-512.png', revision: null},
      // هنا يجب إضافة ملفات JS/CSS الناتجة عن البناء، ولكننا لا نعرف أسماءها ذات الـ Hash.
      // هذا الجزء يجب أن يكون كافيًا لتثبيت Service Worker.
  ]);

  // استراتيجية NetworkFirst للملفات الأخرى
  const networkFirst = new workbox.strategies.NetworkFirst({
      cacheName: 'general-assets',
      plugins: [ 
        new workbox.expiration.ExpirationPlugin({ 
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 يوماً
        }) 
      ],
  });

  // توفير صفحة 'offline.html' كبديل عند فشل التنقل
  workbox.routing.setCatchHandler(async ({ event }) => {
    if (event.request.mode === 'navigate') {
      return caches.match('offline.html');
    }
    return Response.error();
  });

  // تسجيل مسار Service Worker
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/'),
    networkFirst
  );

} else {
  console.error(`Workbox failed to load.`);
}
