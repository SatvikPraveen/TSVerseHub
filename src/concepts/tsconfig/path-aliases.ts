// File: concepts/tsconfig/path-aliases.ts

/**
 * TYPESCRIPT PATH ALIASES
 * 
 * Path mapping allows you to create aliases for module paths, making imports
 * cleaner and more maintainable. This file demonstrates how to configure
 * and use path aliases effectively in TypeScript projects.
 */

// ===== PATH ALIAS CONFIGURATION =====

export interface PathMapping {
  [alias: string]: string[];
}

export interface PathAliasConfig {
  baseUrl: string;
  paths: PathMapping;
  rootDirs?: string[];
}

// Common path alias patterns
export const COMMON_ALIASES: PathMapping = {
  // Root alias
  '@/*': ['src/*'],
  
  // Component aliases
  '@components/*': ['src/components/*'],
  '@pages/*': ['src/pages/*'],
  '@layouts/*': ['src/layouts/*'],
  
  // Utility aliases
  '@utils/*': ['src/utils/*'],
  '@helpers/*': ['src/helpers/*'],
  '@lib/*': ['src/lib/*'],
  
  // Asset aliases
  '@assets/*': ['src/assets/*'],
  '@images/*': ['src/assets/images/*'],
  '@styles/*': ['src/styles/*'],
  
  // Type aliases
  '@types/*': ['src/types/*'],
  '@interfaces/*': ['src/interfaces/*'],
  
  // Service aliases
  '@services/*': ['src/services/*'],
  '@api/*': ['src/api/*'],
  
  // Store aliases
  '@store/*': ['src/store/*'],
  '@redux/*': ['src/redux/*'],
  
  // Configuration aliases
  '@config/*': ['src/config/*'],
  '@constants/*': ['src/constants/*'],
  
  // Test aliases
  '@test/*': ['test/*'],
  '@mocks/*': ['test/mocks/*']
};

// ===== PATH ALIAS MANAGER =====

export class PathAliasManager {
  private config: PathAliasConfig;
  private aliases: Map<string, string[]> = new Map();

  constructor(baseUrl: string = '.', initialPaths: PathMapping = {}) {
    this.config = {
      baseUrl,
      paths: { ...initialPaths }
    };
    this.initializeAliases();
  }

  private initializeAliases(): void {
    this.aliases.clear();
    for (const [alias, paths] of Object.entries(this.config.paths)) {
      this.aliases.set(alias, [...paths]);
    }
  }

  // Add a new path alias
  addAlias(alias: string, paths: string | string[]): this {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    
    if (!this.validateAlias(alias)) {
      throw new Error(`Invalid alias format: ${alias}`);
    }
    
    for (const path of pathArray) {
      if (!this.validatePath(path)) {
        throw new Error(`Invalid path format: ${path}`);
      }
    }

    this.aliases.set(alias, pathArray);
    this.config.paths[alias] = pathArray;
    
    return this;
  }

  // Remove a path alias
  removeAlias(alias: string): this {
    this.aliases.delete(alias);
    delete this.config.paths[alias];
    return this;
  }

  // Update existing alias
  updateAlias(alias: string, paths: string | string[]): this {
    if (!this.aliases.has(alias)) {
      throw new Error(`Alias not found: ${alias}`);
    }
    
    return this.addAlias(alias, paths);
  }

  // Get all aliases
  getAliases(): PathMapping {
    return { ...this.config.paths };
  }

  // Get specific alias paths
  getAliasPaths(alias: string): string[] | undefined {
    return this.aliases.get(alias)?.slice();
  }

  // Check if alias exists
  hasAlias(alias: string): boolean {
    return this.aliases.has(alias);
  }

  // Resolve alias to actual paths
  resolveAlias(aliasPath: string): string[] {
    const resolvedPaths: string[] = [];

    for (const [alias, targetPaths] of this.aliases.entries()) {
      if (this.matchesAlias(aliasPath, alias)) {
        for (const targetPath of targetPaths) {
          const resolvedPath = this.substituteAlias(aliasPath, alias, targetPath);
          resolvedPaths.push(this.combinePaths(this.config.baseUrl, resolvedPath));
        }
      }
    }

    return resolvedPaths;
  }

