import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import 'dotenv/config'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),tailwindcss(),],
  base: process.env.GITHUB_ACTIONS ? '/backend/' : '/',
})
