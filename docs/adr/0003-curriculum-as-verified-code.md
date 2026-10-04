# 0003. Curriculum samples are verified against the compiler

Date: 2026-10-03 · Status: Accepted

## Context

Teaching material about a type system makes falsifiable claims: "this
compiles", "this produces TS2345", "this is inferred as `string`". Prose
drifts as the compiler evolves (TypeScript 5 changed decorator diagnostics,
4.9 split TS2532 into TS18048 for named accesses, and so on), and nobody
re-reads a thousand snippets after each upgrade.

## Decision

Model the curriculum as data (`src/core/curriculum/schema.ts`). Every
`CodeSample` carries a `SampleExpectation` — `compiles`, or `errors` with an
optional list of required diagnostic codes — and optional `typeAssertions`
that pin the inferred type at a position. A verifier compiles each sample
with the real compiler through the kernel of ADR 0004 and fails the build on
any mismatch. The prerequisite graph is checked for cycles, unresolved
references and redundant edges at the same time.

Legacy content embedded as template literals in `src/concepts` is audited
rather than enforced: a baseline records which snippets compile, and CI
fails only on regressions. New content goes into the registry.

## Consequences

- A TypeScript upgrade that changes behaviour fails CI at the exact sample
  affected, with the diagnostic that changed.
- Negative samples document the rule being taught more precisely than
  prose can.
- Authors must state what they expect, which occasionally reveals that the
  expectation was wrong (two of the first thirty samples were corrected this
  way, and the verifier found a redundant prerequisite edge).
