import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/react/",
  server: {
    host: "0.0.0.0",
    port: 5155,
    proxy: {
      "/api": {
        target: "https://cidr-game.onrender.com",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
  },
});
