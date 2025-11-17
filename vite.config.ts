import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // <--- تم استيراد إضافة PWA

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // تهيئة إضافة Vite PWA
        VitePWA({
          registerType: 'autoUpdate',
          // إعدادات Workbox للتعامل مع التخزين المؤقت
          workbox: {
            // هذا يخبر Workbox بتخزين جميع الملفات التي يتم إنشاؤها تلقائياً
            globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'], 
            cleanupOutdatedCaches: true, 
            sourcemap: mode === 'development',
          },
          // هذه الإعدادات تضمن أن يتم إنشاء ملف manifest صحيح كنسخة احتياطية
          manifest: {
             name: 'Abo Suhail Calculator',
             short_name: 'Calculator',
             description: 'Smart Calculator App',
             theme_color: '#ffffff',
             icons: [] 
          }
        })
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
