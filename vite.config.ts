import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Ensure we're not using native dependencies
    target: 'esnext',
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', '@tiptap/react', '@tiptap/starter-kit'],
          'data-vendor': ['@tanstack/react-query', '@supabase/supabase-js']
        }
      }
    }
  },
  optimizeDeps: {
    // Skip optional native dependencies
    exclude: ['fsevents']
  }
})
