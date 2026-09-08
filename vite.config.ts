import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

// HTTPS via mkcert — necessário para GPS no Safari (iPhone)
export default defineConfig({
  plugins: [mkcert()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
