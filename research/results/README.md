# Results

Generated artefacts land here and are ignored by git, except for files that
are deliberately committed as reference measurements. Each JSON file embeds
its environment (Node, TypeScript, CPU, iteration count) so it can be compared
against a run on another machine.

- `curriculum-verification.json`: output of `npm run research:verify`
- `benchmark-YYYY-MM-DD.json`: output of `npm run research:benchmark`
- `reference-benchmark.json` (committed): the reference run published with
  release 1.1.0, produced by the CI `research` job on a GitHub-hosted
  `ubuntu-latest` runner (10 iterations per case). A shared CI runner is a
  standardised, reproducible machine; a developer laptop under unrelated
  load is not. The `environment` block records the CPU, versions and the
  load average at the start and end of the run.
