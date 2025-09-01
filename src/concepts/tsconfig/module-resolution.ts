// File: concepts/tsconfig/module-resolution.ts

/**
 * TYPESCRIPT MODULE RESOLUTION
 * 
 * Understanding how TypeScript resolves module imports and the different
 * strategies available for finding and loading modules.
 */

// ===== MODULE RESOLUTION STRATEGIES =====

export enum ModuleResolutionStrategy {
  NODE = 'node',
  CLASSIC = 'classic'
}

export interface ModuleResolutionConfig {
  moduleResolution: ModuleResolutionStrategy;
  baseUrl?: string;
  paths?: Record<string, string[]>;
  rootDirs?: string[];
  typeRoots?: string[];
  types?: string[];
  allowSyntheticDefaultImports?: boolean;
  esModuleInterop?: boolean;
  preserveSymlinks?: boolean;
  resolveJsonModule?: boolean;
}

// ===== NODE MODULE RESOLUTION =====

/**
 * Node.js module resolution follows these steps:
 * 1. Try exact file match
 * 2. Try with extensions (.ts, .tsx, .d.ts, .js, .jsx)
 * 3. Try as directory with index file
 * 4. Look in node_modules
 * 5. Walk up parent directories
 */

export class NodeModuleResolver {
  private baseUrl: string;
  private paths: Record<string, string[]>;
  private extensions: string[] = ['.ts', '.tsx', '.d.ts', '.js', '.jsx'];

  constructor(config: ModuleResolutionConfig) {
    this.baseUrl = config.baseUrl || '.';
    this.paths = config.paths || {};
  }

  // Simulate module resolution process
  resolveModule(moduleName: string, containingFile: string): ResolutionResult {
    console.log(`Resolving module "${moduleName}" from "${containingFile}"`);

    // Step 1: Check if it's a relative import
    if (this.isRelativeImport(moduleName)) {
      return this.resolveRelativeImport(moduleName, containingFile);
    }

    // Step 2: Check path mapping
    const mappedPaths = this.resolveThroughPaths(moduleName);
    if (mappedPaths.length > 0) {
      for (const mappedPath of mappedPaths) {
        const result = this.resolveFile(mappedPath);
        if (result.resolved) {
          return result;
        }
      }
    }

    // Step 3: Look in node_modules
    return this.resolveInNodeModules(moduleName, containingFile);
  }

  private isRelativeImport(moduleName: string): boolean {
    return moduleName.startsWith('./') || moduleName.startsWith('../');
  }

  private resolveRelativeImport(moduleName: string, containingFile: string): ResolutionResult {
    const containingDir = this.getDirectoryPath(containingFile);
    const candidatePath = this.combinePaths(containingDir, moduleName);
    
    return this.resolveFile(candidatePath);
  }

  private resolveThroughPaths(moduleName: string): string[] {
    const matchedPaths: string[] = [];

    for (const [pattern, substitutions] of Object.entries(this.paths)) {
      if (this.matchesPattern(moduleName, pattern)) {
        for (const substitution of substitutions) {
          const resolvedPath = this.substitutePattern(moduleName, pattern, substitution);
          matchedPaths.push(resolvedPath);
        }
      }
    }

    return matchedPaths;
  }

