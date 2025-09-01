// File location: src/data/concepts/compiler-api/transpiler.ts

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export interface TranspilerContent {
  title: string;
  description: string;
  codeExamples: {
    basicTranspilation: string;
    customTransformers: string;
    moduleTransformation: string;
    sourceMapGeneration: string;
    advanced: string;
  };
  keyPoints: string[];
}

export const transpilerContent: TranspilerContent = {
  title: "Transpilation and Code Generation",
  description: "Master TypeScript's transpilation engine to convert TypeScript code to JavaScript, apply custom transformations, generate source maps, and build sophisticated code generation tools.",
  
  codeExamples: {
    basicTranspilation: `// Basic TypeScript transpilation

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// ===== SIMPLE TRANSPILER =====
class SimpleTranspiler {
  private compilerOptions: ts.CompilerOptions;

  constructor(options: ts.CompilerOptions = {}) {
    this.compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      ...options
    };
  }

  transpileFile(filePath: string): {
    javascript: string;
    sourceMap?: string;
    diagnostics: ts.Diagnostic[];
  } {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    return this.transpileSource(sourceCode, filePath);
  }

  transpileSource(sourceCode: string, fileName: string = 'input.ts'): {
    javascript: string;
    sourceMap?: string;
    diagnostics: ts.Diagnostic[];
  } {
    // Create source file
    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      this.compilerOptions.target || ts.ScriptTarget.ES2020,
      true
    );

    // Create program
    const host = ts.createCompilerHost(this.compilerOptions);
    host.getSourceFile = (filename) => {
      if (filename === fileName) return sourceFile;
      return ts.createSourceFile(filename, '', ts.ScriptTarget.Latest);
    };

    const program = ts.createProgram([fileName], this.compilerOptions, host);

    // Get diagnostics
    const diagnostics = ts.getPreEmitDiagnostics(program);

    // Emit result
    let javascript = '';
    let sourceMap: string | undefined;

    const emitResult = program.emit(undefined, (fileName, data) => {
      if (fileName.endsWith('.js')) {
        javascript = data;
      } else if (fileName.endsWith('.js.map')) {
        sourceMap = data;
      }
    });

    return {
      javascript,
      sourceMap,
      diagnostics: [...diagnostics, ...emitResult.diagnostics]
    };
  }

  transpileModule(sourceCode: string, options: ts.CompilerOptions = {}): {
    outputText: string;
    sourceMapText?: string;
    diagnostics?: ts.Diagnostic[];
  } {
    const mergedOptions = { ...this.compilerOptions, ...options };
    return ts.transpileModule(sourceCode, {
      compilerOptions: mergedOptions
    });
  }
}

// ===== BATCH TRANSPILER =====
class BatchTranspiler {
  private compilerOptions: ts.CompilerOptions;
  private rootDir: string;
  private outDir: string;

  constructor(
    rootDir: string,
    outDir: string,
    options: ts.CompilerOptions = {}
  ) {
    this.rootDir = rootDir;
    this.outDir = outDir;
    this.compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      rootDir,
      outDir,
      sourceMap: true,
      declaration: true,
      ...options
    };
  }

  transpileProject(): {
    success: boolean;
    diagnostics: ts.Diagnostic[];
    emitSkipped: boolean;
    emittedFiles: string[];
  } {
    // Find all TypeScript files
    const files = this.findTsFiles(this.rootDir);
    
    // Create program
    const host = ts.createCompilerHost(this.compilerOptions);
    const program = ts.createProgram(files, this.compilerOptions, host);

    // Get diagnostics
    const diagnostics = ts.getPreEmitDiagnostics(program);

    // Emit files
    const emittedFiles: string[] = [];
    const emitResult = program.emit(undefined, (fileName, data) => {
      // Ensure output directory exists
      const dir = path.dirname(fileName);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(fileName, data);
      emittedFiles.push(fileName);
    });

    return {
      success: diagnostics.length === 0 && !emitResult.emitSkipped,
      diagnostics: [...diagnostics, ...emitResult.diagnostics],
      emitSkipped: emitResult.emitSkipped,
      emittedFiles
    };
  }

  private findTsFiles(dir: string): string[] {
    const files: string[] = [];
    
    const traverse = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    };

    traverse(dir);
    return files;
  }

  watch(): ts.WatchOfConfigFile<ts.EmitAndSemanticDiagnosticsBuilderProgram> {
    const configPath = path.join(this.rootDir, 'tsconfig.json');
    
    const createProgram = ts.createSemanticDiagnosticsBuilderProgram;
    
    const reportDiagnostic = (diagnostic: ts.Diagnostic) => {
      console.log(ts.formatDiagnosticsWithColorAndContext([diagnostic], {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getCanonicalFileName: fileName => fileName,
        getNewLine: () => ts.sys.newLine
      }));
    };

    const reportWatchStatusChanged = (diagnostic: ts.Diagnostic) => {
      console.log(ts.formatDiagnostic(diagnostic, {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getCanonicalFileName: fileName => fileName,
        getNewLine: () => ts.sys.newLine
      }));
    };

    return ts.createWatchCompilerHost(
      configPath,
      this.compilerOptions,
      ts.sys,
      createProgram,
      reportDiagnostic,
      reportWatchStatusChanged
    ) as any;
  }
}

// ===== IN-MEMORY TRANSPILER =====
class InMemoryTranspiler {
  private fileSystem = new Map<string, string>();
  private compilerOptions: ts.CompilerOptions;

  constructor(options: ts.CompilerOptions = {}) {
    this.compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      ...options
    };
  }

  addFile(fileName: string, content: string): void {
    this.fileSystem.set(fileName, content);
  }

  removeFile(fileName: string): void {
    this.fileSystem.delete(fileName);
  }

  transpileAll(): Map<string, string> {
    const host = ts.createCompilerHost(this.compilerOptions);
    
    // Override host methods to use in-memory file system
    host.readFile = (fileName) => this.fileSystem.get(fileName);
    host.fileExists = (fileName) => this.fileSystem.has(fileName);
    host.getSourceFile = (fileName, languageVersion) => {
      const content = this.fileSystem.get(fileName);
      return content ? ts.createSourceFile(fileName, content, languageVersion, true) : undefined;
    };

    const program = ts.createProgram(Array.from(this.fileSystem.keys()), this.compilerOptions, host);

    const outputFiles = new Map<string, string>();

    program.emit(undefined, (fileName, data) => {
      outputFiles.set(fileName, data);
    });

    return outputFiles;
  }

  getEmittedFileName(inputFileName: string): string {
    const ext = path.extname(inputFileName);
    const base = inputFileName.slice(0, -ext.length);
    
    switch (this.compilerOptions.module) {
      case ts.ModuleKind.ES2015:
      case ts.ModuleKind.ES2020:
      case ts.ModuleKind.ES2022:
      case ts.ModuleKind.ESNext:
        return \`\${base}.mjs\`;
      default:
        return \`\${base}.js\`;
    }
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateBasicTranspilation(): void {
  console.log('=== Basic Transpilation Demo ===');

  const sampleTypeScript = \`
  interface User {
    id: number;
    name: string;
    email?: string;
  }

  class UserService {
    private users: User[] = [];

    async addUser(user: User): Promise<void> {
      this.users.push(user);
      console.log(\`Added user: \${user.name}\`);
    }

    async getUserById(id: number): Promise<User | undefined> {
      return this.users.find(u => u.id === id);
    }

    get userCount(): number {
      return this.users.length;
    }
  }

  const service = new UserService();
  service.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });

  // Use modern syntax
  const processUsers = async () => {
    const user = await service.getUserById(1);
    console.log(\`Found user: \${user?.name ?? 'Unknown'}\`);
  };

  processUsers();
  \`;

  // Transpile to ES2020
  const transpiler = new SimpleTranspiler({
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS
  });

  const result = transpiler.transpileSource(sampleTypeScript);
  
  console.log('\\n=== Diagnostics ===');
  if (result.diagnostics.length > 0) {
    result.diagnostics.forEach(diagnostic => {
      console.log(ts.formatDiagnosticsWithColorAndContext([diagnostic], {
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: fileName => fileName,
        getNewLine: () => '\\n'
      }));
    });
  } else {
    console.log('No errors found!');
  }

  console.log('\\n=== Generated JavaScript ===');
  console.log(result.javascript);
}

// ===== IN-MEMORY DEMONSTRATION =====
export function demonstrateInMemoryTranspilation(): void {
  console.log('\\n=== In-Memory Transpilation Demo ===');

  const transpiler = new InMemoryTranspiler({
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    strict: true
  });

  // Add multiple files
  transpiler.addFile('math.ts', \`
    export function add(a: number, b: number): number {
      return a + b;
    }

    export function multiply(a: number, b: number): number {
      return a * b;
    }
  \`);

  transpiler.addFile('main.ts', \`
    import { add, multiply } from './math';

    const result1 = add(5, 3);
    const result2 = multiply(4, 7);

    console.log(\`Addition: \${result1}\`);
    console.log(\`Multiplication: \${result2}\`);
  \`);

  const outputs = transpiler.transpileAll();

  console.log('\\n=== Generated Files ===');
  for (const [fileName, content] of outputs) {
    console.log(\`\\n--- \${fileName} ---\`);
    console.log(content);
  }
}`,

    customTransformers: `// Custom transformers for code modification

import * as ts from 'typescript';

// ===== TRANSFORMER INTERFACE =====
interface CustomTransformer {
  name: string;
  description: string;
  transform: ts.TransformerFactory<ts.SourceFile>;
}

// ===== DECORATOR TRANSFORMER =====
class DecoratorTransformer implements CustomTransformer {
  name = 'decorator-transformer';
  description = 'Transforms decorators into function calls';

  transform: ts.TransformerFactory<ts.SourceFile> = (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isClassDeclaration(node) && node.decorators) {
          return this.transformDecoratedClass(node, context);
        }
        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };

  private transformDecoratedClass(
    node: ts.ClassDeclaration,
    context: ts.TransformationContext
  ): ts.ClassDeclaration {
    const decorators = node.decorators || [];
    
    // Create decorator calls
    const decoratorCalls = decorators.map(decorator => {
      if (ts.isCallExpression(decorator.expression)) {
        return ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            decorator.expression.expression,
            decorator.expression.typeArguments,
            [
              node.name ? ts.factory.createIdentifier(node.name.text) : ts.factory.createIdentifier('class'),
              ...decorator.expression.arguments
            ]
          )
        );
      }
      return ts.factory.createExpressionStatement(
        ts.factory.createCallExpression(
          decorator.expression,
          undefined,
          [node.name ? ts.factory.createIdentifier(node.name.text) : ts.factory.createIdentifier('class')]
        )
      );
    });

    // Remove decorators from class
    const classWithoutDecorators = ts.factory.createClassDeclaration(
      undefined, // Remove decorators
      node.modifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      node.members
    );

    // Return class with decorator calls added after
    return classWithoutDecorators;
  }
}

// ===== ASYNC/AWAIT TRANSFORMER =====
class AsyncAwaitTransformer implements CustomTransformer {
  name = 'async-await-transformer';
  description = 'Transforms async/await to Promise.then chains';

  transform: ts.TransformerFactory<ts.SourceFile> = (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isFunctionDeclaration(node) && this.isAsyncFunction(node)) {
          return this.transformAsyncFunction(node, context);
        }
        if (ts.isAwaitExpression(node)) {
          return this.transformAwaitExpression(node, context);
        }
        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };

  private isAsyncFunction(node: ts.FunctionDeclaration): boolean {
    return !!(node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword));
  }

  private transformAsyncFunction(
    node: ts.FunctionDeclaration,
    context: ts.TransformationContext
  ): ts.FunctionDeclaration {
    // Remove async modifier
    const modifiers = node.modifiers?.filter(m => m.kind !== ts.SyntaxKind.AsyncKeyword);

    // Transform body to return Promise
    const transformedBody = node.body ? this.wrapInPromise(node.body) : undefined;

    return ts.factory.createFunctionDeclaration(
      node.decorators,
      modifiers,
      node.asteriskToken,
      node.name,
      node.typeParameters,
      node.parameters,
      // Update return type to Promise<T>
      this.wrapReturnTypeInPromise(node.type),
      transformedBody
    );
  }

  private wrapInPromise(body: ts.Block): ts.Block {
    // Wrap the function body in a Promise
    const promiseBody = ts.factory.createNewExpression(
      ts.factory.createIdentifier('Promise'),
      undefined,
      [
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [
            ts.factory.createParameterDeclaration(undefined, undefined, 'resolve'),
            ts.factory.createParameterDeclaration(undefined, undefined, 'reject')
          ],
          undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          body
        )
      ]
    );

    return ts.factory.createBlock([
      ts.factory.createReturnStatement(promiseBody)
    ]);
  }

  private wrapReturnTypeInPromise(returnType: ts.TypeNode | undefined): ts.TypeNode {
    if (!returnType) {
      return ts.factory.createTypeReferenceNode('Promise', [
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
      ]);
    }

    return ts.factory.createTypeReferenceNode('Promise', [returnType]);
  }

  private transformAwaitExpression(
    node: ts.AwaitExpression,
    context: ts.TransformationContext
  ): ts.Expression {
    // Transform await expr to expr.then(...)
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        node.expression,
        'then'
      ),
      undefined,
      [
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [ts.factory.createParameterDeclaration(undefined, undefined, 'result')],
          undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          ts.factory.createIdentifier('result')
        )
      ]
    );
  }
}

// ===== ENUM TRANSFORMER =====
class EnumTransformer implements CustomTransformer {
  name = 'enum-transformer';
  description = 'Transforms TypeScript enums to const objects';

  transform: ts.TransformerFactory<ts.SourceFile> = (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isEnumDeclaration(node)) {
          return this.transformEnum(node);
        }
        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };

  private transformEnum(node: ts.EnumDeclaration): ts.VariableStatement {
    const enumName = node.name.text;
    
    // Create object literal with enum members
    const properties = node.members.map((member, index) => {
      const key = ts.isIdentifier(member.name) ? member.name.text : member.name.getText();
      
      let value: ts.Expression;
      if (member.initializer) {
        value = member.initializer;
      } else {
        // Auto-increment numeric value
        value = ts.factory.createNumericLiteral(index.toString());
      }

      return ts.factory.createPropertyAssignment(key, value);
    });

    const objectLiteral = ts.factory.createObjectLiteralExpression(properties, true);

    // Create const declaration
    const variableDeclaration = ts.factory.createVariableDeclaration(
      enumName,
      undefined,
      undefined,
      objectLiteral
    );

    return ts.factory.createVariableStatement(
      [
        ts.factory.createModifier(ts.SyntaxKind.ConstKeyword),
        ...(node.modifiers?.filter(m => m.kind === ts.SyntaxKind.ExportKeyword) || [])
      ],
      ts.factory.createVariableDeclarationList([variableDeclaration], ts.NodeFlags.Const)
    );
  }
}

// ===== JSX TRANSFORMER =====
class JSXTransformer implements CustomTransformer {
  name = 'jsx-transformer';
  description = 'Transforms JSX elements to React.createElement calls';

  transform: ts.TransformerFactory<ts.SourceFile> = (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isJsxElement(node)) {
          return this.transformJsxElement(node, context);
        }
        if (ts.isJsxSelfClosingElement(node)) {
          return this.transformJsxSelfClosingElement(node, context);
        }
        if (ts.isJsxFragment(node)) {
          return this.transformJsxFragment(node, context);
        }
        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };

  private transformJsxElement(
    node: ts.JsxElement,
    context: ts.TransformationContext
  ): ts.CallExpression {
    const tagName = this.getTagName(node.openingElement.tagName);
    const props = this.getProps(node.openingElement.attributes);
    const children = this.getChildren(node.children, context);

    return this.createReactCreateElement(tagName, props, children);
  }

  private transformJsxSelfClosingElement(
    node: ts.JsxSelfClosingElement,
    context: ts.TransformationContext
  ): ts.CallExpression {
    const tagName = this.getTagName(node.tagName);
    const props = this.getProps(node.attributes);

    return this.createReactCreateElement(tagName, props, []);
  }

  private transformJsxFragment(
    node: ts.JsxFragment,
    context: ts.TransformationContext
  ): ts.CallExpression {
    const children = this.getChildren(node.children, context);
    
    return this.createReactCreateElement(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('React'),
        'Fragment'
      ),
      ts.factory.createNull(),
      children
    );
  }

  private getTagName(tagName: ts.JsxTagNameExpression): ts.Expression {
    if (ts.isIdentifier(tagName)) {
      // Check if it's a native HTML element (starts with lowercase)
      if (tagName.text[0] === tagName.text[0].toLowerCase()) {
        return ts.factory.createStringLiteral(tagName.text);
      }
      return tagName;
    }
    return tagName as ts.Expression;
  }

  private getProps(attributes: ts.NodeArray<ts.JsxAttributeLike>): ts.Expression {
    if (attributes.length === 0) {
      return ts.factory.createNull();
    }

    const properties = attributes.map(attr => {
      if (ts.isJsxAttribute(attr)) {
        const name = attr.name.text;
        const value = attr.initializer || ts.factory.createTrue();
        
        return ts.factory.createPropertyAssignment(name, value as ts.Expression);
      }
      // Handle spread attributes
      if (ts.isJsxSpreadAttribute(attr)) {
        return ts.factory.createSpreadAssignment(attr.expression);
      }
      return undefined;
    }).filter((prop): prop is ts.PropertyAssignment | ts.SpreadAssignment => prop !== undefined);

    return ts.factory.createObjectLiteralExpression(properties);
  }

  private getChildren(
    children: ts.NodeArray<ts.JsxChild>,
    context: ts.TransformationContext
  ): ts.Expression[] {
    return children
      .map(child => {
        if (ts.isJsxText(child)) {
          const text = child.text.trim();
          return text ? ts.factory.createStringLiteral(text) : undefined;
        }
        if (ts.isJsxExpression(child) && child.expression) {
          return child.expression;
        }
        if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || ts.isJsxFragment(child)) {
          return ts.visitNode(child, node => this.transform(context)(ts.createSourceFile('', '', ts.ScriptTarget.Latest)).statements[0]) as ts.Expression;
        }
        return undefined;
      })
      .filter((child): child is ts.Expression => child !== undefined);
  }

  private createReactCreateElement(
    tagName: ts.Expression,
    props: ts.Expression,
    children: ts.Expression[]
  ): ts.CallExpression {
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('React'),
        'createElement'
      ),
      undefined,
      [tagName, props, ...children]
    );
  }
}

// ===== TRANSFORMER PIPELINE =====
class TransformerPipeline {
  private transformers: CustomTransformer[] = [];

  addTransformer(transformer: CustomTransformer): this {
    this.transformers.push(transformer);
    return this;
  }

  getTransformerFactories(): ts.TransformerFactory<ts.SourceFile>[] {
    return this.transformers.map(t => t.transform);
  }

  transform(sourceCode: string, compilerOptions: ts.CompilerOptions = {}): {
    javascript: string;
    diagnostics: ts.Diagnostic[];
  } {
    const sourceFile = ts.createSourceFile(
      'input.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    // Create program
    const host = ts.createCompilerHost(compilerOptions);
    host.getSourceFile = (fileName) => fileName === 'input.ts' ? sourceFile : undefined;
    
    const program = ts.createProgram(['input.ts'], compilerOptions, host);

    // Apply transformers
    let javascript = '';
    const diagnostics = ts.getPreEmitDiagnostics(program);

    const emitResult = program.emit(
      undefined,
      (fileName, data) => {
        if (fileName.endsWith('.js')) {
          javascript = data;
        }
      },
      undefined,
      false,
      {
        before: this.getTransformerFactories()
      }
    );

    return {
      javascript,
      diagnostics: [...diagnostics, ...emitResult.diagnostics]
    };
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateCustomTransformers(): void {
  console.log('=== Custom Transformers Demo ===');

  const sourceCode = \`
  // Decorators
  @Component({
    selector: 'app-user',
    template: '<div>User Component</div>'
  })
  class UserComponent {
    @Input() name: string = '';
  }

  // Async/await
  async function fetchUser(id: number): Promise<User> {
    const response = await fetch(\`/api/users/\${id}\`);
    const user = await response.json();
    return user;
  }

  // Enum
  enum Colors {
    Red = 'red',
    Green = 'green',
    Blue = 'blue'
  }

  // JSX
  function App() {
    return (
      <>
        <div className="container">
          <h1>Hello World</h1>
          <UserComponent name="Alice" />
        </div>
      </>
    );
  }
  \`;

  const pipeline = new TransformerPipeline()
    .addTransformer(new DecoratorTransformer())
    .addTransformer(new AsyncAwaitTransformer())
    .addTransformer(new EnumTransformer())
    .addTransformer(new JSXTransformer());

  console.log('\\n=== Original TypeScript ===');
  console.log(sourceCode);

  const result = pipeline.transform(sourceCode, {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.React
  });

  console.log('\\n=== Transformed JavaScript ===');
  console.log(result.javascript);

  if (result.diagnostics.length > 0) {
    console.log('\\n=== Diagnostics ===');
    result.diagnostics.forEach(diagnostic => {
      console.log(ts.formatDiagnosticsWithColorAndContext([diagnostic], {
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: fileName => fileName,
        getNewLine: () => '\\n'
      }));
    });
  }
}`,

    moduleTransformation: `// Module system transformations and bundling

import * as ts from 'typescript';
import * as path from 'path';

// ===== MODULE RESOLVER =====
class ModuleResolver {
  private compilerOptions: ts.CompilerOptions;
  private moduleCache = new Map<string, ts.SourceFile>();

  constructor(compilerOptions: ts.CompilerOptions = {}) {
    this.compilerOptions = {
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      ...compilerOptions
    };
  }

  resolveModule(moduleName: string, containingFile: string): ts.ResolvedModule | undefined {
    const resolved = ts.resolveModuleName(
      moduleName,
      containingFile,
      this.compilerOptions,
      ts.sys
    );

    return resolved.resolvedModule;
  }

  loadModule(fileName: string): ts.SourceFile | undefined {
    if (this.moduleCache.has(fileName)) {
      return this.moduleCache.get(fileName);
    }

    if (ts.sys.fileExists(fileName)) {
      const content = ts.sys.readFile(fileName);
      if (content) {
        const sourceFile = ts.createSourceFile(
          fileName,
          content,
          this.compilerOptions.target || ts.ScriptTarget.Latest,
          true
        );
        this.moduleCache.set(fileName, sourceFile);
        return sourceFile;
      }
    }

    return undefined;
  }

  getDependencyGraph(rootFile: string): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    const visited = new Set<string>();

    const visit = (fileName: string) => {
      if (visited.has(fileName)) return;
      visited.add(fileName);

      const sourceFile = this.loadModule(fileName);
      if (!sourceFile) return;

      const dependencies: string[] = [];

      const findImports = (node: ts.Node) => {
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
          const moduleSpecifier = node.moduleSpecifier;
          if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
            const resolved = this.resolveModule(moduleSpecifier.text, fileName);
            if (resolved) {
              dependencies.push(resolved.resolvedFileName);
              visit(resolved.resolvedFileName);
            }
          }
        }

        ts.forEachChild(node, findImports);
      };

      findImports(sourceFile);
      graph.set(fileName, dependencies);
    };

    visit(rootFile);
    return graph;
  }
}

// ===== COMMONJS TO ESM TRANSFORMER =====
class CommonJSToESMTransformer {
  transform: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        // Transform require() calls to imports
        if (ts.isCallExpression(node) && 
            ts.isIdentifier(node.expression) && 
            node.expression.text === 'require') {
          
          return this.transformRequireCall(node);
        }

        // Transform module.exports to export
        if (ts.isBinaryExpression(node) &&
            ts.isPropertyAccessExpression(node.left) &&
            ts.isIdentifier(node.left.expression) &&
            node.left.expression.text === 'module' &&
            node.left.name.text === 'exports') {
          
          return this.transformModuleExports(node);
        }

        // Transform exports.* assignments
        if (ts.isBinaryExpression(node) &&
            ts.isPropertyAccessExpression(node.left) &&
            ts.isIdentifier(node.left.expression) &&
            node.left.expression.text === 'exports') {
          
          return this.transformExportsAssignment(node);
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };

  private transformRequireCall(node: ts.CallExpression): ts.ImportDeclaration {
    const moduleSpecifier = node.arguments[0] as ts.StringLiteral;
    
    // Generate import declaration
    // This is simplified - you'd need to track how the require result is used
    return ts.factory.createImportDeclaration(
      undefined,
      undefined,
      ts.factory.createImportClause(
        false,
        ts.factory.createIdentifier('_import'),
        undefined
      ),
      moduleSpecifier
    );
  }

  private transformModuleExports(node: ts.BinaryExpression): ts.ExportAssignment {
    return ts.factory.createExportAssignment(
      undefined,
      undefined,
      false,
      node.right
    );
  }

  private transformExportsAssignment(node: ts.BinaryExpression): ts.ExportDeclaration {
    const propertyAccess = node.left as ts.PropertyAccessExpression;
    const propertyName = propertyAccess.name.text;

    // Create named export
    return ts.factory.createExportDeclaration(
      undefined,
      undefined,
      false,
      ts.factory.createNamedExports([
        ts.factory.createExportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier(propertyName)
        )
      ]),
      undefined
    );
  }
}

// ===== ESM TO COMMONJS TRANSFORMER =====
class ESMToCommonJSTransformer {
  transform: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
      const statements: ts.Statement[] = [];
      
      const visitor = (node: ts.Node): ts.Node | ts.Node[] | undefined => {
        // Transform import declarations
        if (ts.isImportDeclaration(node)) {
          return this.transformImportDeclaration(node);
        }

        // Transform export declarations
        if (ts.isExportDeclaration(node)) {
          return this.transformExportDeclaration(node);
        }

        // Transform export assignments
        if (ts.isExportAssignment(node)) {
          return this.transformExportAssignment(node);
        }

        return ts.visitEachChild(node, visitor, context);
      };

      const transformedStatements = sourceFile.statements.map(statement => {
        const result = visitor(statement);
        if (Array.isArray(result)) {
          return result;
        }
        return result || statement;
      }).flat();

      return ts.factory.createSourceFile(
        transformedStatements,
        sourceFile.endOfFileToken,
        sourceFile.flags
      );
    };
  };

  private transformImportDeclaration(node: ts.ImportDeclaration): ts.Statement[] {
    const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
    const statements: ts.Statement[] = [];

    if (node.importClause) {
      // Default import: import foo from 'module'
      if (node.importClause.name) {
        statements.push(
          ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList([
              ts.factory.createVariableDeclaration(
                node.importClause.name,
                undefined,
                undefined,
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier('require'),
                  undefined,
                  [moduleSpecifier]
                )
              )
            ], ts.NodeFlags.Const)
          )
        );
      }

      // Named imports: import { a, b } from 'module'
      if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
        const namedImports = node.importClause.namedBindings;
        
        // Create destructuring assignment
        const bindingPattern = ts.factory.createObjectBindingPattern(
          namedImports.elements.map(element => 
            ts.factory.createBindingElement(
              undefined,
              element.propertyName,
              element.name
            )
          )
        );

        statements.push(
          ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList([
              ts.factory.createVariableDeclaration(
                bindingPattern,
                undefined,
                undefined,
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier('require'),
                  undefined,
                  [moduleSpecifier]
                )
              )
            ], ts.NodeFlags.Const)
          )
        );
      }

      // Namespace import: import * as foo from 'module'
      if (node.importClause.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) {
        const namespaceImport = node.importClause.namedBindings;
        
        statements.push(
          ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList([
              ts.factory.createVariableDeclaration(
                namespaceImport.name,
                undefined,
                undefined,
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier('require'),
                  undefined,
                  [moduleSpecifier]
                )
              )
            ], ts.NodeFlags.Const)
          )
        );
      }
    } else {
      // Side-effect import: import 'module'
      statements.push(
        ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createIdentifier('require'),
            undefined,
            [moduleSpecifier]
          )
        )
      );
    }

    return statements;
  }

  private transformExportDeclaration(node: ts.ExportDeclaration): ts.Statement[] {
    const statements: ts.Statement[] = [];

    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      // Named exports: export { a, b }
      for (const element of node.exportClause.elements) {
        const exportName = element.name.text;
        const localName = element.propertyName?.text || exportName;

        statements.push(
          ts.factory.createExpressionStatement(
            ts.factory.createBinaryExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier('exports'),
                exportName
              ),
              ts.SyntaxKind.EqualsToken,
              ts.factory.createIdentifier(localName)
            )
          )
        );
      }
    }

    if (node.moduleSpecifier) {
      // Re-export: export * from 'module' or export { a } from 'module'
      const requireCall = ts.factory.createCallExpression(
        ts.factory.createIdentifier('require'),
        undefined,
        [node.moduleSpecifier as ts.StringLiteral]
      );

      if (!node.exportClause) {
        // export * from 'module'
        statements.push(
          ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier('Object'),
                'assign'
              ),
              undefined,
              [ts.factory.createIdentifier('exports'), requireCall]
            )
          )
        );
      }
    }

    return statements;
  }

  private transformExportAssignment(node: ts.ExportAssignment): ts.Statement {
    if (node.isExportEquals) {
      // export = expression
      return ts.factory.createExpressionStatement(
        ts.factory.createBinaryExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('module'),
            'exports'
          ),
          ts.SyntaxKind.EqualsToken,
          node.expression
        )
      );
    } else {
      // export default expression
      return ts.factory.createExpressionStatement(
        ts.factory.createBinaryExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('exports'),
            'default'
          ),
          ts.SyntaxKind.EqualsToken,
          node.expression
        )
      );
    }
  }
}

// ===== MODULE BUNDLER =====
class SimpleBundler {
  private resolver: ModuleResolver;
  private transformers: ts.TransformerFactory<ts.SourceFile>[] = [];

  constructor(compilerOptions: ts.CompilerOptions = {}) {
    this.resolver = new ModuleResolver(compilerOptions);
  }

  addTransformer(transformer: ts.TransformerFactory<ts.SourceFile>): this {
    this.transformers.push(transformer);
    return this;
  }

  bundle(entryPoint: string): {
    bundledCode: string;
    dependencies: string[];
    size: number;
  } {
    const dependencyGraph = this.resolver.getDependencyGraph(entryPoint);
    const sortedModules = this.topologicalSort(dependencyGraph);
    
    let bundledCode = '';
    const dependencies: string[] = [];

    // Module wrapper function
    bundledCode += '(function(modules) {\n';
    bundledCode += '  const moduleCache = {};\n';
    bundledCode += '  function require(id) {\n';
    bundledCode += '    if (moduleCache[id]) return moduleCache[id].exports;\n';
    bundledCode += '    const module = moduleCache[id] = { exports: {} };\n';
    bundledCode += '    modules[id](module, module.exports, require);\n';
    bundledCode += '    return module.exports;\n';
    bundledCode += '  }\n';
    bundledCode += '  return require(0);\n';
    bundledCode += '}){\n';

    // Add modules
    for (let i = 0; i < sortedModules.length; i++) {
      const modulePath = sortedModules[i];
      const sourceFile = this.resolver.loadModule(modulePath);
      
      if (sourceFile) {
        dependencies.push(modulePath);
        
        // Transform module
        let transformedCode = this.transformModule(sourceFile);
        
        bundledCode += \`  \${i}: function(module, exports, require) {\n\`;
        bundledCode += this.indentCode(transformedCode, 4);
        bundledCode += '  },\n';
      }
    }

    bundledCode += '});';

    return {
      bundledCode,
      dependencies,
      size: bundledCode.length
    };
  }

  private transformModule(sourceFile: ts.SourceFile): string {
    if (this.transformers.length === 0) {
      return sourceFile.getFullText();
    }

    const result = ts.transform(sourceFile, this.transformers);
    const printer = ts.createPrinter();
    return printer.printFile(result.transformed[0]);
  }

  private topologicalSort(graph: Map<string, string[]>): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (node: string) => {
      if (visiting.has(node)) {
        throw new Error(\`Circular dependency detected: \${node}\`);
      }
      if (visited.has(node)) return;

      visiting.add(node);
      const dependencies = graph.get(node) || [];
      
      for (const dep of dependencies) {
        visit(dep);
      }

      visiting.delete(node);
      visited.add(node);
      result.unshift(node); // Add to beginning for correct order
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        visit(node);
      }
    }

    return result;
  }

  private indentCode(code: string, spaces: number): string {
    const indent = ' '.repeat(spaces);
    return code.split('\\n').map(line => indent + line).join('\\n');
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateModuleTransformation(): void {
  console.log('=== Module Transformation Demo ===');

  // ESM to CommonJS transformation
  const esmCode = \`
  import { Component } from 'react';
  import utils from './utils';
  import * as helpers from './helpers';

  export const MyComponent = () => {
    return <div>Hello World</div>;
  };

  export default MyComponent;
  \`;

  console.log('\\n=== Original ESM Code ===');
  console.log(esmCode);

  const esmToCommonJS = new ESMToCommonJSTransformer();
  const sourceFile = ts.createSourceFile('test.ts', esmCode, ts.ScriptTarget.Latest, true);
  
  const result = ts.transform(sourceFile, [esmToCommonJS.transform]);
  const printer = ts.createPrinter();
  const transformedCode = printer.printFile(result.transformed[0]);

  console.log('\\n=== Transformed CommonJS Code ===');
  console.log(transformedCode);

  // Module bundling example
  console.log('\\n=== Module Bundling Example ===');
  const bundler = new SimpleBundler({
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES5
  });

  bundler.addTransformer(esmToCommonJS.transform);

  // Note: In a real scenario, you'd bundle actual files
  console.log('Bundler configured for CommonJS output');
  console.log('Would process entry point and generate bundled output');
}`,

    sourceMapGeneration: `// Source map generation and debugging support

import * as ts from 'typescript';

// ===== SOURCE MAP GENERATOR =====
class SourceMapGenerator {
  private mappings: Array<{
    generated: { line: number; column: number };
    original: { line: number; column: number };
    source: string;
    name?: string;
  }> = [];
  
  private sources: string[] = [];
  private sourcesContent: string[] = [];
  private names: string[] = [];

  addSource(fileName: string, content: string): number {
    const index = this.sources.indexOf(fileName);
    if (index !== -1) return index;

    this.sources.push(fileName);
    this.sourcesContent.push(content);
    return this.sources.length - 1;
  }

  addName(name: string): number {
    const index = this.names.indexOf(name);
    if (index !== -1) return index;

    this.names.push(name);
    return this.names.length - 1;
  }

  addMapping(
    generated: { line: number; column: number },
    original: { line: number; column: number },
    source: string,
    name?: string
  ): void {
    this.mappings.push({
      generated,
      original,
      source,
      name
    });
  }

  generateSourceMap(file: string): {
    version: number;
    sources: string[];
    sourcesContent: string[];
    names: string[];
    mappings: string;
    file: string;
  } {
    // Sort mappings by generated position
    this.mappings.sort((a, b) => {
      if (a.generated.line !== b.generated.line) {
        return a.generated.line - b.generated.line;
      }
      return a.generated.column - b.generated.column;
    });

    return {
      version: 3,
      sources: this.sources,
      sourcesContent: this.sourcesContent,
      names: this.names,
      mappings: this.encodeMappings(),
      file
    };
  }

  private encodeMappings(): string {
    // Simplified VLQ encoding - in production, use proper VLQ library
    let result = '';
    let generatedLine = 0;
    let generatedColumn = 0;
    let sourceIndex = 0;
    let sourceLine = 0;
    let sourceColumn = 0;
    let nameIndex = 0;

    for (const mapping of this.mappings) {
      // Handle line differences
      while (generatedLine < mapping.generated.line) {
        result += ';';
        generatedLine++;
        generatedColumn = 0;
      }

      if (result && result[result.length - 1] !== ';') {
        result += ',';
      }

      // Encode column difference
      result += this.encodeVLQ(mapping.generated.column - generatedColumn);
      generatedColumn = mapping.generated.column;

      // Encode source index
      const currentSourceIndex = this.sources.indexOf(mapping.source);
      result += this.encodeVLQ(currentSourceIndex - sourceIndex);
      sourceIndex = currentSourceIndex;

      // Encode original line difference
      result += this.encodeVLQ(mapping.original.line - sourceLine);
      sourceLine = mapping.original.line;

      // Encode original column difference
      result += this.encodeVLQ(mapping.original.column - sourceColumn);
      sourceColumn = mapping.original.column;

      // Encode name index if present
      if (mapping.name) {
        const currentNameIndex = this.names.indexOf(mapping.name);
        result += this.encodeVLQ(currentNameIndex - nameIndex);
        nameIndex = currentNameIndex;
      }
    }

    return result;
  }

  private encodeVLQ(value: number): string {
    // Simplified VLQ encoding - use proper library in production
    const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    
    let vlq = value < 0 ? ((-value) << 1) + 1 : value << 1;
    let encoded = '';

    do {
      let digit = vlq & 31;
      vlq >>>= 5;
      if (vlq > 0) digit |= 32;
      encoded += BASE64_CHARS[digit];
    } while (vlq > 0);

    return encoded;
  }
}

// ===== TRANSPILER WITH SOURCE MAPS =====
class TranspilerWithSourceMaps {
  private compilerOptions: ts.CompilerOptions;

  constructor(options: ts.CompilerOptions = {}) {
    this.compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      sourceMap: true,
      inlineSourceMap: false,
      ...options
    };
  }

  transpileWithMaps(sourceCode: string, fileName: string): {
    javascript: string;
    sourceMap: string;
    diagnostics: ts.Diagnostic[];
  } {
    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      this.compilerOptions.target || ts.ScriptTarget.ES2020,
      true
    );

    const host = ts.createCompilerHost(this.compilerOptions);
    host.getSourceFile = (name) => name === fileName ? sourceFile : undefined;

    const program = ts.createProgram([fileName], this.compilerOptions, host);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    let javascript = '';
    let sourceMap = '';

    const emitResult = program.emit(
      undefined,
      (emittedFileName, data) => {
        if (emittedFileName.endsWith('.js')) {
          javascript = data;
        } else if (emittedFileName.endsWith('.js.map')) {
          sourceMap = data;
        }
      }
    );

    return {
      javascript,
      sourceMap,
      diagnostics: [...diagnostics, ...emitResult.diagnostics]
    };
  }

  createCustomSourceMap(
    originalCode: string,
    transformedCode: string,
    fileName: string
  ): string {
    const generator = new SourceMapGenerator();
    const sourceIndex = generator.addSource(fileName, originalCode);

    // Simple line-by-line mapping (in practice, you'd track precise positions)
    const originalLines = originalCode.split('\\n');
    const transformedLines = transformedCode.split('\\n');

    let transformedLineIndex = 0;
    
    for (let originalLineIndex = 0; originalLineIndex < originalLines.length; originalLineIndex++) {
      if (transformedLineIndex < transformedLines.length) {
        generator.addMapping(
          { line: transformedLineIndex, column: 0 },
          { line: originalLineIndex, column: 0 },
          fileName
        );
        transformedLineIndex++;
      }
    }

    const sourceMap = generator.generateSourceMap(fileName.replace('.ts', '.js'));
    return JSON.stringify(sourceMap);
  }
}

// ===== SOURCE MAP CONSUMER =====
class SourceMapConsumer {
  private sourceMap: any;
  private sources: Map<string, string> = new Map();

  constructor(sourceMapContent: string) {
    this.sourceMap = JSON.parse(sourceMapContent);
    
    // Load source content
    if (this.sourceMap.sourcesContent) {
      this.sourceMap.sources.forEach((source: string, index: number) => {
        this.sources.set(source, this.sourceMap.sourcesContent[index]);
      });
    }
  }

  getOriginalPosition(line: number, column: number): {
    source: string | null;
    line: number | null;
    column: number | null;
    name: string | null;
  } {
    // Simplified mapping lookup - use proper source map library in production
    const mappings = this.decodeMappings();
    
    for (const mapping of mappings) {
      if (mapping.generated.line === line && 
          mapping.generated.column <= column &&
          (mapping.nextGeneratedColumn === undefined || column < mapping.nextGeneratedColumn)) {
        
        return {
          source: mapping.source,
          line: mapping.original.line,
          column: mapping.original.column,
          name: mapping.name || null
        };
      }
    }

    return { source: null, line: null, column: null, name: null };
  }

  getSourceContent(source: string): string | null {
    return this.sources.get(source) || null;
  }

  getGeneratedPosition(source: string, line: number, column: number): {
    line: number | null;
    column: number | null;
  } {
    const mappings = this.decodeMappings();
    
    for (const mapping of mappings) {
      if (mapping.source === source &&
          mapping.original.line === line &&
          mapping.original.column <= column) {
        
        return {
          line: mapping.generated.line,
          column: mapping.generated.column
        };
      }
    }

    return { line: null, column: null };
  }

  private decodeMappings(): Array<{
    generated: { line: number; column: number };
    original: { line: number; column: number };
    source: string;
    name?: string;
    nextGeneratedColumn?: number;
  }> {
    // Simplified decoding - use proper VLQ decoder in production
    const mappings = [];
    const lines = this.sourceMap.mappings.split(';');
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const segments = lines[lineIndex].split(',');
      
      for (const segment of segments) {
        if (segment) {
          // Simplified segment parsing
          mappings.push({
            generated: { line: lineIndex, column: 0 },
            original: { line: 0, column: 0 },
            source: this.sourceMap.sources[0] || ''
          });
        }
      }
    }

    return mappings;
  }
}

// ===== DEBUGGING UTILITIES =====
class DebuggingTranspiler {
  private sourceMapGenerator: SourceMapGenerator;
  private compilerOptions: ts.CompilerOptions;

  constructor(options: ts.CompilerOptions = {}) {
    this.compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      sourceMap: true,
      ...options
    };
    this.sourceMapGenerator = new SourceMapGenerator();
  }

  transpileWithDebugging(sourceCode: string, fileName: string): {
    javascript: string;
    sourceMap: string;
    debugInfo: {
      breakpointMapping: Map<number, number>;
      variableMapping: Map<string, string>;
      functionMapping: Map<string, { start: number; end: number }>;
    };
  } {
    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      this.compilerOptions.target || ts.ScriptTarget.ES2020,
      true
    );

    // Add source to generator
    this.sourceMapGenerator.addSource(fileName, sourceCode);

    // Create debugging transformer
    const debugTransformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
      return (sourceFile) => {
        const visit = (node: ts.Node): ts.Node => {
          // Add debugging information
          this.addDebuggingInfo(node, sourceFile);
          return ts.visitEachChild(node, visit, context);
        };

        return ts.visitNode(sourceFile, visit) as ts.SourceFile;
      };
    };

    // Transpile with debugging transformer
    const host = ts.createCompilerHost(this.compilerOptions);
    host.getSourceFile = (name) => name === fileName ? sourceFile : undefined;

    const program = ts.createProgram([fileName], this.compilerOptions, host);

    let javascript = '';
    const emitResult = program.emit(
      undefined,
      (emittedFileName, data) => {
        if (emittedFileName.endsWith('.js')) {
          javascript = data;
        }
      },
      undefined,
      false,
      { before: [debugTransformer] }
    );

    const sourceMap = JSON.stringify(this.sourceMapGenerator.generateSourceMap(
      fileName.replace('.ts', '.js')
    ));

    return {
      javascript,
      sourceMap,
      debugInfo: {
        breakpointMapping: new Map(),
        variableMapping: new Map(),
        functionMapping: new Map()
      }
    };
  }

  private addDebuggingInfo(node: ts.Node, sourceFile: ts.SourceFile): void {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const start = node.getStart(sourceFile);
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(start);
      
      this.sourceMapGenerator.addMapping(
        { line, column: character },
        { line, column: character },
        sourceFile.fileName,
        node.name.text
      );
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const start = node.getStart(sourceFile);
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(start);
      
      this.sourceMapGenerator.addMapping(
        { line, column: character },
        { line, column: character },
        sourceFile.fileName,
        node.name.text
      );
    }
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateSourceMapGeneration(): void {
  console.log('=== Source Map Generation Demo ===');

  const sourceCode = \`
function greet(name: string): string {
  const message = \`Hello, \${name}!\`;
  return message;
}

class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
const result = calc.add(5, 3);
console.log(greet("TypeScript"));
  \`;

  const transpiler = new TranspilerWithSourceMaps({
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    sourceMap: true
  });

  const result = transpiler.transpileWithMaps(sourceCode, 'example.ts');

  console.log('\\n=== Generated JavaScript ===');
  console.log(result.javascript);

  console.log('\\n=== Source Map ===');
  const sourceMapObj = JSON.parse(result.sourceMap);
  console.log(\`Sources: \${sourceMapObj.sources.join(', ')}\`);
  console.log(\`Names: \${sourceMapObj.names.join(', ')}\`);
  console.log(\`Mappings: \${sourceMapObj.mappings.substring(0, 100)}...\`);

  // Demonstrate source map consumption
  console.log('\\n=== Source Map Usage ===');
  const consumer = new SourceMapConsumer(result.sourceMap);
  
  // Look up original position for generated line 3, column 10
  const originalPos = consumer.getOriginalPosition(3, 10);
  console.log(\`Generated position (3,10) maps to original: \${JSON.stringify(originalPos)}\`);

  // Demonstrate debugging transpiler
  console.log('\\n=== Debug Transpiler ===');
  const debugTranspiler = new DebuggingTranspiler({
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS
  });

  const debugResult = debugTranspiler.transpileWithDebugging(sourceCode, 'debug.ts');
  console.log('Debug transpilation completed');
  console.log(\`JavaScript length: \${debugResult.javascript.length}\`);
  console.log(\`Source map length: \${debugResult.sourceMap.length}\`);
}`,

    advanced: `// Advanced transpilation techniques and optimizations

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ===== INCREMENTAL TRANSPILER =====
class IncrementalTranspiler {
  private compilerOptions: ts.CompilerOptions;
  private cache = new Map<string, {
    hash: string;
    result: {
      javascript: string;
      sourceMap?: string;
      diagnostics: ts.Diagnostic[];
    };
    dependencies: string[];
    lastModified: number;
  }>();
  private dependencyGraph = new Map<string, Set<string>>();

  constructor(options: ts.CompilerOptions = {}) {
    this.compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      incremental: true,
      tsBuildInfoFile: '.tsbuildinfo',
      ...options
    };
  }

  transpile(files: string[]): Map<string, {
    javascript: string;
    sourceMap?: string;
    diagnostics: ts.Diagnostic[];
    fromCache: boolean;
  }> {
    const results = new Map();
    const filesToProcess: string[] = [];

    // Check which files need recompilation
    for (const file of files) {
      if (this.needsRecompilation(file)) {
        filesToProcess.push(file);
      } else {
        const cached = this.cache.get(file)!;
        results.set(file, { ...cached.result, fromCache: true });
      }
    }

    if (filesToProcess.length === 0) {
      return results;
    }

    // Find all affected files (dependents)
    const affectedFiles = this.findAffectedFiles(filesToProcess);
    const allFilesToProcess = [...new Set([...filesToProcess, ...affectedFiles])];

    // Transpile affected files
    const host = this.createIncrementalCompilerHost(allFilesToProcess);
    const program = ts.createIncrementalProgram({
      rootNames: allFilesToProcess,
      options: this.compilerOptions,
      host
    });

    const diagnostics = ts.getPreEmitDiagnostics(program.getProgram());

    // Emit and cache results
    for (const file of allFilesToProcess) {
      let javascript = '';
      let sourceMap: string | undefined;

      program.emit(
        program.getSourceFile(file),
        (fileName, data) => {
          if (fileName.endsWith('.js')) {
            javascript = data;
          } else if (fileName.endsWith('.js.map')) {
            sourceMap = data;
          }
        }
      );

      const result = {
        javascript,
        sourceMap,
        diagnostics: diagnostics.filter(d => d.file?.fileName === file)
      };

      // Update cache
      this.updateCache(file, result);
      results.set(file, { ...result, fromCache: false });
    }

    return results;
  }

  private needsRecompilation(file: string): boolean {
    if (!this.cache.has(file)) return true;
    if (!fs.existsSync(file)) return true;

    const cached = this.cache.get(file)!;
    const stats = fs.statSync(file);
    
    if (stats.mtimeMs > cached.lastModified) return true;

    // Check if dependencies changed
    for (const dep of cached.dependencies) {
      if (this.needsRecompilation(dep)) return true;
    }

    const currentHash = this.getFileHash(file);
    return currentHash !== cached.hash;
  }

  private findAffectedFiles(changedFiles: string[]): string[] {
    const affected = new Set<string>();

    const addAffected = (file: string) => {
      const dependents = this.dependencyGraph.get(file) || new Set();
      for (const dependent of dependents) {
        if (!affected.has(dependent)) {
          affected.add(dependent);
          addAffected(dependent);
        }
      }
    };

    for (const file of changedFiles) {
      addAffected(file);
    }

    return Array.from(affected);
  }

  private updateCache(file: string, result: any): void {
    const hash = this.getFileHash(file);
    const dependencies = this.extractDependencies(file);
    
    this.cache.set(file, {
      hash,
      result,
      dependencies,
      lastModified: Date.now()
    });

    // Update dependency graph
    this.updateDependencyGraph(file, dependencies);
  }

  private getFileHash(file: string): string {
    const content = fs.readFileSync(file, 'utf-8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private extractDependencies(file: string): string[] {
    const content = fs.readFileSync(file, 'utf-8');
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
    const dependencies: string[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const resolved = this.resolveModulePath(node.moduleSpecifier.text, file);
        if (resolved) dependencies.push(resolved);
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return dependencies;
  }

  private resolveModulePath(moduleName: string, containingFile: string): string | null {
    if (moduleName.startsWith('.')) {
      const resolved = path.resolve(path.dirname(containingFile), moduleName);
      const extensions = ['.ts', '.tsx', '.js', '.jsx'];
      
      for (const ext of extensions) {
        const fullPath = resolved + ext;
        if (fs.existsSync(fullPath)) return fullPath;
      }
    }
    return null;
  }

  private updateDependencyGraph(file: string, dependencies: string[]): void {
    // Remove old dependencies
    for (const [dep, dependents] of this.dependencyGraph) {
      dependents.delete(file);
    }

    // Add new dependencies
    for (const dep of dependencies) {
      if (!this.dependencyGraph.has(dep)) {
        this.dependencyGraph.set(dep, new Set());
      }
      this.dependencyGraph.get(dep)!.add(file);
    }
  }

  private createIncrementalCompilerHost(files: string[]): ts.CompilerHost {
    const host = ts.createIncrementalCompilerHost(this.compilerOptions);
    
    // Cache source files
    const sourceFileCache = new Map<string, ts.SourceFile>();
    
    const originalGetSourceFile = host.getSourceFile;
    host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
      if (!shouldCreateNewSourceFile && sourceFileCache.has(fileName)) {
        return sourceFileCache.get(fileName);
      }
      
      const sourceFile = originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
      if (sourceFile) {
        sourceFileCache.set(fileName, sourceFile);
      }
      return sourceFile;
    };

    return host;
  }

  getCacheStats(): {
    totalFiles: number;
    cachedFiles: number;
    cacheHitRate: number;
  } {
    return {
      totalFiles: this.cache.size,
      cachedFiles: this.cache.size,
      cacheHitRate: this.cache.size > 0 ? 1.0 : 0
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.dependencyGraph.clear();
  }
}

// ===== OPTIMIZATION TRANSFORMER =====
class OptimizationTransformer {
  static createDeadCodeEliminationTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context) => {
      return (sourceFile) => {
        const usedIdentifiers = new Set<string>();

        // First pass: collect used identifiers
        const collectUsed = (node: ts.Node) => {
          if (ts.isIdentifier(node) && !ts.isDeclaration(node.parent!)) {
            usedIdentifiers.add(node.text);
          }
          ts.forEachChild(node, collectUsed);
        };
        collectUsed(sourceFile);

        // Second pass: remove unused declarations
        const visitor = (node: ts.Node): ts.Node | undefined => {
          if (ts.isVariableStatement(node)) {
            const filteredDeclarations = node.declarationList.declarations.filter(decl => {
              if (ts.isIdentifier(decl.name)) {
                return usedIdentifiers.has(decl.name.text);
              }
              return true;
            });

            if (filteredDeclarations.length === 0) return undefined;
            
            if (filteredDeclarations.length < node.declarationList.declarations.length) {
              return ts.factory.createVariableStatement(
                node.modifiers,
                ts.factory.createVariableDeclarationList(
                  filteredDeclarations,
                  node.declarationList.flags
                )
              );
            }
          }

          if (ts.isFunctionDeclaration(node) && node.name) {
            if (!usedIdentifiers.has(node.name.text)) {
              return undefined;
            }
          }

          return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
      };
    };
  }

  static createConstantFoldingTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context) => {
      return (sourceFile) => {
        const visitor = (node: ts.Node): ts.Node => {
          if (ts.isBinaryExpression(node)) {
            const left = node.left;
            const right = node.right;
            const operator = node.operatorToken;

            if (ts.isNumericLiteral(left) && ts.isNumericLiteral(right)) {
              const leftVal = parseFloat(left.text);
              const rightVal = parseFloat(right.text);
              let result: number;

              switch (operator.kind) {
                case ts.SyntaxKind.PlusToken:
                  result = leftVal + rightVal;
                  break;
                case ts.SyntaxKind.MinusToken:
                  result = leftVal - rightVal;
                  break;
                case ts.SyntaxKind.AsteriskToken:
                  result = leftVal * rightVal;
                  break;
                case ts.SyntaxKind.SlashToken:
                  result = leftVal / rightVal;
                  break;
                default:
                  return ts.visitEachChild(node, visitor, context);
              }

              return ts.factory.createNumericLiteral(result.toString());
            }
          }

          return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
      };
    };
  }

  static createInliningTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context) => {
      return (sourceFile) => {
        const inlinableFunctions = new Map<string, ts.ArrowFunction | ts.FunctionExpression>();

        // Collect inlinable functions
        const collectInlinable = (node: ts.Node) => {
          if (ts.isVariableDeclaration(node) &&
              ts.isIdentifier(node.name) &&
              node.initializer &&
              (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
            
            // Only inline simple functions
            if (this.isSimpleFunction(node.initializer)) {
              inlinableFunctions.set(node.name.text, node.initializer);
            }
          }
          ts.forEachChild(node, collectInlinable);
        };
        collectInlinable(sourceFile);

        // Inline function calls
        const visitor = (node: ts.Node): ts.Node => {
          if (ts.isCallExpression(node) &&
              ts.isIdentifier(node.expression) &&
              inlinableFunctions.has(node.expression.text)) {
            
            const func = inlinableFunctions.get(node.expression.text)!;
            return this.inlineFunction(func, node.arguments);
          }

          return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
      };
    };
  }

  private static isSimpleFunction(func: ts.ArrowFunction | ts.FunctionExpression): boolean {
    if (ts.isArrowFunction(func)) {
      return !ts.isBlock(func.body); // Only inline expression bodies
    }
    if (ts.isFunctionExpression(func) && func.body) {
      return func.body.statements.length === 1 && ts.isReturnStatement(func.body.statements[0]);
    }
    return false;
  }

  private static inlineFunction(
    func: ts.ArrowFunction | ts.FunctionExpression,
    args: ts.NodeArray<ts.Expression>
  ): ts.Expression {
    // Simple inlining - replace parameters with arguments
    if (ts.isArrowFunction(func) && !ts.isBlock(func.body)) {
      let expression = func.body;
      
      // Replace parameter references with arguments
      for (let i = 0; i < func.parameters.length && i < args.length; i++) {
        const param = func.parameters[i];
        if (ts.isIdentifier(param.name)) {
          expression = this.replaceIdentifier(expression, param.name.text, args[i]);
        }
      }
      
      return expression;
    }

    // Fallback - return the original call
    return ts.factory.createCallExpression(func, undefined, args);
  }

  private static replaceIdentifier(node: ts.Node, identifier: string, replacement: ts.Expression): any {
    if (ts.isIdentifier(node) && node.text === identifier) {
      return replacement;
    }

    return ts.visitEachChild(node, child => this.replaceIdentifier(child, identifier, replacement), undefined);
  }
}

// ===== PERFORMANCE MONITORING =====
class TranspilationProfiler {
  private timings = new Map<string, number[]>();
  private memoryUsage = new Map<string, number[]>();

  startTiming(label: string): () => void {
    const start = process.hrtime.bigint();
    const startMemory = process.memoryUsage().heapUsed;

    return () => {
      const end = process.hrtime.bigint();
      const endMemory = process.memoryUsage().heapUsed;
      
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      const memoryDelta = endMemory - startMemory;

      if (!this.timings.has(label)) {
        this.timings.set(label, []);
        this.memoryUsage.set(label, []);
      }

      this.timings.get(label)!.push(duration);
      this.memoryUsage.get(label)!.push(memoryDelta);
    };
  }

  getReport(): {
    timings: Map<string, {
      count: number;
      total: number;
      average: number;
      min: number;
      max: number;
    }>;
    memory: Map<string, {
      count: number;
      total: number;
      average: number;
      min: number;
      max: number;
    }>;
  } {
    const timingReport = new Map();
    const memoryReport = new Map();

    for (const [label, times] of this.timings) {
      timingReport.set(label, {
        count: times.length,
        total: times.reduce((a, b) => a + b, 0),
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times)
      });
    }

    for (const [label, memory] of this.memoryUsage) {
      memoryReport.set(label, {
        count: memory.length,
        total: memory.reduce((a, b) => a + b, 0),
        average: memory.reduce((a, b) => a + b, 0) / memory.length,
        min: Math.min(...memory),
        max: Math.max(...memory)
      });
    }

    return { timings: timingReport, memory: memoryReport };
  }

  reset(): void {
    this.timings.clear();
    this.memoryUsage.clear();
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateAdvancedTranspilation(): void {
  console.log('=== Advanced Transpilation Demo ===');

  // Incremental transpilation
  const incrementalTranspiler = new IncrementalTranspiler({
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS,
    strict: true
  });

  // Mock file system for demo
  const mockFiles = ['file1.ts', 'file2.ts', 'file3.ts'];
  console.log(\`\\n=== Incremental Transpilation ===\`);
  console.log(\`Would process files: \${mockFiles.join(', ')}\`);
  
  const cacheStats = incrementalTranspiler.getCacheStats();
  console.log(\`Cache stats - Total: \${cacheStats.totalFiles}, Hit rate: \${(cacheStats.cacheHitRate * 100).toFixed(1)}%\`);

  // Optimization transformers
  console.log(\`\\n=== Optimization Transformers Demo ===\`);
  
  const codeToOptimize = \`
  const unused = 42;
  const x = 10;
  const y = 20;
  const result = x + y; // Should be folded to 30
  
  function unusedFunction() {
    return "never called";
  }
  
  const add = (a, b) => a + b;
  const sum = add(5, 3); // Could be inlined
  
  console.log(result);
  \`;

  const sourceFile = ts.createSourceFile('optimize.ts', codeToOptimize, ts.ScriptTarget.Latest, true);
  
  const optimizationTransformers = [
    OptimizationTransformer.createDeadCodeEliminationTransformer(),
    OptimizationTransformer.createConstantFoldingTransformer(),
    OptimizationTransformer.createInliningTransformer()
  ];

  const result = ts.transform(sourceFile, optimizationTransformers);
  const printer = ts.createPrinter();
  const optimizedCode = printer.printFile(result.transformed[0]);

  console.log('Original code:');
  console.log(codeToOptimize);
  console.log('\\nOptimized code:');
  console.log(optimizedCode);

  // Performance profiling
  console.log(\`\\n=== Performance Profiling ===\`);
  const profiler = new TranspilationProfiler();
  
  const endTiming = profiler.startTiming('transpilation');
  
  // Simulate transpilation work
  setTimeout(() => {
    endTiming();
    
    const report = profiler.getReport();
    for (const [label, stats] of report.timings) {
      console.log(\`\${label}: \${stats.average.toFixed(2)}ms average (\${stats.count} runs)\`);
    }
  }, 100);

  console.log('Performance profiling started (async)...');
}`
  },

  keyPoints: [
    "TypeScript transpilation converts TypeScript source code to executable JavaScript",
    "Custom transformers enable powerful code modifications during compilation",
    "Source maps preserve debugging information linking generated code to original TypeScript",
    "Module system transformations handle different import/export patterns (ESM, CommonJS)",
    "Optimization transformers can eliminate dead code, fold constants, and inline functions",
    "Incremental transpilation improves performance by caching unchanged compilation results",
    "Batch transpilation processes entire projects with proper dependency resolution",
    "Advanced transpilers support minification, bundling, and code splitting",
    "Debug information generation enables rich development experiences with breakpoints",
    "Watch mode enables automatic recompilation when source files change"
  ]
};