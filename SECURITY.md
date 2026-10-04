# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| `main` | yes |
| tagged releases < latest | security fixes only, best effort |

## Threat model

TSVerseHub is a static single-page application. The in-browser playground
compiles user-supplied TypeScript with the TypeScript Compiler API and, in
the "run" mode, executes the transpiled JavaScript in the page. Code a user
types is executed only in that user's own browser session; nothing is sent
to a server. Progress and preferences are stored in `localStorage`.

Issues we consider in scope:

- Cross-site scripting through rendered curriculum content or diagnostics
- Service-worker caching that could serve stale or attacker-controlled assets
- Dependency vulnerabilities reachable from the production bundle
- Supply-chain issues in the build or CI pipeline

## Reporting a vulnerability

Please do not open a public issue. Email satvikpraveen707@gmail.com with:

- a description of the issue and its impact,
- steps to reproduce or a proof of concept,
- the commit or version affected.

You will receive an acknowledgement within 72 hours and a resolution plan
within 14 days. Credit is given in the changelog unless you prefer otherwise.

## Automated controls

- CodeQL analysis on every push and pull request (`.github/workflows/codeql.yml`)
- Dependabot for npm and GitHub Actions (`.github/dependabot.yml`)
- `npm audit` is advisory; findings in production dependencies block releases