  private resolveInNodeModules(moduleName: string, containingFile: string): ResolutionResult {
    let currentDir = this.getDirectoryPath(containingFile);

    while (currentDir) {
      const nodeModulesPath = this.combinePaths(currentDir, 'node_modules', moduleName);
      
      // Try as file
      const fileResult = this.resolveFile(nodeModulesPath);
      if (fileResult.resolved) {
        return fileResult;
      }

      // Try as package
      const packageResult = this.resolvePackage(nodeModulesPath);
      if (packageResult.resolved) {
        return packageResult;
      }

      // Move to parent directory
      const parentDir = this.getDirectoryPath(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }

    return {
      resolved: false,
      resolvedModule: undefined,
      failedLookupLocations: [`Could not resolve "${moduleName}"`]
    };
  }

  private resolveFile(fileName: string): ResolutionResult {
    const attemptedLocations: string[] = [];

    // Try exact match
    attemptedLocations.push(fileName);
    if (this.fileExists(fileName)) {
      return {
        resolved: true,
        resolvedModule: { resolvedFileName: fileName, isExternalLibraryImport: false },
        failedLookupLocations: []
      };
    }

    // Try with extensions
    for (const extension of this.extensions) {
      const fileWithExt = fileName + extension;
      attemptedLocations.push(fileWithExt);
      if (this.fileExists(fileWithExt)) {
        return {
          resolved: true,
          resolvedModule: { resolvedFileName: fileWithExt, isExternalLibraryImport: false },
          failedLookupLocations: []
        };
      }
    }

    // Try as directory with index
    const indexPaths = this.extensions.map(ext => this.combinePaths(fileName, `index${ext}`));
    for (const indexPath of indexPaths) {
      attemptedLocations.push(indexPath);
      if (this.fileExists(indexPath)) {
        return {
          resolved: true,
          resolvedModule: { resolvedFileName: indexPath, isExternalLibraryImport: false },
          failedLookupLocations: []
        };
      }
    }

    return {
      resolved: false,
      resolvedModule: undefined,
      failedLookupLocations: attemptedLocations
    };
  }

  private resolvePackage(packagePath: string): ResolutionResult {
    const packageJsonPath = this.combinePaths(packagePath, 'package.json');
    
    if (this.fileExists(packageJsonPath)) {
      const packageJson = this.readPackageJson(packageJsonPath);
      
      // Try main field
      if (packageJson.main) {
        const mainPath = this.combinePaths(packagePath, packageJson.main);
        const result = this.resolveFile(mainPath);
        if (result.resolved) {
          return {
            ...result,
            resolvedModule: {
              ...result.resolvedModule!,
              isExternalLibraryImport: true
            }
          };
        }
      }

      // Try types field
      if (packageJson.types || packageJson.typings) {
        const typesPath = this.combinePaths(packagePath, packageJson.types || packageJson.typings);
        if (this.fileExists(typesPath)) {
          return {
            resolved: true,
            resolvedModule: { resolvedFileName: typesPath, isExternalLibraryImport: true },
            failedLookupLocations: []
          };
        }
      }
    }

    // Try index files
    return this.resolveFile(this.combinePaths(packagePath, 'index'));
  }

  // Utility methods (mock implementations)
  private fileExists(path: string): boolean {
    // Mock implementation - in real scenario would check file system
    const mockFiles = [
      './src/index.ts',
      './src/utils/helper.ts',
      './node_modules/lodash/index.js',
      './node_modules/@types/node/index.d.ts'
    ];
    return mockFiles.includes(path);
  }

  private readPackageJson(path: string): any {
    // Mock implementation
    return {
      main: 'index.js',
      types: 'index.d.ts'
    };
  }

  private getDirectoryPath(filePath: string): string {
    const lastSlash = filePath.lastIndexOf('/');
    return lastSlash > 0 ? filePath.substring(0, lastSlash) : '.';
  }

  private combinePaths(...paths: string[]): string {
    return paths.join('/').replace(/\/+/g, '/');
  }

  private matchesPattern(name: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return name.startsWith(prefix);
    }
    return name === pattern;
  }

  private substitutePattern(name: string, pattern: string, substitution: string): string {
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      const suffix = name.substring(prefix.length);
      return substitution.replace('*', suffix);
    }
    return substitution;
  }
}

// ===== CLASSIC MODULE RESOLUTION =====

/**
 * Classic module resolution (legacy):
 * 1. Relative imports: resolve relative to importing file
 * 2. Non-relative imports: resolve relative to importing file and walk up directory tree
 */

export class ClassicModuleResolver {
  private extensions: string[] = ['.ts', '.d.ts'];

