// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*$/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/storage\.googleapis\.com\/.*$/,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'Abo Suhail Calculator',
        short_name: 'Calc',
        description: 'A powerful offline calculator',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icon: 'src/assets/icon-192.png',
        start_url: '/',
      },
    }),
  ],
});