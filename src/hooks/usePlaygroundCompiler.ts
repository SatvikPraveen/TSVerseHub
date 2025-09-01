// File: src/hooks/usePlaygroundCompiler.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from './useDebounce';

// Types for TypeScript compiler integration
export interface CompilerOptions {
  target: string;
  module: string;
  strict: boolean;
  esModuleInterop: boolean;
  skipLibCheck: boolean;
  forceConsistentCasingInFileNames: boolean;
  noEmit?: boolean;
}

export interface CompilerDiagnostic {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: number;
}

export interface CompilerResult {
  javascript: string;
  diagnostics: CompilerDiagnostic[];
  success: boolean;
  executionTime: number;
}

export interface PlaygroundState {
  typescript: string;
  javascript: string;
  diagnostics: CompilerDiagnostic[];
  isCompiling: boolean;
  options: CompilerOptions;
}

const DEFAULT_OPTIONS: CompilerOptions = {
  target: 'ES2020',
  module: 'ESNext',
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  noEmit: false,
};

const DEFAULT_TYPESCRIPT = `// Welcome to the TypeScript Playground!
// Try typing some TypeScript code below and see it compile in real-time

interface User {
  id: number;
  name: string;
  email?: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): readonly User[] {
    return Object.freeze([...this.users]);
  }
}

// Create a new user service
const userService = new UserService();

// Add some users
userService.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
userService.addUser({ id: 2, name: 'Bob' });

// Get users
const alice = userService.getUserById(1);
const allUsers = userService.getAllUsers();

console.log('Alice:', alice);
console.log('All users:', allUsers);

// Generic function example
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>('Hello TypeScript!');

// Union types and type guards
type Status = 'loading' | 'success' | 'error';

function handleStatus(status: Status): string {
  switch (status) {
    case 'loading':
      return 'Please wait...';
    case 'success':
      return 'Operation completed!';
    case 'error':
      return 'Something went wrong!';
    default:
      // TypeScript ensures this is unreachable
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

console.log('Status message:', handleStatus('success'));`;

/**
 * Mock TypeScript compiler for demonstration
 * In a real implementation, this would use the actual TypeScript compiler API
 */
const mockCompileTypeScript = async (
  code: string,
  options: CompilerOptions
): Promise<CompilerResult> => {
  const startTime = performance.now();
  
  // Simulate compilation delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const diagnostics: CompilerDiagnostic[] = [];
  
  // Simple error detection for demo purposes
  if (code.includes('any')) {
    diagnostics.push({
      line: code.split('\n').findIndex(line => line.includes('any')) + 1,
      column: 1,
      message: 'Type "any" is not allowed when strict mode is enabled',
      severity: 'error',
      code: 2304,
    });
  }
  
  if (code.includes('console.log') && options.strict) {
    diagnostics.push({
      line: code.split('\n').findIndex(line => line.includes('console.log')) + 1,
      column: 1,
      message: 'Consider using a proper logging solution instead of console.log',
      severity: 'warning',
      code: 2345,
    });
  }
  
  // Simple TypeScript to JavaScript transformation
  let javascript = code
    .replace(/: (string|number|boolean|\w+(\[\])?)/g, '') // Remove type annotations
    .replace(/interface \w+ \{[^}]+\}/g, '') // Remove interfaces
    .replace(/class (\w+)/g, 'class $1') // Keep classes
    .replace(/private |public |protected /g, '') // Remove access modifiers
    .replace(/<\w+>/g, '') // Remove generic type parameters
    .replace(/readonly /g, '') // Remove readonly modifier
    .replace(/\?\:/g, ':') // Remove optional property markers
    .trim();
  
  // Add some basic ES6+ features
  javascript = `"use strict";\n\n${javascript}`;
  
  const executionTime = performance.now() - startTime;
  
  return {
    javascript,
    diagnostics,
    success: diagnostics.filter(d => d.severity === 'error').length === 0,
    executionTime,
  };
};

/**
 * Custom hook for TypeScript playground functionality
 */
export const usePlaygroundCompiler = (initialCode?: string) => {
  const [state, setState] = useState<PlaygroundState>({
    typescript: initialCode || DEFAULT_TYPESCRIPT,
    javascript: '',
    diagnostics: [],
    isCompiling: false,
    options: DEFAULT_OPTIONS,
  });

  const compilerWorkerRef = useRef<Worker | null>(null);

  // Debounced compilation function
  const [debouncedCompile] = useDebouncedCallback(
    async (code: string, options: CompilerOptions) => {
      setState(prev => ({ ...prev, isCompiling: true }));
      
      try {
        const result = await mockCompileTypeScript(code, options);
        
        setState(prev => ({
          ...prev,
          javascript: result.javascript,
          diagnostics: result.diagnostics,
          isCompiling: false,
        }));
      } catch (error) {
        console.error('Compilation failed:', error);
        setState(prev => ({
          ...prev,
          javascript: '// Compilation failed',
          diagnostics: [{
            line: 1,
            column: 1,
            message: error instanceof Error ? error.message : 'Unknown compilation error',
            severity: 'error',
            code: 0,
          }],
          isCompiling: false,
        }));
      }
    },
    500
  );

  // Update TypeScript code
  const updateTypeScript = useCallback((code: string) => {
    setState(prev => ({ ...prev, typescript: code }));
    debouncedCompile(code, state.options);
  }, [debouncedCompile, state.options]);

  // Update compiler options
  const updateOptions = useCallback((newOptions: Partial<CompilerOptions>) => {
    const updatedOptions = { ...state.options, ...newOptions };
    setState(prev => ({ ...prev, options: updatedOptions }));
    debouncedCompile(state.typescript, updatedOptions);
  }, [debouncedCompile, state.typescript, state.options]);

  // Reset to default code
  const resetCode = useCallback(() => {
    setState(prev => ({
      ...prev,
      typescript: DEFAULT_TYPESCRIPT,
      javascript: '',
      diagnostics: [],
    }));
    debouncedCompile(DEFAULT_TYPESCRIPT, state.options);
  }, [debouncedCompile, state.options]);

  // Load example code
  const loadExample = useCallback((exampleCode: string) => {
    setState(prev => ({ ...prev, typescript: exampleCode }));
    debouncedCompile(exampleCode, state.options);
  }, [debouncedCompile, state.options]);

  // Format code (simple implementation)
  const formatCode = useCallback(() => {
    const formatted = state.typescript
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .replace(/\{\s*\n\s*\n/g, '{\n')
      .replace(/\n\s*\n\s*\}/g, '\n}');
    
    updateTypeScript(formatted);
  }, [state.typescript, updateTypeScript]);

  // Get compilation statistics
  const getStats = useCallback(() => {
    const lines = state.typescript.split('\n').length;
    const characters = state.typescript.length;
    const errorCount = state.diagnostics.filter(d => d.severity === 'error').length;
    const warningCount = state.diagnostics.filter(d => d.severity === 'warning').length;
    
    return {
      lines,
      characters,
      errorCount,
      warningCount,
      hasErrors: errorCount > 0,
    };
  }, [state.typescript, state.diagnostics]);

  // Initial compilation
  useEffect(() => {
    debouncedCompile(state.typescript, state.options);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (compilerWorkerRef.current) {
        compilerWorkerRef.current.terminate();
      }
    };
  }, []);

  return {
    // State
    typescript: state.typescript,
    javascript: state.javascript,
    diagnostics: state.diagnostics,
    isCompiling: state.isCompiling,
    options: state.options,
    
    // Actions
    updateTypeScript,
    updateOptions,
    resetCode,
    loadExample,
    formatCode,
    
    // Utilities
    getStats,
  };
};