import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/CPP-Test-/',
  build: {
    emptyOutDir: true, // This clears the old files before cooking new ones
    rollupOptions: {
      input: 'index.html'
    }
  }
});