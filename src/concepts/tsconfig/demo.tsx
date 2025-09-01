// File: concepts/tsconfig/demo.tsx

import React, { useState, useCallback } from 'react';

const TSConfigDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'basics' | 'strict' | 'modules' | 'paths' | 'references'>('basics');
  const [selectedTemplate, setSelectedTemplate] = useState<'node' | 'browser' | 'library' | 'react'>('node');
  const [generatedConfig, setGeneratedConfig] = useState('');

  // Mock tsconfig templates
  const configTemplates = {
    node: {
      compilerOptions: {
        target: 'es2020',
        module: 'commonjs',
        lib: ['es2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        declaration: true,
        sourceMap: true,
        types: ['node']
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    },
    browser: {
      compilerOptions: {
        target: 'es2020',
        module: 'es2020',
        lib: ['es2020', 'dom', 'dom.iterable'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        sourceMap: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts']
    },
    library: {
      compilerOptions: {
        target: 'es2018',
        module: 'commonjs',
        lib: ['es2018'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        composite: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
    },
    react: {
      compilerOptions: {
        target: 'es2020',
        module: 'esnext',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx'
      },
      include: ['src'],
      exclude: ['node_modules']
    }
  };

  const generateConfig = useCallback(() => {
    const template = configTemplates[selectedTemplate];
    const formatted = JSON.stringify(template, null, 2);
    setGeneratedConfig(formatted);
  }, [selectedTemplate]);

  const strictModeOptions = [
    {
      flag: 'strict',
      description: 'Enable all strict type checking options',
      effect: 'Master flag that enables all strict mode checks'
    },
    {
      flag: 'noImplicitAny',
      description: 'Raise error on expressions with implied any type',
      effect: 'Forces explicit type annotations, prevents accidental any types'
    },
    {
      flag: 'strictNullChecks',
      description: 'Enable strict null checks',
      effect: 'null and undefined must be handled explicitly'
    },
    {
      flag: 'strictFunctionTypes',
      description: 'Enable strict checking of function types',
      effect: 'Prevents unsafe function type assignments'
    },
    {
      flag: 'strictBindCallApply',
      description: 'Enable strict bind, call, and apply methods',
      effect: 'Type checks bind(), call(), and apply() method calls'
    },
    {
      flag: 'strictPropertyInitialization',
      description: 'Enable strict checking of property initialization',
      effect: 'Class properties must be initialized or marked with !'
    },
    {
      flag: 'noImplicitReturns',
      description: 'Report error when not all code paths return a value',
      effect: 'All code paths in functions must return a value'
    },
    {
      flag: 'noFallthroughCasesInSwitch',
      description: 'Report errors for fallthrough cases in switch',
      effect: 'Prevents accidental case statement fallthrough'
    }
  ];

  const moduleResolutionStrategies = [
    {
      strategy: 'node',
      description: 'Node.js-style module resolution',
      when: 'Most common, works with npm packages',
      example: 'import lodash from "lodash" → node_modules/lodash/index.js'
    },
    {
      strategy: 'classic',
      description: 'TypeScript classic module resolution',
      when: 'Legacy projects, rarely used',
      example: 'import "./file" → ./file.ts, ./file.tsx, ./file.d.ts'
    }
  ];

  const pathMappingExamples = [
    {
      alias: '@/*',
      paths: ['src/*'],
      description: 'Map @ to src directory',
      example: 'import { utils } from "@/utils" → src/utils'
    },
    {
      alias: '@components/*',
      paths: ['src/components/*'],
      description: 'Direct component imports',
      example: 'import Button from "@components/Button"'
    },
    {
      alias: '@utils/*',
      paths: ['src/utils/*', 'lib/utils/*'],
      description: 'Multiple fallback paths',
      example: 'Tries src/utils first, then lib/utils'
    }
  ];

  React.useEffect(() => {
    generateConfig();
  }, [generateConfig]);

  const sectionButtons = [
    { key: 'basics' as const, label: 'Basics', icon: '⚙️', color: 'bg-blue-500' },
    { key: 'strict' as const, label: 'Strict Mode', icon: '🔒', color: 'bg-red-500' },
    { key: 'modules' as const, label: 'Module Resolution', icon: '📦', color: 'bg-green-500' },
    { key: 'paths' as const, label: 'Path Mapping', icon: '🗺️', color: 'bg-purple-500' },
    { key: 'references' as const, label: 'Project References', icon: '🔗', color: 'bg-orange-500' },
  ];

  const templateButtons = [
    { key: 'node' as const, label: 'Node.js', icon: '🟢', desc: 'Server-side applications' },
    { key: 'browser' as const, label: 'Browser', icon: '🌐', desc: 'Client-side applications' },
    { key: 'library' as const, label: 'Library', icon: '📚', desc: 'Reusable packages' },
    { key: 'react' as const, label: 'React', icon: '⚛️', desc: 'React applications' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ⚙️ TypeScript Configuration (tsconfig.json) Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Interactive guide to TypeScript configuration options, compiler settings, and project setup.
          Learn how to optimize your TypeScript projects with proper configuration.
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-3 mb-6">
        {sectionButtons.map(({ key, label, icon, color }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all ${
              activeSection === key 
                ? `${color} shadow-md transform scale-105` 
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Basics Section */}
      {activeSection === 'basics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📋 Project Templates
            </h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {templateButtons.map(({ key, label, icon, desc }) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedTemplate === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium">{label}</span>
                  </div>
                  <div className="text-sm text-gray-600">{desc}</div>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Key Configuration Options:</h3>
              <div className="space-y-2 text-sm">
                <div><strong>target:</strong> JavaScript version to compile to</div>
                <div><strong>module:</strong> Module code generation (CommonJS, ES6, etc.)</div>
                <div><strong>lib:</strong> Library files to include in compilation</div>
                <div><strong>outDir:</strong> Output directory for compiled files</div>
                <div><strong>strict:</strong> Enable strict type checking options</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📄 Generated tsconfig.json
            </h2>
            <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              <pre>{generatedConfig}</pre>
            </div>
            <button
              onClick={generateConfig}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              🔄 Regenerate Config
            </button>
          </div>
        </div>
      )}

      {/* Strict Mode Section */}
      {activeSection === 'strict' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🔒 Strict Mode Options
          </h2>
          <p className="text-gray-600 mb-6">
            Strict mode enables stronger guarantees of program correctness through enhanced type checking.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strictModeOptions.map((option, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h3 className="font-mono font-semibold text-red-800 mb-1">
                      {option.flag}
                    </h3>
                    <p className="text-sm text-red-700 mb-2">
                      {option.description}
                    </p>
                    <p className="text-xs text-red-600 italic">
                      Effect: {option.effect}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Migration Strategy</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Phase 1:</strong> Enable noImplicitAny and noImplicitReturns</p>
              <p><strong>Phase 2:</strong> Add strictFunctionTypes and strictBindCallApply</p>
              <p><strong>Phase 3:</strong> Enable strictNullChecks (requires most changes)</p>
              <p><strong>Phase 4:</strong> Add strictPropertyInitialization and enable full strict mode</p>
            </div>
          </div>
        </div>
      )}

      {/* Module Resolution Section */}
      {activeSection === 'modules' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📦 Module Resolution Strategies
          </h2>
          <p className="text-gray-600 mb-6">
            How TypeScript resolves module imports and finds declaration files.
          </p>

          <div className="space-y-4 mb-6">
            {moduleResolutionStrategies.map((strategy, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  {strategy.strategy} Resolution
                </h3>
                <p className="text-sm text-green-700 mb-2">
                  {strategy.description}
                </p>
                <p className="text-sm text-green-600 mb-2">
                  <strong>When to use:</strong> {strategy.when}
                </p>
                <div className="bg-green-100 p-2 rounded text-xs font-mono text-green-800">
                  {strategy.example}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Module Resolution Process:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Check for exact match with file extension</p>
              <p>2. Try adding .ts, .tsx, .d.ts extensions</p>
              <p>3. Look for index files in directories</p>
              <p>4. Search in node_modules for packages</p>
              <p>5. Check parent directories recursively</p>
            </div>
          </div>
        </div>
      )}

      {/* Path Mapping Section */}
      {activeSection === 'paths' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🗺️ Path Mapping & Aliases
          </h2>
          <p className="text-gray-600 mb-6">
            Simplify imports with path aliases and base URL configuration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Path Mapping Examples</h3>
              <div className="space-y-3">
                {pathMappingExamples.map((path, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="font-mono text-purple-800 text-sm mb-1">
                      "{path.alias}": {JSON.stringify(path.paths)}
                    </div>
                    <p className="text-sm text-purple-700 mb-1">
                      {path.description}
                    </p>
                    <div className="text-xs text-purple-600 font-mono bg-purple-100 p-1 rounded">
                      {path.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-3">Configuration Example</h3>
              <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm">
                <pre>{`{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}`}</pre>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">⚠️ Important Notes</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• baseUrl must be set when using paths mapping</p>
              <p>• Path mapping is compile-time only - runtime resolvers may need configuration</p>
              <p>• Use relative paths within your project, aliases for cross-cutting concerns</p>
              <p>• IDEs need proper configuration to recognize aliases for navigation</p>
            </div>
          </div>
        </div>
      )}

      {/* Project References Section */}
      {activeSection === 'references' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🔗 Project References
          </h2>
          <p className="text-gray-600 mb-6">
            Structure large codebases with project references for better build performance and organization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Benefits</h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-orange-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>Faster incremental builds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>Better code organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>Enforced build dependencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>Parallel compilation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>Better IDE performance</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-3">Project Structure</h3>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <pre>{`monorepo/
├── tsconfig.json (root)
├── packages/
│   ├── shared/
│   │   ├── tsconfig.json
│   │   └── src/
│   ├── api/
│   │   ├── tsconfig.json
│   │   └── src/
│   └── web/
│       ├── tsconfig.json
│       └── src/`}</pre>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Root tsconfig.json</h3>
              <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm">
                <pre>{`{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ]
}`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-3">Package tsconfig.json</h3>
              <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm">
                <pre>{`{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "references": [
    { "path": "../shared" }
  ],
  "include": ["src/**/*"]
}`}</pre>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">🚀 Build Commands</h3>
            <div className="text-sm text-green-700 space-y-1 font-mono">
              <p><strong>tsc --build</strong> - Build all referenced projects</p>
              <p><strong>tsc --build --watch</strong> - Watch mode for all projects</p>
              <p><strong>tsc --build --clean</strong> - Clean all build outputs</p>
              <p><strong>tsc --build --force</strong> - Force rebuild all projects</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Tips */}
      <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
          <span>💡</span> Configuration Best Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-indigo-700 mb-2">Development:</h4>
            <ul className="list-disc list-inside space-y-1 text-indigo-600">
              <li>Enable strict mode from the start</li>
              <li>Use incremental compilation for faster builds</li>
              <li>Set up path aliases for cleaner imports</li>
              <li>Enable source maps for debugging</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-700 mb-2">Production:</h4>
            <ul className="list-disc list-inside space-y-1 text-indigo-600">
              <li>Generate declaration files for libraries</li>
              <li>Remove comments and unused code</li>
              <li>Use project references for large codebases</li>
              <li>Optimize target and lib for your runtime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TSConfigDemo;