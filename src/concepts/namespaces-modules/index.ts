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

// Re-export all namespace and module concepts.
// Several sub-modules export the same names; `export *` cannot pick between them
// (and TypeScript silently drops the ambiguous names), so every public name is
// listed explicitly exactly once, with module-qualified aliases for duplicates.
export {
  BasicMath, Geometry, DataStructures, HttpStatus, Validation, TwoDim, ThreeDim, DS, aliasedPoint,
  aliasedStack, DatabaseConnection, Application as NamespacedApplication, hasExternalLibrary,
} from './namespaces';
export {
  formatCurrency, createApiClient, createUser, debounce, throttle, retry, isObject, deepClone,
  pick, omit, API_VERSION, MAX_RETRY_ATTEMPTS, ApiClient, ResponseStatus, publicFunction,
  ValidationHelpers, Logger as EsModuleLogger, APP_CONFIG, HTTP_STATUS_CODES, ApiError,
  ValidationError, MODULE_INFO,
} from './esmodules';
export type {
  User as EsModuleUser, UserRole, UserType as EsModuleUserType, DatabaseConfig, ApiResponse,
} from './esmodules';
export {
  buildQuery, MathUtils, result1, result2, result3, Album, album, manager, newAlbum, query1,
  query2, query3, Color, hexValue, rgbValue, ApiEndpoint, endpointString, fullUrl, appConfig,
  Repository, ValidationRule, ConsoleLogger, mergedUser, userRepository,
} from './declaration-merging';
export type {
  User as MergedUser, Config, DevConfig, Logger as MergedLogger, UserRecord,
} from './declaration-merging';
export {
  demonstrateAugmentations, expressAugmentationExample,
} from './module-augmentation';

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
export const area = MathUtilities.Geometry.circleArea(5);
export const sum = MathUtilities.add(10, 20);

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

// Primary application class (the module's default export is the bundle at the bottom)
export class Application {
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

// A small, typed event emitter. (Node's built-in 'events' module is not
// available in the browser bundle, so this module provides its own.)
export type EventMap = Record<string, unknown[]>;
export type EventListener<Args extends unknown[]> = (...args: Args) => void;

export class EventEmitter<Events extends EventMap = Record<string, unknown[]>> {
  private listeners: { [K in keyof Events]?: Set<EventListener<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    const set = this.listeners[event] ?? new Set<EventListener<Events[K]>>();
    set.add(listener);
    this.listeners[event] = set;
    return this;
  }

  once<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    const wrapper: EventListener<Events[K]> = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }

  off<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    this.listeners[event]?.delete(listener);
    return this;
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean {
    const set = this.listeners[event];
    if (!set || set.size === 0) return false;
    for (const listener of Array.from(set)) {
      listener(...args);
    }
    return true;
  }

  listenerCount<K extends keyof Events>(event: K): number {
    return this.listeners[event]?.size ?? 0;
  }

  removeAllListeners<K extends keyof Events>(event?: K): this {
    if (event === undefined) {
      this.listeners = {};
    } else {
      delete this.listeners[event];
    }
    return this;
  }
}

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

// Barrel exports pattern: see the explicit re-export lists at the top of this file.

// Dynamic imports (for demonstration - would be used at runtime)
export async function loadUtilities() {
  const { BasicMath } = await import('./namespaces');
  return BasicMath;
}

// Module factory pattern
export function createLogger(prefix: string) {
  return {
    log: (message: string) => console.log(`[${prefix}] ${message}`),
    error: (message: string) => console.error(`[${prefix}] ${message}`),
    warn: (message: string) => console.warn(`[${prefix}] ${message}`),
  };
}

// Ambient module declarations. Inside a module file (one with imports or
// exports) `declare module 'x' { ... }` is treated as an *augmentation* of an
// existing module, so an ambient declaration for a package without types must
// live in a script file such as `types/external-lib.d.ts`:
export const ambientModuleExample = `
declare module 'external-lib' {
  export function doSomething(): void;
  export const VERSION: string;
}
`;

// Module resolution helpers
export function getModulePath(moduleName: string): string {
  return `./node_modules/${moduleName}`;
}

export default {
  MathUtilities,
  UserService,
  Application,
  EventEmitter,
  Logger,
  config,
  createLogger,
  loadUtilities,
  getModulePath,
};