import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /api will be routed to your backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Optional: rewrite path if your backend doesn't expect the /api prefix
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
