// File: src/components/curriculum/SampleCard.tsx

import { clsx } from 'clsx';

import { describeAssertionPosition, describeExpectation, expectationClasses } from './format';

import type { CodeSample } from '@/core/curriculum/schema';
import type React from 'react';

export interface SampleCardProps {
  moduleId: string;
  sample: CodeSample;
}

/**
 * One verified code sample: title, source, the compiler expectation the
 * verifier enforces, and any pinned type assertions.
 */
export const SampleCard: React.FC<SampleCardProps> = ({ moduleId, sample }) => {
  const headingId = `${moduleId}-${sample.id}-title`;
  const overrides = sample.compilerOptions ? Object.entries(sample.compilerOptions) : [];

  return (
    <article
      aria-labelledby={headingId}
      data-sample-id={sample.id}
      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <h4 id={headingId} className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {sample.title}
        </h4>
        <span
          data-testid="expectation-badge"
          className={clsx('px-2 py-0.5 rounded-full text-xs font-mono font-medium whitespace-nowrap', expectationClasses(sample.expectation))}
        >
          {describeExpectation(sample.expectation)}
        </span>
      </header>

      <pre className="mt-3 overflow-x-auto rounded-md bg-slate-900 dark:bg-slate-950 text-slate-100 text-sm leading-relaxed p-4">
        <code>{sample.code}</code>
      </pre>

      {sample.typeAssertions && sample.typeAssertions.length > 0 && (
        <div className="mt-3">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Type assertions</h5>
          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
            {sample.typeAssertions.map((assertion) => (
              <li key={`${assertion.line}:${assertion.column}`} data-testid="type-assertion">
                {describeAssertionPosition(assertion)} is{' '}
                <code className="px-1 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-700 font-mono text-xs">{assertion.expected}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {overrides.length > 0 && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Compiler options:{' '}
          {overrides.map(([key, value]) => (
            <code key={key} className="mr-2 font-mono">
              {key}={String(value)}
            </code>
          ))}
        </p>
      )}
    </article>
  );
};
