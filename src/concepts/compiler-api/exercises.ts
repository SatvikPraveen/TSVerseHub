// File location: src/data/concepts/compiler-api/exercises.ts

export interface CompilerAPIExercise {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  requirements: string[];
  starterCode?: string;
  solution?: string;
  hints: string[];
  testCases?: Array<{
    input: string;
    expectedOutput?: string;
    shouldPass: boolean;
    description: string;
  }>;
}

export const compilerAPIExercises: CompilerAPIExercise[] = [
  {
    id: 'ast-walker',
    title: 'Build an AST Walker',
    difficulty: 'beginner',
    description: 'Create a function that walks through an AST and collects all identifier names.',
    requirements: [
      'Parse TypeScript source code into an AST',
      'Traverse all nodes in the AST',
      'Collect all identifier names',
      'Return a unique list of identifiers'
    ],
    starterCode: `
import * as ts from 'typescript';

function collectIdentifiers(sourceCode: string): string[] {
  // TODO: Implement this function
  return [];
}

// Example usage:
const code = \`
const userName = "Alice";
function greetUser(name: string) {
  console.log("Hello, " + name);
}
greetUser(userName);
\`;

console.log(collectIdentifiers(code));
// Expected: ['userName', 'greetUser', 'name', 'console', 'log']
    `,
    solution: `
import * as ts from 'typescript';

function collectIdentifiers(sourceCode: string): string[] {
  const sourceFile = ts.createSourceFile(
    'input.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const identifiers = new Set<string>();

  function visit(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      identifiers.add(node.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return Array.from(identifiers).sort();
}
    `,
    hints: [
      'Use ts.createSourceFile to parse the code',
      'Use ts.forEachChild for traversal',
      'Check node type with ts.isIdentifier',
      'Use a Set to avoid duplicates'
    ],
    testCases: [
      {
        input: 'const x = 42;',
        expectedOutput: '["x"]',
        shouldPass: true,
        description: 'Simple variable declaration'
      },
      {
        input: 'function add(a, b) { return a + b; }',
        expectedOutput: '["a", "add", "b"]',
        shouldPass: true,
        description: 'Function with parameters'
      }
    ]
  },

  {
    id: 'function-analyzer',
    title: 'Function Complexity Analyzer',
    difficulty: 'intermediate',
    description: 'Build a tool that analyzes function complexity by counting control flow statements.',
    requirements: [
      'Parse TypeScript code and find all function declarations',
      'Count if statements, loops, and switch statements',
      'Calculate cyclomatic complexity',
      'Report functions with complexity > 5'
    ],
    starterCode: `
import * as ts from 'typescript';

interface FunctionComplexity {
  name: string;
  complexity: number;
  statements: {
    if: number;
    for: number;
    while: number;
    switch: number;
  };
}

function analyzeFunctionComplexity(sourceCode: string): FunctionComplexity[] {
  // TODO: Implement this function
  return [];
}

const testCode = \`
function simpleFunction(x: number) {
  return x * 2;
}

function complexFunction(data: any[]) {
  if (data.length === 0) return [];
  
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].isValid) {
      switch (data[i].type) {
        case 'A':
          result.push(processA(data[i]));
          break;
        case 'B':
          result.push(processB(data[i]));
          break;
      }
    }
  }
  return result;
}
\`;

console.log(analyzeFunctionComplexity(testCode));
    `,
    solution: `
import * as ts from 'typescript';

interface FunctionComplexity {
  name: string;
  complexity: number;
  statements: {
    if: number;
    for: number;
    while: number;
    switch: number;
  };
}

function analyzeFunctionComplexity(sourceCode: string): FunctionComplexity[] {
  const sourceFile = ts.createSourceFile(
    'input.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const functions: FunctionComplexity[] = [];

  function visitFunction(node: ts.FunctionDeclaration) {
    if (!node.name || !node.body) return;

    const statements = { if: 0, for: 0, while: 0, switch: 0 };
    
    function countComplexity(n: ts.Node) {
      if (ts.isIfStatement(n)) statements.if++;
      if (ts.isForStatement(n) || ts.isForInStatement(n) || ts.isForOfStatement(n)) statements.for++;
      if (ts.isWhileStatement(n) || ts.isDoStatement(n)) statements.while++;
      if (ts.isSwitchStatement(n)) statements.switch++;
      
      ts.forEachChild(n, countComplexity);
    }

    countComplexity(node.body);

    const complexity = 1 + statements.if + statements.for + statements.while + statements.switch;

    functions.push({
      name: node.name.text,
      complexity,
      statements
    });
  }

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node)) {
      visitFunction(node);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return functions;
}
    `,
    hints: [
      'Use ts.isFunctionDeclaration to find functions',
      'Recursively traverse function bodies',
      'Use specific type guards like ts.isIfStatement',
      'Cyclomatic complexity = 1 + number of decision points'
    ]
  },

  {
    id: 'custom-linter',
    title: 'Custom Linter Rule',
    difficulty: 'intermediate',
    description: 'Create a custom linter rule that detects console.log statements and suggests using a logger instead.',
    requirements: [
      'Detect console.log, console.error, console.warn calls',
      'Generate diagnostic messages',
      'Provide suggested fixes',
      'Support custom configuration for allowed console methods'
    ],
    starterCode: `
import * as ts from 'typescript';

interface LintRule {
  name: string;
  check(sourceFile: ts.SourceFile): ts.Diagnostic[];
}

interface NoConsoleConfig {
  allowedMethods?: string[];
  suggestedLogger?: string;
}

class NoConsoleRule implements LintRule {
  name = 'no-console';
  
  constructor(private config: NoConsoleConfig = {}) {}

  check(sourceFile: ts.SourceFile): ts.Diagnostic[] {
    // TODO: Implement this method
    return [];
  }
}

// Usage example:
const rule = new NoConsoleRule({
  allowedMethods: ['assert'],
  suggestedLogger: 'logger'
});

const testCode = \`
console.log("Debug message");
console.error("Error occurred");
console.assert(condition, "Assertion failed");
console.warn("Warning message");
\`;

const sourceFile = ts.createSourceFile('test.ts', testCode, ts.ScriptTarget.Latest, true);
const diagnostics = rule.check(sourceFile);
console.log(diagnostics.map(d => d.messageText));
    `,
    solution: `
import * as ts from 'typescript';

interface LintRule {
  name: string;
  check(sourceFile: ts.SourceFile): ts.Diagnostic[];
}

interface NoConsoleConfig {
  allowedMethods?: string[];
  suggestedLogger?: string;
}

class NoConsoleRule implements LintRule {
  name = 'no-console';
  
  constructor(private config: NoConsoleConfig = {}) {}

  check(sourceFile: ts.SourceFile): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    const allowedMethods = this.config.allowedMethods || [];
    const suggestedLogger = this.config.suggestedLogger || 'logger';

    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'console') {

        const method = node.expression.name.text;
        
        if (!allowedMethods.includes(method)) {
          diagnostics.push({
            file: sourceFile,
            start: node.getStart(sourceFile),
            length: node.getWidth(sourceFile),
            messageText: \`Console '\${method}' is not allowed. Use \${suggestedLogger}.\${method}() instead.\`,
            category: ts.DiagnosticCategory.Warning,
            code: 9001,
            source: 'custom-linter'
          });
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return diagnostics;
  }
}
    `,
    hints: [
      'Look for CallExpression nodes',
      'Check if expression is PropertyAccessExpression',
      'Verify the object is "console"',
      'Create diagnostic objects with proper properties'
    ]
  },

  {
    id: 'code-transformer',
    title: 'Arrow Function Transformer',
    difficulty: 'intermediate',
    description: 'Build a transformer that converts function expressions to arrow functions.',
    requirements: [
      'Find function expressions (not declarations)',
      'Convert to arrow function syntax',
      'Preserve parameter types and return types',
      'Handle both single expressions and block bodies'
    ],
    starterCode: `
import * as ts from 'typescript';

function createArrowFunctionTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      // TODO: Implement the transformer
      return sourceFile;
    };
  };
}

function transformCode(sourceCode: string): string {
  const sourceFile = ts.createSourceFile(
    'input.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const result = ts.transform(sourceFile, [createArrowFunctionTransformer()]);
  const printer = ts.createPrinter();
  return printer.printFile(result.transformed[0]);
}

const testCode = \`
const add = function(a: number, b: number): number {
  return a + b;
};

const greet = function(name: string) {
  console.log("Hello, " + name);
};

const process = function() {
  return "done";
};
\`;

console.log(transformCode(testCode));
    `,
    solution: `
import * as ts from 'typescript';

function createArrowFunctionTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const visit: ts.Visitor = (node: ts.Node): ts.Node => {
      if (ts.isFunctionExpression(node) && !node.name) {
        // Convert function expression to arrow function
        return ts.factory.createArrowFunction(
          node.modifiers,
          node.typeParameters,
          node.parameters,
          node.type,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          node.body || ts.factory.createBlock([])
        );
      }
      
      return ts.visitEachChild(node, visit, context);
    };

    return (sourceFile: ts.SourceFile) => {
      return ts.visitNode(sourceFile, visit) as ts.SourceFile;
    };
  };
}

function transformCode(sourceCode: string): string {
  const sourceFile = ts.createSourceFile(
    'input.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const result = ts.transform(sourceFile, [createArrowFunctionTransformer()]);
  const printer = ts.createPrinter();
  return printer.printFile(result.transformed[0]);
}
    `,
    hints: [
      'Use ts.isFunctionExpression to identify target nodes',
      'Check that function has no name (anonymous)',
      'Use ts.factory.createArrowFunction to create new node',
      'Copy modifiers, parameters, and types from original'
    ]
  },

  {
    id: 'dependency-graph',
    title: 'Module Dependency Graph',
    difficulty: 'advanced',
    description: 'Build a tool that analyzes import/export relationships and creates a dependency graph.',
    requirements: [
      'Parse multiple TypeScript files',
      'Extract import and export declarations',
      'Build a dependency graph',
      'Detect circular dependencies',
      'Generate a topological sort of modules'
    ],
    starterCode: `
import * as ts from 'typescript';

interface ModuleInfo {
  fileName: string;
  imports: string[];
  exports: string[];
}

interface DependencyGraph {
  modules: Map<string, ModuleInfo>;
  dependencies: Map<string, Set<string>>;
  circularDependencies: string[][];
}

class DependencyAnalyzer {
  private files = new Map<string, string>();

  addFile(fileName: string, content: string): void {
    this.files.set(fileName, content);
  }

  analyze(): DependencyGraph {
    // TODO: Implement dependency analysis
    return {
      modules: new Map(),
      dependencies: new Map(),
      circularDependencies: []
    };
  }

  private extractModuleInfo(fileName: string, sourceFile: ts.SourceFile): ModuleInfo {
    // TODO: Extract imports and exports
    return {
      fileName,
      imports: [],
      exports: []
    };
  }

  private detectCircularDependencies(dependencies: Map<string, Set<string>>): string[][] {
    // TODO: Implement cycle detection
    return [];
  }
}

// Example usage:
const analyzer = new DependencyAnalyzer();
analyzer.addFile('a.ts', 'import { b } from "./b"; export const a = 1;');
analyzer.addFile('b.ts', 'import { c } from "./c"; export const b = 2;');
analyzer.addFile('c.ts', 'import { a } from "./a"; export const c = 3;');

const graph = analyzer.analyze();
console.log('Circular dependencies:', graph.circularDependencies);
    `,
    hints: [
      'Use ts.isImportDeclaration and ts.isExportDeclaration',
      'Extract module specifier from import/export nodes',
      'Use DFS to detect cycles in the dependency graph',
      'Track visited and currently processing nodes for cycle detection'
    ]
  },

  {
    id: 'source-map-generator',
    title: 'Source Map Generator',
    difficulty: 'advanced',
    description: 'Create a simple source map generator for transformed TypeScript code.',
    requirements: [
      'Transform TypeScript to JavaScript',
      'Track position mappings during transformation',
      'Generate source map JSON',
      'Map generated positions back to original positions'
    ],
    starterCode: `
import * as ts from 'typescript';

interface SourceMapEntry {
  generated: { line: number; column: number };
  original: { line: number; column: number };
  source: string;
  name?: string;
}

interface SourceMap {
  version: number;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
  file: string;
}

class SimpleSourceMapGenerator {
  private mappings: SourceMapEntry[] = [];
  private sources: string[] = [];
  private sourcesContent: string[] = [];
  private names: string[] = [];

  addMapping(
    generated: { line: number; column: number },
    original: { line: number; column: number },
    source: string,
    name?: string
  ): void {
    // TODO: Implement mapping addition
  }

  generateSourceMap(file: string): SourceMap {
    // TODO: Generate source map JSON
    return {
      version: 3,
      sources: [],
      sourcesContent: [],
      names: [],
      mappings: '',
      file
    };
  }

  private encodeMappings(): string {
    // TODO: Encode mappings using VLQ (simplified)
    return '';
  }
}

// Usage example:
const generator = new SimpleSourceMapGenerator();
// Add some mappings during transformation...
const sourceMap = generator.generateSourceMap('output.js');
console.log(JSON.stringify(sourceMap, null, 2));
    `,
    hints: [
      'Source maps use VLQ (Variable Length Quantity) encoding',
      'Each mapping represents a relationship between generated and original positions',
      'The mappings field is base64-encoded VLQ data',
      'For simplicity, you can create a basic implementation without full VLQ encoding'
    ]
  },

  {
    id: 'type-checker-integration',
    title: 'Type Information Extractor',
    difficulty: 'expert',
    description: 'Build a tool that uses the TypeScript type checker to extract detailed type information.',
    requirements: [
      'Create a TypeScript program with type checker',
      'Extract type information for variables, functions, and classes',
      'Resolve type aliases and interface inheritance',
      'Generate comprehensive type documentation'
    ],
    starterCode: `
import * as ts from 'typescript';

interface TypeInfo {
  name: string;
  kind: string;
  typeString: string;
  properties?: TypeInfo[];
  parameters?: { name: string; type: string }[];
  returnType?: string;
}

class TypeInfoExtractor {
  private program: ts.Program;
  private typeChecker: ts.TypeChecker;

  constructor(fileNames: string[], options: ts.CompilerOptions) {
    // TODO: Initialize program and type checker
  }

  extractTypeInfo(fileName: string): TypeInfo[] {
    // TODO: Extract comprehensive type information
    return [];
  }

  private getTypeInfo(symbol: ts.Symbol): TypeInfo {
    // TODO: Extract detailed type information from symbol
    return {
      name: '',
      kind: '',
      typeString: ''
    };
  }

  private getTypeString(type: ts.Type): string {
    // TODO: Get human-readable type string
    return '';
  }
}

// Example usage:
const extractor = new TypeInfoExtractor(['example.ts'], {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS
});

const typeInfo = extractor.extractTypeInfo('example.ts');
console.log(JSON.stringify(typeInfo, null, 2));
    `,
    hints: [
      'Use ts.createProgram to create a program with type checker',
      'Use program.getTypeChecker() to get the type checker instance',
      'Use typeChecker.getSymbolAtLocation() to get symbols',
      'Use typeChecker.typeToString() to get readable type strings'
    ]
  },

  {
    id: 'incremental-compiler',
    title: 'Incremental Compilation Engine',
    difficulty: 'expert',
    description: 'Build an incremental compiler that only recompiles changed files and their dependents.',
    requirements: [
      'Track file modification times',
      'Build dependency graph',
      'Identify affected files when a file changes',
      'Cache compilation results',
      'Implement watch mode for automatic recompilation'
    ],
    starterCode: `
import * as ts from 'typescript';
import * as fs from 'fs';

interface CompilationResult {
  success: boolean;
  diagnostics: ts.Diagnostic[];
  emittedFiles: string[];
  compilationTime: number;
}

interface FileState {
  fileName: string;
  lastModified: number;
  dependencies: Set<string>;
  dependents: Set<string>;
}

class IncrementalCompiler {
  private fileStates = new Map<string, FileState>();
  private compilerOptions: ts.CompilerOptions;
  private compilationCache = new Map<string, CompilationResult>();

  constructor(options: ts.CompilerOptions = {}) {
    this.compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      outDir: './dist',
      ...options
    };
  }

  addFile(fileName: string): void {
    // TODO: Add file to tracking system
  }

  compile(changedFiles?: string[]): CompilationResult {
    // TODO: Implement incremental compilation
    return {
      success: true,
      diagnostics: [],
      emittedFiles: [],
      compilationTime: 0
    };
  }

  private buildDependencyGraph(): void {
    // TODO: Build file dependency relationships
  }

  private getAffectedFiles(changedFiles: string[]): Set<string> {
    // TODO: Find all files affected by changes
    return new Set();
  }

  private needsRecompilation(fileName: string): boolean {
    // TODO: Check if file needs recompilation
    return true;
  }

  watch(): void {
    // TODO: Implement watch mode with fs.watchFile
    console.log('Watch mode not implemented');
  }
}

// Example usage:
const compiler = new IncrementalCompiler({
  target: ts.ScriptTarget.ES2018,
  module: ts.ModuleKind.CommonJS,
  strict: true
});

compiler.addFile('src/main.ts');
compiler.addFile('src/utils.ts');

const result = compiler.compile();
console.log(\`Compilation \${result.success ? 'succeeded' : 'failed'}\`);
    `,
    hints: [
      'Use fs.statSync to get file modification times',
      'Build a bidirectional dependency graph (dependencies and dependents)',
      'Use BFS/DFS to find all affected files from changed files',
      'Cache compilation results and invalidate when dependencies change',
      'Use fs.watchFile or chokidar for file system watching'
    ]
  },

  {
    id: 'language-service-plugin',
    title: 'Language Service Plugin',
    difficulty: 'expert',
    description: 'Create a TypeScript language service plugin that provides custom completions and diagnostics.',
    requirements: [
      'Create a language service plugin interface',
      'Provide custom auto-completions',
      'Add custom diagnostic rules',
      'Support hover information',
      'Implement quick fixes for custom diagnostics'
    ],
    starterCode: \`
import * as ts from 'typescript';

interface LanguageServicePlugin {
  create(info: ts.server.PluginCreateInfo): ts.LanguageService;
}

class CustomLanguageServicePlugin implements LanguageServicePlugin {
  create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const proxy = Object.create(null);
    const oldLS = info.languageService;

    // Proxy all existing methods
    for (let k of Object.keys(oldLS) as Array<keyof ts.LanguageService>) {
      const old = oldLS[k]!;
      proxy[k] = function (this: any) {
        return old.apply(oldLS, arguments);
      };
    }

    // Override specific methods
    proxy.getCompletionsAtPosition = this.getCompletionsAtPosition.bind(this, oldLS);
    proxy.getSemanticDiagnostics = this.getSemanticDiagnostics.bind(this, oldLS);
    proxy.getQuickInfoAtPosition = this.getQuickInfoAtPosition.bind(this, oldLS);

    return proxy;
  }

  private getCompletionsAtPosition(
    prior: ts.LanguageService,
    fileName: string,
    position: number,
    options: ts.GetCompletionsAtPositionOptions | undefined
  ): ts.CompletionInfo | undefined {
    // TODO: Add custom completions
    const priorCompletions = prior.getCompletionsAtPosition(fileName, position, options);
    return priorCompletions;
  }

  private getSemanticDiagnostics(
    prior: ts.LanguageService,
    fileName: string
  ): ts.Diagnostic[] {
    // TODO: Add custom diagnostics
    const priorDiagnostics = prior.getSemanticDiagnostics(fileName);
    return priorDiagnostics;
  }

  private getQuickInfoAtPosition(
    prior: ts.LanguageService,
    fileName: string,
    position: number
  ): ts.QuickInfo | undefined {
    // TODO: Add custom hover information
    return prior.getQuickInfoAtPosition(fileName, position);
  }
}

// Plugin registration
function init(modules: { typescript: typeof import("typescript") }) {
  const ts = modules.typescript;
  
  function create(info: ts.server.PluginCreateInfo) {
    return new CustomLanguageServicePlugin().create(info);
  }

  return { create };
}

export = init;
\`,
    hints: [
      'Language service plugins use a proxy pattern to extend functionality',
      'Return custom completion entries with specific kinds and details',
      'Custom diagnostics should have unique error codes',
      'Use the TypeScript API to analyze code at specific positions',
      'Plugins are registered in tsconfig.json under compilerOptions.plugins'
    ]
  }
];

export const compilerAPIExerciseCategories = [
  {
    id: 'ast-manipulation',
    title: 'AST Manipulation',
    exercises: ['ast-walker', 'function-analyzer', 'code-transformer']
  },
  {
    id: 'diagnostics-linting',
    title: 'Diagnostics & Linting',
    exercises: ['custom-linter', 'type-checker-integration']
  },
  {
    id: 'advanced-tooling',
    title: 'Advanced Tooling',
    exercises: ['dependency-graph', 'source-map-generator', 'incremental-compiler', 'language-service-plugin']
  }
];

export const getExercisesByDifficulty = (difficulty: string) => {
  return compilerAPIExercises.filter(ex => ex.difficulty === difficulty);
};

export const getExerciseById = (id: string) => {
  return compilerAPIExercises.find(ex => ex.id === id);
};