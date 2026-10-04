import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FakeKernelWorker } from './kernel-worker-fake';

import type * as KernelHooks from '@/hooks/useCompilerKernel';
import type * as PlaygroundHooks from '@/hooks/usePlaygroundCompiler';

type KernelModule = typeof KernelHooks;
type PlaygroundModule = typeof PlaygroundHooks;

/** The kernel client is a module-level singleton; load fresh modules per test. */
const loadHooks = async (): Promise<{ kernel: KernelModule; playground: PlaygroundModule }> => {
  vi.resetModules();
  const kernel = await import('@/hooks/useCompilerKernel');
  const playground = await import('@/hooks/usePlaygroundCompiler');
  return { kernel, playground };
};

const READY = { timeout: 15_000 };

describe('useCompilerKernel with a worker', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', FakeKernelWorker);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('becomes ready and analyses the initial code without any edit', async () => {
    // The first debounced request can reach the worker before init has
    // finished loading lib files; it must wait for them, not fail.
    const { kernel } = await loadHooks();
    const { result } = renderHook(() => kernel.useCompilerKernel({ code: 'export const n: number = "x";', debounceMs: 0 }));

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'), READY);
    await waitFor(() => expect(result.current.timings).not.toBeNull(), READY);
    expect(result.current.errorCount).toBe(1);
    expect(result.current.diagnostics[0]).toMatchObject({ code: 2322, line: 1, column: 14 });
    expect(result.current.info?.libFiles.length).toBeGreaterThan(0);
  });

  it('re-analyses when the code changes and reflects only the latest run', async () => {
    const { kernel } = await loadHooks();
    const { result, rerender } = renderHook(({ code }) => kernel.useCompilerKernel({ code, debounceMs: 0 }), {
      initialProps: { code: 'export const a: string = 1;' },
    });
    await waitFor(() => expect(result.current.errorCount).toBe(1), READY);

    rerender({ code: 'export const a: string = "ok";' });
    await waitFor(() => expect(result.current.errorCount).toBe(0), READY);
    expect(result.current.analysis?.text).toBe('export const a: string = "ok";');
  });

  it('answers typeAt, analyzeNow and transpile on demand', async () => {
    const { kernel } = await loadHooks();
    const code = 'const user = { id: 1, tags: ["a"] as const };\nexport const id = user.id;';
    const { result } = renderHook(() => kernel.useCompilerKernel({ code, debounceMs: 0 }));
    await waitFor(() => expect(result.current.status).toBe('ready'), READY);

    await expect(result.current.typeAt(2, 14)).resolves.toBe('number');
    const now = await result.current.analyzeNow('export const s: string = 42;');
    expect(now?.diagnostics.map((d) => d.code)).toEqual([2322]);
    const emitted = await result.current.transpile('const x: number = 1; export default x;');
    expect(emitted.outputText).toContain('const x = 1;');
  });

  it('reports unavailable instead of crashing where Worker does not exist', async () => {
    vi.unstubAllGlobals();
    vi.stubGlobal('Worker', undefined);
    const { kernel } = await loadHooks();
    const { result } = renderHook(() => kernel.useCompilerKernel({ code: 'export {};' }));
    expect(result.current.status).toBe('unavailable');
    expect(result.current.error).toMatch(/not available/);
    await expect(result.current.analyzeNow()).resolves.toBeNull();
  });

  it('shares one worker across hook instances', async () => {
    FakeKernelWorker.instances = 0;
    const { kernel } = await loadHooks();
    const a = renderHook(() => kernel.useCompilerKernel({ code: 'export const a = 1;', debounceMs: 0 }));
    const b = renderHook(() => kernel.useCompilerKernel({ code: 'export const b = 2;', debounceMs: 0 }));
    await waitFor(() => expect(a.result.current.timings).not.toBeNull(), READY);
    await waitFor(() => expect(b.result.current.timings).not.toBeNull(), READY);
    expect(FakeKernelWorker.instances).toBe(1);
  });
});

describe('useTypeAtCursor', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', FakeKernelWorker);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves the type of the word under the cursor and clears without a word', async () => {
    const { kernel } = await loadHooks();
    const typeAt = vi.fn((line: number, column: number) => Promise.resolve(line === 1 && column === 7 ? 'string' : undefined));
    const { result } = renderHook(() => kernel.useTypeAtCursor(typeAt, 0));

    act(() => result.current.inspect(1, { word: 'name', startColumn: 7 }));
    await waitFor(() => expect(result.current.cursorType).toMatchObject({ word: 'name', type: 'string' }));

    act(() => result.current.inspect(2, null));
    await waitFor(() => expect(result.current.cursorType).toBeNull());
  });
});

describe('usePlaygroundCompiler', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', FakeKernelWorker);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('compiles and type-checks on demand, separating errors from output', async () => {
    const { playground } = await loadHooks();
    const onResult = vi.fn();
    const { result } = renderHook(() => playground.usePlaygroundCompiler({ initialCode: 'export const x = 1;', onResult }));
    await waitFor(() => expect(result.current.kernelStatus).toBe('ready'), READY);

    let ok: Awaited<ReturnType<typeof result.current.compileAndRun>> | undefined;
    await act(async () => {
      ok = await result.current.compileAndRun('const greet = (name: string): string => `hi ${name}`;\nconsole.log(greet("ts"));');
    });
    expect(ok?.success).toBe(true);
    expect(ok?.errors).toEqual([]);
    expect(ok?.javascript).toContain('const greet = (name) =>');
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

    let bad: Awaited<ReturnType<typeof result.current.compileAndRun>> | undefined;
    await act(async () => {
      bad = await result.current.compileAndRun('const n: number = "nope";');
    });
    expect(bad?.success).toBe(false);
    expect(bad?.errors[0]).toMatchObject({ code: 2322, severity: 'error', line: 1 });
  });

  it('tracks editor state: update, stats, reset', async () => {
    const { playground } = await loadHooks();
    const { result } = renderHook(() => playground.usePlaygroundCompiler({ initialCode: 'const a = 1;' }));
    expect(result.current.typescript).toBe('const a = 1;');

    act(() => result.current.updateTypeScript('const a = 1;\nconst b = 2;'));
    expect(result.current.getStats()).toMatchObject({ lines: 2, characters: 25 });

    act(() => result.current.resetCode());
    expect(result.current.typescript).not.toBe('const a = 1;\nconst b = 2;');
  });

  it('accepts a bare string as the initial code (legacy signature)', async () => {
    const { playground } = await loadHooks();
    const { result } = renderHook(() => playground.usePlaygroundCompiler('let legacy = true;'));
    expect(result.current.typescript).toBe('let legacy = true;');
  });
});
