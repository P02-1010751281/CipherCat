import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    passWithNoTests: false,
    // 默认 5s 在多 worker 并行 + 外部盘 IO 下会偶发超时（已观察到 gmdrbg/hmac 用例）。
    // 统一给 30s 预算：只放宽“等待时间”，不放宽任何断言或期望值。
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
