# Architecture

```
TSVerseHub
├── index.html                     Vite entry (fonts, PWA meta)
├── src/
│   ├── main.tsx / App.tsx         React root, router, lazy pages, error boundary
│   ├── core/                      dependency-free kernel (no React, no DOM)
│   │   ├── type-level/            assert · tuple · arith · string · object · parser
│   │   ├── compiler/              virtual-host · analyze · node-libs
│   │   └── curriculum/            schema · graph · verify · registry
│   ├── concepts/<module>/         curriculum content + runnable demos (8 modules)
│   ├── mini-projects/             form-validation · drag-drop-dashboard · decorator-driven-di
│   │                              event-bus · compiler-playground
│   ├── components/                ui · editors (Monaco) · dashboards · charts · common · loaders
│   ├── pages/                     Home · Dashboard · Concepts · MiniProjects · Playground · About
│   ├── hooks/ contexts/ utils/    state, persistence, compiler utilities, type graph, quiz engine
│   └── assets/                    font stacks, synthesised sound cues, CSS variables
├── tests/
│   ├── core/                      unit + property-based (fast-check) for src/core
│   ├── type-level/                compile-time assertion suites (*.test-d.ts)
│   ├── concepts/ mini-projects/ utils/   self-contained behavioural suites
│   └── (src/setupTests.ts)        jsdom polyfills, jest-dom matchers
├── research/
│   ├── verification/              verify-curriculum.ts · baseline.json
│   ├── benchmarks/                run-benchmarks.ts · *.bench.ts
│   └── results/                   generated JSON (git-ignored)
├── docs/
│   ├── adr/                       architecture decision records
│   ├── research/DESIGN.md         design document
│   └── *.md                       guides and cheat-sheets
├── scripts/                       cheat-sheet generation, playground bundle, PDF export, badges
├── deploy/nginx.conf · Dockerfile · docker-compose.yml
└── .github/                       CI, CodeQL, Dependabot, templates, CODEOWNERS
```

## Dependency rules

1. `src/core` imports only `typescript` and Node built-ins (the latter only
   in `node-libs.ts`, which browser code never imports).
2. `src/concepts` and `src/mini-projects` may import `src/core` and
   `src/components`; nothing imports from them except pages.
3. `research/` and `scripts/` run under `tsconfig.node.json` and may import
   `src/core` via the `@/` alias.
4. Tests never import application UI except through Testing Library.

## TypeScript projects

| Project | Includes | Types |
|---|---|---|
| `tsconfig.json` | `src/**` | `vite/client`, `vite-plugin-pwa/client` |
| `tsconfig.node.json` | configs, `scripts/**`, `research/**` | `node` |
| `tsconfig.typetests.json` | `tests/**`, `src/setupTests.ts` | `vitest/globals`, `node` |

All extend `tsconfig.base.json` (strict profile; see ADR 0006).

## Build and runtime

- Vite 5 with manual chunks (vendor, router, editor, charts, ui, utils),
  hashed asset paths, PWA service worker (`generateSW`, auto-update).
- Docker: Node 20 build stage, nginx runtime with SPA fallback, immutable
  caching for hashed assets and no-cache for `sw.js`.

## Quality gates (CI)

typecheck (app + node) → typecheck:types → lint (zero warnings) →
test:coverage → build → research:verify → research:benchmark (5 iterations).
