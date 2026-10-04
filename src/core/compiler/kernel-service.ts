/**
 * Request handler behind the compiler-kernel worker. It is plain code over
 * {@link analyze}, {@link typeAt} and {@link transpile} with the browser lib
 * provider, so it runs (and is tested) outside a worker as well.
 *
 * @module core/compiler/kernel-service
 */

import * as ts from 'typescript';

import { analyze, normalizeDiagnostic, STRICT_COMPILER_OPTIONS, transpile, typeAt, type AnalysisResult, type NormalizedDiagnostic } from './analyze';
import { browserLibStats, createBrowserLibProvider } from './browser-libs';

import type { CompilerOptionsJson, KernelPayload, KernelRequest } from './kernel-protocol';
import type { LibProvider } from './virtual-host';

export interface ResolvedCompilerOptions {
  readonly options: ts.CompilerOptions;
  /** Problems converting the JSON options (unknown option, invalid value). */
  readonly diagnostics: readonly NormalizedDiagnostic[];
}

/** Convert tsconfig-style JSON options into compiler options. */
export function resolveCompilerOptions(json: CompilerOptionsJson | undefined): ResolvedCompilerOptions {
  if (!json) return { options: {}, diagnostics: [] };
  const { options, errors } = ts.convertCompilerOptionsFromJson(json, '/');
  return { options, diagnostics: errors.map(normalizeDiagnostic) };
}

/** Root library files a program with these options (over the kernel defaults) starts from. */
export function rootLibsFor(options: ts.CompilerOptions): string[] {
  const merged: ts.CompilerOptions = { ...STRICT_COMPILER_OPTIONS, ...options };
  if (merged.noLib) return [];
  return merged.lib ? [...merged.lib] : [ts.getDefaultLibFileName(merged)];
}

const withOptionDiagnostics = (result: AnalysisResult, optionDiagnostics: readonly NormalizedDiagnostic[]): AnalysisResult => {
  if (optionDiagnostics.length === 0) return result;
  const diagnostics = [...optionDiagnostics, ...result.diagnostics];
  return { ...result, diagnostics, errorCount: diagnostics.filter((d) => d.category === 'error').length };
};

/** Let queued messages run so that newer requests can supersede this one. */
const yieldToEventLoop = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export interface KernelService {
  /**
   * Handle one request. Resolves to `null` when the request was superseded
   * by a newer one on the same channel; rejects on failure.
   */
  handle(id: number, request: KernelRequest): Promise<KernelPayload | null>;
}

export function createKernelService(): KernelService {
  const latest = new Map<string, number>();

  const libsFor = (options: ts.CompilerOptions): Promise<LibProvider> => createBrowserLibProvider({ libs: rootLibsFor(options) });

  /** Wait for libraries and a turn of the event loop; false if superseded meanwhile. */
  const claim = async (key: string, id: number, options: ts.CompilerOptions): Promise<LibProvider | null> => {
    latest.set(key, id);
    const libs = await libsFor(options);
    await yieldToEventLoop();
    return latest.get(key) === id ? libs : null;
  };

  return {
    async handle(id, request) {
      switch (request.kind) {
        case 'init': {
          const started = now();
          const { options } = resolveCompilerOptions(request.compilerOptions);
          await createBrowserLibProvider(request.preloadAll ? { preloadAll: true } : { libs: rootLibsFor(options) });
          const stats = browserLibStats();
          return {
            kind: 'init',
            result: { typescriptVersion: ts.version, libFiles: stats.files, libCharacters: stats.characters, loadMs: now() - started },
          };
        }
        case 'analyze': {
          const { options, diagnostics } = resolveCompilerOptions(request.compilerOptions);
          const libs = await claim(`analyze:${request.channel}`, id, options);
          if (!libs) return null;
          const result = analyze({ files: request.files, libs, compilerOptions: options });
          return { kind: 'analyze', result: withOptionDiagnostics(result, diagnostics) };
        }
        case 'typeAt': {
          const { options } = resolveCompilerOptions(request.compilerOptions);
          const libs = await claim(`typeAt:${request.channel}`, id, options);
          if (!libs) return null;
          let result: string | undefined;
          try {
            result = typeAt({ files: request.files, libs, compilerOptions: options, file: request.file, line: request.line, column: request.column });
          } catch {
            // Positions past the end of the text throw inside the compiler; there is no type there.
            result = undefined;
          }
          return { kind: 'typeAt', result };
        }
        case 'transpile': {
          const { options } = resolveCompilerOptions(request.compilerOptions);
          return { kind: 'transpile', result: transpile(request.text, options) };
        }
      }
    },
  };
}
