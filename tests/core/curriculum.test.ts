import { describe, expect, it } from 'vitest';

import { createNodeLibProvider } from '@/core/compiler/node-libs';
import {
  curriculum,
  curriculumGraph,
  learningPath,
  levels,
  moduleById,
  verifyCurriculum,
  verifyGraph,
  verifySample,
  type CodeSample,
  type ConceptModule,
} from '@/core/curriculum';

const libs = createNodeLibProvider();

describe('curriculum structure', () => {
  it('has a well-formed prerequisite graph', () => {
    const report = verifyGraph(curriculum.modules);
    expect(report.cycle).toBeUndefined();
    expect(report.unresolvedPrerequisites).toEqual([]);
    expect(report.redundantEdges).toEqual([]);
  });

  it('assigns levels consistent with the intended progression', () => {
    const lv = levels(curriculumGraph(curriculum.modules));
    expect(lv.get('basics')).toBe(1);
    expect(lv.get('generics')).toBe(2);
    expect(lv.get('advanced-types')).toBe(3);
    expect(lv.get('compiler-api')).toBe(4);
    expect(lv.get('decorators')).toBe(Math.max(...lv.values()));
  });

  it('derives a learning path for every module that starts at the foundations', () => {
    const graph = curriculumGraph(curriculum.modules);
    for (const m of curriculum.modules) {
      const path = learningPath(graph, m.id);
      expect(path[0]).toBe('basics');
      expect(path[path.length - 1]).toBe(m.id);
    }
  });

  it('every module has objectives, samples, references and unique sample ids', () => {
    const ids = new Set<string>();
    for (const m of curriculum.modules) {
      expect(m.objectives.length).toBeGreaterThan(0);
      expect(m.samples.length).toBeGreaterThan(0);
      expect(m.references.length).toBeGreaterThan(0);
      for (const s of m.samples) {
        const key = `${m.id}/${s.id}`;
        expect(ids.has(key)).toBe(false);
        ids.add(key);
      }
    }
    expect(moduleById('basics').title).toMatch(/Foundations/);
    expect(() => moduleById('nope' as never)).toThrow();
  });
});

describe('curriculum verification against the compiler', () => {
  const report = verifyCurriculum(curriculum, libs);

  it('every sample behaves as its expectation declares', () => {
    const failures = report.samples.filter((s) => s.outcome === 'fail').map((s) => `${s.moduleId}/${s.sampleId}: ${s.reason}`);
    expect(failures).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.totals.passed).toBe(report.totals.samples);
  });

  it('covers both positive and negative expectations', () => {
    const kinds = new Set(report.samples.map((s) => s.expectation.kind));
    expect(kinds).toEqual(new Set(['compiles', 'errors']));
  });
});

describe('verification failure reporting', () => {
  const sample = (overrides: Partial<CodeSample> & Pick<CodeSample, 'code' | 'expectation'>): CodeSample => ({
    id: 'sample',
    title: 'sample',
    ...overrides,
  });

  const conceptModule = (id: string, prerequisites: readonly string[], samples: readonly CodeSample[] = []): ConceptModule => ({
    id,
    title: id,
    summary: id,
    difficulty: 'beginner',
    estimatedMinutes: 1,
    prerequisites,
    objectives: [],
    samples,
    references: [],
  });

  it('fails a sample expected to compile that reports errors', () => {
    const report = verifySample('m', sample({ code: 'export const n: number = "x";', expectation: { kind: 'compiles' } }), libs);
    expect(report.outcome).toBe('fail');
    expect(report.errorCount).toBe(1);
    expect(report.reason).toBe('expected to compile but produced 1 error(s): TS2322');
  });

  it('fails a sample expected to error that compiles cleanly', () => {
    const report = verifySample('m', sample({ code: 'export const n = 1;', expectation: { kind: 'errors' } }), libs);
    expect(report.outcome).toBe('fail');
    expect(report.reason).toBe('expected errors but compiled cleanly');
  });

  it('names the expected diagnostic codes that were not reported', () => {
    const report = verifySample('m', sample({ code: 'export const n: number = "x";', expectation: { kind: 'errors', codes: [2322, 2304] } }), libs);
    expect(report.outcome).toBe('fail');
    expect(report.reason).toBe('expected diagnostics TS2304 were not reported');
  });

  it('passes a negative sample whose expected codes are all reported', () => {
    const report = verifySample('m', sample({ code: 'export const n: number = "x";', expectation: { kind: 'errors', codes: [2322] } }), libs);
    expect(report.outcome).toBe('pass');
    expect(report.reason).toBeUndefined();
  });

  it('reports failed type assertions on their own and alongside another failure', () => {
    const typeAssertions = [{ line: 1, column: 14, expected: 'string' }];
    const alone = verifySample('m', sample({ code: 'export const n = 1;', expectation: { kind: 'compiles' }, typeAssertions }), libs);
    expect(alone.reason).toBe('type assertions failed');
    expect(alone.typeAssertionFailures).toEqual(["1:14 expected 'string' but found '1'"]);

    const combined = verifySample('m', sample({ code: 'export const n = 1;', expectation: { kind: 'errors' }, typeAssertions }), libs);
    expect(combined.reason).toBe('expected errors but compiled cleanly; type assertions failed');

    const missing = verifySample(
      'm',
      // Line 1 is blank, so no node starts at the asserted position.
      sample({ code: '\nexport {};', expectation: { kind: 'compiles' }, typeAssertions: [{ line: 1, column: 1, expected: 'never' }] }),
      libs,
    );
    expect(missing.typeAssertionFailures).toEqual(["1:1 expected 'never' but found '<none>'"]);
  });

  it('applies per-sample compiler options to analysis and type assertions', () => {
    const code = 'const xs: number[] = [1];\nexport const n = xs[0];';
    const strict = verifySample(
      'm',
      sample({ code, expectation: { kind: 'compiles' }, typeAssertions: [{ line: 2, column: 14, expected: 'number | undefined' }] }),
      libs,
    );
    expect(strict.outcome).toBe('pass');
    const relaxed = verifySample(
      'm',
      sample({
        code,
        expectation: { kind: 'compiles' },
        compilerOptions: { noUncheckedIndexedAccess: false },
        typeAssertions: [{ line: 2, column: 14, expected: 'number' }],
      }),
      libs,
    );
    expect(relaxed.outcome).toBe('pass');
  });

  it('reports unresolved prerequisites and cycles in the graph', () => {
    const unresolved = verifyGraph([conceptModule('a', []), conceptModule('b', ['a', 'missing'])]);
    expect(unresolved.unresolvedPrerequisites).toEqual([{ moduleId: 'b', prerequisite: 'missing' }]);
    expect(unresolved.cycle).toBeUndefined();

    const cyclic = verifyGraph([conceptModule('a', ['b']), conceptModule('b', ['a'])]);
    expect(cyclic.cycle).toBeDefined();
    expect(cyclic.redundantEdges).toEqual([]);
  });

  it('marks a curriculum with failing samples or a broken graph as not ok', () => {
    const failing = verifyCurriculum(
      { version: 't', modules: [conceptModule('a', [], [sample({ code: 'export const n = 1;', expectation: { kind: 'errors' } })])] },
      libs,
    );
    expect(failing.ok).toBe(false);
    expect(failing.totals).toEqual({ samples: 1, passed: 0, failed: 1 });

    const broken = verifyCurriculum({ version: 't', modules: [conceptModule('a', ['missing'])] }, libs);
    expect(broken.ok).toBe(false);
    expect(broken.totals).toEqual({ samples: 0, passed: 0, failed: 0 });
  });
});
