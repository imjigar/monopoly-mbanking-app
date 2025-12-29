
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Critical for GitHub Pages subfolder deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
