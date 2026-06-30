import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
    open: true,
    cors: true,
  },
  clearScreen: false,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/blockly')) return 'blockly';
          if (
            id.includes('node_modules/vue') ||
            id.includes('node_modules/@vue')
          )
            return 'vue-vendor';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['blockly', 'vue'],
  },
});
