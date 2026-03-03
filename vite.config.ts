import { defineConfig } from 'vite';

export default defineConfig({
  base: '/virtual-tree/', // GitHub Pages subpath
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
