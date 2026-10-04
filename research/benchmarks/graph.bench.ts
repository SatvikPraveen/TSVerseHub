import { bench, describe } from 'vitest';

import { findCycle, topologicalOrder, type Graph } from '@/core/curriculum';

const chain = (n: number): Graph => ({
  nodes: Array.from({ length: n }, (_, i) => `n${i}`),
  edges: Object.fromEntries(Array.from({ length: n }, (_, i) => [`n${i}`, i === 0 ? [] : [`n${i - 1}`]])),
});

const g1k = chain(1000);
const g10k = chain(10000);

describe('prerequisite graph', () => {
  bench('topologicalOrder: 1k chain', () => {
    topologicalOrder(g1k);
  });
  bench('topologicalOrder: 10k chain', () => {
    topologicalOrder(g10k);
  });
  bench('findCycle: 10k chain (acyclic)', () => {
    findCycle(g10k);
  });
});
