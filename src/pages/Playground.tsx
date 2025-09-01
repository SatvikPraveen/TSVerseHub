// File: src/pages/Playground.tsx

import React, { useState, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  Settings, 
  Download, 
  Upload,
  Share2,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info,
  Code2,
  Terminal,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Copy,
  X
} from 'lucide-react';
import { Button, IconButton, CopyButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/loaders/Spinner';
import { usePlaygroundCompiler } from '@/hooks/usePlaygroundCompiler';
import clsx from 'clsx';

// Monaco Editor component (placeholder for actual Monaco integration)
const MonacoEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme: 'vs-dark' | 'vs-light';
  readOnly?: boolean;
  height?: string;
}> = ({ value, onChange, language, theme, readOnly = false, height = '100%' }) => {
  return (
    <div 
      className="w-full h-full bg-slate-900 text-slate-100 p-4 font-mono text-sm overflow-auto rounded-lg border border-slate-700"
      style={{ height }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="w-full h-full bg-transparent border-none outline-none resize-none text-slate-100 font-mono text-sm"
        style={{ minHeight: '500px' }}
        placeholder={language === 'typescript' ? 'Write your TypeScript code here...' : 'JavaScript output will appear here...'}
      />
      {/* Note: In a real implementation, this would be replaced with @monaco-editor/react */}
    </div>
  );
};

const examples = [
  {
    name: 'Basic Types',
    description: 'Learn about TypeScript\'s basic types',
    code: `// Basic Types Example
let message: string = "Hello TypeScript!";
let count: number = 42;
let isActive: boolean = true;
let items: string[] = ["apple", "banana", "cherry"];

// Object type
interface User {
  name: string;
  age: number;
  email?: string;
}

const user: User = {
  name: "John Doe",
  age: 30,
  email: "john@example.com"
};

console.log(user);`
  },
  {
    name: 'Functions',
    description: 'TypeScript function types and signatures',
    code: `// Function Types Example
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Arrow function with type annotation
const add = (a: number, b: number): number => a + b;

// Optional parameters
function createUser(name: string, age?: number): User {
  return { name, age: age || 0 };
}

// Function overloads
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value * 2;
}

console.log(greet("TypeScript"));
console.log(add(5, 3));
console.log(process("hello"));
console.log(process(42));`
  },
  {
    name: 'Generics',
    description: 'Generic functions and classes',
    code: `// Generics Example
function identity<T>(arg: T): T {
  return arg;
}

// Generic class
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }
}

// Usage
const stringStack = new Stack<string>();
stringStack.push("first");
stringStack.push("second");

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);

console.log("String stack:", stringStack.peek());
console.log("Number stack:", numberStack.peek());
console.log("Identity:", identity<string>("Hello Generics"));`
  }
];

const Playground: React.FC = () => {
  const [darkMode] = useState(true); // For now, default to dark mode
  const [showOutput, setShowOutput] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  const {
    typescript,
    javascript,
    diagnostics,
    isCompiling,
    options,
    updateTypeScript,
    updateOptions,
    resetCode,
    formatCode,
    getStats
  } = usePlaygroundCompiler();

  const stats = getStats();

  const handleExampleSelect = (index: number) => {
    const example = examples[index];
    if (example) {
      updateTypeScript(example.code);
      setSelectedExample(index);
    }
  };

  const handleReset = () => {
    resetCode();
    setSelectedExample(null);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'TypeScript Playground Code',
      text: 'Check out this TypeScript code!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getDiagnosticIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className={clsx('h-screen flex flex-col bg-slate-50 dark:bg-slate-900', isFullscreen && 'fixed inset-0 z-50')}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img
              src="/images/icons/playground.png"
              alt="TypeScript Playground"
              className="w-8 h-8 rounded"
            />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              TypeScript Playground
            </h1>
          </div>
          
          {/* Examples Dropdown */}
          <div className="relative">
            <select
              value={selectedExample ?? ''}
              onChange={(e) => e.target.value && handleExampleSelect(parseInt(e.target.value))}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm min-w-40"
            >
              <option value="">Load Example...</option>
              {examples.map((example, index) => (
                <option key={index} value={index}>
                  {example.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toolbar Actions */}
          <Button size="sm" onClick={formatCode} variant="ghost" title="Format Code (Shift+Alt+F)">
            <Code2 className="w-4 h-4" />
          </Button>

          <IconButton
            icon={showOutput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onClick={() => setShowOutput(!showOutput)}
            title={showOutput ? "Hide Output" : "Show Output"}
            size="sm"
          />

          <IconButton
            icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            size="sm"
          />

          <Button size="sm" onClick={handleReset} variant="ghost" title="Reset to Default">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <Button size="sm" onClick={handleShare} variant="ghost" title="Share Code">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          <IconButton
            icon={<Settings className="w-4 h-4" />}
            title="Compiler Settings"
            size="sm"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Panel - TypeScript Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
          {/* Editor Header */}
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <img
                src="/images/icons/typescript.png"
                alt="TypeScript"
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                TypeScript
              </span>
              {isCompiling && <Spinner size="xs" />}
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
              <span>{stats.lines} lines</span>
              <span>•</span>
              <span>{stats.characters} chars</span>
              {stats.hasErrors && (
                <>
                  <span>•</span>
                  <span className="text-red-500">{stats.errorCount} errors</span>
                </>
              )}
            </div>
          </div>

          {/* TypeScript Editor */}
          <div className="flex-1">
            <MonacoEditor
              value={typescript}
              onChange={updateTypeScript}
              language="typescript"
              theme={darkMode ? 'vs-dark' : 'vs-light'}
            />
          </div>
        </div>

        {/* Right Panel - Output & Diagnostics */}
        {showOutput && (
          <div className="lg:w-1/2 flex flex-col">
            {/* JavaScript Output */}
            <div className="flex-1 flex flex-col border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    JavaScript Output
                  </span>
                </div>
                <CopyButton text={javascript} size="xs" />
              </div>
              
              <div className="flex-1">
                <MonacoEditor
                  value={javascript}
                  onChange={() => {}} // Read-only
                  language="javascript"
                  theme={darkMode ? 'vs-dark' : 'vs-light'}
                  readOnly
                />
              </div>
            </div>

            {/* Diagnostics Panel */}
            {showDiagnostics && (
              <div className="h-48 flex flex-col bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Diagnostics
                    </span>
                    {diagnostics.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                        {diagnostics.length}
                      </span>
                    )}
                  </div>
                  <IconButton
                    icon={<X className="w-4 h-4" />}
                    onClick={() => setShowDiagnostics(false)}
                    size="xs"
                    title="Close Diagnostics"
                  />
                </div>

                <div className="flex-1 overflow-auto p-3">
                  {diagnostics.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                      <div className="text-center">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No issues found</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {diagnostics.map((diagnostic, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                        >
                          {getDiagnosticIcon(diagnostic.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {diagnostic.message}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              Line {diagnostic.line}, Column {diagnostic.column} • TS{diagnostic.code}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Panel - Examples & Settings */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Code Examples
            </h3>
            {!showDiagnostics && diagnostics.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDiagnostics(true)}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Show {diagnostics.length} Issues
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {examples.map((example, index) => (
              <Card
                key={index}
                hover
                className={clsx(
                  'cursor-pointer transition-all duration-200',
                  selectedExample === index && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                )}
                onClick={() => handleExampleSelect(index)}
                padding="sm"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                      {example.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {example.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Compiler Options Modal */}
      {/* This would be implemented as a separate modal component */}
    </div>
  );
};

export default Playground;