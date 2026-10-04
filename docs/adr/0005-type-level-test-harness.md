# 0005. Compile-time assertions with `Expect<Equal<>>` and expect-type

Date: 2026-10-03 · Status: Accepted

## Context

Type-level utilities have no runtime behaviour to test. Their correctness is
a property of the checker's output, so the test must be a program that
type-checks only if the claims hold.

## Decision

Use two complementary harnesses in `tests/type-level/*.test-d.ts`:

- `Expect<Equal<A, B>>` with the generic-function encoding of equality,
  which distinguishes `any`, union subsets and intersections, grouped in
  `Cases<[...]>` tuples so a file reads as a table of claims.
- `expectTypeOf` from expect-type for cross-checking selected claims with an
  independently implemented equality.

Negative cases use `// @ts-expect-error` with a trailing justification. The
suites are compiled by `tsconfig.typetests.json` in CI
(`npm run typecheck:types`).

## Consequences

- Type-level regressions fail CI with a line number.
- A latent trap was discovered while adopting this: a single syntax error in
  the test project suppresses all semantic diagnostics, so the project must
  be kept syntactically valid for the assertions to mean anything.
