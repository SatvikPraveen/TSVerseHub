// File: concepts/tsconfig/index.ts

/**
 * TYPESCRIPT CONFIGURATION (TSCONFIG.JSON)
 * 
 * This module demonstrates various TypeScript configuration options and
 * their effects on compilation, type checking, and project structure.
 * The tsconfig.json file is the heart of any TypeScript project.
 */

// Re-export all tsconfig-related concepts
export * from './basics';
export * from './strict-mode';
export * from './module-resolution';
export * from './path-aliases';
export * from './project-references';

// ===== CONFIGURATION OVERVIEW =====

/**
 * TSConfig Structure:
 * 
 * {
 *   "compilerOptions": { ... },     // Compilation settings
 *   "include": [...],               // Files to include
 *   "exclude": [...],               // Files to exclude
 *   "extends": "...",               // Inherit from another config
 *   "references": [...],            // Project references
 *   "watchOptions": { ... },        // Watch mode settings
 *   "typeAcquisition": { ... },     // Type acquisition for JS projects
 *   "buildOptions": { ... }         // Build-specific options
 * }
 */

// ===== COMMON COMPILER OPTIONS =====

export interface CompilerOptionsDemo {
  // Target JavaScript version
  target: 'es5' | 'es2015' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'esnext';
  
  // Module system
  module: 'commonjs' | 'amd' | 'system' | 'umd' | 'es6' | 'es2015' | 'es2020' | 'esnext' | 'node12' | 'nodenext';
  
  // Library files to include
  lib: string[]; // ['es2020', 'dom', 'dom.iterable']
  
  // Output directory
  outDir: string;
  
  // Root directory of source files
  rootDir: string;
  
  // Enable strict type checking
  strict: boolean;
  
  // Enable experimental decorator support
  experimentalDecorators: boolean;
  
  // Emit decorator metadata
  emitDecoratorMetadata: boolean;
  
  // Module resolution strategy
  moduleResolution: 'node' | 'classic';
  
  // Base URL for resolving non-relative module names
  baseUrl: string;
  
  // Path mapping for module resolution
  paths: { [key: string]: string[] };
  
  // Allow importing .json files
  resolveJsonModule: boolean;
  
  // Generate source maps
  sourceMap: boolean;
  
  // Generate declaration files
  declaration: boolean;
  
  // Remove comments from output
  removeComments: boolean;
  
  // Do not emit outputs
  noEmit: boolean;
  
  // Skip type checking of declaration files
  skipLibCheck: boolean;
  
  // Force consistent casing in file names
  forceConsistentCasingInFileNames: boolean;
}

// ===== PROJECT TYPES =====

export enum ProjectType {
  Node = 'node',
  Browser = 'browser',
  Library = 'library',
  React = 'react',
  Vue = 'vue',
  Express = 'express',
  NextJS = 'nextjs',
}

export interface ProjectConfig {
  type: ProjectType;
  name: string;
  description: string;
  tsconfig: any;
  packageJson?: any;
  additionalFiles?: string[];
}

// ===== CONFIGURATION TEMPLATES =====

