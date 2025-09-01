// File location: src/components/editor/EditorConfig.ts

export interface EditorTheme {
  name: string;
  displayName: string;
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  rules: Array<{
    token: string;
    foreground?: string;
    background?: string;
    fontStyle?: 'normal' | 'italic' | 'bold' | 'underline';
  }>;
  colors: Record<string, string>;
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  lineNumbers: 'off' | 'on' | 'relative' | 'interval';
  cursorStyle: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  minimap: boolean;
  scrollBeyondLastLine: boolean;
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'all';
  renderLineHighlight: 'none' | 'gutter' | 'line' | 'all';
  folding: boolean;
  autoIndent: 'none' | 'keep' | 'brackets' | 'advanced' | 'full';
  formatOnPaste: boolean;
  formatOnType: boolean;
  autoClosingBrackets: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  autoClosingQuotes: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  autoSurround: 'languageDefined' | 'quotes' | 'brackets' | 'never';
  snippetSuggestions: 'top' | 'bottom' | 'inline' | 'none';
  quickSuggestions: boolean | { other: boolean; comments: boolean; strings: boolean };
  parameterHints: boolean;
  hover: boolean;
  contextMenu: boolean;
  mouseWheelZoom: boolean;
  multiCursorModifier: 'ctrlCmd' | 'alt';
  accessibilitySupport: 'auto' | 'on' | 'off';
}

export interface TypeScriptConfig {
  target: 'ES3' | 'ES5' | 'ES2015' | 'ES2016' | 'ES2017' | 'ES2018' | 'ES2019' | 'ES2020' | 'ES2021' | 'ES2022' | 'ESNext';
  module: 'None' | 'CommonJS' | 'AMD' | 'UMD' | 'System' | 'ES6' | 'ES2015' | 'ES2020' | 'ES2022' | 'ESNext' | 'Node12' | 'NodeNext';
  lib: string[];
  allowJs: boolean;
  checkJs: boolean;
  jsx: 'preserve' | 'react' | 'react-jsx' | 'react-jsxdev' | 'react-native';
  declaration: boolean;
  declarationMap: boolean;
  sourceMap: boolean;
  outDir: string;
  rootDir: string;
  strict: boolean;
  noImplicitAny: boolean;
  strictNullChecks: boolean;
  strictFunctionTypes: boolean;
  strictBindCallApply: boolean;
  strictPropertyInitialization: boolean;
  noImplicitThis: boolean;
  noImplicitReturns: boolean;
  noFallthroughCasesInSwitch: boolean;
  noUncheckedIndexedAccess: boolean;
  exactOptionalPropertyTypes: boolean;
  useDefineForClassFields: boolean;
  moduleResolution: 'classic' | 'node';
  baseUrl: string;
  paths: Record<string, string[]>;
  typeRoots: string[];
  types: string[];
  allowSyntheticDefaultImports: boolean;
  esModuleInterop: boolean;
  preserveSymlinks: boolean;
  allowUmdGlobalAccess: boolean;
  experimentalDecorators: boolean;
  emitDecoratorMetadata: boolean;
}

export interface PlaygroundPreset {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'examples' | 'challenges';
  code: string;
  settings?: Partial<EditorSettings>;
  tsConfig?: Partial<TypeScriptConfig>;
  tags: string[];
}

