#!/usr/bin/env tsx
/**
 * Reproducible performance measurements for the compiler kernel and the
 * type-level library.
 *
 * Workloads
 *   W1 curriculum   analyze() over every registry sample (realistic programs)
 *   W2 depth        type-level tuple construction Repeat<0, N> for growing N
 *   W3 arith        Add<N, N> on tuple-encoded naturals for growing N
 *   W4 parser       type-level expression evaluation for growing token counts
 *   W5 graph        topological order of random DAGs for growing node counts
 *
 * Each workload is run `--iterations` times after one warm-up; we report
 * median, mean, p95 and standard deviation of wall-clock milliseconds, and
 * record the environment so results can be compared across machines and
 * TypeScript versions. Output is JSON (`--out`) plus a Markdown table.
 *
 * Usage: tsx research/benchmarks/run-benchmarks.ts [--iterations 10] [--out file] [--quick]
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { arch, cpus, platform, release, totalmem } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import * as ts from 'typescript';

import { analyze } from '@/core/compiler';
import { createNodeLibProvider } from '@/core/compiler/node-libs';
import { curriculum, topologicalOrder, type Graph } from '@/core/curriculum';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const argValue = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const quick = process.argv.includes('--quick');
const iterations = Number(argValue('--iterations') ?? (quick ? 3 : 10));
const libs = createNodeLibProvider();

interface Stats {
  n: number;
  median: number;
  mean: number;
  p95: number;
  stdev: number;
  min: number;
  max: number;
}

function stats(samples: number[]): Stats {
  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const at = (q: number): number => sorted[Math.min(n - 1, Math.max(0, Math.ceil(q * n) - 1))] ?? 0;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const variance = sorted.reduce((acc, x) => acc + (x - mean) ** 2, 0) / Math.max(1, n - 1);
  return { n, median: at(0.5), mean, p95: at(0.95), stdev: Math.sqrt(variance), min: sorted[0] ?? 0, max: sorted[n - 1] ?? 0 };
}

interface Measurement {
  workload: string;
  case: string;
  parameter: number;
  unit: 'ms';
  stats: Stats;
  meta?: Record<string, number | string | boolean>;
}

function measure(workload: string, caseName: string, parameter: number, fn: () => Record<string, number | string | boolean> | void): Measurement {
  fn(); // warm-up
  const samples: number[] = [];
  let meta: Record<string, number | string | boolean> | undefined;
  for (let i = 0; i < iterations; i += 1) {
    const t0 = performance.now();
    const result = fn();
    samples.push(performance.now() - t0);
    if (result) meta = result;
  }
  return { workload, case: caseName, parameter, unit: 'ms', stats: stats(samples), ...(meta ? { meta } : {}) };
}

const checkProgram = (text: string) => (): Record<string, number | string | boolean> => {
  const result = analyze({ files: [{ path: '/bench.ts', text }], libs });
  return { errors: result.errorCount, checkMs: Number(result.timings.checkMs.toFixed(2)) };
};

// W1 ---------------------------------------------------------------------------
function curriculumWorkload(): Measurement[] {
  return curriculum.modules.flatMap((m, index) =>
    m.samples.map((s) => measure('W1-curriculum', `${m.id}/${s.id}`, index, () => {
      const r = analyze({ files: [{ path: `/${s.id}.tsx`, text: s.code }], libs, ...(s.compilerOptions ? { compilerOptions: s.compilerOptions } : {}) });
      return { errors: r.errorCount, expectation: s.expectation.kind };
    })),
  );
}

// W2 ---------------------------------------------------------------------------
const REPEAT = `type Repeat<V, N extends number, Acc extends unknown[] = []> = Acc['length'] extends N ? Acc : Repeat<V, N, [...Acc, V]>;`;
function depthWorkload(): Measurement[] {
  const sizes = quick ? [100, 400] : [50, 100, 200, 400, 800, 999];
  return sizes.map((n) => measure('W2-depth', `Repeat<0, ${n}>`, n, checkProgram(`${REPEAT}\nexport type R = Repeat<0, ${n}>;\nexport const len: R['length'] = ${n};`)));
}

// W3 ---------------------------------------------------------------------------
function arithWorkload(): Measurement[] {
  const sizes = quick ? [50, 200] : [25, 50, 100, 200, 400];
  return sizes.map((n) =>
    measure('W3-arith', `Add<${n}, ${n}>`, n, checkProgram(`${REPEAT}\ntype Add<A extends number, B extends number> = [...Repeat<0, A>, ...Repeat<0, B>]['length'];\nexport const sum: Add<${n}, ${n}> = ${2 * n};`)),
  );
}

// W4 ---------------------------------------------------------------------------
const PARSER_SOURCE = [
  readFileSync(join(root, 'src/core/type-level/tuple.ts'), 'utf8'),
  readFileSync(join(root, 'src/core/type-level/arith.ts'), 'utf8'),
  readFileSync(join(root, 'src/core/type-level/string.ts'), 'utf8'),
  readFileSync(join(root, 'src/core/type-level/parser.ts'), 'utf8'),
]
  .map((text) => text.replace(/^import .*$/gm, ''))
  .join('\n');

function parserWorkload(): Measurement[] {
  const terms = quick ? [4, 16] : [2, 4, 8, 16, 32];
  return terms.map((count) => {
    const expression = Array.from({ length: count }, (_, i) => `(${i + 1} + ${i + 2})`).join(' * 1 + ');
    const expected = Array.from({ length: count }, (_, i) => 2 * i + 3).reduce((a, b) => a + b, 0);
    return measure('W4-parser', `${count} parenthesised terms`, count, checkProgram(`${PARSER_SOURCE}\nexport const value: Evaluate<'${expression}'> = ${expected};`));
  });
}

// W5 ---------------------------------------------------------------------------
function randomDag(n: number, seed: number): Graph {
  let state = seed;
  const rand = (): number => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const nodes = Array.from({ length: n }, (_, i) => `n${i}`);
  const edges: Record<string, string[]> = {};
  for (let i = 0; i < n; i += 1) {
    const deps = new Set<string>();
    const count = Math.floor(rand() * 4);
    for (let k = 0; k < count && i > 0; k += 1) deps.add(`n${Math.floor(rand() * i)}`);
    edges[`n${i}`] = [...deps];
  }
  return { nodes, edges };
}
function graphWorkload(): Measurement[] {
  const sizes = quick ? [1000] : [100, 1000, 10000];
  return sizes.map((n) => {
    const graph = randomDag(n, 42);
    return measure('W5-graph', `topologicalOrder(${n} nodes)`, n, () => {
      const order = topologicalOrder(graph);
      return { ordered: order.length };
    });
  });
}

// Main ------------------------------------------------------------------------
function toMarkdown(measurements: Measurement[]): string {
  const lines = ['| workload | case | n | median ms | mean ms | p95 ms | stdev |', '|---|---|---:|---:|---:|---:|---:|'];
  for (const m of measurements) lines.push(`| ${m.workload} | ${m.case} | ${m.stats.n} | ${m.stats.median.toFixed(2)} | ${m.stats.mean.toFixed(2)} | ${m.stats.p95.toFixed(2)} | ${m.stats.stdev.toFixed(2)} |`);
  return lines.join('\n');
}

function main(): void {
  const started = Date.now();
  const measurements = [...curriculumWorkload(), ...depthWorkload(), ...arithWorkload(), ...parserWorkload(), ...graphWorkload()];
  const environment = {
    node: process.version,
    typescript: ts.version,
    platform: `${platform()} ${release()} ${arch()}`,
    cpu: cpus()[0]?.model ?? 'unknown',
    cores: cpus().length,
    memoryGb: Number((totalmem() / 1024 ** 3).toFixed(1)),
    iterations,
    quick,
  };
  const out = argValue('--out') ?? join(root, 'research', 'results', `benchmark-${new Date().toISOString().slice(0, 10)}.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), environment, measurements, durationMs: Date.now() - started }, null, 2)}\n`);
  console.log(`Environment: Node ${environment.node}, TypeScript ${environment.typescript}, ${environment.cpu} (${environment.cores} cores)\n`);
  console.log(toMarkdown(measurements));
  console.log(`\nWrote ${relative(root, out)} (${measurements.length} measurements, ${Date.now() - started} ms)`);
}

main();