export const configTemplates: Record<ProjectType, ProjectConfig> = {
  [ProjectType.Node]: {
    type: ProjectType.Node,
    name: 'Node.js Project',
    description: 'Server-side Node.js application',
    tsconfig: {
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
        allowSyntheticDefaultImports: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        sourceMap: true,
        declaration: true,
        types: ['node']
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    },
    packageJson: {
      scripts: {
        build: 'tsc',
        dev: 'ts-node src/index.ts',
        start: 'node dist/index.js'
      },
      devDependencies: {
        typescript: '^5.0.0',
        'ts-node': '^10.0.0',
        '@types/node': '^20.0.0'
      }
    }
  },

  [ProjectType.Browser]: {
    type: ProjectType.Browser,
    name: 'Browser Application',
    description: 'Client-side web application',
    tsconfig: {
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
        sourceMap: true,
        declaration: false,
        removeComments: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts']
    }
  },

  [ProjectType.Library]: {
    type: ProjectType.Library,
    name: 'TypeScript Library',
    description: 'Reusable TypeScript library',
    tsconfig: {
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
        removeComments: false,
        composite: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
    },
    packageJson: {
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      files: ['dist'],
      scripts: {
        build: 'tsc',
        prepublishOnly: 'npm run build'
      }
    }
  },

  [ProjectType.React]: {
    type: ProjectType.React,
    name: 'React Application',
    description: 'React web application with TypeScript',
    tsconfig: {
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
    },
    packageJson: {
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      },
      devDependencies: {
        typescript: '^5.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0'
      }
    }
  },

  [ProjectType.Vue]: {
    type: ProjectType.Vue,
    name: 'Vue Application',
    description: 'Vue.js application with TypeScript',
    tsconfig: {
      compilerOptions: {
        target: 'es2020',
        module: 'esnext',
        lib: ['es2020', 'dom', 'dom.iterable'],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        sourceMap: true,
        baseUrl: '.',
        paths: {
          '@/*': ['src/*']
        },
        types: ['vite/client']
      },
      include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      exclude: ['node_modules']
    }
  },

  [ProjectType.Express]: {
    type: ProjectType.Express,
    name: 'Express Server',
    description: 'Express.js server application',
    tsconfig: {
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
        allowSyntheticDefaultImports: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        sourceMap: true,
        types: ['node', 'express']
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    },
    packageJson: {
      dependencies: {
        express: '^4.18.0'
      },
      devDependencies: {
        typescript: '^5.0.0',
        'ts-node': '^10.0.0',
        '@types/node': '^20.0.0',
        '@types/express': '^4.17.0'
      }
    }
  },

  [ProjectType.NextJS]: {
    type: ProjectType.NextJS,
    name: 'Next.js Application',
    description: 'Next.js React framework application',
    tsconfig: {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [
          {
            name: 'next'
          }
        ],
        paths: {
          '@/*': ['./*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }
  }
};

// ===== CONFIGURATION UTILITIES =====

export class TSConfigManager {
  private config: any = {};

  constructor(initialConfig: any = {}) {
    this.config = { ...initialConfig };
  }

  // Set compiler option
  setCompilerOption(key: string, value: any): this {
    if (!this.config.compilerOptions) {
      this.config.compilerOptions = {};
    }
    this.config.compilerOptions[key] = value;
    return this;
  }

  // Get compiler option
  getCompilerOption(key: string): any {
    return this.config.compilerOptions?.[key];
  }

  // Add include pattern
  addInclude(pattern: string): this {
    if (!this.config.include) {
      this.config.include = [];
    }
    if (!this.config.include.includes(pattern)) {
      this.config.include.push(pattern);
    }
    return this;
  }

  // Add exclude pattern
  addExclude(pattern: string): this {
    if (!this.config.exclude) {
      this.config.exclude = [];
    }
    if (!this.config.exclude.includes(pattern)) {
      this.config.exclude.push(pattern);
    }
    return this;
  }

  // Set path mapping
  setPath(alias: string, paths: string[]): this {
    if (!this.config.compilerOptions) {
      this.config.compilerOptions = {};
    }
    if (!this.config.compilerOptions.paths) {
      this.config.compilerOptions.paths = {};
    }
    this.config.compilerOptions.paths[alias] = paths;
    return this;
  }

  // Enable strict mode
  enableStrictMode(): this {
    return this
      .setCompilerOption('strict', true)
      .setCompilerOption('noImplicitAny', true)
      .setCompilerOption('strictNullChecks', true)
      .setCompilerOption('strictFunctionTypes', true)
      .setCompilerOption('strictBindCallApply', true)
      .setCompilerOption('strictPropertyInitialization', true)
      .setCompilerOption('noImplicitReturns', true)
      .setCompilerOption('noFallthroughCasesInSwitch', true)
      .setCompilerOption('noUncheckedIndexedAccess', true);
  }

  // Configure for modern JavaScript
  configureModernJS(): this {
    return this
      .setCompilerOption('target', 'es2020')
      .setCompilerOption('lib', ['es2020'])
      .setCompilerOption('module', 'es2020')
      .setCompilerOption('moduleResolution', 'node')
      .setCompilerOption('esModuleInterop', true)
      .setCompilerOption('allowSyntheticDefaultImports', true);
  }

  // Configure for development
  configureDevelopment(): this {
    return this
      .setCompilerOption('sourceMap', true)
      .setCompilerOption('incremental', true)
      .setCompilerOption('noEmitOnError', false)
      .setCompilerOption('preserveWatchOutput', true);
  }

  // Configure for production
  configureProduction(): this {
    return this
      .setCompilerOption('sourceMap', false)
      .setCompilerOption('removeComments', true)
      .setCompilerOption('noEmitOnError', true)
      .setCompilerOption('declaration', true)
      .setCompilerOption('declarationMap', false);
  }

  // Get the final configuration
  getConfig(): any {
    return JSON.parse(JSON.stringify(this.config));
  }

  // Export as JSON string
  toJSON(pretty: boolean = true): string {
    return JSON.stringify(this.config, null, pretty ? 2 : 0);
  }

  // Load from template
  static fromTemplate(projectType: ProjectType): TSConfigManager {
    const template = configTemplates[projectType];
    return new TSConfigManager(template.tsconfig);
  }

  // Merge with another config
  merge(other: any): this {
    this.config = this.deepMerge(this.config, other);
    return this;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}

// ===== CONFIGURATION VALIDATOR =====

export class TSConfigValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  validate(config: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    this.errors = [];
    this.warnings = [];

    this.validateStructure(config);
    this.validateCompilerOptions(config.compilerOptions || {});
    this.validatePaths(config);

    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings]
    };
  }

  private validateStructure(config: any): void {
    if (!config.compilerOptions) {
      this.errors.push('Missing compilerOptions section');
    }

    if (config.include && !Array.isArray(config.include)) {
      this.errors.push('include must be an array');
    }

    if (config.exclude && !Array.isArray(config.exclude)) {
      this.errors.push('exclude must be an array');
    }
  }

  private validateCompilerOptions(options: any): void {
    // Target validation
    const validTargets = ['es3', 'es5', 'es6', 'es2015', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'esnext'];
    if (options.target && !validTargets.includes(options.target)) {
      this.errors.push(`Invalid target: ${options.target}. Must be one of: ${validTargets.join(', ')}`);
    }

    // Module validation
    const validModules = ['none', 'commonjs', 'amd', 'system', 'umd', 'es6', 'es2015', 'es2020', 'esnext'];
    if (options.module && !validModules.includes(options.module)) {
      this.errors.push(`Invalid module: ${options.module}. Must be one of: ${validModules.join(', ')}`);
    }

    // JSX validation
    const validJSX = ['preserve', 'react', 'react-jsx', 'react-jsxdev', 'react-native'];
    if (options.jsx && !validJSX.includes(options.jsx)) {
      this.errors.push(`Invalid jsx: ${options.jsx}. Must be one of: ${validJSX.join(', ')}`);
    }

    // Common mistakes warnings
    if (options.target === 'es5' && options.lib && options.lib.includes('es2020')) {
      this.warnings.push('Using es2020 lib with es5 target may cause runtime errors');
    }

    if (options.strict === false) {
      this.warnings.push('Strict mode is disabled - consider enabling for better type safety');
    }

    if (options.skipLibCheck === false) {
      this.warnings.push('skipLibCheck is disabled - this may slow down compilation');
    }
  }

  private validatePaths(config: any): void {
    const options = config.compilerOptions || {};
    
    if (options.paths && !options.baseUrl) {
      this.errors.push('baseUrl must be set when using paths mapping');
    }

    if (options.paths) {
      for (const [alias, paths] of Object.entries(options.paths)) {
        if (!Array.isArray(paths)) {
          this.errors.push(`Path mapping for "${alias}" must be an array`);
        }
      }
    }
  }
}

