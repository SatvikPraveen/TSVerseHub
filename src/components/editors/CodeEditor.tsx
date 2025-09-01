// File location: src/components/editor/CodeEditor.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useDebounce } from '../../hooks/useDebounce';

// Monaco Editor types (since we can't import Monaco directly in this environment)
interface IStandaloneCodeEditor {
  getValue(): string;
  setValue(newValue: string): void;
  getModel(): any;
  updateOptions(newOptions: any): void;
  focus(): void;
  dispose(): void;
  onDidChangeModelContent(listener: (e: any) => void): any;
  setPosition(position: { lineNumber: number; column: number }): void;
  revealLine(lineNumber: number): void;
  addCommand(keybinding: number, handler: () => void): void;
  addAction(action: any): void;
  trigger(source: string, handlerId: string, payload: any): void;
}

interface MonacoEditor {
  create(container: HTMLElement, options: any): IStandaloneCodeEditor;
  languages: {
    typescript: {
      typescriptDefaults: any;
      javascriptDefaults: any;
    };
    registerCompletionItemProvider(languageId: string, provider: any): any;
  };
  editor: {
    defineTheme(themeName: string, themeData: any): void;
    setTheme(themeName: string): void;
  };
  KeyMod: {
    CtrlCmd: number;
    Shift: number;
  };
  KeyCode: {
    KeyS: number;
    KeyR: number;
    F5: number;
    Enter: number;
  };
}

declare global {
  interface Window {
    monaco: MonacoEditor;
  }
}

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  language?: 'typescript' | 'javascript';
  height?: number;
  readOnly?: boolean;
  showMinimap?: boolean;
  fontSize?: number;
  tabSize?: number;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  automaticLayout?: boolean;
  scrollBeyondLastLine?: boolean;
  renderWhitespace?: 'none' | 'boundary' | 'selection' | 'all';
  lineNumbers?: 'off' | 'on' | 'relative' | 'interval';
  folding?: boolean;
  suggestions?: boolean;
  quickSuggestions?: boolean | { other: boolean; comments: boolean; strings: boolean };
  parameterHints?: { enabled: boolean };
  hover?: { enabled: boolean };
  contextmenu?: boolean;
  mouseWheelZoom?: boolean;
  cursorBlinking?: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  cursorStyle?: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
  renderLineHighlight?: 'none' | 'gutter' | 'line' | 'all';
  selectOnLineNumbers?: boolean;
  roundedSelection?: boolean;
  scrollbar?: {
    vertical?: 'auto' | 'visible' | 'hidden';
    horizontal?: 'auto' | 'visible' | 'hidden';
    verticalScrollbarSize?: number;
    horizontalScrollbarSize?: number;
  };
  onCursorPositionChange?: (position: { lineNumber: number; column: number }) => void;
  onSelectionChange?: (selection: any) => void;
  markers?: Array<{
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    severity: 'Error' | 'Warning' | 'Info' | 'Hint';
  }>;
  className?: string;
}

