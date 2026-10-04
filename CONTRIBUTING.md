# Contributing to TSVerseHub

Thank you for considering a contribution. This document explains how the
project is organised, what "done" means here, and how to get a change merged.

## Ground rules

- **Teaching material is code.** Every claim the curriculum makes about
  TypeScript must be checkable by the compiler. New samples go in
  `src/core/curriculum/registry.ts` with an explicit expectation
  (`compiles`, `errors` with diagnostic codes, or `typeAssertions`).
  `npm run research:verify` must pass.
- **Strictness is not negotiable.** `strict`, `noUncheckedIndexedAccess`,
  `useUnknownInCatchVariables`, `noImplicitOverride` and friends apply to all
  code. No `@ts-ignore`, no `eslint-disable`, no new `any` in platform code
  (`any` is permitted only inside `src/concepts`, where it is a topic of
  study).
- **Changes come with evidence.** Runtime behaviour gets a Vitest test;
  type-level behaviour gets a `tests/type-level/*.test-d.ts` assertion;
  algorithms get a property-based test with fast-check where the invariant
  can be stated.
- **Decisions are recorded.** Anything that changes architecture, tooling or
  policy gets an ADR in `docs/adr/`.

## Development setup

```bash
nvm use            # Node 22 (see .nvmrc); Node 24 is also supported
npm ci
npm run dev        # http://localhost:5173
```

Useful commands:

| Command | Purpose |
|---|---|
| `npm run typecheck` | App and Node projects under strict settings |
| `npm run typecheck:types` | Compile-time test suites in `tests/type-level` |
| `npm run lint` | ESLint (flat config in `eslint.config.js`) with type-aware rules, zero warnings allowed |
| `npm test` / `npm run test:coverage` | Vitest unit, property-based and verification suites |
| `npm run research:verify` | Compile every curriculum sample and audit embedded snippets |
| `npm run research:benchmark -- --quick` | Reproducible performance measurements |
| `npm run verify` | Everything CI runs, in order |

## Repository layout

```
src/core/            dependency-free kernel: type-level algebra, compiler host, curriculum model
src/concepts/        curriculum modules (content + runnable demonstrations)
src/mini-projects/   applied projects (typed forms, DI container, event bus, compiler playground)
src/components/      UI (Monaco-based editor, dashboards, charts)
tests/core/          unit + property-based tests for src/core
tests/type-level/    compile-time assertion suites
research/            verification CLI, benchmark runner, results
docs/adr/            architecture decision records
docs/research/       design document and methodology
```

## Workflow

1. Open an issue (bug, curriculum proposal) or pick one up.
2. Branch from `main`: `feat/<topic>`, `fix/<topic>`, `curriculum/<module>`,
   `research/<topic>`.
3. Make the change with tests. Run `npm run verify`.
4. Open a pull request using the template. CI runs type-checks, lint, tests
   with coverage, a production build, curriculum verification and a short
   benchmark; all must be green.
5. One approving review from a code owner merges it.

## Commit messages

Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`,
`perf:`, `build:`, `ci:`, `chore:`, optionally scoped (`feat(core): …`,
`curriculum(generics): …`). The body explains *why*, not what.

## Adding a curriculum sample

```ts
{
  id: 'keyof-violation',
  title: 'An unknown key is rejected at the call site',
  code: `export function pluck<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
export const v = pluck({ id: 1 }, 'missing');`,
  expectation: { kind: 'errors', codes: [2345] },
}
```

Prefer negative samples keyed to specific diagnostic codes: they document
exactly which rule the learner is meant to internalise, and they fail loudly
when a compiler release changes the diagnostic.

## Reporting security issues

See [SECURITY.md](SECURITY.md).
