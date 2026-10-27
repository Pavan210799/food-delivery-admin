import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves from /food-delivery-admin/; Vercel/Netlify use /
  base: process.env.GITHUB_PAGES === 'true' ? '/food-delivery-admin/' : '/',
})
