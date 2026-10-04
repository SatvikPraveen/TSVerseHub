// File: src/hooks/usePlaygroundCompiler.ts

/**
 * Playground state on top of the compiler kernel ({@link useCompilerKernel}).
 *
 * Diagnostics, timings and type information come from `src/core/compiler`
 * (the code the curriculum verifier runs) executing in a Web Worker; JavaScript
 * for execution is produced by the kernel's `transpile()`. Compiler options are
 * the EditorConfig presets, projected with `toKernelCompilerOptions`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCompilerKernel } from './useCompilerKernel';
import { useDebounce } from './useDebounce';
import {
  getTypeScriptCompilerOptions,
  toKernelCompilerOptions,
  type CompilerOptionsPreset,
  type TypeScriptConfig,
} from '../components/editors/EditorConfig';

import type { NormalizedDiagnostic } from '../core/compiler/analyze';
import type { CompilerOptionsJson } from '../core/compiler/kernel-protocol';

/** Compiler options of the playground: an EditorConfig TypeScript configuration. */
export type CompilerOptions = TypeScriptConfig;

export interface CompilerDiagnostic {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: number;
}

export interface CompilerResult {
  javascript: string;
  diagnostics: CompilerDiagnostic[];
  success: boolean;
  executionTime: number;
}

/** Result of an on-demand `compileAndRun` call. `errors` lists only error-severity diagnostics. */
export interface CompileAndRunResult extends CompilerResult {
  errors: CompilerDiagnostic[];
}

export interface UsePlaygroundCompilerOptions {
  /** Code loaded into the editor on first render. */
  initialCode?: string;
  /** EditorConfig preset the options start from. Defaults to `learning`. */
  preset?: CompilerOptionsPreset;
  /** Overrides merged on top of the preset. */
  compilerOptions?: Partial<CompilerOptions>;
  /** Invoked after every on-demand compilation (`compileAndRun`, `transpile`). */
  onResult?: (result: CompilerResult) => void;
  /** Keep `javascript` in sync with the code (debounced). Defaults to `false`. */
  liveTranspile?: boolean;
  /** Quiet period before re-analysing after an edit. Defaults to 300 ms. */
  debounceMs?: number;
}

/**
 * Analysis-only overrides: every playground buffer is treated as a module so
 * top-level names (`name`, `status`, ...) do not collide with `lib.dom.d.ts`
 * globals. Not applied to `transpile`, whose output must stay a plain script.
 */
const PLAYGROUND_ANALYSIS_OVERRIDES: CompilerOptionsJson = { moduleDetection: 'force' };

const SEVERITY: Readonly<Record<NormalizedDiagnostic['category'], CompilerDiagnostic['severity']>> = {
  error: 'error',
  warning: 'warning',
  suggestion: 'info',
  message: 'info',
};

/** Convert kernel diagnostics to the playground's flat shape (positions default to 1:1). */
export const toCompilerDiagnostics = (diagnostics: readonly NormalizedDiagnostic[]): CompilerDiagnostic[] =>
  diagnostics.map((d) => ({ line: d.line ?? 1, column: d.column ?? 1, message: d.message, severity: SEVERITY[d.category], code: d.code }));

const now = (): number => performance.now();

const DEFAULT_TYPESCRIPT = `// Welcome to the TypeScript Playground!
// Try typing some TypeScript code below and see it compile in real-time

interface User {
  id: number;
  name: string;
  email?: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): readonly User[] {
    return Object.freeze([...this.users]);
  }
}

// Create a new user service
const userService = new UserService();

// Add some users
userService.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
userService.addUser({ id: 2, name: 'Bob' });

// Get users
const alice = userService.getUserById(1);
const allUsers = userService.getAllUsers();

console.log('Alice:', alice);
console.log('All users:', allUsers);

// Generic function example
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>('Hello TypeScript!');

// Union types and type guards
type Status = 'loading' | 'success' | 'error';

function handleStatus(status: Status): string {
  switch (status) {
    case 'loading':
      return 'Please wait...';
    case 'success':
      return 'Operation completed!';
    case 'error':
      return 'Something went wrong!';
    default:
      // TypeScript ensures this is unreachable
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

console.log('Status message:', handleStatus('success'));`;

/**
 * Custom hook for TypeScript playground functionality
 */
