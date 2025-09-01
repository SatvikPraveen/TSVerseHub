// File: concepts/namespaces-modules/exercises.ts

/**
 * NAMESPACES AND MODULES EXERCISES
 * 
 * Complete these exercises to practice TypeScript namespaces, modules,
 * declaration merging, and module augmentation concepts.
 */

// ===== EXERCISE 1: BASIC NAMESPACE =====
// TODO: Create a namespace called 'Calculator' with the following:
// - Constants: PI, E
// - Functions: add, subtract, multiply, divide, power, sqrt
// - A nested namespace called 'Trigonometry' with sin, cos, tan functions

export namespace Calculator {
  // Your implementation here
}

// Test your Calculator namespace
// const result1 = Calculator.add(5, 3);
// const result2 = Calculator.Trigonometry.sin(Calculator.PI / 2);

// ===== EXERCISE 2: ES MODULE EXPORTS =====
// TODO: Create the following exports:
// - Named export: API_BASE_URL constant
// - Named export: HttpClient class with get, post, put, delete methods
// - Named export: RequestOptions interface
// - Default export: ApiService class that uses HttpClient

export const API_BASE_URL = ''; // Your implementation

export interface RequestOptions {
  // Your interface definition
}

export class HttpClient {
  // Your class implementation
}

export default class ApiService {
  // Your default export class
}

// ===== EXERCISE 3: INTERFACE MERGING =====
// TODO: Create multiple interface declarations for 'Product' that merge into:
// - id: number, name: string (first declaration)
// - price: number, category: string (second declaration)
// - tags: string[], createdAt: Date (third declaration)

export interface Product {
  // First declaration
}

// Add second Product interface declaration here

// Add third Product interface declaration here

// Test: Create a Product object with all merged properties
// const product: Product = { ... };

// ===== EXERCISE 4: NAMESPACE MERGING =====
// TODO: Create multiple namespace declarations for 'DataValidator' that merge:
// - First: string validation functions (required, minLength, maxLength)
// - Second: number validation functions (range, positive, integer)
// - Third: email and url validation functions

export namespace DataValidator {
  // First namespace declaration
}

// Add second DataValidator namespace here

// Add third DataValidator namespace here

// ===== EXERCISE 5: CLASS AND NAMESPACE MERGING =====
// TODO: Create a Logger class and merge it with a Logger namespace:
// - Logger class: constructor(name), log(message), error(message)
// - Logger namespace: static createConsoleLogger(), createFileLogger()

export class Logger {
  // Your class implementation
}

export namespace Logger {
  // Your namespace implementation
}

// ===== EXERCISE 6: GLOBAL AUGMENTATION =====
// TODO: Augment the global Array interface to add these methods:
// - sum(): number (sum all numeric elements)
// - average(): number (average of numeric elements)
// - distinct(): T[] (remove duplicates)
// - shuffle(): T[] (randomly shuffle array)

declare global {
  interface Array<T> {
    // Your augmentation here
  }
}

// Implement the augmented methods
// Array.prototype.sum = function() { ... };

// ===== EXERCISE 7: STRING AUGMENTATION =====
// TODO: Augment the String interface with these methods:
// - words(): string[] (split into words)
// - lines(): string[] (split into lines)
// - hash(): number (simple hash function)
// - contains(substring: string, ignoreCase?: boolean): boolean

declare global {
  interface String {
    // Your augmentation here
  }
}

// Implement the augmented String methods

// ===== EXERCISE 8: MODULE AUGMENTATION =====
// TODO: Augment a hypothetical 'database' module to add these to the Connection interface:
// - beginTransaction(): Promise<void>
// - commitTransaction(): Promise<void>
// - rollbackTransaction(): Promise<void>

declare module 'database' {
  interface Connection {
    // Your augmentation here
  }
}

// ===== EXERCISE 9: COMPLEX NAMESPACE ORGANIZATION =====
// TODO: Create a 'GameEngine' namespace with nested organization:
// - Graphics namespace: Renderer class, Sprite class, Color enum
// - Audio namespace: SoundManager class, AudioClip class
// - Input namespace: Keyboard class, Mouse class, GamepadManager class
// - Utils namespace: Vector2D class, Timer class, Random functions

export namespace GameEngine {
  // Your implementation here
}

// ===== EXERCISE 10: ADVANCED MODULE PATTERNS =====
// TODO: Create a module that demonstrates:
// - Conditional exports based on environment
// - Factory functions for creating instances
// - Module-level singleton pattern
// - Type-only exports

// Environment-based exports
export const config = process.env.NODE_ENV === 'production' 
  ? { /* production config */ }
  : { /* development config */ };