  // Generate import statement suggestion
  suggestImport(filePath: string, targetFile: string): ImportSuggestion {
    const relativePath = this.getRelativePath(filePath, targetFile);
    const aliasOptions = this.findMatchingAliases(targetFile);

    return {
      relativePath,
      aliasOptions,
      recommended: this.getRecommendedImport(relativePath, aliasOptions)
    };
  }

  // Validate configuration
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflicts: AliasConflict[] = [];

    // Check baseUrl
    if (!this.config.baseUrl) {
      errors.push('baseUrl is required when using path mapping');
    }

    // Check each alias
    for (const [alias, paths] of this.aliases.entries()) {
      // Validate alias format
      if (!this.validateAlias(alias)) {
        errors.push(`Invalid alias format: ${alias}`);
      }

      // Validate path formats
      for (const path of paths) {
        if (!this.validatePath(path)) {
          errors.push(`Invalid path format in alias '${alias}': ${path}`);
        }
      }

      // Check for wildcard consistency
      if (alias.includes('*') && paths.some(p => !p.includes('*'))) {
        warnings.push(`Wildcard alias '${alias}' has non-wildcard paths`);
      }
    }

    // Check for conflicts
    conflicts.push(...this.findConflicts());

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflicts,
      suggestions: this.generateSuggestions(errors, warnings)
    };
  }

  // Generate TypeScript configuration
  generateTSConfig(): { compilerOptions: { baseUrl: string; paths: PathMapping } } {
    return {
      compilerOptions: {
        baseUrl: this.config.baseUrl,
        paths: { ...this.config.paths }
      }
    };
  }

  // Private helper methods
  private validateAlias(alias: string): boolean {
    // Valid alias patterns: '@name', '@name/*', 'name', 'name/*'
    return /^(@?[\w-]+\/?\*?|\*)$/.test(alias);
  }

  private validatePath(path: string): boolean {
    // Valid path patterns: 'src/*', 'lib/utils/*', etc.
    return /^[\w\-./]+\*?$/.test(path);
  }

  private matchesAlias(importPath: string, alias: string): boolean {
    if (alias === '*') {
      return true;
    }

    if (alias.endsWith('/*')) {
      const prefix = alias.slice(0, -2);
      return importPath.startsWith(prefix + '/') || importPath === prefix;
    }

    return importPath === alias;
  }

  private substituteAlias(importPath: string, alias: string, targetPath: string): string {
    if (alias === '*') {
      return targetPath.replace('*', importPath);
    }

    if (alias.endsWith('/*')) {
      const prefix = alias.slice(0, -2);
      const suffix = importPath.startsWith(prefix + '/') 
        ? importPath.slice(prefix.length + 1)
        : importPath.slice(prefix.length);
      
      return targetPath.replace('*', suffix);
    }

    return targetPath;
  }

  private combinePaths(...paths: string[]): string {
    return paths.join('/').replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  private getRelativePath(from: string, to: string): string {
    // Simplified relative path calculation
    const fromParts = from.split('/').slice(0, -1); // Remove filename
    const toParts = to.split('/');
    
    let commonLength = 0;
    while (commonLength < Math.min(fromParts.length, toParts.length) &&
           fromParts[commonLength] === toParts[commonLength]) {
      commonLength++;
    }

    const upLevels = fromParts.length - commonLength;
    const downPath = toParts.slice(commonLength);

    if (upLevels === 0) {
      return './' + downPath.join('/');
    }

    return '../'.repeat(upLevels) + downPath.join('/');
  }

  private findMatchingAliases(targetFile: string): AliasOption[] {
    const options: AliasOption[] = [];

    for (const [alias, paths] of this.aliases.entries()) {
      for (const path of paths) {
        const fullPath = this.combinePaths(this.config.baseUrl, path);
        if (this.pathMatches(targetFile, fullPath)) {
          const aliasImport = this.generateAliasImport(targetFile, alias, path);
          if (aliasImport) {
            options.push({
              alias,
              import: aliasImport,
              confidence: this.calculateConfidence(targetFile, path)
            });
          }
        }
      }
    }

    return options.sort((a, b) => b.confidence - a.confidence);
  }

  private pathMatches(targetFile: string, aliasPath: string): boolean {
    if (aliasPath.endsWith('*')) {
      const prefix = aliasPath.slice(0, -1);
      return targetFile.startsWith(prefix);
    }
    return targetFile === aliasPath;
  }

  private generateAliasImport(targetFile: string, alias: string, path: string): string | null {
    if (path.endsWith('*')) {
      const prefix = this.combinePaths(this.config.baseUrl, path.slice(0, -1));
      if (targetFile.startsWith(prefix)) {
        const suffix = targetFile.slice(prefix.length);
        return alias.replace('*', suffix).replace(/\.(ts|tsx|js|jsx)$/, '');
      }
    }
    return null;
  }

  private calculateConfidence(targetFile: string, aliasPath: string): number {
    // Higher confidence for more specific matches
    const pathDepth = aliasPath.split('/').length;
    const matchLength = this.getMatchLength(targetFile, aliasPath);
    return (matchLength / targetFile.length) * pathDepth;
  }

  private getMatchLength(str1: string, str2: string): number {
    let i = 0;
    while (i < Math.min(str1.length, str2.length) && str1[i] === str2[i]) {
      i++;
    }
    return i;
  }

  private getRecommendedImport(relativePath: string, aliasOptions: AliasOption[]): ImportRecommendation {
    if (aliasOptions.length === 0) {
      return {
        type: 'relative',
        import: relativePath,
        reason: 'No matching aliases found'
      };
    }

    const bestAlias = aliasOptions[0];
    
    // Prefer alias if it's significantly shorter or cleaner
    if (bestAlias.import.length < relativePath.length * 0.7) {
      return {
        type: 'alias',
        import: bestAlias.import,
        reason: 'Alias is significantly shorter'
      };
    }

    // Prefer alias for cross-cutting concerns
    if (bestAlias.alias.includes('utils') || bestAlias.alias.includes('helpers') || bestAlias.alias.includes('lib')) {
      return {
        type: 'alias',
        import: bestAlias.import,
        reason: 'Alias is better for utility modules'
      };
    }

    // Use relative path for nearby files
    if (relativePath.split('/').length <= 2) {
      return {
        type: 'relative',
        import: relativePath,
        reason: 'Files are nearby, relative import is cleaner'
      };
    }

    return {
      type: 'alias',
      import: bestAlias.import,
      reason: 'Alias provides better maintainability'
    };
  }

  private findConflicts(): AliasConflict[] {
    const conflicts: AliasConflict[] = [];
    const aliases = Array.from(this.aliases.keys());

    for (let i = 0; i < aliases.length; i++) {
      for (let j = i + 1; j < aliases.length; j++) {
        const alias1 = aliases[i];
        const alias2 = aliases[j];
        
        if (this.aliasesConflict(alias1, alias2)) {
          conflicts.push({
            alias1,
            alias2,
            type: 'overlap',
            description: `Aliases '${alias1}' and '${alias2}' may conflict`
          });
        }
      }
    }

    return conflicts;
  }

  private aliasesConflict(alias1: string, alias2: string): boolean {
    // Check for prefix conflicts
    if (alias1.startsWith(alias2.replace('/*', '')) || alias2.startsWith(alias1.replace('/*', ''))) {
      return true;
    }
    return false;
  }

  private generateSuggestions(errors: string[], warnings: string[]): string[] {
    const suggestions: string[] = [];

    if (errors.some(e => e.includes('baseUrl'))) {
      suggestions.push('Set baseUrl to "." for project root or "src" for source directory');
    }

    if (warnings.some(w => w.includes('wildcard'))) {
      suggestions.push('Ensure wildcard consistency: if alias has *, all paths should have *');
    }

    if (!this.aliases.has('@/*')) {
      suggestions.push('Consider adding a root alias: "@/*": ["src/*"]');
    }

    return suggestions;
  }
}

