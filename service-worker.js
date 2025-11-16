const CACHE_NAME = 'abo-suhail-calculator-v20251116-FINAL';
// قائمة الملفات التي يجب تخزينها يدوياً
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  
  // الملفات التي يتم إنشاؤها بعد البناء (قد تتغير أسماؤها)
  // يجب إضافة الملفات التي تنتجها عملية البناء (Build) هنا
  // نحن نضيف الملفات الرئيسية بناءً على توقعات Vite (يجب أن توجد هذه المجلدات):
  '/assets/index.js',       // ملف JavaScript الرئيسي للتطبيق (قد يختلف الاسم)
  '/assets/index.css',      // ملف CSS الرئيسي للتطبيق (قد يختلف الاسم)
  '/assets/icon.svg',
  '/assets/icon-192.png',   // أيقونات Manifest
  '/assets/icon-512.png',
  
  // الملفات الضرورية الأخرى
  // ... قم بإضافة مسار أي ملفات CSS أو JS أخرى تستخدمها هنا...
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Attempting to cache ALL essential files.');
        // استخدام .addAll() لتخزين كل الملفات دفعة واحدة
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        // إذا فشل تخزين ملف واحد، سيفشل Service Worker بالكامل
        console.error('Caching failed for one or more files in the list.', error);
      })
  );
});

// استراتيجية التشغيل: الكاش أولاً مع fallback
self.addEventListener('fetch', (event) => {
  if (!(event.request.url.indexOf('http') === 0)) return; 
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // إرجاع من الكاش
        }
        
        // جلب من الشبكة
        return fetch(event.request)
               .catch(() => {
                   // فشل الشبكة - إذا كان المستخدم يتنقل في صفحة (navigate)
                   if (event.request.mode === 'navigate') {
                       return caches.match('offline.html');
                   }
               });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
