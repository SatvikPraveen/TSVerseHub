# 0004. A filesystem-free compiler host shared by browser and Node

Date: 2026-10-03 · Status: Accepted

## Context

The playground needs diagnostics in the browser; the verifier and benchmarks
need identical semantics in Node and CI. Monaco's TypeScript worker provides
browser diagnostics but cannot be reused from Node, and `ts.sys`-based hosts
cannot run in the browser.

## Decision

`src/core/compiler/virtual-host.ts` implements `ts.CompilerHost` over an
in-memory file map with a pluggable `LibProvider` for `lib.*.d.ts`. Node
supplies libraries from the installed `typescript` package
(`node-libs.ts`); browsers supply them from a static map or a fetch. The
`analyze()` function builds a program, collects and normalises diagnostics,
records per-phase timings via an injectable clock and optionally emits.

## Consequences

- One code path for "what does the compiler say about this text" across the
  playground, tests, verifier and benchmarks.
- Determinism: identical inputs yield identical diagnostics; a property test
  guards this.
- Library files are parsed per host instance; callers that analyse many
  programs should reuse a `LibProvider` (which caches text) and accept the
  parse cost, or batch files into one program.

## Update (2026-10-04)

The last consequence no longer holds. Parsed `lib.*.d.ts` trees are shared
across hosts and programs through a process-wide cache in
`virtual-host.ts`. Entries are keyed by file name and parse options and
validated against the text. User files are never shared. Repeat analyses
take a few milliseconds instead of re-parsing ~2 MB of declarations (the
compiler test suite under coverage went from about 14 s to 0.1 s). That
brought the tests back within Vitest 5's enforced timeouts on CI runners.
