import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
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
            src: 'pwa-192x192-refatorado.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512-refatorado.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'], 
      },
    })
  ],
})