// Default editor themes
export const DEFAULT_THEMES: EditorTheme[] = [
  {
    name: 'tsverse-light',
    displayName: 'TSVerse Light',
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
      { token: 'operator.keyword', foreground: '0000FF' },
      { token: 'string', foreground: 'A31515' },
      { token: 'string.escape', foreground: 'FF0000' },
      { token: 'number', foreground: '098658' },
      { token: 'regexp', foreground: 'D16969' },
      { token: 'type', foreground: '267F99' },
      { token: 'namespace', foreground: '267F99' },
      { token: 'type.identifier', foreground: '267F99' },
      { token: 'identifier.ts', foreground: '001080' },
      { token: 'delimiter', foreground: '000000' },
      { token: 'delimiter.bracket', foreground: '0431FA' },
      { token: 'delimiter.square', foreground: '0431FA' },
      { token: 'delimiter.parenthesis', foreground: '0431FA' },
      { token: 'variable', foreground: '001080' },
      { token: 'variable.predefined', foreground: '4864AA' },
      { token: 'constant', foreground: '4864AA' },
      { token: 'function', foreground: '795E26' },
      { token: 'function.call', foreground: '795E26' },
      { token: 'class', foreground: '267F99' },
      { token: 'class.identifier.ts', foreground: '267F99' },
      { token: 'interface', foreground: '267F99' },
      { token: 'enum', foreground: '267F99' },
      { token: 'module', foreground: '267F99' },
      { token: 'property', foreground: '001080' },
      { token: 'property.value', foreground: 'A31515' },
      { token: 'attribute.name', foreground: '0451A5' },
      { token: 'attribute.value', foreground: 'A31515' },
      { token: 'tag', foreground: '800000' }
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editorCursor.foreground': '#000000',
      'editor.lineHighlightBackground': '#F7F7F7',
      'editorLineNumber.foreground': '#237893',
      'editorLineNumber.activeForeground': '#0B7EC8',
      'editor.selectionBackground': '#ADD6FF',
      'editor.selectionHighlightBackground': '#E5EBF1',
      'editor.inactiveSelectionBackground': '#E5EBF1',
      'editor.wordHighlightBackground': '#57575740',
      'editor.wordHighlightStrongBackground': '#0E639C40',
      'editor.findMatchBackground': '#A8AC94',
      'editor.findMatchHighlightBackground': '#EA5C0040',
      'editor.findRangeHighlightBackground': '#B4B4B4AA',
      'editor.hoverHighlightBackground': '#ADD6FF26',
      'editorHoverWidget.background': '#F3F3F3',
      'editorHoverWidget.border': '#C8C8C8',
      'editorSuggestWidget.background': '#F3F3F3',
      'editorSuggestWidget.border': '#C8C8C8',
      'editorSuggestWidget.selectedBackground': '#DDD6FE',
      'editorWidget.background': '#F3F3F3',
      'editorWidget.border': '#C8C8C8',
      'editorBracketMatch.background': '#0064001A',
      'editorBracketMatch.border': '#B9B9B9',
      'editorIndentGuide.background': '#D3D3D3',
      'editorIndentGuide.activeBackground': '#939393',
      'editorRuler.foreground': '#D3D3D3',
      'editorCodeLens.foreground': '#919191',
      'scrollbar.shadow': '#DDDDDD',
      'scrollbarSlider.background': '#79797933',
      'scrollbarSlider.hoverBackground': '#79797959',
      'scrollbarSlider.activeBackground': '#79797966',
    }
  },
  {
    name: 'tsverse-dark',
    displayName: 'TSVerse Dark',
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'operator.keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.escape', foreground: 'D7BA7D' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'regexp', foreground: 'D16969' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'namespace', foreground: '4EC9B0' },
      { token: 'type.identifier', foreground: '4EC9B0' },
      { token: 'identifier.ts', foreground: '9CDCFE' },
      { token: 'delimiter', foreground: 'D4D4D4' },
      { token: 'delimiter.bracket', foreground: 'DA70D6' },
      { token: 'delimiter.square', foreground: 'DA70D6' },
      { token: 'delimiter.parenthesis', foreground: 'DA70D6' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'variable.predefined', foreground: 'FFA500' },
      { token: 'constant', foreground: 'FFA500' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'function.call', foreground: 'DCDCAA' },
      { token: 'class', foreground: '4EC9B0' },
      { token: 'class.identifier.ts', foreground: '4EC9B0' },
      { token: 'interface', foreground: '4EC9B0' },
      { token: 'enum', foreground: '4EC9B0' },
      { token: 'module', foreground: '4EC9B0' },
      { token: 'property', foreground: '9CDCFE' },
      { token: 'property.value', foreground: 'CE9178' },
      { token: 'attribute.name', foreground: '92C5F8' },
      { token: 'attribute.value', foreground: 'CE9178' },
      { token: 'tag', foreground: '569CD6' }
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editorCursor.foreground': '#AEAFAD',
      'editor.lineHighlightBackground': '#2D2D30',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#C6C6C6',
      'editor.selectionBackground': '#264F78',
      'editor.selectionHighlightBackground': '#3A3D41',
      'editor.inactiveSelectionBackground': '#3A3D41',
      'editor.wordHighlightBackground': '#575757B8',
      'editor.wordHighlightStrongBackground': '#004972B8',
      'editor.findMatchBackground': '#515C6A',
      'editor.findMatchHighlightBackground': '#EA5C0042',
      'editor.findRangeHighlightBackground': '#3A3D4166',
      'editor.hoverHighlightBackground': '#264f7840',
      'editorHoverWidget.background': '#252526',
      'editorHoverWidget.border': '#454545',
      'editorSuggestWidget.background': '#252526',
      'editorSuggestWidget.border': '#454545',
      'editorSuggestWidget.selectedBackground': '#094771',
      'editorWidget.background': '#252526',
      'editorWidget.border': '#454545',
      'editorBracketMatch.background': '#0064001A',
      'editorBracketMatch.border': '#888888',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
      'editorRuler.foreground': '#5A5A5A',
      'editorCodeLens.foreground': '#999999',
      'scrollbar.shadow': '#000000',
      'scrollbarSlider.background': '#797979AA',
      'scrollbarSlider.hoverBackground': '#646464AA',
      'scrollbarSlider.activeBackground': '#BFBFBFAA',
    }
  },
  {
    name: 'tsverse-monokai',
    displayName: 'TSVerse Monokai',
    base: 'vs-dark',
    inherit: false,
    rules: [
      { token: '', foreground: 'F8F8F2' },
      { token: 'comment', foreground: '75715E', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'F92672', fontStyle: 'bold' },
      { token: 'operator.keyword', foreground: 'F92672' },
      { token: 'string', foreground: 'E6DB74' },
      { token: 'string.escape', foreground: 'AE81FF' },
      { token: 'number', foreground: 'AE81FF' },
      { token: 'regexp', foreground: 'E6DB74' },
      { token: 'type', foreground: '66D9EF', fontStyle: 'italic' },
      { token: 'namespace', foreground: '66D9EF' },
      { token: 'type.identifier', foreground: '66D9EF' },
      { token: 'identifier', foreground: 'F8F8F2' },
      { token: 'delimiter', foreground: 'F8F8F2' },
      { token: 'delimiter.bracket', foreground: 'F92672' },
      { token: 'delimiter.square', foreground: 'F92672' },
      { token: 'delimiter.parenthesis', foreground: 'F92672' },
      { token: 'variable', foreground: 'F8F8F2' },
      { token: 'variable.predefined', foreground: 'A6E22E' },
      { token: 'constant', foreground: 'AE81FF' },
      { token: 'function', foreground: 'A6E22E' },
      { token: 'function.call', foreground: 'A6E22E' },
      { token: 'class', foreground: 'A6E22E' },
      { token: 'class.identifier', foreground: 'A6E22E' },
      { token: 'interface', foreground: 'A6E22E' },
      { token: 'enum', foreground: 'A6E22E' },
      { token: 'module', foreground: 'A6E22E' },
      { token: 'property', foreground: 'F8F8F2' },
      { token: 'property.value', foreground: 'E6DB74' },
      { token: 'attribute.name', foreground: 'A6E22E' },
      { token: 'attribute.value', foreground: 'E6DB74' },
      { token: 'tag', foreground: 'F92672' }
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#F8F8F2',
      'editorCursor.foreground': '#F8F8F0',
      'editor.lineHighlightBackground': '#3E3D32',
      'editorLineNumber.foreground': '#90908A',
      'editorLineNumber.activeForeground': '#F8F8F2',
      'editor.selectionBackground': '#49483E',
      'editor.selectionHighlightBackground': '#49483E',
      'editor.inactiveSelectionBackground': '#49483E',
      'editor.wordHighlightBackground': '#4A4A76',
      'editor.wordHighlightStrongBackground': '#6A6A9A',
      'editor.findMatchBackground': '#FFE792',
      'editor.findMatchHighlightBackground': '#F83333',
      'editorWidget.background': '#2C2C24',
      'editorWidget.border': '#75715E',
    }
  }
];