  resolveModule(moduleName: string, containingFile: string): ResolutionResult {
    console.log(`Classic resolution for "${moduleName}" from "${containingFile}"`);

    if (this.isRelativeImport(moduleName)) {
      return this.resolveRelativeImport(moduleName, containingFile);
    }

    return this.resolveNonRelativeImport(moduleName, containingFile);
  }

  private isRelativeImport(moduleName: string): boolean {
    return moduleName.startsWith('./') || moduleName.startsWith('../');
  }

  private resolveRelativeImport(moduleName: string, containingFile: string): ResolutionResult {
    const containingDir = this.getDirectoryPath(containingFile);
    const candidatePath = this.combinePaths(containingDir, moduleName);
    
    return this.tryResolve(candidatePath);
  }

  private resolveNonRelativeImport(moduleName: string, containingFile: string): ResolutionResult {
    let currentDir = this.getDirectoryPath(containingFile);

    while (currentDir) {
      const candidatePath = this.combinePaths(currentDir, moduleName);
      const result = this.tryResolve(candidatePath);
      
      if (result.resolved) {
        return result;
      }

      const parentDir = this.getDirectoryPath(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }

    return {
      resolved: false,
      resolvedModule: undefined,
      failedLookupLocations: [`Could not resolve "${moduleName}" using classic resolution`]
    };
  }

  private tryResolve(basePath: string): ResolutionResult {
    const attemptedPaths: string[] = [];

    for (const extension of this.extensions) {
      const fullPath = basePath + extension;
      attemptedPaths.push(fullPath);
      
      if (this.fileExists(fullPath)) {
        return {
          resolved: true,
          resolvedModule: { resolvedFileName: fullPath, isExternalLibraryImport: false },
          failedLookupLocations: []
        };
      }
    }

    return {
      resolved: false,
      resolvedModule: undefined,
      failedLookupLocations: attemptedPaths
    };
  }

  private fileExists(path: string): boolean {
    // Mock implementation
    return false;
  }

  private getDirectoryPath(filePath: string): string {
    const lastSlash = filePath.lastIndexOf('/');
    return lastSlash > 0 ? filePath.substring(0, lastSlash) : '.';
  }

  private combinePaths(...paths: string[]): string {
    return paths.join('/').replace(/\/+/g, '/');
  }
}

// ===== RESOLUTION RESULT TYPES =====

export interface ResolvedModule {
  resolvedFileName: string;
  isExternalLibraryImport: boolean;
  packageId?: {
    name: string;
    subModuleName?: string;
    version: string;
  };
}

export interface ResolutionResult {
  resolved: boolean;
  resolvedModule?: ResolvedModule;
  failedLookupLocations: string[];
}

// ===== MODULE RESOLUTION ANALYZER =====

export class ModuleResolutionAnalyzer {
  private nodeResolver: NodeModuleResolver;
  private classicResolver: ClassicModuleResolver;

  constructor(config: ModuleResolutionConfig) {
    this.nodeResolver = new NodeModuleResolver(config);
    this.classicResolver = new ClassicModuleResolver();
  }

  analyzeResolution(
    moduleName: string, 
    containingFile: string, 
    strategy: ModuleResolutionStrategy
  ): AnalysisResult {
    const startTime = performance.now();
    
    const resolver = strategy === ModuleResolutionStrategy.NODE 
      ? this.nodeResolver 
      : this.classicResolver;

    const result = resolver.resolveModule(moduleName, containingFile);
    const endTime = performance.now();

    return {
      moduleName,
      containingFile,
      strategy,
      result,
      resolutionTime: endTime - startTime,
      steps: this.getResolutionSteps(moduleName, containingFile, strategy)
    };
  }

