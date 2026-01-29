import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // This ensures assets are loaded from gbc1689.github.io/CPP-Test/
  base: "/CPP-Test/",
  build: {
    // This ensures the build output is clean
    outDir: 'dist',
    assetsDir: 'assets',
  }
})