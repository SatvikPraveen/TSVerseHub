/**
 * Message protocol between the playground and the compiler-kernel worker.
 *
 * Only types and tiny runtime guards live here: importing this module never
 * pulls the TypeScript compiler into the importing bundle.
 *
 * @module core/compiler/kernel-protocol
 */

import type { AnalysisResult, NormalizedDiagnostic } from './analyze';
import type { VirtualFile } from './virtual-host';

/**
 * Compiler options in tsconfig JSON form (`{ "target": "ES2020", "lib": ["DOM"] }`).
 * The worker converts them with `ts.convertCompilerOptionsFromJson`, so the
 * main thread never needs the compiler's enums.
 */
export interface CompilerOptionsJson {
  readonly [option: string]: string | number | boolean | readonly string[] | undefined;
}

export interface TranspileResult {
  readonly outputText: string;
  readonly diagnostics: readonly NormalizedDiagnostic[];
}

export interface KernelInitResult {
  readonly typescriptVersion: string;
  /** Library files held in memory after initialisation, sorted. */
  readonly libFiles: readonly string[];
  /** Total UTF-16 length of the loaded library text. */
  readonly libCharacters: number;
  readonly loadMs: number;
}

/**
 * Requests carrying a `channel` are coalesced per channel: when a newer
 * request of the same kind arrives on the same channel before an older one
 * starts, the older one is answered with a cancellation.
 */
export type KernelRequest =
  | { readonly kind: 'init'; readonly compilerOptions?: CompilerOptionsJson; readonly preloadAll?: boolean }
  | {
      readonly kind: 'analyze';
      readonly channel: string;
      readonly files: readonly VirtualFile[];
      readonly compilerOptions?: CompilerOptionsJson;
    }
  | {
      readonly kind: 'typeAt';
      readonly channel: string;
      readonly files: readonly VirtualFile[];
      readonly compilerOptions?: CompilerOptionsJson;
      readonly file: string;
      /** 1-based. */
      readonly line: number;
      /** 1-based. */
      readonly column: number;
    }
  | { readonly kind: 'transpile'; readonly text: string; readonly compilerOptions?: CompilerOptionsJson };

export type KernelPayload =
  | { readonly kind: 'init'; readonly result: KernelInitResult }
  | { readonly kind: 'analyze'; readonly result: AnalysisResult }
  | { readonly kind: 'typeAt'; readonly result: string | undefined }
  | { readonly kind: 'transpile'; readonly result: TranspileResult };

export interface KernelRequestMessage {
  readonly id: number;
  readonly request: KernelRequest;
}

export type KernelResponseMessage =
  | { readonly id: number; readonly status: 'ok'; readonly payload: KernelPayload }
  | { readonly id: number; readonly status: 'cancelled' }
  | { readonly id: number; readonly status: 'error'; readonly message: string };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const REQUEST_KINDS: ReadonlySet<unknown> = new Set(['init', 'analyze', 'typeAt', 'transpile']);
const RESPONSE_STATUSES: ReadonlySet<unknown> = new Set(['ok', 'cancelled', 'error']);

/** Shallow structural check for messages arriving at the worker. */
export function isKernelRequestMessage(value: unknown): value is KernelRequestMessage {
  return isRecord(value) && typeof value.id === 'number' && isRecord(value.request) && REQUEST_KINDS.has(value.request.kind);
}

/** Shallow structural check for messages arriving from the worker. */
export function isKernelResponseMessage(value: unknown): value is KernelResponseMessage {
  return isRecord(value) && typeof value.id === 'number' && RESPONSE_STATUSES.has(value.status);
}
