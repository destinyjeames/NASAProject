import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxies /api calls to the Express backend in development
    proxy: {
      "/api": "http://localhost:5001",
    },
  },
});
