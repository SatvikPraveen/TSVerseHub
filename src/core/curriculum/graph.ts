/**
 * Directed-graph algorithms used to reason about curriculum prerequisites.
 *
 * All functions are pure and generic over the node identifier type. They are
 * property-tested in `tests/core/graph.test.ts`.
 *
 * @module core/curriculum/graph
 */

import type { ConceptModule } from './schema';

export interface Graph<Id extends string = string> {
  /** Every node, including isolated ones. */
  readonly nodes: readonly Id[];
  /** `edges[x]` lists the nodes that `x` depends on (its prerequisites). */
  readonly edges: Readonly<Record<Id, readonly Id[]>>;
}

export class CycleError<Id extends string = string> extends Error {
  constructor(readonly cycle: readonly Id[]) {
    super(`Prerequisite cycle detected: ${cycle.join(' -> ')}`);
    this.name = 'CycleError';
  }
}

const prerequisitesOf = <Id extends string>(graph: Graph<Id>, id: Id): readonly Id[] => graph.edges[id] ?? [];

/**
 * Find a cycle, returning it as a closed walk (first element repeated at the
 * end), or `undefined` when the graph is acyclic. Iterative DFS with explicit
 * colouring so large graphs cannot overflow the call stack.
 */
export function findCycle<Id extends string>(graph: Graph<Id>): readonly Id[] | undefined {
  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const colour = new Map<Id, 0 | 1 | 2>();
  const parent = new Map<Id, Id>();
  for (const node of graph.nodes) colour.set(node, WHITE);

  for (const root of graph.nodes) {
    if (colour.get(root) !== WHITE) continue;
    const stack: Array<{ node: Id; index: number }> = [{ node: root, index: 0 }];
    colour.set(root, GREY);
    while (stack.length > 0) {
      const frame = stack[stack.length - 1];
      if (!frame) break;
      const deps = prerequisitesOf(graph, frame.node);
      if (frame.index < deps.length) {
        const next = deps[frame.index];
        frame.index += 1;
        if (next === undefined) continue;
        const c = colour.get(next) ?? WHITE;
        if (c === GREY) {
          const cycle: Id[] = [next];
          let cursor: Id | undefined = frame.node;
          while (cursor !== undefined && cursor !== next) {
            cycle.push(cursor);
            cursor = parent.get(cursor);
          }
          cycle.push(next);
          return cycle.reverse();
        }
        if (c === WHITE) {
          colour.set(next, GREY);
          parent.set(next, frame.node);
          stack.push({ node: next, index: 0 });
        }
      } else {
        colour.set(frame.node, BLACK);
        stack.pop();
      }
    }
  }
  return undefined;
}

/** Minimal binary min-heap; `compare` returns a negative number when `a` sorts first. */
class MinHeap<T> {
  private readonly items: T[] = [];

  constructor(private readonly compare: (a: T, b: T) => number) {}

  push(item: T): void {
    const items = this.items;
    items.push(item);
    let child = items.length - 1;
    while (child > 0) {
      const parent = (child - 1) >> 1;
      const c = items[child] as T;
      const p = items[parent] as T;
      if (this.compare(c, p) >= 0) break;
      items[child] = p;
      items[parent] = c;
      child = parent;
    }
  }

  pop(): T | undefined {
    const items = this.items;
    const top = items[0];
    const last = items.pop();
    if (items.length === 0 || last === undefined) return top;
    items[0] = last;
    let parent = 0;
    for (;;) {
      const left = 2 * parent + 1;
      const right = left + 1;
      let smallest = parent;
      if (left < items.length && this.compare(items[left] as T, items[smallest] as T) < 0) smallest = left;
      if (right < items.length && this.compare(items[right] as T, items[smallest] as T) < 0) smallest = right;
      if (smallest === parent) break;
      const tmp = items[parent] as T;
      items[parent] = items[smallest] as T;
      items[smallest] = tmp;
      parent = smallest;
    }
    return top;
  }
}

/**
 * Topological order such that every prerequisite precedes its dependants
 * (Kahn's algorithm). Ties are broken by the order of `graph.nodes`, making
 * the result deterministic. Throws {@link CycleError} on cyclic input.
 */
