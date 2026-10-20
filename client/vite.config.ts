import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  fmt: {
    ignorePatterns: [],
  },
  plugins: [vue(), tailwindcss()],
  base: process.env.GITHUB_ACTIONS ? "/backend/" : "/",
  server: {
    proxy: {
      "/api": "http://localhost:4002",
    },
  },
});
