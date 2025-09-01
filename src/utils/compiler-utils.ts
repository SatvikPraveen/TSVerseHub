/* File: src/utils/compiler-utils.ts */

export interface CompilationResult {
  success: boolean;
  outputText?: string;
  diagnostics: Diagnostic[];
  sourceFiles: SourceFile[];
  timeTaken: number;
  memoryUsed?: number;
}

export interface Diagnostic {
  id: string;
  category: 'error' | 'warning' | 'info' | 'suggestion';
  severity: number;
  message: string;
  code: number;
  file?: string;
  line?: number;
  column?: number;
  startPosition?: number;
  endPosition?: number;
  relatedInformation?: Array<{
    message: string;
    file?: string;
    line?: number;
    column?: number;
  }>;
  quickFixes?: QuickFix[];
}

export interface QuickFix {
  id: string;
  title: string;
  description: string;
  changes: Array<{
    file: string;
    startPosition: number;
    endPosition: number;
    newText: string;
  }>;
}

export interface SourceFile {
  fileName: string;
  content: string;
  version: number;
  languageVersion: string;
  isDeclarationFile: boolean;
}

export interface CompilerOptions {
  target: 'ES3' | 'ES5' | 'ES2015' | 'ES2016' | 'ES2017' | 'ES2018' | 'ES2019' | 'ES2020' | 'ES2021' | 'ES2022' | 'ESNext';
  module: 'None' | 'CommonJS' | 'AMD' | 'UMD' | 'System' | 'ES6' | 'ES2015' | 'ES2020' | 'ES2022' | 'ESNext' | 'Node16' | 'NodeNext';
  lib: string[];
  strict: boolean;
  noImplicitAny: boolean;
  strictNullChecks: boolean;
  strictFunctionTypes: boolean;
  noImplicitReturns: boolean;
  noUnusedLocals: boolean;
  noUnusedParameters: boolean;
  exactOptionalPropertyTypes: boolean;
  sourceMap: boolean;
  declaration: boolean;
  outDir?: string;
  rootDir?: string;
  allowJs: boolean;
  checkJs: boolean;
  jsx: 'preserve' | 'react' | 'react-jsx' | 'react-jsxdev' | 'react-native';
  experimentalDecorators: boolean;
  emitDecoratorMetadata: boolean;
}

export interface TypeInfo {
  name: string;
  kind: string;
  documentation?: string;
  tags?: Array<{
    name: string;
    text: string;
  }>;
  type?: string;
  symbol?: string;
}

export interface CompletionItem {
  name: string;
  kind: 'class' | 'interface' | 'enum' | 'function' | 'variable' | 'property' | 'method' | 'keyword' | 'module' | 'type';
  detail?: string;
  documentation?: string;
  insertText?: string;
  sortText?: string;
  filterText?: string;
  additionalTextEdits?: Array<{
    range: { start: number; end: number };
    newText: string;
  }>;
}

export interface SignatureInfo {
  signatures: Array<{
    label: string;
    documentation?: string;
    parameters: Array<{
      label: string;
      documentation?: string;
    }>;
  }>;
  activeSignature: number;
  activeParameter: number;
}

class TypeScriptCompilerService {
  private defaultOptions: CompilerOptions;
  private virtualFileSystem: Map<string, string>;

  constructor() {
    this.defaultOptions = {
      target: 'ES2020',
      module: 'ESNext',
      lib: ['ES2020', 'DOM'],
      strict: false,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      noImplicitReturns: false,
      noUnusedLocals: false,
      noUnusedParameters: false,
      exactOptionalPropertyTypes: false,
      sourceMap: false,
      declaration: false,
      allowJs: true,
      checkJs: false,
      jsx: 'react-jsx',
      experimentalDecorators: true,
      emitDecoratorMetadata: true
    };

    this.virtualFileSystem = new Map();
    this.initializeVirtualFileSystem();
  }

