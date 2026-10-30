import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.BLOGLIST_API_TARGET || 'http://127.0.0.1:3003',
    },
  },
  test: { environment: 'jsdom' },
})
