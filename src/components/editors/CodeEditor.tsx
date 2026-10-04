// File location: src/components/editors/CodeEditor.tsx

import { Editor } from '@monaco-editor/react';
import { useRef, useEffect, useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';

import { useDarkMode } from '../../hooks/useDarkMode';

import type { OnMount, BeforeMount, OnChange, Monaco } from '@monaco-editor/react';
import type { editor, languages, IDisposable, IRange, Selection } from 'monaco-editor';


export type CodeEditorMarkerSeverity = 'Error' | 'Warning' | 'Info' | 'Hint';

export interface CodeEditorMarker {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: CodeEditorMarkerSeverity;
  /** Diagnostic code shown by Monaco, e.g. `TS2322`. */
  code?: string;
  /** Producer of the marker, e.g. `ts-kernel`. */
  source?: string;
}

export interface CodeEditorPosition {
  lineNumber: number;
  column: number;
}

/** Imperative API exposed through the component `ref`. */
export interface CodeEditorHandle {
  focus: () => void;
  setValue: (newValue: string) => void;
  getValue: () => string;
  setPosition: (position: CodeEditorPosition) => void;
  revealLine: (lineNumber: number) => void;
  insertText: (text: string) => void;
  getEditor: () => editor.IStandaloneCodeEditor | null;
}

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  language?: 'typescript' | 'javascript';
  height?: number | string;
  readOnly?: boolean;
  showMinimap?: boolean;
  fontSize?: number;
  tabSize?: number;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  automaticLayout?: boolean;
  scrollBeyondLastLine?: boolean;
  renderWhitespace?: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
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
  /** Raw Monaco options merged last, for settings not covered by the typed props above. */
  options?: editor.IStandaloneEditorConstructionOptions;
  onCursorPositionChange?: (position: CodeEditorPosition) => void;
  onSelectionChange?: (selection: Selection) => void;
  markers?: CodeEditorMarker[];
  className?: string;
}

export const DEFAULT_TYPESCRIPT_CODE = `// Welcome to the TypeScript Playground!
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

const DARK_THEME: editor.IStandaloneThemeData = {
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
};

const LIGHT_THEME: editor.IStandaloneThemeData = {
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
};

// Extra ambient declarations for better IntelliSense inside the playground
const EXTRA_LIB_SOURCE = `
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

interface SnippetDefinition {
  label: string;
  insertText: string;
  documentation: string;
}

const TYPESCRIPT_SNIPPETS: SnippetDefinition[] = [
  {
    label: 'interface',
    insertText: [
      'interface ${1:InterfaceName} {',
      '\t${2:property}: ${3:type};',
      '}'
    ].join('\n'),
    documentation: 'Create a TypeScript interface'
  },
  {
    label: 'class',
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
    documentation: 'Create a TypeScript class'
  },
  {
    label: 'enum',
    insertText: [
      'enum ${1:EnumName} {',
      '\t${2:VALUE1} = "${3:value1}",',
      '\t${4:VALUE2} = "${5:value2}"',
      '}'
    ].join('\n'),
    documentation: 'Create a TypeScript enum'
  },
  {
    label: 'type',
    insertText: 'type ${1:TypeName} = ${2:type};',
    documentation: 'Create a type alias'
  },
  {
    label: 'generic',
    insertText: [
      'function ${1:functionName}<${2:T}>(${3:param}: ${2:T}): ${4:T} {',
      '\t${5:return param;}',
      '}'
    ].join('\n'),
    documentation: 'Create a generic function'
  }
];

// Language features are global to the Monaco instance; register them once
let languageFeaturesRegistered = false;

const registerLanguageFeatures = (monaco: Monaco): void => {
  if (languageFeaturesRegistered) return;
  languageFeaturesRegistered = true;

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

  // Diagnostics come from the project's compiler kernel (src/core/compiler) and
  // are applied as markers; Monaco's own TypeScript worker keeps providing
  // hover and completion but no longer validates, so errors are not duplicated.
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
    noSuggestionDiagnostics: true,
  });

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    EXTRA_LIB_SOURCE,
    'ts:lib.tsverse.d.ts'
  );

  // Custom completion provider for TypeScript-specific snippets
  monaco.languages.registerCompletionItemProvider('typescript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range: IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: languages.CompletionItem[] = TYPESCRIPT_SNIPPETS.map(snippet => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: snippet.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: snippet.documentation,
        range,
      }));

      return { suggestions };
    }
  });
};

