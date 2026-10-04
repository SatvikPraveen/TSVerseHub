// File: src/hooks/useCompilerKernel.ts

/**
 * React binding for the compiler kernel (`src/core/compiler`) running in a
 * module Web Worker. One worker is shared by every hook instance on the page;
 * each instance analyses on its own channel so instances never cancel each
 * other's work.
 *
 * Only type imports reach into `core/compiler/analyze`: the TypeScript compiler
 * and the `lib.*.d.ts` data are bundled into the worker, never into this chunk.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isKernelResponseMessage, type CompilerOptionsJson, type KernelInitResult, type KernelPayload, type KernelRequest, type TranspileResult } from '../core/compiler/kernel-protocol';

import type { AnalysisResult, AnalysisTimings, NormalizedDiagnostic } from '../core/compiler/analyze';

export type KernelStatus = 'loading' | 'ready' | 'error' | 'unavailable';

/** An analysis together with the exact text it was computed for. */
export interface KernelAnalysis {
  readonly text: string;
  readonly result: AnalysisResult;
}

export interface UseCompilerKernelOptions {
  /** The source to analyse; re-analysed (debounced) whenever it changes. */
  readonly code: string;
  /** tsconfig-style options merged over the kernel's strict defaults. */
  readonly compilerOptions?: CompilerOptionsJson;
  /** Virtual path of the analysed file. Defaults to `/index.ts`. */
  readonly fileName?: string;
  /** Quiet period after the last edit before analysing. Defaults to 300 ms. */
  readonly debounceMs?: number;
  /** Set to `false` to suspend automatic analysis. */
  readonly enabled?: boolean;
}

export interface CompilerKernel {
  readonly status: KernelStatus;
  readonly error: string | null;
  /** What the worker loaded during initialisation (libraries, compiler version). */
  readonly info: KernelInitResult | null;
  readonly analysis: KernelAnalysis | null;
  readonly diagnostics: readonly NormalizedDiagnostic[];
  readonly errorCount: number;
  readonly timings: AnalysisTimings | null;
  readonly isAnalyzing: boolean;
  /** Analyse immediately, bypassing the debounce. Resolves to `null` if superseded or unavailable. */
  readonly analyzeNow: (code?: string) => Promise<AnalysisResult | null>;
  /** Display string of the type at a 1-based position in the current code. */
  readonly typeAt: (line: number, column: number) => Promise<string | undefined>;
  /** Strip types with the kernel's `transpile()` (no type information). */
  readonly transpile: (code: string, compilerOptions?: CompilerOptionsJson) => Promise<TranspileResult>;
}

class KernelUnavailableError extends Error {
  constructor(message = 'The compiler worker is not available in this environment') {
    super(message);
    this.name = 'KernelUnavailableError';
  }
}

interface PendingRequest {
  readonly resolve: (payload: KernelPayload | null) => void;
  readonly reject: (error: Error) => void;
}

/** Correlates requests and responses over one module worker. */
class KernelClient {
  private readonly worker: Worker;
  private readonly pending = new Map<number, PendingRequest>();
  private readonly initialisations = new Map<string, Promise<KernelInitResult>>();
  private nextId = 1;
  private failure: Error | null = null;

  constructor() {
    this.worker = new Worker(new URL('../core/compiler/compiler.worker.ts', import.meta.url), { type: 'module' });
    this.worker.addEventListener('message', (event: MessageEvent<unknown>) => this.receive(event.data));
    this.worker.addEventListener('error', (event: ErrorEvent) => this.fail(new Error(event.message || 'The compiler worker failed to start')));
  }

