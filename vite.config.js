import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          markdown: ['markdown-it'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
