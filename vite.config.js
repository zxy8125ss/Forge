import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// 发布在 GitHub Pages：https://zxy8125ss.github.io/Forge/
const BASE = '/Forge/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Forge',
        short_name: 'Forge',
        description: 'Forge your 10,000 hours.',
        lang: 'zh-CN',
        theme_color: '#1a1612',
        background_color: '#1a1612',
        display: 'standalone',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // 安装时预缓存界面和白噪声；古典乐体积大，播放过一次后再缓存
        globPatterns: ['**/*.{js,css,html,png,svg,wav,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/music/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'forge-music',
              rangeRequests: true,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 20 },
            },
          },
        ],
      },
    }),
  ],
})
