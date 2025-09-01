// File location: src/components/editor/Playground.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { EditorConfigManager, PLAYGROUND_PRESETS, PlaygroundPreset } from './EditorConfig';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { usePlaygroundCompiler } from '../../hooks/usePlaygroundCompiler';

interface PlaygroundState {
  code: string;
  selectedPreset: string | null;
  isRunning: boolean;
  output: ConsoleMessage[];
  errors: CompilerError[];
  showSettings: boolean;
  splitView: 'horizontal' | 'vertical';
  outputHeight: number;
}

interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
  args?: any[];
}

interface CompilerError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: number;
}

const DEFAULT_CODE = `// Welcome to the TypeScript Playground!
// Write your TypeScript code here and click Run to execute it.

interface Person {
  name: string;
  age: number;
  greet(): string;
}

class Developer implements Person {
  constructor(
    public name: string,
    public age: number,
    public languages: string[]
  ) {}

  greet(): string {
    return \`Hi, I'm \${this.name}, a developer who knows \${this.languages.join(', ')}\`;
  }

  writeCode(language: string): string {
    if (this.languages.includes(language)) {
      return \`Writing amazing \${language} code! 🚀\`;
    } else {
      return \`I should learn \${language}! 📚\`;
    }
  }
}

// Create a developer
const dev = new Developer("Alice", 28, ["TypeScript", "React", "Node.js"]);

console.log(dev.greet());
console.log(dev.writeCode("TypeScript"));
console.log(dev.writeCode("Python"));

// Try some modern TypeScript features
const users = [
  { name: "Alice", age: 28, role: "developer" },
  { name: "Bob", age: 32, role: "designer" },
  { name: "Charlie", age: 25, role: "developer" }
] as const;

const developers = users.filter(user => user.role === "developer");
console.log("Developers:", developers);

// Optional chaining and nullish coalescing
const config = {
  api: {
    endpoint: "https://api.example.com"
  }
};

console.log("API URL:", config.api?.endpoint ?? "Not configured");
`;

