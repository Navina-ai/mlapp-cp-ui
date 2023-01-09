// vite.config.js

import { defineConfig } from 'vite';
import vue from "@vitejs/plugin-vue2";
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8080,
    https: true,
  },
  plugins: [vue()],
  resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    }
})