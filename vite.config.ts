import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  server: { proxy: { '/api/visitor': { target: process.env.EVENT_API_TARGET || 'http://localhost:3000', changeOrigin: true, rewrite: path => path.replace(/^\/api/, '') }, '/api/public/events': { target: process.env.EVENT_API_TARGET || 'http://localhost:3000', changeOrigin: true, rewrite: path => path.replace(/^\/api/, '') } } },
  plugins: [react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {

        name: 'Carteirinha Digital Fatec',
        short_name: 'Carteirinha',
        description: 'Sua carteirinha de estudante digital.',
        theme_color: '#BA1A1A',
        background_color: '#BA1A1A',
        display: 'standalone', 
        icons: [
          {
            src: 'pwa-192x192-end.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-192x192-end.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-512x512-end.png',
            sizes: '512x512',
            type: 'image/png',
            // purpose: 'any'
            purpose: 'any maskable'
          }
        ],
        screenshots: [
        {
          src: 'screenshot-desktop.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide',
          label: 'Tela de Login da Carteirinha'
        },
        {
          src: 'screenshot-mobile.png',
          sizes: '720x1280',
          type: 'image/png',
          form_factor: 'narrow', 
          label: 'Versão Mobile'
        }
      ]
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'], 
      },
    })
  ],
})
