/**
 * Curriculum verification.
 *
 * Runs every code sample through the compiler kernel and compares the result
 * with the sample's declared expectation. Also validates the prerequisite
 * graph (acyclic, all references resolve, no redundant edges).
 *
 * @module core/curriculum/verify
 */

import { analyze, typeAt, type LibProvider, type NormalizedDiagnostic } from '../compiler';

import { findCycle, redundantEdges, type Graph } from './graph';
import type { CodeSample, ConceptModule, Curriculum } from './schema';

export type SampleOutcome = 'pass' | 'fail';

export interface SampleReport {
  readonly moduleId: string;
  readonly sampleId: string;
  readonly outcome: SampleOutcome;
  readonly expectation: CodeSample['expectation'];
  readonly errorCount: number;
  readonly diagnostics: readonly NormalizedDiagnostic[];
  readonly typeAssertionFailures: readonly string[];
  readonly reason?: string;
  readonly checkMs: number;
}

export interface GraphReport {
  readonly cycle?: readonly string[];
  readonly unresolvedPrerequisites: ReadonlyArray<{ readonly moduleId: string; readonly prerequisite: string }>;
  readonly redundantEdges: ReadonlyArray<readonly [string, string]>;
}

export interface VerificationReport {
  readonly version: string;
  readonly totals: { readonly samples: number; readonly passed: number; readonly failed: number };
  readonly graph: GraphReport;
  readonly samples: readonly SampleReport[];
  readonly ok: boolean;
}

export const curriculumGraph = <Id extends string>(modules: readonly ConceptModule<Id>[]): Graph<Id> => ({
  nodes: modules.map((m) => m.id),
  edges: Object.fromEntries(modules.map((m) => [m.id, m.prerequisites])) as Record<Id, readonly Id[]>,
});

export function verifyGraph<Id extends string>(modules: readonly ConceptModule<Id>[]): GraphReport {
  const known = new Set(modules.map((m) => m.id));
  const unresolved = modules.flatMap((m) =>
    m.prerequisites.filter((p) => !known.has(p)).map((prerequisite) => ({ moduleId: m.id, prerequisite })),
  );
  const resolvedModules = modules.map((m) => ({ ...m, prerequisites: m.prerequisites.filter((p) => known.has(p)) }));
  const graph = curriculumGraph(resolvedModules);
  const cycle = findCycle(graph);
  return {
    ...(cycle ? { cycle } : {}),
    unresolvedPrerequisites: unresolved,
    redundantEdges: cycle ? [] : redundantEdges(graph),
  };
}

export function verifySample(moduleId: string, sample: CodeSample, libs: LibProvider): SampleReport {
  const file = { path: `/${moduleId}/${sample.id}.tsx`, text: sample.code };
  const result = analyze({ files: [file], libs, ...(sample.compilerOptions ? { compilerOptions: sample.compilerOptions } : {}) });
  const errors = result.diagnostics.filter((d) => d.category === 'error');

  const typeAssertionFailures: string[] = [];
  for (const assertion of sample.typeAssertions ?? []) {
    const actual = typeAt({
      files: [file],
      libs,
      file: file.path,
      line: assertion.line,
      column: assertion.column,
      ...(sample.compilerOptions ? { compilerOptions: sample.compilerOptions } : {}),
    });
    if (actual !== assertion.expected) {
      typeAssertionFailures.push(`${assertion.line}:${assertion.column} expected '${assertion.expected}' but found '${actual ?? '<none>'}'`);
    }
  }

  let reason: string | undefined;
  if (sample.expectation.kind === 'compiles') {
    if (errors.length > 0) reason = `expected to compile but produced ${errors.length} error(s): ${errors.map((e) => `TS${e.code}`).join(', ')}`;
  } else {
    if (errors.length === 0) reason = 'expected errors but compiled cleanly';
    const missing = (sample.expectation.codes ?? []).filter((code) => !errors.some((e) => e.code === code));
    if (missing.length > 0) reason = `expected diagnostics ${missing.map((c) => `TS${c}`).join(', ')} were not reported`;
  }
  if (typeAssertionFailures.length > 0) reason = reason ? `${reason}; type assertions failed` : 'type assertions failed';

  return {
    moduleId,
    sampleId: sample.id,
    outcome: reason ? 'fail' : 'pass',
    expectation: sample.expectation,
    errorCount: errors.length,
    diagnostics: result.diagnostics,
    typeAssertionFailures,
    ...(reason ? { reason } : {}),
    checkMs: result.timings.totalMs,
  };
}

export function verifyCurriculum<Id extends string>(curriculum: Curriculum<Id>, libs: LibProvider): VerificationReport {
  const graph = verifyGraph(curriculum.modules);
  const samples = curriculum.modules.flatMap((m) => m.samples.map((s) => verifySample(m.id, s, libs)));
  const passed = samples.filter((s) => s.outcome === 'pass').length;
  const graphOk = !graph.cycle && graph.unresolvedPrerequisites.length === 0;
  return {
    version: curriculum.version,
    totals: { samples: samples.length, passed, failed: samples.length - passed },
    graph,
    samples,
    ok: graphOk && passed === samples.length,
  };
}
