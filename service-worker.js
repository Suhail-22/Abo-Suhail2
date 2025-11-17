importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded. Switching to Cache First strategy.`);

  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // 1. PRECACHING: يتم تخزين الملفات التي تتغير أسماؤها (الهاش) يدوياً 
  // ملاحظة: هذا الجزء قد يفشل بسبب أسماء الملفات المتغيرة، لكنه أساسي في الإعداد الأصلي.
  const filesToPrecache = [
      '/',
      'index.html',
      'manifest.json',
      'offline.html',
      'assets/icon.svg',
      'assets/icon-192.png',
      'assets/icon-512.png',
      'assets/screenshot-narrow.png',
      'assets/screenshot-wide.png',
      'index.tsx', 
      'App.tsx',   
      'types.ts',
      'constants.ts',
      'components/AboutPanel.tsx',
      'components/Button.tsx',
      'components/ButtonGrid.tsx',
      'components/Calculator.tsx',
      'components/ConfirmationDialog.tsx',
      'components/Display.tsx',
      'components/ErrorBoundary.tsx',
      'components/Header.tsx',
      'components/HistoryPanel.tsx',
      'components/Icon.tsx',
      'components/Notification.tsx',
      'components/Overlay.tsx',
      'components/SettingsPanel.tsx',
      'components/SupportPanel.tsx',
      'hooks/useCalculator.tsx',
      'hooks/useLocalStorage.tsx',
      'services/calculationEngine.ts',
      'services/geminiService.ts',
  ];

  workbox.precaching.precacheAndRoute(filesToPrecache.map(url => ({ url, revision: null })));

  // 2. الاستراتيجية الجديدة: الكاش أولاً مع محاولة التحديث في الخلفية (StaleWhileRevalidate)
  const cacheFirstStrategy = new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'app-shell-cache',
      plugins: [ new workbox.expiration.ExpirationPlugin({ maxEntries: 50 }) ],
  });

  // 3. تطبيق الاستراتيجية على التنقل (فتح الصفحات)
  workbox.routing.registerRoute(
      // عندما يحاول المستخدم فتح صفحة (التنقل)
      ({ request }) => request.mode === 'navigate',
      async (args) => {
          try {
              // حاول استخدام الكاش أولاً (الاستراتيجية الجديدة)
              return await cacheFirstStrategy.handle(args);
          } catch (error) {
              // إذا فشل كل شيء، أظهر صفحة عدم الاتصال
              console.log('Navigation failed, showing offline fallback.');
              return caches.match('offline.html');
          }
      }
  );

  // General catch handler as a final safety net.
  workbox.routing.setCatchHandler(({ event }) => {
    switch (event.request.destination) {
      case 'document':
        return caches.match('offline.html');
      default:
        return Response.error();
    }
  });

} else {
  console.log(`Workbox didn't load`);
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