// ===== TYPE DEFINITIONS =====

export interface ImportSuggestion {
  relativePath: string;
  aliasOptions: AliasOption[];
  recommended: ImportRecommendation;
}

export interface AliasOption {
  alias: string;
  import: string;
  confidence: number;
}

export interface ImportRecommendation {
  type: 'relative' | 'alias';
  import: string;
  reason: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: AliasConflict[];
  suggestions: string[];
}

export interface AliasConflict {
  alias1: string;
  alias2: string;
  type: 'overlap' | 'ambiguous' | 'redundant';
  description: string;
}

// ===== PRESET CONFIGURATIONS =====

export class PathAliasPresets {
  // React project preset
  static react(): PathMapping {
    return {
      '@/*': ['src/*'],
      '@components/*': ['src/components/*'],
      '@pages/*': ['src/pages/*'],
      '@hooks/*': ['src/hooks/*'],
      '@utils/*': ['src/utils/*'],
      '@assets/*': ['src/assets/*'],
      '@styles/*': ['src/styles/*'],
      '@types/*': ['src/types/*'],
      '@context/*': ['src/context/*'],
      '@services/*': ['src/services/*']
    };
  }

  // Node.js project preset
  static node(): PathMapping {
    return {
      '@/*': ['src/*'],
      '@controllers/*': ['src/controllers/*'],
      '@services/*': ['src/services/*'],
      '@models/*': ['src/models/*'],
      '@middleware/*': ['src/middleware/*'],
      '@utils/*': ['src/utils/*'],
      '@config/*': ['src/config/*'],
      '@types/*': ['src/types/*'],
      '@routes/*': ['src/routes/*'],
      '@database/*': ['src/database/*']
    };
  }