// Default editor settings
export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  fontSize: 14,
  fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'off',
  lineNumbers: 'on',
  cursorStyle: 'line',
  cursorBlinking: 'blink',
  minimap: true,
  scrollBeyondLastLine: false,
  renderWhitespace: 'selection',
  renderLineHighlight: 'line',
  folding: true,
  autoIndent: 'full',
  formatOnPaste: true,
  formatOnType: true,
  autoClosingBrackets: 'languageDefined',
  autoClosingQuotes: 'languageDefined',
  autoSurround: 'languageDefined',
  snippetSuggestions: 'inline',
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true
  },
  parameterHints: true,
  hover: true,
  contextMenu: true,
  mouseWheelZoom: true,
  multiCursorModifier: 'ctrlCmd',
  accessibilitySupport: 'auto'
};

// Default TypeScript configuration
export const DEFAULT_TYPESCRIPT_CONFIG: TypeScriptConfig = {
  target: 'ES2020',
  module: 'ESNext',
  lib: ['ES2020', 'DOM'],
  allowJs: true,
  checkJs: false,
  jsx: 'react-jsx',
  declaration: false,
  declarationMap: false,
  sourceMap: true,
  outDir: './dist',
  rootDir: './src',
  strict: true,
  noImplicitAny: false,
  strictNullChecks: true,
  strictFunctionTypes: true,
  strictBindCallApply: true,
  strictPropertyInitialization: false,
  noImplicitThis: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  noUncheckedIndexedAccess: false,
  exactOptionalPropertyTypes: false,
  useDefineForClassFields: true,
  moduleResolution: 'node',
  baseUrl: './',
  paths: {},
  typeRoots: ['./node_modules/@types'],
  types: [],
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  preserveSymlinks: false,
  allowUmdGlobalAccess: false,
  experimentalDecorators: true,
  emitDecoratorMetadata: true
};

