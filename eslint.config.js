// ESLint flat configuration (ESLint 10).
// Type-aware rules run against the three TypeScript projects declared in
// tsconfig.json, tsconfig.node.json and tsconfig.typetests.json.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// The projects are listed explicitly rather than discovered through
// `parserOptions.projectService`: the project service attaches each file to
// the nearest `tsconfig.json`, but tests/** belong to tsconfig.typetests.json
// and scripts/research/tool configs to tsconfig.node.json, neither of which
// is named tsconfig.json or referenced from it.
const tsProjects = ['./tsconfig.json', './tsconfig.node.json', './tsconfig.typetests.json'];

// `import.meta.dirname` needs Node 20.11; the engines field allows any Node 20.
const rootDir = fileURLToPath(new URL('.', import.meta.url));

// eslint-plugin-react's `version: 'detect'` calls `context.getFilename()`,
// which ESLint 10 removed, so the installed React version is read here
// instead; the effect is the same as detection.
const reactVersion = createRequire(import.meta.url)('react/package.json').version;

// Flat config merges `globals` across matching config objects, so narrowing
// Node-only files to the Node environment means switching the browser-only
// globals off explicitly (the legacy `env: { browser: false }`).
const browserOnlyGlobalsOff = Object.fromEntries(
  Object.keys(globals.browser)
    .filter((name) => !(name in globals.node))
    .map((name) => [name, 'off']),
);

export default defineConfig(
  globalIgnores([
    'dist',
    'coverage',
    'node_modules',
    'research/results',
    '**/*.cjs',
    // Generated output and local tooling state (dot-directories were ignored
    // implicitly by the legacy config format; flat config lints them).
    'playwright-report',
    'test-results',
    '.claude',
  ]),

  {
    // Lint the TypeScript sources (the legacy `--ext ts,tsx`) and this config.
    files: ['**/*.{ts,tsx}', 'eslint.config.js'],
    extends: [js.configs.recommended],
  },

  {
    files: ['eslint.config.js'],
    languageOptions: { globals: globals.node },
  },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    plugins: { 'react-refresh': reactRefresh.plugin },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Browser and Node globals everywhere by default; Node-only code is
      // narrowed below.
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        project: tsProjects,
        tsconfigRootDir: rootDir,
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: reactVersion },
      'import-x/resolver-next': [
        // Three separate projects are intentional (app, Node tooling, tests),
        // so the resolver's multiple-projects performance hint is silenced.
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: tsProjects,
          noWarnOnMultipleProjects: true,
        }),
        createNodeResolver({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
      ],
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-namespace': 'off', // namespaces are a curriculum topic
      '@typescript-eslint/no-unsafe-declaration-merging': 'off', // declaration merging is a curriculum topic
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off', // type-level demonstrations use bare expressions

      // React
      'react/prop-types': 'off',
      'react/self-closing-comp': 'error',
      'react/jsx-no-target-blank': ['error', { allowReferrer: false }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Imports
      'import-x/no-unresolved': 'off', // handled by TypeScript
      'import-x/named': 'off',
      'import-x/no-duplicates': 'error',
      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // General
      'no-console': 'off',
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  },

  {
    files: ['src/concepts/**/*.ts', 'src/concepts/**/*.tsx'],
    // Teaching material intentionally demonstrates patterns a production lint
    // set discourages: `any` is itself a curriculum topic (what it unsoundly
    // permits and how to replace it), so the rule is disabled only here.
    // Platform code (components, hooks, utils, mini-projects, core) keeps it
    // as an error. See docs/adr/0006-strictness-policy.md.
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'react-refresh/only-export-components': 'off',
      'import-x/order': 'off',
      'no-prototype-builtins': 'off',
      'no-inner-declarations': 'off',
      'prefer-const': 'warn',
    },
  },

  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx'],
    // In tests a non-null assertion directly after an existence assertion
    // (expect(x).toBeDefined(); x!.y) is idiomatic and the failure mode is
    // a failing test, not a production crash.
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import-x/order': 'off',
    },
  },

  {
    files: ['scripts/**/*.ts', 'research/**/*.ts', 'vite.config.ts', 'vitest.config.ts'],
    // Node-only code: no browser globals.
    languageOptions: { globals: { ...browserOnlyGlobalsOff, ...globals.node } },
  },

  // Last, so it switches off every stylistic rule that Prettier owns.
  prettier,
);
