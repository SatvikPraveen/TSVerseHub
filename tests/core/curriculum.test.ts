import { describe, expect, it } from 'vitest';

import { createNodeLibProvider } from '@/core/compiler/node-libs';
import { curriculum, curriculumGraph, learningPath, levels, moduleById, verifyCurriculum, verifyGraph } from '@/core/curriculum';

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
