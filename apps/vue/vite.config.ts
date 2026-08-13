import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "https://cidr-game.onrender.com",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
