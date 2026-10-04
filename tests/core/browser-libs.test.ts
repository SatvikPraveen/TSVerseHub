import { describe, expect, it } from 'vitest';

import { analyze } from '@/core/compiler';
import {
  availableBrowserLibs,
  browserLibStats,
  createBrowserLibProvider,
  loadBrowserLibs,
  parseLibReferences,
  toLibFileName,
} from '@/core/compiler/browser-libs';
import { createKernelService, resolveCompilerOptions, rootLibsFor } from '@/core/compiler/kernel-service';
import { createNodeLibProvider } from '@/core/compiler/node-libs';
import { getTypeScriptCompilerOptions, toKernelCompilerOptions, type CompilerOptionsPreset } from '@/components/editors/EditorConfig';

const nodeLibs = createNodeLibProvider();

/** Transitive closure of `/// <reference lib>` computed independently from the Node provider. */
const closureFromNode = (roots: readonly string[]): Set<string> => {
  const seen = new Set<string>();
  const stack = [...roots];
  while (stack.length > 0) {
    const name = stack.pop();
    if (name === undefined || seen.has(name)) continue;
    seen.add(name);
    const text = nodeLibs(name);
    if (text !== undefined) stack.push(...parseLibReferences(text));
  }
  return seen;
};

const pick = ({ code, category, file, line, column, start, length }: { code: number; category: string; file?: string; line?: number; column?: number; start?: number; length?: number }) => ({
  code,
  category,
  file,
  line,
  column,
  start,
  length,
});

describe('browser lib provider', () => {
  it('exposes every lib file of the installed typescript package through import.meta.glob', () => {
    const available = availableBrowserLibs();
    expect(available).toContain('lib.es2022.d.ts');
    expect(available).toContain('lib.dom.d.ts');
    expect(available.every((name) => /^lib\..+\.d\.ts$/.test(name))).toBe(true);
  });

  it('normalises tsconfig-style lib names', () => {
    expect(toLibFileName('ES2020')).toBe('lib.es2020.d.ts');
    expect(toLibFileName('DOM.Iterable')).toBe('lib.dom.iterable.d.ts');
    expect(toLibFileName('es6')).toBe('lib.es2015.d.ts');
    expect(toLibFileName('lib.es5.d.ts')).toBe('lib.es5.d.ts');
  });

  it('parses reference-lib directives', () => {
    expect(parseLibReferences('/// <reference lib="es2021" />\n/// <reference lib="es2022.array" />\ndeclare var x: 1;')).toEqual([
      'lib.es2021.d.ts',
      'lib.es2022.array.d.ts',
    ]);
  });

  it('resolves lib.es2022.d.ts and its transitive references, matching the Node provider byte for byte', async () => {
    const provider = await createBrowserLibProvider({ libs: ['lib.es2022.d.ts'] });
    const expected = closureFromNode(['lib.es2022.d.ts']);
    expect(expected).toContain('lib.es5.d.ts');
    expect(expected).toContain('lib.es2021.d.ts');
    expect(expected).toContain('lib.decorators.d.ts');
    for (const name of expected) {
      expect(provider(name), name).toBe(nodeLibs(name));
    }
    const loaded = await loadBrowserLibs(['ES2022']);
    expect(new Set(loaded)).toEqual(expected);
  });

  it('is memoised per root set', async () => {
    const a = createBrowserLibProvider({ libs: ['lib.es2022.d.ts'] });
    const b = createBrowserLibProvider({ libs: ['ES2022'] });
    expect(a).toBe(b);
    await a;
    expect(browserLibStats().files).toContain('lib.es2022.d.ts');
  });

  it('loads only reachable files unless asked to preload all', async () => {
    await createBrowserLibProvider({ libs: ['lib.es5.d.ts'] });
    expect(browserLibStats().files).not.toContain('lib.webworker.d.ts');
    const all = await createBrowserLibProvider({ preloadAll: true });
    expect(all('lib.webworker.d.ts')).toBe(nodeLibs('lib.webworker.d.ts'));
    expect(browserLibStats().files).toEqual(availableBrowserLibs());
  });

  it('makes analyze() report the same diagnostics as the Node provider', async () => {
    const libs = await createBrowserLibProvider();
    const files = [{ path: '/index.ts', text: 'export const s: string = 42;' }];
    const fromBrowser = analyze({ libs, files });
    const fromNode = analyze({ libs: nodeLibs, files });
    expect(fromBrowser.errorCount).toBe(1);
    expect(fromBrowser.diagnostics.map(pick)).toEqual(fromNode.diagnostics.map(pick));
    expect(fromBrowser.diagnostics[0]).toMatchObject({ code: 2322, line: 1, column: 14 });
    expect(fromBrowser.sourceFileCount).toBe(fromNode.sourceFileCount);
  });
});

