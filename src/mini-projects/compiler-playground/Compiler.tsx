// File: mini-projects/compiler-playground/Compiler.tsx

import React, { useState, useCallback, useMemo } from 'react';
import ASTViewer, { ASTNode } from './ASTViewer';
import { parseToAST, transformAST, generateCode } from './transformer';

interface CompilerError {
  message: string;
  line?: number;
  column?: number;
}

const Compiler: React.FC = () => {
  const [sourceCode, setSourceCode] = useState(`// Simple arithmetic expression
let x = 10;
let y = 20;
let result = x + y * 2;
console.log(result);`);
  
  const [ast, setAST] = useState<ASTNode | null>(null);
  const [transformedAST, setTransformedAST] = useState<ASTNode | null>(null);
  const [outputCode, setOutputCode] = useState<string>('');
  const [errors, setErrors] = useState<CompilerError[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);

  const compile = useCallback(async () => {
    setIsCompiling(true);
    setErrors([]);
    
    try {
      // Step 1: Parse to AST
      const parsedAST = parseToAST(sourceCode);
      setAST(parsedAST);
      
      // Step 2: Transform AST
      const transformed = transformAST(parsedAST);
      setTransformedAST(transformed);
      
      // Step 3: Generate output code
      const generated = generateCode(transformed);
      setOutputCode(generated);
      
    } catch (error) {
      const compilerError: CompilerError = {
        message: error instanceof Error ? error.message : 'Unknown compilation error',
        line: 1,
        column: 1
      };
      setErrors([compilerError]);
      setAST(null);
      setTransformedAST(null);
      setOutputCode('');
    } finally {
      setIsCompiling(false);
    }
  }, [sourceCode]);

  const handleReset = () => {
    setSourceCode(`// Simple arithmetic expression
let x = 10;
let y = 20;
let result = x + y * 2;
console.log(result);`);
    setAST(null);
    setTransformedAST(null);
    setOutputCode('');
    setErrors([]);
  };

  // Auto-compile when source changes (debounced)
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (sourceCode.trim()) {
        compile();
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [sourceCode, compile]);

  return (
    <div className="compiler-playground min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compiler Playground
          </h1>
          <p className="text-gray-600">
            Write code, see the AST, transformations, and generated output
          </p>
        </header>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={compile}
            disabled={isCompiling}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isCompiling ? 'Compiling...' : 'Compile'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Reset
          </button>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Compilation Errors:</h3>
            {errors.map((error, index) => (
              <div key={index} className="text-red-700">
                {error.line && error.column && (
                  <span className="font-mono text-sm">Line {error.line}:{error.column} - </span>
                )}
                {error.message}
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Code Input */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-800">Source Code</h2>
              </div>
              <div className="p-4">
                <textarea
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  className="w-full h-64 p-3 font-mono text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your code here..."
                />
              </div>
            </div>

            {/* Generated Code Output */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-800">Generated Code</h2>
              </div>
              <div className="p-4">
                <pre className="w-full h-64 p-3 bg-gray-50 font-mono text-sm border rounded overflow-auto">
                  {outputCode || '// Generated code will appear here'}
                </pre>
              </div>
            </div>
          </div>

          {/* AST Views */}
          <div className="space-y-4">
            <ASTViewer 
              ast={ast} 
              className="h-64"
            />
            
            {transformedAST && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-gray-800">Transformed AST</h2>
                </div>
                <ASTViewer 
                  ast={transformedAST} 
                  className="h-64"
                />
              </div>
            )}
          </div>
        </div>

        {/* Compilation Pipeline Status */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-800 mb-3">Compilation Pipeline</h3>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${ast ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${ast ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Parse</span>
            </div>
            <div className="text-gray-300">→</div>
            <div className={`flex items-center space-x-2 ${transformedAST ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${transformedAST ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Transform</span>
            </div>
            <div className="text-gray-300">→</div>
            <div className={`flex items-center space-x-2 ${outputCode ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${outputCode ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Generate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compiler;