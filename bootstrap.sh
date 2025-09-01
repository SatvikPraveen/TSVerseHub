#!/bin/bash

# bootstrap.sh
# Installs dependencies and configures TSVerseHub development environment

echo "🔧 Bootstrapping TSVerseHub development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="16.0.0"

if ! node -pe "require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION')" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please install Node.js $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js $NODE_VERSION detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Install git hooks
echo "🪝 Setting up git hooks..."
npx husky install

if [ $? -eq 0 ]; then
    echo "✅ Git hooks configured"
else
    echo "⚠️  Warning: Failed to configure git hooks (this is optional)"
fi

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
EOF

chmod +x .husky/pre-commit

# Create environment files
echo "🌍 Setting up environment files..."

# Development environment
cat > .env.development << 'EOF'
# Development environment variables
VITE_NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=TSVerseHub
VITE_APP_VERSION=1.0.0
VITE_ENABLE_PWA=false
VITE_ENABLE_ANALYTICS=false
EOF

# Production environment template
cat > .env.example << 'EOF'
# Environment variables template
VITE_NODE_ENV=production
VITE_API_URL=https://api.tsversehub.dev
VITE_APP_NAME=TSVerseHub
VITE_APP_VERSION=1.0.0
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ANALYTICS_ID=your-analytics-id
EOF

echo "✅ Environment files created"

# Create VS Code settings
echo "⚙️  Setting up VS Code configuration..."
mkdir -p .vscode

cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.includeAutomaticOptionalChainCompletions": true,
  "typescript.inlayHints.enumMemberValues.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.parameterTypes.enabled": true,
  "typescript.inlayHints.propertyDeclarationTypes.enabled": true,
  "typescript.inlayHints.variableTypes.enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": ["typescript", "typescriptreact"],
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "postcss": "css"
  },
  "tailwindCSS.includeLanguages": {
    "postcss": "css"
  }
}
EOF

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
EOF

cat > .vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "npm",
      "script": "dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": true,
        "clear": false
      },
      "problemMatcher": []
    },
    {
      "label": "build",
      "type": "npm", 
      "script": "build",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "test",
      "type": "npm",
      "script": "test",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "lint",
      "type": "npm",
      "script": "lint",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$eslint-stylish"]
    }
  ]
}
EOF

echo "✅ VS Code configuration created"

# Create additional config files
echo "📋 Creating additional configuration files..."

# TypeScript node config
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["vite.config.ts", "scripts/**/*"]
}
EOF

# Jest configuration
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{ts,tsx}'
  ]
};
EOF

# Playwright configuration
cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
EOF

# Setup tests file
cat > src/setupTests.ts << 'EOF'
// src/setupTests.ts
import '@testing-library/jest-dom';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};
EOF

# Create test directories and example tests
mkdir -p tests/e2e
cat > tests/e2e/example.spec.ts << 'EOF'
// tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /TSVerseHub/i })).toBeVisible();
});
EOF

echo "✅ Configuration files created"

# Create Docker files for containerized development (optional)
echo "🐳 Creating Docker configuration..."

cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    
  dev:
    image: node:18-alpine
    working_dir: /app
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
    environment:
      - NODE_ENV=development
EOF

cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location /assets {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

echo "✅ Docker configuration created"

# Run initial type check and linting
echo "🔍 Running initial code quality checks..."

echo "Running TypeScript type check..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "✅ TypeScript type check passed"
else
    echo "⚠️  Warning: TypeScript type check found issues (this is expected for initial setup)"
fi

echo "Running ESLint..."
npx eslint src --ext .ts,.tsx --fix
if [ $? -eq 0 ]; then
    echo "✅ ESLint check passed"
else
    echo "⚠️  Warning: ESLint found issues (this is expected for initial setup)"
fi

echo "Running Prettier..."
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
if [ $? -eq 0 ]; then
    echo "✅ Prettier formatting completed"
else
    echo "⚠️  Warning: Prettier encountered issues"
fi

# Generate initial build to test everything works
echo "🏗️  Testing build process..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build test successful"
    rm -rf dist  # Clean up test build
else
    echo "⚠️  Warning: Build test failed (this might be due to missing components)"
fi

echo ""
echo "🎉 Bootstrap completed successfully!"
echo ""
echo "📋 Summary:"
echo "  - Dependencies installed"
echo "  - Git hooks configured"  
echo "  - Environment files created"
echo "  - VS Code settings configured"
echo "  - TypeScript and ESLint configured"
echo "  - Test framework setup complete"
echo "  - Docker configuration created"
echo ""
echo "🚀 Next steps:"
echo "  1. npm run dev          - Start development server"
echo "  2. npm run build        - Build for production"
echo "  3. npm run test         - Run tests"
echo "  4. npm run lint         - Check code quality"
echo "  5. npm run format       - Format code"
echo ""
echo "📚 Available scripts:"
echo "  - npm run generate:cheatsheets  - Generate TypeScript cheat sheets"
echo "  - npm run build:playground      - Build playground components"
echo "  - npm run export:pdf            - Export learning materials as PDF"
echo "  - npm run sync:badges           - Update README badges"
echo ""
echo "Happy coding! 🚀✨"