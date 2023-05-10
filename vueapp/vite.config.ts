import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default (mode: any) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  const exchangeBaseUrl = process.env.VITE_EXCHANGE_API_URL;

  console.log(`exchangeBaseUrl: ${exchangeBaseUrl}`);

  return defineConfig({
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        "/v1/auth": {
          target: `${exchangeBaseUrl}/v1/auth`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/v1\/auth/, ""),
        },
        "/hierarchy/v1": {
          target: `${exchangeBaseUrl}/hierarchy/v1`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/hierarchy\/v1/, ""),
        },
        "/exchange/v1": {
          target: `${exchangeBaseUrl}/exchange/v1`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/exchange\/v1/, ""),
        },
      }
    }
  })
}
