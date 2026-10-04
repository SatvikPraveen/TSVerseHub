# 0011. Node 22 floor and the 2026 dependency majors

Date: 2026-10-04 · Status: Accepted · Supersedes the version choices (not the
structure) of [0002](0002-vite-vitest-toolchain.md)

## Context

Dependabot proposed two grouped upgrades that crossed several major
versions at once: React 19, React Router 7, Recharts 3, Framer Motion 13,
Lucide 1 and Monaco 0.57 at runtime; Vite 8 (Rolldown), Vitest 5,
ESLint 10, Tailwind CSS 4, jsdom 30 and fast-check 4 in tooling. Four of
the tooling targets (Vitest 5, jsdom 30, jest-dom 7, lint-staged 17)
require Node 22. The project supported Node 20, which reached end of life
on 2026-04-30 and no longer receives security fixes.

Separately, Dependabot also proposed TypeScript 7. TypeScript 7 is the
native port and does not ship the JavaScript Compiler API that the
compiler kernel is built on (see the design document, §5).

## Decision

- The supported runtime is Node `^22.22.1 || >=24`. `.nvmrc` pins 22, CI
  tests on 22 and 24, the Docker build stage uses `node:22-alpine`, and
  `@types/node` follows the minimum (22), so code cannot type-check
  against APIs the oldest supported runtime lacks.
- All proposed majors are adopted except TypeScript, which stays on
  `^5.9.3`. Dependabot ignores TypeScript ≥ 6 until the kernel is ported.
- The structure from ADR 0002 is unchanged (one test runner shared with
  the build config; three TypeScript projects), with version-specific
  mechanics updated:
  - Rolldown replaces Rollup: chunking uses `codeSplitting.groups`.
  - Vitest 5 runs benchmarks in a dedicated project selected by
    `benchmark.include`; `bench` is a test-context fixture, not a global.
  - ESLint uses a flat config (ADR 0010).
  - Tailwind is configured in CSS (`src/index.css`) and compiled by
    `@tailwindcss/vite`; there is no `tailwind.config` or PostCSS config.
- Each area was migrated on its own branch, verified against every gate
  in isolation, then integrated and verified again.

## Consequences

- Contributors need Node 22 or later; `engines` and `.nvmrc` say so.
- The migrations surfaced and fixed defects that the old toolchain hid:
  the React Compiler hook rules found unstable keys, effects that
  replayed side effects and render-time ref access (ADR 0010); Tailwind 4
  removed legacy stylesheet overrides of utility classes; Vite 8 stopped
  implicitly supplying Node typings to the app project; the build script
  relied on an undeclared transitive dependency (`chokidar`).
- Vitest 4+ measures branch coverage more strictly; the suite still meets
  the 90% branch threshold, with less margin than before.
- Two plugins (eslint-plugin-react, eslint-plugin-jsx-a11y) do not yet
  declare ESLint 10 support and are installed through npm `overrides`;
  ADR 0010 records when to remove them.