  private getResolutionSteps(
    moduleName: string, 
    containingFile: string, 
    strategy: ModuleResolutionStrategy
  ): ResolutionStep[] {
    const steps: ResolutionStep[] = [];

    if (strategy === ModuleResolutionStrategy.NODE) {
      steps.push(
        { step: 1, description: 'Check if relative import', action: `Test: ${moduleName.startsWith('./')}` },
        { step: 2, description: 'Try exact file match', action: `Look for: ${moduleName}` },
        { step: 3, description: 'Try with extensions', action: 'Add .ts, .tsx, .d.ts, .js, .jsx' },
        { step: 4, description: 'Try as directory', action: 'Look for index files' },
        { step: 5, description: 'Check path mapping', action: 'Apply path substitutions' },
        { step: 6, description: 'Search node_modules', action: 'Walk up directory tree' },
        { step: 7, description: 'Try as package', action: 'Read package.json' }
      );
    } else {
      steps.push(
        { step: 1, description: 'Check if relative import', action: `Test: ${moduleName.startsWith('./')}` },
        { step: 2, description: 'Try with extensions', action: 'Add .ts, .d.ts' },
        { step: 3, description: 'Walk up directories', action: 'Try in parent directories' }
      );
    }

    return steps;
  }

  compareStrategies(moduleName: string, containingFile: string): ComparisonResult {
    const nodeAnalysis = this.analyzeResolution(moduleName, containingFile, ModuleResolutionStrategy.NODE);
    const classicAnalysis = this.analyzeResolution(moduleName, containingFile, ModuleResolutionStrategy.CLASSIC);

    return {
      moduleName,
      containingFile,
      nodeResult: nodeAnalysis,
      classicResult: classicAnalysis,
      recommendation: this.getRecommendation(nodeAnalysis, classicAnalysis)
    };
  }

  private getRecommendation(nodeAnalysis: AnalysisResult, classicAnalysis: AnalysisResult): string {
    if (nodeAnalysis.result.resolved && !classicAnalysis.result.resolved) {
      return 'Use Node resolution - classic resolution failed';
    } else if (!nodeAnalysis.result.resolved && classicAnalysis.result.resolved) {
      return 'Both strategies work, but Node resolution is recommended for modern projects';
    } else if (nodeAnalysis.result.resolved && classicAnalysis.result.resolved) {
      return 'Both strategies work - Node resolution is recommended for npm compatibility';
    } else {
      return 'Module not found with either strategy - check module name and file structure';
    }
  }
}

export interface ResolutionStep {
  step: number;
  description: string;
  action: string;
}

export interface AnalysisResult {
  moduleName: string;
  containingFile: string;
  strategy: ModuleResolutionStrategy;
  result: ResolutionResult;
  resolutionTime: number;
  steps: ResolutionStep[];
}

export interface ComparisonResult {
  moduleName: string;
  containingFile: string;
  nodeResult: AnalysisResult;
  classicResult: AnalysisResult;
  recommendation: string;
}

// ===== CONFIGURATION HELPERS =====

export class ModuleResolutionConfigBuilder {
  private config: ModuleResolutionConfig = {
    moduleResolution: ModuleResolutionStrategy.NODE
  };

  strategy(strategy: ModuleResolutionStrategy): this {
    this.config.moduleResolution = strategy;
    return this;
  }

  baseUrl(url: string): this {
    this.config.baseUrl = url;
    return this;
  }

  paths(pathMapping: Record<string, string[]>): this {
    this.config.paths = pathMapping;
    return this;
  }

  typeRoots(roots: string[]): this {
    this.config.typeRoots = roots;
    return this;
  }

  types(typePackages: string[]): this {
    this.config.types = typePackages;
    return this;
  }

  esModuleInterop(enable: boolean = true): this {
    this.config.esModuleInterop = enable;
    return this;
  }

  allowSyntheticDefaultImports(enable: boolean = true): this {
    this.config.allowSyntheticDefaultImports = enable;
    return this;
  }

  resolveJsonModule(enable: boolean = true): this {
    this.config.resolveJsonModule = enable;
    return this;
  }

