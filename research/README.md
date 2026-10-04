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

Tuple-encoded arithmetic was originally described here as linear in N:
building a tuple of length N takes N conditional-type instantiations. The
reference run refutes that. Every step of `Repeat` spreads the accumulator
(`[...Acc, V]`), so step k copies k elements and the total cost is
quadratic. Above the ~180 ms fixed cost of loading the standard library,
doubling N from 200 to 400 multiplies the extra cost by 4.0, and from 400
to 800 by 4.1. W3 composes two such constructions and grows the same way.
W4's parser is recursive descent over a token tuple whose intermediate
values are themselves tuples. It evaluates 24 parenthesised terms (723 ms)
and fails at 32 terms with TS2589 (instantiation excessively deep), so the
evaluator's practical limit lies between those sizes.

### Reference results (release 1.1.0)

`results/reference-benchmark.json`, from the CI `research` job: GitHub-hosted
`ubuntu-latest`, Intel Xeon Platinum 8370C, 4 cores, Node 20.20.2,
TypeScript 5.9.3, 10 iterations per case, load average 1.4 → 2.7.

| Workload | Case | Median ms | p95 ms | Outcome |
|---|---|---:|---:|---|
| W2 depth | `Repeat<0, 200>` | 213.5 | 281.3 | ok |
| W2 depth | `Repeat<0, 400>` | 309.8 | 410.2 | ok |
| W2 depth | `Repeat<0, 800>` | 710.4 | 821.7 | ok |
| W2 depth | `Repeat<0, 999>` | 1026.9 | 1170.4 | ok |
| W3 arith | `Add<200, 200>` | 221.1 | 284.4 | ok |
| W3 arith | `Add<400, 400>` | 312.7 | 384.7 | ok |
| W4 parser | 16 terms | 309.7 | 351.2 | ok |
| W4 parser | 24 terms | 723.2 | 851.0 | ok |
| W4 parser | 32 terms | 1638.2 | 1872.5 | limit hit (TS2589) |
| W5 graph | 1 000 nodes | 2.9 | 6.2 | ok |
| W5 graph | 10 000 nodes | 17.8 | 22.3 | ok |

W1, the 29 curriculum samples, has a median of 178 ms per sample, almost all
of it program construction over `lib.d.ts`. W5 scales near-linearly after
the 1.1.0 heap fix; the run on the previous implementation took 599 ms for
10 000 nodes.

## Reproducibility

- Pin Node with `.nvmrc`; TypeScript is pinned by `package-lock.json`.
- Results embed `process.version`, `ts.version`, CPU model, core count and
  memory; compare only runs with matching TypeScript versions.
- CI runs `--iterations 5` on each push and uploads the JSON as an artefact.
