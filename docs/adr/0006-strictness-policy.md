# 0006. Strictness policy and the `any` exception for teaching content

Date: 2026-10-03 · Status: Accepted

## Context

Bringing the tree under `strict` surfaced about 700 diagnostics and 1,000
lint findings. Some of the lint findings were in curriculum modules whose
purpose is to show what `any` permits, or to demonstrate a pattern a
production lint set discourages.

## Decision

- Compiler: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noImplicitReturns`, `noFallthroughCasesInSwitch`,
  `useUnknownInCatchVariables`, `noUnusedLocals/Parameters` for every
  project. No `@ts-ignore`; `@ts-expect-error` only with a description, and
  only to demonstrate an error.
- Lint: zero warnings (`--max-warnings 0`). `@typescript-eslint/no-explicit-any`
  is an error in platform code and disabled only under `src/concepts/**`,
  with the reason stated in the config (`eslint.config.js`, the ESLint
  flat config; see ADR 0010).
- Fixes must be real: narrow, guard, type precisely. Underscore-prefixed
  parameters are the only accepted way to mark intentional non-use.

## Consequences

- Several genuine bugs were found by the strictness pass (a cycle detector
  whose results were discarded, nested form fields written as flat keys,
  decorators depending on an uninstalled reflect-metadata).
- Curriculum content may still *mention* and *demonstrate* `any`; platform
  code may not use it.