  // Vue.js project preset
  static vue(): PathMapping {
    return {
      '@/*': ['src/*'],
      '@components/*': ['src/components/*'],
      '@views/*': ['src/views/*'],
      '@composables/*': ['src/composables/*'],
      '@utils/*': ['src/utils/*'],
      '@assets/*': ['src/assets/*'],
      '@styles/*': ['src/styles/*'],
      '@types/*': ['src/types/*'],
      '@store/*': ['src/store/*'],
      '@plugins/*': ['src/plugins/*']
    };
  }

  // Library project preset
  static library(): PathMapping {
    return {
      '@/*': ['src/*'],
      '@lib/*': ['src/lib/*'],
      '@utils/*': ['src/utils/*'],
      '@types/*': ['src/types/*'],
      '@constants/*': ['src/constants/*'],
      '@helpers/*': ['src/helpers/*'],
      '@test/*': ['test/*'],
      '@examples/*': ['examples/*']
    };
  }

  // Monorepo preset
  static monorepo(): PathMapping {
    return {
      '@/*': ['src/*'],
      '@shared/*': ['packages/shared/src/*'],
      '@ui/*': ['packages/ui/src/*'],
      '@utils/*': ['packages/utils/src/*'],
      '@types/*': ['packages/types/src/*'],
      '@api/*': ['packages/api/src/*'],
      '@web/*': ['packages/web/src/*'],
      '@mobile/*': ['packages/mobile/src/*']
    };
  }
}

// ===== PATH ALIAS ANALYZER =====

export class PathAliasAnalyzer {
  private manager: PathAliasManager;

  constructor(manager: PathAliasManager) {
    this.manager = manager;
  }

  analyzeUsage(importStatements: ImportStatement[]): UsageAnalysis {
    const aliasUsage = new Map<string, number>();
    const relativeImports: string[] = [];
    const unresolvedImports: string[] = [];

    for (const statement of importStatements) {
      if (statement.module.startsWith('./') || statement.module.startsWith('../')) {
        relativeImports.push(statement.module);
      } else {
        const resolvedPaths = this.manager.resolveAlias(statement.module);
        if (resolvedPaths.length > 0) {
          // Find which alias was used
          const usedAlias = this.findUsedAlias(statement.module);
          if (usedAlias) {
            aliasUsage.set(usedAlias, (aliasUsage.get(usedAlias) || 0) + 1);
          }
        } else if (!statement.module.includes('node_modules')) {
          unresolvedImports.push(statement.module);
        }
      }
    }

    return {
      totalImports: importStatements.length,
      aliasUsage: Object.fromEntries(aliasUsage),
      relativeImports: relativeImports.length,
      unresolvedImports,
      recommendations: this.generateUsageRecommendations(aliasUsage, relativeImports, unresolvedImports)
    };
  }

