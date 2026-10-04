/* eslint-env node */
// ESLint configuration (legacy format, ESLint 8).
// Type-aware rules run against the three TypeScript projects declared in tsconfig.json.

module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.typetests.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-refresh', 'jsx-a11y', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { alwaysTryTypes: true, project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.typetests.json'] },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  ignorePatterns: [
    'dist',
    'coverage',
    'node_modules',
    'research/results',
    '*.cjs',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
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
    'import/no-unresolved': 'off', // handled by TypeScript
    'import/named': 'off',
    'import/no-duplicates': 'error',
    'import/order': [
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
  overrides: [
    {
      files: ['src/concepts/**/*.ts', 'src/concepts/**/*.tsx'],
      // Teaching material intentionally demonstrates patterns a production lint
      // set discourages: `any` is itself a curriculum topic (what it unsoundly
      // permits and how to replace it), so the rule is disabled only here.
      // Platform code (components, hooks, utils, mini-projects, core) keeps it
      // as an error.
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        'react-refresh/only-export-components': 'off',
        'import/order': 'off',
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
        'import/order': 'off',
      },
    },
    {
      files: ['scripts/**/*.ts', 'research/**/*.ts', 'vite.config.ts', 'vitest.config.ts'],
      env: { node: true, browser: false },
    },
  ],
};
