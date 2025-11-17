importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded`);

  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // 1. PRECACHING: Cache the app shell and local static assets during installation.
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
      'index.tsx', // ملاحظة: هذا الملف يجب أن لا يتم تخزينه يدوياً في الغالب
      'App.tsx',   // ملاحظة: هذا الملف يجب أن لا يتم تخزينه يدوياً في الغالب
      'types.ts',
      'constants.ts',
      // (جميع ملفات المكونات الأخرى التي كانت في قائمتك الأصلية)
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

  // 2. NETWORK FIRST strategy for dynamic content and navigation
  const networkFirstWithOfflineFallback = new workbox.strategies.NetworkFirst({
      cacheName: 'pages-cache',
      plugins: [ new workbox.expiration.ExpirationPlugin({ maxEntries: 50 }) ],
  });

  workbox.routing.registerRoute(
      ({ request }) => request.mode === 'navigate',
      async (args) => {
          try {
              // Try the network first to get the latest version.
              return await networkFirstWithOfflineFallback.handle(args);
          } catch (error) {
              // If the network fails (offline), serve the main app shell from the precache.
              console.log('Network failed for navigation, serving app shell from precache.');
              const precache = await caches.open(workbox.core.cacheNames.precache);
              const cachedResponse = await precache.match(workbox.precaching.getCacheKeyForURL('/'));
              if (cachedResponse) {
                  return cachedResponse;
              }
              // As a last resort, show the dedicated offline page.
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
