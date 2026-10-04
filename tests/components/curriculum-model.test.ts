import { describe, expect, it } from 'vitest';

import { deepestModule, moduleGraph, orderedModules, studyOrder } from '@/components/curriculum/model';
import { curriculum, curriculumGraph, levels, topologicalOrder } from '@/core/curriculum';

describe('browser-safe curriculum model', () => {
  it('builds exactly the graph that curriculumGraph builds', () => {
    expect(moduleGraph).toEqual(curriculumGraph(curriculum.modules));
  });

  it('orders modules topologically and picks the deepest module as default target', () => {
    const graph = curriculumGraph(curriculum.modules);
    expect(studyOrder).toEqual(topologicalOrder(graph));
    expect(orderedModules.map((m) => m.id)).toEqual(studyOrder);
    const depth = levels(graph);
    expect(depth.get(deepestModule)).toBe(Math.max(...depth.values()));
    expect(deepestModule).toBe('decorators');
  });
});
