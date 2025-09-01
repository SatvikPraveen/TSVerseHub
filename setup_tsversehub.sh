#!/bin/bash

# setup_tsversehub.sh
# Creates the complete TSVerseHub project structure

echo "🚀 Setting up TSVerseHub project structure..."

# Create main directories
mkdir -p public/{images/{banners,icons},badges}
mkdir -p src/{assets/{fonts,sounds,styles},components/{charts,common,dashboards,editors,loaders,ui},concepts/{advanced-types,basics,compiler-api,decorators,generics,namespaces-modules,patterns,tsconfig},hooks,mini-projects/{compiler-playground,decorator-driven-di,drag-drop-dashboard,event-bus,form-validation},pages,styles,utils,contexts,types}
mkdir -p docs
mkdir -p scripts
mkdir -p tests/{concepts,mini-projects,utils}

echo "📁 Created directory structure"

# Create placeholder files to maintain directory structure
touch public/images/banners/.gitkeep
touch public/images/icons/.gitkeep
touch public/badges/.gitkeep

echo "📄 Created placeholder files"

# Create concept index files
concepts=("advanced-types" "basics" "compiler-api" "decorators" "generics" "namespaces-modules" "patterns" "tsconfig")

for concept in "${concepts[@]}"; do
    cat > "src/concepts/$concept/index.ts" << EOF
// src/concepts/$concept/index.ts

export const ${concept//-/_}Concept = {
  id: '$concept',
  title: '${concept^}',
  description: 'Learn about ${concept//-/ } in TypeScript',
  difficulty: 'intermediate',
  estimatedTime: 30,
  prerequisites: [],
  learningObjectives: [],
  examples: [],
  exercises: [],
  resources: []
};

export default ${concept//-/_}Concept;
EOF

    touch "src/concepts/$concept/demo.tsx"
    touch "src/concepts/$concept/exercises.ts"
done

echo "📚 Created concept files"

# Create mini-project index files  
projects=("compiler-playground" "decorator-driven-di" "drag-drop-dashboard" "event-bus" "form-validation")

for project in "${projects[@]}"; do
    cat > "src/mini-projects/$project/index.ts" << EOF
// src/mini-projects/$project/index.ts

export const ${project//-/_}Project = {
  id: '$project',
  title: '${project^}',
  description: 'Build a ${project//-/ } with TypeScript',
  difficulty: 'intermediate',
  estimatedTime: 120,
  skills: [],
  files: [],
  instructions: []
};

export default ${project//-/_}Project;
EOF
done

echo "🔧 Created mini-project files"

# Create documentation files
cat > docs/setup-guide.md << 'EOF'
# TSVerseHub Setup Guide

## Prerequisites
- Node.js >= 16.0.0
- npm >= 7.0.0

## Installation
1. Run setup script: `./setup_tsversehub.sh`
2. Install dependencies: `./bootstrap.sh`
3. Start development: `npm run dev`

## Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Check code quality
EOF

cat > docs/mini-projects.md << 'EOF'
# Mini Projects Guide

## Available Projects
1. Form Validation Library
2. Drag & Drop Dashboard  
3. Event Bus System
4. Compiler Playground
5. Dependency Injection Container

Each project includes step-by-step instructions and TypeScript concepts.
EOF

cat > docs/ts-cheatsheet.md << 'EOF'
# TypeScript Cheat Sheet

## Basic Types
- string, number, boolean
- Array<T> or T[]
- object, any, unknown
- void, never, null, undefined

## Advanced Types
- Union: T | U
- Intersection: T & U
- Conditional: T extends U ? X : Y
- Mapped: { [K in keyof T]: T[K] }

## Utility Types
- Partial<T>, Required<T>, Readonly<T>
- Pick<T, K>, Omit<T, K>
- Record<K, T>, Exclude<T, U>, Extract<T, U>
EOF

echo "📚 Created documentation files"

# Create basic component files
cat > src/components/common/Navbar.tsx << 'EOF'
// src/components/common/Navbar.tsx

import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              TSVerseHub
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/concepts" className="text-gray-700 hover:text-blue-600 dark:text-gray-300">
              Concepts
            </Link>
            <Link to="/playground" className="text-gray-700 hover:text-blue-600 dark:text-gray-300">
              Playground
            </Link>
            <Link to="/mini-projects" className="text-gray-700 hover:text-blue-600 dark:text-gray-300">
              Projects
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
EOF

cat > src/components/common/Footer.tsx << 'EOF'
// src/components/common/Footer.tsx

export const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 TSVerseHub. Built with TypeScript and React.</p>
        </div>
      </div>
    </footer>
  );
};
EOF

echo "🧩 Created basic component files"

# Create placeholder page files
pages=("Home" "Dashboard" "Concepts" "Playground" "MiniProjects" "About")

for page in "${pages[@]}"; do
    cat > "src/pages/$page.tsx" << EOF
// src/pages/$page.tsx

const $page = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        $page
      </h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Coming soon...
      </p>
    </div>
  );
};

export default $page;
EOF
done

echo "📄 Created page files"

# Create basic styles
cat > src/styles/globals.css << 'EOF'
/* src/styles/globals.css */

/* Additional global styles */
.container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.btn {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500;
}
EOF

cat > src/styles/typography.css << 'EOF'
/* src/styles/typography.css */

.prose-custom {
  @apply prose prose-gray dark:prose-invert max-w-none;
}

.heading-1 {
  @apply text-4xl font-bold text-gray-900 dark:text-white;
}

.heading-2 {
  @apply text-3xl font-semibold text-gray-900 dark:text-white;
}
EOF

cat > src/styles/dashboard.css << 'EOF'
/* src/styles/dashboard.css */

.dashboard-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.dashboard-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}
EOF

cat > src/styles/playground.css << 'EOF'
/* src/styles/playground.css */

.playground-container {
  @apply flex flex-col h-full;
}

.playground-editor {
  @apply flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden;
}
EOF

echo "🎨 Created style files"

# Create asset directories and files
cat > src/assets/fonts/inter.css << 'EOF'
/* Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
EOF

cat > src/assets/fonts/space-grotesk.css << 'EOF'
/* Space Grotesk font */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
EOF

cat > src/assets/styles/variables.css << 'EOF'
/* CSS Variables */
:root {
  --navbar-height: 4rem;
  --sidebar-width: 16rem;
}
EOF

cat > src/assets/styles/animations.css << 'EOF'
/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
EOF

echo "🎨 Created asset files"

# Create utility files
cat > src/utils/logger.ts << 'EOF'
// src/utils/logger.ts

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};
EOF

echo "🛠️ Created utility files"

# Create type definitions
cat > src/types/index.ts << 'EOF'
// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Concept {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}
EOF

echo "📝 Created type definitions"

# Make the bootstrap script executable
chmod +x bootstrap.sh

echo "✅ TSVerseHub project structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Run: ./bootstrap.sh (to install dependencies)"
echo "2. Run: npm run dev (to start development server)"
echo ""
echo "Happy coding! 🚀"