# TSVerseHub: Design of a Verified, Interactive Curriculum for the TypeScript Type System

**Author:** Satvik Praveen · **Version:** 1.0.0 · **Date:** 2026-10-03

## Abstract

Instructional material about programming languages is usually prose with
code samples, and prose does not fail when the language changes. TSVerseHub
treats a curriculum as a verifiable artefact: every code sample carries a
machine-checkable expectation, prerequisites form a verified directed acyclic
graph, and the type-level library the curriculum teaches with is itself
covered by compile-time tests. This document describes the problem, the
architecture that addresses it, the evaluation tooling, and the limitations
we are aware of.

## 1. Motivation

TypeScript's type system is unusually expressive for a mainstream language:
conditional and mapped types, template-literal pattern matching, variadic
tuples and recursive aliases make it a small functional programming language
evaluated by the checker. Teaching it well requires showing *what the checker
says*, and the checker's answers change between releases: TypeScript 4.9 split
"object is possibly undefined" into TS2532 and TS18048 depending on the
expression form; TypeScript 5.0 changed the meaning of a decorator without
`experimentalDecorators`; TypeScript 4.5 raised the recursion limit for
tail-recursive conditional types from 50 to 1 000.

Three failure modes follow for conventional material:

1. **Silent drift.** A sample that once errored now compiles (or vice versa)
   and nobody notices.
2. **Unfounded claims.** Authors assert an inferred type from memory; the
   checker disagrees.
3. **Unordered content.** Prerequisite relations are implicit, so learners
   meet conditional types before generics, or a module depends on itself.

The project's central claim is that all three are preventable by treating
the curriculum as code and running it in continuous integration.

## 2. Related work

- **type-challenges** (Anthony Fu et al.) popularised `Expect<Equal<>>`
  assertions for type-level exercises; we adopt that encoding for our own
  utilities and extend the idea from exercises to the curriculum's claims.
- **TypeScript's own test suite** uses baseline files of emitted types and
  diagnostics. We borrowed the ratchet idea while migrating legacy content
  (a committed list of passing snippets that could only grow) and retired it
  once every snippet compiled.
- **The TypeScript Playground** and Monaco's language service provide live
  diagnostics in the browser but no notion of expected outcomes. We reuse
  the same compiler through a filesystem-free host and add the expectation
  layer on top.
