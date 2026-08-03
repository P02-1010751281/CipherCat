import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      // 具体 alias 必须排在 '@' 通配之前（vite 按数组顺序匹配）
      { find: '@/blocks', replacement: resolve(__dirname, 'src/features/blockly/core/blocks') },
      { find: '@/generators/python', replacement: resolve(__dirname, 'src/features/blockly/core/generators/python') },
      { find: '@/generators/javascript', replacement: resolve(__dirname, 'src/features/blockly/core/generators/javascript') },
      { find: '@', replacement: resolve(__dirname, 'src') },
    ],
  },
  build: {
    outDir: 'dist-verify',
    lib: {
      entry: {
        'verify-demo': resolve(__dirname, 'scripts/verify-demo.ts'),
        'verify-templates': resolve(__dirname, 'scripts/verify-templates.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: { external: ['node:fs', 'node:child_process', 'jsdom'] },
  },
});
