# Research tooling

This directory holds the executable part of the project's research claims:
a verifier that checks the curriculum against the compiler and a benchmark
runner that characterises type-checker cost. Both are deterministic given an
environment and write JSON with that environment embedded.

## Verification

```bash
npm run research:verify                 # registry verification + content audit
npm run research:verify -- --no-audit   # registry only (fast)
```

Layer 1 compiles every sample in `src/core/curriculum/registry.ts` and
compares the outcome with its declared expectation; any mismatch fails.
Layer 2 extracts code embedded in `src/concepts/**` template literals,
compiles each under a relaxed-strict profile (unused symbols allowed,
environment-only diagnostics such as unresolved `node:` modules excluded)
and reports the pass rate per module. Every snippet must compile; a failure
fails the run.

## Benchmarks

```bash
npm run research:benchmark                      # 10 iterations per case
npm run research:benchmark -- --quick           # 3 iterations, fewer sizes
npm run bench                                   # Vitest micro-benchmarks
```

Workloads:

| ID | Workload | Independent variable |
|---|---|---|
| W1 | `analyze()` over each curriculum sample | sample |
| W2 | `Repeat<0, N>` tuple construction | N ∈ {50 … 999} |
| W3 | `Add<N, N>` on tuple-encoded naturals | N ∈ {25 … 400} |
| W4 | Type-level expression evaluation | number of parenthesised terms |
| W5 | Topological order of a random DAG | nodes ∈ {100, 1 000, 10 000} |

Each case is run once for warm-up and then `--iterations` times; median,
mean, p95, standard deviation, min and max of wall-clock milliseconds are
recorded. W1–W4 report the checker's own `checkMs` separately from program
construction, which is dominated by parsing `lib.d.ts`.

### Interpreting W2–W4

Tuple-encoded arithmetic has a transparent cost model: building a tuple of
length N costs N conditional-type instantiations, so W2 should be close to
linear in N up to the instantiation-depth limit (1 000 for tail-recursive
conditional types). W3 composes two such constructions plus a spread. W4's
parser is recursive descent over a token tuple, so its cost grows with token
count and with the magnitude of intermediate values, since those are tuples
too. Deviations from these shapes are the interesting findings.

## Reproducibility

- Pin Node with `.nvmrc`; TypeScript is pinned by `package-lock.json`.
- Results embed `process.version`, `ts.version`, CPU model, core count and
  memory; compare only runs with matching TypeScript versions.
- CI runs `--iterations 5` on each push and uploads the JSON as an artefact.