- **Executable documentation** (doctest in Python, `cargo test --doc` in
  Rust, Elm's `elm-verify-examples`) checks that examples in prose still
  run. TSVerseHub checks that examples still *fail in the intended way*,
  which is the more informative claim for type-system instruction.
- Work on **misconceptions in programming education** (for example the
  notional-machine literature) motivates negative samples: a learner's model
  is corrected most effectively by a precise counter-example with the exact
  diagnostic the compiler produces.

## 3. Architecture

### 3.1 Kernel (`src/core`)

The kernel has no dependency on React or the browser and is consumed by the
application, the tests and the research tooling.

**Type-level algebra** (`core/type-level`). Assertion primitives
(`Equal`, `Expect`, `IsAny`, `IsNever`, `IsUnion`, …), tuple operations,
natural-number arithmetic on tuple lengths, template-literal string
operations, object transformations and a complete tokenizer, recursive
descent parser and evaluator for integer arithmetic. Each module documents
its semantics and cost model; the arithmetic encoding is chosen because its
cost grows predictably with magnitude and is therefore benchmarkable. (We first described that growth as linear; the reference benchmark showed it is quadratic, see §4.)

**Compiler kernel** (`core/compiler`). `createVirtualHost` implements
`ts.CompilerHost` over an in-memory file map with a pluggable `LibProvider`;
`analyze` builds a program, normalises diagnostics to a serialisable form with
1-based positions, measures program construction, checking and emit
separately via an injectable clock, and optionally emits; `typeAt` answers
"what is the type of the identifier at line L, column C" using the checker.
The same code runs in Node (libraries read from the `typescript` package) and
in the browser (libraries supplied statically).

**Curriculum model** (`core/curriculum`). A `ConceptModule` has objectives
tagged with Bloom levels, prerequisites, references and `CodeSample`s whose
`expectation` is either `compiles` or `errors` with optional required
diagnostic codes, plus optional `typeAssertions`. Pure graph algorithms
(iterative cycle detection, deterministic Kahn ordering, learning paths,
critical-path cost, transitive reduction) operate over the prerequisite
graph. `verifyCurriculum` combines graph checks and per-sample compilation
into a `VerificationReport`.

### 3.2 Verification pipeline (`research/verification`)

`verify-curriculum.ts` runs two layers. The registry layer is strict: any
sample whose outcome differs from its expectation fails the run. The audit
layer extracts code from template literals in legacy content using the
TypeScript AST, compiles each snippet under a relaxed-strict profile with
environment-only diagnostics excluded (unresolved `node:` modules and the
like), and reports pass rates per module. Every snippet must compile; any failure
fails the run. A snippet that intentionally demonstrates an error keeps the
offending line as a comment, or becomes a negative registry sample.

The audit began as a ratchet. At version 1.0.0 only 77 of 150 snippets
compiled, so a committed baseline recorded the passing set and CI failed only
if a recorded snippet regressed. The migration then fixed all of them, and
the baseline was removed in favour of the hard gate.

### 3.3 Benchmarks (`research/benchmarks`)

`run-benchmarks.ts` measures five workloads with warm-up and repeated
iterations, reporting median, mean, p95 and standard deviation together with
the environment. W2–W4 vary a single parameter of a type-level program
(tuple length, operand magnitude, token count) so that the shape of the
cost curve, not only its magnitude, can be examined. W5 characterises the
graph algorithms at curriculum scale and far beyond it.

### 3.4 Application

A Vite-built React single-page application exposes the curriculum, a
Monaco-based playground backed by the same compiler kernel, applied
mini-projects (typed forms with dot-path field addressing, a decorator-driven
dependency-injection container, a typed event bus, a small compiler
pipeline) and progress tracking in `localStorage`. The application is a
consumer of the kernel; nothing in `src/core` imports from it.

## 4. Verification results at version 1.0.0

| Layer | Result |
|---|---|
| Registry samples | 29 / 29 verified (16 positive, 13 negative keyed to diagnostic codes) |
| Inferred-type assertions | 9 / 9 |
| Prerequisite graph | acyclic, all references resolved, no redundant edges |
| Embedded content snippets | 148 / 148 compile under the relaxed-strict profile (100%; 77 / 150 at 1.0.0) |
| Compile-time assertions | 100+ `Expect<Equal<>>` cases across four suites |

### Benchmark findings

The reference benchmark (`research/results/reference-benchmark.json`, a
GitHub-hosted runner, 10 iterations per case) produced three results we did
not anticipate:

1. **Tuple-encoded arithmetic is quadratic, not linear.** Each recursion
   step spreads the accumulator, so building a tuple of length N copies
   O(N²) elements. Doubling N quadruples the checking cost above the fixed
   standard-library cost (×4.0 from 200 to 400, ×4.1 from 400 to 800). The
   library's documentation previously claimed linear cost and was corrected.
2. **The type-level evaluator has a measurable ceiling.** It evaluates 24
   parenthesised terms and fails at 32 with TS2589 (instantiation
   excessively deep).
3. **A quadratic graph algorithm hid behind small inputs.** The
   prerequisite sort took 599 ms for 10 000 nodes because it re-sorted an
   array on every step. A binary heap made it 17.8 ms on the same CI
   hardware, with identical output, which a property test checks against
   the old algorithm as an oracle. Curriculum-sized graphs (8 nodes) never
   showed the problem.

During construction the verifier rejected five of the author's own
expectations (for example, an expected TS18048 that the checker reports as
TS2532 for call-expression results, and a builder whose phantom type
parameter was structurally invisible, so the intended `this`-type error did
not occur) and one redundant prerequisite edge. We regard these as evidence
for the approach rather than as embarrassments: they are exactly the errors
prose would have shipped.

## 5. Threats to validity

- **Compiler version coupling.** Negative samples pin diagnostic codes, so a
  TypeScript upgrade can legitimately require updating expectations. This is
  intended, but it means the curriculum has a version just as a library does.
- **Sandbox fidelity.** The virtual host provides `lib.*.d.ts` but no
  `node_modules`; samples cannot import third-party packages and must declare
  what they need. Audit results exclude environment-only diagnostics, which
  could mask a genuine resolution mistake in a snippet.
- **Benchmark noise.** Wall-clock measurements on shared CI runners vary; we
  report dispersion and treat the shape of the curve, not single numbers, as
  the finding. Program construction time is dominated by parsing the
  standard library and is reported separately from checking.
- **The kernel is bound to TypeScript 5.x.** TypeScript 7, the native
  port now published as npm `latest`, does not expose the JavaScript
  Compiler API (`import('typescript')` yields only `version`). CI verifies
  the registry under 5.5, 5.6 and 5.9, all of which pass every sample;
  supporting 7.x would require moving the kernel to the new API surface
  once it stabilises.
- **Pedagogical efficacy is not measured.** Verification establishes that the
  material is *correct*, not that it *teaches*. A learner study is future
  work.

## 6. Future work

- Promote the most instructive embedded snippets into registry samples with
  explicit expectations (the audit only proves they compile; the registry
  also states what the checker must say).
- Log which "type at cursor" questions learners ask in the playground, to
  find the constructs the curriculum explains least well.
- Port the compiler kernel to the TypeScript 7 API once it is stable, and
  extend the version matrix across the 5.x → 7.x boundary to find
  curriculum claims whose diagnostics change.
- Model exercises as samples with a hidden expectation and a visible
  starter, enabling automatic grading with the same verifier.

## 7. Reproduction

```bash
nvm use && npm ci
npm run verify                    # typecheck, lint, tests, build
npm run research:verify           # registry verification + content audit (hard gate)
npm run research:benchmark        # benchmark JSON + Markdown table
```

All commands are run by `.github/workflows/ci.yml` on Node 20 and 22.
