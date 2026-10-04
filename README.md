<div align="center">

# TSVerseHub

**A verified, interactive curriculum for the TypeScript type system**

[![CI](https://github.com/SatvikPraveen/TSVerseHub/actions/workflows/ci.yml/badge.svg)](https://github.com/SatvikPraveen/TSVerseHub/actions/workflows/ci.yml)
[![CodeQL](https://github.com/SatvikPraveen/TSVerseHub/actions/workflows/codeql.yml/badge.svg)](https://github.com/SatvikPraveen/TSVerseHub/actions/workflows/codeql.yml)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node 22+](https://img.shields.io/badge/Node-22%2B-339933?logo=node.js&logoColor=white)](.nvmrc)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Cite](https://img.shields.io/badge/cite-CITATION.cff-blue)](CITATION.cff)

Every claim the curriculum makes about TypeScript is compiled and checked in CI.<br/>
Type-level library with documented cost models · filesystem-free compiler kernel · verified prerequisite graph · reproducible benchmarks

[Design document](docs/research/DESIGN.md) · [Architecture](docs/ARCHITECTURE.md) · [Decision records](docs/adr/README.md) · [Research tooling](research/README.md) · [Contributing](CONTRIBUTING.md)

</div>

---

## Why this exists

Material that teaches a type system makes falsifiable statements: *this compiles*, *this fails with TS2345*, *this is inferred as `string`*. Prose does not fail when the compiler changes, so such material drifts silently. TSVerseHub treats the curriculum as code:

- **Samples carry expectations.** Each code sample declares whether it must compile, which diagnostic codes it must produce, or which type the checker must infer at a position. A verifier compiles all of them with the real compiler on every push.
- **Prerequisites form a verified DAG.** The module graph is checked for cycles, dangling references and redundant edges; learning paths and critical-path effort are derived from it rather than hand-maintained.
- **The teaching library is itself proven.** The type-level utilities used in lessons (tuple algebra, arithmetic on tuple lengths, template-literal parsing, a type-level expression evaluator) are covered by compile-time assertion suites.
- **Cost is measured, not asserted.** A benchmark runner characterises checker time as a function of type-level recursion depth, operand magnitude and parser input length, with environment metadata for reproducibility.

The verifier earned its keep immediately: while writing the first thirty samples it rejected five of the author's own expectations and found one redundant prerequisite edge. Details are in the [design document](docs/research/DESIGN.md#4-verification-results-at-version-100).

## Quick start

```bash
git clone https://github.com/SatvikPraveen/TSVerseHub.git
cd TSVerseHub
nvm use && npm ci           # Node 22 (see .nvmrc)
npm run dev                 # http://localhost:5173
```

Everything CI runs, in order:

```bash
npm run verify              # typecheck (app + node) · lint (0 warnings) · tests · build
npm run typecheck:types     # compile-time assertion suites
npm run research:verify     # curriculum verification + audit of every embedded snippet
npm run research:benchmark  # reproducible measurements (add -- --quick for a smoke run)
```

Container image (nginx, SPA fallback, immutable asset caching):

```bash
docker compose up --build   # http://localhost:8080
```

## What is inside

### The kernel: `src/core`

Dependency-free; consumed by the application, the tests and the research tooling.

| Module | Contents |
|---|---|
| `type-level/assert` | `Equal`, `Expect`, `ExpectFalse`, `IsAny`, `IsNever`, `IsUnknown`, `IsUnion`, `IsTuple`, `Simplify`, `Cases` |
| `type-level/tuple` | `Head`, `Tail`, `Last`, `Reverse`, `Concat`, `Repeat`, `Take`, `Drop`, `Zip`, `Flatten`, `Unique`, `Includes` |
| `type-level/arith` | `Add`, `Sub`, `Mul`, `Div`, `Mod`, `Compare`, `Max`, `Min`, `Range`, `Sum` on tuple-encoded naturals |
| `type-level/string` | `Split`, `Join`, `Trim`, `Replace(All)`, `CamelCase`, `KebabCase`, `SnakeCase`, `ParseInt`, `RouteParams` |
| `type-level/object` | `DeepReadonly`, `DeepPartial`, `RequiredKeys`, `OptionalKeys`, `UnionToTuple`, `Paths`, `Get`, `RequireExactlyOne`, `Brand` |
| `type-level/parser` | A type-level tokenizer, recursive-descent parser and evaluator: `Evaluate<'(1 + 2) * 3'>` is `9` |
| `compiler` | In-memory `CompilerHost`, `analyze()` with normalised diagnostics and per-phase timings, `typeAt()`, `transpile()` |
| `curriculum` | Curriculum schema, DAG algorithms, verifier, and the registry of modules and samples |

```ts
import type { Evaluate, Equal, Expect } from '@/core/type-level';

type _ = Expect<Equal<Evaluate<'2 * (3 + 4) - 5 % 3'>, 12>>;
//                                                       ^ fails to compile if the evaluator is wrong

import { analyze } from '@/core/compiler';
import { createNodeLibProvider } from '@/core/compiler/node-libs';

const { diagnostics } = analyze({
  libs: createNodeLibProvider(),
  files: [{ path: '/a.ts', text: 'export const n: number = "1";' }],
});
// -> [{ code: 2322, category: 'error', line: 1, column: 14, ... }]
```

### The curriculum

Eight modules, ordered by a verified prerequisite graph, each with Bloom-level objectives, references and machine-checked samples.

| Module | Level | Samples | Teaches |
|---|---|---|---|
| Foundations | beginner | 4 | structural typing, excess-property checks, discriminated unions, exhaustiveness, literal inference |
| Generics | beginner | 4 | inference from arguments, `keyof` constraints, constraint violations (TS2344, TS2345) |
| Advanced types | advanced | 5 | distributive conditionals, `infer`, key remapping, template-literal parsing, tail recursion limits |
| Modules & namespaces | intermediate | 4 | declaration merging, duplicate aliases, namespace values and types, unresolved imports |
| Compiler configuration | intermediate | 4 | `noUncheckedIndexedAccess`, `strictNullChecks`, `exactOptionalPropertyTypes`, flag-to-diagnostic mapping |
| Typed design patterns | intermediate | 3 | typed event emitters, state-tracking builders with `this` types, constrained mixins |
| Decorators | advanced | 3 | legacy decorator signatures, behaviour without `experimentalDecorators`, constructor replacement |
| Compiler API | expert | 2 | `SyntaxKind` discrimination, API arity, custom hosts |

A sample looks like this; the negative form documents the rule being taught more precisely than prose can:

```ts
{
  id: 'keyof-violation',
  title: 'An unknown key is rejected at the call site',
  code: `export function pluck<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
export const v = pluck({ id: 1 }, 'missing');`,
  expectation: { kind: 'errors', codes: [2345] },
}
```

### The application

A Vite-built React single-page app: a Monaco-based playground backed by the same compiler kernel, concept pages with runnable demonstrations, applied mini-projects (typed forms with dot-path field addressing, a decorator-driven dependency-injection container, a typed event bus, a small compiler pipeline), progress tracking and an installable PWA.

### The research tooling

| Command | Output |
|---|---|
| `npm run research:verify` | Compiles every registry sample against its expectation, and compiles every code snippet embedded in the concept pages (148, all must pass). JSON report with environment metadata. |
| `npm run research:benchmark` | Five workloads with warm-up and repeated iterations: curriculum samples, `Repeat<0, N>` depth, `Add<N, N>` magnitude, type-level parser input length, DAG ordering up to 10⁴ nodes. Median, mean, p95, stdev. |
| `npm run bench` | Vitest micro-benchmarks for the kernel and graph algorithms. |

Methodology and interpretation are in [research/README.md](research/README.md).

## Quality gates

| Gate | Policy |
|---|---|
| Type-checking | `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `useUnknownInCatchVariables`, `noUnusedLocals/Parameters` across three projects. No `@ts-ignore`. |
| Lint | ESLint with type-aware rules, zero warnings. `no-explicit-any` is an error in platform code and disabled only inside curriculum content, where `any` is a topic of study ([ADR 0006](docs/adr/0006-strictness-policy.md)). |
| Tests | Vitest: unit, property-based (fast-check), compiler-verification and compile-time assertion suites. Coverage reported on `src/core`, `src/utils`, `src/hooks`, mini-project logic. |
| Security | CodeQL on every push; Dependabot for npm and Actions; see [SECURITY.md](SECURITY.md). |
| Decisions | Architectural changes require an [ADR](docs/adr/README.md). |

CI runs on Node 22 and 24 and uploads coverage, the production bundle and research results as artefacts.

## Repository layout

```
src/core/          type-level algebra · compiler kernel · curriculum model (dependency-free)
src/concepts/      curriculum modules: content and runnable demonstrations
src/mini-projects/ applied projects
src/components/    UI: Monaco editor, dashboards, charts
tests/core/        unit and property-based tests for the kernel
tests/type-level/  compile-time assertion suites (*.test-d.ts)
research/          verification CLI, benchmark runner, results
docs/adr/          architecture decision records
docs/research/     design document
```

Full map and dependency rules: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

Issues and pull requests are welcome. Curriculum proposals use their own issue template and must state how the claim can be verified. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, commit conventions and how to add a verified sample.

## Citation

If you use TSVerseHub in teaching or research, please cite it. Metadata is in [CITATION.cff](CITATION.cff); GitHub renders a citation widget from it.

```bibtex
@software{praveen_tsversehub_2026,
  author  = {Praveen, Satvik},
  title   = {TSVerseHub: A Verified, Interactive Curriculum for the TypeScript Type System},
  year    = {2026},
  version = {2.0.0},
  url     = {https://github.com/SatvikPraveen/TSVerseHub},
  license = {MIT}
}
```

## License

MIT © 2025–2026 [Satvik Praveen](https://github.com/SatvikPraveen)
