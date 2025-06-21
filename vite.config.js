import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/AiBud/",
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    hmr: {
      host: "localhost",
      port: 3000,
      overlay: false,
    },
  },
});
