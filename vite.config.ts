import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // استيراد الإضافة

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // إضافة إعدادات PWA هنا
        VitePWA({
          registerType: 'autoUpdate', // تحديث تلقائي عند توفر إصدار جديد
          strategies: 'generateSW', // استخدام الإستراتيجية المُولدة تلقائيًا (أبسط خيار)
          workbox: {
            // تضمين جميع الملفات الثابتة المُحسّنة (التي بها الهاش) تلقائيًا
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            // توجيه أي طلب للتنقل (Navigational requests) إلى index.html
            navigateFallback: '/index.html',
            // تجنب تخزين طلبات API في الكاش (مهم إذا كنت تستخدم Gemini API)
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/.*\/api\/.*$/, // مثال على طلب API
                handler: 'NetworkOnly', // لا تخزنها، اطلبها دائمًا من الشبكة
              },
              {
                urlPattern: /^https:\/\/storage\.googleapis\.com\/.*$/,
                handler: 'NetworkOnly',
              },
            ],
          },
          // إعدادات ملف manifest.json للتطبيق
          manifest: {
            name: 'Abo Suhail Calculator',
            short_name: 'Calc',
            description: 'A powerful offline calculator',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            display: 'standalone',
            icon: 'src/assets/icon-192.png', // تأكد من وجود هذا الملف
            start_url: '/',
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});