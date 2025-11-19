// service-worker.js - For Abo Suhail Calc - No UI Changes, Only Performance & PWA
const CACHE_NAME = 'v6-11202025'; // تحديث اسم الكاش لتفعيل التحديث
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // هذا هو الملف الرئيسي حسب هيكل مشروعك
  '/style.css', // إذا كان هذا الملف موجودًا
  '/assets/icon.svg', // الأيقونة
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وُجد في الكاش، استخدمه، وإلا اطلب من الشبكة
        return response || fetch(event.request);
      })
  );
});