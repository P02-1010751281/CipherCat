import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      // 具体 alias 必须排在 '@' 通配之前（vite 按数组顺序匹配）
      // CipherCat 无 features 目录（metacrypt 镜像版为 src/features/blockly/core/...）
      { find: '@/blocks', replacement: resolve(import.meta.dirname, 'src/blocks') },
      { find: '@/generators/python', replacement: resolve(import.meta.dirname, 'src/generators/python') },
      { find: '@/generators/javascript', replacement: resolve(import.meta.dirname, 'src/generators/javascript') },
      { find: '@', replacement: resolve(import.meta.dirname, 'src') },
    ],
  },
  build: {
    outDir: 'dist-verify',
    lib: {
      entry: {
        'verify-demo': resolve(import.meta.dirname, 'scripts/verify-demo.ts'),
        'verify-templates': resolve(import.meta.dirname, 'scripts/verify-templates.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: { external: ['node:fs', 'node:child_process', 'node:os', 'node:path', 'jsdom'] },
  },
});
