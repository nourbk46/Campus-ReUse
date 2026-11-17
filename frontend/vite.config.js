import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Le frontend appelle /api et /storage : Vite les relaie vers Laravel (php artisan serve)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/storage': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
