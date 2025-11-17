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
      'services/localErrorFixer.ts',
  ];
  
  // Use revision: null for files that don't have a hash in their name.
  // Workbox will still cache them but won't be able to do efficient updates without a revision.
  // This is okay for this project structure.
  workbox.precaching.precacheAndRoute(filesToPrecache.map(url => ({ url, revision: null })));

  // 2. RUNTIME CACHING
  
  // Google Fonts (stylesheets)
  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // Google Fonts (font files)
  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new workbox.expiration.ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30 }),
      ],
    })
  );
  
  // Tailwind CSS from CDN
  workbox.routing.registerRoute(
    ({url}) => url.href === 'https://cdn.tailwindcss.com',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'tailwind-css',
    })
  );

  // esm.sh scripts
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://esm.sh',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'third-party-scripts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new workbox.expiration.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      ]
    })
  );

  // 3. OFFLINE NAVIGATION FALLBACK
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