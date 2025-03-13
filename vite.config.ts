import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Force Rollup to use its JavaScript implementation
      context: 'globalThis',
    },
    // Disable using native dependencies
    target: 'esnext',
  },
  optimizeDeps: {
    // Skip optional native dependencies
    exclude: ['fsevents'],
  },
})
