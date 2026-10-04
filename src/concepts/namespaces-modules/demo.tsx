// File: concepts/namespaces-modules/demo.tsx

import type React from 'react';
import { useState } from 'react';

// Mock implementations for demonstration
const mockNamespace = {
  MathUtils: {
    add: (a: number, b: number) => a + b,
    multiply: (a: number, b: number) => a * b,
    PI: 3.14159,
  },
  Geometry: {
    TwoDimensional: {
      distance: (p1: {x: number, y: number}, p2: {x: number, y: number}) => 
        Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2),
      circleArea: (radius: number) => mockNamespace.MathUtils.PI * radius ** 2,
    }
  }
};

/** Collects what a demonstration prints and the code sample it shows. */
interface DemoWriter {
  line(message: string): void;
  code(sample: string): void;
}

interface DemoView {
  output: string[];
  codeExample: string;
}

/**
 * Runs a demonstration against an in-memory writer and returns what it
 * produced, so the result can be stored with a single state update (from an
 * event handler or a lazy initial state) instead of from an effect.
 */
const runDemo = (demo: (out: DemoWriter) => void): DemoView => {
  const output: string[] = [];
  let codeExample = '';
  demo({
    line: (message) => {
      output.push(message);
    },
    code: (sample) => {
      codeExample = sample;
    },
  });
  return { output, codeExample };
};

const NamespacesModulesDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'namespaces' | 'modules' | 'merging' | 'augmentation'>('namespaces');



  const demonstrateNamespaces = (out: DemoWriter) => {
    out.line('=== NAMESPACES DEMONSTRATION ===');
    out.line('');
    
    out.line('// Basic namespace usage');
    out.line('namespace MathUtils {');
    out.line('  export const PI = 3.14159;');
    out.line('  export function add(a: number, b: number) { return a + b; }');
    out.line('}');
    out.line('');
    
    const sum = mockNamespace.MathUtils.add(5, 3);
    out.line(`MathUtils.add(5, 3) = ${sum}`);
    out.line(`MathUtils.PI = ${mockNamespace.MathUtils.PI}`);
    out.line('');
    
    out.line('// Nested namespaces');
    out.line('namespace Geometry {');
    out.line('  export namespace TwoDimensional {');
    out.line('    export function distance(p1: Point, p2: Point) { ... }');
    out.line('  }');
    out.line('}');
    out.line('');
    
    const dist = mockNamespace.Geometry.TwoDimensional.distance({x: 0, y: 0}, {x: 3, y: 4});
    out.line(`Geometry.TwoDimensional.distance({0,0}, {3,4}) = ${dist.toFixed(2)}`);
    
    out.code(`// Namespace Declaration
namespace MathUtils {
  export const PI = 3.14159;
  
  export function add(a: number, b: number): number {
    return a + b;
  }
  
  export function multiply(a: number, b: number): number {
    return a * b;
  }
  
  export namespace Geometry {
    export function circleArea(radius: number): number {
      return PI * radius * radius;
    }
  }
}

// Usage
const result = MathUtils.add(5, 3);
const area = MathUtils.Geometry.circleArea(10);`);
  };

  const demonstrateModules = (out: DemoWriter) => {
    out.line('=== ES MODULES DEMONSTRATION ===');
    out.line('');
    
    out.line('// Named exports');
    out.line('export const API_VERSION = "1.0.0";');
    out.line('export function formatCurrency(amount: number) { ... }');
    out.line('export class ApiClient { ... }');
    out.line('export interface User { id: number; name: string; }');
    out.line('export type UserRole = "admin" | "user";');
    out.line('');
    
    out.line('// Default export');
    out.line('export default class ApplicationService { ... }');
    out.line('');
    
    out.line('// Import examples');
    out.line('import { API_VERSION, formatCurrency } from "./module";');
    out.line('import ApplicationService from "./module";');
    out.line('import * as Utils from "./utils";');
    out.line('');
    
    out.line('// Re-exports (barrel pattern)');
    out.line('export * from "./user-service";');
    out.line('export { UserService as Service } from "./user-service";');
    
    out.code(`// module.ts - Named and Default Exports
export const API_VERSION = '1.0.0';

export interface User {
  id: number;
  name: string;
  email: string;
}

export class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  getUser(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}

// Default export
export default class Application {
  private userService = new UserService();
  
  start(): void {
    console.log('App started');
  }
}

// main.ts - Imports
import Application from './module';
import { API_VERSION, UserService } from './module';
import * as Module from './module';

const app = new Application();
const service = new UserService();`);
  };

  const demonstrateDeclarationMerging = (out: DemoWriter) => {
    out.line('=== DECLARATION MERGING DEMONSTRATION ===');
    out.line('');
    
    out.line('// Interface merging');
    out.line('interface User {');
    out.line('  id: number;');
    out.line('  name: string;');
    out.line('}');
    out.line('');
    out.line('interface User {');
    out.line('  email: string;');
    out.line('  createdAt: Date;');
    out.line('}');
    out.line('');
    out.line('// Now User has: id, name, email, createdAt');
    out.line('');
    
    out.line('// Namespace merging');
    out.line('namespace Logger {');
    out.line('  export function log(msg: string) { console.log(msg); }');
    out.line('}');
    out.line('');
    out.line('namespace Logger {');
    out.line('  export function error(msg: string) { console.error(msg); }');
    out.line('}');
    out.line('');
    out.line('// Now Logger has both log and error methods');
    
    out.code(`// Declaration Merging Examples

// 1. Interface Merging
interface User {
  id: number;
  name: string;
}

interface User {
  email: string;
  isActive: boolean;
}

// Merged interface has all properties
const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  isActive: true
};

// 2. Namespace Merging
namespace MathUtils {
  export function add(a: number, b: number) { return a + b; }
}

namespace MathUtils {
  export function multiply(a: number, b: number) { return a * b; }
}

// 3. Class + Namespace Merging
class Album {
  constructor(public title: string) {}
}

namespace Album {
  export function create(title: string): Album {
    return new Album(title);
  }
}

// Usage: Album.create() and new Album()
const album1 = new Album('Abbey Road');
const album2 = Album.create('Dark Side');`);
  };

  const demonstrateModuleAugmentation = (out: DemoWriter) => {
    out.line('=== MODULE AUGMENTATION DEMONSTRATION ===');
    out.line('');
    
    out.line('// Augmenting built-in Array type');
    out.line('declare global {');
    out.line('  interface Array<T> {');
    out.line('    first(): T | undefined;');
    out.line('    last(): T | undefined;');
    out.line('    chunk(size: number): T[][];');
    out.line('  }');
    out.line('}');
    out.line('');
    out.line('Array.prototype.first = function() { return this[0]; };');
    out.line('Array.prototype.last = function() { return this[this.length - 1]; };');
    out.line('');
    out.line('// Usage:');
    out.line('const arr = [1, 2, 3, 4, 5];');
    out.line(`arr.first() // ${[1, 2, 3, 4, 5][0]}`);
    out.line(`arr.last()  // ${[1, 2, 3, 4, 5][4]}`);
    out.line('');
    
    out.line('// Augmenting external module');
    out.line('declare module "express" {');
    out.line('  interface Request {');
    out.line('    user?: { id: string; email: string; };');
    out.line('  }');
    out.line('}');
    
    out.code(`// Module Augmentation Examples

// 1. Augmenting Global Types
declare global {
  interface Array<T> {
    first(): T | undefined;
    last(): T | undefined;
    isEmpty(): boolean;
    chunk(size: number): T[][];
  }
  
  interface String {
    capitalize(): string;
    camelCase(): string;
    isEmail(): boolean;
  }
  
  interface Date {
    addDays(days: number): Date;
    format(format: string): string;
    isToday(): boolean;
  }
}

// Implementations
Array.prototype.first = function() { return this[0]; };
Array.prototype.chunk = function(size) {
  const chunks = [];
  for (let i = 0; i < this.length; i += size) {
    chunks.push(this.slice(i, i + size));
  }
  return chunks;
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

Date.prototype.addDays = function(days) {
  const result = new Date(this);
  result.setDate(result.getDate() + days);
  return result;
};

// 2. Augmenting Third-party Modules
declare module 'express' {
  interface Request {
    user?: { id: string; roles: string[]; };
    requestId: string;
  }
  
  interface Response {
    success(data?: any): Response;
    error(message: string): Response;
  }
}

// Usage in Express routes
app.get('/profile', (req, res) => {
  if (!req.user) {
    return res.error('Unauthorized');
  }
  res.success({ profile: req.user });
});`);
  };

  const tabButtons = [
    { key: 'namespaces' as const, label: 'Namespaces', color: 'bg-blue-500' },
    { key: 'modules' as const, label: 'ES Modules', color: 'bg-green-500' },
    { key: 'merging' as const, label: 'Declaration Merging', color: 'bg-purple-500' },
    { key: 'augmentation' as const, label: 'Module Augmentation', color: 'bg-orange-500' },
  ];

  // The initial tab's demonstration is shown from the first render.
  const [{ output, codeExample }, setDemoView] = useState<DemoView>(() => runDemo(demonstrateNamespaces));

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'namespaces': setDemoView(runDemo(demonstrateNamespaces)); break;
      case 'modules': setDemoView(runDemo(demonstrateModules)); break;
      case 'merging': setDemoView(runDemo(demonstrateDeclarationMerging)); break;
      case 'augmentation': setDemoView(runDemo(demonstrateModuleAugmentation)); break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          TypeScript Namespaces & Modules Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Explore TypeScript&apos;s module system including namespaces, ES modules, declaration merging, and module augmentation.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabButtons.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => handleTabClick(key)}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
              activeTab === key 
                ? `${color} shadow-md transform scale-105` 
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Output Console */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Demo Output</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {output.length === 0 ? (
              <div className="text-gray-500">
                Select a tab to see the demonstration...
              </div>
            ) : (
              <div className="space-y-1">
                {output.map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code Example */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Code Example</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              <code className="language-typescript">{codeExample}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Namespaces</h3>
          <p className="text-sm text-blue-700">
            TypeScript&apos;s internal module system. Group related functionality under a common name.
          </p>
          <div className="mt-2 text-xs text-blue-600">
            • Nested organization<br/>
            • Export control<br/>
            • Namespace merging
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">ES Modules</h3>
          <p className="text-sm text-green-700">
            Standard JavaScript module system with import/export syntax.
          </p>
          <div className="mt-2 text-xs text-green-600">
            • Named exports<br/>
            • Default exports<br/>
            • Re-exports
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-800 mb-2">Declaration Merging</h3>
          <p className="text-sm text-purple-700">
            Merge multiple declarations with the same name into a single definition.
          </p>
          <div className="mt-2 text-xs text-purple-600">
            • Interface merging<br/>
            • Namespace merging<br/>
            • Mixed merging
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-2">Module Augmentation</h3>
          <p className="text-sm text-orange-700">
            Extend existing modules and global types with new functionality.
          </p>
          <div className="mt-2 text-xs text-orange-600">
            • Global augmentation<br/>
            • Third-party modules<br/>
            • Prototype extensions
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-800 mb-3">💡 Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
          <div>
            <h4 className="font-medium mb-2">Namespaces vs Modules:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Prefer ES modules over namespaces</li>
              <li>Use namespaces for organizing types</li>
              <li>Namespaces good for library organization</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Module Organization:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Use barrel exports for clean APIs</li>
              <li>Group related functionality</li>
              <li>Avoid circular dependencies</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Declaration Merging:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Use for extending interfaces</li>
              <li>Merge namespaces across files</li>
              <li>Be careful with ordering</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Module Augmentation:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Extend built-in types carefully</li>
              <li>Document augmentations well</li>
              <li>Consider impact on other code</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NamespacesModulesDemo;