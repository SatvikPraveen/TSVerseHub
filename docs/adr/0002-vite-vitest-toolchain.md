# 0002. Vite 5 + Vitest 2 + one tsconfig per project

Date: 2026-10-03 · Status: Accepted

## Context

The original configuration mixed Jest (with a misspelled `moduleNameMapping`
key and a `ts-jest` preset that was not installed) with Vite, while the test
files themselves already imported from `vitest`. A single `tsconfig.json`
tried to serve browser code, Node scripts and tests at once, and `composite`
projects forced declaration emit that the curriculum's exported anonymous
classes cannot satisfy (TS4094).

## Decision

- Vite 5 for the application, Vitest 2 for all runtime tests and benchmarks,
  sharing one `vite.config.ts` through `mergeConfig`.
- Three independent TypeScript projects, each checked with `tsc -p`:
  `tsconfig.json` (browser app, `vite/client` types), `tsconfig.node.json`
  (config files, scripts, research tooling, `node` types) and
  `tsconfig.typetests.json` (tests, `vitest/globals`). All extend
  `tsconfig.base.json`. No `composite`, no declaration emit.
- `moduleResolution: Bundler` everywhere, matching how Vite resolves.

## Consequences

- One test runner and one module-resolution model; no `identity-obj-proxy`
  style shims.
- ESLint's type-aware rules are pointed at all three projects.
- `tsc -b` is not used; CI runs the three checks explicitly.
