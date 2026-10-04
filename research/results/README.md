# Results

Generated artefacts land here and are ignored by git, except for files that
are deliberately committed as reference measurements. Each JSON file embeds
its environment (Node, TypeScript, CPU, iteration count) so it can be compared
against a run on another machine.

- `curriculum-verification.json` — output of `npm run research:verify`
- `benchmark-YYYY-MM-DD.json` — output of `npm run research:benchmark`
