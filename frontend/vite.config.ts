import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_DOCKER === 'true' ? '/' : (process.env.NODE_ENV === 'production' ? '/nextflow-os/admin/' : '/'),
})
