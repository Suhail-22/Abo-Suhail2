// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // إذا كنت تستخدم PWA
import checker from 'vite-plugin-checker'; // ← استيراد المكون

export default defineConfig({
  plugins: [
    react(),
    checker({ // ← أضف هذا
      typescript: true,
      eslint: {
        lintCommand: 'eslint src --ext .ts,.tsx',
      },
    }),
    // VitePWA({ ... }) // أضف إعدادات PWA إذا كنت تستخدمها
  ],
  build: {
    sourcemap: true, // ← أضف هذا
    minify: 'terser', // ← تأكد من استخدام terser
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    // تجنب تقلص المتغيرات
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
  },
});