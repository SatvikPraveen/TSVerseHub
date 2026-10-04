#!/usr/bin/env tsx
/**
 * Curriculum verification CLI.
 *
 * Two layers of checking:
 *
 * 1. Registry verification: every sample in `src/core/curriculum/registry.ts`
 *    is compiled with the real TypeScript compiler and must satisfy its declared
 *    expectation (compiles / errors with specific codes / inferred types).
 *    Any failure fails the run. This is the contract the curriculum makes.
 *
 * 2. Content audit: code embedded in template literals inside
 *    `src/concepts/** / *.ts(x)` (properties named code, codeExample,
 *    starterCode, solution, example, snippet) is extracted from the AST and
 *    compiled under a relaxed-strict profile. Snippets are often intentionally
 *    partial, so failures are reported as a measurement rather than an error,
 *    but a ratchet protects against regressions: a snippet recorded as passing
 *    in `baseline.json` must keep passing.
 *
 * Usage:
 *   tsx research/verification/verify-curriculum.ts [--out <file>] [--no-audit]
 *                                                   [--update-baseline] [--quiet]
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import * as ts from 'typescript';

import { analyze } from '@/core/compiler';
import { createNodeLibProvider } from '@/core/compiler/node-libs';
import { curriculum, verifyCurriculum, type VerificationReport } from '@/core/curriculum';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const args = new Set(process.argv.slice(2));
const argValue = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const quiet = args.has('--quiet');
const log = (...parts: unknown[]): void => {
  if (!quiet) console.log(...parts);
};

const libs = createNodeLibProvider();

// ---------------------------------------------------------------------------
// Layer 1: registry
// ---------------------------------------------------------------------------

function printRegistryReport(report: VerificationReport): void {
  log(`\nCurriculum v${report.version}: ${report.totals.passed}/${report.totals.samples} samples verified`);
  if (report.graph.cycle) log(`  ✗ prerequisite cycle: ${report.graph.cycle.join(' -> ')}`);
  for (const u of report.graph.unresolvedPrerequisites) log(`  ✗ ${u.moduleId} requires unknown module '${u.prerequisite}'`);
  for (const [from, to] of report.graph.redundantEdges) log(`  ! redundant prerequisite ${from} -> ${to} (already implied transitively)`);
  const byModule = new Map<string, { pass: number; total: number; ms: number }>();
  for (const s of report.samples) {
    const entry = byModule.get(s.moduleId) ?? { pass: 0, total: 0, ms: 0 };
    entry.total += 1;
    entry.ms += s.checkMs;
    if (s.outcome === 'pass') entry.pass += 1;
    byModule.set(s.moduleId, entry);
  }
  log('\n  module               pass/total   check time');
  for (const [id, e] of byModule) log(`  ${id.padEnd(20)} ${String(e.pass).padStart(4)}/${String(e.total).padEnd(6)} ${e.ms.toFixed(0).padStart(7)} ms`);
  for (const s of report.samples.filter((x) => x.outcome === 'fail')) log(`\n  ✗ ${s.moduleId}/${s.sampleId}: ${s.reason}`);
}

// ---------------------------------------------------------------------------
// Layer 2: content audit
// ---------------------------------------------------------------------------

const SAMPLE_PROPERTY_NAMES = new Set(['code', 'codeExample', 'starterCode', 'solution', 'example', 'snippet', 'exampleCode']);

interface EmbeddedSample {
  key: string;
  file: string;
  line: number;
  property: string;
  code: string;
}

/** Unescape the content of a NoSubstitutionTemplateLiteral as the author wrote it. */
function extractEmbeddedSamples(filePath: string): EmbeddedSample[] {
  const text = readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, filePath.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const samples: EmbeddedSample[] = [];
  const rel = relative(root, filePath);
  const visit = (node: ts.Node): void => {
    if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) {
      const property = node.name.text;
      if (ts.isNoSubstitutionTemplateLiteral(node.initializer)) {
        const code = node.initializer.text.trim();
        // Either a conventional sample property, or any multi-line template
        // literal that is unmistakably TypeScript (declarations or arrows).
        const looksLikeCode = code.split('\n').length >= 3 && /\b(const|let|function|class|interface|type|enum|namespace|import|export)\b|=>/.test(code) && /[;{}]/.test(code);
        if ((SAMPLE_PROPERTY_NAMES.has(property) && code.length > 20 && /[;{}=]/.test(code)) || looksLikeCode) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          samples.push({ key: `${rel}:${line + 1}:${property}`, file: rel, line: line + 1, property, code });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return samples;
}

/** Relaxed-strict profile: snippets are pedagogical fragments, so unused symbols are expected. */
const AUDIT_OPTIONS: ts.CompilerOptions = {
  noUnusedLocals: false,
  noUnusedParameters: false,
  noUncheckedIndexedAccess: false,
  noImplicitReturns: false,
  // Snippets frequently illustrate Node or React APIs; without those type
  // packages in the virtual host they cannot resolve, so resolution errors
  // are excluded from the pass/fail decision below.
};

/** Diagnostics that stem from the sandbox rather than the snippet itself. */
const ENVIRONMENTAL_CODES = new Set([2307, 2688, 2792, 7016, 1259, 2580, 2584, 2591, 2503]);

interface AuditResult {
  key: string;
  file: string;
  line: number;
  property: string;
  status: 'pass' | 'fail';
  errorCodes: number[];
  checkMs: number;
}

function auditEmbeddedSamples(): AuditResult[] {
  const files = glob.sync('src/concepts/**/*.{ts,tsx}', { cwd: root, absolute: true }).sort();
  const results: AuditResult[] = [];
  for (const file of files) {
    for (const sample of extractEmbeddedSamples(file)) {
      const result = analyze({ files: [{ path: '/snippet.tsx', text: sample.code }], libs, compilerOptions: AUDIT_OPTIONS });
      const codes = result.diagnostics.filter((d) => d.category === 'error' && !ENVIRONMENTAL_CODES.has(d.code)).map((d) => d.code);
      results.push({ key: sample.key, file: sample.file, line: sample.line, property: sample.property, status: codes.length === 0 ? 'pass' : 'fail', errorCodes: codes, checkMs: result.timings.totalMs });
    }
  }
  return results;
}

interface Baseline {
  generatedAt: string;
  typescript: string;
  passing: string[];
}

function loadBaseline(path: string): Baseline | undefined {
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, 'utf8')) as Baseline;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): number {
  const started = Date.now();
  const registry = verifyCurriculum(curriculum, libs);
  printRegistryReport(registry);

  let audit: AuditResult[] = [];
  let regressions: string[] = [];
  const baselinePath = join(here, 'baseline.json');
  if (!args.has('--no-audit')) {
    audit = auditEmbeddedSamples();
    const passing = audit.filter((a) => a.status === 'pass');
    const byModule = new Map<string, { pass: number; total: number }>();
    for (const a of audit) {
      const moduleId = a.file.split('/')[2] ?? 'unknown';
      const e = byModule.get(moduleId) ?? { pass: 0, total: 0 };
      e.total += 1;
      if (a.status === 'pass') e.pass += 1;
      byModule.set(moduleId, e);
    }
    log(`\nContent audit: ${passing.length}/${audit.length} embedded snippets compile under the relaxed-strict profile (${((100 * passing.length) / Math.max(1, audit.length)).toFixed(1)}%)`);
    log('\n  module               pass/total');
    for (const [id, e] of [...byModule].sort((a, b) => a[0].localeCompare(b[0]))) log(`  ${id.padEnd(20)} ${String(e.pass).padStart(4)}/${e.total}`);
    const codeHistogram = new Map<number, number>();
    for (const a of audit) for (const c of a.errorCodes) codeHistogram.set(c, (codeHistogram.get(c) ?? 0) + 1);
    const topCodes = [...codeHistogram].sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (topCodes.length) log(`\n  most frequent diagnostics: ${topCodes.map(([c, n]) => `TS${c}×${n}`).join(', ')}`);

    const baseline = loadBaseline(baselinePath);
    if (baseline) {
      const nowPassing = new Set(passing.map((a) => a.key));
      regressions = baseline.passing.filter((key) => audit.some((a) => a.key === key) && !nowPassing.has(key));
      if (regressions.length) {
        log(`\n  ✗ ${regressions.length} snippet(s) that passed in the baseline now fail:`);
        for (const key of regressions) log(`    - ${key}`);
      } else {
        log(`\n  ✓ no regressions against baseline (${baseline.passing.length} passing snippets recorded ${baseline.generatedAt.slice(0, 10)}, TypeScript ${baseline.typescript})`);
      }
    }
    if (args.has('--update-baseline') || !baseline) {
      const next: Baseline = { generatedAt: new Date().toISOString(), typescript: ts.version, passing: passing.map((a) => a.key).sort() };
      writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`);
      log(`\n  baseline written to ${relative(root, baselinePath)}`);
      regressions = [];
    }
  }

  const out = argValue('--out') ?? join(root, 'research', 'results', 'curriculum-verification.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        typescript: ts.version,
        node: process.version,
        durationMs: Date.now() - started,
        registry: { ...registry, samples: registry.samples.map(({ diagnostics: _d, ...rest }) => rest) },
        audit: { total: audit.length, passing: audit.filter((a) => a.status === 'pass').length, regressions, results: audit },
      },
      null,
      2,
    )}\n`,
  );
  log(`\nReport written to ${relative(root, out)} in ${Date.now() - started} ms`);

  const ok = registry.ok && regressions.length === 0;
  log(ok ? '\n✓ curriculum verification passed' : '\n✗ curriculum verification failed');
  return ok ? 0 : 1;
}

process.exitCode = main();
