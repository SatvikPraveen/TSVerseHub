// File: tests/concepts/compiler-api.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import * as ts from 'typescript';

describe('TypeScript Compiler API', () => {
  describe('Creating and Manipulating AST Nodes', () => {
    it('should create basic AST nodes', () => {
      const factory = ts.factory;
      
      // Create a simple variable declaration: const x = 42;
      const variableDeclaration = factory.createVariableDeclaration(
        'x',
        undefined,
        undefined,
        factory.createNumericLiteral('42')
      );
      
      const variableStatement = factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [variableDeclaration],
          ts.NodeFlags.Const
        )
      );
      
      expect(variableDeclaration.name.getText()).toContain('x');
      expect(ts.isVariableStatement(variableStatement)).toBe(true);
    });

    it('should create function declarations', () => {
      const factory = ts.factory;
      
      // Create: function add(a: number, b: number): number { return a + b; }
      const parameter1 = factory.createParameterDeclaration(
        undefined,
        undefined,
        'a',
        undefined,
        factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
      );
      
      const parameter2 = factory.createParameterDeclaration(
        undefined,
        undefined,
        'b',
        undefined,
        factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
      );
      
      const returnStatement = factory.createReturnStatement(
        factory.createBinaryExpression(
          factory.createIdentifier('a'),
          ts.SyntaxKind.PlusToken,
          factory.createIdentifier('b')
        )
      );
      
      const functionDeclaration = factory.createFunctionDeclaration(
        undefined,
        undefined,
        'add',
        undefined,
        [parameter1, parameter2],
        factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        factory.createBlock([returnStatement])
      );
      
      expect(functionDeclaration.name?.getText()).toContain('add');
      expect(functionDeclaration.parameters.length).toBe(2);
      expect(ts.isFunctionDeclaration(functionDeclaration)).toBe(true);
    });
  });

  describe('Source File Creation and Parsing', () => {
    it('should create and parse source files', () => {
      const sourceCode = `
        interface User {
          name: string;
          age: number;
        }
        
        function greet(user: User): string {
          return \`Hello, \${user.name}!\`;
        }
        
        const user: User = { name: 'John', age: 30 };
        console.log(greet(user));
      `;
      
      const sourceFile = ts.createSourceFile(
        'test.ts',
        sourceCode,
        ts.ScriptTarget.ES2020,
        true
      );
      
      expect(sourceFile.fileName).toBe('test.ts');
      expect(sourceFile.statements.length).toBe(4); // interface, function, const, expression statement
      expect(ts.isSourceFile(sourceFile)).toBe(true);
      
      // Check if first statement is an interface declaration
      const firstStatement = sourceFile.statements[0];
      expect(ts.isInterfaceDeclaration(firstStatement)).toBe(true);
    });

    it('should traverse AST nodes', () => {
      const sourceCode = `
        class Calculator {
          add(a: number, b: number): number {
            return a + b;
          }
        }
      `;
      
      const sourceFile = ts.createSourceFile(
        'calculator.ts',
        sourceCode,
        ts.ScriptTarget.ES2020,
        true
      );
      
      const identifiers: string[] = [];
      
      function visit(node: ts.Node) {
        if (ts.isIdentifier(node)) {
          identifiers.push(node.text);
        }
        ts.forEachChild(node, visit);
      }
      
      visit(sourceFile);
      
      expect(identifiers).toContain('Calculator');
      expect(identifiers).toContain('add');
      expect(identifiers).toContain('a');
      expect(identifiers).toContain('b');
    });
  });

  describe('Type Checker Integration', () => {
    it('should create program and type checker', () => {
      const sourceCode = `
        export interface Person {
          name: string;
          age: number;
        }
        
        export function createPerson(name: string, age: number): Person {
          return { name, age };
        }
      `;
      
      // Create in-memory file system
      const files = new Map<string, string>();
      files.set('person.ts', sourceCode);
      
      const compilerHost: ts.CompilerHost = {
        getSourceFile: (fileName) => {
          const content = files.get(fileName);
          if (content) {
            return ts.createSourceFile(fileName, content, ts.ScriptTarget.ES2020, true);
          }
          return undefined;
        },
        writeFile: () => {},
        getCurrentDirectory: () => '',
        getDirectories: () => [],
        fileExists: (fileName) => files.has(fileName),
        readFile: (fileName) => files.get(fileName),
        getCanonicalFileName: (fileName) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => '\n'
      };
      
      const program = ts.createProgram(['person.ts'], {}, compilerHost);
      const typeChecker = program.getTypeChecker();
      const sourceFile = program.getSourceFile('person.ts');
      
      expect(program.getSourceFiles().length).toBeGreaterThan(0);
      expect(typeChecker).toBeDefined();
      expect(sourceFile).toBeDefined();
    });

    it('should analyze types and symbols', () => {
      const sourceCode = `
        interface User {
          id: number;
          name: string;
          email?: string;
        }
        
        const user: User = {
          id: 1,
          name: 'John Doe'
        };
      `;
      
      const sourceFile = ts.createSourceFile(
        'user.ts',
        sourceCode,
        ts.ScriptTarget.ES2020,
        true
      );
      
      // Find interface declaration
      let interfaceDeclaration: ts.InterfaceDeclaration | undefined;
      
      function findInterface(node: ts.Node) {
        if (ts.isInterfaceDeclaration(node) && node.name.text === 'User') {
          interfaceDeclaration = node;
        }
        ts.forEachChild(node, findInterface);
      }
      
      findInterface(sourceFile);
      
      expect(interfaceDeclaration).toBeDefined();
      expect(interfaceDeclaration?.name.text).toBe('User');
      expect(interfaceDeclaration?.members.length).toBe(3);
    });
  });

  describe('Code Transformations', () => {
    it('should transform AST nodes', () => {
      const sourceCode = `
        const message = "Hello World";
        console.log(message);
      `;
      
      const sourceFile = ts.createSourceFile(
        'test.ts',
        sourceCode,
        ts.ScriptTarget.ES2020,
        true
      );
      
      // Transform all string literals to uppercase
      const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        return (rootNode) => {
          function visit(node: ts.Node): ts.Node {
            if (ts.isStringLiteral(node)) {
              return ts.factory.createStringLiteral(node.text.toUpperCase());
            }
            return ts.visitEachChild(node, visit, context);
          }
          return ts.visitNode(rootNode, visit);
        };
      };
      
      const transformationResult = ts.transform(sourceFile, [transformer]);
      const transformedSourceFile = transformationResult.transformed[0];
      
      expect(transformedSourceFile).toBeDefined();
      transformationResult.dispose();
    });

    it('should add decorators to class methods', () => {
      const factory = ts.factory;
      
      // Create a method without decorators
      const method = factory.createMethodDeclaration(
        undefined,
        undefined,
        'testMethod',
        undefined,
        undefined,
        [],
        undefined,
        factory.createBlock([])
      );
      
      // Create a decorator @deprecated
      const decorator = factory.createDecorator(
        factory.createIdentifier('deprecated')
      );
      
      // Add decorator to method
      const decoratedMethod = factory.updateMethodDeclaration(
        method,
        [decorator],
        method.modifiers,
        method.asteriskToken,
        method.name,
        method.questionToken,
        method.typeParameters,
        method.parameters,
        method.type,
        method.body
      );
      
      expect(decoratedMethod.decorators?.length).toBe(1);
      expect(ts.isMethodDeclaration(decoratedMethod)).toBe(true);
    });
  });

  describe('Diagnostic and Error Handling', () => {
    it('should detect syntax errors', () => {
      // Invalid TypeScript code
      const sourceCode = `
        interface User {
          name: string
          age: number  // Missing semicolon
        }
        
        function greet(user: User): string {
          return "Hello " + user.name
        } // Missing semicolon
        
        const user: User = {
          name: 'John'
          // Missing age property
        };
      `;
      
      const sourceFile = ts.createSourceFile(
        'invalid.ts',
        sourceCode,
        ts.ScriptTarget.ES2020,
        true
      );
      
      // Create program to get diagnostics
      const compilerHost: ts.CompilerHost = {
        getSourceFile: (fileName) => {
          if (fileName === 'invalid.ts') {
            return sourceFile;
          }
          return undefined;
        },
        writeFile: () => {},
        getCurrentDirectory: () => '',
        getDirectories: () => [],
        fileExists: (fileName) => fileName === 'invalid.ts',
        readFile: (fileName) => fileName === 'invalid.ts' ? sourceCode : undefined,
        getCanonicalFileName: (fileName) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => '\n'
      };
      
      const program = ts.createProgram(['invalid.ts'], {
        noEmitOnError: true,
        strict: true
      }, compilerHost);
      
      const diagnostics = ts.getPreEmitDiagnostics(program);
      
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(sourceFile.parseDiagnostics).toBeDefined();
    });

    it('should format diagnostic messages', () => {
      const sourceCode = `
        let x: string = 123; // Type error
      `;
      
      const sourceFile = ts.createSourceFile(
        'error.ts',
        sourceCode,
        ts.ScriptTarget.ES2020,
        true
      );
      
      const compilerHost: ts.CompilerHost = {
        getSourceFile: (fileName) => sourceFile,
        writeFile: () => {},
        getCurrentDirectory: () => '',
        getDirectories: () => [],
        fileExists: () => true,
        readFile: () => sourceCode,
        getCanonicalFileName: (fileName) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => '\n'
      };
      
      const program = ts.createProgram(['error.ts'], {}, compilerHost);
      const diagnostics = ts.getPreEmitDiagnostics(program);
      
      if (diagnostics.length > 0) {
        const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
          getCurrentDirectory: () => '',
          getCanonicalFileName: (fileName) => fileName,
          getNewLine: () => '\n'
        });
        
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Module Resolution', () => {
    it('should resolve module names', () => {
      const moduleResolutionResult = ts.resolveModuleName(
        './utils',
        '/src/index.ts',
        { moduleResolution: ts.ModuleResolutionKind.NodeJs },
        {
          fileExists: (fileName) => {
            return fileName.endsWith('utils.ts') || fileName.endsWith('utils.js');
          },
          readFile: () => 'export const util = "test";'
        }
      );
      
      expect(moduleResolutionResult).toBeDefined();
      // Module resolution results depend on the mock file system
    });

    it('should work with different module formats', () => {
      const compilerOptions: ts.CompilerOptions = {
        module: ts.ModuleKind.ES2020,
        target: ts.ScriptTarget.ES2020,
        moduleResolution: ts.ModuleResolutionKind.NodeJs
      };
      
      expect(compilerOptions.module).toBe(ts.ModuleKind.ES2020);
      expect(compilerOptions.target).toBe(ts.ScriptTarget.ES2020);
      expect(compilerOptions.moduleResolution).toBe(ts.ModuleResolutionKind.NodeJs);
    });
  });

  describe('Language Service Integration', () => {
    it('should create language service host', () => {
      const files = new Map<string, string>();
      files.set('test.ts', 'const x: number = 42;');
      
      const serviceHost: ts.LanguageServiceHost = {
        getScriptFileNames: () => Array.from(files.keys()),
        getScriptVersion: () => '1',
        getScriptSnapshot: (fileName) => {
          const content = files.get(fileName);
          return content ? ts.ScriptSnapshot.fromString(content) : undefined;
        },
        getCurrentDirectory: () => '',
        getCompilationSettings: () => ({ target: ts.ScriptTarget.ES2020 }),
        getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        fileExists: (fileName) => files.has(fileName),
        readFile: (fileName) => files.get(fileName),
        readDirectory: () => Array.from(files.keys())
      };
      
      const languageService = ts.createLanguageService(serviceHost);
      
      expect(languageService).toBeDefined();
      expect(typeof languageService.getProgram).toBe('function');
      expect(typeof languageService.getSemanticDiagnostics).toBe('function');
    });
  });
});