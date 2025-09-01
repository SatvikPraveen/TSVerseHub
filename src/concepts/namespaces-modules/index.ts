// File: concepts/namespaces-modules/index.ts

/**
 * NAMESPACES AND MODULES IN TYPESCRIPT
 * 
 * TypeScript supports both namespaces and modules for organizing code:
 * - Namespaces: Internal module system (formerly called "internal modules")
 * - Modules: External module system aligned with ES6 modules
 * 
 * This module demonstrates various aspects of TypeScript's module system.
 */

// Re-export all namespace and module concepts
export * from './namespaces';
export * from './esmodules';
export * from './declaration-merging';
export * from './module-augmentation';

// Namespace example (internal organization)
export namespace MathUtilities {
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
    
    export function rectangleArea(width: number, height: number): number {
      return multiply(width, height);
    }
  }
}

// Using namespaces
const area = MathUtilities.Geometry.circleArea(5);
const sum = MathUtilities.add(10, 20);

// Module imports and exports (ES6 style)
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
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }
}

// Default export
export default class Application {
  private userService = new UserService();

  start(): void {
    console.log('Application started');
  }

  getUserService(): UserService {
    return this.userService;
  }
}

// Module with both named and default exports
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'TypeScript Demo';

// Re-export from other modules
export { EventEmitter } from 'events';

// Namespace merging example
export namespace Logger {
  export function log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

export namespace Logger {
  export function error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}

// Now Logger has both log and error methods

// Interface merging across modules
export interface Window {
  customProperty: string;
}

// Type-only imports and exports
export type { User as UserType };
export type { UserService as UserServiceType };

// Conditional exports based on environment
export const config = process.env.NODE_ENV === 'production' 
  ? { debug: false, apiUrl: 'https://api.prod.com' }
  : { debug: true, apiUrl: 'https://api.dev.com' };

// Module augmentation example
declare global {
  interface Array<T> {
    first(): T | undefined;
    last(): T | undefined;
  }
}

Array.prototype.first = function<T>(this: T[]): T | undefined {
  return this[0];
};

Array.prototype.last = function<T>(this: T[]): T | undefined {
  return this[this.length - 1];
};

// Barrel exports pattern
export * from './esmodules';
export * from './namespaces';

// Dynamic imports (for demonstration - would be used at runtime)
export async function loadUtilities() {
  const { MathUtilities: Math } = await import('./namespaces');
  return Math;
}

// Module factory pattern
export function createLogger(prefix: string) {
  return {
    log: (message: string) => console.log(`[${prefix}] ${message}`),
    error: (message: string) => console.error(`[${prefix}] ${message}`),
    warn: (message: string) => console.warn(`[${prefix}] ${message}`),
  };
}

// Ambient module declarations
declare module 'external-lib' {
  export function doSomething(): void;
  export const VERSION: string;
}

// Module resolution helpers
export function getModulePath(moduleName: string): string {
  return `./node_modules/${moduleName}`;
}

export default {
  MathUtilities,
  UserService,
  Application,
  Logger,
  config,
  createLogger,
  loadUtilities,
  getModulePath,
};