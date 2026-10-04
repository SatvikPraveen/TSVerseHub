// File location: src/components/editors/kernelMarkers.ts

/**
 * Map compiler-kernel diagnostics onto Monaco marker data.
 *
 * Kernel diagnostics carry a 1-based `line`/`column` and a 0-based character
 * offset `start` with a `length`. Monaco positions are 1-based, so the start
 * line/column pass through unchanged and the end position is derived from the
 * 0-based end offset (`start + length`) against the analysed text.
 */

import type { CodeEditorMarker, CodeEditorMarkerSeverity } from './CodeEditor';
import type { NormalizedDiagnostic } from '../../core/compiler/analyze';

const SEVERITY: Readonly<Record<NormalizedDiagnostic['category'], CodeEditorMarkerSeverity>> = {
  error: 'Error',
  warning: 'Warning',
  suggestion: 'Hint',
  message: 'Info',
};

/** Start offsets (0-based) of every line in `text`. */
const lineStarts = (text: string): number[] => {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
};

/** Convert a 0-based offset into a 1-based Monaco position. */
export const offsetToPosition = (starts: readonly number[], offset: number): { lineNumber: number; column: number } => {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if ((starts[mid] ?? 0) <= offset) low = mid;
    else high = mid - 1;
  }
  return { lineNumber: low + 1, column: offset - (starts[low] ?? 0) + 1 };
};

/**
 * Markers for the diagnostics that belong to `fileName` (or to no file, such
 * as option errors, which are pinned to 1:1). `text` must be the exact text the
 * diagnostics were computed for.
 */
export function kernelDiagnosticsToMarkers(diagnostics: readonly NormalizedDiagnostic[], text: string, fileName = '/index.ts'): CodeEditorMarker[] {
  const starts = lineStarts(text);
  const markers: CodeEditorMarker[] = [];
  for (const diagnostic of diagnostics) {
    if (diagnostic.file !== undefined && diagnostic.file !== fileName) continue;
    const base = { message: diagnostic.message, severity: SEVERITY[diagnostic.category], code: `TS${diagnostic.code}`, source: 'ts-kernel' };
    if (diagnostic.start === undefined) {
      markers.push({ ...base, startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 2 });
      continue;
    }
    const start = offsetToPosition(starts, diagnostic.start);
    const end = offsetToPosition(starts, diagnostic.start + Math.max(diagnostic.length ?? 0, 1));
    markers.push({
      ...base,
      startLineNumber: diagnostic.line ?? start.lineNumber,
      startColumn: diagnostic.column ?? start.column,
      endLineNumber: end.lineNumber,
      endColumn: end.column,
    });
  }
  return markers;
}
