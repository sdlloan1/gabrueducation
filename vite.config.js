import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The app talks to the local API in `server/` through this dev proxy, so the
// frontend and the API share one origin (cookies, uploads and relative URLs).
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:8000'

// Base44 previews serve the dev server through a proxy host, so that hostname
// has to be allowed. Vite appends __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS on its
// own; the preview subdomain is added here when running inside Base44.
const previewHosts = []
if (process.env.BASE44_PREVIEW_MODE === '1') {
  const suffix = process.env.BASE44_PUBLIC_HOST_SUFFIX
  if (suffix) previewHosts.push(`3000-${suffix}`, `.${suffix}`)
  previewHosts.push('.base44-preview.app')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors the "@/*" paths in jsconfig.json
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  server: {
    host: true,
    port: Number(process.env.VITE_PORT) || 5173,
    strictPort: true,
    ...(previewHosts.length ? { allowedHosts: previewHosts } : {}),
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