const DEFAULT_TYPESCRIPT_CODE = `// Welcome to the TypeScript Playground!
// Try writing some TypeScript code here

interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(\`Added user: \${user.name}\`);
  }

  getUser(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getActiveUsers(): User[] {
    return this.users.filter(user => user.isActive !== false);
  }
}

// Example usage
const userManager = new UserManager();

const user1: User = {
  id: 1,
  name: "Alice Johnson",
  email: "alice@example.com",
  isActive: true
};

const user2: User = {
  id: 2,
  name: "Bob Smith", 
  email: "bob@example.com"
};

userManager.addUser(user1);
userManager.addUser(user2);

console.log("Active users:", userManager.getActiveUsers());
`;

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  onRun,
  language = 'typescript',
  height = 400,
  readOnly = false,
  showMinimap = true,
  fontSize = 14,
  tabSize = 2,
  wordWrap = 'off',
  automaticLayout = true,
  scrollBeyondLastLine = false,
  renderWhitespace = 'selection',
  lineNumbers = 'on',
  folding = true,
  suggestions = true,
  quickSuggestions = true,
  parameterHints = { enabled: true },
  hover = { enabled: true },
  contextmenu = true,
  mouseWheelZoom = true,
  cursorBlinking = 'blink',
  cursorStyle = 'line',
  renderLineHighlight = 'line',
  selectOnLineNumbers = true,
  roundedSelection = true,
  scrollbar = {
    vertical: 'auto',
    horizontal: 'auto',
    verticalScrollbarSize: 14,
    horizontalScrollbarSize: 14
  },
  onCursorPositionChange,
  onSelectionChange,
  markers = [],
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<IStandaloneCodeEditor | null>(null);
  const { isDarkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });
  
  const debouncedValue = useDebounce(value, 300);

  // Load Monaco Editor
  const loadMonacoEditor = useCallback(async () => {
    if (window.monaco) {
      return window.monaco;
    }

    try {
      // Load Monaco Editor from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/loader.min.js';
      
      return new Promise<MonacoEditor>((resolve, reject) => {
        script.onload = () => {
          const require = (window as any).require;
          require.config({ 
            paths: { 
              vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' 
            } 
          });

          require(['vs/editor/editor.main'], () => {
            if (window.monaco) {
              resolve(window.monaco);
            } else {
              reject(new Error('Failed to load Monaco Editor'));
            }
          });
        };

        script.onerror = () => {
          reject(new Error('Failed to load Monaco Editor script'));
        };

        document.head.appendChild(script);
      });
    } catch (error) {
      throw new Error(`Failed to load Monaco Editor: ${error}`);
    }
  }, []);

  // Setup Monaco Editor themes
  const setupThemes = useCallback((monaco: MonacoEditor) => {
    // Define custom dark theme
    monaco.editor.defineTheme('tsverse-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'class-name', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorCursor.foreground': '#AEAFAD',
        'editor.lineHighlightBackground': '#2D2D30',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editor.wordHighlightBackground': '#575757',
        'editor.wordHighlightStrongBackground': '#004972',
        'editorBracketMatch.background': '#0064001A',
        'editorBracketMatch.border': '#888888',
      }
    });

    // Define custom light theme
    monaco.editor.defineTheme('tsverse-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
        { token: 'type', foreground: '267F99' },
        { token: 'class-name', foreground: '267F99' },
        { token: 'function', foreground: '795E26' },
        { token: 'variable', foreground: '001080' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editorCursor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F7F7F7',
        'editorLineNumber.foreground': '#237893',
        'editor.selectionBackground': '#ADD6FF',
        'editor.inactiveSelectionBackground': '#E5EBF1',
        'editor.wordHighlightBackground': '#57575740',
        'editor.wordHighlightStrongBackground': '#0E639C40',
        'editorBracketMatch.background': '#0064001A',
        'editorBracketMatch.border': '#B9B9B9',
      }
    });
  }, []);

  // Setup TypeScript configuration
  const setupTypeScript = useCallback((monaco: MonacoEditor) => {
    // Configure TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      strict: true,
      noImplicitAny: false,
      strictNullChecks: true,
      strictFunctionTypes: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedIndexedAccess: false,
      noImplicitOverride: true,
    });

    // Add extra libraries for better IntelliSense
    const libSource = `
declare global {
  interface Console {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
  }
  
  const console: Console;
}

// Common TypeScript utilities
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T extends null | undefined ? never : T;
`;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      libSource,
      'ts:lib.tsverse.d.ts'
    );

    // Custom completion provider for TypeScript-specific snippets
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'interface',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'interface ${1:InterfaceName} {',
              '\t${2:property}: ${3:type};',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a TypeScript interface'
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'class ${1:ClassName} {',
              '\tprivate ${2:property}: ${3:type};',
              '',
              '\tconstructor(${4:parameter}: ${5:type}) {',
              '\t\tthis.${2:property} = ${4:parameter};',
              '\t}',
              '',
              '\t${6:public} ${7:method}(): ${8:returnType} {',
              '\t\t${9:// implementation}',
              '\t}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a TypeScript class'
          },
          {
            label: 'enum',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'enum ${1:EnumName} {',
              '\t${2:VALUE1} = "${3:value1}",',
              '\t${4:VALUE2} = "${5:value2}"',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a TypeScript enum'
          },
          {
            label: 'type',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'type ${1:TypeName} = ${2:type};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a type alias'
          },
          {
            label: 'generic',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'function ${1:functionName}<${2:T}>(${3:param}: ${2:T}): ${4:T} {',
              '\t${5:return param;}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a generic function'
          }
        ];

        return { suggestions };
      }
    });
  }, []);

  // Initialize Monaco Editor
  useEffect(() => {
    let mounted = true;

    const initializeEditor = async () => {
      if (!editorRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const monaco = await loadMonacoEditor();
        
        if (!mounted) return;

        setupThemes(monaco);
        setupTypeScript(monaco);

        const editor = monaco.create(editorRef.current, {
          value: value || DEFAULT_TYPESCRIPT_CODE,
          language,
          theme: isDarkMode ? 'tsverse-dark' : 'tsverse-light',
          fontSize,
          tabSize,
          wordWrap,
          automaticLayout,
          scrollBeyondLastLine,
          renderWhitespace,
          lineNumbers,
          folding,
          minimap: { enabled: showMinimap },
          readOnly,
          contextmenu,
          mouseWheelZoom,
          cursorBlinking,
          cursorStyle,
          renderLineHighlight,
          selectOnLineNumbers,
          roundedSelection,
          scrollbar,
          quickSuggestions,
          parameterHints,
          hover,
          suggest: {
            showKeywords: suggestions,
            showSnippets: suggestions,
            showFunctions: suggestions,
            showConstructors: suggestions,
            showFields: suggestions,
            showVariables: suggestions,
            showClasses: suggestions,
            showStructs: suggestions,
            showInterfaces: suggestions,
            showModules: suggestions,
            showProperties: suggestions,
            showEvents: suggestions,
            showOperators: suggestions,
            showUnits: suggestions,
            showValues: suggestions,
            showConstants: suggestions,
            showEnums: suggestions,
            showEnumMembers: suggestions,
            showColors: suggestions,
            showFiles: suggestions,
            showReferences: suggestions,
            showFolders: suggestions,
            showTypeParameters: suggestions
          }
        });

        monacoEditorRef.current = editor;

        // Set up event listeners
        const disposables = [
          editor.onDidChangeModelContent(() => {
            const newValue = editor.getValue();
            onChange(newValue);
          }),
          
          editor.onDidChangeCursorPosition((e) => {
            const position = { lineNumber: e.position.lineNumber, column: e.position.column };
            setCursorPosition(position);
            onCursorPositionChange?.(position);
          }),
          
          editor.onDidChangeCursorSelection((e) => {
            onSelectionChange?.(e.selection);
          })
        ];

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          // Save command - could integrate with localStorage or external save
          console.log('Save triggered');
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
          if (onRun) {
            onRun();
          }
        });

        editor.addCommand(monaco.KeyCode.F5, () => {
          if (onRun) {
            onRun();
          }
        });

        // Add custom actions
        editor.addAction({
          id: 'format-document',
          label: 'Format Document',
          keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
          contextMenuGroupId: 'modification',
          contextMenuOrder: 1,
          run: () => {
            editor.trigger('editor', 'editor.action.formatDocument', {});
          }
        });

        editor.addAction({
          id: 'run-code',
          label: 'Run Code',
          keybindings: [monaco.KeyCode.F5],
          contextMenuGroupId: 'navigation',
          contextMenuOrder: 1,
          run: () => {
            if (onRun) {
              onRun();
            }
          }
        });

        setIsLoading(false);

        // Cleanup function
        return () => {
          disposables.forEach(disposable => disposable.dispose());
          if (mounted && editor) {
            editor.dispose();
          }
        };

      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize editor');
          setIsLoading(false);
        }
      }
    };

    initializeEditor().then(cleanup => {
      return () => {
        mounted = false;
        if (cleanup) cleanup();
      };
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Update theme when dark mode changes
  useEffect(() => {
    if (monacoEditorRef.current && window.monaco) {
      window.monaco.editor.setTheme(isDarkMode ? 'tsverse-dark' : 'tsverse-light');
    }
  }, [isDarkMode]);

  // Update value when prop changes
  useEffect(() => {
    if (monacoEditorRef.current && value !== monacoEditorRef.current.getValue()) {
      monacoEditorRef.current.setValue(value);
    }
  }, [debouncedValue]);

  // Update editor options when props change
  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({
        fontSize,
        tabSize,
        wordWrap,
        readOnly,
        lineNumbers,
        folding,
        minimap: { enabled: showMinimap },
        renderWhitespace,
        contextmenu,
        mouseWheelZoom,
        cursorBlinking,
        cursorStyle,
        renderLineHighlight,
        selectOnLineNumbers,
        roundedSelection,
        scrollbar,
        quickSuggestions,
        parameterHints,
        hover
      });
    }
  }, [
    fontSize, tabSize, wordWrap, readOnly, lineNumbers, folding, showMinimap,
    renderWhitespace, contextmenu, mouseWheelZoom, cursorBlinking, cursorStyle,
    renderLineHighlight, selectOnLineNumbers, roundedSelection, scrollbar,
    quickSuggestions, parameterHints, hover
  ]);

  // Update markers for error highlighting
  useEffect(() => {
    if (monacoEditorRef.current && window.monaco) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        const monacoMarkers = markers.map(marker => ({
          ...marker,
          severity: window.monaco.MarkerSeverity[marker.severity]
        }));
        window.monaco.editor.setModelMarkers(model, 'tsverse', monacoMarkers);
      }
    }
  }, [markers]);

  // Public methods
  const focus = useCallback(() => {
    monacoEditorRef.current?.focus();
  }, []);

  const setValue = useCallback((newValue: string) => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.setValue(newValue);
    }
  }, []);

  const getValue = useCallback((): string => {
    return monacoEditorRef.current?.getValue() || '';
  }, []);

  const setPosition = useCallback((position: { lineNumber: number; column: number }) => {
    monacoEditorRef.current?.setPosition(position);
  }, []);

  const revealLine = useCallback((lineNumber: number) => {
    monacoEditorRef.current?.revealLine(lineNumber);
  }, []);

  const insertText = useCallback((text: string) => {
    if (monacoEditorRef.current) {
      const selection = monacoEditorRef.current.getSelection();
      const range = selection || {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      };
      
      const op = { range, text, forceMoveMarkers: true };
      monacoEditorRef.current.executeEdits('tsverse', [op]);
    }
  }, []);

  // Expose methods via ref
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    focus,
    setValue,
    getValue,
    setPosition,
    revealLine,
    insertText,
    getEditor: () => monacoEditorRef.current
  }));

  if (error) {
    return (
      <div className={`editor-error p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <div className="text-xl">⚠️</div>
          <div>
            <h3 className="font-semibold">Editor Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className={`code-editor-container ${className}`}>
      {/* Editor Header */}
      <div className="editor-header flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {language === 'typescript' ? 'TypeScript' : 'JavaScript'} Playground
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}
          </div>
          
          {onRun && (
            <button
              onClick={onRun}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded-md transition-colors duration-200"
            >
              <span>▶️</span>
              <span>Run</span>
              <span className="text-xs opacity-75">(F5)</span>
            </button>
          )}
          
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Ctrl+S:</span>
            <span>Save</span>
            <span>•</span>
            <span>Ctrl+Shift+F:</span>
            <span>Format</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Loading Monaco Editor...
            </div>
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div 
        ref={editorRef} 
        style={{ height: `${height}px` }}
        className="editor-mount-point bg-white dark:bg-gray-900"
      />

      {/* Status Bar */}
      <div className="editor-status-bar flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 text-xs">
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <span>Ready</span>
          {!readOnly && <span>• Autosave enabled</span>}
          <span>• TypeScript {language === 'typescript' ? 'enabled' : 'disabled'}</span>
        </div>
        
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <span>UTF-8</span>
          <span>LF</span>
          <span>{language === 'typescript' ? 'TypeScript' : 'JavaScript'}</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;