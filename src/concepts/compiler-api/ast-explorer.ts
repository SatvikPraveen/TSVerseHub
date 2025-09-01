// File location: src/data/concepts/compiler-api/ast-explorer.ts

import * as ts from 'typescript';

export interface ASTExplorerContent {
  title: string;
  description: string;
  codeExamples: {
    basicAST: string;
    nodeTraversal: string;
    nodeTypes: string;
    transformation: string;
    advanced: string;
  };
  keyPoints: string[];
}

export const astExplorerContent: ASTExplorerContent = {
  title: "AST Explorer and Node Traversal",
  description: "Learn how to explore and traverse TypeScript's Abstract Syntax Tree (AST), understand node types, and build tools that analyze and transform code programmatically.",
  
  codeExamples: {
    basicAST: `// Basic AST exploration and understanding

import * as ts from 'typescript';

// ===== CREATING A SOURCE FILE =====
const sourceCode = \`
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

class Person {
  constructor(public name: string, private age: number) {}
  
  getAge(): number {
    return this.age;
  },

  keyPoints: [
    "AST nodes represent the syntactic structure of TypeScript code in tree form",
    "Each node has a specific SyntaxKind that determines its type and properties", 
    "Node traversal can be done using visitors, forEachChild, or custom walking functions",
    "Parent-child relationships provide context for understanding code structure",
    "TypeScript's type checker provides semantic analysis beyond syntactic analysis",
    "Transformers allow systematic modification of AST nodes for code generation",
    "Source file creation requires specifying script target and language version",
    "Node positions and ranges enable precise code location and text extraction",
    "Symbol analysis provides information about declarations, references, and types",
    "AST manipulation is the foundation for building TypeScript tools and refactoring"
  ]
};

interface User {
  id: number;
  name: string;
  email?: string;
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob" }
];
\`;

// Create a TypeScript SourceFile
const sourceFile = ts.createSourceFile(
  'example.ts',
  sourceCode,
  ts.ScriptTarget.Latest,
  true // setParentNodes
);

// ===== BASIC NODE INSPECTION =====
function inspectNode(node: ts.Node, depth: number = 0): void {
  const indent = '  '.repeat(depth);
  const syntaxKind = ts.SyntaxKind[node.kind];
  const nodeText = node.getText(sourceFile).substring(0, 50).replace(/\\n/g, '\\\\n');
  
  console.log(\`\${indent}\${syntaxKind}: "\${nodeText}\${nodeText.length > 50 ? '...' : ''}"\`);
  
  // Print additional information for specific node types
  if (ts.isIdentifier(node)) {
    console.log(\`\${indent}  → Identifier: \${node.text}\`);
  } else if (ts.isStringLiteral(node)) {
    console.log(\`\${indent}  → String Value: \${node.text}\`);
  } else if (ts.isNumericLiteral(node)) {
    console.log(\`\${indent}  → Numeric Value: \${node.text}\`);
  }
  
  // Recursively inspect children (limit depth to avoid overwhelming output)
  if (depth < 3) {
    ts.forEachChild(node, child => inspectNode(child, depth + 1));
  }
}

console.log('=== AST Structure ===');
inspectNode(sourceFile);

// ===== NODE POSITION AND LOCATION =====
function getNodeLocation(node: ts.Node): {
  start: number;
  end: number;
  line: number;
  column: number;
  text: string;
} {
  const sourceFile = node.getSourceFile();
  const start = node.getStart(sourceFile);
  const end = node.getEnd();
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(start);
  
  return {
    start,
    end,
    line: line + 1, // 1-based line numbers
    column: character + 1, // 1-based column numbers
    text: node.getText(sourceFile)
  };
}

// ===== FINDING SPECIFIC NODES =====
function findAllNodes<T extends ts.Node>(
  sourceFile: ts.SourceFile,
  predicate: (node: ts.Node) => node is T
): T[] {
  const result: T[] = [];
  
  function visit(node: ts.Node) {
    if (predicate(node)) {
      result.push(node);
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return result;
}

// Find all function declarations
const functionDeclarations = findAllNodes(sourceFile, ts.isFunctionDeclaration);
console.log('\\n=== Function Declarations ===');
functionDeclarations.forEach(func => {
  const location = getNodeLocation(func);
  console.log(\`Function: \${func.name?.text || '<anonymous>'} at line \${location.line}\`);
});

// Find all class declarations
const classDeclarations = findAllNodes(sourceFile, ts.isClassDeclaration);
console.log('\\n=== Class Declarations ===');
classDeclarations.forEach(cls => {
  const location = getNodeLocation(cls);
  console.log(\`Class: \${cls.name?.text || '<anonymous>'} at line \${location.line}\`);
});

// Find all interface declarations
const interfaceDeclarations = findAllNodes(sourceFile, ts.isInterfaceDeclaration);
console.log('\\n=== Interface Declarations ===');
interfaceDeclarations.forEach(iface => {
  const location = getNodeLocation(iface);
  console.log(\`Interface: \${iface.name.text} at line \${location.line}\`);
});

// ===== ANALYZING NODE PROPERTIES =====
function analyzeFunctionDeclaration(func: ts.FunctionDeclaration): {
  name: string;
  parameters: Array<{ name: string; type: string; optional: boolean }>;
  returnType: string | null;
  isAsync: boolean;
  isExported: boolean;
} {
  const hasExportModifier = func.modifiers?.some(
    mod => mod.kind === ts.SyntaxKind.ExportKeyword
  ) ?? false;
  
  const hasAsyncModifier = func.modifiers?.some(
    mod => mod.kind === ts.SyntaxKind.AsyncKeyword
  ) ?? false;
  
  const parameters = func.parameters.map(param => ({
    name: param.name.getText(sourceFile),
    type: param.type?.getText(sourceFile) || 'any',
    optional: !!param.questionToken
  }));
  
  return {
    name: func.name?.text || '<anonymous>',
    parameters,
    returnType: func.type?.getText(sourceFile) || null,
    isAsync: hasAsyncModifier,
    isExported: hasExportModifier
  };
}

console.log('\\n=== Function Analysis ===');
functionDeclarations.forEach(func => {
  const analysis = analyzeFunctionDeclaration(func);
  console.log(JSON.stringify(analysis, null, 2));
});

// ===== PARENT-CHILD RELATIONSHIPS =====
function getNodeHierarchy(node: ts.Node): string[] {
  const hierarchy: string[] = [];
  let current: ts.Node | undefined = node;
  
  while (current) {
    hierarchy.unshift(ts.SyntaxKind[current.kind]);
    current = current.parent;
  }
  
  return hierarchy;
}

// Find a specific identifier and show its hierarchy
const identifiers = findAllNodes(sourceFile, ts.isIdentifier);
const nameIdentifier = identifiers.find(id => id.text === 'name');

if (nameIdentifier) {
  console.log('\\n=== Node Hierarchy for "name" identifier ===');
  const hierarchy = getNodeHierarchy(nameIdentifier);
  console.log(hierarchy.join(' → '));
}`,

    nodeTraversal: `// Advanced node traversal patterns and utilities

import * as ts from 'typescript';

// ===== VISITOR PATTERN IMPLEMENTATION =====
interface NodeVisitor {
  visitNode?(node: ts.Node): ts.Node | undefined;
  visitSourceFile?(node: ts.SourceFile): ts.SourceFile;
  visitFunctionDeclaration?(node: ts.FunctionDeclaration): ts.Node | undefined;
  visitClassDeclaration?(node: ts.ClassDeclaration): ts.Node | undefined;
  visitInterfaceDeclaration?(node: ts.InterfaceDeclaration): ts.Node | undefined;
  visitVariableStatement?(node: ts.VariableStatement): ts.Node | undefined;
  visitIdentifier?(node: ts.Identifier): ts.Node | undefined;
}

class ASTVisitor implements NodeVisitor {
  visit(node: ts.Node): ts.Node {
    // Check for specific visit methods
    switch (node.kind) {
      case ts.SyntaxKind.SourceFile:
        return this.visitSourceFile?.(node as ts.SourceFile) ?? node;
      case ts.SyntaxKind.FunctionDeclaration:
        return this.visitFunctionDeclaration?.(node as ts.FunctionDeclaration) ?? node;
      case ts.SyntaxKind.ClassDeclaration:
        return this.visitClassDeclaration?.(node as ts.ClassDeclaration) ?? node;
      case ts.SyntaxKind.InterfaceDeclaration:
        return this.visitInterfaceDeclaration?.(node as ts.InterfaceDeclaration) ?? node;
      case ts.SyntaxKind.VariableStatement:
        return this.visitVariableStatement?.(node as ts.VariableStatement) ?? node;
      case ts.SyntaxKind.Identifier:
        return this.visitIdentifier?.(node as ts.Identifier) ?? node;
      default:
        return this.visitNode?.(node) ?? node;
    }
  }

  traverseAndVisit(node: ts.Node): ts.Node {
    const visited = this.visit(node);
    return ts.visitEachChild(visited, child => this.traverseAndVisit(child), undefined);
  }
}

// ===== SYMBOL COLLECTION VISITOR =====
class SymbolCollector extends ASTVisitor {
  private symbols: Map<string, ts.Node[]> = new Map();

  visitFunctionDeclaration(node: ts.FunctionDeclaration): ts.Node {
    this.addSymbol('functions', node);
    return node;
  }

  visitClassDeclaration(node: ts.ClassDeclaration): ts.Node {
    this.addSymbol('classes', node);
    return node;
  }

  visitInterfaceDeclaration(node: ts.InterfaceDeclaration): ts.Node {
    this.addSymbol('interfaces', node);
    return node;
  }

  visitVariableStatement(node: ts.VariableStatement): ts.Node {
    this.addSymbol('variables', node);
    return node;
  }

  private addSymbol(category: string, node: ts.Node): void {
    if (!this.symbols.has(category)) {
      this.symbols.set(category, []);
    }
    this.symbols.get(category)!.push(node);
  }

  getSymbols(): Map<string, ts.Node[]> {
    return new Map(this.symbols);
  }

  reset(): void {
    this.symbols.clear();
  }
}

// ===== DEPENDENCY ANALYZER =====
class DependencyAnalyzer extends ASTVisitor {
  private imports: string[] = [];
  private exports: string[] = [];
  private usedIdentifiers: Set<string> = new Set();

  visitImportDeclaration(node: ts.ImportDeclaration): ts.Node {
    const moduleSpecifier = node.moduleSpecifier.getText().slice(1, -1); // Remove quotes
    this.imports.push(moduleSpecifier);
    return node;
  }

  visitExportDeclaration(node: ts.ExportDeclaration): ts.Node {
    if (node.moduleSpecifier) {
      const moduleSpecifier = node.moduleSpecifier.getText().slice(1, -1);
      this.exports.push(moduleSpecifier);
    }
    return node;
  }

  visitIdentifier(node: ts.Identifier): ts.Node {
    this.usedIdentifiers.add(node.text);
    return node;
  }

  getDependencyReport(): {
    imports: string[];
    exports: string[];
    identifierCount: number;
    mostUsedIdentifiers: Array<{ name: string; count: number }>;
  } {
    const identifierCounts = new Map<string, number>();
    
    for (const id of this.usedIdentifiers) {
      identifierCounts.set(id, (identifierCounts.get(id) || 0) + 1);
    }

    const mostUsed = Array.from(identifierCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      imports: [...this.imports],
      exports: [...this.exports],
      identifierCount: this.usedIdentifiers.size,
      mostUsedIdentifiers: mostUsed
    };
  }
}

// ===== COMPLEXITY ANALYZER =====
class ComplexityAnalyzer extends ASTVisitor {
  private cyclomaticComplexity = 1; // Base complexity
  private nestingDepth = 0;
  private maxNestingDepth = 0;

  visitIfStatement(node: ts.IfStatement): ts.Node {
    this.cyclomaticComplexity++;
    return this.withNesting(node);
  }

  visitWhileStatement(node: ts.WhileStatement): ts.Node {
    this.cyclomaticComplexity++;
    return this.withNesting(node);
  }

  visitForStatement(node: ts.ForStatement): ts.Node {
    this.cyclomaticComplexity++;
    return this.withNesting(node);
  }

  visitSwitchStatement(node: ts.SwitchStatement): ts.Node {
    // Each case adds to complexity
    const caseCount = node.caseBlock.clauses.length;
    this.cyclomaticComplexity += caseCount;
    return this.withNesting(node);
  }

  visitConditionalExpression(node: ts.ConditionalExpression): ts.Node {
    this.cyclomaticComplexity++;
    return node;
  }

  visitBinaryExpression(node: ts.BinaryExpression): ts.Node {
    // Logical operators add complexity
    if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        node.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
      this.cyclomaticComplexity++;
    }
    return node;
  }

  private withNesting<T extends ts.Node>(node: T): T {
    this.nestingDepth++;
    this.maxNestingDepth = Math.max(this.maxNestingDepth, this.nestingDepth);
    
    const result = node;
    ts.forEachChild(node, child => this.traverseAndVisit(child));
    
    this.nestingDepth--;
    return result;
  }

  getComplexityMetrics(): {
    cyclomaticComplexity: number;
    maxNestingDepth: number;
    complexityRating: 'Low' | 'Medium' | 'High' | 'Very High';
  } {
    let rating: 'Low' | 'Medium' | 'High' | 'Very High';
    
    if (this.cyclomaticComplexity <= 5) rating = 'Low';
    else if (this.cyclomaticComplexity <= 10) rating = 'Medium';
    else if (this.cyclomaticComplexity <= 20) rating = 'High';
    else rating = 'Very High';

    return {
      cyclomaticComplexity: this.cyclomaticComplexity,
      maxNestingDepth: this.maxNestingDepth,
      complexityRating: rating
    };
  }
}

// ===== USAGE EXAMPLES =====
function analyzeSourceFile(sourceFile: ts.SourceFile) {
  console.log('=== Symbol Collection ===');
  const symbolCollector = new SymbolCollector();
  symbolCollector.traverseAndVisit(sourceFile);
  const symbols = symbolCollector.getSymbols();
  
  for (const [category, nodes] of symbols) {
    console.log(\`\${category}: \${nodes.length} found\`);
  }

  console.log('\\n=== Dependency Analysis ===');
  const depAnalyzer = new DependencyAnalyzer();
  depAnalyzer.traverseAndVisit(sourceFile);
  const depReport = depAnalyzer.getDependencyReport();
  console.log(JSON.stringify(depReport, null, 2));

  console.log('\\n=== Complexity Analysis ===');
  const complexityAnalyzer = new ComplexityAnalyzer();
  complexityAnalyzer.traverseAndVisit(sourceFile);
  const complexity = complexityAnalyzer.getComplexityMetrics();
  console.log(JSON.stringify(complexity, null, 2));
}

// ===== CUSTOM TREE WALKER =====
class TreeWalker {
  private path: ts.Node[] = [];
  
  walk(node: ts.Node, callback: (node: ts.Node, path: ts.Node[]) => boolean | void): void {
    this.path.push(node);
    
    const shouldContinue = callback(node, [...this.path]);
    
    if (shouldContinue !== false) {
      ts.forEachChild(node, child => this.walk(child, callback));
    }
    
    this.path.pop();
  }
  
  find(node: ts.Node, predicate: (node: ts.Node, path: ts.Node[]) => boolean): ts.Node | null {
    let found: ts.Node | null = null;
    
    this.walk(node, (current, path) => {
      if (predicate(current, path)) {
        found = current;
        return false; // Stop walking
      }
    });
    
    return found;
  }
  
  findAll(node: ts.Node, predicate: (node: ts.Node, path: ts.Node[]) => boolean): ts.Node[] {
    const found: ts.Node[] = [];
    
    this.walk(node, (current, path) => {
      if (predicate(current, path)) {
        found.push(current);
      }
    });
    
    return found;
  }
}

// Example usage of TreeWalker
const walker = new TreeWalker();
const complexSource = ts.createSourceFile(
  'complex.ts',
  \`
  function complexFunction(x: number): number {
    if (x > 10) {
      for (let i = 0; i < x; i++) {
        if (i % 2 === 0) {
          console.log(i);
        }
      }
    } else {
      while (x > 0) {
        x--;
      }
    }
    return x;
  }
  \`,
  ts.ScriptTarget.Latest,
  true
);

// Find all nested if statements
const nestedIfs = walker.findAll(complexSource, (node, path) => {
  return ts.isIfStatement(node) && path.some(parent => ts.isIfStatement(parent) && parent !== node);
});

console.log(\`Found \${nestedIfs.length} nested if statements\`);`,

    nodeTypes: `// Understanding different TypeScript AST node types

import * as ts from 'typescript';

// ===== DECLARATION NODES =====
function analyzeDeclarationNodes(sourceFile: ts.SourceFile): void {
  console.log('=== Declaration Node Analysis ===');
  
  ts.forEachChild(sourceFile, node => {
    if (ts.isVariableStatement(node)) {
      console.log('Variable Statement:', analyzeVariableStatement(node));
    }
    
    if (ts.isFunctionDeclaration(node)) {
      console.log('Function Declaration:', analyzeFunctionDeclaration(node));
    }
    
    if (ts.isClassDeclaration(node)) {
      console.log('Class Declaration:', analyzeClassDeclaration(node));
    }
    
    if (ts.isInterfaceDeclaration(node)) {
      console.log('Interface Declaration:', analyzeInterfaceDeclaration(node));
    }
    
    if (ts.isTypeAliasDeclaration(node)) {
      console.log('Type Alias:', analyzeTypeAlias(node));
    }
    
    if (ts.isEnumDeclaration(node)) {
      console.log('Enum Declaration:', analyzeEnumDeclaration(node));
    }
    
    if (ts.isImportDeclaration(node)) {
      console.log('Import Declaration:', analyzeImportDeclaration(node));
    }
  });
}

function analyzeVariableStatement(node: ts.VariableStatement): object {
  const declarations = node.declarationList.declarations.map(decl => ({
    name: decl.name.getText(),
    type: decl.type?.getText() || 'inferred',
    hasInitializer: !!decl.initializer,
    initializerKind: decl.initializer ? ts.SyntaxKind[decl.initializer.kind] : null
  }));
  
  return {
    declarationKind: ts.NodeFlags[node.declarationList.flags] || 'var',
    declarations,
    isConst: (node.declarationList.flags & ts.NodeFlags.Const) !== 0,
    isLet: (node.declarationList.flags & ts.NodeFlags.Let) !== 0
  };
}

function analyzeFunctionDeclaration(node: ts.FunctionDeclaration): object {
  const parameters = node.parameters.map(param => ({
    name: param.name.getText(),
    type: param.type?.getText() || 'any',
    optional: !!param.questionToken,
    hasDefault: !!param.initializer,
    isRest: !!param.dotDotDotToken
  }));
  
  const typeParameters = node.typeParameters?.map(tp => ({
    name: tp.name.text,
    constraint: tp.constraint?.getText(),
    default: tp.default?.getText()
  })) || [];
  
  return {
    name: node.name?.text || '<anonymous>',
    parameters,
    typeParameters,
    returnType: node.type?.getText() || 'void',
    isAsync: node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false,
    isExported: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false,
    isGenerator: !!node.asteriskToken
  };
}

function analyzeClassDeclaration(node: ts.ClassDeclaration): object {
  const members = node.members.map(member => {
    const memberInfo: any = {
      kind: ts.SyntaxKind[member.kind],
      name: member.name?.getText() || '<computed>',
      isStatic: member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false,
      isPrivate: member.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword) || false,
      isProtected: member.modifiers?.some(m => m.kind === ts.SyntaxKind.ProtectedKeyword) || false,
      isReadonly: member.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) || false
    };
    
    if (ts.isMethodDeclaration(member)) {
      memberInfo.parameters = member.parameters.length;
      memberInfo.returnType = member.type?.getText();
      memberInfo.isAsync = member.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false;
    } else if (ts.isPropertyDeclaration(member)) {
      memberInfo.type = member.type?.getText();
      memberInfo.hasInitializer = !!member.initializer;
    } else if (ts.isConstructorDeclaration(member)) {
      memberInfo.parameters = member.parameters.length;
    }
    
    return memberInfo;
  });
  
  return {
    name: node.name?.text || '<anonymous>',
    isAbstract: node.modifiers?.some(m => m.kind === ts.SyntaxKind.AbstractKeyword) || false,
    isExported: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false,
    extendsClause: node.heritageClauses?.find(h => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]?.getText(),
    implementsClauses: node.heritageClauses?.find(h => h.token === ts.SyntaxKind.ImplementsKeyword)?.types.map(t => t.getText()) || [],
    members,
    memberCounts: {
      constructors: members.filter(m => m.kind === 'ConstructorDeclaration').length,
      methods: members.filter(m => m.kind === 'MethodDeclaration').length,
      properties: members.filter(m => m.kind === 'PropertyDeclaration').length,
      getters: members.filter(m => m.kind === 'GetAccessor').length,
      setters: members.filter(m => m.kind === 'SetAccessor').length
    }
  };
}

function analyzeInterfaceDeclaration(node: ts.InterfaceDeclaration): object {
  const members = node.members.map(member => ({
    kind: ts.SyntaxKind[member.kind],
    name: member.name?.getText() || '<computed>',
    type: member.kind === ts.SyntaxKind.PropertySignature ? 
      (member as ts.PropertySignature).type?.getText() : 
      member.kind === ts.SyntaxKind.MethodSignature ?
      (member as ts.MethodSignature).type?.getText() :
      'unknown',
    optional: !!(member as any).questionToken
  }));
  
  return {
    name: node.name.text,
    isExported: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false,
    extendsInterfaces: node.heritageClauses?.[0]?.types.map(t => t.getText()) || [],
    members,
    typeParameters: node.typeParameters?.map(tp => tp.name.text) || []
  };
}

function analyzeTypeAlias(node: ts.TypeAliasDeclaration): object {
  return {
    name: node.name.text,
    type: node.type.getText(),
    isExported: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false,
    typeParameters: node.typeParameters?.map(tp => tp.name.text) || []
  };
}

function analyzeEnumDeclaration(node: ts.EnumDeclaration): object {
  const members = node.members.map(member => ({
    name: member.name.getText(),
    value: member.initializer?.getText() || 'auto',
    hasInitializer: !!member.initializer
  }));
  
  return {
    name: node.name.text,
    isConst: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ConstKeyword) || false,
    isExported: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false,
    members
  };
}

function analyzeImportDeclaration(node: ts.ImportDeclaration): object {
  const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
  let importInfo: any = { moduleSpecifier };
  
  if (node.importClause) {
    if (node.importClause.name) {
      importInfo.defaultImport = node.importClause.name.text;
    }
    
    if (node.importClause.namedBindings) {
      if (ts.isNamespaceImport(node.importClause.namedBindings)) {
        importInfo.namespaceImport = node.importClause.namedBindings.name.text;
      } else if (ts.isNamedImports(node.importClause.namedBindings)) {
        importInfo.namedImports = node.importClause.namedBindings.elements.map(elem => ({
          name: elem.name.text,
          propertyName: elem.propertyName?.text
        }));
      }
    }
  }
  
  return importInfo;
}

// ===== EXPRESSION NODES =====
function analyzeExpressionNodes(sourceFile: ts.SourceFile): void {
  console.log('\\n=== Expression Node Analysis ===');
  
  const expressions: { [key: string]: number } = {};
  
  function countExpression(node: ts.Node): void {
    const kindName = ts.SyntaxKind[node.kind];
    expressions[kindName] = (expressions[kindName] || 0) + 1;
    
    // Analyze specific expression types
    if (ts.isCallExpression(node)) {
      console.log('Call Expression:', analyzeCallExpression(node));
    }
    
    if (ts.isBinaryExpression(node)) {
      console.log('Binary Expression:', analyzeBinaryExpression(node));
    }
    
    if (ts.isConditionalExpression(node)) {
      console.log('Conditional Expression:', analyzeConditionalExpression(node));
    }
    
    if (ts.isArrowFunction(node)) {
      console.log('Arrow Function:', analyzeArrowFunction(node));
    }
    
    ts.forEachChild(node, countExpression);
  }
  
  countExpression(sourceFile);
  console.log('Expression counts:', expressions);
}

function analyzeCallExpression(node: ts.CallExpression): object {
  return {
    expression: node.expression.getText(),
    argumentCount: node.arguments.length,
    arguments: node.arguments.map(arg => ({
      kind: ts.SyntaxKind[arg.kind],
      text: arg.getText().substring(0, 50)
    })),
    typeArguments: node.typeArguments?.map(ta => ta.getText()) || []
  };
}

function analyzeBinaryExpression(node: ts.BinaryExpression): object {
  return {
    operator: ts.SyntaxKind[node.operatorToken.kind],
    left: {
      kind: ts.SyntaxKind[node.left.kind],
      text: node.left.getText()
    },
    right: {
      kind: ts.SyntaxKind[node.right.kind],
      text: node.right.getText()
    }
  };
}

function analyzeConditionalExpression(node: ts.ConditionalExpression): object {
  return {
    condition: node.condition.getText(),
    whenTrue: node.whenTrue.getText(),
    whenFalse: node.whenFalse.getText()
  };
}

function analyzeArrowFunction(node: ts.ArrowFunction): object {
  return {
    parameters: node.parameters.map(param => param.name.getText()),
    hasBody: ts.isBlock(node.body),
    isAsync: node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false,
    returnType: node.type?.getText()
  };
}

// ===== TYPE NODES =====
function analyzeTypeNodes(sourceFile: ts.SourceFile): void {
  console.log('\\n=== Type Node Analysis ===');
  
  function analyzeTypeNode(node: ts.Node): void {
    if (ts.isTypeReference(node)) {
      console.log('Type Reference:', {
        typeName: node.typeName.getText(),
        typeArguments: node.typeArguments?.map(ta => ta.getText()) || []
      });
    }
    
    if (ts.isMappedTypeNode(node)) {
      console.log('Mapped Type:', {
        typeParameter: node.typeParameter.name.text,
        constraint: node.typeParameter.constraint?.getText(),
        type: node.type?.getText(),
        readonlyToken: !!node.readonlyToken,
        questionToken: !!node.questionToken
      });
    }
    
    if (ts.isConditionalTypeNode(node)) {
      console.log('Conditional Type:', {
        checkType: node.checkType.getText(),
        extendsType: node.extendsType.getText(),
        trueType: node.trueType.getText(),
        falseType: node.falseType.getText()
      });
    }
    
    if (ts.isFunctionTypeNode(node)) {
      console.log('Function Type:', {
        parameters: node.parameters.length,
        returnType: node.type.getText(),
        typeParameters: node.typeParameters?.length || 0
      });
    }
    
    ts.forEachChild(node, analyzeTypeNode);
  }
  
  analyzeTypeNode(sourceFile);
}

// ===== COMPREHENSIVE NODE ANALYZER =====
export function comprehensiveNodeAnalysis(sourceCode: string): void {
  const sourceFile = ts.createSourceFile(
    'analysis.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  
  analyzeDeclarationNodes(sourceFile);
  analyzeExpressionNodes(sourceFile);
  analyzeTypeNodes(sourceFile);
}`,

    transformation: `// AST transformation and code modification

import * as ts from 'typescript';

// ===== TRANSFORMER FACTORY =====
function createTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
  return (context: ts.TransformationContext) => {
    const visit: ts.Visitor = (node: ts.Node): ts.Node => {
      // Apply transformations based on node type
      node = transformNode(node, context);
      return ts.visitEachChild(node, child => visit(child), context);
    };

    return (node: T) => ts.visitNode(node, visit) as T;
  };
}

function transformNode(node: ts.Node, context: ts.TransformationContext): ts.Node {
  // Example transformations
  
  // Transform console.log calls to custom logger
  if (ts.isCallExpression(node) && 
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'console' &&
      node.expression.name.text === 'log') {
    
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('logger'),
        'info'
      ),
      undefined,
      node.arguments
    );
  }
  
  // Transform var declarations to const/let
  if (ts.isVariableStatement(node)) {
    const declarationList = node.declarationList;
    if (declarationList.flags & ts.NodeFlags.None) { // var declaration
      const newFlags = hasInitializers(declarationList) ? ts.NodeFlags.Const : ts.NodeFlags.Let;
      
      return ts.factory.createVariableStatement(
        node.modifiers,
        ts.factory.createVariableDeclarationList(
          declarationList.declarations,
          newFlags
        )
      );
    }
  }
  
  return node;
}

function hasInitializers(declarationList: ts.VariableDeclarationList): boolean {
  return declarationList.declarations.every(decl => !!decl.initializer);
}

// ===== SPECIFIC TRANSFORMERS =====

// 1. Function to Arrow Function Transformer
function createFunctionToArrowTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const visit: ts.Visitor = (node: ts.Node): ts.Node => {
      if (ts.isFunctionExpression(node) && !node.name) {
        // Transform function expression to arrow function
        return ts.factory.createArrowFunction(
          node.modifiers,
          node.typeParameters,
          node.parameters,
          node.type,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          node.body || ts.factory.createBlock([])
        );
      }
      
      return ts.visitEachChild(node, child => visit(child), context);
    };

    return (node: ts.SourceFile) => ts.visitNode(node, visit) as ts.SourceFile;
  };
}

// 2. Add Type Annotations Transformer
function createTypeAnnotationTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const visit: ts.Visitor = (node: ts.Node): ts.Node => {
      // Add type annotations to variable declarations without types
      if (ts.isVariableDeclaration(node) && !node.type && node.initializer) {
        const inferredType = inferTypeFromInitializer(node.initializer);
        if (inferredType) {
          return ts.factory.createVariableDeclaration(
            node.name,
            node.exclamationToken,
            inferredType,
            node.initializer
          );
        }
      }
      
      // Add return type annotations to functions
      if (ts.isFunctionDeclaration(node) && !node.type) {
        const inferredReturnType = inferReturnType(node);
        if (inferredReturnType) {
          return ts.factory.createFunctionDeclaration(
            node.modifiers,
            node.asteriskToken,
            node.name,
            node.typeParameters,
            node.parameters,
            inferredReturnType,
            node.body
          );
        }
      }
      
      return ts.visitEachChild(node, child => visit(child), context);
    };

    return (node: ts.SourceFile) => ts.visitNode(node, visit) as ts.SourceFile;
  };
}

function inferTypeFromInitializer(initializer: ts.Expression): ts.TypeNode | undefined {
  if (ts.isStringLiteral(initializer)) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  }
  if (ts.isNumericLiteral(initializer)) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
  }
  if (initializer.kind === ts.SyntaxKind.TrueKeyword || 
      initializer.kind === ts.SyntaxKind.FalseKeyword) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
  }
  if (ts.isArrayLiteralExpression(initializer)) {
    // Simple array type inference
    return ts.factory.createArrayTypeNode(
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
    );
  }
  return undefined;
}

function inferReturnType(func: ts.FunctionDeclaration): ts.TypeNode | undefined {
  if (!func.body) return undefined;
  
  // Simple return type inference based on return statements
  const returnStatements = findReturnStatements(func.body);
  
  if (returnStatements.length === 0) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
  }
  
  // For simplicity, return any if we can't infer
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
}

function findReturnStatements(node: ts.Node): ts.ReturnStatement[] {
  const returnStatements: ts.ReturnStatement[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isReturnStatement(node)) {
      returnStatements.push(node);
    } else {
      ts.forEachChild(node, visit);
    }
  }
  
  visit(node);
  return returnStatements;
}

// 3. Dead Code Elimination Transformer
function createDeadCodeEliminationTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const usedIdentifiers = new Set<string>();
    
    // First pass: collect used identifiers
    const collectUsed: ts.Visitor = (node: ts.Node): ts.Node => {
      if (ts.isIdentifier(node) && !ts.isDeclaration(node.parent!)) {
        usedIdentifiers.add(node.text);
      }
      ts.forEachChild(node, child => collectUsed(child));
      return node;
    };
    
    const eliminate: ts.Visitor = (node: ts.Node): ts.Node | undefined => {
      // Remove unused variable declarations
      if (ts.isVariableStatement(node)) {
        const filteredDeclarations = node.declarationList.declarations.filter(decl => {
          if (ts.isIdentifier(decl.name)) {
            return usedIdentifiers.has(decl.name.text);
          }
          return true; // Keep complex bindings
        });
        
        if (filteredDeclarations.length === 0) {
          return undefined; // Remove entire statement
        }
        
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
      
      // Remove unused function declarations
      if (ts.isFunctionDeclaration(node) && node.name) {
        if (!usedIdentifiers.has(node.name.text)) {
          return undefined;
        }
      }
      
      return ts.visitEachChild(node, child => eliminate(child), context);
    };

    return (node: ts.SourceFile) => {
      // First pass: collect used identifiers
      collectUsed(node);
      
      // Second pass: eliminate dead code
      return ts.visitNode(node, eliminate) as ts.SourceFile;
    };
  };
}

// ===== TRANSFORMATION PIPELINE =====
class TransformationPipeline {
  private transformers: ts.TransformerFactory<ts.SourceFile>[] = [];

  addTransformer(transformer: ts.TransformerFactory<ts.SourceFile>): this {
    this.transformers.push(transformer);
    return this;
  }

  transform(sourceFile: ts.SourceFile): ts.SourceFile {
    const result = ts.transform(sourceFile, this.transformers);
    return result.transformed[0];
  }

  transformAndPrint(sourceCode: string): string {
    const sourceFile = ts.createSourceFile(
      'input.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const transformed = this.transform(sourceFile);
    
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false
    });

    return printer.printFile(transformed);
  }
}

// ===== USAGE EXAMPLES =====
function demonstrateTransformations(): void {
  const sourceCode = \`
  var name = "John";
  var age = 30;
  var isActive = true;
  var unused = "this won't be used";
  
  function greet(person) {
    console.log("Hello, " + person);
    return "greeting sent";
  }
  
  function unusedFunction() {
    return "never called";
  }
  
  greet(name);
  \`;

  console.log('=== Original Code ===');
  console.log(sourceCode);

  // Create transformation pipeline
  const pipeline = new TransformationPipeline()
    .addTransformer(createTypeAnnotationTransformer())
    .addTransformer(createFunctionToArrowTransformer())
    .addTransformer(createDeadCodeEliminationTransformer());

  const transformed = pipeline.transformAndPrint(sourceCode);

  console.log('\\n=== Transformed Code ===');
  console.log(transformed);
}

// ===== CUSTOM NODE FACTORY HELPERS =====
class NodeFactory {
  static createLoggerCall(level: 'info' | 'warn' | 'error', ...args: ts.Expression[]): ts.CallExpression {
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('logger'),
        level
      ),
      undefined,
      args
    );
  }

  static createTypeAssertion(expression: ts.Expression, type: ts.TypeNode): ts.AsExpression {
    return ts.factory.createAsExpression(expression, type);
  }

  static createInterfaceDeclaration(
    name: string,
    properties: Array<{ name: string; type: ts.TypeNode; optional?: boolean }>
  ): ts.InterfaceDeclaration {
    const members = properties.map(prop => 
      ts.factory.createPropertySignature(
        undefined,
        prop.name,
        prop.optional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
        prop.type
      )
    );

    return ts.factory.createInterfaceDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      name,
      undefined,
      undefined,
      members
    );
  }

  static createClassDeclaration(
    name: string,
    properties: Array<{ name: string; type: ts.TypeNode; isPrivate?: boolean }>
  ): ts.ClassDeclaration {
    const members = properties.map(prop => {
      const modifiers = prop.isPrivate ? 
        [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)] : 
        undefined;

      return ts.factory.createPropertyDeclaration(
        modifiers,
        prop.name,
        undefined,
        prop.type,
        undefined
      );
    });

    return ts.factory.createClassDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      name,
      undefined,
      undefined,
      members
    );
  }
}

// ===== TRANSFORMATION UTILITIES =====
export class ASTTransformationUtils {
  static applyTransformations(
    sourceCode: string, 
    transformers: ts.TransformerFactory<ts.SourceFile>[]
  ): string {
    const sourceFile = ts.createSourceFile(
      'transform.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const result = ts.transform(sourceFile, transformers);
    const printer = ts.createPrinter();

    return printer.printFile(result.transformed[0]);
  }

  static createSourceFileFromString(code: string, fileName: string = 'generated.ts'): ts.SourceFile {
    return ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true);
  }

  static printNode(node: ts.Node): string {
    const printer = ts.createPrinter();
    const sourceFile = ts.createSourceFile('temp.ts', '', ts.ScriptTarget.Latest);
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  }
}`,

    advanced: `// Advanced AST manipulation and code generation

import * as ts from 'typescript';

// ===== ADVANCED AST ANALYSIS =====
class SemanticAnalyzer {
  private checker: ts.TypeChecker;
  private program: ts.Program;

  constructor(sourceFiles: string[], compilerOptions: ts.CompilerOptions = {}) {
    // Create a program for semantic analysis
    const host = ts.createCompilerHost(compilerOptions);
    const sourceFileMap = new Map<string, string>();
    
    sourceFiles.forEach((content, index) => {
      sourceFileMap.set(\`file\${index}.ts\`, content);
    });

    // Override readFile to use our in-memory files
    host.readFile = (fileName: string) => sourceFileMap.get(fileName);
    host.fileExists = (fileName: string) => sourceFileMap.has(fileName);
    host.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget) => {
      const content = sourceFileMap.get(fileName);
      return content ? ts.createSourceFile(fileName, content, languageVersion, true) : undefined;
    };

    this.program = ts.createProgram(Array.from(sourceFileMap.keys()), compilerOptions, host);
    this.checker = this.program.getTypeChecker();
  }

  analyzeSymbol(node: ts.Node): ts.Symbol | undefined {
    return this.checker.getSymbolAtLocation(node);
  }

  getTypeOfNode(node: ts.Expression): ts.Type {
    return this.checker.getTypeAtLocation(node);
  }

  getTypeString(node: ts.Expression): string {
    const type = this.getTypeOfNode(node);
    return this.checker.typeToString(type);
  }

  getSignature(callExpression: ts.CallExpression): ts.Signature | undefined {
    return this.checker.getResolvedSignature(callExpression);
  }

  analyzeFunction(func: ts.FunctionDeclaration): {
    name: string;
    parameters: Array<{ name: string; type: string; optional: boolean }>;
    returnType: string;
    callSites: ts.CallExpression[];
  } {
    const symbol = this.checker.getSymbolAtLocation(func.name!);
    const type = this.checker.getTypeOfSymbolAtLocation(symbol!, func);
    
    const callSites: ts.CallExpression[] = [];
    
    // Find all call sites
    for (const sourceFile of this.program.getSourceFiles()) {
      this.findCallSites(sourceFile, func.name!.text, callSites);
    }

    return {
      name: func.name!.text,
      parameters: func.parameters.map(param => ({
        name: param.name.getText(),
        type: param.type ? param.type.getText() : this.getTypeString(param as any),
        optional: !!param.questionToken
      })),
      returnType: func.type ? func.type.getText() : this.getTypeString(func as any),
      callSites
    };
  }

  private findCallSites(node: ts.Node, functionName: string, callSites: ts.CallExpression[]): void {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && 
        node.expression.text === functionName) {
      callSites.push(node);
    }
    ts.forEachChild(node, child => this.findCallSites(child, functionName, callSites));
  }

  analyzeDependencies(): Map<string, Set<string>> {
    const dependencies = new Map<string, Set<string>>();

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;

      const fileDeps = new Set<string>();
      
      const visit = (node: ts.Node) => {
        if (ts.isImportDeclaration(node)) {
          const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
          fileDeps.add(moduleSpecifier);
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      dependencies.set(sourceFile.fileName, fileDeps);
    }

    return dependencies;
  }
}

// ===== CODE GENERATION ENGINE =====
class CodeGenerator {
  private indentLevel = 0;
  private output: string[] = [];

  indent(): this {
    this.indentLevel++;
    return this;
  }

  dedent(): this {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
    return this;
  }

  writeLine(line: string = ''): this {
    const indentation = '  '.repeat(this.indentLevel);
    this.output.push(indentation + line);
    return this;
  }

  writeBlock(opener: string, closer: string, content: () => void): this {
    this.writeLine(opener);
    this.indent();
    content();
    this.dedent();
    this.writeLine(closer);
    return this;
  }

  generateInterface(name: string, properties: Array<{ name: string; type: string; optional?: boolean; readonly?: boolean }>): this {
    this.writeLine(\`export interface \${name} {\`);
    this.indent();
    
    properties.forEach(prop => {
      const readonly = prop.readonly ? 'readonly ' : '';
      const optional = prop.optional ? '?' : '';
      this.writeLine(\`\${readonly}\${prop.name}\${optional}: \${prop.type};\`);
    });
    
    this.dedent();
    this.writeLine('}');
    return this;
  }

  generateClass(
    name: string, 
    options: {
      isAbstract?: boolean;
      extends?: string;
      implements?: string[];
      properties?: Array<{ name: string; type: string; visibility?: 'public' | 'private' | 'protected'; readonly?: boolean }>;
      methods?: Array<{ name: string; parameters: Array<{ name: string; type: string }>; returnType: string; body: string; visibility?: 'public' | 'private' | 'protected' }>;
    } = {}
  ): this {
    let classDeclaration = \`export \${options.isAbstract ? 'abstract ' : ''}class \${name}\`;
    
    if (options.extends) {
      classDeclaration += \` extends \${options.extends}\`;
    }
    
    if (options.implements && options.implements.length > 0) {
      classDeclaration += \` implements \${options.implements.join(', ')}\`;
    }
    
    this.writeBlock(\`\${classDeclaration} {\`, '}', () => {
      // Generate properties
      options.properties?.forEach(prop => {
        const visibility = prop.visibility || 'public';
        const readonly = prop.readonly ? 'readonly ' : '';
        this.writeLine(\`\${visibility} \${readonly}\${prop.name}: \${prop.type};\`);
      });

      if (options.properties?.length && options.methods?.length) {
        this.writeLine(); // Empty line between properties and methods
      }

      // Generate methods
      options.methods?.forEach(method => {
        const visibility = method.visibility || 'public';
        const params = method.parameters.map(p => \`\${p.name}: \${p.type}\`).join(', ');
        
        this.writeBlock(
          \`\${visibility} \${method.name}(\${params}): \${method.returnType} {\`,
          '}',
          () => {
            this.writeLine(method.body);
          }
        );
      });
    });
    
    return this;
  }

  generateEnum(name: string, members: Array<{ name: string; value?: string | number }>): this {
    this.writeBlock(\`export enum \${name} {\`, '}', () => {
      members.forEach((member, index) => {
        const value = member.value !== undefined ? \` = \${typeof member.value === 'string' ? \`'\${member.value}'\` : member.value}\` : '';
        const comma = index < members.length - 1 ? ',' : '';
        this.writeLine(\`\${member.name}\${value}\${comma}\`);
      });
    });
    return this;
  }

  generateFunction(
    name: string,
    parameters: Array<{ name: string; type: string; optional?: boolean; defaultValue?: string }>,
    returnType: string,
    body: string,
    options: { isAsync?: boolean; isExported?: boolean; typeParameters?: string[] } = {}
  ): this {
    const exportKeyword = options.isExported ? 'export ' : '';
    const asyncKeyword = options.isAsync ? 'async ' : '';
    const typeParams = options.typeParameters ? \`<\${options.typeParameters.join(', ')}>\` : '';
    
    const params = parameters.map(param => {
      const optional = param.optional ? '?' : '';
      const defaultVal = param.defaultValue ? \` = \${param.defaultValue}\` : '';
      return \`\${param.name}\${optional}: \${param.type}\${defaultVal}\`;
    }).join(', ');

    this.writeBlock(
      \`\${exportKeyword}\${asyncKeyword}function \${name}\${typeParams}(\${params}): \${returnType} {\`,
      '}',
      () => {
        this.writeLine(body);
      }
    );
    
    return this;
  }

  generateTypeAlias(name: string, type: string, typeParameters?: string[]): this {
    const typeParams = typeParameters ? \`<\${typeParameters.join(', ')}>\` : '';
    this.writeLine(\`export type \${name}\${typeParams} = \${type};\`);
    return this;
  }

  clear(): this {
    this.output = [];
    this.indentLevel = 0;
    return this;
  }

  toString(): string {
    return this.output.join('\\n');
  }
}

// ===== TEMPLATE ENGINE =====
class TypeScriptTemplateEngine {
  private templates: Map<string, string> = new Map();

  registerTemplate(name: string, template: string): this {
    this.templates.set(name, template);
    return this;
  }

  render(templateName: string, data: Record<string, any>): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(\`Template '\${templateName}' not found\`);
    }

    return this.interpolate(template, data);
  }

  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\\{\\{(\\w+)\\}\\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  // Pre-defined templates
  static createWithDefaultTemplates(): TypeScriptTemplateEngine {
    const engine = new TypeScriptTemplateEngine();

    engine.registerTemplate('api-client', \`
export class {{className}} {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async {{methodName}}({{parameters}}): Promise<{{returnType}}> {
    const response = await fetch(\\\`\\\${this.baseUrl}{{endpoint}\\\`, {
      method: '{{httpMethod}}',
      headers: {
        'Content-Type': 'application/json',
      },
      {{#hasBody}}
      body: JSON.stringify(data),
      {{/hasBody}}
    });

    if (!response.ok) {
      throw new Error(\\\`HTTP error! status: \\\${response.status}\\\`);
    }

    return response.json();
  }
}
    \`);

    engine.registerTemplate('redux-slice', \`
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface {{stateName}}State {
  {{#stateProperties}}
  {{name}}: {{type}};
  {{/stateProperties}}
}

const initialState: {{stateName}}State = {
  {{#initialValues}}
  {{name}}: {{value}},
  {{/initialValues}}
};

export const {{sliceName}}Slice = createSlice({
  name: '{{sliceName}}',
  initialState,
  reducers: {
    {{#actions}}
    {{name}}: (state, action: PayloadAction<{{payloadType}}>) => {
      {{body}}
    },
    {{/actions}}
  },
});

export const { {{actionNames}} } = {{sliceName}}Slice.actions;
export default {{sliceName}}Slice.reducer;
    \`);

    return engine;
  }
}

// ===== REFACTORING ENGINE =====
class RefactoringEngine {
  private program: ts.Program;
  private checker: ts.TypeChecker;

  constructor(fileContents: Map<string, string>, compilerOptions: ts.CompilerOptions = {}) {
    const host = ts.createCompilerHost(compilerOptions);
    
    host.readFile = (fileName: string) => fileContents.get(fileName);
    host.fileExists = (fileName: string) => fileContents.has(fileName);
    host.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget) => {
      const content = fileContents.get(fileName);
      return content ? ts.createSourceFile(fileName, content, languageVersion, true) : undefined;
    };

    this.program = ts.createProgram(Array.from(fileContents.keys()), compilerOptions, host);
    this.checker = this.program.getTypeChecker();
  }

  extractMethod(
    sourceFile: ts.SourceFile,
    startPos: number,
    endPos: number,
    methodName: string
  ): { newSourceFile: ts.SourceFile; extractedMethod: ts.FunctionDeclaration } {
    // Find the statements to extract
    const statementsToExtract: ts.Statement[] = [];
    
    const visit = (node: ts.Node) => {
      if (node.pos >= startPos && node.end <= endPos && ts.isStatement(node)) {
        statementsToExtract.push(node as ts.Statement);
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    // Create the extracted method
    const extractedMethod = ts.factory.createFunctionDeclaration(
      undefined,
      undefined,
      methodName,
      undefined,
      [],
      undefined,
      ts.factory.createBlock(statementsToExtract, true)
    );

    // Replace extracted statements with method call
    const methodCall = ts.factory.createCallExpression(
      ts.factory.createIdentifier(methodName),
      undefined,
      []
    );

    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
      const visit: ts.Visitor = (node) => {
        if (statementsToExtract.includes(node as ts.Statement)) {
          return undefined; // Remove the statement
        }
        return ts.visitEachChild(node, child => visit(child), context);
      };
      return (node) => ts.visitNode(node, visit) as ts.SourceFile;
    };

    const result = ts.transform(sourceFile, [transformer]);
    const newSourceFile = result.transformed[0];

    return { newSourceFile, extractedMethod };
  }

  renameSymbol(sourceFile: ts.SourceFile, oldName: string, newName: string): ts.SourceFile {
    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
      const visit: ts.Visitor = (node) => {
        if (ts.isIdentifier(node) && node.text === oldName) {
          return ts.factory.createIdentifier(newName);
        }
        return ts.visitEachChild(node, child => visit(child), context);
      };
      return (node) => ts.visitNode(node, visit) as ts.SourceFile;
    };

    const result = ts.transform(sourceFile, [transformer]);
    return result.transformed[0];
  }

  inlineVariable(sourceFile: ts.SourceFile, variableName: string): ts.SourceFile {
    let variableValue: ts.Expression | undefined;
    
    // Find the variable declaration and its value
    const findVariable = (node: ts.Node): void => {
      if (ts.isVariableDeclaration(node) && 
          ts.isIdentifier(node.name) && 
          node.name.text === variableName) {
        variableValue = node.initializer;
      }
      ts.forEachChild(node, findVariable);
    };

    findVariable(sourceFile);

    if (!variableValue) {
      return sourceFile;
    }

    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
      const visit: ts.Visitor = (node) => {
        // Remove variable declaration
        if (ts.isVariableDeclaration(node) && 
            ts.isIdentifier(node.name) && 
            node.name.text === variableName) {
          return undefined;
        }
        
        // Replace variable usage with value
        if (ts.isIdentifier(node) && node.text === variableName && 
            !ts.isVariableDeclaration(node.parent!)) {
          return variableValue!;
        }
        
        return ts.visitEachChild(node, child => visit(child), context);
      };
      return (node) => ts.visitNode(node, visit) as ts.SourceFile;
    };

    const result = ts.transform(sourceFile, [transformer]);
    return result.transformed[0];
  }

  extractInterface(sourceFile: ts.SourceFile, className: string, interfaceName: string): {
    newSourceFile: ts.SourceFile;
    extractedInterface: ts.InterfaceDeclaration;
  } {
    let classDeclaration: ts.ClassDeclaration | undefined;
    
    // Find the class declaration
    const findClass = (node: ts.Node): void => {
      if (ts.isClassDeclaration(node) && node.name?.text === className) {
        classDeclaration = node;
      }
      ts.forEachChild(node, findClass);
    };

    findClass(sourceFile);

    if (!classDeclaration) {
      throw new Error(\`Class '\${className}' not found\`);
    }

    // Extract public methods to interface
    const publicMethods = classDeclaration.members.filter(member => 
      ts.isMethodDeclaration(member) && 
      !member.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword)
    ) as ts.MethodDeclaration[];

    const interfaceMembers = publicMethods.map(method => 
      ts.factory.createMethodSignature(
        undefined,
        method.name,
        method.questionToken,
        method.typeParameters,
        method.parameters,
        method.type
      )
    );

    const extractedInterface = ts.factory.createInterfaceDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      interfaceName,
      undefined,
      undefined,
      interfaceMembers
    );

    // Add implements clause to class
    const implementsClause = ts.factory.createHeritageClause(
      ts.SyntaxKind.ImplementsKeyword,
      [ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier(interfaceName), undefined)]
    );

    const existingHeritage = classDeclaration.heritageClauses || [];
    const newHeritage = [...existingHeritage, implementsClause];

    const updatedClass = ts.factory.createClassDeclaration(
      classDeclaration.decorators,
      classDeclaration.modifiers,
      classDeclaration.name,
      classDeclaration.typeParameters,
      newHeritage,
      classDeclaration.members
    );

    // Replace class in source file
    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
      const visit: ts.Visitor = (node) => {
        if (node === classDeclaration) {
          return updatedClass;
        }
        return ts.visitEachChild(node, child => visit(child), context);
      };
      return (node) => ts.visitNode(node, visit) as ts.SourceFile;
    };

    const result = ts.transform(sourceFile, [transformer]);
    const newSourceFile = result.transformed[0];

    return { newSourceFile, extractedInterface };
  }
}

// ===== METADATA EXTRACTION =====
class MetadataExtractor {
  extractClassMetadata(sourceFile: ts.SourceFile): Array<{
    name: string;
    isAbstract: boolean;
    isExported: boolean;
    extends: string | null;
    implements: string[];
    decorators: string[];
    methods: Array<{
      name: string;
      isStatic: boolean;
      isAsync: boolean;
      visibility: 'public' | 'private' | 'protected';
      parameters: Array<{ name: string; type: string }>;
      returnType: string;
    }>;
    properties: Array<{
      name: string;
      type: string;
      isStatic: boolean;
      isReadonly: boolean;
      visibility: 'public' | 'private' | 'protected';
    }>;
  }> {
    const classes: any[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        const classInfo = this.analyzeClass(node);
        classes.push(classInfo);
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return classes;
  }

  private analyzeClass(node: ts.ClassDeclaration): any {
    const name = node.name?.text || '<anonymous>';
    const isAbstract = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AbstractKeyword) || false;
    const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false;
    
    const extendsClause = node.heritageClauses?.find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
    const extendsType = extendsClause?.types[0]?.expression.getText() || null;
    
    const implementsClause = node.heritageClauses?.find(h => h.token === ts.SyntaxKind.ImplementsKeyword);
    const implementsTypes = implementsClause?.types.map(t => t.expression.getText()) || [];
    
    const decorators = node.decorators?.map(d => d.expression.getText()) || [];

    const methods = node.members
      .filter(ts.isMethodDeclaration)
      .map(method => this.analyzeMethod(method));

    const properties = node.members
      .filter(ts.isPropertyDeclaration)
      .map(prop => this.analyzeProperty(prop));

    return {
      name,
      isAbstract,
      isExported,
      extends: extendsType,
      implements: implementsTypes,
      decorators,
      methods,
      properties
    };
  }

  private analyzeMethod(method: ts.MethodDeclaration): any {
    return {
      name: method.name?.getText() || '<computed>',
      isStatic: method.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false,
      isAsync: method.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false,
      visibility: this.getVisibility(method.modifiers),
      parameters: method.parameters.map(param => ({
        name: param.name.getText(),
        type: param.type?.getText() || 'any'
      })),
      returnType: method.type?.getText() || 'void'
    };
  }

  private analyzeProperty(prop: ts.PropertyDeclaration): any {
    return {
      name: prop.name?.getText() || '<computed>',
      type: prop.type?.getText() || 'any',
      isStatic: prop.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword) || false,
      isReadonly: prop.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) || false,
      visibility: this.getVisibility(prop.modifiers)
    };
  }

  private getVisibility(modifiers: ts.NodeArray<ts.Modifier> | undefined): 'public' | 'private' | 'protected' {
    if (modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword)) return 'private';
    if (modifiers?.some(m => m.kind === ts.SyntaxKind.ProtectedKeyword)) return 'protected';
    return 'public';
  }
}

// ===== USAGE EXAMPLES AND DEMONSTRATIONS =====
export function demonstrateAdvancedAST(): void {
  console.log('=== Advanced AST Manipulation Demo ===');

  // Sample code for analysis
  const sampleCode = \`
    import { Component } from 'react';
    import lodash from 'lodash';

    interface User {
      id: number;
      name: string;
      email?: string;
    }

    export class UserService {
      private users: User[] = [];

      async fetchUser(id: number): Promise<User | null> {
        const user = this.users.find(u => u.id === id);
        if (user) {
          console.log('User found:', user.name);
          return user;
        }
        console.log('User not found');
        return null;
      }

      addUser(user: User): void {
        this.users.push(user);
        console.log('User added:', user.name);
      }

      private validateUser(user: User): boolean {
        return user.id > 0 && user.name.length > 0;
      }
    }

    const service = new UserService();
    service.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
  \`;

  const sourceFile = ts.createSourceFile('test.ts', sampleCode, ts.ScriptTarget.Latest, true);

  // Semantic Analysis
  console.log('\\n=== Semantic Analysis ===');
  const analyzer = new SemanticAnalyzer([sampleCode]);
  const deps = analyzer.analyzeDependencies();
  deps.forEach((fileDeps, fileName) => {
    console.log(\`\${fileName}: \${Array.from(fileDeps).join(', ')}\`);
  });

  // Metadata Extraction
  console.log('\\n=== Class Metadata ===');
  const metadataExtractor = new MetadataExtractor();
  const classMetadata = metadataExtractor.extractClassMetadata(sourceFile);
  classMetadata.forEach(cls => {
    console.log(\`Class: \${cls.name}\`);
    console.log(\`  Methods: \${cls.methods.length}\`);
    console.log(\`  Properties: \${cls.properties.length}\`);
    console.log(\`  Implements: \${cls.implements.join(', ')}\`);
  });

  // Code Generation
  console.log('\\n=== Generated Code ===');
  const generator = new CodeGenerator();
  
  generator
    .generateInterface('Product', [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'price', type: 'number' },
      { name: 'description', type: 'string', optional: true }
    ])
    .writeLine()
    .generateClass('ProductService', {
      properties: [
        { name: 'products', type: 'Product[]', visibility: 'private' }
      ],
      methods: [
        {
          name: 'findById',
          parameters: [{ name: 'id', type: 'string' }],
          returnType: 'Product | undefined',
          body: 'return this.products.find(p => p.id === id);'
        },
        {
          name: 'add',
          parameters: [{ name: 'product', type: 'Product' }],
          returnType: 'void',
          body: 'this.products.push(product);'
        }
      ]
    });

  console.log(generator.toString());

  // Template Engine
  console.log('\\n=== Template Engine Demo ===');
  const templateEngine = TypeScriptTemplateEngine.createWithDefaultTemplates();
  
  const apiClientCode = templateEngine.render('api-client', {
    className: 'UserApiClient',
    methodName: 'getUser',
    parameters: 'id: string',
    returnType: 'User',
    endpoint: '/users/\${id}',
    httpMethod: 'GET',
    hasBody: false
  });
  
  console.log(apiClientCode);

  // Refactoring Engine Demo
  console.log('\\n=== Refactoring Demo ===');
  const fileContents = new Map([['test.ts', sampleCode]]);
  const refactoringEngine = new RefactoringEngine(fileContents);
  
  console.log('Available refactoring operations:');
  console.log('- Extract Method');
  console.log('- Rename Symbol'); 
  console.log('- Inline Variable');
  console.log('- Extract Interface');
  
  // Example: Extract interface from UserService
  try {
    const { extractedInterface } = refactoringEngine.extractInterface(sourceFile, 'UserService', 'IUserService');
    const printer = ts.createPrinter();
    const interfaceCode = printer.printNode(ts.EmitHint.Unspecified, extractedInterface, sourceFile);
    console.log('\\nExtracted interface:');
    console.log(interfaceCode);
  } catch (error) {
    console.log('Refactoring example (simulated)');
  }
}

// ===== PERFORMANCE MONITORING =====
export class ASTPerformanceMonitor {
  private timings = new Map<string, number[]>();

  time<T>(operation: string, fn: () => T): T {
    const start = process.hrtime.bigint();
    const result = fn();
    const end = process.hrtime.bigint();
    
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    if (!this.timings.has(operation)) {
      this.timings.set(operation, []);
    }
    this.timings.get(operation)!.push(duration);
    
    return result;
  }

  getReport(): Map<string, { count: number; total: number; average: number; min: number; max: number }> {
    const report = new Map();
    
    for (const [operation, times] of this.timings) {
      report.set(operation, {
        count: times.length,
        total: times.reduce((a, b) => a + b, 0),
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times)
      });
    }
    
    return report;
  }

  reset(): void {
    this.timings.clear();
  }
}

// ===== EXPORT DEMONSTRATION FUNCTION =====
export function runASTExplorerDemo(): void {
  console.log('=== AST Explorer Comprehensive Demo ===');
  
  const monitor = new ASTPerformanceMonitor();
  
  const testCode = \`
    export interface DatabaseConnection {
      connect(): Promise<void>;
      disconnect(): Promise<void>;
      query<T>(sql: string, params?: any[]): Promise<T[]>;
    }
    
    @Injectable()
    export class UserRepository implements DatabaseConnection {
      private connection: any;
      
      async connect(): Promise<void> {
        this.connection = await createConnection();
      }
      
      async disconnect(): Promise<void> {
        if (this.connection) {
          await this.connection.close();
        }
      }
      
      async query<T>(sql: string, params?: any[]): Promise<T[]> {
        return this.connection.query(sql, params);
      }
      
      async findUserById(id: number): Promise<User | null> {
        const users = await this.query<User>('SELECT * FROM users WHERE id = ?', [id]);
        return users[0] || null;
      }
    }
  \`;

  // Performance-monitored operations
  const sourceFile = monitor.time('parse-source', () =>
    ts.createSourceFile('demo.ts', testCode, ts.ScriptTarget.Latest, true)
  );

  const symbolCollector = new SymbolCollector();
  monitor.time('symbol-collection', () => {
    symbolCollector.traverseAndVisit(sourceFile);
  });

  const metadataExtractor = new MetadataExtractor();
  const metadata = monitor.time('metadata-extraction', () => 
    metadataExtractor.extractClassMetadata(sourceFile)
  );

  // Report performance
  console.log('\\n=== Performance Report ===');
  const report = monitor.getReport();
  for (const [operation, stats] of report) {
    console.log(\`\${operation}: \${stats.average.toFixed(2)}ms avg (\${stats.count} runs)\`);
  }

  // Demonstrate comprehensive analysis
  demonstrateAdvancedAST();
}

// ===== ADDITIONAL UTILITY FUNCTIONS =====
export function createASTFromCode(code: string, fileName: string = 'source.ts'): ts.SourceFile {
  return ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true);
}

export function printASTStructure(node: ts.Node, maxDepth: number = 3): void {
  function print(n: ts.Node, depth: number = 0): void {
    const indent = '  '.repeat(depth);
    const kind = ts.SyntaxKind[n.kind];
    const text = n.getText().substring(0, 30).replace(/\n/g, '\\n');
    
    console.log(`${indent}${kind}: "${text}${text.length >= 30 ? '...' : '"}"`);
    
    if (depth < maxDepth) {
      ts.forEachChild(n, child => print(child, depth + 1));
    }
  }
  
  print(node);
}