  /**
   * Initialize virtual file system with common type definitions
   */
  private initializeVirtualFileSystem(): void {
    // Add basic lib.d.ts definitions
    const basicLibDefinitions = `
// Basic global types
declare var console: {
  log(...data: any[]): void;
  error(...data: any[]): void;
  warn(...data: any[]): void;
  info(...data: any[]): void;
};

declare var JSON: {
  parse(text: string): any;
  stringify(value: any, replacer?: any, space?: any): string;
};

declare var Math: {
  abs(x: number): number;
  max(...values: number[]): number;
  min(...values: number[]): number;
  random(): number;
  round(x: number): number;
  floor(x: number): number;
  ceil(x: number): number;
};

declare var Date: {
  new(): Date;
  new(value: number | string): Date;
  now(): number;
};

interface Date {
  getTime(): number;
  toISOString(): string;
  toLocaleDateString(): string;
  toLocaleTimeString(): string;
}

declare var Array: {
  new<T>(): T[];
  new<T>(size: number): T[];
  isArray(arg: any): arg is any[];
};

interface Array<T> {
  length: number;
  push(...items: T[]): number;
  pop(): T | undefined;
  shift(): T | undefined;
  unshift(...items: T[]): number;
  slice(start?: number, end?: number): T[];
  splice(start: number, deleteCount?: number, ...items: T[]): T[];
  indexOf(searchElement: T, fromIndex?: number): number;
  includes(searchElement: T, fromIndex?: number): boolean;
  forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
  map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
  filter(predicate: (value: T, index: number, array: T[]) => boolean): T[];
  reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
  find(predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined;
  sort(compareFn?: (a: T, b: T) => number): T[];
}

declare var Object: {
  keys(o: any): string[];
  values(o: any): any[];
  entries(o: any): [string, any][];
  assign<T, U>(target: T, source: U): T & U;
};

declare var String: {
  new(value?: any): String;
};

interface String {
  length: number;
  charAt(pos: number): string;
  charCodeAt(index: number): number;
  indexOf(searchString: string, position?: number): number;
  lastIndexOf(searchString: string, position?: number): number;
  slice(start?: number, end?: number): string;
  substring(start: number, end?: number): string;
  toLowerCase(): string;
  toUpperCase(): string;
  trim(): string;
  replace(searchValue: string | RegExp, replaceValue: string): string;
  split(separator?: string | RegExp, limit?: number): string[];
  includes(searchString: string, position?: number): boolean;
  startsWith(searchString: string, position?: number): boolean;
  endsWith(searchString: string, length?: number): boolean;
}

declare var Number: {
  new(value?: any): Number;
  isNaN(number: unknown): boolean;
  isFinite(number: unknown): boolean;
  parseInt(string: string, radix?: number): number;
  parseFloat(string: string): number;
};

interface Number {
  toString(radix?: number): string;
  toFixed(fractionDigits?: number): string;
  valueOf(): number;
}

declare var Boolean: {
  new(value?: any): Boolean;
};

interface Boolean {
  valueOf(): boolean;
}

// Promise type
interface Promise<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2>;
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<T | TResult>;
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

declare var Promise: {
  new<T>(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void): Promise<T>;
  resolve<T>(value: T): Promise<T>;
  reject<T = never>(reason?: any): Promise<T>;
  all<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T[]>;
  race<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T>;
};

// Function type
interface Function {
  call(thisArg: any, ...argArray: any[]): any;
  apply(thisArg: any, argArray?: any): any;
  bind(thisArg: any, ...argArray: any[]): any;
  length: number;
}

// Error types
declare var Error: {
  new(message?: string): Error;
};

interface Error {
  name: string;
  message: string;
  stack?: string;
}
`;

    this.virtualFileSystem.set('lib.d.ts', basicLibDefinitions);

    // Add React types for JSX support
    const reactTypes = `
declare namespace React {
  interface ReactElement<P = any> {
    type: any;
    props: P;
    key: string | number | null;
  }

  interface FC<P = {}> {
    (props: P): ReactElement | null;
  }

  function createElement<P>(
    type: string | FC<P>,
    props?: P | null,
    ...children: any[]
  ): ReactElement<P>;

  const Fragment: FC<{ children?: any }>;
}

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
`;

    this.virtualFileSystem.set('react.d.ts', reactTypes);
  }

