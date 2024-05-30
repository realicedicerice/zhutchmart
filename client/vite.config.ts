import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
  },
  base: "",
  resolve: {
    alias: {
      "@": resolve("./src"),
    },
  },
});
