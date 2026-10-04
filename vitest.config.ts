import { fileURLToPath } from 'node:url';

import { defineConfig, mergeConfig } from 'vitest/config';

// Explicit extension: Vite's native config loader (planned default) requires it.
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig({ command: 'serve', mode: 'test' }),
  defineConfig({
    // Vite 8 transforms TypeScript with Oxc, which reads compiler options
    // (experimentalDecorators, useDefineForClassFields, ...) only from a
    // tsconfig whose `include` covers the file. The root tsconfig.json covers
    // src/ only, so the test files are compiled with the tsconfig that
    // type-checks them.
    tsconfig: './tsconfig.typetests.json',
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
        // Measured at 98.3% lines / 93.9% branches when introduced; the
        // thresholds leave headroom for noise but fail on real regressions.
        thresholds: {
          lines: 95,
          statements: 95,
          functions: 95,
          branches: 90,
        },
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
