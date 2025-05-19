import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api requests to our backend server
      "/api": {
        target: "http://localhost:3001", // Your backend URL
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // if your backend doesn't have /api prefix
      },
    },
  },
});
