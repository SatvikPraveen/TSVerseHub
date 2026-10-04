# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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

[Unreleased]: https://github.com/SatvikPraveen/TSVerseHub/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/SatvikPraveen/TSVerseHub/releases/tag/v1.0.0
