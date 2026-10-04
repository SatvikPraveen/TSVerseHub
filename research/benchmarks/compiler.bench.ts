import { bench, describe } from 'vitest';

import { analyze, transpile } from '@/core/compiler';
import { createNodeLibProvider } from '@/core/compiler/node-libs';
import { curriculum } from '@/core/curriculum';

const libs = createNodeLibProvider();
const sample = curriculum.modules[0]?.samples[1];
const code = sample?.code ?? 'export const x: number = 1;';

describe('compiler kernel', () => {
  bench('analyze: small strict program', () => {
    analyze({ files: [{ path: '/a.ts', text: code }], libs });
  });

  bench('transpile: small program (no checker)', () => {
    transpile(code);
  });
});
