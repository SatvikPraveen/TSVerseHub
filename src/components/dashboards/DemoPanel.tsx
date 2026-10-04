/* File: src/components/dashboards/DemoPanel.tsx */

import { useState, useEffect, useMemo } from 'react';

import { usePlaygroundCompiler } from '../../hooks/usePlaygroundCompiler';
import CodeEditor from '../editors/CodeEditor';
import { kernelDiagnosticsToMarkers } from '../editors/kernelMarkers';
import { Button } from '../ui/Button';
import CompoundTabs from '../ui/Tabs';

import type { CompilerResult } from '../../hooks/usePlaygroundCompiler';
import type React from 'react';

interface DemoPanelProps {
  title: string;
  description?: string;
  initialCode: string;
  expectedOutput?: string;
  concepts?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  onCodeChange?: (code: string) => void;
  onRun?: (result: CompilerResult) => void;
  className?: string;
  editorHeight?: number | string;
  showOutput?: boolean;
  showExplanation?: boolean;
  readOnly?: boolean;
}

const DemoPanel: React.FC<DemoPanelProps> = ({
  title,
  description,
  initialCode,
  expectedOutput,
  concepts = [],
  difficulty = 'beginner',
  onCodeChange,
  onRun,
  className = '',
  editorHeight = '300px',
  showOutput = true,
  showExplanation = true,
  readOnly = false,
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [explanation, setExplanation] = useState('');

  // Diagnostics come from the compiler kernel with the EditorConfig `learning` preset.
  const { transpile, updateTypeScript, diagnostics, analysis, timings } = usePlaygroundCompiler({
    initialCode,
    preset: 'learning',
    debounceMs: 500,
    onResult: onRun
  });

  const markers = useMemo(
    () => (analysis ? kernelDiagnosticsToMarkers(analysis.result.diagnostics, analysis.text) : []),
    [analysis],
  );

  // Follow external changes of the sample (e.g. switching topics).
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    updateTypeScript(code);
  }, [code, updateTypeScript]);

  // Handle code changes
  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined) {
      setCode(newCode);
      onCodeChange?.(newCode);
    }
  };

  // Run code
  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      // Transpile TypeScript to JavaScript
      const jsCode = await transpile(code);
      
      if (jsCode) {
        // Create a safe execution environment
        const consoleOutput: string[] = [];
        const mockConsole = {
          log: (...args: unknown[]) => {
            consoleOutput.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
          },
          error: (...args: unknown[]) => {
            consoleOutput.push(`Error: ${args.join(' ')}`);
          },
          warn: (...args: unknown[]) => {
            consoleOutput.push(`Warning: ${args.join(' ')}`);
          }
        };

        try {
          // Execute the code
          const func = new Function('console', jsCode);
          func(mockConsole);
          setOutput(consoleOutput.join('\n') || 'Code executed successfully (no output)');
        } catch (runtimeError) {
          setOutput(`Runtime Error: ${runtimeError instanceof Error ? runtimeError.message : String(runtimeError)}`);
        }
      } else {
        setOutput('Compilation failed');
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Generate explanation based on code analysis
  useEffect(() => {
    const generateExplanation = () => {
      let explanationText = '';

      if (code.includes('interface')) {
        explanationText += '🔷 This example demonstrates TypeScript interfaces, which define the structure of objects.\n\n';
      }
      
      if (code.includes('type ')) {
        explanationText += '🔸 Type aliases are used here to create reusable type definitions.\n\n';
      }
      
      if (code.includes('function')) {
        explanationText += '⚡ Functions with type annotations ensure type safety for parameters and return values.\n\n';
      }
      
      if (code.includes('class')) {
        explanationText += '🏗️ Classes in TypeScript support access modifiers and type annotations for properties and methods.\n\n';
      }
      
      if (code.includes('<T>') || code.includes('Generic')) {
        explanationText += '🎯 Generic types make components reusable while maintaining type safety.\n\n';
      }

      if (concepts.length > 0) {
        explanationText += `📚 Key concepts covered: ${concepts.join(', ')}`;
      }

      setExplanation(explanationText || 'This example demonstrates basic TypeScript features.');
    };

    generateExplanation();
  }, [code, concepts]);

  const difficultyColors = {
    beginner: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${difficultyColors[difficulty]}`}>
              {difficulty}
            </span>
            {!readOnly && (
              <Button
                size="sm"
                onClick={runCode}
                disabled={isRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M15 21l-4-4L7 21l4-4 4 4z" />
                    </svg>
                    Run Code
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {description}
          </p>
        )}
        
        {concepts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {concepts.map((concept, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium"
              >
                {concept}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Editor */}
        <div className="flex-1">
          <div className="p-4">
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <CodeEditor
                value={code}
                language="typescript"
                onChange={handleCodeChange}
                fontSize={14}
                readOnly={readOnly}
                showMinimap={false}
                lineNumbers="on"
                wordWrap="on"
                scrollBeyondLastLine={false}
                automaticLayout
                height={editorHeight}
                markers={markers}
              />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        {(showOutput || showExplanation) && (
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700">
            <CompoundTabs defaultValue={showOutput ? "output" : "explanation"}>
              <CompoundTabs.List className="px-4 pt-4 bg-gray-50 dark:bg-gray-800/50">
                {showOutput && <CompoundTabs.Tab value="output">Output</CompoundTabs.Tab>}
                {showExplanation && <CompoundTabs.Tab value="explanation">Explanation</CompoundTabs.Tab>}
                <CompoundTabs.Tab value="diagnostics">Type Check</CompoundTabs.Tab>
              </CompoundTabs.List>

              <CompoundTabs.Panels>
                {showOutput && (
                  <CompoundTabs.Panel value="output" className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Console Output
                        </h4>
                        {expectedOutput && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Expected output available
                          </span>
                        )}
                      </div>
                      
                      {/* Actual Output */}
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[120px] overflow-auto">
                        {output || (
                          <span className="text-gray-500">
                            {isRunning ? 'Running code...' : 'Run code to see output'}
                          </span>
                        )}
                      </div>

                      {/* Expected Output */}
                      {expectedOutput && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Expected Output
                          </h5>
                          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-3 rounded-lg font-mono text-sm border border-blue-200 dark:border-blue-800">
                            {expectedOutput}
                          </div>
                        </div>
                      )}
                    </div>
                  </CompoundTabs.Panel>
                )}

                {showExplanation && (
                  <CompoundTabs.Panel value="explanation" className="p-4">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Code Explanation
                      </h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <pre className="whitespace-pre-wrap text-sm text-blue-800 dark:text-blue-200 font-normal">
                            {explanation}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CompoundTabs.Panel>
                )}

                <CompoundTabs.Panel value="diagnostics" className="p-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      TypeScript Diagnostics
                    </h4>
                    {timings && (
                      <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        program {timings.programMs.toFixed(1)} ms · check {timings.checkMs.toFixed(1)} ms
                      </p>
                    )}
                    
                    {diagnostics.length > 0 ? (
                      <div className="space-y-3">
                        {diagnostics.map((diagnostic, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${
                              diagnostic.severity === 'error'
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : diagnostic.severity === 'warning'
                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                diagnostic.severity === 'error'
                                  ? 'bg-red-500 text-white'
                                  : diagnostic.severity === 'warning'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-blue-500 text-white'
                              }`}>
                                {diagnostic.severity === 'error' ? '!' : diagnostic.severity === 'warning' ? '⚠' : 'i'}
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Line {diagnostic.line}, Column {diagnostic.column} · TS{diagnostic.code}
                                </div>
                                <div className="text-sm font-medium">
                                  {diagnostic.message}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-green-700 dark:text-green-300 font-medium">
                          No type errors found!
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          Your TypeScript code is well-typed
                        </p>
                      </div>
                    )}
                  </div>
                </CompoundTabs.Panel>
              </CompoundTabs.Panels>
            </CompoundTabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPanel;