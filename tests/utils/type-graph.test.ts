// Tests for src/utils/type-graph.ts.
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import defaultTypeGraph, { TypeGraphBuilder, type TypeEdge, type TypeNode } from '@/utils/type-graph';

function nodeData(id: string, overrides: Partial<TypeNode> = {}): Omit<TypeNode, 'id'> & { id: string } {
  return {
    id,
    name: id.toUpperCase(),
    type: 'interface',
    category: 'user-defined',
    description: `node ${id}`,
    complexity: 2,
    examples: [`let x: ${id};`],
    ...overrides,
  };
}

/** Empty builder holding nodes n0..n{count-1} and the given directed edges. */
function buildGraph(count: number, edges: Array<[number, number, number?]>): TypeGraphBuilder {
  const g = TypeGraphBuilder.createEmpty('test');
  for (let i = 0; i < count; i++) g.addNode(nodeData(`n${i}`));
  for (const [s, t, strength] of edges) g.addEdge(`n${s}`, `n${t}`, 'uses', strength ?? 5);
  return g;
}

function hasEdge(g: TypeGraphBuilder, s: string, t: string): boolean {
  return g.getEdgesBetween(s, t).length > 0;
}

/** Arbitrary DAG: nodes are topologically ordered by index, edges only go i -> j with i < j. */
const dagArb = fc
  .integer({ min: 2, max: 9 })
  .chain(n =>
    fc.record({
      n: fc.constant(n),
      edges: fc.uniqueArray(
        fc
          .tuple(fc.integer({ min: 0, max: n - 1 }), fc.integer({ min: 0, max: n - 1 }), fc.integer({ min: 1, max: 10 }))
          .filter(([a, b]) => a !== b)
          .map(([a, b, w]): [number, number, number] => [Math.min(a, b), Math.max(a, b), w]),
        { selector: ([a, b]) => `${a}-${b}`, maxLength: 20 }
      ),
    })
  );

describe('default TypeScript graph', () => {
  it('is a builder pre-populated with built-in, advanced and utility types', () => {
    expect(defaultTypeGraph).toBeInstanceOf(TypeGraphBuilder);
    const g = new TypeGraphBuilder();
    const nodes = g.getNodes();

    expect(nodes.length).toBeGreaterThan(20);
    expect(g.getNode('string')).toMatchObject({ type: 'primitive', category: 'built-in' });
    expect(g.getNode('partial')).toMatchObject({ name: 'Partial<T>', type: 'utility' });
    expect(g.getEdges().every(e => g.getNode(e.source) && g.getNode(e.target))).toBe(true);
    expect(g.getMetadata().name).toBe('TypeScript Type System');
  });

  it('has no circular dependencies and reports unconnected types as isolated', () => {
    const analysis = new TypeGraphBuilder().analyzeGraph();
    expect(analysis.circularDependencies).toEqual([]);
    expect(analysis.isolatedNodes).toEqual(expect.arrayContaining(['boolean', 'null', 'undefined']));
    expect(analysis.isolatedNodes).not.toContain('string');
  });

  it('finds the weighted shortest path between built-in types', () => {
    const result = new TypeGraphBuilder().findShortestPath('array', 'unknown');
    expect(result).not.toBeNull();
    expect(result!.path).toEqual(['array', 'object', 'unknown']);
    // cost per edge is 11 - strength: (11 - 7) + (11 - 3)
    expect(result!.distance).toBe(12);
    expect(result!.relationships.map(r => r.relationship)).toEqual(['extends', 'extends']);
    expect(result!.description).toBe('Array<T> extends object → object extends unknown');
  });
});

describe('node and edge management', () => {
  it('addNode fills defaults and generates an id when none is given', () => {
    const g = TypeGraphBuilder.createEmpty();
    const { id: _ignored, ...withoutId } = nodeData('x');
    const node = g.addNode(withoutId);

    expect(node.id).toMatch(/^node_/);
    expect(node.dependencies).toEqual([]);
    expect(node.metadata).toEqual({});
    expect(g.getNode(node.id)).toEqual(node);
  });

  it('updateNode merges fields but never changes the id', () => {
    const g = buildGraph(1, []);
    const updated = g.updateNode('n0', { description: 'changed', id: 'hijack' });
    expect(updated).toMatchObject({ id: 'n0', description: 'changed' });
    expect(g.getNode('hijack')).toBeNull();
    expect(g.updateNode('missing', { description: 'x' })).toBeNull();
  });

  it('removeNode deletes the node together with every incident edge', () => {
    const g = buildGraph(3, [[0, 1], [1, 2], [0, 2]]);
    expect(g.removeNode('n1')).toBe(true);
    expect(g.getNode('n1')).toBeNull();
    expect(g.getEdges().map(e => [e.source, e.target])).toEqual([['n0', 'n2']]);
    expect(g.removeNode('n1')).toBe(false);
  });

  it('addEdge validates endpoints and clamps strength to 1..10', () => {
    const g = buildGraph(2, []);
    expect(() => g.addEdge('n0', 'ghost', 'uses')).toThrow('Source or target node does not exist');
    expect(g.addEdge('n0', 'n1', 'uses', 99).strength).toBe(10);
    expect(g.addEdge('n0', 'n1', 'uses', -5).strength).toBe(1);
    expect(g.addEdge('n0', 'n1', 'uses').strength).toBe(5);
    expect(g.getEdgesBetween('n0', 'n1')).toHaveLength(3);
    expect(g.getEdgesBetween('n1', 'n0')).toEqual([]);
  });

  it('removeEdge reports whether something was removed', () => {
    const g = buildGraph(2, []);
    const edge = g.addEdge('n0', 'n1', 'contains');
    expect(g.removeEdge(edge.id)).toBe(true);
    expect(g.removeEdge(edge.id)).toBe(false);
    expect(g.getEdges()).toEqual([]);
  });

  it('getConnectedNodes respects direction', () => {
    const g = buildGraph(3, [[0, 1], [2, 0]]);
    const idsOf = (nodes: TypeNode[]) => nodes.map(n => n.id).sort();
    expect(idsOf(g.getConnectedNodes('n0', 'out'))).toEqual(['n1']);
    expect(idsOf(g.getConnectedNodes('n0', 'in'))).toEqual(['n2']);
    expect(idsOf(g.getConnectedNodes('n0'))).toEqual(['n1', 'n2']);
  });

  it('getGraph returns a defensive copy', () => {
    const g = buildGraph(2, [[0, 1]]);
    const snapshot = g.getGraph();
    snapshot.nodes.clear();
    snapshot.edges.clear();
    expect(g.getNodes()).toHaveLength(2);
    expect(g.getEdges()).toHaveLength(1);
  });

  it('setMetadata merges and bumps updatedAt', () => {
    const g = TypeGraphBuilder.createEmpty('Before');
    g.setMetadata({ name: 'After', tags: ['x'] });
    const meta = g.getMetadata();
    expect(meta.name).toBe('After');
    expect(meta.tags).toEqual(['x']);
    expect(meta.updatedAt.getTime()).toBeGreaterThanOrEqual(meta.createdAt.getTime());
  });
});

describe('queryNodes', () => {
  const g = new TypeGraphBuilder();

  it('filters by node type and category', () => {
    const utilities = g.queryNodes({ nodeTypes: ['utility'] });
    expect(utilities.length).toBeGreaterThan(5);
    expect(utilities.every(n => n.type === 'utility')).toBe(true);

    const advanced = g.queryNodes({ categories: ['advanced'] });
    expect(advanced.map(n => n.id).sort()).toEqual(['generic', 'intersection', 'union']);
  });

  it('filters by inclusive complexity range', () => {
    const hard = g.queryNodes({ complexityRange: [4, 5] });
    expect(hard.map(n => n.id).sort()).toEqual(['generic', 'intersection']);
  });

  it('searches names, descriptions, documentation and examples case-insensitively', () => {
    expect(g.queryNodes({ searchTerm: 'PARTIAL' }).map(n => n.id)).toContain('partial');
    expect(g.queryNodes({ searchTerm: 'textual data' }).map(n => n.id)).toEqual(['string']);
    expect(g.queryNodes({ searchTerm: '0xff' }).map(n => n.id)).toEqual(['number']);
    expect(g.queryNodes({ searchTerm: 'no-such-term-anywhere' })).toEqual([]);
  });

  it('an empty query returns every node', () => {
    expect(g.queryNodes({})).toHaveLength(g.getNodes().length);
  });
});

describe('findShortestPath', () => {
  it('prefers the cheaper multi-hop route over a weak direct edge', () => {
    const g = buildGraph(3, [[0, 1, 1], [0, 2, 10], [2, 1, 10]]);
    const result = g.findShortestPath('n0', 'n1');
    expect(result?.path).toEqual(['n0', 'n2', 'n1']);
    expect(result?.distance).toBe(2);
    expect(result?.description).toBe('N0 uses N2 → N2 uses N1');
  });

  it('returns a zero-length path from a node to itself (regression)', () => {
    const g = buildGraph(1, []);
    expect(g.findShortestPath('n0', 'n0')).toEqual({ path: ['n0'], distance: 0, relationships: [], description: '' });
  });

  it('returns null for unreachable targets, reversed edges and unknown nodes', () => {
    const g = buildGraph(3, [[0, 1]]);
    expect(g.findShortestPath('n0', 'n2')).toBeNull();
    expect(g.findShortestPath('n1', 'n0')).toBeNull();
    expect(g.findShortestPath('n0', 'ghost')).toBeNull();
    expect(g.findShortestPath('ghost', 'n0')).toBeNull();
  });

  it('every returned path follows real edges and its distance matches their cost (property)', () => {
    fc.assert(
      fc.property(dagArb, fc.nat(), fc.nat(), ({ n, edges }, a, b) => {
        const g = buildGraph(n, edges);
        const src = `n${a % n}`;
        const dst = `n${b % n}`;
        const result = g.findShortestPath(src, dst);
        if (!result) return;
        expect(result.path[0]).toBe(src);
        expect(result.path[result.path.length - 1]).toBe(dst);
        expect(result.relationships).toHaveLength(result.path.length - 1);
        result.relationships.forEach((edge, i) => {
          expect(edge.source).toBe(result.path[i]);
          expect(edge.target).toBe(result.path[i + 1]);
        });
        const cost = result.relationships.reduce((sum, e) => sum + (11 - e.strength), 0);
        expect(result.distance).toBe(cost);
      }),
      { numRuns: 150 }
    );
  });
});

describe('analyzeGraph', () => {
  it('handles an empty graph', () => {
    const analysis = TypeGraphBuilder.createEmpty().analyzeGraph();
    expect(analysis).toMatchObject({
      nodeCount: 0,
      edgeCount: 0,
      complexity: 0,
      clusters: [],
      criticalPath: [],
      isolatedNodes: [],
      circularDependencies: [],
    });
  });

  it('computes complexity as mean node complexity plus edge density', () => {
    const g = TypeGraphBuilder.createEmpty();
    g.addNode(nodeData('a', { complexity: 1 }));
    g.addNode(nodeData('b', { complexity: 3 }));
    g.addEdge('a', 'b', 'uses');
    expect(g.analyzeGraph().complexity).toBe(2 + 1 / 2);
  });

  it('builds dependency and dependent maps from extends/uses/constrains only', () => {
    const g = buildGraph(3, []);
    g.addEdge('n0', 'n1', 'extends');
    g.addEdge('n2', 'n1', 'composes');
    const { dependencies, dependents } = g.analyzeGraph();
    expect(dependencies.get('n1')).toEqual(['n0']);
    expect(dependents.get('n0')).toEqual(['n1']);
    expect(dependents.get('n2')).toEqual([]);
  });

  it('detects a self loop and a simple cycle, returning the cycle members in order', () => {
    const selfLoop = buildGraph(1, [[0, 0]]);
    expect(selfLoop.analyzeGraph().circularDependencies).toEqual([['n0']]);

    const triangle = buildGraph(4, [[0, 1], [1, 2], [2, 3], [3, 1]]);
    expect(triangle.analyzeGraph().circularDependencies).toEqual([['n1', 'n2', 'n3']]);
  });

  it('random DAGs have no cycle; adding a back edge along a path introduces one (property)', () => {
    fc.assert(
      fc.property(dagArb, fc.nat(), ({ n, edges }, pick) => {
        const g = buildGraph(n, edges);
        expect(g.analyzeGraph().circularDependencies).toEqual([]);

        if (edges.length === 0) return;
        const [from, to] = edges[pick % edges.length]!;
        g.addEdge(`n${to}`, `n${from}`, 'uses');

        const cycles = g.analyzeGraph().circularDependencies;
        expect(cycles.length).toBeGreaterThan(0);
        // Every reported cycle is a genuine closed walk in the graph.
        for (const cycle of cycles) {
          cycle.forEach((node, i) => {
            const next = cycle[(i + 1) % cycle.length]!;
            expect(hasEdge(g, node, next)).toBe(true);
          });
        }
      }),
      { numRuns: 200 }
    );
  });

  it('centrality, clusters, isolation and critical path satisfy structural invariants (property)', () => {
    fc.assert(
      fc.property(dagArb, ({ n, edges }) => {
        const g = buildGraph(n, edges);
        const analysis = g.analyzeGraph();

        // Degree centrality: sum of normalised degrees equals 2|E| / (|V| - 1).
        const centralitySum = [...analysis.centralityScores.values()].reduce((a, b) => a + b, 0);
        expect(centralitySum).toBeCloseTo((2 * analysis.edgeCount) / Math.max(n - 1, 1), 9);
        for (const id of analysis.isolatedNodes) expect(analysis.centralityScores.get(id)).toBe(0);

        // Clusters partition exactly the non-isolated nodes.
        const clustered = analysis.clusters.flat();
        expect(new Set(clustered).size).toBe(clustered.length);
        expect([...clustered, ...analysis.isolatedNodes].sort()).toEqual(g.getNodes().map(x => x.id).sort());

        // Levels: level(j) = 1 + max level of its predecessors. Index order is a topological order.
        const level = new Array<number>(n).fill(0);
        for (let j = 0; j < n; j++) {
          for (const [s, t] of edges) if (t === j) level[j] = Math.max(level[j]!, level[s]! + 1);
        }
        for (const [s, t] of edges) expect(level[t]!).toBeGreaterThan(level[s]!);

        // The critical path is a simple directed path whose length is the deepest level + 1.
        const path = analysis.criticalPath;
        expect(new Set(path).size).toBe(path.length);
        for (let i = 0; i + 1 < path.length; i++) expect(hasEdge(g, path[i]!, path[i + 1]!)).toBe(true);
        expect(path.length).toBe(Math.max(...level) + 1);
      }),
      { numRuns: 150 }
    );
  });

  it('critical path finds the longest chain', () => {
    const g = buildGraph(5, [[0, 1], [1, 2], [2, 3], [0, 4]]);
    expect(g.analyzeGraph().criticalPath).toEqual(['n0', 'n1', 'n2', 'n3']);
  });
});

