/**
 * Curriculum data model.
 *
 * A curriculum is a set of {@link ConceptModule}s connected by prerequisite
 * edges. Each module carries machine-checkable {@link CodeSample}s whose
 * expectations are verified by {@link verifyCurriculum} against the real
 * compiler, so the teaching material cannot silently drift from the language.
 *
 * @module core/curriculum/schema
 */

import type ts from 'typescript';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * What the compiler must say about a sample.
 *
 * - `compiles`: no error diagnostics under the module's compiler options.
 * - `errors`: at least one error; when `codes` is given, every listed TS error
 *   code must be present (used to teach specific diagnostics).
 */
export type SampleExpectation = { readonly kind: 'compiles' } | { readonly kind: 'errors'; readonly codes?: readonly number[] };

export interface CodeSample {
  readonly id: string;
  readonly title: string;
  readonly code: string;
  readonly expectation: SampleExpectation;
  /** Overrides merged on top of the strict defaults. */
  readonly compilerOptions?: ts.CompilerOptions;
  /** Optional type assertions: identifier position and expected display type. */
  readonly typeAssertions?: readonly TypeAssertion[];
}

export interface TypeAssertion {
  readonly line: number;
  readonly column: number;
  readonly expected: string;
}

export interface LearningObjective {
  readonly id: string;
  readonly statement: string;
  /** Bloom's taxonomy level targeted by the objective. */
  readonly level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

export interface ConceptModule<Id extends string = string> {
  readonly id: Id;
  readonly title: string;
  readonly summary: string;
  readonly difficulty: Difficulty;
  /** Estimated time to completion in minutes. */
  readonly estimatedMinutes: number;
  readonly prerequisites: readonly Id[];
  readonly objectives: readonly LearningObjective[];
  readonly samples: readonly CodeSample[];
  /** Primary references (handbook sections, design notes, papers). */
  readonly references: readonly Reference[];
}

export interface Reference {
  readonly title: string;
  readonly url: string;
}

export interface Curriculum<Id extends string = string> {
  readonly version: string;
  readonly modules: readonly ConceptModule<Id>[];
}
