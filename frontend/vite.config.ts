import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_DOCKER === 'true' ? '/' : (process.env.NODE_ENV === 'production' ? '/nextflow-os/admin/' : '/'),
  build: {
    rollupOptions: {
      input: {
        platform: resolve(__dirname, 'platform.html'),
        leader: resolve(__dirname, 'leader.html'),
        staff: resolve(__dirname, 'staff.html'),
        customer: resolve(__dirname, 'customer.html')
      }
    }
  }
})
