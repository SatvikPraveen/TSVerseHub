import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { analyze, STRICT_COMPILER_OPTIONS, transpile, typeAt } from '@/core/compiler';
import { createNodeLibProvider } from '@/core/compiler/node-libs';
import { createStaticLibProvider, createVirtualHost, normalizePath } from '@/core/compiler/virtual-host';

const libs = createNodeLibProvider();

describe('virtual host', () => {
  it('normalises paths and serves files from memory', () => {
    const host = createVirtualHost({ files: [{ path: 'a.ts', text: 'export const a = 1;' }], compilerOptions: {}, libs });
    expect(normalizePath('a.ts')).toBe('/a.ts');
    expect(host.fileExists('/a.ts')).toBe(true);
    expect(host.fileExists('a.ts')).toBe(true);
    expect(host.fileExists('/missing.ts')).toBe(false);
    expect(host.readFile('/a.ts')).toBe('export const a = 1;');
    expect(host.directoryExists?.('/')).toBe(true);
  });

  it('resolves lib files through the provider', () => {
    const host = createVirtualHost({ files: [], compilerOptions: {}, libs: createStaticLibProvider({ 'lib.es5.d.ts': 'declare var x: number;' }) });
    expect(host.readFile('/__lib__/lib.es5.d.ts')).toBe('declare var x: number;');
    expect(host.readFile('/__lib__/lib.es2020.d.ts')).toBeUndefined();
  });
});

describe('analyze', () => {
  it('reports no errors for a well-typed program and resolves imports between virtual files', () => {
    const result = analyze({
      libs,
      files: [
        { path: '/math.ts', text: 'export const double = (n: number): number => n * 2;' },
        { path: '/index.ts', text: "import { double } from './math';\nexport const four: number = double(2);" },
      ],
    });
    expect(result.errorCount).toBe(0);
    expect(result.sourceFileCount).toBeGreaterThan(2);
  });

  it('reports precise diagnostics with 1-based positions', () => {
    const result = analyze({ libs, files: [{ path: '/index.ts', text: 'export const s: string = 42;' }] });
    expect(result.errorCount).toBe(1);
    expect(result.diagnostics[0]).toMatchObject({ code: 2322, category: 'error', file: '/index.ts', line: 1, column: 14 });
  });

  it('honours compiler option overrides', () => {
    const code = 'const xs: number[] = [1];\nexport const n: number = xs[0];';
    expect(analyze({ libs, files: [{ path: '/a.ts', text: code }] }).errorCount).toBe(1);
    expect(analyze({ libs, files: [{ path: '/a.ts', text: code }], compilerOptions: { noUncheckedIndexedAccess: false } }).errorCount).toBe(0);
  });

  it('emits JavaScript when asked', () => {
    const result = analyze({ libs, files: [{ path: '/a.ts', text: 'export const n: number = 1;' }], emit: true });
    expect(Object.keys(result.outputs)).toContain('/out/a.js');
    expect(result.outputs['/out/a.js']).toContain('export const n = 1;');
  });

  it('uses the injected clock for timings', () => {
    let t = 0;
    const result = analyze({ libs, files: [{ path: '/a.ts', text: 'export {};' }], now: () => (t += 10) });
    expect(result.timings).toEqual({ programMs: 10, checkMs: 10, emitMs: 10, totalMs: 30 });
  });

  it('is deterministic: identical inputs yield identical diagnostics', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), fc.boolean(), (n, asString) => {
        const text = `export const v: ${asString ? 'string' : 'number'} = ${n};`;
        const a = analyze({ libs, files: [{ path: '/p.ts', text }] }).diagnostics;
        const b = analyze({ libs, files: [{ path: '/p.ts', text }] }).diagnostics;
        expect(a).toEqual(b);
        expect(a.length).toBe(asString ? 1 : 0);
      }),
      { numRuns: 20 },
    );
    // 40 full type-checks against the real lib.*.d.ts files: ~3 s plain and
    // ~8 s under V8 coverage on a loaded machine. Vitest 2 could not interrupt
    // this synchronous test, so the 5 s default was never enforced; Vitest 4
    // fails a synchronous test that overruns its timeout, so the budget is
    // stated explicitly.
  }, 30_000);
});

describe('typeAt', () => {
  it('returns the display type of the identifier at a position', () => {
    const files = [{ path: '/t.ts', text: "const user = { id: 1, tags: ['a'] as const };\nexport const id = user.id;" }];
    expect(typeAt({ libs, files, file: '/t.ts', line: 1, column: 7 })).toBe('{ id: number; tags: readonly ["a"]; }');
    expect(typeAt({ libs, files, file: '/t.ts', line: 2, column: 14 })).toBe('number');
  });
});

describe('transpile', () => {
  it('strips types without a checker', () => {
    const { outputText, diagnostics } = transpile('const x: number = 1; export default x;');
    expect(outputText).toContain('const x = 1;');
    expect(diagnostics).toEqual([]);
  });

  it('is idempotent on its own output for type-free programs', () => {
    fc.assert(
      fc.property(fc.array(fc.tuple(fc.stringMatching(/^[a-z][a-z0-9]{0,6}$/), fc.integer()), { maxLength: 8 }), (decls) => {
        const unique = new Map(decls);
        const source = [...unique].map(([name, value]) => `export const ${name}: number = ${value};`).join('\n');
        const once = transpile(source).outputText;
        const twice = transpile(once).outputText;
        expect(twice).toBe(once);
      }),
      { numRuns: 30 },
    );
  });
});

describe('STRICT_COMPILER_OPTIONS', () => {
  it('is frozen so callers cannot mutate shared defaults', () => {
    expect(Object.isFrozen(STRICT_COMPILER_OPTIONS)).toBe(true);
  });
});
