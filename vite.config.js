import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      '/cart': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/article': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false
      },
      '/category': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false
      },
      '/brand': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false
      }
    }
  }
})