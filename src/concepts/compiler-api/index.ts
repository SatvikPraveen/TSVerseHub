// File location: src/data/concepts/compiler-api/index.ts

import { astExplorerContent, ASTExplorerContent } from './ast-explorer';
import { diagnosticsContent, DiagnosticsContent } from './diagnostics';
import { transpilerContent, TranspilerContent } from './transpiler';
import { compilerAPIExercises, CompilerAPIExercise } from './exercises';

export interface CompilerAPIContent {
  title: string;
  description: string;
  sections: {
    astExplorer: ASTExplorerContent;
    diagnostics: DiagnosticsContent;
    transpiler: TranspilerContent;
  };
  exercises: CompilerAPIExercise[];
  overview: {
    whatYouWillLearn: string[];
    prerequisites: string[];
    keyTopics: string[];
  };
  resources: {
    officialDocs: Array<{ title: string; url: string; description: string }>;
    tools: Array<{ name: string; url: string; description: string }>;
    examples: Array<{ name: string; description: string; githubUrl?: string }>;
  };
}

export const compilerAPIContent: CompilerAPIContent = {
  title: "TypeScript Compiler API",
  description: "Master the TypeScript Compiler API to build powerful development tools, custom transformers, linters, and code analysis utilities. This comprehensive guide covers AST manipulation, type checking, diagnostics, and advanced compilation techniques.",
  
  sections: {
    astExplorer: astExplorerContent,
    diagnostics: diagnosticsContent,
    transpiler: transpilerContent,
  },
  
  exercises: compilerAPIExercises,
  
  overview: {
    whatYouWillLearn: [
      "Parse and traverse TypeScript Abstract Syntax Trees (AST)",
      "Build custom transformers to modify code during compilation",
      "Create diagnostic tools and custom linting rules",
      "Implement code analysis and refactoring utilities",
      "Generate source maps and handle module transformations",
      "Work with the TypeScript type checker for semantic analysis",
      "Build incremental compilation systems and watch mode tools",
      "Create language service plugins for enhanced IDE support",
      "Develop custom transpilers and code generators",
      "Handle complex module resolution and dependency analysis"
    ],
    
    prerequisites: [
      "Strong understanding of TypeScript language features",
      "Familiarity with Abstract Syntax Trees (AST) concepts",
      "Basic knowledge of compiler theory and parsing",
      "Experience with Node.js and npm ecosystem",
      "Understanding of module systems (CommonJS, ES Modules)",
      "Familiarity with build tools and development workflows"
    ],
    
    keyTopics: [
      "AST Node Types and Traversal Patterns",
      "Custom Transformer Development",
      "Diagnostic Generation and Error Reporting",
      "Source Map Generation and Debugging",
      "Type Checker Integration and Semantic Analysis",
      "Module System Transformations",
      "Incremental Compilation and Caching",
      "Language Service Plugin Development",
      "Code Generation and Template Systems",
      "Performance Optimization Techniques"
    ]
  },
  
  resources: {
    officialDocs: [
      {
        title: "TypeScript Compiler API Documentation",
        url: "https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API",
        description: "Official documentation for the TypeScript Compiler API"
      },
      {
        title: "TypeScript AST Viewer",
        url: "https://ts-ast-viewer.com/",
        description: "Interactive tool for exploring TypeScript AST structures"
      },
      {
        title: "TypeScript Handbook - Compiler Options",
        url: "https://www.typescriptlang.org/docs/handbook/compiler-options.html",
        description: "Complete reference for TypeScript compiler options"
      },
      {
        title: "Language Service API",
        url: "https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API",
        description: "Guide to using the TypeScript Language Service API"
      }
    ],
    
    tools: [
      {
        name: "ts-morph",
        url: "https://ts-morph.com/",
        description: "TypeScript Compiler API wrapper for easier AST manipulation"
      },
      {
        name: "TypeScript ESTree",
        url: "https://typescript-eslint.io/packages/typescript-estree/",
        description: "Parser that converts TypeScript to ESTree-compatible AST"
      },
      {
        name: "ttypescript",
        url: "https://github.com/cevek/ttypescript",
        description: "TypeScript compiler with transformer support"
      },
      {
        name: "ts-node",
        url: "https://typestrong.org/ts-node/",
        description: "TypeScript execution and REPL for Node.js"
      },
      {
        name: "TypeScript Transformer Handbook",
        url: "https://github.com/itsdouges/typescript-transformer-handbook",
        description: "Comprehensive guide to writing TypeScript transformers"
      }
    ],
    
    examples: [
      {
        name: "Custom Transformer Examples",
        description: "Collection of practical TypeScript transformer examples",
        githubUrl: "https://github.com/kimamula/ts-transformer-examples"
      },
      {
        name: "TypeScript Compiler API Samples",
        description: "Official Microsoft samples for Compiler API usage",
        githubUrl: "https://github.com/Microsoft/TypeScript/tree/master/samples"
      },
      {
        name: "AST Manipulation Utilities",
        description: "Utilities for common AST manipulation tasks"
      },
      {
        name: "Custom Linting Rules",
        description: "Examples of building custom TypeScript linting rules"
      },
      {
        name: "Code Generation Templates",
        description: "Template systems built with the Compiler API"
      }
    ]
  }
};

// Export individual content sections for direct access
export { astExplorerContent } from './ast-explorer';
export { diagnosticsContent } from './diagnostics';
export { transpilerContent } from './transpiler';
export { compilerAPIExercises, compilerAPIExerciseCategories, getExercisesByDifficulty, getExerciseById } from './exercises';

// Export types for external use
export type { ASTExplorerContent } from './ast-explorer';
export type { DiagnosticsContent } from './diagnostics';
export type { TranspilerContent } from './transpiler';
export type { CompilerAPIExercise } from './exercises';