export const Playground: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const editorRef = useRef<any>(null);
  const [playgroundState, setPlaygroundState] = useLocalStorage<PlaygroundState>('tsverse-playground', {
    code: DEFAULT_CODE,
    selectedPreset: null,
    isRunning: false,
    output: [],
    errors: [],
    showSettings: false,
    splitView: 'horizontal',
    outputHeight: 300
  });

  const { compileAndRun, isCompiling, compilerErrors } = usePlaygroundCompiler();
  
  const [editorSettings, setEditorSettings] = useState(() => EditorConfigManager.getSettings());
  
  // Console capture system
  const originalConsole = useRef<Console>();
  
  useEffect(() => {
    // Store original console methods
    originalConsole.current = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    } as Console;
    
    return () => {
      // Restore original console on cleanup
      if (originalConsole.current) {
        Object.assign(console, originalConsole.current);
      }
    };
  }, []);

  const addConsoleMessage = useCallback((type: ConsoleMessage['type'], ...args: any[]) => {
    const message: ConsoleMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message: args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' '),
      timestamp: new Date(),
      args
    };
    
    setPlaygroundState(prev => ({
      ...prev,
      output: [...prev.output, message]
    }));
    
    // Also call original console method
    if (originalConsole.current) {
      originalConsole.current[type](...args);
    }
  }, [setPlaygroundState]);

  const overrideConsole = useCallback(() => {
    console.log = (...args: any[]) => addConsoleMessage('log', ...args);
    console.error = (...args: any[]) => addConsoleMessage('error', ...args);
    console.warn = (...args: any[]) => addConsoleMessage('warn', ...args);
    console.info = (...args: any[]) => addConsoleMessage('info', ...args);
  }, [addConsoleMessage]);

  const restoreConsole = useCallback(() => {
    if (originalConsole.current) {
      Object.assign(console, originalConsole.current);
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setPlaygroundState(prev => ({
      ...prev,
      code: newCode,
      errors: [] // Clear errors when code changes
    }));
  }, [setPlaygroundState]);

  const handleRunCode = useCallback(async () => {
    try {
      setPlaygroundState(prev => ({
        ...prev,
        isRunning: true,
        output: [],
        errors: []
      }));

      // Override console to capture output
      overrideConsole();

      // Compile and run the code
      const result = await compileAndRun(playgroundState.code);
      
      if (result.success) {
        addConsoleMessage('info', '✅ Code executed successfully');
      } else {
        result.errors.forEach(error => {
          addConsoleMessage('error', `❌ ${error.message}`);
        });
        
        setPlaygroundState(prev => ({
          ...prev,
          errors: result.errors
        }));
      }
    } catch (error) {
      addConsoleMessage('error', `❌ Runtime error: ${error}`);
    } finally {
      // Restore console
      restoreConsole();
      
      setPlaygroundState(prev => ({
        ...prev,
        isRunning: false
      }));
    }
  }, [playgroundState.code, compileAndRun, overrideConsole, restoreConsole, addConsoleMessage, setPlaygroundState]);

  const handlePresetChange = useCallback((presetId: string) => {
    const preset = PLAYGROUND_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setPlaygroundState(prev => ({
        ...prev,
        code: preset.code,
        selectedPreset: presetId,
        output: [],
        errors: []
      }));
    }
  }, [setPlaygroundState]);

  const clearOutput = useCallback(() => {
    setPlaygroundState(prev => ({
      ...prev,
      output: [],
      errors: []
    }));
  }, [setPlaygroundState]);

  const shareCode = useCallback(async () => {
    try {
      const shareData = {
        code: playgroundState.code,
        timestamp: new Date().toISOString()
      };
      
      const compressed = btoa(JSON.stringify(shareData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?code=${compressed}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'TypeScript Playground Code',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        addConsoleMessage('info', '📋 Share URL copied to clipboard!');
      }
    } catch (error) {
      addConsoleMessage('error', `Failed to share: ${error}`);
    }
  }, [playgroundState.code, addConsoleMessage]);

  const downloadCode = useCallback(() => {
    const blob = new Blob([playgroundState.code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typescript-playground-${Date.now()}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [playgroundState.code]);

  const handleSettingsChange = useCallback((newSettings: Partial<typeof editorSettings>) => {
    const updated = { ...editorSettings, ...newSettings };
    setEditorSettings(updated);
    EditorConfigManager.saveSettings(updated);
  }, [editorSettings]);

  // Load code from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    
    if (codeParam) {
      try {
        const decoded = JSON.parse(atob(codeParam));
        if (decoded.code) {
          setPlaygroundState(prev => ({
            ...prev,
            code: decoded.code
          }));
        }
      } catch (error) {
        console.warn('Failed to load code from URL:', error);
      }
    }
  }, [setPlaygroundState]);

  const getConsoleMessageIcon = (type: ConsoleMessage['type']): string => {
    switch (type) {
      case 'log': return '📝';
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getConsoleMessageClass = (type: ConsoleMessage['type']): string => {
    switch (type) {
      case 'log': return 'text-gray-800 dark:text-gray-200';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warn': return 'text-yellow-600 dark:text-yellow-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="playground-container h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="toolbar flex flex-wrap items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Preset Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Example:
            </label>
            <select
              value={playgroundState.selectedPreset || ''}
              onChange={(e) => e.target.value && handlePresetChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Custom Code</option>
              {Object.entries(
                PLAYGROUND_PRESETS.reduce((acc, preset) => {
                  if (!acc[preset.category]) acc[preset.category] = [];
                  acc[preset.category].push(preset);
                  return acc;
                }, {} as Record<string, PlaygroundPreset[]>)
              ).map(([category, presets]) => (
                <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                  {presets.map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Layout:
            </label>
            <button
              onClick={() => setPlaygroundState(prev => ({
                ...prev,
                splitView: prev.splitView === 'horizontal' ? 'vertical' : 'horizontal'
              }))}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md text-sm transition-colors"
            >
              {playgroundState.splitView === 'horizontal' ? '📱 Vertical' : '💻 Horizontal'}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-2 lg:mt-0">
          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={playgroundState.isRunning || isCompiling}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors duration-200"
          >
            {playgroundState.isRunning || isCompiling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <span>▶️</span>
                <span>Run</span>
              </>
            )}
          </button>

          {/* Clear Output */}
          <button
            onClick={clearOutput}
            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
          >
            🗑️ Clear
          </button>

          {/* Share Code */}
          <button
            onClick={shareCode}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
          >
            📤 Share
          </button>

          {/* Download Code */}
          <button
            onClick={downloadCode}
            className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors duration-200"
          >
            💾 Download
          </button>

          {/* Settings */}
          <button
            onClick={() => setPlaygroundState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {playgroundState.showSettings && (
        <div className="settings-panel p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Editor Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Font Size
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={editorSettings.fontSize}
                onChange={(e) => handleSettingsChange({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{editorSettings.fontSize}px</span>
            </div>

            {/* Tab Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tab Size
              </label>
              <select
                value={editorSettings.tabSize}
                onChange={(e) => handleSettingsChange({ tabSize: parseInt(e.target.value) })}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>

            {/* Word Wrap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Word Wrap
              </label>
              <select
                value={editorSettings.wordWrap}
                onChange={(e) => handleSettingsChange({ wordWrap: e.target.value as any })}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="off">Off</option>
                <option value="on">On</option>
                <option value="bounded">Bounded</option>
              </select>
            </div>

            {/* Minimap */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editorSettings.minimap}
                  onChange={(e) => handleSettingsChange({ minimap: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Minimap
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex ${playgroundState.splitView === 'vertical' ? 'flex-col' : 'flex-row'} min-h-0`}>
        {/* Code Editor */}
        <div className={`${playgroundState.splitView === 'vertical' ? 'h-1/2' : 'w-1/2'} border-r border-gray-200 dark:border-gray-700`}>
          <CodeEditor
            ref={editorRef}
            value={playgroundState.code}
            onChange={handleCodeChange}
            onRun={handleRunCode}
            language="typescript"
            height={playgroundState.splitView === 'vertical' ? undefined : 600}
            {...editorSettings}
            markers={playgroundState.errors.map(error => ({
              startLineNumber: error.line,
              startColumn: error.column,
              endLineNumber: error.line,
              endColumn: error.column + 1,
              message: error.message,
              severity: error.severity === 'error' ? 'Error' : error.severity === 'warning' ? 'Warning' : 'Info'
            }))}
            className="h-full"
          />
        </div>

        {/* Output Panel */}
        <div className={`${playgroundState.splitView === 'vertical' ? 'h-1/2' : 'w-1/2'} flex flex-col bg-gray-50 dark:bg-gray-800`}>
          {/* Output Header */}
          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="font-medium text-gray-900 dark:text-white">Console Output</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {playgroundState.output.length} messages
              </span>
              {playgroundState.output.length > 0 && (
                <button
                  onClick={clearOutput}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Console Messages */}
          <div className="flex-1 overflow-auto p-3 space-y-2 font-mono text-sm">
            {playgroundState.output.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-4xl mb-2">🚀</div>
                <p>Click "Run" to execute your TypeScript code</p>
                <p className="text-xs mt-1">Output will appear here</p>
              </div>
            ) : (
              playgroundState.output.map(message => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 p-2 rounded ${
                    message.type === 'error' 
                      ? 'bg-red-50 dark:bg-red-900/20' 
                      : message.type === 'warn'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : message.type === 'info'
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-white dark:bg-gray-700'
                  }`}
                >
                  <span className="flex-shrink-0 mt-0.5">
                    {getConsoleMessageIcon(message.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <pre className={`whitespace-pre-wrap break-words ${getConsoleMessageClass(message.type)}`}>
                      {message.message}
                    </pre>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Compilation Errors */}
          {playgroundState.errors.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-600 p-3 bg-red-50 dark:bg-red-900/20">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                ⚠️ Compilation Errors ({playgroundState.errors.length})
              </h4>
              <div className="space-y-1">
                {playgroundState.errors.map((error, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-red-600 dark:text-red-400 font-mono">
                      Line {error.line}:{error.column}
                    </span>
                    <span className="text-red-800 dark:text-red-200 ml-2">
                      {error.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs">
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <span>TypeScript Playground</span>
          <span>•</span>
          <span>{playgroundState.code.split('\n').length} lines</span>
          <span>•</span>
          <span>{playgroundState.code.length} characters</span>
          {playgroundState.selectedPreset && (
            <>
              <span>•</span>
              <span>Preset: {PLAYGROUND_PRESETS.find(p => p.id === playgroundState.selectedPreset)?.name}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <span>Ready</span>
          {(playgroundState.isRunning || isCompiling) && (
            <>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>{isCompiling ? 'Compiling...' : 'Running...'}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;