export const usePlaygroundCompiler = (init?: string | UsePlaygroundCompilerOptions) => {
  const hookOptions: UsePlaygroundCompilerOptions = typeof init === 'string' ? { initialCode: init } : init ?? {};
  const { initialCode, onResult, preset = 'learning', liveTranspile = false, debounceMs = 300 } = hookOptions;

  const [typescript, setTypescript] = useState(initialCode || DEFAULT_TYPESCRIPT);
  const [javascript, setJavascript] = useState('');
  const [options, setOptions] = useState<CompilerOptions>(() => ({ ...getTypeScriptCompilerOptions(preset), ...hookOptions.compilerOptions }));
  const [compilationResult, setCompilationResult] = useState<CompilerResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  /** Preset options in kernel (tsconfig JSON) form; fed to transpile as-is. */
  const kernelOptions = useMemo(() => toKernelCompilerOptions(options), [options]);
  const analysisOptions = useMemo(() => ({ ...kernelOptions, ...PLAYGROUND_ANALYSIS_OVERRIDES }), [kernelOptions]);

  const kernel = useCompilerKernel({ code: typescript, compilerOptions: analysisOptions, debounceMs });
  const { analyzeNow, transpile: kernelTranspile } = kernel;

  const diagnostics = useMemo(() => toCompilerDiagnostics(kernel.diagnostics), [kernel.diagnostics]);

  // Optional live JavaScript output.
  const debouncedCode = useDebounce(typescript, debounceMs);
  useEffect(() => {
    if (!liveTranspile || kernel.status === 'unavailable') return;
    let current = true;
    kernelTranspile(debouncedCode, kernelOptions).then(
      (result) => {
        if (current) setJavascript(result.outputText);
      },
      () => undefined,
    );
    return () => {
      current = false;
    };
  }, [liveTranspile, debouncedCode, kernelOptions, kernelTranspile, kernel.status]);

  // Type-check and transpile immediately (bypassing the debounce) and report the outcome.
  const compileAndRun = useCallback(
    async (code: string): Promise<CompileAndRunResult> => {
      setTypescript(code);
      setIsRunning(true);
      const started = now();
      try {
        const [analysis, emitted] = await Promise.all([analyzeNow(code), kernelTranspile(code, kernelOptions)]);
        if (!analysis) throw new Error('Type checking was superseded or is unavailable');
        const all = toCompilerDiagnostics([...analysis.diagnostics, ...emitted.diagnostics]);
        const result: CompilerResult = {
          javascript: emitted.outputText,
          diagnostics: all,
          success: all.every((d) => d.severity !== 'error'),
          executionTime: now() - started,
        };
        setJavascript(result.javascript);
        setCompilationResult(result);
        onResultRef.current?.(result);
        return { ...result, errors: result.diagnostics.filter((d) => d.severity === 'error') };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const failure: CompilerDiagnostic = { line: 1, column: 1, message, severity: 'error', code: 0 };
        const result: CompilerResult = { javascript: '', diagnostics: [failure], success: false, executionTime: now() - started };
        setCompilationResult(result);
        return { ...result, errors: [failure] };
      } finally {
        setIsRunning(false);
      }
    },
    [analyzeNow, kernelTranspile, kernelOptions],
  );

  // Transpile to JavaScript; resolves to null when compilation reported errors
  const transpile = useCallback(
    async (code: string): Promise<string | null> => {
      const result = await compileAndRun(code);
      return result.success ? result.javascript : null;
    },
    [compileAndRun],
  );

  // Type-check only
  const getDiagnostics = useCallback(
    async (code: string): Promise<CompilerDiagnostic[]> => {
      const result = await analyzeNow(code);
      return result ? toCompilerDiagnostics(result.diagnostics) : [];
    },
    [analyzeNow],
  );

  const updateTypeScript = useCallback((code: string) => setTypescript(code), []);

  const updateOptions = useCallback((newOptions: Partial<CompilerOptions>) => {
    setOptions((previous) => ({ ...previous, ...newOptions }));
  }, []);

  const resetCode = useCallback(() => {
    setTypescript(DEFAULT_TYPESCRIPT);
    setJavascript('');
  }, []);

  const loadExample = useCallback((exampleCode: string) => setTypescript(exampleCode), []);

  // Format code (simple implementation)
  const formatCode = useCallback(() => {
    const formatted = typescript
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replace(/\{\s*\n\s*\n/g, '{\n')
      .replace(/\n\s*\n\s*\}/g, '\n}');
    setTypescript(formatted);
  }, [typescript]);

  const getStats = useCallback(() => {
    const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
    const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
    return {
      lines: typescript.split('\n').length,
      characters: typescript.length,
      errorCount,
      warningCount,
      hasErrors: errorCount > 0,
    };
  }, [typescript, diagnostics]);

  return {
    // State
    typescript,
    javascript,
    diagnostics,
    compilerErrors: diagnostics.filter((d) => d.severity === 'error'),
    compilationResult,
    isCompiling: isRunning || kernel.isAnalyzing,
    options,
    kernelOptions: analysisOptions,

    // Kernel
    kernelStatus: kernel.status,
    kernelError: kernel.error,
    kernelInfo: kernel.info,
    analysis: kernel.analysis,
    kernelDiagnostics: kernel.diagnostics,
    errorCount: kernel.errorCount,
    timings: kernel.timings,
    isAnalyzing: kernel.isAnalyzing,
    typeAt: kernel.typeAt,

    // Actions
    updateTypeScript,
    updateOptions,
    resetCode,
    loadExample,
    formatCode,
    compileAndRun,
    transpile,
    getDiagnostics,

    // Utilities
    getStats,
  };
};
