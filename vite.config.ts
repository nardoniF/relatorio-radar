import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

// Em GitHub Pages o site fica em /relatorio-radar/
const base = process.env.GITHUB_PAGES === '1' ? '/relatorio-radar/' : '/'

export default defineConfig({
  base,
  plugins: process.env.GITHUB_PAGES === '1' ? [] : [mkcert()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