  send(request: KernelRequest): Promise<KernelPayload | null> {
    if (this.failure) return Promise.reject(this.failure);
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ id, request });
    });
  }

  /** Load the libraries for an option set once per page. */
  init(compilerOptions: CompilerOptionsJson | undefined): Promise<KernelInitResult> {
    const key = JSON.stringify(compilerOptions ?? {});
    const existing = this.initialisations.get(key);
    if (existing) return existing;
    const created = this.send(compilerOptions ? { kind: 'init', compilerOptions } : { kind: 'init' }).then((payload) => {
      if (payload?.kind !== 'init') throw new Error('Unexpected reply to kernel initialisation');
      return payload.result;
    });
    created.catch(() => this.initialisations.delete(key));
    this.initialisations.set(key, created);
    return created;
  }

  private receive(data: unknown): void {
    if (!isKernelResponseMessage(data)) return;
    const pending = this.pending.get(data.id);
    if (!pending) return;
    this.pending.delete(data.id);
    switch (data.status) {
      case 'ok':
        pending.resolve(data.payload);
        break;
      case 'cancelled':
        pending.resolve(null);
        break;
      case 'error':
        pending.reject(new Error(data.message));
        break;
    }
  }

  private fail(error: Error): void {
    this.failure = error;
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }
}

let sharedClient: KernelClient | null | undefined;

/** The page-wide kernel client, or `null` where module workers are unavailable (SSR, jsdom). */
export function getKernelClient(): KernelClient | null {
  if (sharedClient === undefined) {
    try {
      sharedClient = typeof Worker === 'undefined' ? null : new KernelClient();
    } catch {
      sharedClient = null;
    }
  }
  return sharedClient;
}

let channelCounter = 0;
const nextChannelName = (): string => `kernel-${++channelCounter}`;

