# TypeScript Compiler API Guide
**File Location:** `docs/compiler-api.md`

This guide covers how to use the TypeScript Compiler API to programmatically work with TypeScript code, perform analysis, transformations, and build tools.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Program and Type Checker](#program-and-type-checker)
3. [AST Navigation](#ast-navigation)
4. [Type Information](#type-information)
5. [Transformations](#transformations)
6. [Code Generation](#code-generation)
7. [Language Service](#language-service)
8. [Common Use Cases](#common-use-cases)

## Getting Started

### Installation

```bash
npm install typescript
npm install @types/node  # For Node.js types
```

### Basic Setup

```typescript
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

// Create a simple TypeScript program
function createProgram(filePaths: string[], options: ts.CompilerOptions) {
  return ts.createProgram(filePaths, options);
}

// Example usage
const filePaths = ["./src/example.ts"];
const options: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  strict: true
};

const program = createProgram(filePaths, options);
```

## Program and Type Checker

The Program is the main entry point for working with TypeScript files.

### Creating a Program

```typescript
function createProgramFromConfig(configPath: string) {
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath)
  );

  return ts.createProgram(
    parsedConfig.fileNames,
    parsedConfig.options
  );
}

// Usage
const program = createProgramFromConfig("./tsconfig.json");
const typeChecker = program.getTypeChecker();
```

### Working with Source Files

```typescript
function analyzeSourceFiles(program: ts.Program) {
  const sourceFiles = program.getSourceFiles();
  
  sourceFiles.forEach(sourceFile => {
    if (!sourceFile.isDeclarationFile) {
      console.log(`Analyzing: ${sourceFile.fileName}`);
      visitNode(sourceFile);
    }
  });
}

function visitNode(node: ts.Node) {
  // Process the node
  console.log(`Node: ${ts.SyntaxKind[node.kind]}`);
  
  // Visit children
  ts.forEachChild(node, visitNode);
}
```

## AST Navigation

### Node Types and Visitors

```typescript
function createVisitor(typeChecker: ts.TypeChecker) {
  function visit(node: ts.Node): ts.Node {
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration:
        return visitFunctionDeclaration(node as ts.FunctionDeclaration);
      
      case ts.SyntaxKind.VariableDeclaration:
        return visitVariableDeclaration(node as ts.VariableDeclaration);
      
      case ts.SyntaxKind.ClassDeclaration:
        return visitClassDeclaration(node as ts.ClassDeclaration);
      
      default:
        return ts.visitEachChild(node, visit, undefined);
    }
  }
  
  function visitFunctionDeclaration(node: ts.FunctionDeclaration): ts.Node {
    console.log(`Function: ${node.name?.text}`);
    
    // Get type information
    const signature = typeChecker.getSignatureFromDeclaration(node);
    if (signature) {
      const returnType = typeChecker.getReturnTypeOfSignature(signature);
      console.log(`Return type: ${typeChecker.typeToString(returnType)}`);
    }
    
    return node;
  }
  
  function visitVariableDeclaration(node: ts.VariableDeclaration): ts.Node {
    console.log(`Variable: ${node.name.getText()}`);
    
    const type = typeChecker.getTypeAtLocation(node);
    console.log(`Type: ${typeChecker.typeToString(type)}`);
    
    return node;
  }
  
  function visitClassDeclaration(node: ts.ClassDeclaration): ts.Node {
    console.log(`Class: ${node.name?.text}`);
    
    // Analyze members
    node.members.forEach(member => {
      if (ts.isMethodDeclaration(member)) {
        console.log(`  Method: ${member.name?.getText()}`);
      } else if (ts.isPropertyDeclaration(member)) {
        console.log(`  Property: ${member.name?.getText()}`);
      }
    });
    
    return node;
  }
  
  return visit;
}
```

### Finding Specific Nodes

```typescript
function findNodes<T extends ts.Node>(
  sourceFile: ts.SourceFile,
  kind: ts.SyntaxKind
): T[] {
  const nodes: T[] = [];
  
  function visit(node: ts.Node) {
    if (node.kind === kind) {
      nodes.push(node as T);
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return nodes;
}

// Usage
const functions = findNodes<ts.FunctionDeclaration>(
  sourceFile,
  ts.SyntaxKind.FunctionDeclaration
);

const classes = findNodes<ts.ClassDeclaration>(
  sourceFile,
  ts.SyntaxKind.ClassDeclaration
);
```

## Type Information

### Getting Type Information

```typescript
function analyzeTypes(program: ts.Program) {
  const typeChecker = program.getTypeChecker();
  const sourceFile = program.getSourceFile("example.ts");
  
  if (!sourceFile) return;
  
  function visitNode(node: ts.Node) {
    // Get symbol information
    const symbol = typeChecker.getSymbolAtLocation(node);
    if (symbol) {
      console.log(`Symbol: ${symbol.name}`);
      console.log(`Flags: ${ts.SymbolFlags[symbol.flags]}`);
      
      // Get type information
      const type = typeChecker.getTypeOfSymbolAtLocation(symbol, node);
      console.log(`Type: ${typeChecker.typeToString(type)}`);
      
      // Get documentation
      const docs = symbol.getDocumentationComment(typeChecker);
      if (docs.length > 0) {
        console.log(`Docs: ${ts.displayPartsToString(docs)}`);
      }
    }
    
    ts.forEachChild(node, visitNode);
  }
  
  visitNode(sourceFile);
}
```

### Type Relationships

```typescript
function checkTypeRelationships(typeChecker: ts.TypeChecker) {
  function isAssignableTo(sourceType: ts.Type, targetType: ts.Type): boolean {
    return typeChecker.isTypeAssignableTo(sourceType, targetType);
  }
  
  function getBaseTypes(type: ts.Type): ts.BaseType[] {
    return typeChecker.getBaseTypes(type as ts.InterfaceType) || [];
  }
  
  function getTypeArguments(type: ts.Type): readonly ts.Type[] {
    return typeChecker.getTypeArguments(type as ts.TypeReference) || [];
  }
  
  return { isAssignableTo, getBaseTypes, getTypeArguments };
}
```

## Transformations

### Creating Transformers

```typescript
function createTransformer<T extends ts.Node>(
  typeChecker: ts.TypeChecker
): ts.TransformerFactory<T> {
  return (context: ts.TransformationContext) => {
    return (rootNode: T) => {
      function visit(node: ts.Node): ts.Node {
        // Transform function declarations to add logging
        if (ts.isFunctionDeclaration(node) && node.body) {
          return ts.factory.updateFunctionDeclaration(
            node,
            node.decorators,
            node.modifiers,
            node.asteriskToken,
            node.name,
            node.typeParameters,
            node.parameters,
            node.type,
            addLogging(node.body, node.name?.text)
          );
        }
        
        return ts.visitEachChild(node, visit, context);
      }
      
      return ts.visitNode(rootNode, visit);
    };
  };
}

function addLogging(body: ts.Block, functionName?: string): ts.Block {
  const logStatement = ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("console"),
        ts.factory.createIdentifier("log")
      ),
      undefined,
      [ts.factory.createStringLiteral(`Entering function: ${functionName}`)]
    )
  );
  
  return ts.factory.updateBlock(body, [
    logStatement,
    ...body.statements
  ]);
}
```

### Applying Transformations

```typescript
function transformCode(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker): string {
  const result = ts.transform(sourceFile, [
    createTransformer(typeChecker)
  ]);
  
  const printer = ts.createPrinter();
  return printer.printFile(result.transformed[0] as ts.SourceFile);
}
```

## Code Generation

### Creating AST Nodes

```typescript
function createInterface(name: string, properties: Array<{name: string, type: string}>) {
  return ts.factory.createInterfaceDeclaration(
    undefined, // decorators
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], // modifiers
    ts.factory.createIdentifier(name), // name
    undefined, // type parameters
    undefined, // heritage clauses
    properties.map(prop => 
      ts.factory.createPropertySignature(
        undefined, // modifiers
        ts.factory.createIdentifier(prop.name), // name
        undefined, // question token
        ts.factory.createKeywordTypeNode(
          prop.type === "string" ? ts.SyntaxKind.StringKeyword :
          prop.type === "number" ? ts.SyntaxKind.NumberKeyword :
          ts.SyntaxKind.AnyKeyword
        ) // type
      )
    )
  );
}

// Usage
const userInterface = createInterface("User", [
  { name: "id", type: "number" },
  { name: "name", type: "string" },
  { name: "email", type: "string" }
]);
```

### Printing Code

```typescript
function printNode(node: ts.Node): string {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false
  });
  
  return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

// Usage
console.log(printNode(userInterface));
```

## Language Service

The Language Service provides editor-like functionality.

### Setting Up Language Service

```typescript
function createLanguageService(files: Map<string, string>) {
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => Array.from(files.keys()),
    getScriptVersion: () => "1",
    getScriptSnapshot: (fileName) => {
      const content = files.get(fileName);
      return content ? ts.ScriptSnapshot.fromString(content) : undefined;
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => ({
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS
    }),
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: (path) => files.has(path),
    readFile: (path) => files.get(path),
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories
  };
  
  return ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
}
```

### Using Language Service Features

```typescript
function useLanguageService() {
  const files = new Map([
    ["example.ts", `
      interface User {
        name: string;
        age: number;
      }
      
      function greet(user: User) {
        return \`Hello, \${user.name}!\`;
      }
      
      const user: User = { name: "Alice", age: 30 };
      greet(user);
    `]
  ]);
  
  const service = createLanguageService(files);
  
  // Get completions
  const completions = service.getCompletionsAtPosition("example.ts", 150, {});
  console.log("Completions:", completions?.entries.map(e => e.name));
  
  // Get diagnostics
  const diagnostics = service.getSemanticDiagnostics("example.ts");
  diagnostics.forEach(diag => {
    console.log("Diagnostic:", ts.flattenDiagnosticMessageText(diag.messageText, "\n"));
  });
  
  // Get quick info (hover information)
  const quickInfo = service.getQuickInfoAtPosition("example.ts", 200);
  if (quickInfo) {
    console.log("Quick info:", ts.displayPartsToString(quickInfo.displayParts));
  }
  
  // Get definitions
  const definitions = service.getDefinitionAtPosition("example.ts", 200);
  definitions?.forEach(def => {
    console.log(`Definition: ${def.fileName} at ${def.textSpan.start}`);
  });
  
  // Get references
  const references = service.getReferencesAtPosition("example.ts", 50);
  references?.forEach(ref => {
    console.log(`Reference: ${ref.fileName} at ${ref.textSpan.start}`);
  });
}
```

## Common Use Cases

### 1. Code Analysis Tool

```typescript
function analyzeCodeQuality(program: ts.Program) {
  const typeChecker = program.getTypeChecker();
  const issues: string[] = [];
  
  program.getSourceFiles().forEach(sourceFile => {
    if (sourceFile.isDeclarationFile) return;
    
    function visit(node: ts.Node) {
      // Check for any types
      if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
        const type = typeChecker.getTypeAtLocation(node);
        if (typeChecker.typeToString(type) === "any") {
          issues.push(`'any' type found at ${sourceFile.fileName}:${getLineNumber(sourceFile, node)}`);
        }
      }
      
      // Check for unused variables
      if (ts.isVariableDeclaration(node)) {
        const symbol = typeChecker.getSymbolAtLocation(node.name);
        if (symbol) {
          const references = typeChecker.getReferenceSymbolsAtLocation(node.name);
          if (!references || references.length <= 1) {
            issues.push(`Unused variable '${symbol.name}' at ${sourceFile.fileName}:${getLineNumber(sourceFile, node)}`);
          }
        }
      }
      
      ts.forEachChild(node, visit);
    }
    
    visit(sourceFile);
  });
  
  return issues;
}

function getLineNumber(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
}
```

### 2. Documentation Generator

```typescript
function generateDocumentation(program: ts.Program) {
  const typeChecker = program.getTypeChecker();
  const documentation: any[] = [];
  
  program.getSourceFiles().forEach(sourceFile => {
    if (sourceFile.isDeclarationFile) return;
    
    ts.forEachChild(sourceFile, visit);
    
    function visit(node: ts.Node) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const symbol = typeChecker.getSymbolAtLocation(node.name);
        if (symbol) {
          documentation.push({
            name: symbol.getName(),
            type: "function",
            documentation: ts.displayPartsToString(symbol.getDocumentationComment(typeChecker)),
            parameters: node.parameters.map(param => ({
              name: param.name.getText(),
              type: typeChecker.typeToString(typeChecker.getTypeAtLocation(param))
            })),
            returnType: node.type ? node.type.getText() : "any"
          });
        }
      }
      
      if (ts.isClassDeclaration(node) && node.name) {
        const symbol = typeChecker.getSymbolAtLocation(node.name);
        if (symbol) {
          documentation.push({
            name: symbol.getName(),
            type: "class",
            documentation: ts.displayPartsToString(symbol.getDocumentationComment(typeChecker)),
            members: node.members.map(member => {
              if (ts.isMethodDeclaration(member) && member.name) {
                return {
                  name: member.name.getText(),
                  type: "method"
                };
              }
              if (ts.isPropertyDeclaration(member) && member.name) {
                return {
                  name: member.name.getText(),
                  type: "property"
                };
              }
              return null;
            }).filter(Boolean)
          });
        }
      }
      
      ts.forEachChild(node, visit);
    }
  });
  
  return documentation;
}
```

### 3. Code Refactoring Tool

```typescript
function renameSymbol(
  sourceFile: ts.SourceFile,
  oldName: string,
  newName: string,
  typeChecker: ts.TypeChecker
): string {
  function visit(node: ts.Node): ts.Node {
    if (ts.isIdentifier(node) && node.text === oldName) {
      // Verify this is the symbol we want to rename
      const symbol = typeChecker.getSymbolAtLocation(node);
      if (symbol && symbol.getName() === oldName) {
        return ts.factory.createIdentifier(newName);
      }
    }
    
    return ts.visitEachChild(node, visit, undefined);
  }
  
  const result = ts.transform(sourceFile, [(context) => (rootNode) => ts.visitNode(rootNode, visit)]);
  const printer = ts.createPrinter();
  return printer.printFile(result.transformed[0] as ts.SourceFile);
}
```

## Best Practices

1. **Cache Type Checker**: Create the type checker once and reuse it for better performance.

2. **Use Visitors Pattern**: Implement the visitor pattern for traversing AST nodes systematically.

3. **Handle Source Maps**: When transforming code, preserve source map information for debugging.

4. **Memory Management**: Dispose of programs and transformers when done to prevent memory leaks.

5. **Error Handling**: Always check for undefined/null values when working with optional AST properties.

6. **Performance**: Use `forEachChild` instead of recursive manual traversal for better performance.

## Conclusion

The TypeScript Compiler API provides powerful capabilities for building development tools, analyzers, and code transformation utilities. Understanding these concepts will help you build sophisticated TypeScript tooling.