  build(): ModuleResolutionConfig {
    return { ...this.config };
  }
}

// ===== USAGE EXAMPLES =====

console.log('=== Module Resolution Examples ===');

// Create configuration
const config = new ModuleResolutionConfigBuilder()
  .strategy(ModuleResolutionStrategy.NODE)
  .baseUrl('.')
  .paths({
    '@/*': ['src/*'],
    '@utils/*': ['src/utils/*'],
    '@components/*': ['src/components/*']
  })
  .esModuleInterop(true)
  .resolveJsonModule(true)
  .build();

console.log('Configuration:', config);

// Analyze module resolution
const analyzer = new ModuleResolutionAnalyzer(config);

const examples = [
  { module: './utils/helper', file: './src/index.ts' },
  { module: 'lodash', file: './src/app.ts' },
  { module: '@utils/validation', file: './src/components/Form.ts' },
  { module: '../shared/constants', file: './src/pages/Home.ts' }
];

examples.forEach(({ module, file }) => {
  console.log(`\nAnalyzing: "${module}" from "${file}"`);
  const analysis = analyzer.analyzeResolution(module, file, ModuleResolutionStrategy.NODE);
  console.log(`Resolved: ${analysis.result.resolved}`);
  if (analysis.result.resolvedModule) {
    console.log(`File: ${analysis.result.resolvedModule.resolvedFileName}`);
    console.log(`External: ${analysis.result.resolvedModule.isExternalLibraryImport}`);
  }
  console.log(`Time: ${analysis.resolutionTime.toFixed(2)}ms`);
});

// Compare resolution strategies
console.log('\n=== Strategy Comparison ===');
const comparison = analyzer.compareStrategies('react', './src/App.ts');
console.log(`Module: ${comparison.moduleName}`);
console.log(`Node resolved: ${comparison.nodeResult.result.resolved}`);
console.log(`Classic resolved: ${comparison.classicResult.result.resolved}`);
console.log(`Recommendation: ${comparison.recommendation}`);

// ===== TROUBLESHOOTING HELPERS =====

export class ModuleResolutionTroubleshooter {
  private analyzer: ModuleResolutionAnalyzer;

  constructor(config: ModuleResolutionConfig) {
    this.analyzer = new ModuleResolutionAnalyzer(config);
  }

  diagnose(moduleName: string, containingFile: string): DiagnosisResult {
    const analysis = this.analyzer.analyzeResolution(
      moduleName, 
      containingFile, 
      ModuleResolutionStrategy.NODE
    );

    const issues: Issue[] = [];
    const suggestions: string[] = [];

    if (!analysis.result.resolved) {
      issues.push({
        type: 'resolution-failed',
        severity: 'error',
        message: `Cannot resolve module '${moduleName}'`,
        details: analysis.result.failedLookupLocations
      });

      // Generate suggestions based on failed lookups
      suggestions.push(...this.generateSuggestions(moduleName, analysis.result.failedLookupLocations));
    }

    return {
      moduleName,
      containingFile,
      issues,
      suggestions,
      resolutionSteps: analysis.steps,
      lookupLocations: analysis.result.failedLookupLocations
    };
  }

  private generateSuggestions(moduleName: string, failedLocations: string[]): string[] {
    const suggestions: string[] = [];

    // Check for common typos
    if (moduleName.includes('_')) {
      suggestions.push(`Try using kebab-case instead of snake_case: '${moduleName.replace(/_/g, '-')}'`);
    }

    // Check for missing file extensions
    if (!this.hasFileExtension(moduleName)) {
      suggestions.push(`Add file extension: '${moduleName}.ts' or '${moduleName}.js'`);
    }

    // Check for path mapping issues
    if (moduleName.startsWith('@')) {
      suggestions.push('Verify that path mapping is configured correctly in tsconfig.json');
      suggestions.push('Check that baseUrl is set when using path aliases');
    }

    // Check for node_modules issues
    if (!moduleName.startsWith('.') && !moduleName.startsWith('@/')) {
      suggestions.push(`Install the package: npm install ${moduleName}`);
      suggestions.push(`Install type definitions: npm install @types/${moduleName}`);
    }

    // Check for relative path issues
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      suggestions.push('Verify the relative path is correct');
      suggestions.push('Check file exists at the expected location');
    }

    return suggestions;
  }