export function topologicalOrder<Id extends string>(graph: Graph<Id>): readonly Id[] {
  const cycle = findCycle(graph);
  if (cycle) throw new CycleError(cycle);

  const indegree = new Map<Id, number>();
  const dependants = new Map<Id, Id[]>();
  for (const node of graph.nodes) {
    indegree.set(node, 0);
    dependants.set(node, []);
  }
  for (const node of graph.nodes) {
    for (const dep of prerequisitesOf(graph, node)) {
      indegree.set(node, (indegree.get(node) ?? 0) + 1);
      dependants.get(dep)?.push(node);
    }
  }
  // Ready nodes live in a binary min-heap keyed on their index in
  // graph.nodes, so ties break deterministically in input order and the
  // whole sort is O((V + E) log V). (Re-sorting an array and shifting from
  // it on every step made this quadratic: 10k nodes took ~600 ms.)
  const position = new Map(graph.nodes.map((n, i) => [n, i] as const));
  const ready = new MinHeap<Id>((a, b) => (position.get(a) ?? 0) - (position.get(b) ?? 0));
  for (const node of graph.nodes) if (indegree.get(node) === 0) ready.push(node);
  const order: Id[] = [];
  for (let node = ready.pop(); node !== undefined; node = ready.pop()) {
    order.push(node);
    for (const dependant of dependants.get(node) ?? []) {
      const remaining = (indegree.get(dependant) ?? 1) - 1;
      indegree.set(dependant, remaining);
      if (remaining === 0) ready.push(dependant);
    }
  }
  return order;
}

/** Transitive prerequisites of `id`, excluding `id` itself. */
export function transitivePrerequisites<Id extends string>(graph: Graph<Id>, id: Id): ReadonlySet<Id> {
  const seen = new Set<Id>();
  const stack = [...prerequisitesOf(graph, id)];
  while (stack.length > 0) {
    const next = stack.pop();
    if (next === undefined || seen.has(next)) continue;
    seen.add(next);
    stack.push(...prerequisitesOf(graph, next));
  }
  return seen;
}

/**
 * The ordered set of modules a learner must complete before `target`,
 * ending with `target`. Equivalent to the topological order restricted to the
 * transitive closure of `target`.
 */
export function learningPath<Id extends string>(graph: Graph<Id>, target: Id): readonly Id[] {
  const closure = transitivePrerequisites(graph, target);
  return topologicalOrder(graph).filter((n) => closure.has(n) || n === target);
}

/**
 * Longest weighted path to each node (the "critical path" of effort), where
 * `weight(id)` is the cost of the node itself. Requires an acyclic graph.
 */
export function criticalPathCost<Id extends string>(graph: Graph<Id>, weight: (id: Id) => number): ReadonlyMap<Id, number> {
  const cost = new Map<Id, number>();
  for (const node of topologicalOrder(graph)) {
    const prerequisiteCost = Math.max(0, ...prerequisitesOf(graph, node).map((dep) => cost.get(dep) ?? 0));
    cost.set(node, prerequisiteCost + weight(node));
  }
  return cost;
}

/** Depth of each node: 0 for roots, otherwise 1 + max depth of prerequisites. */
export function levels<Id extends string>(graph: Graph<Id>): ReadonlyMap<Id, number> {
  return criticalPathCost(graph, () => 1) as ReadonlyMap<Id, number>;
}

/** Edges whose removal does not change reachability (transitive reduction). */
export function redundantEdges<Id extends string>(graph: Graph<Id>): ReadonlyArray<readonly [from: Id, to: Id]> {
  const redundant: Array<readonly [Id, Id]> = [];
  for (const node of graph.nodes) {
    const direct = prerequisitesOf(graph, node);
    for (const dep of direct) {
      const viaOthers = direct.some((other) => other !== dep && transitivePrerequisites(graph, other).has(dep));
      if (viaOthers) redundant.push([node, dep] as const);
    }
  }
  return redundant;
}

/**
 * The prerequisite graph of a list of modules. Lives here rather than in the
 * verifier so that browser code can build it without importing the compiler
 * kernel (and with it the `typescript` package).
 */
export const curriculumGraph = <Id extends string>(modules: readonly ConceptModule<Id>[]): Graph<Id> => ({
  nodes: modules.map((m) => m.id),
  edges: Object.fromEntries(modules.map((m) => [m.id, m.prerequisites])) as Record<Id, readonly Id[]>,
});