// ===== USAGE EXAMPLES =====

console.log('=== TSConfig Examples ===');

// Create a Node.js project configuration
const nodeConfig = TSConfigManager
  .fromTemplate(ProjectType.Node)
  .enableStrictMode()
  .setPath('@/*', ['src/*'])
  .setPath('@utils/*', ['src/utils/*'])
  .addInclude('src/**/*.ts')
  .addExclude('**/*.test.ts');

console.log('Node.js TSConfig:', nodeConfig.toJSON());

// Create a React project configuration
const reactConfig = TSConfigManager
  .fromTemplate(ProjectType.React)
  .setPath('@components/*', ['src/components/*'])
  .setPath('@hooks/*', ['src/hooks/*'])
  .setPath('@utils/*', ['src/utils/*']);

console.log('React TSConfig:', reactConfig.toJSON());

// Validate configuration
const validator = new TSConfigValidator();
const validation = validator.validate(nodeConfig.getConfig());

console.log('Validation result:', validation);

// Create a custom configuration
const customConfig = new TSConfigManager()
  .setCompilerOption('target', 'es2020')
  .setCompilerOption('module', 'commonjs')
  .setCompilerOption('strict', true)
  .setCompilerOption('esModuleInterop', true)
  .setCompilerOption('skipLibCheck', true)
  .addInclude('src/**/*')
  .addExclude('node_modules')
  .addExclude('dist');

console.log('Custom TSConfig:', customConfig.toJSON());

// Environment-specific configurations
const developmentConfig = TSConfigManager
  .fromTemplate(ProjectType.Library)
  .configureDevelopment()
  .setCompilerOption('noUnusedLocals', false)
  .setCompilerOption('noUnusedParameters', false);

const productionConfig = TSConfigManager
  .fromTemplate(ProjectType.Library)
  .configureProduction()
  .setCompilerOption('noUnusedLocals', true)
  .setCompilerOption('noUnusedParameters', true);

console.log('Development Config:', developmentConfig.toJSON(false));
console.log('Production Config:', productionConfig.toJSON(false));

export default {
  CompilerOptionsDemo,
  ProjectType,
  ProjectConfig,
  configTemplates,
  TSConfigManager,
  TSConfigValidator,
};