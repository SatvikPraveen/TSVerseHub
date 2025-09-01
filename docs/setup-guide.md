# TypeScript Setup Guide
**File Location:** `docs/setup-guide.md`

This comprehensive guide will walk you through setting up TypeScript for different types of projects, from simple scripts to complex applications.

## Table of Contents
1. [Installation](#installation)
2. [Basic Configuration](#basic-configuration)
3. [Project Setup Scenarios](#project-setup-scenarios)
4. [Development Tools](#development-tools)
5. [Build and Deployment](#build-and-deployment)
6. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

Make sure you have Node.js installed (version 14 or higher recommended):

```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

### Global Installation

```bash
# Install TypeScript globally
npm install -g typescript

# Verify installation
tsc --version

# Install ts-node for running TypeScript directly
npm install -g ts-node
```

### Local Installation (Recommended)

For projects, it's better to install TypeScript locally:

```bash
# Initialize package.json if not exists
npm init -y

# Install TypeScript as dev dependency
npm install --save-dev typescript

# Install additional tools
npm install --save-dev @types/node ts-node nodemon

# Install TypeScript definitions for common packages
npm install --save-dev @types/jest @types/express @types/lodash
```

## Basic Configuration

### Creating tsconfig.json

The `tsconfig.json` file configures TypeScript compilation options:

```bash
# Generate basic tsconfig.json
npx tsc --init
```

### Essential tsconfig.json Configuration

```json
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "CommonJS",
    "moduleResolution": "node",
    
    /* Emit */
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "removeComments": false,
    
    /* Interop Constraints */
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    
    /* Type Checking */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    
    /* Completeness */
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### Different Configuration Profiles

#### Development Configuration

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  },
  "exclude": [
    "node_modules",
    "dist",
    "**/*.prod.ts"
  ]
}
```

#### Production Configuration

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true,
    "declaration": false,
    "declarationMap": false
  },
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.dev.ts"
  ]
}
```

## Project Setup Scenarios

### 1. Simple Node.js Project

#### Directory Structure
```
my-node-project/
├── src/
│   ├── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   └── types/
│       └── index.ts
├── dist/
├── package.json
├── tsconfig.json
└── .gitignore
```

#### Setup Steps

1. **Initialize project:**
```bash
mkdir my-node-project
cd my-node-project
npm init -y
```

2. **Install dependencies:**
```bash
npm install --save-dev typescript @types/node ts-node nodemon
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint prettier
```

3. **Create tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

4. **Update package.json scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "watch": "nodemon --exec ts-node src/index.ts",
    "clean": "rm -rf dist"
  }
}
```

5. **Create .gitignore:**
```gitignore
node_modules/
dist/
*.log
.env
.tsbuildinfo
```

### 2. Express.js API Project

#### Additional Dependencies
```bash
npm install express cors helmet morgan
npm install --save-dev @types/express @types/cors @types/morgan
```

#### Project Structure
```
express-api/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── utils/
├── tests/
├── package.json
└── tsconfig.json
```

#### Sample app.ts
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';
import { routes } from './routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app;
```

### 3. React TypeScript Project

#### Using Create React App
```bash
npx create-react-app my-app --template typescript
cd my-app
```

#### Manual Setup
```bash
npm install react react-dom
npm install --save-dev @types/react @types/react-dom typescript
```

#### tsconfig.json for React
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

### 4. Next.js TypeScript Project

```bash
npx create-next-app@latest --typescript
cd my-next-app
```

#### Manual Next.js Setup
```bash
npm install next react react-dom
npm install --save-dev typescript @types/react @types/node
```

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // Enable TypeScript strict mode
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
```

### 5. Library/Package Development

#### tsconfig.json for Libraries
```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "CommonJS",
    "lib": ["ES2015", "ES2017", "ES2018", "ES2019", "ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./lib",
    "rootDir": "./src",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib", "**/*.test.ts", "**/*.spec.ts"]
}
```

#### Package.json for Libraries
```json
{
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "files": [
    "lib/**/*"
  ],
  "scripts": {
    "build": "tsc",
    "prepare": "npm run build",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  }
}
```

## Development Tools

### ESLint Configuration

1. **Install ESLint:**
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

2. **Create .eslintrc.js:**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
```

### Prettier Configuration

1. **Install Prettier:**
```bash
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

2. **Create .prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2
}
```

3. **Create .prettierignore:**
```gitignore
node_modules
dist
lib
build
coverage
```

### Jest Testing Setup

1. **Install Jest:**
```bash
npm install --save-dev jest @types/jest ts-jest
```

2. **Create jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### Husky and lint-staged

1. **Install:**
```bash
npm install --save-dev husky lint-staged
npx husky install
```

2. **Add to package.json:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### VS Code Configuration

#### .vscode/settings.json
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.tsbuildinfo": true
  }
}
```

#### .vscode/extensions.json
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## Build and Deployment

### Build Scripts

#### Basic Build
```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "build:prod": "tsc --build tsconfig.prod.json",
    "clean": "rm -rf dist && rm -f .tsbuildinfo"
  }
}
```

#### Advanced Build with webpack
```bash
npm install --save-dev webpack webpack-cli ts-loader
```

#### webpack.config.js
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
};
```

