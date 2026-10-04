import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  CycleError,
  criticalPathCost,
  findCycle,
  learningPath,
  levels,
  redundantEdges,
  topologicalOrder,
  transitivePrerequisites,
  type Graph,
} from '@/core/curriculum/graph';

const diamond: Graph = {
  nodes: ['a', 'b', 'c', 'd'],
  edges: { a: [], b: ['a'], c: ['a'], d: ['b', 'c'] },
};

describe('graph algorithms (examples)', () => {
  it('orders prerequisites before dependants', () => {
    expect(topologicalOrder(diamond)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('detects a cycle and reports it as a closed walk', () => {
    const cyclic: Graph = { nodes: ['x', 'y', 'z'], edges: { x: ['z'], y: ['x'], z: ['y'] } };
    const cycle = findCycle(cyclic);
    expect(cycle).toBeDefined();
    expect(cycle?.[0]).toBe(cycle?.[cycle.length - 1]);
    expect(() => topologicalOrder(cyclic)).toThrow(CycleError);
  });

  it('computes learning paths restricted to the transitive closure', () => {
    expect(learningPath(diamond, 'b')).toEqual(['a', 'b']);
    expect(learningPath(diamond, 'd')).toEqual(['a', 'b', 'c', 'd']);
    expect([...transitivePrerequisites(diamond, 'd')].sort()).toEqual(['a', 'b', 'c']);
  });

  it('computes levels and weighted critical paths', () => {
    expect(Object.fromEntries(levels(diamond))).toEqual({ a: 1, b: 2, c: 2, d: 3 });
    const cost = criticalPathCost(diamond, (id) => ({ a: 10, b: 1, c: 5, d: 2 })[id] ?? 0);
    expect(cost.get('d')).toBe(17);
  });

  it('identifies transitively redundant edges', () => {
    const g: Graph = { nodes: ['a', 'b', 'c'], edges: { a: [], b: ['a'], c: ['a', 'b'] } };
    expect(redundantEdges(g)).toEqual([['c', 'a']]);
    expect(redundantEdges(diamond)).toEqual([]);
  });
});

/** Random DAG: edges only point from higher to lower index, guaranteeing acyclicity. */
const dagArb = fc
  .integer({ min: 1, max: 12 })
  .chain((n) => {
    const nodes = Array.from({ length: n }, (_, i) => `n${i}`);
    return fc
      .array(fc.tuple(fc.nat({ max: n - 1 }), fc.nat({ max: n - 1 })), { maxLength: n * 3 })
      .map((pairs) => {
        const edges: Record<string, string[]> = Object.fromEntries(nodes.map((id) => [id, []]));
        for (const [i, j] of pairs) {
          if (i === j) continue;
          const [hi, lo] = i > j ? [i, j] : [j, i];
          const from = `n${hi}`;
          const to = `n${lo}`;
          if (!edges[from]?.includes(to)) edges[from]?.push(to);
        }
        return { nodes, edges } satisfies Graph;
      });
  });

describe('graph algorithms (properties)', () => {
  it('a topological order is a permutation respecting every edge', () => {
    fc.assert(
      fc.property(dagArb, (g) => {
        const order = topologicalOrder(g);
        expect([...order].sort()).toEqual([...g.nodes].sort());
        const pos = new Map(order.map((id, i) => [id, i]));
        for (const node of g.nodes) {
          for (const dep of g.edges[node] ?? []) {
            expect(pos.get(dep)).toBeLessThan(pos.get(node) ?? -1);
          }
        }
      }),
    );
  });

  it('random DAGs never report a cycle; adding a back edge to any path does', () => {
    fc.assert(
      fc.property(dagArb, (g) => {
        expect(findCycle(g)).toBeUndefined();
        const withDep = g.nodes.find((n) => (g.edges[n]?.length ?? 0) > 0);
        if (!withDep) return;
        const dep = g.edges[withDep]?.[0];
        if (!dep) return;
        const cyclic: Graph = { nodes: g.nodes, edges: { ...g.edges, [dep]: [...(g.edges[dep] ?? []), withDep] } };
        expect(findCycle(cyclic)).toBeDefined();
      }),
    );
  });

  it('learning paths are closed under prerequisites and end at the target', () => {
    fc.assert(
      fc.property(dagArb, (g) => {
        for (const target of g.nodes) {
          const path = learningPath(g, target);
          expect(path[path.length - 1]).toBe(target);
          const inPath = new Set(path);
          for (const node of path) for (const dep of g.edges[node] ?? []) expect(inPath.has(dep)).toBe(true);
        }
      }),
    );
  });

  it('levels equal 1 + max level of prerequisites', () => {
    fc.assert(
      fc.property(dagArb, (g) => {
        const lv = levels(g);
        for (const node of g.nodes) {
          const expected = 1 + Math.max(0, ...(g.edges[node] ?? []).map((d) => lv.get(d) ?? 0));
          expect(lv.get(node)).toBe(expected);
        }
      }),
    );
  });
});

/** The original O(V^2 log V) Kahn ordering, kept as an oracle for the heap version. */
const referenceOrder = (g: Graph): string[] => {
  const indegree = new Map(g.nodes.map((n) => [n, (g.edges[n] ?? []).length]));
  const position = new Map(g.nodes.map((n, i) => [n, i]));
  const ready = g.nodes.filter((n) => indegree.get(n) === 0);
  const order: string[] = [];
  while (ready.length > 0) {
    ready.sort((a, b) => (position.get(a) ?? 0) - (position.get(b) ?? 0));
    const node = ready.shift();
    if (node === undefined) break;
    order.push(node);
    for (const other of g.nodes) {
      for (const dep of g.edges[other] ?? []) {
        if (dep !== node) continue;
        const remaining = (indegree.get(other) ?? 1) - 1;
        indegree.set(other, remaining);
        if (remaining === 0) ready.push(other);
      }
    }
  }
  return order;
};

describe('topologicalOrder implementation', () => {
  it('matches the reference ordering exactly, including tie-breaks', () => {
    fc.assert(
      fc.property(dagArb, (g) => {
        expect(topologicalOrder(g)).toEqual(referenceOrder(g));
      }),
      { numRuns: 300 },
    );
  });

  it('orders a 10k-node chain given in reverse (worst case for the old array sort)', () => {
    const n = 10_000;
    const nodes = Array.from({ length: n }, (_, i) => `n${n - 1 - i}`);
    const edges = Object.fromEntries(nodes.map((id) => [id, id === 'n0' ? [] : [`n${Number(id.slice(1)) - 1}`]]));
    const order = topologicalOrder({ nodes, edges });
    expect(order[0]).toBe('n0');
    expect(order[n - 1]).toBe(`n${n - 1}`);
  });
});