  private hasFileExtension(moduleName: string): boolean {
    return /\.(ts|tsx|js|jsx|json)$/.test(moduleName);
  }

  checkPathMapping(paths: Record<string, string[]>): PathMappingReport {
    const issues: PathMappingIssue[] = [];
    const validMappings: string[] = [];

    for (const [alias, targetPaths] of Object.entries(paths)) {
      // Check alias syntax
      if (!alias.endsWith('*') && !alias.includes('*')) {
        issues.push({
          alias,
          issue: 'missing-wildcard',
          message: 'Alias should typically end with /* for directory mapping',
          severity: 'warning'
        });
      }

      // Check target paths
      for (const targetPath of targetPaths) {
        if (!targetPath.includes('*') && alias.includes('*')) {
          issues.push({
            alias,
            issue: 'inconsistent-wildcards',
            message: 'Target path should include * when alias has wildcard',
            severity: 'error'
          });
        }
      }

      if (issues.length === 0) {
        validMappings.push(alias);
      }
    }

    return {
      totalMappings: Object.keys(paths).length,
      validMappings: validMappings.length,
      issues,
      recommendations: this.generatePathMappingRecommendations(paths, issues)
    };
  }

  private generatePathMappingRecommendations(
    paths: Record<string, string[]>, 
    issues: PathMappingIssue[]
  ): string[] {
    const recommendations: string[] = [];

    if (issues.some(issue => issue.issue === 'missing-wildcard')) {
      recommendations.push('Use wildcard patterns for directory mappings: "@components/*": ["src/components/*"]');
    }

    if (Object.keys(paths).length === 0) {
      recommendations.push('Consider adding path aliases for common directories');
      recommendations.push('Example: "@/*": ["src/*"] for shorter import paths');
    }

    if (!paths['@/*']) {
      recommendations.push('Add a root alias: "@/*": ["src/*"] for convenient imports');
    }

    return recommendations;
  }
}

export interface Issue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: string[];
}

export interface DiagnosisResult {
  moduleName: string;
  containingFile: string;
  issues: Issue[];
  suggestions: string[];
  resolutionSteps: ResolutionStep[];
  lookupLocations: string[];
}

export interface PathMappingIssue {
  alias: string;
  issue: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface PathMappingReport {
  totalMappings: number;
  validMappings: number;
  issues: PathMappingIssue[];
  recommendations: string[];
}

// ===== RESOLUTION CACHE =====

export class ModuleResolutionCache {
  private cache: Map<string, ResolutionResult> = new Map();
  private hitCount: number = 0;
  private missCount: number = 0;

  getCacheKey(moduleName: string, containingFile: string): string {
    return `${containingFile}:${moduleName}`;
  }

  get(moduleName: string, containingFile: string): ResolutionResult | undefined {
    const key = this.getCacheKey(moduleName, containingFile);
    const result = this.cache.get(key);
    
    if (result) {
      this.hitCount++;
    } else {
      this.missCount++;
    }
    
    return result;
  }

  set(moduleName: string, containingFile: string, result: ResolutionResult): void {
    const key = this.getCacheKey(moduleName, containingFile);
    this.cache.set(key, result);
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }

  invalidatePattern(pattern: string): number {
    let removed = 0;
    const regex = new RegExp(pattern);
    
    for (const [key] of this.cache.entries()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }
}

export interface CacheStats {
  size: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
}

// ===== PERFORMANCE MONITORING =====

export class ModuleResolutionProfiler {
  private resolutions: ResolutionProfile[] = [];

  profile<T>(
    operation: () => T,
    moduleName: string,
    containingFile: string,
    strategy: ModuleResolutionStrategy
  ): T {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const result = operation();
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    this.resolutions.push({
      moduleName,
      containingFile,
      strategy,
      duration: endTime - startTime,
      memoryDelta: endMemory - startMemory,
      timestamp: new Date()
    });
    
    return result;
  }

