import { fileURLToPath } from 'node:url';

import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig({ command: 'serve', mode: 'test' }),
  defineConfig({
    test: {
      globals: false,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      benchmark: {
        include: ['research/benchmarks/**/*.bench.ts'],
      },
      typecheck: {
        enabled: false,
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html', 'json-summary'],
        reportsDirectory: './coverage',
        include: ['src/utils/**', 'src/hooks/**', 'src/mini-projects/**/*.ts', 'src/core/**'],
        exclude: ['**/*.d.ts', '**/demo.tsx', '**/index.ts'],
      },
      restoreMocks: true,
      css: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  })
);