  /**
   * Compile TypeScript code
   */
  async compile(
    code: string, 
    fileName: string = 'main.ts',
    options: Partial<CompilerOptions> = {}
  ): Promise<CompilationResult> {
    const startTime = performance.now();
    const compilerOptions = { ...this.defaultOptions, ...options };

    try {
      // For browser environment, we'll do basic compilation simulation
      const result = await this.simulateCompilation(code, fileName, compilerOptions);
      const endTime = performance.now();

      return {
        ...result,
        timeTaken: endTime - startTime
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        success: false,
        diagnostics: [{
          id: 'compilation-error',
          category: 'error',
          severity: 1,
          message: error instanceof Error ? error.message : 'Unknown compilation error',
          code: 1,
          file: fileName,
          line: 1,
          column: 1
        }],
        sourceFiles: [],
        timeTaken: endTime - startTime
      };
    }
  }

  /**
   * Transpile TypeScript to JavaScript
   */
  async transpile(code: string, options: Partial<CompilerOptions> = {}): Promise<string> {
    const compilerOptions = { ...this.defaultOptions, ...options };
    
    // Basic TypeScript to JavaScript transpilation
    let jsCode = code;

    // Remove type annotations
    jsCode = jsCode.replace(/:\s*[^=,;{}()]+(?=[=,;{}()])/g, '');
    jsCode = jsCode.replace(/\?\s*:/g, ':');
    
    // Handle interfaces (remove them)
    jsCode = jsCode.replace(/interface\s+\w+\s*{[^}]*}/g, '');
    
    // Handle type aliases (remove them)  
    jsCode = jsCode.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
    
    // Handle enums
    jsCode = jsCode.replace(/enum\s+(\w+)\s*{([^}]*)}/g, (match, name, body) => {
      const members = body.split(',').map((member: string) => member.trim()).filter((m: string) => m);
      let enumObj = `const ${name} = {\n`;
      members.forEach((member: string, index: number) => {
        const [key, value] = member.split('=').map((s: string) => s.trim());
        const enumValue = value ? value.replace(/['"]/g, '') : index.toString();
        enumObj += `  ${key}: ${typeof enumValue === 'string' && isNaN(Number(enumValue)) ? `"${enumValue}"` : enumValue},\n`;
      });
      enumObj += '};';
      return enumObj;
    });

    // Handle import/export (basic)
    jsCode = jsCode.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '');
    jsCode = jsCode.replace(/export\s+/g, '');

    // Handle access modifiers (remove them)
    jsCode = jsCode.replace(/(private|protected|public|readonly)\s+/g, '');

    // Handle generic type parameters
    jsCode = jsCode.replace(/<[^>]*>/g, '');

    // Handle optional chaining and nullish coalescing (keep as-is for modern JS)
    