// Playground presets
export const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  {
    id: 'welcome',
    name: 'Welcome to TypeScript',
    description: 'A gentle introduction to TypeScript basics',
    category: 'beginner',
    tags: ['basics', 'introduction', 'types'],
    code: `// Welcome to the TypeScript Playground!
// TypeScript is JavaScript with syntax for types.

// Type annotations
let message: string = "Hello, TypeScript!";
let count: number = 42;
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// Objects
let user: {
  name: string;
  age: number;
  email?: string; // Optional property
} = {
  name: "John Doe",
  age: 30
};

// Functions
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Try modifying the code and see the IntelliSense in action!
console.log(greet("TypeScript"));
console.log("User:", user);`
  },
  {
    id: 'interfaces',
    name: 'Working with Interfaces',
    description: 'Learn how to define and use TypeScript interfaces',
    category: 'beginner',
    tags: ['interfaces', 'objects', 'types'],
    code: `// Interfaces define the shape of objects
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // Optional property
  readonly createdAt: Date; // Readonly property
}

// Extending interfaces
interface AdminUser extends User {
  permissions: string[];
  lastLogin?: Date;
}

// Implementing interfaces in classes
class UserManager implements User {
  readonly createdAt: Date = new Date();
  
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public isAdmin: boolean = false
  ) {}
  
  getDisplayName(): string {
    return this.isAdmin ? \`Admin: \${this.name}\` : this.name;
  }
}

// Using interfaces
const regularUser: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date()
};

const admin: AdminUser = {
  id: 2,
  name: "Bob",
  email: "bob@example.com",
  createdAt: new Date(),
  isAdmin: true,
  permissions: ["read", "write", "delete"],
  lastLogin: new Date()
};

const userManager = new UserManager(3, "Charlie", "charlie@example.com");

console.log("Regular user:", regularUser);
console.log("Admin user:", admin);
console.log("User manager:", userManager.getDisplayName());`
  },
  {
    id: 'generics-intro',
    name: 'Introduction to Generics',
    description: 'Understanding TypeScript generics with practical examples',
    category: 'intermediate',
    tags: ['generics', 'functions', 'classes', 'advanced-types'],
    code: `// Generics allow you to write reusable code that works with multiple types

// Generic function
function identity<T>(arg: T): T {
  return arg;
}

// Usage
const stringResult = identity<string>("Hello");
const numberResult = identity<number>(42);
const booleanResult = identity(true); // Type inference

// Generic interface
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

// Generic class implementation
class Box<T> implements Container<T> {
  constructor(public value: T) {}
  
  getValue(): T {
    return this.value;
  }
  
  setValue(value: T): void {
    this.value = value;
  }
}

// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// Generic constraints
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(\`Length: \${arg.length}\`);
  return arg;
}

// Conditional types
type ApiResponse<T> = T extends string ? { message: T } : { data: T };

// Examples
const stringBox = new Box<string>("TypeScript");
const numberBox = new Box<number>(100);

const coordinates = pair(10, 20);
const userPair = pair("Alice", { id: 1, active: true });

logLength("Hello World");
logLength([1, 2, 3, 4, 5]);

console.log("String box:", stringBox.getValue());
console.log("Number box:", numberBox.getValue());
console.log("Coordinates:", coordinates);
console.log("User pair:", userPair);`
  },
  {
    id: 'advanced-types',
    name: 'Advanced Type Patterns',
    description: 'Exploring advanced TypeScript type patterns and utilities',
    category: 'advanced',
    tags: ['advanced-types', 'utility-types', 'mapped-types', 'conditional-types'],
    code: `// Advanced TypeScript type patterns and utilities

// Union and intersection types
type Status = "idle" | "loading" | "success" | "error";
type User = { name: string; email: string };
type Admin = { permissions: string[] };
type AdminUser = User & Admin;

// Discriminated unions
interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: any;
}

interface ErrorState {
  status: "error";
  error: string;
}

type AppState = LoadingState | SuccessState | ErrorState;

// Type guards
function isErrorState(state: AppState): state is ErrorState {
  return state.status === "error";
}

// Mapped types
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

// Template literal types
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type ButtonEvents = EventName<"click" | "hover" | "focus">;

// Recursive types
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

// Utility types in action
interface UserProfile {
  id: number;
  name: string;
  email: string;
  age: number;
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

type PartialProfile = Partial<UserProfile>;
type RequiredProfile = Required<UserProfile>;
type UserEmail = Pick<UserProfile, "email">;
type UserWithoutId = Omit<UserProfile, "id">;

// Function overloads
function processData(data: string): string;
function processData(data: number): number;
function processData(data: boolean): boolean;
function processData(data: string | number | boolean): string | number | boolean {
  if (typeof data === "string") {
    return data.toUpperCase();
  } else if (typeof data === "number") {
    return data * 2;
  } else {
    return !data;
  }
}

// Example usage
const appState: AppState = { status: "loading" };

if (isErrorState(appState)) {
  console.log("Error:", appState.error);
} else if (appState.status === "success") {
  console.log("Data:", appState.data);
}

const userProfile: UserProfile = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  age: 30,
  preferences: {
    theme: "dark",
    notifications: true
  }
};

const partialUpdate: PartialProfile = { age: 31 };
const userEmail: UserEmail = { email: "alice@example.com" };

console.log("Processed string:", processData("hello"));
console.log("Processed number:", processData(21));
console.log("Processed boolean:", processData(true));`
  },
  {
    id: 'async-patterns',
    name: 'Async/Await Patterns',
    description: 'Working with Promises and async/await in TypeScript',
    category: 'intermediate',
    tags: ['async', 'promises', 'error-handling', 'types'],
    code: `// Async/Await patterns with TypeScript

// Basic Promise typing
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API response types
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

// Async function with proper typing
async function fetchUser(id: number): Promise<User> {
  await delay(1000); // Simulate network delay
  
  // Simulate API response
  return {
    id,
    name: \`User \${id}\`,
    email: \`user\${id}@example.com\`
  };
}

// Error handling with custom error types
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchUserWithErrorHandling(id: number): Promise<User> {
  try {
    if (id <= 0) {
      throw new ApiError('Invalid user ID', 400, 'INVALID_ID');
    }
    
    await delay(500);
    
    if (id === 404) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    return {
      id,
      name: \`User \${id}\`,
      email: \`user\${id}@example.com\`
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(\`API Error: \${error.message} (Status: \${error.status})\`);
    }
    throw error;
  }
}

// Promise combinators
async function fetchMultipleUsers(ids: number[]): Promise<User[]> {
  const promises = ids.map(id => fetchUser(id));
  return Promise.all(promises);
}

async function fetchFirstUser(ids: number[]): Promise<User> {
  const promises = ids.map(id => fetchUser(id));
  return Promise.race(promises);
}

// Async generators
async function* userGenerator(maxUsers: number): AsyncGenerator<User, void, unknown> {
  for (let i = 1; i <= maxUsers; i++) {
    yield await fetchUser(i);
  }
}

// Usage examples
async function main() {
  try {
    console.log("Fetching single user...");
    const user = await fetchUser(1);
    console.log("User:", user);
    
    console.log("Fetching multiple users...");
    const users = await fetchMultipleUsers([1, 2, 3]);
    console.log("Users:", users);
    
    console.log("Using async generator...");
    for await (const user of userGenerator(3)) {
      console.log("Generated user:", user);
    }
    
    // Error handling example
    console.log("Testing error handling...");
    await fetchUserWithErrorHandling(404);
    
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(\`Caught API error: \${error.message}\`);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

// Run the examples
main().catch(console.error);`
  },
  {
    id: 'class-decorators',
    name: 'Decorators and Metadata',
    description: 'Exploring TypeScript decorators and metadata reflection',
    category: 'advanced',
    tags: ['decorators', 'metadata', 'classes', 'experimental'],
    code: `// TypeScript Decorators (Experimental feature)
// Note: Enable experimentalDecorators in tsconfig.json

// Class decorator
function Component(name: string) {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      public componentName = name;
      public createdAt = new Date();
    };
  };
}

// Property decorator
function Required(target: any, propertyKey: string) {
  const descriptor: PropertyDescriptor = {
    set(value: any) {
      if (value === undefined || value === null) {
        throw new Error(\`Property \${propertyKey} is required\`);
      }
      this[\`_\${propertyKey}\`] = value;
    },
    get() {
      return this[\`_\${propertyKey}\`];
    }
  };
  
  Object.defineProperty(target, propertyKey, descriptor);
}

// Method decorator
function LogExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(\`Executing \${propertyKey} with arguments:, args\`);
    const result = originalMethod.apply(this, args);
    console.log(\`Method \${propertyKey} completed\`);
    return result;
  };
  
  return descriptor;
}

// Parameter decorator
function Validate(target: any, propertyKey: string, parameterIndex: number) {
  const existingMetadata = Reflect.getMetadata("validate", target, propertyKey) || [];
  existingMetadata.push(parameterIndex);
  Reflect.defineMetadata("validate", existingMetadata, target, propertyKey);
}

// Validation decorator for methods
function ValidateParams(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const metadata = Reflect.getMetadata("validate", target, propertyKey);
    if (metadata) {
      metadata.forEach((paramIndex: number) => {
        if (args[paramIndex] === undefined || args[paramIndex] === null) {
          throw new Error(\`Parameter at index \${paramIndex} is required\`);
        }
      });
    }
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

// Using decorators
@Component("UserService")
class UserService {
  @Required
  public apiUrl!: string;
  
  private users: Map<number, any> = new Map();
  
  @LogExecution
  createUser(name: string, email: string) {
    const id = this.users.size + 1;
    const user = { id, name, email, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  @LogExecution
  @ValidateParams
  getUserById(@Validate id: number) {
    return this.users.get(id);
  }
  
  @LogExecution
  getAllUsers() {
    return Array.from(this.users.values());
  }
}

// Factory decorator
function Cached(ttl: number = 5000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = new Map();
    
    descriptor.value = function (...args: any[]) {
      const key = JSON.stringify(args);
      const cached = cache.get(key);
      
      if (cached && Date.now() - cached.timestamp < ttl) {
        console.log(\`Cache hit for \${propertyKey}\`);
        return cached.value;
      }
      
      const result = originalMethod.apply(this, args);
      cache.set(key, { value: result, timestamp: Date.now() });
      console.log(\`Cache miss for \${propertyKey}, result cached\`);
      return result;
    };
    
    return descriptor;
  };
}

class DataService {
  @Cached(3000)
  @LogExecution
  fetchExpensiveData(query: string) {
    // Simulate expensive operation
    console.log(\`Fetching data for query: \${query}\`);
    return { data: \`Result for \${query}\`, timestamp: Date.now() };
  }
}

// Usage examples
try {
  const userService = new UserService();
  userService.apiUrl = "https://api.example.com";
  
  console.log("Component name:", (userService as any).componentName);
  console.log("Created at:", (userService as any).createdAt);
  
  const user1 = userService.createUser("Alice", "alice@example.com");
  const user2 = userService.createUser("Bob", "bob@example.com");
  
  console.log("Created users:", user1, user2);
  
  const foundUser = userService.getUserById(1);
  console.log("Found user:", foundUser);
  
  const allUsers = userService.getAllUsers();
  console.log("All users:", allUsers);
  
  // Test caching
  const dataService = new DataService();
  console.log("First call:");
  console.log(dataService.fetchExpensiveData("users"));
  
  console.log("Second call (should be cached):");
  console.log(dataService.fetchExpensiveData("users"));
  
} catch (error) {
  console.error("Error:", error.message);
}`
  },
  {
    id: 'type-challenges',
    name: 'Type System Challenge',
    description: 'Test your TypeScript skills with advanced type manipulations',
    category: 'challenges',
    tags: ['challenge', 'advanced-types', 'utility-types', 'problem-solving'],
    code: `// TypeScript Type System Challenge
// Try to implement these utility types from scratch!

// Challenge 1: Implement Pick<T, K>
// Should extract specific properties from type T
type MyPick<T, K extends keyof T> = {
  // Your implementation here
  [P in K]: T[P];
};

// Test MyPick
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type UserNameAndEmail = MyPick<User, 'name' | 'email'>;
// Should be: { name: string; email: string; }

// Challenge 2: Implement Readonly<T>
type MyReadonly<T> = {
  // Your implementation here
  readonly [P in keyof T]: T[P];
};

type ReadonlyUser = MyReadonly<User>;
// All properties should be readonly

// Challenge 3: Implement DeepReadonly<T>
// Should make all properties readonly recursively
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface NestedUser {
  id: number;
  profile: {
    name: string;
    settings: {
      theme: string;
      notifications: boolean;
    };
  };
}

type DeepReadonlyUser = DeepReadonly<NestedUser>;

// Challenge 4: Implement Exclude<T, U>
type MyExclude<T, U> = T extends U ? never : T;

type StringOrNumber = string | number | boolean;
type OnlyString = MyExclude<StringOrNumber, number | boolean>;
// Should be: string

// Challenge 5: Implement ReturnType<T>
type MyReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never;

function getUser(): User {
  return { id: 1, name: "Test", email: "test@example.com", age: 30 };
}

type UserReturnType = MyReturnType<typeof getUser>;
// Should be: User

// Challenge 6: Implement Chainable API
type Chainable<T = {}> = {
  option<K extends string, V>(key: K, value: V): Chainable<T & { [key in K]: V }>;
  get(): T;
};

declare const config: Chainable;

// Should work:
const result = config
  .option('foo', 123)
  .option('name', 'type-challenges')
  .option('bar', { value: 'Hello World' })
  .get();

// Challenge 7: Implement TupleToUnion
type TupleToUnion<T extends readonly any[]> = T[number];

type Arr = ['1', '2', '3'];
type UnionFromArr = TupleToUnion<Arr>; // '1' | '2' | '3'

// Challenge 8: Implement Length of Tuple
type Length<T extends readonly any[]> = T['length'];

type tesla = ['tesla', 'model 3', 'model X', 'model Y'];
type TeslaLength = Length<tesla>; // 4

// Challenge 9: Implement If<C, T, F>
type If<C extends boolean, T, F> = C extends true ? T : F;

type A = If<true, 'a', 'b'>;  // 'a'
type B = If<false, 'a', 'b'>; // 'b'

// Challenge 10: String manipulation
type Capitalize<S extends string> = S extends \`\${infer First}\${infer Rest}\`
  ? \`\${Uppercase<First>}\${Rest}\`
  : S;

type CapitalizeHello = Capitalize<'hello'>; // 'Hello'

// Bonus Challenge: Deep object path
type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? K | \`\${K}.\${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}\`
      : K | \`\${K}.\${PathImpl<T[K], keyof T[K]>}\`
    : K
  : never;

type Path<T> = PathImpl<T, keyof T> | keyof T;

type UserPaths = Path<NestedUser>;
// Should include: "id" | "profile" | "profile.name" | "profile.settings" | "profile.settings.theme" | "profile.settings.notifications"

// Test your implementations!
const testUser: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  age: 30
};

const picked: UserNameAndEmail = {
  name: testUser.name,
  email: testUser.email
};

console.log("Picked properties:", picked);
console.log("Challenges completed! Check the types above.");

// Advanced Challenge: Create a type-safe event emitter
interface Events {
  'user:created': { id: number; name: string };
  'user:updated': { id: number; changes: Partial<User> };
  'user:deleted': { id: number };
}

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: Array<(data: T[K]) => void> } = {};
  
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }
  
  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

const emitter = new TypedEventEmitter<Events>();

emitter.on('user:created', (data) => {
  console.log('User created:', data.name); // TypeScript knows data has id and name
});

emitter.emit('user:created', { id: 1, name: 'Alice' });

console.log("Type challenges completed! 🎉");`
  }
];

// Editor configuration utilities
export class EditorConfigManager {
  private static readonly STORAGE_KEY = 'tsverse-editor-config';
  
  static getSettings(): EditorSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_EDITOR_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load editor settings:', error);
    }
    return DEFAULT_EDITOR_SETTINGS;
  }
  
  static saveSettings(settings: Partial<EditorSettings>): void {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save editor settings:', error);
    }
  }
  
  static resetSettings(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to reset editor settings:', error);
    }
  }
  
  static getTheme(isDarkMode: boolean): string {
    const settings = this.getSettings();
    return isDarkMode ? 'tsverse-dark' : 'tsverse-light';
  }
}

export default EditorConfigManager;