// Factory function
export function createService(/* parameters */) {
  // Your implementation
}

// Singleton pattern
class ServiceSingleton {
  // Your implementation
}

let instance: ServiceSingleton | null = null;
export function getServiceInstance(): ServiceSingleton {
  // Your implementation
  return instance!;
}

// Type-only exports
export type { /* Your type exports */ };

// ===== EXERCISE SOLUTIONS (REFERENCE IMPLEMENTATIONS) =====

/*
// SOLUTION 1: Calculator namespace
export namespace Calculator {
  export const PI = Math.PI;
  export const E = Math.E;

  export function add(a: number, b: number): number {
    return a + b;
  }

  export function subtract(a: number, b: number): number {
    return a - b;
  }

  export function multiply(a: number, b: number): number {
    return a * b;
  }

  export function divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }

  export function power(base: number, exponent: number): number {
    return Math.pow(base, exponent);
  }

  export function sqrt(value: number): number {
    return Math.sqrt(value);
  }

  export namespace Trigonometry {
    export function sin(angle: number): number {
      return Math.sin(angle);
    }

    export function cos(angle: number): number {
      return Math.cos(angle);
    }

    export function tan(angle: number): number {
      return Math.tan(angle);
    }
  }
}

// SOLUTION 2: ES Module exports
export const API_BASE_URL = 'https://api.example.com';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export class HttpClient {
  constructor(private baseUrl: string) {}

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    // Implementation
    return {} as T;
  }

  async post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    // Implementation
    return {} as T;
  }

  async put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    // Implementation
    return {} as T;
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    // Implementation
    return {} as T;
  }
}

export default class ApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient(API_BASE_URL);
  }

  async getUsers() {
    return this.client.get('/users');
  }

  async createUser(userData: any) {
    return this.client.post('/users', userData);
  }
}

// SOLUTION 3: Interface merging
export interface Product {
  id: number;
  name: string;
}

export interface Product {
  price: number;
  category: string;
}

export interface Product {
  tags: string[];
  createdAt: Date;
}

// SOLUTION 4: Namespace merging
export namespace DataValidator {
  export function required(value: any): boolean {
    return value != null && value !== '';
  }

  export function minLength(value: string, min: number): boolean {
    return value && value.length >= min;
  }

  export function maxLength(value: string, max: number): boolean {
    return !value || value.length <= max;
  }
}

export namespace DataValidator {
  export function range(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  export function positive(value: number): boolean {
    return value > 0;
  }

  export function integer(value: number): boolean {
    return Number.isInteger(value);
  }
}

export namespace DataValidator {
  export function email(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  export function url(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
}
*/

// ===== TESTING YOUR SOLUTIONS =====

export function testExercises() {
  console.log('=== TESTING NAMESPACE AND MODULE EXERCISES ===\n');

  try {
    // Test Calculator namespace
    // console.log('Calculator.add(5, 3):', Calculator.add(5, 3));
    // console.log('Calculator.PI:', Calculator.PI);
    
    // Test Product interface merging
    // const product: Product = {
    //   id: 1,
    //   name: 'Test Product',
    //   price: 99.99,
    //   category: 'Electronics',
    //   tags: ['new', 'popular'],
    //   createdAt: new Date()
    // };
    // console.log('Product:', product);

    // Test Array augmentation
    // const numbers = [1, 2, 3, 4, 5];
    // console.log('Array sum:', numbers.sum());
    // console.log('Array average:', numbers.average());

    console.log('✅ Test your implementations!');
  } catch (error) {
    console.error('❌ Error testing exercises:', error);
  }
}

// ===== BONUS CHALLENGES =====

// BONUS 1: Create a type-safe event system using namespaces
// TODO: Implement EventSystem namespace with EventEmitter class

export namespace EventSystem {
  // Your bonus implementation
}

// BONUS 2: Create a module that mimics a popular library's API
// TODO: Create a mini lodash-like utility library

export namespace _ {
  // Your utility functions here
}

// BONUS 3: Advanced module augmentation
// TODO: Augment Promise to add retry and timeout methods

declare global {
  interface Promise<T> {
    retry(attempts: number, delay?: number): Promise<T>;
    timeout(ms: number): Promise<T>;
  }
}

// BONUS 4: Create a plugin system using modules and namespaces
// TODO: Design a system where plugins can extend core functionality

export interface Plugin {
  name: string;
  version: string;
  install(core: any): void;
}

export namespace PluginSystem {
  // Your plugin system implementation
}

export default {
  Calculator,
  HttpClient,
  ApiService,
  Logger,
  GameEngine,
  EventSystem,
  _,
  PluginSystem,
  testExercises,
};