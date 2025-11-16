// استيراد مكتبة Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded. Starting PWA caching...`);

  // تخطي حالة الانتظار والتفعيل الفوري لـ Service Worker الجديد
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // 1. التخزين المؤقت لملفات بناء التطبيق (App Shell)
  // يستخدم Workbox حقن تلقائي لملفات بناء Vite/React
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // 2. توفير صفحة 'offline.html' كبديل عند فشل التنقل (Navigate)
  // هذا يضمن عرض صفحة 'غير متصل' (offline.html) عندما يكون المستخدم غير متصل بالإنترنت
  const handler = async ({ event }) => {
    try {
      // حاول جلب المورد من الشبكة أولاً
      return await workbox.strategies.networkOnly().handle({ event });
    } catch (error) {
      // إذا فشل الاتصال بالشبكة (أصبح المستخدم غير متصل)، قم بإرجاع نسخة الكاش لملف offline.html
      return caches.match('offline.html');
    }
  };
  workbox.routing.setCatchHandler(handler);

} else {
  console.error(`Workbox failed to load.`);
}

// هذا الكود ضروري لعملية التحديث التلقائي للتطبيق
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
