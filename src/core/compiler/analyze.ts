/**
 * Compile-and-diagnose pipeline over the virtual host.
 *
 * @module core/compiler/analyze
 */

import ts from 'typescript';

import { createVirtualHost, normalizePath, type LibProvider, type VirtualFile } from './virtual-host';

/** Diagnostic in a serialisable, position-resolved form. */
export interface NormalizedDiagnostic {
  readonly code: number;
  readonly category: 'error' | 'warning' | 'suggestion' | 'message';
  readonly message: string;
  readonly file?: string;
  /** 1-based line. */
  readonly line?: number;
  /** 1-based column. */
  readonly column?: number;
  readonly start?: number;
  readonly length?: number;
}

export interface AnalysisTimings {
  /** Wall-clock time to create the program (parsing and module resolution). */
  readonly programMs: number;
  /** Wall-clock time spent in binding and checking. */
  readonly checkMs: number;
  /** Wall-clock time spent emitting (0 when emit is skipped). */
  readonly emitMs: number;
  readonly totalMs: number;
}

export interface AnalysisResult {
  readonly diagnostics: readonly NormalizedDiagnostic[];
  readonly errorCount: number;
  /** Emitted output keyed by virtual path (empty when `emit` is false). */
  readonly outputs: Readonly<Record<string, string>>;
  readonly timings: AnalysisTimings;
  /** Number of source files in the program, libraries included. */
  readonly sourceFileCount: number;
}

export interface AnalyzeOptions {
  readonly files: readonly VirtualFile[];
  readonly libs: LibProvider;
  readonly compilerOptions?: ts.CompilerOptions;
  /** Emit JavaScript and declaration output. Defaults to `false`. */
  readonly emit?: boolean;
  /** Injectable clock for deterministic tests. */
  readonly now?: () => number;
}

/** Strict options used by the curriculum unless a sample overrides them. */
export const STRICT_COMPILER_OPTIONS: ts.CompilerOptions = Object.freeze({
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  strict: true,
  noUncheckedIndexedAccess: true,
  noImplicitOverride: true,
  noFallthroughCasesInSwitch: true,
  useUnknownInCatchVariables: true,
  exactOptionalPropertyTypes: false,
  experimentalDecorators: true,
  emitDecoratorMetadata: false,
  jsx: ts.JsxEmit.ReactJSX,
  skipLibCheck: true,
  noEmit: true,
  isolatedModules: false,
  types: [],
});

const categoryName = (category: ts.DiagnosticCategory): NormalizedDiagnostic['category'] => {
  switch (category) {
    case ts.DiagnosticCategory.Error:
      return 'error';
    case ts.DiagnosticCategory.Warning:
      return 'warning';
    case ts.DiagnosticCategory.Suggestion:
      return 'suggestion';
    case ts.DiagnosticCategory.Message:
      return 'message';
  }
};

/** Convert a compiler diagnostic into a plain object with resolved positions. */
export function normalizeDiagnostic(diagnostic: ts.Diagnostic): NormalizedDiagnostic {
  const base: NormalizedDiagnostic = {
    code: diagnostic.code,
    category: categoryName(diagnostic.category),
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  };
  if (!diagnostic.file || diagnostic.start === undefined) return base;
  const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  return {
    ...base,
    file: diagnostic.file.fileName,
    line: line + 1,
    column: character + 1,
    start: diagnostic.start,
    length: diagnostic.length ?? 0,
  };
}

const defaultNow = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();

/**
 * Type-check (and optionally emit) a set of virtual files.
 *
 * The function is pure with respect to its inputs: given the same files,
 * options and library provider it yields the same diagnostics. Timings are
 * measured with the injected clock and are the only non-deterministic output.
 */
export function analyze(options: AnalyzeOptions): AnalysisResult {
  const now = options.now ?? defaultNow;
  const compilerOptions: ts.CompilerOptions = { ...STRICT_COMPILER_OPTIONS, ...options.compilerOptions };
  if (options.emit) {
    compilerOptions.noEmit = false;
    compilerOptions.outDir = '/out';
  }
  const host = createVirtualHost({ files: options.files, compilerOptions, libs: options.libs });
  const rootNames = options.files.map((file) => normalizePath(file.path));

  const t0 = now();
  const program = ts.createProgram({ rootNames, options: compilerOptions, host });
  const t1 = now();

  const diagnostics: ts.Diagnostic[] = [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
  ];
  const t2 = now();

  if (options.emit) {
    const emitResult = program.emit();
    diagnostics.push(...emitResult.diagnostics);
  }
  const t3 = now();

  const normalized = ts.sortAndDeduplicateDiagnostics(diagnostics).map(normalizeDiagnostic);
  return {
    diagnostics: normalized,
    errorCount: normalized.filter((d) => d.category === 'error').length,
    outputs: Object.fromEntries(host.outputs),
    timings: {
      programMs: t1 - t0,
      checkMs: t2 - t1,
      emitMs: t3 - t2,
      totalMs: t3 - t0,
    },
    sourceFileCount: program.getSourceFiles().length,
  };
}

/**
 * Resolve the display string of the type of the identifier at a position.
 * Useful for "hover" features and for asserting inferred types in tests.
 */
export function typeAt(options: AnalyzeOptions & { readonly file: string; readonly line: number; readonly column: number }): string | undefined {
  const compilerOptions: ts.CompilerOptions = { ...STRICT_COMPILER_OPTIONS, ...options.compilerOptions };
  const host = createVirtualHost({ files: options.files, compilerOptions, libs: options.libs });
  const program = ts.createProgram({ rootNames: options.files.map((f) => normalizePath(f.path)), options: compilerOptions, host });
  const sourceFile = program.getSourceFile(normalizePath(options.file));
  if (!sourceFile) return undefined;
  const position = sourceFile.getPositionOfLineAndCharacter(options.line - 1, options.column - 1);
  const checker = program.getTypeChecker();

  const findNode = (node: ts.Node): ts.Node | undefined => {
    if (position < node.getStart(sourceFile) || position >= node.getEnd()) return undefined;
    return ts.forEachChild(node, findNode) ?? node;
  };
  const node = findNode(sourceFile);
  if (!node) return undefined;
  const type = checker.getTypeAtLocation(node);
  return checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias);
}

/**
 * Fast single-file transpilation without type information. Suitable for live
 * previews; use {@link analyze} when diagnostics are required.
 */
export function transpile(text: string, compilerOptions: ts.CompilerOptions = {}): { readonly outputText: string; readonly diagnostics: readonly NormalizedDiagnostic[] } {
  const result = ts.transpileModule(text, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, ...compilerOptions },
    reportDiagnostics: true,
  });
  return { outputText: result.outputText, diagnostics: (result.diagnostics ?? []).map(normalizeDiagnostic) };
}
