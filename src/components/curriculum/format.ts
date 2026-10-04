/**
 * Presentation helpers shared by the curriculum components.
 *
 * Kept free of JSX so the component files export components only (the
 * react-refresh lint rule) and so the formatting can be unit-tested without
 * a DOM.
 *
 * @module components/curriculum/format
 */

import type { Difficulty, LearningObjective, SampleExpectation, TypeAssertion } from '@/core/curriculum/schema';

/** Human-readable form of a sample expectation, e.g. `errors: TS2345, TS2344`. */
export const describeExpectation = (expectation: SampleExpectation): string => {
  if (expectation.kind === 'compiles') return 'compiles';
  const codes = expectation.codes ?? [];
  return codes.length === 0 ? 'errors' : `errors: ${codes.map((code) => `TS${code}`).join(', ')}`;
};

/** Position part of a type assertion, e.g. `line 1:7`. */
export const describeAssertionPosition = (assertion: TypeAssertion): string => `line ${assertion.line}:${assertion.column}`;

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

export const difficultyClasses: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  expert: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

export const bloomClasses: Record<LearningObjective['level'], string> = {
  remember: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  understand: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  apply: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  analyze: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  evaluate: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  create: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
};

export const expectationClasses = (expectation: SampleExpectation): string =>
  expectation.kind === 'compiles'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
