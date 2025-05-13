import '@dotenvx/dotenvx/config'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {websocketProxyPlugin} from "./src/plugins/vite-plugin-ws-proxy.ts"

import { fileURLToPath, URL } from 'node:url'

const PROXY_TARGET = `localhost:${process.env.PORT ?? 3000}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),

  websocketProxyPlugin({
    target: `ws://${PROXY_TARGET}`, wsPathFilter: (url) => {
      return !url.includes('?token=')
    }
  })

  ],

  server: {
    allowedHosts: ['devcast.nyades.dev'],
    port: process.env.CLIENT_PORT ? parseInt(process.env.CLIENT_PORT) : 3000,
    // proxy: {
    //   // Match all paths that contain `/someid/files/`
    //   '^/([^/]+)/files/.*$': {
    //     target: `http://${PROXY_TARGET}`,
    //     changeOrigin: true,
    //     rewrite: (path) => path,
    //   },
    // },
  },  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      },
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