const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(({
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
  options,
  onCursorPositionChange,
  onSelectionChange,
  markers = [],
  className = ''
}, ref) => {
  const editorInstanceRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const disposablesRef = useRef<IDisposable[]>([]);
  const { isDark } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [cursorPosition, setCursorPosition] = useState<CodeEditorPosition>({ lineNumber: 1, column: 1 });

  // Keep the latest callbacks reachable from Monaco listeners registered once on mount
  const onRunRef = useRef(onRun);
  const onCursorPositionChangeRef = useRef(onCursorPositionChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  onRunRef.current = onRun;
  onCursorPositionChangeRef.current = onCursorPositionChange;
  onSelectionChangeRef.current = onSelectionChange;

  const editorOptions = useMemo<editor.IStandaloneEditorConstructionOptions>(() => ({
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
    },
    ...options,
  }), [
    fontSize, tabSize, wordWrap, automaticLayout, scrollBeyondLastLine, renderWhitespace,
    lineNumbers, folding, showMinimap, readOnly, contextmenu, mouseWheelZoom, cursorBlinking,
    cursorStyle, renderLineHighlight, selectOnLineNumbers, roundedSelection, scrollbar,
    quickSuggestions, parameterHints, hover, suggestions, options
  ]);

  // Define themes and language features before the editor instance is created
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monaco.editor.defineTheme('tsverse-dark', DARK_THEME);
    monaco.editor.defineTheme('tsverse-light', LIGHT_THEME);
    registerLanguageFeatures(monaco);
  }, []);

  // Wire up listeners, keyboard shortcuts and custom actions
  const handleMount: OnMount = useCallback((editorInstance, monaco) => {
    editorInstanceRef.current = editorInstance;
    monacoRef.current = monaco;

    disposablesRef.current = [
      editorInstance.onDidChangeCursorPosition((e) => {
        const position = { lineNumber: e.position.lineNumber, column: e.position.column };
        setCursorPosition(position);
        onCursorPositionChangeRef.current?.(position);
      }),
      editorInstance.onDidChangeCursorSelection((e) => {
        onSelectionChangeRef.current?.(e.selection);
      }),
      editorInstance.addAction({
        id: 'format-document',
        label: 'Format Document',
        keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
        contextMenuGroupId: 'modification',
        contextMenuOrder: 1,
        run: () => {
          editorInstance.trigger('editor', 'editor.action.formatDocument', {});
        }
      }),
      editorInstance.addAction({
        id: 'run-code',
        label: 'Run Code',
        keybindings: [monaco.KeyCode.F5, monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR],
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 1,
        run: () => {
          onRunRef.current?.();
        }
      }),
    ];

    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save command - could integrate with localStorage or external save
      console.log('Save triggered');
    });

    setIsLoading(false);
  }, []);

  const handleChange: OnChange = useCallback((newValue) => {
    onChange(newValue ?? '');
  }, [onChange]);

  // Dispose listeners/actions when the component unmounts
  useEffect(() => {
    return () => {
      disposablesRef.current.forEach(disposable => disposable.dispose());
      disposablesRef.current = [];
      editorInstanceRef.current = null;
    };
  }, []);

  // Update markers for error highlighting
  useEffect(() => {
    const monaco = monacoRef.current;
    const model = editorInstanceRef.current?.getModel();
    if (!monaco || !model) return;

    const monacoMarkers: editor.IMarkerData[] = markers.map(marker => ({
      ...marker,
      severity: monaco.MarkerSeverity[marker.severity]
    }));
    monaco.editor.setModelMarkers(model, 'tsverse', monacoMarkers);
  }, [markers, isLoading]);

  // Imperative API
  const insertText = useCallback((text: string) => {
    const editorInstance = editorInstanceRef.current;
    if (!editorInstance) return;

    const range: IRange = editorInstance.getSelection() ?? {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1
    };

    editorInstance.executeEdits('tsverse', [{ range, text, forceMoveMarkers: true }]);
  }, []);

  useImperativeHandle(ref, (): CodeEditorHandle => ({
    focus: () => editorInstanceRef.current?.focus(),
    setValue: (newValue) => editorInstanceRef.current?.setValue(newValue),
    getValue: () => editorInstanceRef.current?.getValue() ?? '',
    setPosition: (position) => editorInstanceRef.current?.setPosition(position),
    revealLine: (lineNumber) => editorInstanceRef.current?.revealLine(lineNumber),
    insertText,
    getEditor: () => editorInstanceRef.current
  }), [insertText]);

  return (
    <div className={`code-editor-container relative ${className}`}>
      {/* Editor Header */}
      <div className="editor-header flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
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

      {/* Editor */}
      <Editor
        value={value}
        language={language}
        theme={isDark ? 'tsverse-dark' : 'tsverse-light'}
        height={height}
        options={editorOptions}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={handleChange}
        className="editor-mount-point bg-white dark:bg-gray-900"
        loading={
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Loading Monaco Editor...
            </div>
          </div>
        }
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
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
