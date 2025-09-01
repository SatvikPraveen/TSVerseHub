// File location: src/data/concepts/compiler-api/diagnostics.ts

import * as ts from 'typescript';

export interface DiagnosticsContent {
  title: string;
  description: string;
  codeExamples: {
    basicDiagnostics: string;
    customDiagnostics: string;
    diagnosticFormatting: string;
    quickFixes: string;
    advanced: string;
  };
  keyPoints: string[];
}

export const diagnosticsContent: DiagnosticsContent = {
  title: "Diagnostics and Error Handling",
  description: "Learn how to work with TypeScript diagnostics, create custom error messages, format diagnostic output, implement quick fixes, and build sophisticated error handling systems for development tools.",
  
  codeExamples: {
    basicDiagnostics: `// Basic diagnostic collection and reporting

import * as ts from 'typescript';

// ===== DIAGNOSTIC COLLECTION =====
class DiagnosticCollector {
  private diagnostics: ts.Diagnostic[] = [];

  collect(sourceFile: ts.SourceFile, compilerOptions: ts.CompilerOptions = {}): ts.Diagnostic[] {
    // Create a program to get comprehensive diagnostics
    const host = ts.createCompilerHost(compilerOptions);
    host.getSourceFile = (fileName) => fileName === sourceFile.fileName ? sourceFile : undefined;

    const program = ts.createProgram([sourceFile.fileName], compilerOptions, host);

    // Collect different types of diagnostics
    const syntacticDiagnostics = program.getSyntacticDiagnostics();
    const semanticDiagnostics = program.getSemanticDiagnostics();
    const globalDiagnostics = program.getGlobalDiagnostics();
    const configDiagnostics = program.getConfigFileParsingDiagnostics();

    return [
      ...syntacticDiagnostics,
      ...semanticDiagnostics,
      ...globalDiagnostics,
      ...configDiagnostics
    ];
  }

  collectPreEmitDiagnostics(program: ts.Program): ts.Diagnostic[] {
    return ts.getPreEmitDiagnostics(program);
  }

  filterDiagnostics(
    diagnostics: ts.Diagnostic[],
    options: {
      category?: ts.DiagnosticCategory;
      code?: number;
      severity?: 'error' | 'warning' | 'suggestion';
      file?: string;
    }
  ): ts.Diagnostic[] {
    return diagnostics.filter(diagnostic => {
      if (options.category !== undefined && diagnostic.category !== options.category) {
        return false;
      }

      if (options.code !== undefined && diagnostic.code !== options.code) {
        return false;
      }

      if (options.file !== undefined && diagnostic.file?.fileName !== options.file) {
        return false;
      }

      if (options.severity) {
        const expectedCategory = this.severityToCategory(options.severity);
        if (diagnostic.category !== expectedCategory) {
          return false;
        }
      }

      return true;
    });
  }

  private severityToCategory(severity: 'error' | 'warning' | 'suggestion'): ts.DiagnosticCategory {
    switch (severity) {
      case 'error': return ts.DiagnosticCategory.Error;
      case 'warning': return ts.DiagnosticCategory.Warning;
      case 'suggestion': return ts.DiagnosticCategory.Suggestion;
    }
  }

  groupDiagnosticsByFile(diagnostics: ts.Diagnostic[]): Map<string, ts.Diagnostic[]> {
    const grouped = new Map<string, ts.Diagnostic[]>();

    for (const diagnostic of diagnostics) {
      const fileName = diagnostic.file?.fileName || '<global>';
      if (!grouped.has(fileName)) {
        grouped.set(fileName, []);
      }
      grouped.get(fileName)!.push(diagnostic);
    }

    return grouped;
  }

  groupDiagnosticsByCode(diagnostics: ts.Diagnostic[]): Map<number, ts.Diagnostic[]> {
    const grouped = new Map<number, ts.Diagnostic[]>();

    for (const diagnostic of diagnostics) {
      if (!grouped.has(diagnostic.code)) {
        grouped.set(diagnostic.code, []);
      }
      grouped.get(diagnostic.code)!.push(diagnostic);
    }

    return grouped;
  }

  getDiagnosticSummary(diagnostics: ts.Diagnostic[]): {
    total: number;
    errors: number;
    warnings: number;
    suggestions: number;
    files: number;
    uniqueCodes: number;
  } {
    const files = new Set<string>();
    const codes = new Set<number>();
    let errors = 0, warnings = 0, suggestions = 0;

    for (const diagnostic of diagnostics) {
      if (diagnostic.file) {
        files.add(diagnostic.file.fileName);
      }
      codes.add(diagnostic.code);

      switch (diagnostic.category) {
        case ts.DiagnosticCategory.Error:
          errors++;
          break;
        case ts.DiagnosticCategory.Warning:
          warnings++;
          break;
        case ts.DiagnosticCategory.Suggestion:
          suggestions++;
          break;
      }
    }

    return {
      total: diagnostics.length,
      errors,
      warnings,
      suggestions,
      files: files.size,
      uniqueCodes: codes.size
    };
  }
}

// ===== DIAGNOSTIC ANALYSIS =====
class DiagnosticAnalyzer {
  analyzeFile(fileName: string, sourceCode: string): {
    diagnostics: ts.Diagnostic[];
    analysis: {
      hasErrors: boolean;
      hasWarnings: boolean;
      topErrors: Array<{ code: number; count: number; message: string }>;
      lineWithMostErrors: number;
      errorDensity: number;
    };
  } {
    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const collector = new DiagnosticCollector();
    const diagnostics = collector.collect(sourceFile);
    
    const analysis = this.analyzeDiagnostics(diagnostics, sourceFile);

    return { diagnostics, analysis };
  }

  private analyzeDiagnostics(diagnostics: ts.Diagnostic[], sourceFile: ts.SourceFile): {
    hasErrors: boolean;
    hasWarnings: boolean;
    topErrors: Array<{ code: number; count: number; message: string }>;
    lineWithMostErrors: number;
    errorDensity: number;
  } {
    const errors = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
    const warnings = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Warning);

    // Count errors by code
    const errorCounts = new Map<number, { count: number; message: string }>();
    for (const diagnostic of errors) {
      const current = errorCounts.get(diagnostic.code) || { count: 0, message: '' };
      current.count++;
      if (!current.message && typeof diagnostic.messageText === 'string') {
        current.message = diagnostic.messageText;
      } else if (!current.message && typeof diagnostic.messageText === 'object') {
        current.message = diagnostic.messageText.messageText;
      }
      errorCounts.set(diagnostic.code, current);
    }

    const topErrors = Array.from(errorCounts.entries())
      .map(([code, info]) => ({ code, count: info.count, message: info.message }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Find line with most errors
    const lineErrors = new Map<number, number>();
    for (const diagnostic of errors) {
      if (diagnostic.file && diagnostic.start !== undefined) {
        const lineAndChar = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const line = lineAndChar.line;
        lineErrors.set(line, (lineErrors.get(line) || 0) + 1);
      }
    }

    const lineWithMostErrors = Array.from(lineErrors.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

    // Calculate error density (errors per line of code)
    const lineCount = sourceFile.getLineAndCharacterOfPosition(sourceFile.end).line + 1;
    const errorDensity = errors.length / lineCount;

    return {
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
      topErrors,
      lineWithMostErrors,
      errorDensity
    };
  }

  compareFiles(file1: string, code1: string, file2: string, code2: string): {
    file1Diagnostics: ts.Diagnostic[];
    file2Diagnostics: ts.Diagnostic[];
    comparison: {
      file1Errors: number;
      file2Errors: number;
      file1Warnings: number;
      file2Warnings: number;
      commonErrors: Array<{ code: number; message: string }>;
      uniqueToFile1: Array<{ code: number; message: string }>;
      uniqueToFile2: Array<{ code: number; message: string }>;
    };
  } {
    const analysis1 = this.analyzeFile(file1, code1);
    const analysis2 = this.analyzeFile(file2, code2);

    const codes1 = new Set(analysis1.diagnostics.map(d => d.code));
    const codes2 = new Set(analysis2.diagnostics.map(d => d.code));

    const getMessageForCode = (diagnostics: ts.Diagnostic[], code: number): string => {
      const diagnostic = diagnostics.find(d => d.code === code);
      if (!diagnostic) return '';
      return typeof diagnostic.messageText === 'string' 
        ? diagnostic.messageText 
        : diagnostic.messageText.messageText;
    };

    const commonCodes = Array.from(codes1).filter(code => codes2.has(code));
    const uniqueTo1 = Array.from(codes1).filter(code => !codes2.has(code));
    const uniqueTo2 = Array.from(codes2).filter(code => !codes1.has(code));

    return {
      file1Diagnostics: analysis1.diagnostics,
      file2Diagnostics: analysis2.diagnostics,
      comparison: {
        file1Errors: analysis1.analysis.hasErrors ? analysis1.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length : 0,
        file2Errors: analysis2.analysis.hasErrors ? analysis2.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length : 0,
        file1Warnings: analysis1.analysis.hasWarnings ? analysis1.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Warning).length : 0,
        file2Warnings: analysis2.analysis.hasWarnings ? analysis2.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Warning).length : 0,
        commonErrors: commonCodes.map(code => ({ code, message: getMessageForCode(analysis1.diagnostics, code) })),
        uniqueToFile1: uniqueTo1.map(code => ({ code, message: getMessageForCode(analysis1.diagnostics, code) })),
        uniqueToFile2: uniqueTo2.map(code => ({ code, message: getMessageForCode(analysis2.diagnostics, code) }))
      }
    };
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateBasicDiagnostics(): void {
  console.log('=== Basic Diagnostics Demo ===');

  const problemCode = \`
// This code has various issues
let x: number = "hello"; // Type error
const y = z; // Undefined variable
function test() {
  return 42
  console.log("unreachable"); // Unreachable code
}

// Missing semicolon, unused variable
let unused = 123

// Invalid syntax
if (true {
  console.log("missing closing parenthesis");
}
  \`;

  const analyzer = new DiagnosticAnalyzer();
  const result = analyzer.analyzeFile('problem.ts', problemCode);

  console.log('\\n=== Diagnostic Summary ===');
  console.log(\`Total diagnostics: \${result.diagnostics.length}\`);
  console.log(\`Has errors: \${result.analysis.hasErrors}\`);
  console.log(\`Has warnings: \${result.analysis.hasWarnings}\`);
  console.log(\`Error density: \${result.analysis.errorDensity.toFixed(3)} errors/line\`);

  console.log('\\n=== Top Errors ===');
  result.analysis.topErrors.forEach((error, index) => {
    console.log(\`\${index + 1}. Code \${error.code}: \${error.message} (appears \${error.count} times)\`);
  });

  console.log('\\n=== All Diagnostics ===');
  result.diagnostics.forEach(diagnostic => {
    const category = ts.DiagnosticCategory[diagnostic.category];
    const line = diagnostic.file && diagnostic.start !== undefined 
      ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1
      : '?';
    const message = typeof diagnostic.messageText === 'string' 
      ? diagnostic.messageText 
      : diagnostic.messageText.messageText;
    
    console.log(\`[\${category}] Line \${line}: \${message} (TS\${diagnostic.code})\`);
  });
}`,

    customDiagnostics: `// Creating custom diagnostics and rules

import * as ts from 'typescript';

// ===== CUSTOM DIAGNOSTIC FACTORY =====
class CustomDiagnosticFactory {
  static createDiagnostic(
    file: ts.SourceFile,
    start: number,
    length: number,
    messageText: string,
    code: number,
    category: ts.DiagnosticCategory = ts.DiagnosticCategory.Error,
    source: string = 'custom-linter'
  ): ts.Diagnostic {
    return {
      file,
      start,
      length,
      messageText,
      code,
      category,
      source,
      relatedInformation: []
    };
  }

  static createDiagnosticWithRelatedInfo(
    file: ts.SourceFile,
    start: number,
    length: number,
    messageText: string,
    code: number,
    relatedInfo: ts.DiagnosticRelatedInformation[],
    category: ts.DiagnosticCategory = ts.DiagnosticCategory.Error
  ): ts.Diagnostic {
    return {
      file,
      start,
      length,
      messageText,
      code,
      category,
      source: 'custom-linter',
      relatedInformation: relatedInfo
    };
  }

  static createChainedDiagnostic(
    file: ts.SourceFile,
    start: number,
    length: number,
    mainMessage: string,
    chainedMessages: string[],
    code: number,
    category: ts.DiagnosticCategory = ts.DiagnosticCategory.Error
  ): ts.Diagnostic {
    let messageChain: ts.DiagnosticMessageChain = {
      messageText: mainMessage,
      category,
      code,
      next: undefined
    };

    // Build chain from end to start
    for (let i = chainedMessages.length - 1; i >= 0; i--) {
      messageChain = {
        messageText: chainedMessages[i],
        category,
        code,
        next: [messageChain]
      };
    }

    return {
      file,
      start,
      length,
      messageText: messageChain,
      code,
      category,
      source: 'custom-linter'
    };
  }
}

// ===== CUSTOM LINTING RULES =====
interface LintRule {
  name: string;
  description: string;
  check(sourceFile: ts.SourceFile): ts.Diagnostic[];
}

class NoConsoleRule implements LintRule {
  name = 'no-console';
  description = 'Disallows console statements';

  constructor(
    private config: {
      allowedMethods?: string[];
      suggestedAlternative?: string;
    } = {}
  ) {}

  check(sourceFile: ts.SourceFile): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    const allowedMethods = this.config.allowedMethods || [];
    const alternative = this.config.suggestedAlternative || 'logger';

    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'console') {

        const method = node.expression.name.text;
        
        if (!allowedMethods.includes(method)) {
          const diagnostic = CustomDiagnosticFactory.createDiagnostic(
            sourceFile,
            node.getStart(sourceFile),
            node.getWidth(sourceFile),
            \`Console method '\${method}' is not allowed. Use \${alternative}.\${method}() instead.\`,
            9001,
            ts.DiagnosticCategory.Warning,
            'no-console-rule'
          );
          diagnostics.push(diagnostic);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return diagnostics;
  }
}

class NoUnusedImportsRule implements LintRule {
  name = 'no-unused-imports';
  description = 'Detects unused import statements';

  check(sourceFile: ts.SourceFile): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    const importedNames = new Set<string>();
    const usedNames = new Set<string>();
    const importNodes = new Map<string, ts.ImportDeclaration>();

    // Collect imports
    const collectImports = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && node.importClause) {
        // Default import
        if (node.importClause.name) {
          const name = node.importClause.name.text;
          importedNames.add(name);
          importNodes.set(name, node);
        }

        // Named imports
        if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
          for (const element of node.importClause.namedBindings.elements) {
            const name = element.name.text;
            importedNames.add(name);
            importNodes.set(name, node);
          }
        }

        // Namespace import
        if (node.importClause.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) {
          const name = node.importClause.namedBindings.name.text;
          importedNames.add(name);
          importNodes.set(name, node);
        }
      }

      ts.forEachChild(node, collectImports);
    };

    // Collect usage
    const collectUsage = (node: ts.Node) => {
      if (ts.isIdentifier(node) && !ts.isImportSpecifier(node.parent!)) {
        usedNames.add(node.text);
      }
      ts.forEachChild(node, collectUsage);
    };

    collectImports(sourceFile);
    collectUsage(sourceFile);

    // Find unused imports
    for (const importedName of importedNames) {
      if (!usedNames.has(importedName)) {
        const importNode = importNodes.get(importedName)!;
        const diagnostic = CustomDiagnosticFactory.createDiagnostic(
          sourceFile,
          importNode.getStart(sourceFile),
          importNode.getWidth(sourceFile),
          \`Import '\${importedName}' is unused.\`,
          9002,
          ts.DiagnosticCategory.Warning,
          'no-unused-imports-rule'
        );
        diagnostics.push(diagnostic);
      }
    }

    return diagnostics;
  }
}

class NoMagicNumbersRule implements LintRule {
  name = 'no-magic-numbers';
  description = 'Disallows magic numbers';

  constructor(
    private config: {
      allowedNumbers?: number[];
      ignoreArrayIndexes?: boolean;
    } = {}
  ) {}

  check(sourceFile: ts.SourceFile): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    const allowedNumbers = new Set(this.config.allowedNumbers || [0, 1, -1]);

    const visit = (node: ts.Node) => {
      if (ts.isNumericLiteral(node)) {
        const value = parseFloat(node.text);
        
        // Skip allowed numbers
        if (allowedNumbers.has(value)) {
          ts.forEachChild(node, visit);
          return;
        }

        // Skip array indexes if configured
        if (this.config.ignoreArrayIndexes && this.isArrayIndex(node)) {
          ts.forEachChild(node, visit);
          return;
        }

        const diagnostic = CustomDiagnosticFactory.createDiagnostic(
          sourceFile,
          node.getStart(sourceFile),
          node.getWidth(sourceFile),
          \`Magic number '\${node.text}' should be replaced with a named constant.\`,
          9003,
          ts.DiagnosticCategory.Warning,
          'no-magic-numbers-rule'
        );
        diagnostics.push(diagnostic);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return diagnostics;
  }

  private isArrayIndex(node: ts.NumericLiteral): boolean {
    const parent = node.parent;
    return ts.isElementAccessExpression(parent) && parent.argumentExpression === node;
  }
}

class PreferConstRule implements LintRule {
  name = 'prefer-const';
  description = 'Suggests const for variables that are never reassigned';

  check(sourceFile: ts.SourceFile): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    const variableDeclarations = new Map<string, ts.VariableDeclaration>();
    const reassignedVariables = new Set<string>();

    // Collect let declarations
    const collectDeclarations = (node: ts.Node) => {
      if (ts.isVariableStatement(node) && 
          node.declarationList.flags & ts.NodeFlags.Let) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            variableDeclarations.set(declaration.name.text, declaration);
          }
        }
      }
      ts.forEachChild(node, collectDeclarations);
    };

    // Collect reassignments
    const collectReassignments = (node: ts.Node) => {
      if (ts.isBinaryExpression(node) && 
          node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          ts.isIdentifier(node.left)) {
        reassignedVariables.add(node.left.text);
      }
      ts.forEachChild(node, collectReassignments);
    };

    collectDeclarations(sourceFile);
    collectReassignments(sourceFile);

    // Check for variables that could be const
    for (const [varName, declaration] of variableDeclarations) {
      if (!reassignedVariables.has(varName) && declaration.initializer) {
        const diagnostic = CustomDiagnosticFactory.createDiagnostic(
          sourceFile,
          declaration.getStart(sourceFile),
          declaration.getWidth(sourceFile),
          \`Variable '\${varName}' is never reassigned. Use 'const' instead of 'let'.\`,
          9004,
          ts.DiagnosticCategory.Suggestion,
          'prefer-const-rule'
        );
        diagnostics.push(diagnostic);
      }
    }

    return diagnostics;
  }
}

// ===== CUSTOM LINTER ENGINE =====
class CustomLinter {
  private rules: LintRule[] = [];

  addRule(rule: LintRule): this {
    this.rules.push(rule);
    return this;
  }

  removeRule(ruleName: string): this {
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
    return this;
  }

  lint(sourceFile: ts.SourceFile): {
    diagnostics: ts.Diagnostic[];
    ruleResults: Map<string, ts.Diagnostic[]>;
    summary: {
      totalIssues: number;
      errorCount: number;
      warningCount: number;
      suggestionCount: number;
    };
  } {
    const allDiagnostics: ts.Diagnostic[] = [];
    const ruleResults = new Map<string, ts.Diagnostic[]>();

    for (const rule of this.rules) {
      const diagnostics = rule.check(sourceFile);
      ruleResults.set(rule.name, diagnostics);
      allDiagnostics.push(...diagnostics);
    }

    const summary = this.calculateSummary(allDiagnostics);

    return {
      diagnostics: allDiagnostics,
      ruleResults,
      summary
    };
  }

  private calculateSummary(diagnostics: ts.Diagnostic[]): {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    suggestionCount: number;
  } {
    let errorCount = 0, warningCount = 0, suggestionCount = 0;

    for (const diagnostic of diagnostics) {
      switch (diagnostic.category) {
        case ts.DiagnosticCategory.Error:
          errorCount++;
          break;
        case ts.DiagnosticCategory.Warning:
          warningCount++;
          break;
        case ts.DiagnosticCategory.Suggestion:
          suggestionCount++;
          break;
      }
    }

    return {
      totalIssues: diagnostics.length,
      errorCount,
      warningCount,
      suggestionCount
    };
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateCustomDiagnostics(): void {
  console.log('=== Custom Diagnostics Demo ===');

  const testCode = \`
import { unused } from './utils';
import React from 'react';

let mutableVar = 42;
let unchangedVar = 100;

function processData(data: any[]) {
  console.log("Processing data...");
  console.error("This might fail");
  
  const items = data.slice(0, 10);
  return items.map((item, index) => {
    return item * 2.5 * 3.14159; // Magic numbers!
  });
}

const result = processData([1, 2, 3]);
console.log(result);
  \`;

  const sourceFile = ts.createSourceFile(
    'test.ts',
    testCode,
    ts.ScriptTarget.Latest,
    true
  );

  const linter = new CustomLinter()
    .addRule(new NoConsoleRule({ allowedMethods: [] }))
    .addRule(new NoUnusedImportsRule())
    .addRule(new NoMagicNumbersRule({ allowedNumbers: [0, 1, 2] }))
    .addRule(new PreferConstRule());

  const results = linter.lint(sourceFile);

  console.log('\\n=== Linting Summary ===');
  console.log(\`Total issues: \${results.summary.totalIssues}\`);
  console.log(\`Errors: \${results.summary.errorCount}\`);
  console.log(\`Warnings: \${results.summary.warningCount}\`);
  console.log(\`Suggestions: \${results.summary.suggestionCount}\`);

  console.log('\\n=== Issues by Rule ===');
  for (const [ruleName, diagnostics] of results.ruleResults) {
    console.log(\`\${ruleName}: \${diagnostics.length} issues\`);
  }

  console.log('\\n=== All Issues ===');
  results.diagnostics.forEach(diagnostic => {
    const category = ts.DiagnosticCategory[diagnostic.category];
    const line = diagnostic.file && diagnostic.start !== undefined 
      ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1
      : '?';
    const message = typeof diagnostic.messageText === 'string' 
      ? diagnostic.messageText 
      : diagnostic.messageText.messageText;
    
    console.log(\`[\${category}] Line \${line}: \${message} (\${diagnostic.source})\`);
  });
}`,

    diagnosticFormatting: `// Advanced diagnostic formatting and presentation

import * as ts from 'typescript';
import * as chalk from 'chalk'; // For colored output

// ===== DIAGNOSTIC FORMATTER =====
class DiagnosticFormatter {
  formatDiagnostic(diagnostic: ts.Diagnostic, options: {
    colorize?: boolean;
    showSource?: boolean;
    showContext?: boolean;
    contextLines?: number;
  } = {}): string {
    const opts = {
      colorize: true,
      showSource: true,
      showContext: true,
      contextLines: 2,
      ...options
    };

    let output = '';

    // Format header
    output += this.formatHeader(diagnostic, opts.colorize);
    
    // Format message
    output += this.formatMessage(diagnostic, opts.colorize);
    
    // Format source context
    if (opts.showContext && diagnostic.file && diagnostic.start !== undefined) {
      output += '\n' + this.formatSourceContext(diagnostic, opts.contextLines);
    }

    // Format related information
    if (diagnostic.relatedInformation && diagnostic.relatedInformation.length > 0) {
      output += '\n' + this.formatRelatedInformation(diagnostic.relatedInformation);
    }

    return output;
  }

  private formatHeader(diagnostic: ts.Diagnostic, colorize: boolean): string {
    const category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
    const location = this.getLocationString(diagnostic);
    
    const categoryFormatted = colorize 
      ? this.colorizeCategory(category, diagnostic.category)
      : category;
    
    return \`\${categoryFormatted} TS\${diagnostic.code}: \${location}\`;
  }

  private formatMessage(diagnostic: ts.Diagnostic, colorize: boolean): string {
    const message = this.flattenDiagnosticMessageText(diagnostic.messageText);
    return colorize ? chalk.bold(message) : message;
  }

  private formatSourceContext(diagnostic: ts.Diagnostic, contextLines: number): string {
    if (!diagnostic.file || diagnostic.start === undefined) {
      return '';
    }

    const sourceFile = diagnostic.file;
    const start = diagnostic.start;
    const length = diagnostic.length || 1;
    
    const startLineAndChar = sourceFile.getLineAndCharacterOfPosition(start);
    const endLineAndChar = sourceFile.getLineAndCharacterOfPosition(start + length);
    
    const startLine = Math.max(0, startLineAndChar.line - contextLines);
    const endLine = Math.min(
      sourceFile.getLineAndCharacterOfPosition(sourceFile.end).line,
      endLineAndChar.line + contextLines
    );

    let output = '';
    const lines = sourceFile.text.split('\n');
    
    for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
      const line = lines[lineNum];
      const lineNumber = (lineNum + 1).toString().padStart(4);
      const isErrorLine = lineNum >= startLineAndChar.line && lineNum <= endLineAndChar.line;
      
      output += \`\${lineNumber} | \${line}\n\`;
      
      // Add error indicators
      if (isErrorLine) {
        const padding = ' '.repeat(7); // Space for line number + " | "
        let indicator = '';
        
        if (lineNum === startLineAndChar.line) {
          indicator = ' '.repeat(startLineAndChar.character) + 
                     '~'.repeat(Math.min(length, line.length - startLineAndChar.character));
        } else if (lineNum === endLineAndChar.line && endLineAndChar.character > 0) {
          indicator = '~'.repeat(endLineAndChar.character);
        } else {
          indicator = '~'.repeat(line.length);
        }
        
        if (indicator) {
          output += \`\${padding}\${chalk.red(indicator)}\n\`;
        }
      }
    }

    return output.trim();
  }

  private formatRelatedInformation(relatedInfo: ts.DiagnosticRelatedInformation[]): string {
    return relatedInfo
      .map(info => \`  → \${this.getLocationString(info)}: \${this.flattenDiagnosticMessageText(info.messageText)}\`)
      .join('\n');
  }

  private getLocationString(diagnostic: ts.Diagnostic | ts.DiagnosticRelatedInformation): string {
    if (!diagnostic.file || diagnostic.start === undefined) {
      return '<unknown location>';
    }

    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    return \`\${diagnostic.file.fileName}(\${line + 1},\${character + 1})\`;
  }

  private colorizeCategory(category: string, categoryEnum: ts.DiagnosticCategory): string {
    switch (categoryEnum) {
      case ts.DiagnosticCategory.Error:
        return chalk.red(category);
      case ts.DiagnosticCategory.Warning:
        return chalk.yellow(category);
      case ts.DiagnosticCategory.Suggestion:
        return chalk.blue(category);
      case ts.DiagnosticCategory.Message:
        return chalk.gray(category);
      default:
        return category;
    }
  }

  private flattenDiagnosticMessageText(messageText: string | ts.DiagnosticMessageChain): string {
    if (typeof messageText === 'string') {
      return messageText;
    }

    let result = messageText.messageText;
    if (messageText.next) {
      for (const chain of messageText.next) {
        result += '\n  ' + this.flattenDiagnosticMessageText(chain);
      }
    }
    return result;
  }

  formatSummary(diagnostics: ts.Diagnostic[], options: {
    showFileBreakdown?: boolean;
    showCodeBreakdown?: boolean;
    colorize?: boolean;
  } = {}): string {
    const opts = { showFileBreakdown: true, showCodeBreakdown: true, colorize: true, ...options };
    
    let output = '';
    
    // Overall summary
    const summary = this.getSummaryStats(diagnostics);
    output += this.formatSummaryStats(summary, opts.colorize);
    
    // File breakdown
    if (opts.showFileBreakdown) {
      output += '\n\n' + this.formatFileBreakdown(diagnostics);
    }
    
    // Code breakdown
    if (opts.showCodeBreakdown) {
      output += '\n\n' + this.formatCodeBreakdown(diagnostics);
    }
    
    return output;
  }

  private getSummaryStats(diagnostics: ts.Diagnostic[]): {
    total: number;
    errors: number;
    warnings: number;
    suggestions: number;
    files: number;
  } {
    const files = new Set<string>();
    let errors = 0, warnings = 0, suggestions = 0;

    for (const diagnostic of diagnostics) {
      if (diagnostic.file) {
        files.add(diagnostic.file.fileName);
      }
      
      switch (diagnostic.category) {
        case ts.DiagnosticCategory.Error:
          errors++;
          break;
        case ts.DiagnosticCategory.Warning:
          warnings++;
          break;
        case ts.DiagnosticCategory.Suggestion:
          suggestions++;
          break;
      }
    }

    return {
      total: diagnostics.length,
      errors,
      warnings,
      suggestions,
      files: files.size
    };
  }

  private formatSummaryStats(stats: any, colorize: boolean): string {
    const { total, errors, warnings, suggestions, files } = stats;
    
    let output = \`Found \${total} issue\${total !== 1 ? 's' : ''} in \${files} file\${files !== 1 ? 's' : ''}\`;
    
    if (colorize) {
      const parts = [];
      if (errors > 0) parts.push(chalk.red(\`\${errors} error\${errors !== 1 ? 's' : ''}\`));
      if (warnings > 0) parts.push(chalk.yellow(\`\${warnings} warning\${warnings !== 1 ? 's' : ''}\`));
      if (suggestions > 0) parts.push(chalk.blue(\`\${suggestions} suggestion\${suggestions !== 1 ? 's' : ''}\`));
      
      if (parts.length > 0) {
        output += \` (\${parts.join(', ')})\`;
      }
    } else {
      const parts = [];
      if (errors > 0) parts.push(\`\${errors} error\${errors !== 1 ? 's' : ''}\`);
      if (warnings > 0) parts.push(\`\${warnings} warning\${warnings !== 1 ? 's' : ''}\`);
      if (suggestions > 0) parts.push(\`\${suggestions} suggestion\${suggestions !== 1 ? 's' : ''}\`);
      
      if (parts.length > 0) {
        output += \` (\${parts.join(', ')})\`;
      }
    }
    
    return output;
  }

  private formatFileBreakdown(diagnostics: ts.Diagnostic[]): string {
    const fileGroups = new Map<string, ts.Diagnostic[]>();
    
    for (const diagnostic of diagnostics) {
      const fileName = diagnostic.file?.fileName || '<unknown>';
      if (!fileGroups.has(fileName)) {
        fileGroups.set(fileName, []);
      }
      fileGroups.get(fileName)!.push(diagnostic);
    }

    const sortedFiles = Array.from(fileGroups.entries())
      .sort(([, a], [, b]) => b.length - a.length);

    let output = 'Issues by file:';
    for (const [fileName, fileDiagnostics] of sortedFiles) {
      const stats = this.getSummaryStats(fileDiagnostics);
      output += \`\n  \${fileName}: \${stats.total} issue\${stats.total !== 1 ? 's' : ''}\`;
    }
    
    return output;
  }

  private formatCodeBreakdown(diagnostics: ts.Diagnostic[]): string {
    const codeGroups = new Map<number, ts.Diagnostic[]>();
    
    for (const diagnostic of diagnostics) {
      if (!codeGroups.has(diagnostic.code)) {
        codeGroups.set(diagnostic.code, []);
      }
      codeGroups.get(diagnostic.code)!.push(diagnostic);
    }

    const sortedCodes = Array.from(codeGroups.entries())
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 10); // Top 10

    let output = 'Most common issues:';
    for (const [code, codeDiagnostics] of sortedCodes) {
      const firstDiagnostic = codeDiagnostics[0];
      const message = this.flattenDiagnosticMessageText(firstDiagnostic.messageText);
      output += \`\n  TS\${code}: \${message} (\${codeDiagnostics.length} occurrence\${codeDiagnostics.length !== 1 ? 's' : ''})\`;
    }
    
    return output;
  }
}

// ===== HTML DIAGNOSTIC REPORTER =====
class HTMLDiagnosticReporter {
  generateReport(diagnostics: ts.Diagnostic[], title: string = 'TypeScript Diagnostics Report'): string {
    const html = \`
<!DOCTYPE html>
<html>
<head>
    <title>\${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .diagnostic { margin-bottom: 15px; padding: 15px; border-left: 4px solid; }
        .error { border-color: #dc3545; background: #f8d7da; }
        .warning { border-color: #ffc107; background: #fff3cd; }
        .suggestion { border-color: #17a2b8; background: #d1ecf1; }
        .code-block { background: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace; margin: 10px 0; }
        .line-number { color: #6c757d; margin-right: 10px; }
        .error-line { background: #ffebee; }
        h1, h2 { color: #333; }
        .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; }
        .badge-error { background: #dc3545; color: white; }
        .badge-warning { background: #ffc107; color: black; }
        .badge-suggestion { background: #17a2b8; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>\${title}</h1>
        \${this.generateSummaryHTML(diagnostics)}
        \${this.generateDiagnosticsHTML(diagnostics)}
    </div>
</body>
</html>
    \`;
    
    return html;
  }

  private generateSummaryHTML(diagnostics: ts.Diagnostic[]): string {
    const stats = this.getSummaryStats(diagnostics);
    
    return \`
    <div class="summary">
        <h2>Summary</h2>
        <p>Found <strong>\${stats.total}</strong> issues in <strong>\${stats.files}</strong> files</p>
        <div>
            <span class="badge badge-error">\${stats.errors} Errors</span>
            <span class="badge badge-warning">\${stats.warnings} Warnings</span>
            <span class="badge badge-suggestion">\${stats.suggestions} Suggestions</span>
        </div>
    </div>
    \`;
  }

  private generateDiagnosticsHTML(diagnostics: ts.Diagnostic[]): string {
    let html = '<h2>Issues</h2>';
    
    for (const diagnostic of diagnostics) {
      const category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
      const location = this.getLocationString(diagnostic);
      const message = this.flattenDiagnosticMessageText(diagnostic.messageText);
      
      html += \`
      <div class="diagnostic \${category}">
          <h3>TS\${diagnostic.code}: \${location}</h3>
          <p>\${this.escapeHTML(message)}</p>
          \${this.generateSourceContextHTML(diagnostic)}
      </div>
      \`;
    }
    
    return html;
  }

  private generateSourceContextHTML(diagnostic: ts.Diagnostic): string {
    if (!diagnostic.file || diagnostic.start === undefined) {
      return '';
    }

    const sourceFile = diagnostic.file;
    const start = diagnostic.start;
    const length = diagnostic.length || 1;
    
    const startLineAndChar = sourceFile.getLineAndCharacterOfPosition(start);
    const lines = sourceFile.text.split('\n');
    const contextStart = Math.max(0, startLineAndChar.line - 2);
    const contextEnd = Math.min(lines.length - 1, startLineAndChar.line + 2);
    
    let html = '<div class="code-block">';
    
    for (let lineNum = contextStart; lineNum <= contextEnd; lineNum++) {
      const line = lines[lineNum];
      const isErrorLine = lineNum === startLineAndChar.line;
      const lineClass = isErrorLine ? 'error-line' : '';
      
      html += \`
      <div class="\${lineClass}">
          <span class="line-number">\${(lineNum + 1).toString().padStart(3)}</span>
          <span>\${this.escapeHTML(line)}</span>
      </div>
      \`;
    }
    
    html += '</div>';
    return html;
  }

  private getSummaryStats = DiagnosticFormatter.prototype['getSummaryStats'];
  private getLocationString = DiagnosticFormatter.prototype['getLocationString'];
  private flattenDiagnosticMessageText = DiagnosticFormatter.prototype['flattenDiagnosticMessageText'];

  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateDiagnosticFormatting(): void {
  console.log('=== Diagnostic Formatting Demo ===');

  const problemCode = \`
import { unused, Component } from 'react';

let mutableValue = 42;
const items = [1, 2, 3, 4, 5];

function processItems() {
  console.log("Starting process");
  
  const result = items.map(item => item * 3.14159);
  mutableValue = 100;
  
  return result;
}

export default processItems;
  \`;

  const sourceFile = ts.createSourceFile(
    'example.ts',
    problemCode,
    ts.ScriptTarget.Latest,
    true
  );

  // Create some sample diagnostics
  const diagnostics: ts.Diagnostic[] = [
    {
      file: sourceFile,
      start: problemCode.indexOf('unused'),
      length: 6,
      messageText: "Import 'unused' is declared but never used.",
      category: ts.DiagnosticCategory.Warning,
      code: 6133,
      source: 'typescript'
    },
    {
      file: sourceFile,
      start: problemCode.indexOf('3.14159'),
      length: 7,
      messageText: "Magic number '3.14159' should be replaced with a named constant.",
      category: ts.DiagnosticCategory.Suggestion,
      code: 9003,
      source: 'custom-linter'
    }
  ];

  const formatter = new DiagnosticFormatter();
  
  console.log('\\n=== Formatted Diagnostics ===');
  for (const diagnostic of diagnostics) {
    console.log(formatter.formatDiagnostic(diagnostic));
    console.log('-'.repeat(50));
  }
  
  console.log('\\n=== Summary ===');
  console.log(formatter.formatSummary(diagnostics));

  // Generate HTML report
  const htmlReporter = new HTMLDiagnosticReporter();
  const htmlReport = htmlReporter.generateReport(diagnostics, 'Sample Diagnostic Report');
  
  // In a real application, you would write this to a file
  console.log('\\n=== HTML Report Generated ===');
  console.log('HTML report length:', htmlReport.length, 'characters');
}`,

    quickFixes: `// Implementing quick fixes and code actions

import * as ts from 'typescript';

// ===== CODE ACTION PROVIDER =====
interface CodeAction {
  description: string;
  changes: ts.FileTextChanges[];
  kind?: string;
  isPreferred?: boolean;
}

interface CodeFixProvider {
  provideCodeFixes(
    sourceFile: ts.SourceFile,
    diagnostic: ts.Diagnostic
  ): CodeAction[];
}

// ===== NO UNUSED IMPORTS FIX =====
class NoUnusedImportsFixProvider implements CodeFixProvider {
  provideCodeFixes(sourceFile: ts.SourceFile, diagnostic: ts.Diagnostic): CodeAction[] {
    if (diagnostic.code !== 9002) { // Our custom "unused import" code
      return [];
    }

    const fixes: CodeAction[] = [];
    const importDeclaration = this.findImportAtPosition(sourceFile, diagnostic.start!);
    
    if (!importDeclaration) {
      return fixes;
    }

    // Fix 1: Remove the entire import statement
    fixes.push({
      description: "Remove unused import",
      changes: [{
        fileName: sourceFile.fileName,
        textChanges: [{
          span: {
            start: importDeclaration.getFullStart(),
            length: importDeclaration.getFullWidth()
          },
          newText: ""
        }]
      }],
      kind: "quickfix",
      isPreferred: true
    });

    // Fix 2: Remove only the unused import specifier (for named imports)
    if (importDeclaration.importClause?.namedBindings && 
        ts.isNamedImports(importDeclaration.importClause.namedBindings)) {
      
      const namedImports = importDeclaration.importClause.namedBindings;
      const unusedSpecifier = this.findUnusedSpecifier(namedImports, diagnostic.start!);
      
      if (unusedSpecifier && namedImports.elements.length > 1) {
        const newElements = namedImports.elements.filter(el => el !== unusedSpecifier);
        const newImportClause = ts.factory.createImportClause(
          false,
          importDeclaration.importClause.name,
          ts.factory.createNamedImports(newElements)
        );
        
        const newImportDeclaration = ts.factory.createImportDeclaration(
          importDeclaration.decorators,
          importDeclaration.modifiers,
          newImportClause,
          importDeclaration.moduleSpecifier,
          importDeclaration.assertClause
        );

        const printer = ts.createPrinter();
        const newText = printer.printNode(ts.EmitHint.Unspecified, newImportDeclaration, sourceFile);

        fixes.push({
          description: \`Remove unused import '\${unusedSpecifier.name.text}'\`,
          changes: [{
            fileName: sourceFile.fileName,
            textChanges: [{
              span: {
                start: importDeclaration.getStart(sourceFile),
                length: importDeclaration.getWidth(sourceFile)
              },
              newText
            }]
          }]
        });
      }
    }

    return fixes;
  }

  private findImportAtPosition(sourceFile: ts.SourceFile, position: number): ts.ImportDeclaration | undefined {
    function visit(node: ts.Node): ts.ImportDeclaration | undefined {
      if (ts.isImportDeclaration(node) &&
          node.getStart(sourceFile) <= position &&
          node.getEnd() >= position) {
        return node;
      }
      return ts.forEachChild(node, visit);
    }
    
    return visit(sourceFile);
  }

  private findUnusedSpecifier(namedImports: ts.NamedImports, position: number): ts.ImportSpecifier | undefined {
    return namedImports.elements.find(element => 
      element.getStart() <= position && element.getEnd() >= position
    );
  }
}

// ===== PREFER CONST FIX =====
class PreferConstFixProvider implements CodeFixProvider {
  provideCodeFixes(sourceFile: ts.SourceFile, diagnostic: ts.Diagnostic): CodeAction[] {
    if (diagnostic.code !== 9004) { // Our custom "prefer const" code
      return [];
    }

    const variableStatement = this.findVariableStatementAtPosition(sourceFile, diagnostic.start!);
    if (!variableStatement) {
      return [];
    }

    // Replace 'let' with 'const'
    const newDeclarationList = ts.factory.createVariableDeclarationList(
      variableStatement.declarationList.declarations,
      ts.NodeFlags.Const
    );

    const newVariableStatement = ts.factory.createVariableStatement(
      variableStatement.modifiers,
      newDeclarationList
    );

    const printer = ts.createPrinter();
    const newText = printer.printNode(ts.EmitHint.Unspecified, newVariableStatement, sourceFile);

    return [{
      description: "Change 'let' to 'const'",
      changes: [{
        fileName: sourceFile.fileName,
        textChanges: [{
          span: {
            start: variableStatement.getStart(sourceFile),
            length: variableStatement.getWidth(sourceFile)
          },
          newText
        }]
      }],
      kind: "quickfix",
      isPreferred: true
    }];
  }

  private findVariableStatementAtPosition(sourceFile: ts.SourceFile, position: number): ts.VariableStatement | undefined {
    function visit(node: ts.Node): ts.VariableStatement | undefined {
      if (ts.isVariableStatement(node) &&
          node.getStart(sourceFile) <= position &&
          node.getEnd() >= position) {
        return node;
      }
      return ts.forEachChild(node, visit);
    }
    
    return visit(sourceFile);
  }
}

// ===== NO CONSOLE FIX =====
class NoConsoleFixProvider implements CodeFixProvider {
  provideCodeFixes(sourceFile: ts.SourceFile, diagnostic: ts.Diagnostic): CodeAction[] {
    if (diagnostic.code !== 9001) { // Our custom "no console" code
      return [];
    }

    const callExpression = this.findConsoleCallAtPosition(sourceFile, diagnostic.start!);
    if (!callExpression || 
        !ts.isPropertyAccessExpression(callExpression.expression) ||
        !ts.isIdentifier(callExpression.expression.expression) ||
        callExpression.expression.expression.text !== 'console') {
      return [];
    }

    const method = callExpression.expression.name.text;
    const fixes: CodeAction[] = [];

    // Fix 1: Replace with logger
    const newCallExpression = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('logger'),
        method
      ),
      callExpression.typeArguments,
      callExpression.arguments
    );

    const printer = ts.createPrinter();
    const newText = printer.printNode(ts.EmitHint.Unspecified, newCallExpression, sourceFile);

    fixes.push({
      description: \`Replace console.\${method} with logger.\${method}\`,
      changes: [{
        fileName: sourceFile.fileName,
        textChanges: [{
          span: {
            start: callExpression.getStart(sourceFile),
            length: callExpression.getWidth(sourceFile)
          },
          newText
        }]
      }],
      kind: "quickfix",
      isPreferred: true
    });

    // Fix 2: Remove the console statement
    fixes.push({
      description: `Remove console.${method} statement`,
      changes: [{
        fileName: sourceFile.fileName,
        textChanges: [{
          span: {
            start: this.getStatementStart(callExpression, sourceFile),
            length: this.getStatementLength(callExpression, sourceFile)
          },
          newText: ""
        }]
      }],
      kind: "quickfix"
    });

    return fixes;
  }

  private findConsoleCallAtPosition(sourceFile: ts.SourceFile, position: number): ts.CallExpression | undefined {
    function visit(node: ts.Node): ts.CallExpression | undefined {
      if (ts.isCallExpression(node) &&
          node.getStart(sourceFile) <= position &&
          node.getEnd() >= position) {
        return node;
      }
      return ts.forEachChild(node, visit);
    }
    
    return visit(sourceFile);
  }

  private getStatementStart(node: ts.Node, sourceFile: ts.SourceFile): number {
    // Find the containing statement
    let current = node.parent;
    while (current && !ts.isStatement(current)) {
      current = current.parent;
    }
    return current ? current.getFullStart() : node.getStart(sourceFile);
  }

  private getStatementLength(node: ts.Node, sourceFile: ts.SourceFile): number {
    let current = node.parent;
    while (current && !ts.isStatement(current)) {
      current = current.parent;
    }
    return current ? current.getFullWidth() : node.getWidth(sourceFile);
  }
}

// ===== MAGIC NUMBERS FIX =====
class MagicNumbersFixProvider implements CodeFixProvider {
  provideCodeFixes(sourceFile: ts.SourceFile, diagnostic: ts.Diagnostic): CodeAction[] {
    if (diagnostic.code !== 9003) { // Our custom "magic numbers" code
      return [];
    }

    const numericLiteral = this.findNumericLiteralAtPosition(sourceFile, diagnostic.start!);
    if (!numericLiteral) {
      return [];
    }

    const value = numericLiteral.text;
    const constantName = this.suggestConstantName(value);
    
    // Find the top-level scope to add the constant
    const topLevelStatements = sourceFile.statements;
    const insertPosition = this.findInsertPosition(sourceFile);

    const fixes: CodeAction[] = [];

    // Fix 1: Extract to const at module level
    const constDeclaration = `const ${constantName} = ${value};\n`;
    
    fixes.push({
      description: `Extract '${value}' to constant '${constantName}'`,
      changes: [{
        fileName: sourceFile.fileName,
        textChanges: [
          {
            span: { start: insertPosition, length: 0 },
            newText: constDeclaration
          },
          {
            span: {
              start: numericLiteral.getStart(sourceFile),
              length: numericLiteral.getWidth(sourceFile)
            },
            newText: constantName
          }
        ]
      }],
      kind: "refactor.extract.constant",
      isPreferred: true
    });

    return fixes;
  }

  private findNumericLiteralAtPosition(sourceFile: ts.SourceFile, position: number): ts.NumericLiteral | undefined {
    function visit(node: ts.Node): ts.NumericLiteral | undefined {
      if (ts.isNumericLiteral(node) &&
          node.getStart(sourceFile) <= position &&
          node.getEnd() >= position) {
        return node;
      }
      return ts.forEachChild(node, visit);
    }
    
    return visit(sourceFile);
  }

  private suggestConstantName(value: string): string {
    const num = parseFloat(value);
    
    // Common mathematical constants
    if (Math.abs(num - Math.PI) < 0.0001) return 'PI';
    if (Math.abs(num - Math.E) < 0.0001) return 'E';
    if (num === 360) return 'FULL_CIRCLE_DEGREES';
    if (num === 180) return 'HALF_CIRCLE_DEGREES';
    if (num === 90) return 'QUARTER_CIRCLE_DEGREES';
    if (num === 100) return 'PERCENTAGE_BASE';
    if (num === 1000) return 'THOUSAND';
    
    // Generate generic name
    const cleanValue = value.replace(/[.-]/g, '_').toUpperCase();
    return `CONSTANT_${cleanValue}`;
  }

  private findInsertPosition(sourceFile: ts.SourceFile): number {
    // Insert after imports but before other declarations
    let insertPos = 0;
    
    for (const statement of sourceFile.statements) {
      if (ts.isImportDeclaration(statement) || ts.isImportEqualsDeclaration(statement)) {
        insertPos = statement.getEnd();
      } else {
        break;
      }
    }
    
    return insertPos;
  }
}

// ===== CODE ACTION MANAGER =====
class CodeActionManager {
  private providers = new Map<number, CodeFixProvider[]>();

  registerProvider(diagnosticCode: number, provider: CodeFixProvider): void {
    if (!this.providers.has(diagnosticCode)) {
      this.providers.set(diagnosticCode, []);
    }
    this.providers.get(diagnosticCode)!.push(provider);
  }

  getCodeActions(sourceFile: ts.SourceFile, diagnostic: ts.Diagnostic): CodeAction[] {
    const providers = this.providers.get(diagnostic.code) || [];
    const allActions: CodeAction[] = [];

    for (const provider of providers) {
      const actions = provider.provideCodeFixes(sourceFile, diagnostic);
      allActions.push(...actions);
    }

    return allActions;
  }

  applyCodeAction(action: CodeAction): Map<string, string> {
    const results = new Map<string, string>();

    for (const fileChange of action.changes) {
      let content = ''; // In practice, you'd read the current file content
      
      // Apply text changes in reverse order to maintain positions
      const sortedChanges = [...fileChange.textChanges].sort((a, b) => b.span.start - a.span.start);
      
      for (const change of sortedChanges) {
        const before = content.substring(0, change.span.start);
        const after = content.substring(change.span.start + change.span.length);
        content = before + change.newText + after;
      }
      
      results.set(fileChange.fileName, content);
    }

    return results;
  }
}

// ===== REFACTORING ACTIONS =====
class RefactoringProvider {
  extractMethod(
    sourceFile: ts.SourceFile,
    start: number,
    end: number,
    methodName: string
  ): CodeAction | null {
    const selectedStatements = this.getStatementsInRange(sourceFile, start, end);
    if (selectedStatements.length === 0) {
      return null;
    }

    // Analyze variables used in the selected code
    const analysis = this.analyzeVariableUsage(selectedStatements, sourceFile);
    
    // Create method parameters from used variables
    const parameters = analysis.usedFromOutside.map(varName => 
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        varName,
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
      )
    );

    // Create the extracted method
    const extractedMethod = ts.factory.createFunctionDeclaration(
      undefined,
      undefined,
      methodName,
      undefined,
      parameters,
      undefined,
      ts.factory.createBlock(selectedStatements, true)
    );

    // Create method call to replace selected code
    const methodCall = ts.factory.createCallExpression(
      ts.factory.createIdentifier(methodName),
      undefined,
      analysis.usedFromOutside.map(varName => ts.factory.createIdentifier(varName))
    );

    const printer = ts.createPrinter();
    const methodText = printer.printNode(ts.EmitHint.Unspecified, extractedMethod, sourceFile);
    const callText = printer.printNode(ts.EmitHint.Unspecified, methodCall, sourceFile);

    return {
      description: `Extract method '${methodName}'`,
      changes: [{
        fileName: sourceFile.fileName,
        textChanges: [
          {
            span: { start: this.findInsertPosition(sourceFile), length: 0 },
            newText: methodText + '\n\n'
          },
          {
            span: { start, length: end - start },
            newText: callText
          }
        ]
      }],
      kind: "refactor.extract.function"
    };
  }

  private getStatementsInRange(sourceFile: ts.SourceFile, start: number, end: number): ts.Statement[] {
    const statements: ts.Statement[] = [];
    
    function visit(node: ts.Node) {
      if (ts.isStatement(node) &&
          node.getStart(sourceFile) >= start &&
          node.getEnd() <= end) {
        statements.push(node);
      } else if (node.getStart(sourceFile) < end && node.getEnd() > start) {
        ts.forEachChild(node, visit);
      }
    }
    
    visit(sourceFile);
    return statements;
  }

  private analyzeVariableUsage(statements: ts.Statement[], sourceFile: ts.SourceFile): {
    declared: Set<string>;
    usedFromOutside: string[];
    returnedValues: string[];
  } {
    const declared = new Set<string>();
    const used = new Set<string>();

    // Collect declared variables
    const collectDeclarations = (node: ts.Node) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        declared.add(node.name.text);
      }
      if (ts.isFunctionDeclaration(node) && node.name) {
        declared.add(node.name.text);
      }
      ts.forEachChild(node, collectDeclarations);
    };

    // Collect used variables
    const collectUsage = (node: ts.Node) => {
      if (ts.isIdentifier(node) && !this.isDeclaration(node)) {
        used.add(node.text);
      }
      ts.forEachChild(node, collectUsage);
    };

    for (const statement of statements) {
      collectDeclarations(statement);
      collectUsage(statement);
    }

    const usedFromOutside = Array.from(used).filter(name => !declared.has(name));

    return {
      declared,
      usedFromOutside,
      returnedValues: [] // Simplified - would need more analysis
    };
  }

  private isDeclaration(node: ts.Node): boolean {
    return ts.isVariableDeclaration(node.parent!) ||
           ts.isFunctionDeclaration(node.parent!) ||
           ts.isParameter(node.parent!);
  }

  private findInsertPosition(sourceFile: ts.SourceFile): number {
    // Find a good position to insert the method
    for (const statement of sourceFile.statements) {
      if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
        return statement.getStart(sourceFile);
      }
    }
    return sourceFile.getEnd();
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateQuickFixes(): void {
  console.log('=== Quick Fixes Demo ===');

  const problemCode = `
import { unused, React } from 'react';

let unchangedValue = 42;
const items = [1, 2, 3];

function processData() {
  console.log("Processing...");
  const result = items.map(item => item * 3.14159);
  
  if (result.length > 10) {
    console.error("Too many items");
  }
  
  return result;
}

export default processData;
  `;

  const sourceFile = ts.createSourceFile(
    'example.ts',
    problemCode,
    ts.ScriptTarget.Latest,
    true
  );

  // Create sample diagnostics
  const diagnostics: ts.Diagnostic[] = [
    {
      file: sourceFile,
      start: problemCode.indexOf('unused'),
      length: 6,
      messageText: "Import 'unused' is declared but never used.",
      category: ts.DiagnosticCategory.Warning,
      code: 9002,
      source: 'custom-linter'
    },
    {
      file: sourceFile,
      start: problemCode.indexOf('unchangedValue'),
      length: 14,
      messageText: "Variable 'unchangedValue' is never reassigned. Use 'const' instead of 'let'.",
      category: ts.DiagnosticCategory.Suggestion,
      code: 9004,
      source: 'custom-linter'
    },
    {
      file: sourceFile,
      start: problemCode.indexOf('console.log'),
      length: 11,
      messageText: "Console 'log' is not allowed. Use logger.log() instead.",
      category: ts.DiagnosticCategory.Warning,
      code: 9001,
      source: 'custom-linter'
    },
    {
      file: sourceFile,
      start: problemCode.indexOf('3.14159'),
      length: 7,
      messageText: "Magic number '3.14159' should be replaced with a named constant.",
      category: ts.DiagnosticCategory.Warning,
      code: 9003,
      source: 'custom-linter'
    }
  ];

  // Setup code action manager
  const actionManager = new CodeActionManager();
  actionManager.registerProvider(9002, new NoUnusedImportsFixProvider());
  actionManager.registerProvider(9004, new PreferConstFixProvider());
  actionManager.registerProvider(9001, new NoConsoleFixProvider());
  actionManager.registerProvider(9003, new MagicNumbersFixProvider());

  console.log('\n=== Available Quick Fixes ===');
  for (const diagnostic of diagnostics) {
    const actions = actionManager.getCodeActions(sourceFile, diagnostic);
    const message = typeof diagnostic.messageText === 'string' 
      ? diagnostic.messageText 
      : diagnostic.messageText.messageText;
    
    console.log(`\nDiagnostic: ${message}`);
    console.log('Available fixes:');
    actions.forEach((action, index) => {
      console.log(`  ${index + 1}. ${action.description} ${action.isPreferred ? '(preferred)' : ''}`);
    });
  }

  // Demonstrate refactoring
  console.log('\n=== Refactoring Example ===');
  const refactoring = new RefactoringProvider();
  const extractStart = problemCode.indexOf('const result =');
  const extractEnd = problemCode.indexOf('return result;');
  
  const extractAction = refactoring.extractMethod(
    sourceFile,
    extractStart,
    extractEnd,
    'calculateResults'
  );

  if (extractAction) {
    console.log(`Refactoring available: ${extractAction.description}`);
    console.log('Changes would be applied to:', extractAction.changes[0].fileName);
    console.log('Number of text changes:', extractAction.changes[0].textChanges.length);
  }
}`,

    advanced: `// File location: src/data/concepts/compiler-api/diagnostics.ts

// Advanced diagnostic techniques and integration

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// ===== DIAGNOSTIC AGGREGATOR =====
class DiagnosticAggregator {
  private diagnostics: ts.Diagnostic[] = [];
  private fileStats = new Map<string, {
    errorCount: number;
    warningCount: number;
    suggestionCount: number;
    lastModified: number;
  }>();

  addDiagnostics(diagnostics: ts.Diagnostic[]): void {
    this.diagnostics.push(...diagnostics);
    this.updateFileStats(diagnostics);
  }

  private updateFileStats(diagnostics: ts.Diagnostic[]): void {
    for (const diagnostic of diagnostics) {
      const fileName = diagnostic.file?.fileName || '<global>';
      const stats = this.fileStats.get(fileName) || {
        errorCount: 0,
        warningCount: 0,
        suggestionCount: 0,
        lastModified: Date.now()
      };

      switch (diagnostic.category) {
        case ts.DiagnosticCategory.Error:
          stats.errorCount++;
          break;
        case ts.DiagnosticCategory.Warning:
          stats.warningCount++;
          break;
        case ts.DiagnosticCategory.Suggestion:
          stats.suggestionCount++;
          break;
      }

      stats.lastModified = Date.now();
      this.fileStats.set(fileName, stats);
    }
  }

  getTrendAnalysis(timeWindowMs: number = 24 * 60 * 60 * 1000): {
    trending: Array<{
      file: string;
      errorTrend: 'up' | 'down' | 'stable';
      currentErrors: number;
      riskScore: number;
    }>;
    summary: {
      totalFiles: number;
      improvingFiles: number;
      degradingFiles: number;
      stableFiles: number;
    };
  } {
    const now = Date.now();
    const cutoff = now - timeWindowMs;
    const trending: Array<any> = [];

    for (const [fileName, stats] of this.fileStats) {
      if (stats.lastModified < cutoff) continue;

      const riskScore = this.calculateRiskScore(stats);
      const errorTrend = this.determineErrorTrend(fileName, stats);

      trending.push({
        file: fileName,
        errorTrend,
        currentErrors: stats.errorCount,
        riskScore
      });
    }

    const improving = trending.filter(t => t.errorTrend === 'down').length;
    const degrading = trending.filter(t => t.errorTrend === 'up').length;
    const stable = trending.filter(t => t.errorTrend === 'stable').length;

    return {
      trending: trending.sort((a, b) => b.riskScore - a.riskScore),
      summary: {
        totalFiles: trending.length,
        improvingFiles: improving,
        degradingFiles: degrading,
        stableFiles: stable
      }
    };
  }

  private calculateRiskScore(stats: any): number {
    const errorWeight = 3;
    const warningWeight = 1;
    const suggestionWeight = 0.5;

    return stats.errorCount * errorWeight + 
           stats.warningCount * warningWeight + 
           stats.suggestionCount * suggestionWeight;
  }

  private determineErrorTrend(fileName: string, currentStats: any): 'up' | 'down' | 'stable' {
    // Simplified trend analysis - in practice, you'd track history
    const historicalAverage = 2; // Mock historical data
    const current = currentStats.errorCount;

    if (current > historicalAverage * 1.2) return 'up';
    if (current < historicalAverage * 0.8) return 'down';
    return 'stable';
  }

  getDiagnosticHeatMap(): {
    byLine: Map<string, Map<number, number>>;
    byMethod: Map<string, Map<string, number>>;
    byModule: Map<string, number>;
  } {
    const byLine = new Map<string, Map<number, number>>();
    const byMethod = new Map<string, Map<string, number>>();
    const byModule = new Map<string, number>();

    for (const diagnostic of this.diagnostics) {
      if (!diagnostic.file || diagnostic.start === undefined) continue;

      const fileName = diagnostic.file.fileName;
      const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

      // Update line-based heat map
      if (!byLine.has(fileName)) {
        byLine.set(fileName, new Map());
      }
      const fileLines = byLine.get(fileName)!;
      fileLines.set(line, (fileLines.get(line) || 0) + 1);

      // Update module-based count
      byModule.set(fileName, (byModule.get(fileName) || 0) + 1);
    }

    return { byLine, byMethod, byModule };
  }

  exportDiagnostics(format: 'json' | 'csv' | 'xml' = 'json'): string {
    switch (format) {
      case 'json':
        return this.exportAsJSON();
      case 'csv':
        return this.exportAsCSV();
      case 'xml':
        return this.exportAsXML();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private exportAsJSON(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      diagnostics: this.diagnostics.map(d => ({
        file: d.file?.fileName,
        line: d.file && d.start !== undefined ? 
          d.file.getLineAndCharacterOfPosition(d.start).line + 1 : null,
        column: d.file && d.start !== undefined ?
          d.file.getLineAndCharacterOfPosition(d.start).character + 1 : null,
        category: ts.DiagnosticCategory[d.category],
        code: d.code,
        message: typeof d.messageText === 'string' ? 
          d.messageText : d.messageText.messageText,
        source: d.source || 'typescript'
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  private exportAsCSV(): string {
    const headers = ['File', 'Line', 'Column', 'Category', 'Code', 'Message', 'Source'];
    const rows = [headers.join(',')];

    for (const diagnostic of this.diagnostics) {
      const file = diagnostic.file?.fileName || '';
      const line = diagnostic.file && diagnostic.start !== undefined ?
        diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : '';
      const column = diagnostic.file && diagnostic.start !== undefined ?
        diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).character + 1 : '';
      const category = ts.DiagnosticCategory[diagnostic.category];
      const message = (typeof diagnostic.messageText === 'string' ? 
        diagnostic.messageText : diagnostic.messageText.messageText).replace(/"/g, '""');
      const source = diagnostic.source || 'typescript';

      rows.push([file, line, column, category, diagnostic.code, `"${message}"`, source].join(','));
    }

    return rows.join('\n');
  }

  private exportAsXML(): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<diagnostics>\n';
    
    for (const diagnostic of this.diagnostics) {
      xml += '  <diagnostic>\n';
      xml += `    <file>${this.escapeXML(diagnostic.file?.fileName || '')}</file>\n`;
      
      if (diagnostic.file && diagnostic.start !== undefined) {
        const pos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        xml += `    <line>${pos.line + 1}</line>\n`;
        xml += `    <column>${pos.character + 1}</column>\n`;
      }
      
      xml += `    <category>${ts.DiagnosticCategory[diagnostic.category]}</category>\n`;
      xml += `    <code>${diagnostic.code}</code>\n`;
      xml += `    <message>${this.escapeXML(typeof diagnostic.messageText === 'string' ? 
        diagnostic.messageText : diagnostic.messageText.messageText)}</message>\n`;
      xml += `    <source>${diagnostic.source || 'typescript'}</source>\n`;
      xml += '  </diagnostic>\n';
    }
    
    xml += '</diagnostics>';
    return xml;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  private getSummary() {
    let errors = 0, warnings = 0, suggestions = 0;
    const files = new Set<string>();

    for (const diagnostic of this.diagnostics) {
      if (diagnostic.file) files.add(diagnostic.file.fileName);
      
      switch (diagnostic.category) {
        case ts.DiagnosticCategory.Error: errors++; break;
        case ts.DiagnosticCategory.Warning: warnings++; break;
        case ts.DiagnosticCategory.Suggestion: suggestions++; break;
      }
    }

    return {
      total: this.diagnostics.length,
      errors,
      warnings,
      suggestions,
      files: files.size
    };
  }
}

// ===== DIAGNOSTIC PIPELINE =====
class DiagnosticPipeline {
  private stages: DiagnosticStage[] = [];
  private context = new Map<string, any>();

  addStage(stage: DiagnosticStage): this {
    this.stages.push(stage);
    return this;
  }

  async process(sourceFiles: ts.SourceFile[]): Promise<{
    diagnostics: ts.Diagnostic[];
    stageResults: Map<string, any>;
    metrics: {
      processingTime: number;
      filesProcessed: number;
      stagesExecuted: number;
    };
  }> {
    const startTime = Date.now();
    const allDiagnostics: ts.Diagnostic[] = [];
    const stageResults = new Map<string, any>();

    for (const stage of this.stages) {
      const stageStart = Date.now();
      
      try {
        const result = await stage.process(sourceFiles, this.context);
        allDiagnostics.push(...result.diagnostics);
        stageResults.set(stage.name, result);
        
        // Update context with stage results
        if (result.context) {
          for (const [key, value] of Object.entries(result.context)) {
            this.context.set(key, value);
          }
        }
        
        console.log(`Stage '${stage.name}' completed in ${Date.now() - stageStart}ms`);
      } catch (error) {
        console.error(`Stage '${stage.name}' failed:`, error);
        continue;
      }
    }

    return {
      diagnostics: allDiagnostics,
      stageResults,
      metrics: {
        processingTime: Date.now() - startTime,
        filesProcessed: sourceFiles.length,
        stagesExecuted: this.stages.length
      }
    };
  }
}

interface DiagnosticStage {
  name: string;
  process(sourceFiles: ts.SourceFile[], context: Map<string, any>): Promise<{
    diagnostics: ts.Diagnostic[];
    context?: Record<string, any>;
  }>;
}

class SyntaxCheckStage implements DiagnosticStage {
  name = 'syntax-check';

  async process(sourceFiles: ts.SourceFile[]): Promise<{
    diagnostics: ts.Diagnostic[];
  }> {
    const diagnostics: ts.Diagnostic[] = [];
    
    for (const sourceFile of sourceFiles) {
      const syntaxDiagnostics = sourceFile.parseDiagnostics || [];
      diagnostics.push(...syntaxDiagnostics);
    }

    return { diagnostics };
  }
}

class SemanticCheckStage implements DiagnosticStage {
  name = 'semantic-check';
  
  constructor(private compilerOptions: ts.CompilerOptions = {}) {}

  async process(sourceFiles: ts.SourceFile[]): Promise<{
    diagnostics: ts.Diagnostic[];
    context: Record<string, any>;
  }> {
    const fileNames = sourceFiles.map(sf => sf.fileName);
    const host = ts.createCompilerHost(this.compilerOptions);
    
    // Override getSourceFile to use our in-memory files
    const sourceFileMap = new Map(sourceFiles.map(sf => [sf.fileName, sf]));
    host.getSourceFile = (fileName) => sourceFileMap.get(fileName);

    const program = ts.createProgram(fileNames, this.compilerOptions, host);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    return {
      diagnostics,
      context: {
        program,
        typeChecker: program.getTypeChecker()
      }
    };
  }
}

class CustomLintingStage implements DiagnosticStage {
  name = 'custom-linting';
  
  constructor(private rules: Array<{ check: (sf: ts.SourceFile) => ts.Diagnostic[] }>) {}

  async process(sourceFiles: ts.SourceFile[]): Promise<{
    diagnostics: ts.Diagnostic[];
  }> {
    const diagnostics: ts.Diagnostic[] = [];
    
    for (const sourceFile of sourceFiles) {
      for (const rule of this.rules) {
        const ruleDiagnostics = rule.check(sourceFile);
        diagnostics.push(...ruleDiagnostics);
      }
    }

    return { diagnostics };
  }
}

// ===== DIAGNOSTIC WATCHER =====
class DiagnosticWatcher {
  private watchers = new Map<string, fs.FSWatcher>();
  private aggregator = new DiagnosticAggregator();
  private pipeline: DiagnosticPipeline;
  private onChangeCallback?: (diagnostics: ts.Diagnostic[]) => void;

  constructor(pipeline: DiagnosticPipeline) {
    this.pipeline = pipeline;
  }

  watchDirectory(dirPath: string, options: {
    extensions?: string[];
    recursive?: boolean;
    debounceMs?: number;
  } = {}): void {
    const opts = {
      extensions: ['.ts', '.tsx'],
      recursive: true,
      debounceMs: 300,
      ...options
    };

    const changeHandler = this.debounce(async (fileName: string) => {
      await this.processFile(fileName);
    }, opts.debounceMs);

    const watcher = fs.watch(dirPath, { recursive: opts.recursive }, (eventType, filename) => {
      if (!filename) return;
      
      const fullPath = path.join(dirPath, filename);
      const ext = path.extname(fullPath);
      
      if (opts.extensions.includes(ext)) {
        changeHandler(fullPath);
      }
    });

    this.watchers.set(dirPath, watcher);
  }

  watchFile(filePath: string, debounceMs: number = 300): void {
    const changeHandler = this.debounce(async () => {
      await this.processFile(filePath);
    }, debounceMs);

    const watcher = fs.watchFile(filePath, changeHandler);
    this.watchers.set(filePath, watcher as any);
  }

  private async processFile(fileName: string): Promise<void> {
    try {
      if (!fs.existsSync(fileName)) {
        console.log(`File ${fileName} was deleted`);
        return;
      }

      const content = fs.readFileSync(fileName, 'utf-8');
      const sourceFile = ts.createSourceFile(
        fileName,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const result = await this.pipeline.process([sourceFile]);
      this.aggregator.addDiagnostics(result.diagnostics);

      if (this.onChangeCallback) {
        this.onChangeCallback(result.diagnostics);
      }

      console.log(`Processed ${fileName}: ${result.diagnostics.length} diagnostics`);
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
    }
  }

  onChange(callback: (diagnostics: ts.Diagnostic[]) => void): void {
    this.onChangeCallback = callback;
  }

  stopWatching(): void {
    for (const watcher of this.watchers.values()) {
      if ('close' in watcher) {
        watcher.close();
      } else {
        fs.unwatchFile(watcher as any);
      }
    }
    this.watchers.clear();
  }

  getAggregatedDiagnostics(): ts.Diagnostic[] {
    return this.aggregator['diagnostics'];
  }

  private debounce<T extends (...args: any[]) => any>(
    func: T,
    waitMs: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), waitMs);
    };
  }
}

// ===== USAGE EXAMPLES =====
export function demonstrateAdvancedDiagnostics(): void {
  console.log('=== Advanced Diagnostics Demo ===');

  // Setup diagnostic pipeline
  const pipeline = new DiagnosticPipeline()
    .addStage(new SyntaxCheckStage())
    .addStage(new SemanticCheckStage({
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      strict: true
    }))
    .addStage(new CustomLintingStage([
      { check: (sf) => new (class {
          check(sourceFile: ts.SourceFile): ts.Diagnostic[] {
            // Simple console.log detector
            const diagnostics: ts.Diagnostic[] = [];
            const visit = (node: ts.Node) => {
              if (ts.isCallExpression(node) &&
                  ts.isPropertyAccessExpression(node.expression) &&
                  ts.isIdentifier(node.expression.expression) &&
                  node.expression.expression.text === 'console') {
                diagnostics.push({
                  file: sourceFile,
                  start: node.getStart(sourceFile),
                  length: node.getWidth(sourceFile),
                  messageText: 'Console statements are not allowed in production code',
                  category: ts.DiagnosticCategory.Warning,
                  code: 9001,
                  source: 'production-rules'
                });
              }
              ts.forEachChild(node, visit);
            };
            visit(sourceFile);
            return diagnostics;
          }
        })().check(sf) }
    ]));

  const sampleCode = `
const data: string[] = ["hello", "world"];
console.log(data);

function process(items: any[]): number {
  return items.length;
}

// This will cause a type error
const result: string = process(data);
  `;

  const sourceFile = ts.createSourceFile(
    'sample.ts',
    sampleCode,
    ts.ScriptTarget.Latest,
    true
  );

  // Process with pipeline
  pipeline.process([sourceFile]).then(result => {
    console.log('\n=== Pipeline Results ===');
    console.log(`Processing time: ${result.metrics.processingTime}ms`);
    console.log(`Files processed: ${result.metrics.filesProcessed}`);
    console.log(`Stages executed: ${result.metrics.stagesExecuted}`);
    console.log(`Total diagnostics: ${result.diagnostics.length}`);

    // Demonstrate aggregator
    const aggregator = new DiagnosticAggregator();
    aggregator.addDiagnostics(result.diagnostics);

    console.log('\n=== Exported JSON ===');
    const jsonExport = aggregator.exportDiagnostics('json');
    console.log(jsonExport.substring(0, 500) + '...');

    // Demonstrate heat map
    const heatMap = aggregator.getDiagnosticHeatMap();
    console.log('\n=== Heat Map ===');
    for (const [fileName, lines] of heatMap.byLine) {
      console.log(`File: ${fileName}`);
      for (const [lineNum, count] of lines) {
        console.log(`  Line ${lineNum + 1}: ${count} issue(s)`);
      }
    }
  }).catch(console.error);

  // Demonstrate watcher (in a real app)
  console.log('\n=== Setting up file watcher ===');
  const watcher = new DiagnosticWatcher(pipeline);
  
  watcher.onChange((diagnostics) => {
    console.log(`File changed - found ${diagnostics.length} new diagnostics`);
  });

  // Note: In a real application, you would call:
  // watcher.watchDirectory('./src');
  console.log('Watcher setup complete (not actually watching in demo)');
}`
  },

  keyPoints: [
    "Diagnostics provide detailed error, warning, and suggestion information about TypeScript code",
    "Custom diagnostic rules can be created to enforce project-specific coding standards",
    "Diagnostic formatting enhances readability with colors, context, and structured output",
    "Quick fixes and code actions enable automated problem resolution and refactoring",
    "Advanced diagnostic aggregation supports trend analysis and reporting",
    "Diagnostic pipelines enable modular, extensible analysis workflows",
    "File watching enables real-time diagnostic updates during development",
    "Export capabilities support integration with external tools and CI/CD systems",
    "Heat maps and analytics help identify problem areas and code quality trends",
    "Integration with language services provides IDE-like diagnostic experiences"
  ]
};
