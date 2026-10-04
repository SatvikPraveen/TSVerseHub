# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.1.0] - 2026-10-04

### Added
- The playground runs on the compiler kernel in a Web Worker: kernel
  diagnostics as Monaco markers, program/check timings, error count and
  type at cursor. Library files load lazily from separate chunks
  (ADR 0008).
- The Concepts and Dashboard pages render from the verified curriculum
  registry: modules in topological order, verified samples with their
  expectation badges, and a learning-path panel with cumulative effort
  (ADR 0009).
- Real-module test suites for `src/utils`, `src/hooks` and every
  mini-project, including fast-check properties; kernel hooks are tested
  through an in-process fake worker. 635 tests in total.
- Coverage thresholds in CI: 95% lines, 95% functions, 90% branches
  (measured 98.3% / 98.6% / 93.9%).
- Playwright smoke tests against the production bundle, including an
  end-to-end check of kernel diagnostics in the playground.
- CI verifies the curriculum registry under TypeScript 5.5, 5.6 and 5.9.

### Changed
- Every code snippet embedded in the concept modules now compiles
  (148/148, up from 77/150). The audit is a hard gate and the regression
  baseline is removed.
- The supported TypeScript range is `^5.9.3`. TypeScript 7 does not ship
  the JavaScript Compiler API, which the kernel depends on.
- `curriculumGraph` moved from the verifier into `core/curriculum/graph`
  so browser code can use it without importing the compiler.
- Corrected the documented cost model of tuple-encoded arithmetic: it is
  quadratic in N, not linear, as the reference benchmark showed.
- Published the reference benchmark from a GitHub-hosted CI runner
  (`research/results/reference-benchmark.json`). The type-level evaluator
  handles 24 terms and hits TS2589 at 32.

### Fixed
- 27 bugs found by the new suites:
  - **Utilities:** shortest-path queries always returned `null`; quiz
    shuffling reordered the shared question bank; signature help, the
    unused-variable check and member completions never worked;
    `parseLogLevel` returned strings.
  - **Hooks:** stale closures in `useLocalStorage`, and the validator in
    `useLocalStorageObject` never ran.
  - **Event bus:** lifecycle events were double-prefixed;
    `unsubscribeAll()` missed subscriptions; acknowledgements always
    timed out.
  - **DI container:** circular dependencies overflowed the stack; optional
    injection was ignored; decorators used throwaway containers; lifecycle
    hooks leaked across subclasses.
  - **Compiler playground:** generated code dropped parentheses; there was
    no comma token; string literals were not escaped; unterminated strings
    and `1.2.3` were accepted.
  - **Curriculum:** about 70 incorrect embedded samples, including invalid
    syntax, wrong solutions, collisions with library globals and broken
    escapes.
- `.gitignore` had a fused line, so generated research results were
  tracked.

### Performance
- `topologicalOrder` uses a binary heap instead of re-sorting an array on
  every step: O((V + E) log V) instead of quadratic. 10k nodes now take
  ~35 ms instead of ~600 ms, with output identical to the old algorithm
  (checked by a property test against it as an oracle). The reference
  benchmark exposed the problem.

## [1.0.0] - 2026-10-03

### Added
- `src/core/type-level`: assertion primitives, tuple algebra, natural-number
  arithmetic, template-literal string operations, object transformations and
  a type-level arithmetic expression parser/evaluator, all with compile-time
  test suites.
- `src/core/compiler`: filesystem-free compiler host, `analyze()` with
  normalised diagnostics and per-phase timings, `typeAt()` and `transpile()`.
- `src/core/curriculum`: curriculum schema, prerequisite DAG algorithms,
  verifier, and the eight-module registry with machine-checked samples.
- `research/verification/verify-curriculum.ts`: registry verification plus
  an embedded-snippet audit with a regression baseline.
- `research/benchmarks/run-benchmarks.ts`: reproducible measurements of
  checker cost against type-level recursion depth, arithmetic magnitude,
  parser input length and graph size; Vitest bench files.
- GitHub Actions CI (type-check, lint, tests with coverage, build, research
  jobs on Node 20 and 22), CodeQL, Dependabot, issue and PR templates,
  CODEOWNERS.
- Dockerfile with nginx runtime, docker-compose, `.nvmrc`, `.editorconfig`.
- Architecture decision records and the research design document.
- CITATION.cff, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY.

### Changed
- Toolchain migrated to Vite 5, Vitest 2 and TypeScript 5.6 with
  `moduleResolution: Bundler`; one tsconfig per project.
- The entire source tree now type-checks under `strict`,
  `noUncheckedIndexedAccess`, `noImplicitOverride` and
  `useUnknownInCatchVariables` with no suppressions.
- Audio cues are synthesised with the Web Audio API; web fonts load from
  Google Fonts instead of vendored binaries.
- README rewritten to describe the verified-curriculum architecture.

### Fixed
- Application could not boot: missing `index.html`, router wrapper and
  `tsconfig.node.json`; `useDarkMode` contract mismatch in `App`.
- Corrupted curriculum content: unescaped template literals, an unterminated
  template, a `keyPoints` array pasted into a code sample.
- `detectCycle` in the type graph silently ignored its result (returns inside
  `forEach`).
- Nested form fields were written as flat keys by the form hook.
- `public/` assets were ignored by a leftover Gatsby rule in `.gitignore`.

### Removed
- Scaffold generators (`bootstrap.sh`, `setup_tsversehub.sh`) that overwrote
  source files, the stale `PROJECT_STRUCTURE.md`, empty font and sound
  binaries, and the unused Jest, Puppeteer, Zustand, react-hot-toast and
  react-helmet-async dependencies.

[Unreleased]: https://github.com/SatvikPraveen/TSVerseHub/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/SatvikPraveen/TSVerseHub/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/SatvikPraveen/TSVerseHub/releases/tag/v1.0.0
