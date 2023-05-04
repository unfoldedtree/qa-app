import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const exchangeBaseUrl = "https://api.forp-staging.com";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      "/api/forp": {
        target: `${exchangeBaseUrl}/v1/auth`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/forp/, ""),
      },
      "/api/hierarchy": {
        target: `${exchangeBaseUrl}/hierarchy/v1`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/hierarchy/, ""),
      },
      "/api": {
        target: `${exchangeBaseUrl}/exchange/v1`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    }
  }
})
