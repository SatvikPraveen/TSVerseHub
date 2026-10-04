# 0010. ESLint 10 flat config and the React Compiler hook rules

Date: 2026-10-04 · Status: Accepted

## Context

ESLint 10 removed the legacy `.eslintrc` format. The project's lint policy
(ADR 0006) lived in `.eslintrc.cjs`, together with the plugin set it relied
on: `@typescript-eslint`, `react`, `react-hooks`, `react-refresh`,
`jsx-a11y`, `import` and `eslint-config-prettier`. Upgrading changed more
than the file format:

- `eslint-plugin-import` 2.x declares ESLint `^9` at most and is not
  maintained for ESLint 10.
- `eslint-plugin-react` 7.37.5 and `eslint-plugin-jsx-a11y` 6.10.2 are the
  latest releases and declare ESLint `^9` at most. Their recommended rules
  run on ESLint 10, except that `eslint-plugin-react`'s
  `settings.react.version: 'detect'` calls `context.getFilename()`, which
  ESLint 10 removed.
- `eslint-plugin-react-hooks` 7 adds rules derived from the React Compiler
  (`set-state-in-effect`, `refs`, `purity`, `immutability`,
  `static-components`, `use-memo` and others) to its recommended set.
- `eslint:recommended` in ESLint 10 adds `no-useless-assignment`.

## Decision

- The configuration is `eslint.config.js` (ESM, `defineConfig`). It keeps
  every rule, override and ignore of the legacy file: type-aware linting
  over the three TypeScript projects, `no-explicit-any` as an error except
  under `src/concepts/**`, non-null assertions allowed only in tests, the
  import ordering rules, React / jsx-a11y / react-refresh rules, Prettier
  last, and the browser/Node globals split (Node-only files switch the
  browser-only globals off, the flat-config equivalent of
  `env: { browser: false }`).
- The three projects are listed explicitly in `parserOptions.project`
  rather than found through `projectService`. The project service attaches
  each file to the nearest `tsconfig.json`, but tests belong to
  `tsconfig.typetests.json` and tooling to `tsconfig.node.json`.
- `eslint-plugin-import` is replaced by its maintained fork
  `eslint-plugin-import-x` (same rules under the `import-x/` prefix), with
  `eslint-import-resolver-typescript` 4 through `import-x/resolver-next`.
- `eslint-plugin-react` and `eslint-plugin-jsx-a11y` stay at their latest
  releases. `package.json` `overrides` lets them resolve against ESLint 10
  until they declare it, and the config reads the React version from
  `react/package.json` instead of using `'detect'`.
- The `react-hooks` recommended set is enabled in full. Code it flagged
  was fixed rather than exempted: state copied from props or computed in
  effects became derived values or "adjust state while rendering" updates,
  refs are no longer read or written during render, and `Math.random()` /
  `Date.now()` are no longer called while rendering. No rule is disabled.

## Consequences

- `npm run lint` no longer needs `--ext`; ESLint lints `*.ts`, `*.tsx` and
  the config file itself. Dot-directories are not ignored implicitly any
  more, so local tool state (`.claude/`) and test output folders are in
  the ignore list.
- The hook rules found real defects, among them random React keys that
  remounted every AST node on each render, random ids that broke a
  modal's `aria-labelledby`, a modal effect that replayed its open sound
  and `onOpen` callback, a force simulation that was never stopped, and
  drag bounds measured during render (stale on the first drag).
- When `eslint-plugin-react` and `eslint-plugin-jsx-a11y` publish releases
  that support ESLint 10, the `overrides` entries and the explicit React
  version can be removed.
