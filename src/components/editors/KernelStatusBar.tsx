// File location: src/components/editors/KernelStatusBar.tsx

import type { AnalysisTimings } from '../../core/compiler/analyze';
import type { KernelInitResult } from '../../core/compiler/kernel-protocol';
import type { CursorType, KernelStatus } from '../../hooks/useCompilerKernel';
import type React from 'react';

export interface KernelStatusBarProps {
  status: KernelStatus;
  error: string | null;
  info: KernelInitResult | null;
  timings: AnalysisTimings | null;
  errorCount: number;
  isAnalyzing: boolean;
  cursorType: CursorType | null;
  className?: string;
}

const formatMs = (ms: number): string => (ms < 10 ? ms.toFixed(1) : Math.round(ms).toString());

const STATUS_LABEL: Readonly<Record<KernelStatus, string>> = {
  loading: 'Loading compiler…',
  ready: 'Compiler ready',
  error: 'Compiler error',
  unavailable: 'Compiler unavailable',
};

/** One-line readout of the compiler kernel: status, timings, error count and type at cursor. */
export const KernelStatusBar: React.FC<KernelStatusBarProps> = ({ status, error, info, timings, errorCount, isAnalyzing, cursorType, className = '' }) => (
  <div
    className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 ${className}`}
    aria-live="polite"
  >
    <span title={error ?? (info ? `TypeScript ${info.typescriptVersion}, ${info.libFiles.length} lib files` : undefined)}>
      {isAnalyzing ? 'Checking…' : STATUS_LABEL[status]}
      {info && status === 'ready' ? ` · TS ${info.typescriptVersion}` : ''}
    </span>
    {timings && (
      <span title="Program creation (parse and resolve) and type checking, measured in the compiler worker">
        program {formatMs(timings.programMs)} ms · check {formatMs(timings.checkMs)} ms
      </span>
    )}
    {timings && <span className={errorCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}>{errorCount === 1 ? '1 error' : `${errorCount} errors`}</span>}
    <span className="min-w-0 truncate" title={cursorType ? `${cursorType.word}: ${cursorType.type}` : undefined}>
      {cursorType ? (
        <>
          <span className="text-blue-700 dark:text-blue-300">{cursorType.word}</span>: {cursorType.type}
        </>
      ) : (
        'Place the cursor on an identifier to see its type'
      )}
    </span>
  </div>
);

export default KernelStatusBar;
