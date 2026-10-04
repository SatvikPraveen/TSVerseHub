# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.0.0] - 2026-10-04

### Breaking
- Node 20 (end of life since 2026-04-30) is no longer supported. The
  project requires Node `^22.22.1 || >=24`; `.nvmrc` pins 22, CI tests on
  22 and 24, and the Docker build stage uses `node:22-alpine` (ADR 0011).

### Changed
- **Runtime:** React 19, React Router 7, Recharts 3, Framer Motion 13,
  Lucide 1 and Monaco 0.57. Monaco is loaded from the CDN at a version
  pinned to the installed package, and a test fails if the two drift.
  Brand icons that Lucide 1 removed (GitHub, X, LinkedIn) are inline SVGs
  with accessible names.
- **Build and test:** Vite 8 (Rolldown, with `codeSplitting` groups), the
  React plugin 6, vite-plugin-pwa 1, Vitest 5 (benchmarks run in a
  dedicated project and use the `bench` test fixture), jsdom 30,
  fast-check 4, jest-dom 7, glob 13, marked 18 and lint-staged 17.
- **Lint:** ESLint 10 with a flat config (`eslint.config.js`) replacing
  `.eslintrc.cjs`. `eslint-plugin-import` is replaced by
  `eslint-plugin-import-x`, and the React Compiler rules of
  `eslint-plugin-react-hooks` 7 are enabled (ADR 0010).
- **Styling:** Tailwind CSS 4 with CSS-first configuration in
  `src/index.css`, compiled by `@tailwindcss/vite`, plus tailwind-merge 3
  and prettier-plugin-tailwindcss 0.8. `tailwind.config.cjs`,
  `postcss.config.cjs`, autoprefixer and `@tailwindcss/aspect-ratio` are
  removed. App design tokens are prefixed `--app-` so they no longer
  collide with Tailwind's theme variables.
- **Actions:** checkout, setup-node and upload-artifact 7, and
  codeql-action 4.
- TypeScript stays on 5.9 by design; see 1.1.0.

### Performance
- The compiler kernel parses each `lib.*.d.ts` file once per process and
  shares the tree across programs, instead of re-parsing about 2 MB of
  declarations on every analysis. A repeat analysis drops from about 65 ms
  to a few milliseconds, which also speeds up the playground. Vitest 5
  enforces test timeouts, and that exposed the cost on CI: the compiler
  suite under coverage took 14 s and now takes 0.1 s.

### Fixed
- **Found by the React Compiler hook rules:**
  - random React keys in the AST viewer
  - unstable modal ids that broke `aria-labelledby`
  - a modal open effect that replayed its sound and `onOpen`
  - a force simulation that was never stopped
  - drag bounds measured during render
  - skeleton and wave placeholders that changed size on every render
  - a biased shuffle in the quiz widget
- **Found by Tailwind 4:** legacy stylesheet re-implementations of utility
  classes no longer override Tailwind. Explicit border colours, `rounded`
  and `text-3xl` and larger now render at their documented values, and
  `aspect-video` takes effect (the aspect-ratio plugin had replaced the
  core scale).
- **Monaco:** the CDN loader used Monaco 0.55 whatever version was
  installed. Its editor typings could also resolve silently to `any`
  under Monaco 0.57; a tsconfig path mapping restores them.
- **Scripts:** all four maintenance scripts crashed under ESM
  (`require.main` in a `"type": "module"` package). `build-playground`
  relied on an undeclared transitive dependency, `chokidar`.
- **Prettier:** `.prettierrc` could not be parsed because it began with a
  comment line.

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

[Unreleased]: https://github.com/SatvikPraveen/TSVerseHub/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/SatvikPraveen/TSVerseHub/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/SatvikPraveen/TSVerseHub/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/SatvikPraveen/TSVerseHub/releases/tag/v1.0.0
