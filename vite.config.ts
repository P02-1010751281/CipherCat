import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
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
    terserOptions: {
      compress: {
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/blockly')) return 'blockly';
          if (
            id.includes('node_modules/marked') ||
            id.includes('node_modules/dompurify') ||
            id.includes('node_modules/highlight.js')
          )
            return 'docs-renderer';
          if (id.includes('node_modules/mermaid')) return 'mermaid';
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