  getReport(): PerformanceReport {
    if (this.resolutions.length === 0) {
      return {
        totalResolutions: 0,
        averageDuration: 0,
        slowestResolutions: [],
        resolutionsByStrategy: {},
        recommendations: ['No data available - run some resolutions first']
      };
    }

    const totalDuration = this.resolutions.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = totalDuration / this.resolutions.length;
    
    const slowest = [...this.resolutions]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    const byStrategy = this.groupByStrategy();

    return {
      totalResolutions: this.resolutions.length,
      averageDuration,
      slowestResolutions: slowest,
      resolutionsByStrategy: byStrategy,
      recommendations: this.generatePerformanceRecommendations(averageDuration, slowest)
    };
  }

  private getMemoryUsage(): number {
    // Mock implementation - in real scenario would use process.memoryUsage()
    return Math.random() * 1000000;
  }

  private groupByStrategy(): Record<ModuleResolutionStrategy, number> {
    const groups: Record<ModuleResolutionStrategy, number> = {
      [ModuleResolutionStrategy.NODE]: 0,
      [ModuleResolutionStrategy.CLASSIC]: 0
    };

    for (const resolution of this.resolutions) {
      groups[resolution.strategy]++;
    }

    return groups;
  }

  private generatePerformanceRecommendations(
    averageDuration: number, 
    slowest: ResolutionProfile[]
  ): string[] {
    const recommendations: string[] = [];

    if (averageDuration > 10) {
      recommendations.push('Consider using module resolution caching');
      recommendations.push('Optimize path mappings to reduce lookup locations');
    }

    if (slowest.some(r => r.moduleName.includes('node_modules'))) {
      recommendations.push('Consider using skipLibCheck for better performance');
    }

    if (slowest.some(r => r.strategy === ModuleResolutionStrategy.CLASSIC)) {
      recommendations.push('Switch to Node module resolution for better performance');
    }

    return recommendations;
  }

  clear(): void {
    this.resolutions = [];
  }
}

export interface ResolutionProfile {
  moduleName: string;
  containingFile: string;
  strategy: ModuleResolutionStrategy;
  duration: number;
  memoryDelta: number;
  timestamp: Date;
}

export interface PerformanceReport {
  totalResolutions: number;
  averageDuration: number;
  slowestResolutions: ResolutionProfile[];
  resolutionsByStrategy: Record<ModuleResolutionStrategy, number>;
  recommendations: string[];
}

// ===== FINAL EXPORTS AND USAGE =====

// Troubleshooting example
console.log('\n=== Troubleshooting Example ===');
const troubleshooter = new ModuleResolutionTroubleshooter(config);
const diagnosis = troubleshooter.diagnose('nonexistent-module', './src/app.ts');

console.log(`Issues found: ${diagnosis.issues.length}`);
diagnosis.issues.forEach(issue => {
  console.log(`- ${issue.severity.toUpperCase()}: ${issue.message}`);
});

console.log(`Suggestions: ${diagnosis.suggestions.length}`);
diagnosis.suggestions.forEach(suggestion => {
  console.log(`- ${suggestion}`);
});

// Performance monitoring example
console.log('\n=== Performance Monitoring ===');
const profiler = new ModuleResolutionProfiler();
const resolver = new NodeModuleResolver(config);

// Profile some resolutions
profiler.profile(() => resolver.resolveModule('lodash', './src/app.ts'), 'lodash', './src/app.ts', ModuleResolutionStrategy.NODE);
profiler.profile(() => resolver.resolveModule('./utils', './src/app.ts'), './utils', './src/app.ts', ModuleResolutionStrategy.NODE);

const report = profiler.getReport();
console.log(`Total resolutions: ${report.totalResolutions}`);
console.log(`Average duration: ${report.averageDuration.toFixed(2)}ms`);

export default {
  ModuleResolutionStrategy,
  NodeModuleResolver,
  ClassicModuleResolver,
  ModuleResolutionAnalyzer,
  ModuleResolutionConfigBuilder,
  ModuleResolutionTroubleshooter,
  ModuleResolutionCache,
  ModuleResolutionProfiler,
  config,
  analyzer,
  troubleshooter,
  profiler,
};