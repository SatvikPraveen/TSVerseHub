// File: concepts/tsconfig/basics.ts

/**
 * TYPESCRIPT CONFIGURATION BASICS
 * 
 * Understanding the fundamental tsconfig.json options and their impact
 * on TypeScript compilation and project structure.
 */

// ===== BASIC TSCONFIG STRUCTURE =====

export interface BasicTSConfig {
  compilerOptions?: CompilerOptions;
  include?: string[];
  exclude?: string[];
  files?: string[];
  extends?: string;
  references?: ProjectReference[];
}

export interface CompilerOptions {
  // JavaScript language version for emitted JavaScript
  target?: 'es3' | 'es5' | 'es6' | 'es2015' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'esnext';
  
  // Module code generation
  module?: 'none' | 'commonjs' | 'amd' | 'system' | 'umd' | 'es6' | 'es2015' | 'es2020' | 'esnext' | 'node12' | 'nodenext';
  
  // List of library files to include
  lib?: string[];
  
  // Output directory for compiled files
  outDir?: string;
  
  // Root directory of input files
  rootDir?: string;
  
  // Generate corresponding .map files
  sourceMap?: boolean;
  
  // Generate corresponding .d.ts files
  declaration?: boolean;
  
  // Remove comments from output
  removeComments?: boolean;
  
  // Do not emit outputs if any errors were reported
  noEmitOnError?: boolean;
  
  // Do not emit outputs
  noEmit?: boolean;
}

export interface ProjectReference {
  path: string;
  prepend?: boolean;
}

// ===== MINIMAL CONFIGURATIONS =====

// Absolute minimum configuration
export const minimalConfig: BasicTSConfig = {
  compilerOptions: {
    target: 'es2020'
  }
};