const DEFAULT_FILE = '/index.ts';
const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export function useCompilerKernel(options: UseCompilerKernelOptions): CompilerKernel {
  const { code, compilerOptions, fileName = DEFAULT_FILE, debounceMs = 300, enabled = true } = options;

  const client = useMemo(() => getKernelClient(), []);
  const [status, setStatus] = useState<KernelStatus>(client ? 'loading' : 'unavailable');

  // Callers usually rebuild the options object every render; key on its
  // content. A changed option set is adopted while rendering (the documented
  // "adjust state when a prop changes" pattern), which also puts a kernel that
  // previously failed back into `loading` for the re-initialisation below.
  const optionsKey = JSON.stringify(compilerOptions ?? null);
  const [stableOptionsEntry, setStableOptionsEntry] = useState({ key: optionsKey, value: compilerOptions });
  if (stableOptionsEntry.key !== optionsKey) {
    setStableOptionsEntry({ key: optionsKey, value: compilerOptions });
    if (client) setStatus((previous) => (previous === 'ready' ? previous : 'loading'));
  }
  const stableOptions = stableOptionsEntry.value;

  const [error, setError] = useState<string | null>(client ? null : new KernelUnavailableError().message);
  const [info, setInfo] = useState<KernelInitResult | null>(null);
  const [analysis, setAnalysis] = useState<KernelAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [channelBase] = useState(nextChannelName);
  const latestAnalysisRef = useRef(0);
  const latestTypeAtRef = useRef(0);
  // Read by the on-demand callbacks; kept current after each commit.
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialise once per option set: loads the reachable lib files in the worker.
  useEffect(() => {
    if (!client) return;
    let current = true;
    client.init(stableOptions).then(
      (result) => {
        if (!current) return;
        setInfo(result);
        setStatus('ready');
        setError(null);
      },
      (failure: unknown) => {
        if (!current) return;
        setStatus('error');
        setError(errorMessage(failure));
      },
    );
    return () => {
      current = false;
    };
  }, [client, stableOptions]);

  const files = useCallback((text: string) => [{ path: fileName, text }], [fileName]);

  /**
   * Analyse `text` on a sub-channel. Debounced runs use `live`, on-demand runs
   * use `now`, so a pending on-demand analysis is never cancelled by a later
   * debounced one. State always reflects the most recently *started* run.
   */
  const runAnalysis = useCallback(
    async (text: string, lane: 'live' | 'now'): Promise<AnalysisResult | null> => {
      if (!client) return null;
      const sequence = ++latestAnalysisRef.current;
      const channel = `${channelBase}:${lane}`;
      setIsAnalyzing(true);
      try {
        const request: KernelRequest = stableOptions
          ? { kind: 'analyze', channel, files: files(text), compilerOptions: stableOptions }
          : { kind: 'analyze', channel, files: files(text) };
        const payload = await client.send(request);
        if (payload?.kind !== 'analyze') return null;
        if (mountedRef.current && sequence === latestAnalysisRef.current) {
          setAnalysis({ text, result: payload.result });
          setError(null);
        }
        return payload.result;
      } catch (failure) {
        if (mountedRef.current && sequence === latestAnalysisRef.current) setError(errorMessage(failure));
        return null;
      } finally {
        if (mountedRef.current && sequence === latestAnalysisRef.current) setIsAnalyzing(false);
      }
    },
    [client, channelBase, files, stableOptions],
  );

  const analyzeNow = useCallback((text: string = codeRef.current) => runAnalysis(text, 'now'), [runAnalysis]);

  // Debounced analysis of the current code. Superseded runs are cancelled in
  // the worker (same channel) and ignored here (sequence check). A request
  // sent before initialisation completes is safe: the worker awaits the same
  // memoised lib provider before analysing.
  useEffect(() => {
    if (!client || !enabled) return;
    const handle = setTimeout(() => {
      void runAnalysis(code, 'live');
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [client, enabled, code, debounceMs, runAnalysis]);

  const typeAt = useCallback(
    async (line: number, column: number): Promise<string | undefined> => {
      if (!client) return undefined;
      const sequence = ++latestTypeAtRef.current;
      const base = { kind: 'typeAt', channel: channelBase, files: files(codeRef.current), file: fileName, line, column } as const;
      const payload = await client.send(stableOptions ? { ...base, compilerOptions: stableOptions } : base).catch(() => null);
      if (sequence !== latestTypeAtRef.current || payload?.kind !== 'typeAt') return undefined;
      return payload.result;
    },
    [client, channelBase, fileName, files, stableOptions],
  );

  const transpile = useCallback(
    async (text: string, overrides?: CompilerOptionsJson): Promise<TranspileResult> => {
      if (!client) throw new KernelUnavailableError();
      const transpileOptions = overrides ?? stableOptions;
      const payload = await client.send(transpileOptions ? { kind: 'transpile', text, compilerOptions: transpileOptions } : { kind: 'transpile', text });
      if (payload?.kind !== 'transpile') throw new Error('Unexpected reply to transpile');
      return payload.result;
    },
    [client, stableOptions],
  );

  return {
    status,
    error,
    info,
    analysis,
    diagnostics: analysis?.result.diagnostics ?? [],
    errorCount: analysis?.result.errorCount ?? 0,
    timings: analysis?.result.timings ?? null,
    isAnalyzing,
    analyzeNow,
    typeAt,
    transpile,
  };
}

/** The identifier under the cursor and its type, as resolved by the kernel. */
export interface CursorType {
  readonly word: string;
  readonly line: number;
  readonly column: number;
  readonly type: string;
}

export interface CursorWord {
  readonly word: string;
  /** 1-based column where the word starts. */
  readonly startColumn: number;
}

/**
 * Debounced "type at cursor" readout over {@link CompilerKernel.typeAt}.
 * Pass the word under the cursor (Monaco's `getWordAtPosition`); positions
 * outside an identifier clear the readout instead of asking the worker.
 */
export function useTypeAtCursor(typeAt: CompilerKernel['typeAt'], delayMs = 150) {
  const [cursorType, setCursorType] = useState<CursorType | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequenceRef = useRef(0);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const inspect = useCallback(
    (line: number, word: CursorWord | null) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const sequence = ++sequenceRef.current;
      if (!word) {
        setCursorType(null);
        return;
      }
      timerRef.current = setTimeout(() => {
        void typeAt(line, word.startColumn).then((type) => {
          if (sequence !== sequenceRef.current) return;
          setCursorType(type === undefined ? null : { word: word.word, line, column: word.startColumn, type });
        });
      }, delayMs);
    },
    [typeAt, delayMs],
  );

  return { cursorType, inspect };
}