describe('kernel service (the worker request handler)', () => {
  const files = [{ path: '/index.ts', text: 'const user = { id: 1 };\nexport const s: string = user.id;' }];

  it.each<CompilerOptionsPreset>(['learning', 'strict', 'permissive'])('accepts the %s editor preset without option diagnostics', (preset) => {
    const { options, diagnostics } = resolveCompilerOptions(toKernelCompilerOptions(getTypeScriptCompilerOptions(preset)));
    expect(diagnostics).toEqual([]);
    expect(options.lib).toEqual(['lib.es2020.d.ts', 'lib.dom.d.ts']);
    expect(rootLibsFor(options)).toEqual(['lib.es2020.d.ts', 'lib.dom.d.ts']);
  });

  it('reports invalid JSON options as diagnostics instead of throwing', () => {
    expect(resolveCompilerOptions({ target: 'ES1999' }).diagnostics[0]?.category).toBe('error');
  });

  it('derives the root libraries from noLib, an explicit lib list or the target default', () => {
    expect(rootLibsFor({ noLib: true })).toEqual([]);
    expect(rootLibsFor({ lib: ['lib.es2015.d.ts'] })).toEqual(['lib.es2015.d.ts']);
    expect(rootLibsFor({})).toEqual(['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts']);
    expect(rootLibsFor({ lib: undefined })).toEqual(['lib.es2022.full.d.ts']);
  });

  it('puts option diagnostics in front of the analysis and counts them as errors', async () => {
    const service = createKernelService();
    const analysed = await service.handle(5, { kind: 'analyze', channel: 'options', files, compilerOptions: { target: 'ES1999' } });
    expect(analysed?.kind).toBe('analyze');
    if (analysed?.kind !== 'analyze') return;
    expect(analysed.result.diagnostics[0]?.file).toBeUndefined();
    expect(analysed.result.diagnostics.map((d) => d.code)).toContain(2322);
    expect(analysed.result.errorCount).toBe(analysed.result.diagnostics.filter((d) => d.category === 'error').length);
    expect(analysed.result.errorCount).toBeGreaterThanOrEqual(2);
  });

  it('analyses with the preset options and answers typeAt and transpile', async () => {
    const service = createKernelService();
    const compilerOptions = toKernelCompilerOptions(getTypeScriptCompilerOptions('learning'));
    const analysed = await service.handle(1, { kind: 'analyze', channel: 'a', files, compilerOptions });
    expect(analysed?.kind).toBe('analyze');
    if (analysed?.kind !== 'analyze') return;
    expect(analysed.result.errorCount).toBe(1);
    expect(analysed.result.diagnostics[0]).toMatchObject({ code: 2322, line: 2, column: 14 });

    const typed = await service.handle(2, { kind: 'typeAt', channel: 'a', files, compilerOptions, file: '/index.ts', line: 1, column: 7 });
    expect(typed).toEqual({ kind: 'typeAt', result: '{ id: number; }' });
    const outOfRange = await service.handle(3, { kind: 'typeAt', channel: 'a', files, compilerOptions, file: '/index.ts', line: 99, column: 1 });
    expect(outOfRange).toEqual({ kind: 'typeAt', result: undefined });

    const transpiled = await service.handle(4, { kind: 'transpile', text: 'const n: number = 1;', compilerOptions });
    expect(transpiled?.kind === 'transpile' && transpiled.result.outputText).toContain('const n = 1;');
  });

  it('cancels a superseded analysis on the same channel but not on another', async () => {
    const service = createKernelService();
    const first = service.handle(10, { kind: 'analyze', channel: 'x', files });
    const other = service.handle(11, { kind: 'analyze', channel: 'y', files });
    const second = service.handle(12, { kind: 'analyze', channel: 'x', files });
    expect(await first).toBeNull();
    expect((await other)?.kind).toBe('analyze');
    expect((await second)?.kind).toBe('analyze');
  });

  it('reports what init loaded', async () => {
    const service = createKernelService();
    const init = await service.handle(20, { kind: 'init', compilerOptions: { lib: ['ES2020', 'DOM'] } });
    expect(init?.kind).toBe('init');
    if (init?.kind !== 'init') return;
    expect(init.result.libFiles).toContain('lib.es2020.d.ts');
    expect(init.result.libFiles).toContain('lib.dom.d.ts');
    expect(init.result.libCharacters).toBeGreaterThan(0);
  });
});