// Basic Node.js configuration
export const basicNodeConfig: BasicTSConfig = {
  compilerOptions: {
    target: 'es2020',
    module: 'commonjs',
    outDir: './dist',
    rootDir: './src',
    sourceMap: true,
    declaration: true
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist']
};

// Basic browser configuration
export const basicBrowserConfig: BasicTSConfig = {
  compilerOptions: {
    target: 'es2020',
    module: 'es2020',
    lib: ['es2020', 'dom'],
    outDir: './dist',
    rootDir: './src',
    sourceMap: true
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist']
};

// ===== COMPILER OPTIONS EXPLAINED =====

export class CompilerOptionsExplainer {
  private static explanations: Record<string, string> = {
    target: 'Specifies the JavaScript language version for emitted JavaScript and include compatible library declarations',
    module: 'Specify what module code is generated',
    lib: 'Specify a set of bundled library declaration files that describe the target runtime environment',
    outDir: 'Specify an output folder for all emitted files',
    rootDir: 'Specify the root folder within your source files',
    sourceMap: 'Generate corresponding .map files',
    declaration: 'Generate corresponding .d.ts files',
    removeComments: 'Remove comments from TypeScript files when converting to JavaScript',
    noEmitOnError: 'Do not emit outputs if any errors were reported',
    noEmit: 'Do not emit outputs',
    strict: 'Enable all strict type-checking options',
    esModuleInterop: 'Enables emit interoperability between CommonJS and ES Modules',
    skipLibCheck: 'Skip type checking of declaration files',
    forceConsistentCasingInFileNames: 'Ensure that casing is correct in imports',
    moduleResolution: 'Specify how TypeScript looks up a file from a given module specifier',
    baseUrl: 'Specify the base directory to resolve non-relative module names',
    paths: 'Specify a set of entries that re-map imports to additional lookup locations',
    resolveJsonModule: 'Enable importing .json files',
    allowSyntheticDefaultImports: 'Allow default imports from modules with no default export'
  };

  static explain(option: string): string {
    return this.explanations[option] || 'No explanation available';
  }

  static getAllExplanations(): Record<string, string> {
    return { ...this.explanations };
  }
}

// ===== FILE INCLUSION PATTERNS =====

export class FileInclusionDemo {
  // Common include patterns
  static readonly INCLUDE_PATTERNS = {
    // All TypeScript files in src directory and subdirectories
    allTypescript: ['src/**/*.ts'],
    
    // TypeScript and TypeScript JSX files
    typescriptAndJsx: ['src/**/*.ts', 'src/**/*.tsx'],
    
    // Include JavaScript files too
    withJavaScript: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
    
    // Specific directories
    specificDirs: ['src/**/*', 'lib/**/*', 'types/**/*'],
    
    // Multiple roots
    multipleRoots: ['frontend/src/**/*', 'backend/src/**/*', 'shared/**/*']
  };

  // Common exclude patterns
  static readonly EXCLUDE_PATTERNS = {
    // Standard excludes
    standard: ['node_modules', 'dist', 'build'],
    
    // With test files
    withTests: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
    
    // Development files
    development: ['node_modules', 'dist', '**/*.dev.ts', '**/*.local.ts', 'scripts/**/*'],
    
    // Comprehensive
    comprehensive: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.d.ts',
      '.next',
      '.nuxt',
      'public'
    ]
  };

  static getRecommendedIncludes(projectType: 'node' | 'browser' | 'library' | 'fullstack'): string[] {
    switch (projectType) {
      case 'node':
        return ['src/**/*.ts'];
      case 'browser':
        return ['src/**/*.ts', 'src/**/*.tsx'];
      case 'library':
        return ['src/**/*.ts', 'types/**/*.ts'];
      case 'fullstack':
        return ['src/**/*', 'shared/**/*'];
      default:
        return ['src/**/*.ts'];
    }
  }

  static getRecommendedExcludes(includeTests: boolean = false): string[] {
    const baseExcludes = ['node_modules', 'dist', 'build'];
    
    if (!includeTests) {
      baseExcludes.push('**/*.test.ts', '**/*.spec.ts', '__tests__/**/*');
    }
    
    return baseExcludes;
  }
}

// ===== TARGET AND MODULE COMBINATIONS =====

export interface TargetModuleCombination {
  target: string;
  module: string;
  use_case: string;
  pros: string[];
  cons: string[];
  example_config: Partial<CompilerOptions>;
}

export const targetModuleCombinations: TargetModuleCombination[] = [
  {
    target: 'es5',
    module: 'commonjs',
    use_case: 'Legacy browser support with Node.js compatibility',
    pros: ['Maximum compatibility', 'Works in all browsers', 'Node.js compatible'],
    cons: ['Larger bundle size', 'No native ES6 features', 'Requires polyfills'],
    example_config: {
      target: 'es5',
      module: 'commonjs',
      lib: ['es5', 'dom']
    }
  },
  {
    target: 'es2020',
    module: 'commonjs',
    use_case: 'Modern Node.js applications',
    pros: ['Modern JavaScript features', 'Good Node.js compatibility', 'Smaller output'],
    cons: ['Not compatible with older Node.js versions'],
    example_config: {
      target: 'es2020',
      module: 'commonjs',
      lib: ['es2020']
    }
  },
  {
    target: 'es2020',
    module: 'es2020',
    use_case: 'Modern web applications with module bundlers',
    pros: ['Native ES modules', 'Tree shaking support', 'Modern features'],
    cons: ['Requires module bundler', 'Not compatible with older environments'],
    example_config: {
      target: 'es2020',
      module: 'es2020',
      lib: ['es2020', 'dom']
    }
  },
  {
    target: 'esnext',
    module: 'esnext',
    use_case: 'Cutting-edge development with latest features',
    pros: ['Latest JavaScript features', 'Future-proof', 'Optimal for development'],
    cons: ['Highly unstable', 'May break with TypeScript updates', 'Limited runtime support'],
    example_config: {
      target: 'esnext',
      module: 'esnext',
      lib: ['esnext', 'dom']
    }
  }
];

// ===== CONFIGURATION BUILDER =====

export class BasicConfigBuilder {
  private config: BasicTSConfig = {
    compilerOptions: {}
  };

  // Set target
  target(target: CompilerOptions['target']): this {
    this.config.compilerOptions!.target = target;
    return this;
  }

  // Set module
  module(module: CompilerOptions['module']): this {
    this.config.compilerOptions!.module = module;
    return this;
  }

  // Set library
  lib(lib: string[]): this {
    this.config.compilerOptions!.lib = lib;
    return this;
  }

  // Set output directory
  outDir(path: string): this {
    this.config.compilerOptions!.outDir = path;
    return this;
  }

  // Set root directory
  rootDir(path: string): this {
    this.config.compilerOptions!.rootDir = path;
    return this;
  }

  // Enable source maps
  sourceMap(enable: boolean = true): this {
    this.config.compilerOptions!.sourceMap = enable;
    return this;
  }

  // Enable declarations
  declaration(enable: boolean = true): this {
    this.config.compilerOptions!.declaration = enable;
    return this;
  }

  // Set include patterns
  include(patterns: string[]): this {
    this.config.include = patterns;
    return this;
  }

  // Set exclude patterns
  exclude(patterns: string[]): this {
    this.config.exclude = patterns;
    return this;
  }

  // Build the configuration
  build(): BasicTSConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  // Export as JSON string
  toJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // Quick presets
  static forNodeJS(): BasicConfigBuilder {
    return new BasicConfigBuilder()
      .target('es2020')
      .module('commonjs')
      .lib(['es2020'])
      .outDir('./dist')
      .rootDir('./src')
      .sourceMap(true)
      .declaration(true)
      .include(['src/**/*.ts'])
      .exclude(['node_modules', 'dist']);
  }

  static forBrowser(): BasicConfigBuilder {
    return new BasicConfigBuilder()
      .target('es2020')
      .module('es2020')
      .lib(['es2020', 'dom', 'dom.iterable'])
      .outDir('./dist')
      .rootDir('./src')
      .sourceMap(true)
      .include(['src/**/*.ts'])
      .exclude(['node_modules', 'dist']);
  }

  static forLibrary(): BasicConfigBuilder {
    return new BasicConfigBuilder()
      .target('es2018')
      .module('commonjs')
      .lib(['es2018'])
      .outDir('./dist')
      .rootDir('./src')
      .sourceMap(true)
      .declaration(true)
      .include(['src/**/*.ts'])
      .exclude(['node_modules', 'dist', '**/*.test.ts']);
  }
}

// ===== COMMON MISTAKES AND SOLUTIONS =====

export interface ConfigMistake {
  mistake: string;
  problem: string;
  solution: string;
  example_wrong: any;
  example_correct: any;
}

export const commonMistakes: ConfigMistake[] = [
  {
    mistake: 'Missing outDir',
    problem: 'Compiled JavaScript files are mixed with TypeScript source files',
    solution: 'Always specify an outDir to separate compiled output',
    example_wrong: {
      compilerOptions: {
        target: 'es2020'
      }
    },
    example_correct: {
      compilerOptions: {
        target: 'es2020',
        outDir: './dist'
      }
    }
  },
  {
    mistake: 'Incorrect lib for target',
    problem: 'Using modern lib with older target causes runtime errors',
    solution: 'Match lib to target or use appropriate polyfills',
    example_wrong: {
      compilerOptions: {
        target: 'es5',
        lib: ['es2020', 'dom']
      }
    },
    example_correct: {
      compilerOptions: {
        target: 'es5',
        lib: ['es5', 'dom']
      }
    }
  },
  {
    mistake: 'Too broad include patterns',
    problem: 'Compiling unnecessary files slows down build',
    solution: 'Use specific include patterns',
    example_wrong: {
      include: ['**/*.ts']
    },
    example_correct: {
      include: ['src/**/*.ts'],
      exclude: ['node_modules', 'dist', '**/*.test.ts']
    }
  },
  {
    mistake: 'Missing module specification',
    problem: 'Default module system may not match your environment',
    solution: 'Explicitly specify the module system',
    example_wrong: {
      compilerOptions: {
        target: 'es2020'
      }
    },
    example_correct: {
      compilerOptions: {
        target: 'es2020',
        module: 'commonjs' // or 'es2020' for browsers
      }
    }
  }
];

// ===== USAGE EXAMPLES =====

console.log('=== TSConfig Basics Examples ===');

// Build a Node.js configuration
const nodeConfig = BasicConfigBuilder
  .forNodeJS()
  .build();

console.log('Node.js Configuration:');
console.log(JSON.stringify(nodeConfig, null, 2));

// Build a browser configuration
const browserConfig = BasicConfigBuilder
  .forBrowser()
  .build();

console.log('Browser Configuration:');
console.log(JSON.stringify(browserConfig, null, 2));

// Build a library configuration
const libraryConfig = BasicConfigBuilder
  .forLibrary()
  .build();

console.log('Library Configuration:');
console.log(JSON.stringify(libraryConfig, null, 2));

// Custom configuration
const customConfig = new BasicConfigBuilder()
  .target('es2021')
  .module('esnext')
  .lib(['es2021', 'dom'])
  .outDir('./build')
  .rootDir('./app')
  .sourceMap(false)
  .declaration(false)
  .include(['app/**/*.ts', 'types/**/*.ts'])
  .exclude(['node_modules', 'build', '**/*.spec.ts'])
  .build();

console.log('Custom Configuration:');
console.log(JSON.stringify(customConfig, null, 2));

// Explain compiler options
console.log('\nCompiler Options Explanations:');
Object.entries(CompilerOptionsExplainer.getAllExplanations())
  .slice(0, 5) // Show first 5
  .forEach(([option, explanation]) => {
    console.log(`${option}: ${explanation}`);
  });

// Show file inclusion recommendations
console.log('\nRecommended file patterns:');
console.log('Node.js includes:', FileInclusionDemo.getRecommendedIncludes('node'));
console.log('Browser includes:', FileInclusionDemo.getRecommendedIncludes('browser'));
console.log('Recommended excludes:', FileInclusionDemo.getRecommendedExcludes());

// Show target/module combinations
console.log('\nTarget/Module Combinations:');
targetModuleCombinations.forEach(combo => {
  console.log(`${combo.target} + ${combo.module}: ${combo.use_case}`);
});

export default {
  BasicTSConfig,
  CompilerOptions,
  minimalConfig,
  basicNodeConfig,
  basicBrowserConfig,
  CompilerOptionsExplainer,
  FileInclusionDemo,
  targetModuleCombinations,
  BasicConfigBuilder,
  commonMistakes,
};