    // Handle decorators (remove them)
    jsCode = jsCode.replace(/@\w+(\([^)]*\))?\s*/g, '');

    return jsCode;
  }

  /**
   * Get diagnostics for code
   */
  async getDiagnostics(code: string, fileName: string = 'main.ts'): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    // Basic syntax checking
    try {
      // Check for common TypeScript syntax errors
      const syntaxErrors = this.checkSyntaxErrors(code);
      diagnostics.push(...syntaxErrors);

      // Check for type errors
      const typeErrors = this.checkTypeErrors(code);
      diagnostics.push(...typeErrors);

      // Check for unused variables
      const unusedVariables = this.checkUnusedVariables(code);
      diagnostics.push(...unusedVariables);

    } catch (error) {
      diagnostics.push({
        id: 'parse-error',
        category: 'error',
        severity: 1,
        message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 1001,
        file: fileName,
        line: 1,
        column: 1
      });
    }

    return diagnostics;
  }

  /**
   * Get type information at position
   */
  async getTypeInfo(code: string, position: number, fileName: string = 'main.ts'): Promise<TypeInfo | null> {
    // This would typically use the TypeScript compiler API
    // For simulation, we'll provide basic type inference
    
    const word = this.getWordAtPosition(code, position);
    if (!word) return null;

    // Basic type inference based on context
    const typeInfo = this.inferTypeFromContext(code, word, position);
    
    return typeInfo;
  }

  /**
   * Get completion suggestions
   */
  async getCompletions(
    code: string, 
    position: number, 
    fileName: string = 'main.ts'
  ): Promise<CompletionItem[]> {
    const completions: CompletionItem[] = [];

    // Get word at position for context
    const currentWord = this.getWordAtPosition(code, position);
    const beforeCursor = code.substring(0, position);

    // TypeScript keywords
    const keywords = [
      'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'enum',
      'import', 'export', 'default', 'async', 'await', 'return', 'if', 'else',
      'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch',
      'finally', 'throw', 'new', 'this', 'super', 'extends', 'implements',
      'public', 'private', 'protected', 'readonly', 'static', 'abstract'
    ];

    // Add keyword completions
    keywords.forEach(keyword => {
      if (!currentWord || keyword.startsWith(currentWord)) {
        completions.push({
          name: keyword,
          kind: 'keyword',
          detail: `TypeScript keyword`,
          sortText: `0_${keyword}`
        });
      }
    });

    // Built-in types
    const builtInTypes = [
      'string', 'number', 'boolean', 'object', 'any', 'unknown', 'never', 'void',
      'null', 'undefined', 'symbol', 'bigint'
    ];

    builtInTypes.forEach(type => {
      if (!currentWord || type.startsWith(currentWord)) {
        completions.push({
          name: type,
          kind: 'type',
          detail: `Built-in type`,
          sortText: `1_${type}`
        });
      }
    });

    // Utility types
    const utilityTypes = [
      'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'Exclude', 'Extract',
      'NonNullable', 'Parameters', 'ReturnType', 'Record'
    ];

    utilityTypes.forEach(type => {
      if (!currentWord || type.startsWith(currentWord)) {
        completions.push({
          name: type,
          kind: 'type',
          detail: `Utility type`,
          documentation: this.getUtilityTypeDocumentation(type),
          insertText: type.includes('<') ? type : `${type}<>`,
          sortText: `2_${type}`
        });
      }
    });

    // Global objects and their methods
    if (beforeCursor.endsWith('console.')) {
      ['log', 'error', 'warn', 'info', 'table', 'clear'].forEach(method => {
        completions.push({
          name: method,
          kind: 'method',
          detail: `(method) console.${method}(...data: any[]): void`,
          sortText: `3_${method}`
        });
      });
    }

    // Array methods
    if (this.isArrayContext(beforeCursor)) {
      const arrayMethods = [
        'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'indexOf',
        'includes', 'forEach', 'map', 'filter', 'reduce', 'find', 'sort'
      ];
      
      arrayMethods.forEach(method => {
        completions.push({
          name: method,
          kind: 'method',
          detail: `Array method`,
          sortText: `3_${method}`
        });
      });
    }

    return completions.slice(0, 20); // Limit results
  }

  /**
   * Get signature help
   */
  async getSignatureHelp(
    code: string, 
    position: number, 
    fileName: string = 'main.ts'
  ): Promise<SignatureInfo | null> {
    const beforeCursor = code.substring(0, position);
    
    // Find function call context
    const functionMatch = beforeCursor.match(/(\w+)\s*\(\s*([^)]*)$/);
    if (!functionMatch) return null;

    const functionName = functionMatch[1];
    const currentArgs = functionMatch[2];
    const argCount = currentArgs ? currentArgs.split(',').length : 0;

    // Get signature for known functions
    const signatures = this.getFunctionSignatures(functionName);
    if (signatures.length === 0) return null;

    return {
      signatures,
      activeSignature: 0,
      activeParameter: Math.max(0, argCount - 1)
    };
  }

  /**
   * Simulate TypeScript compilation
   */
  private async simulateCompilation(
    code: string,
    fileName: string,
    options: CompilerOptions
  ): Promise<Omit<CompilationResult, 'timeTaken'>> {
    const diagnostics = await this.getDiagnostics(code, fileName);
    const hasErrors = diagnostics.some(d => d.category === 'error');

    let outputText: string | undefined;
    if (!hasErrors) {
      outputText = await this.transpile(code, options);
    }

    const sourceFiles: SourceFile[] = [{
      fileName,
      content: code,
      version: 1,
      languageVersion: options.target,
      isDeclarationFile: false
    }];

    return {
      success: !hasErrors,
      outputText,
      diagnostics,
      sourceFiles
    };
  }

  /**
   * Check for syntax errors
   */
  private checkSyntaxErrors(code: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lines = code.split('\n');

    lines.forEach((line, lineIndex) => {
      // Check for unmatched brackets
      const openBrackets = (line.match(/[{[(]/g) || []).length;
      const closeBrackets = (line.match(/[}\])]/g) || []).length;
      
      // Check for missing semicolons (basic)
      if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && 
          !line.trim().endsWith('}') && !line.includes('//')) {
        const trimmed = line.trim();
        if (trimmed.match(/^(let|const|var|return|throw)\s/) && !trimmed.includes('=')) {
          diagnostics.push({
            id: `missing-semicolon-${lineIndex}`,
            category: 'warning',
            severity: 2,
            message: 'Missing semicolon',
            code: 1005,
            line: lineIndex + 1,
            column: line.length,
            quickFixes: [{
              id: 'add-semicolon',
              title: 'Add semicolon',
              description: 'Add missing semicolon at end of statement',
              changes: [{
                file: 'main.ts',
                startPosition: 0,
                endPosition: 0,
                newText: ';'
              }]
            }]
          });
        }
      }

      // Check for invalid type annotations
      if (line.includes(':') && !line.includes('//')) {
        const typeAnnotationMatch = line.match(/:\s*([^=,;{}()]+)(?=[=,;{}()])/);
        if (typeAnnotationMatch) {
          const type = typeAnnotationMatch[1].trim();
          if (!this.isValidType(type)) {
            diagnostics.push({
              id: `invalid-type-${lineIndex}`,
              category: 'error',
              severity: 1,
              message: `Invalid type '${type}'`,
              code: 2304,
              line: lineIndex + 1,
              column: line.indexOf(type) + 1
            });
          }
        }
      }
    });

    return diagnostics;
  }

  /**
   * Check for type errors
   */
  private checkTypeErrors(code: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lines = code.split('\n');

    lines.forEach((line, lineIndex) => {
      // Check for implicit any
      const varMatch = line.match(/(let|const|var)\s+(\w+)\s*=/);
      if (varMatch && !line.includes(':')) {
        // This is okay - type inference is allowed
      }

      // Check for null/undefined usage
      if (line.includes('.') && !line.includes('//')) {
        const nullableAccess = line.match(/(\w+)\.(\w+)/);
        if (nullableAccess) {
          // Could potentially be null - suggest optional chaining
          diagnostics.push({
            id: `nullable-access-${lineIndex}`,
            category: 'suggestion',
            severity: 4,
            message: `Consider using optional chaining '${nullableAccess[1]}?.${nullableAccess[2]}'`,
            code: 2532,
            line: lineIndex + 1,
            column: line.indexOf(nullableAccess[0]) + 1,
            quickFixes: [{
              id: 'add-optional-chaining',
              title: 'Use optional chaining',
              description: 'Add optional chaining to safely access property',
              changes: [{
                file: 'main.ts',
                startPosition: 0,
                endPosition: 0,
                newText: '?.'
              }]
            }]
          });
        }
      }
    });

    return diagnostics;
  }

  /**
   * Check for unused variables
   */
  private checkUnusedVariables(code: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lines = code.split('\n');
    
    // Simple unused variable detection
    const declaredVars = new Set<string>();
    const usedVars = new Set<string>();

    lines.forEach((line, lineIndex) => {
      // Find variable declarations
      const varDeclarations = line.match(/(let|const|var)\s+(\w+)/g);
      if (varDeclarations) {
        varDeclarations.forEach(decl => {
          const varName = decl.split(/\s+/)[1];
          declaredVars.add(varName);
        });
      }

      // Find variable usage (very basic)
      const words = line.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g);
      if (words) {
        words.forEach(word => {
          if (declaredVars.has(word)) {
            usedVars.add(word);
          }
        });
      }
    });

    // Report unused variables
    declaredVars.forEach(varName => {
      if (!usedVars.has(varName)) {
        diagnostics.push({
          id: `unused-var-${varName}`,
          category: 'warning',
          severity: 2,
          message: `'${varName}' is declared but never used`,
          code: 6133,
          quickFixes: [{
            id: 'remove-unused-var',
            title: `Remove unused variable '${varName}'`,
            description: 'Remove the unused variable declaration',
            changes: []
          }]
        });
      }
    });

    return diagnostics;
  }

  /**
   * Get word at position
   */
  private getWordAtPosition(code: string, position: number): string | null {
    const beforeCursor = code.substring(0, position);
    const afterCursor = code.substring(position);
    
    const beforeMatch = beforeCursor.match(/[a-zA-Z_$][a-zA-Z0-9_$]*$/);
    const afterMatch = afterCursor.match(/^[a-zA-Z0-9_$]*/);
    
    const before = beforeMatch ? beforeMatch[0] : '';
    const after = afterMatch ? afterMatch[0] : '';
    
    return before + after || null;
  }

  /**
   * Infer type from context
   */
  private inferTypeFromContext(code: string, word: string, position: number): TypeInfo {
    // Basic type inference
    const beforeWord = code.substring(0, position - word.length);
    
    // Check if it's a variable declaration with type annotation
    const typeAnnotation = beforeWord.match(new RegExp(`${word}\\s*:\\s*([^=,;{}()]+)`, 'g'));
    if (typeAnnotation) {
      const type = typeAnnotation[0].split(':')[1].trim();
      return {
        name: word,
        kind: 'variable',
        type: type,
        documentation: `Variable of type ${type}`
      };
    }

    // Default inference
    return {
      name: word,
      kind: 'variable',
      type: 'any',
      documentation: `Identifier: ${word}`
    };
  }

  /**
   * Check if context is array-related
   */
  private isArrayContext(beforeCursor: string): boolean {
    return beforeCursor.match(/\[\]\.|\w+\.(?=\w*$)/) !== null;
  }

  /**
   * Get function signatures
   */
  private getFunctionSignatures(functionName: string): Array<{
    label: string;
    documentation?: string;
    parameters: Array<{ label: string; documentation?: string }>;
  }> {
    const signatures: Record<string, any> = {
      console: {
        log: [{
          label: 'console.log(...data: any[]): void',
          documentation: 'Prints to stdout with newline',
          parameters: [
            { label: '...data: any[]', documentation: 'Data to print' }
          ]
        }]
      },
      Math: {
        max: [{
          label: 'Math.max(...values: number[]): number',
          documentation: 'Returns the largest of the given numbers',
          parameters: [
            { label: '...values: number[]', documentation: 'Numbers to compare' }
          ]
        }],
        min: [{
          label: 'Math.min(...values: number[]): number',
          documentation: 'Returns the smallest of the given numbers',
          parameters: [
            { label: '...values: number[]', documentation: 'Numbers to compare' }
          ]
        }]
      }
    };

    return signatures[functionName] || [];
  }

  /**
   * Get utility type documentation
   */
  private getUtilityTypeDocumentation(typeName: string): string {
    const docs: Record<string, string> = {
      'Partial': 'Constructs a type with all properties of T set to optional',
      'Required': 'Constructs a type with all properties of T set to required',
      'Readonly': 'Constructs a type with all properties of T set to readonly',
      'Pick': 'Constructs a type by picking the set of properties K from T',
      'Omit': 'Constructs a type by omitting the set of properties K from T',
      'Record': 'Constructs a type with a set of properties K of type T',
      'Exclude': 'Constructs a type by excluding from T those types assignable to U',
      'Extract': 'Constructs a type by extracting from T those types assignable to U',
      'NonNullable': 'Constructs a type by excluding null and undefined from T',
      'Parameters': 'Obtains the parameters of a function type in a tuple',
      'ReturnType': 'Constructs a type consisting of the return type of function T'
    };

    return docs[typeName] || `Utility type: ${typeName}`;
  }

  /**
   * Check if type is valid
   */
  private isValidType(type: string): boolean {
    const validTypes = [
      'string', 'number', 'boolean', 'object', 'any', 'unknown', 'never', 'void',
      'null', 'undefined', 'symbol', 'bigint', 'Function', 'Object', 'Array',
      'Date', 'RegExp', 'Error', 'Promise'
    ];

    // Remove generic parameters for checking
    const baseType = type.replace(/<.*>/, '').trim();
    
    // Check if it's a valid built-in type
    if (validTypes.includes(baseType)) {
      return true;
    }

    // Check if it's array notation
    if (baseType.endsWith('[]')) {
      return this.isValidType(baseType.slice(0, -2));
    }

    // Check if it's a union type
    if (baseType.includes('|')) {
      return baseType.split('|').every(t => this.isValidType(t.trim()));
    }

    // Check if it's an intersection type
    if (baseType.includes('&')) {
      return baseType.split('&').every(t => this.isValidType(t.trim()));
    }

    // Assume user-defined types are valid
    return /^[A-Z][a-zA-Z0-9]*$/.test(baseType);
  }

  /**
   * Update compiler options
   */
  setCompilerOptions(options: Partial<CompilerOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Get current compiler options
   */
  getCompilerOptions(): CompilerOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Add file to virtual file system
   */
  addVirtualFile(fileName: string, content: string): void {
    this.virtualFileSystem.set(fileName, content);
  }

  /**
   * Remove file from virtual file system
   */
  removeVirtualFile(fileName: string): void {
    this.virtualFileSystem.delete(fileName);
  }

  /**
   * Get virtual file content
   */
  getVirtualFile(fileName: string): string | undefined {
    return this.virtualFileSystem.get(fileName);
  }

  /**
   * List all virtual files
   */
  listVirtualFiles(): string[] {
    return Array.from(this.virtualFileSystem.keys());
  }
}

