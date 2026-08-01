import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    outDir: 'dist-verify',
    lib: { entry: resolve(__dirname, 'scripts/verify-demo.ts'), formats: ['es'], fileName: 'verify-demo' },
    rollupOptions: { external: ['node:fs', 'node:child_process', 'jsdom'] },
  },
});