  private findUsedAlias(importPath: string): string | null {
    const aliases = this.manager.getAliases();
    
    for (const alias of Object.keys(aliases)) {
      if (importPath.startsWith(alias.replace('/*', ''))) {
        return alias;
      }
    }
    
    return null;
  }

  private generateUsageRecommendations(
    aliasUsage: Map<string, number>,
    relativeImports: string[],
    unresolvedImports: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Check for unused aliases
    const allAliases = Object.keys(this.manager.getAliases());
    const unusedAliases = allAliases.filter(alias => !aliasUsage.has(alias));
    
    if (unusedAliases.length > 0) {
      recommendations.push(`Consider removing unused aliases: ${unusedAliases.join(', ')}`);
    }

    // Check for excessive relative imports
    if (relativeImports.length > 10) {
      recommendations.push('Consider adding more aliases to reduce relative imports');
    }

    // Check for unresolved imports
    if (unresolvedImports.length > 0) {
      recommendations.push(`Add aliases for unresolved imports: ${unresolvedImports.slice(0, 3).join(', ')}`);
    }

    return recommendations;
  }
}

export interface ImportStatement {
  module: string;
  file: string;
  line: number;
}

export interface UsageAnalysis {
  totalImports: number;
  aliasUsage: Record<string, number>;
  relativeImports: number;
  unresolvedImports: string[];
  recommendations: string[];
}

// ===== USAGE EXAMPLES =====

console.log('=== Path Aliases Examples ===');

// Create path alias manager
const pathManager = new PathAliasManager('.', COMMON_ALIASES);

// Add custom aliases
pathManager
  .addAlias('@features/*', ['src/features/*'])
  .addAlias('@shared/*', ['src/shared/*', 'lib/shared/*'])
  .addAlias('@test-utils/*', ['test/utils/*']);

console.log('Configured aliases:', Object.keys(pathManager.getAliases()));

// Resolve alias examples
const resolutions = [
  '@/index',
  '@components/Button',
  '@utils/helpers',
  '@types/User'
];

resolutions.forEach(alias => {
  const resolved = pathManager.resolveAlias(alias);
  console.log(`${alias} → ${resolved.join(', ')}`);
});

// Generate import suggestions
const suggestion = pathManager.suggestImport(
  './src/pages/Home.tsx',
  './src/components/Button.tsx'
);

console.log('\nImport suggestion:');
console.log(`Relative: ${suggestion.relativePath}`);
console.log(`Recommended: ${suggestion.recommended.import} (${suggestion.recommended.reason})`);

// Validate configuration
const validation = pathManager.validate();
console.log('\nValidation result:', {
  valid: validation.isValid,
  errors: validation.errors.length,
  warnings: validation.warnings.length
});

// Generate TypeScript configuration
const tsConfig = pathManager.generateTSConfig();
console.log('\nGenerated tsconfig.json compilerOptions:');
console.log(JSON.stringify(tsConfig.compilerOptions, null, 2));

// Analyze usage (mock data)
const analyzer = new PathAliasAnalyzer(pathManager);
const mockImports: ImportStatement[] = [
  { module: '@/App', file: './src/index.ts', line: 1 },
  { module: '@components/Button', file: './src/App.tsx', line: 2 },
  { module: '../utils/helper', file: './src/pages/Home.tsx', line: 3 },
  { module: '@utils/validation', file: './src/forms/LoginForm.tsx', line: 4 }
];

const usage = analyzer.analyzeUsage(mockImports);
console.log('\nUsage analysis:');
console.log(`Total imports: ${usage.totalImports}`);
console.log(`Alias usage:`, usage.aliasUsage);
console.log(`Relative imports: ${usage.relativeImports}`);

export default {
  PathAliasManager,
  PathAliasPresets,
  PathAliasAnalyzer,
  COMMON_ALIASES,
  pathManager,
  analyzer,
};