describe('export and import', () => {
  it('exports JSON that round-trips through fromJSON', () => {
    const g = buildGraph(3, [[0, 1, 9], [1, 2, 9]]);
    g.setMetadata({ name: 'Round Trip' });
    const json = g.exportGraph();
    const parsed = JSON.parse(json) as { nodes: TypeNode[]; edges: TypeEdge[] };
    expect(parsed.nodes).toHaveLength(3);
    expect(parsed.edges).toHaveLength(2);

    const restored = TypeGraphBuilder.fromJSON(json);
    expect(restored.getNodes().map(x => x.id).sort()).toEqual(['n0', 'n1', 'n2']);
    expect(restored.getMetadata().name).toBe('Round Trip');
    expect(restored.findShortestPath('n0', 'n2')?.path).toEqual(['n0', 'n1', 'n2']);
  });

  it('fromJSON tolerates missing sections', () => {
    const restored = TypeGraphBuilder.fromJSON('{}');
    expect(restored.getNodes()).toEqual([]);
    expect(restored.getMetadata().name).toBe('Imported Graph');
  });

  it('exports Graphviz DOT with coloured nodes and labelled edges', () => {
    const g = TypeGraphBuilder.createEmpty('Dot Graph');
    g.addNode(nodeData('a', { category: 'utility' }));
    g.addNode(nodeData('b', { category: 'custom' }));
    g.addEdge('a', 'b', 'transforms', 8);
    const dot = g.exportGraph('dot');

    expect(dot.startsWith('digraph "Dot Graph" {')).toBe(true);
    expect(dot).toContain('"a" [label="A", fillcolor="#8B5CF6", style=filled];');
    expect(dot).toContain('"a" -> "b" [label="transforms", color="#EC4899", weight=8];');
    expect(dot.trimEnd().endsWith('}')).toBe(true);
  });

  it('exports cytoscape elements', () => {
    const g = buildGraph(2, [[0, 1, 4]]);
    const parsed = JSON.parse(g.exportGraph('cytoscape')) as {
      nodes: Array<{ data: { id: string; label: string } }>;
      edges: Array<{ data: { source: string; target: string; strength: number } }>;
    };
    expect(parsed.nodes.map(x => x.data.label)).toEqual(['N0', 'N1']);
    expect(parsed.edges[0]!.data).toMatchObject({ source: 'n0', target: 'n1', strength: 4 });
  });

  it('rejects unsupported formats', () => {
    const g = TypeGraphBuilder.createEmpty();
    expect(() => g.exportGraph('xml' as unknown as 'json')).toThrow('Unsupported export format: xml');
  });
});