### Docker Setup

#### Dockerfile
```dockerfile
# Build stage
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

#### .dockerignore
```gitignore
node_modules
npm-debug.log
dist
.git
.gitignore
README.md
.env
.nyc_output
coverage
.tsbuildinfo
```

### CI/CD Pipeline (GitHub Actions)

#### .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
      - run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

## Troubleshooting

### Common Issues

#### 1. Module Resolution Problems

**Error:** `Cannot find module 'xxx' or its corresponding type declarations.`

**Solutions:**
```bash
# Install type definitions
npm install --save-dev @types/xxx

# Add to tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

#### 2. Import/Export Issues

**Error:** `Module has no default export`

**Solutions:**
```typescript
// Instead of
import fs from 'fs';

// Use
import * as fs from 'fs';
// or
import { readFileSync } from 'fs';
```

#### 3. Strict Mode Errors

**Error:** `Object is possibly 'null' or 'undefined'`

**Solutions:**
```typescript
// Use optional chaining
const value = obj?.property?.subProperty;

// Use nullish coalescing
const result = value ?? defaultValue;

// Type guards
if (obj !== null && obj !== undefined) {
  // obj is now guaranteed to exist
}
```

#### 4. Declaration File Issues

**Error:** `Could not find a declaration file for module 'xxx'`

**Solutions:**
```typescript
// Create types/xxx.d.ts
declare module 'xxx' {
  export function someFunction(): void;
}

// Or add to tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

#### 5. Build Performance Issues

**Solutions:**
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  },
  "ts-node": {
    "transpileOnly": true
  }
}
```

### Debugging Tips

1. **Use TypeScript Compiler API:**
```bash
# Check what files are being compiled
tsc --listFiles

# Show compilation reasons
tsc --explainFiles

# Generate trace files
tsc --generateTrace trace
```

2. **Enable detailed diagnostics:**
```json
{
  "compilerOptions": {
    "extendedDiagnostics": true
  }
}
```

3. **Project references for large projects:**
```json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" }
  ]
}
```

## Best Practices

1. **Always use strict mode** - Enable `"strict": true` in tsconfig.json
2. **Organize imports** - Use absolute imports with path mapping
3. **Use project references** - For monorepos and large projects
4. **Enable incremental compilation** - For faster builds
5. **Set up proper linting** - ESLint + Prettier + Husky
6. **Write types first** - Define interfaces before implementation
7. **Use type-only imports** - `import type { ... }` for type imports
8. **Enable source maps** - For better debugging experience

## Path Mapping Example

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/components/*": ["src/components/*"]
    }
  }
}
```

This comprehensive setup guide should help you get started with TypeScript in various project scenarios. Choose the configuration that best fits your project needs and gradually adopt more advanced features as your project grows.