// Utility functions
export const CompilerUtils = {
  /**
   * Format diagnostic message
   */
  formatDiagnostic(diagnostic: Diagnostic): string {
    let formatted = `${diagnostic.category.toUpperCase()}`;
    
    if (diagnostic.file && diagnostic.line && diagnostic.column) {
      formatted += ` ${diagnostic.file}(${diagnostic.line},${diagnostic.column})`;
    }
    
    formatted += `: ${diagnostic.message}`;
    
    if (diagnostic.code) {
      formatted += ` [TS${diagnostic.code}]`;
    }
    
    return formatted;
  },

  /**
   * Get severity color
   */
  getSeverityColor(diagnostic: Diagnostic): string {
    switch (diagnostic.category) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      case 'suggestion': return 'text-green-600';
      default: return 'text-gray-600';
    }
  },

  /**
   * Parse TypeScript code to extract symbols
   */
  extractSymbols(code: string): Array<{
    name: string;
    kind: string;
    line: number;
    range: { start: number; end: number };
  }> {
    const symbols: Array<{
      name: string;
      kind: string;
      line: number;
      range: { start: number; end: number };
    }> = [];
    
    const lines = code.split('\n');
    
    lines.forEach((line, lineIndex) => {
      // Find function declarations
      const functionMatch = line.match(/function\s+(\w+)/);
      if (functionMatch) {
        symbols.push({
          name: functionMatch[1],
          kind: 'function',
          line: lineIndex + 1,
          range: { start: line.indexOf(functionMatch[1]), end: line.indexOf(functionMatch[1]) + functionMatch[1].length }
        });
      }

      // Find variable declarations
      const varMatch = line.match(/(let|const|var)\s+(\w+)/);
      if (varMatch) {
        symbols.push({
          name: varMatch[2],
          kind: 'variable',
          line: lineIndex + 1,
          range: { start: line.indexOf(varMatch[2]), end: line.indexOf(varMatch[2]) + varMatch[2].length }
        });
      }

      // Find interface declarations
      const interfaceMatch = line.match(/interface\s+(\w+)/);
      if (interfaceMatch) {
        symbols.push({
          name: interfaceMatch[1],
          kind: 'interface',
          line: lineIndex + 1,
          range: { start: line.indexOf(interfaceMatch[1]), end: line.indexOf(interfaceMatch[1]) + interfaceMatch[1].length }
        });
      }

      // Find type declarations
      const typeMatch = line.match(/type\s+(\w+)/);
      if (typeMatch) {
        symbols.push({
          name: typeMatch[1],
          kind: 'type',
          line: lineIndex + 1,
          range: { start: line.indexOf(typeMatch[1]), end: line.indexOf(typeMatch[1]) + typeMatch[1].length }
        });
      }

      // Find class declarations
      const classMatch = line.match(/class\s+(\w+)/);
      if (classMatch) {
        symbols.push({
          name: classMatch[1],
          kind: 'class',
          line: lineIndex + 1,
          range: { start: line.indexOf(classMatch[1]), end: line.indexOf(classMatch[1]) + classMatch[1].length }
        });
      }
    });

    return symbols;
  }
};

// Export singleton instance
export const compilerService = new TypeScriptCompilerService();

export default TypeScriptCompilerService;