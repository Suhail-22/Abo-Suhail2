// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // إذا كنت تستخدم PWA

export default defineConfig({
  plugins: [
    react(),
    // VitePWA({ ... }) // أضف إعدادات PWA إذا كنت تستخدمها
  ],
  build: {
    minify: false, // ← إيقاف تقلص الكود
    cssMinify: false, // ← إيقاف تقلص CSS
    rollupOptions: {
      output: {
        // تجنب تقلص أسماء المتغيرات
        manualChunks: undefined,
        // تجنب تقلص الأسماء
        compact: false,
      },
    },
  },
});