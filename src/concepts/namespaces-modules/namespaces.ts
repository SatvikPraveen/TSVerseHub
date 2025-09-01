// File: concepts/namespaces-modules/namespaces.ts

/**
 * TYPESCRIPT NAMESPACES
 * 
 * Namespaces (formerly called "internal modules") are a TypeScript-specific
 * way to organize code. They provide a way to group related functionality
 * under a common name.
 */

// Basic namespace declaration
export namespace BasicMath {
  export function add(x: number, y: number): number {
    return x + y;
  }

  export function subtract(x: number, y: number): number {
    return x - y;
  }

  export const PI = 3.14159;
}

// Nested namespaces
export namespace Geometry {
  export namespace TwoDimensional {
    export interface Point {
      x: number;
      y: number;
    }

    export interface Circle {
      center: Point;
      radius: number;
    }

    export interface Rectangle {
      topLeft: Point;
      width: number;
      height: number;
    }

    export function distance(p1: Point, p2: Point): number {
      return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }

    export function circleArea(circle: Circle): number {
      return Math.PI * circle.radius ** 2;
    }

    export function rectangleArea(rect: Rectangle): number {
      return rect.width * rect.height;
    }
  }

  export namespace ThreeDimensional {
    export interface Point3D {
      x: number;
      y: number;
      z: number;
    }

    export interface Sphere {
      center: Point3D;
      radius: number;
    }

    export interface Box {
      origin: Point3D;
      width: number;
      height: number;
      depth: number;
    }

    export function distance3D(p1: Point3D, p2: Point3D): number {
      return Math.sqrt(
        (p2.x - p1.x) ** 2 + 
        (p2.y - p1.y) ** 2 + 
        (p2.z - p1.z) ** 2
      );
    }

    export function sphereVolume(sphere: Sphere): number {
      return (4/3) * Math.PI * sphere.radius ** 3;
    }

    export function boxVolume(box: Box): number {
      return box.width * box.height * box.depth;
    }
  }
}

// Namespace with classes and interfaces
export namespace DataStructures {
  export interface IStack<T> {
    push(item: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
    isEmpty(): boolean;
    size(): number;
  }

  export class Stack<T> implements IStack<T> {
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

    isEmpty(): boolean {
      return this.items.length === 0;
    }

    size(): number {
      return this.items.length;
    }
  }

  export interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    front(): T | undefined;
    isEmpty(): boolean;
    size(): number;
  }

  export class Queue<T> implements IQueue<T> {
    private items: T[] = [];

    enqueue(item: T): void {
      this.items.push(item);
    }

    dequeue(): T | undefined {
      return this.items.shift();
    }

    front(): T | undefined {
      return this.items[0];
    }

    isEmpty(): boolean {
      return this.items.length === 0;
    }

    size(): number {
      return this.items.length;
    }
  }
}

// Namespace with enums and constants
export namespace HttpStatus {
  export enum Code {
    OK = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
  }

  export const Messages: Record<Code, string> = {
    [Code.OK]: 'OK',
    [Code.Created]: 'Created',
    [Code.BadRequest]: 'Bad Request',
    [Code.Unauthorized]: 'Unauthorized',
    [Code.Forbidden]: 'Forbidden',
    [Code.NotFound]: 'Not Found',
    [Code.InternalServerError]: 'Internal Server Error',
  };

  export function isSuccess(code: Code): boolean {
    return code >= 200 && code < 300;
  }

  export function isClientError(code: Code): boolean {
    return code >= 400 && code < 500;
  }

  export function isServerError(code: Code): boolean {
    return code >= 500 && code < 600;
  }
}

// Namespace merging (split across multiple declarations)
export namespace Validation {
  export interface Rule<T> {
    validate(value: T): boolean;
    message: string;
  }

  export function required(value: any): boolean {
    return value != null && value !== '';
  }
}

export namespace Validation {
  export function minLength(min: number): Rule<string> {
    return {
      validate: (value: string) => value && value.length >= min,
      message: `Must be at least ${min} characters`,
    };
  }

  export function maxLength(max: number): Rule<string> {
    return {
      validate: (value: string) => !value || value.length <= max,
      message: `Must be at most ${max} characters`,
    };
  }
}

export namespace Validation {
  export function email(): Rule<string> {
    return {
      validate: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value || emailRegex.test(value);
      },
      message: 'Must be a valid email address',
    };
  }

  export function range(min: number, max: number): Rule<number> {
    return {
      validate: (value: number) => value >= min && value <= max,
      message: `Must be between ${min} and ${max}`,
    };
  }
}

// Namespace aliases
export import TwoDim = Geometry.TwoDimensional;
export import ThreeDim = Geometry.ThreeDimensional;
export import DS = DataStructures;

// Using namespace aliases
const point: TwoDim.Point = { x: 10, y: 20 };
const stack = new DS.Stack<number>();

// Ambient namespace (declare external libraries)
declare namespace ExternalLibrary {
  export function initialize(config: any): void;
  export function cleanup(): void;
  
  export namespace Utils {
    export function format(data: any): string;
    export function parse(input: string): any;
  }
}

// Module-like namespace with internal/private members
export namespace DatabaseConnection {
  // Private (not exported) members
  let connection: any = null;
  let isConnected = false;

  // Public API
  export function connect(connectionString: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (isConnected) {
        resolve();
        return;
      }

      // Simulate connection logic
      setTimeout(() => {
        connection = { connectionString, id: Math.random() };
        isConnected = true;
        console.log('Connected to database');
        resolve();
      }, 1000);
    });
  }

  export function disconnect(): void {
    if (connection) {
      connection = null;
      isConnected = false;
      console.log('Disconnected from database');
    }
  }

  export function isConnectionActive(): boolean {
    return isConnected;
  }

  export function getConnectionId(): string | null {
    return connection ? connection.id : null;
  }

  export async function query<T>(sql: string): Promise<T[]> {
    if (!isConnected) {
      throw new Error('Not connected to database');
    }

    // Simulate query execution
    console.log(`Executing query: ${sql}`);
    return new Promise(resolve => {
      setTimeout(() => resolve([] as T[]), 500);
    });
  }
}

// Complex nested namespace example
export namespace Application {
  export namespace Core {
    export interface ILogger {
      log(message: string): void;
      error(message: string): void;
      warn(message: string): void;
    }

    export class Logger implements ILogger {
      private prefix: string;

      constructor(prefix = 'APP') {
        this.prefix = prefix;
      }

      log(message: string): void {
        console.log(`[${this.prefix}] ${message}`);
      }

      error(message: string): void {
        console.error(`[${this.prefix}] ERROR: ${message}`);
      }

      warn(message: string): void {
        console.warn(`[${this.prefix}] WARN: ${message}`);
      }
    }
  }

  export namespace Config {
    export interface DatabaseConfig {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
    }

    export interface AppConfig {
      port: number;
      environment: 'development' | 'production' | 'test';
      database: DatabaseConfig;
      logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        file?: string;
      };
    }

    export const defaultConfig: AppConfig = {
      port: 3000,
      environment: 'development',
      database: {
        host: 'localhost',
        port: 5432,
        database: 'myapp',
        username: 'user',
        password: 'password',
      },
      logging: {
        level: 'info',
      },
    };

    export function loadConfig(): AppConfig {
      // In real app, would load from environment variables or config file
      return defaultConfig;
    }
  }

  export namespace Services {
    export class ConfigService {
      private config: Config.AppConfig;
      private logger: Core.ILogger;

      constructor() {
        this.config = Config.loadConfig();
        this.logger = new Core.Logger('CONFIG');
      }

      getConfig(): Config.AppConfig {
        return this.config;
      }

      getDatabaseConfig(): Config.DatabaseConfig {
        return this.config.database;
      }
    }
  }
}

// Usage examples
console.log('=== Namespace Examples ===');

// Basic usage
const result = BasicMath.add(5, 3);
console.log(`5 + 3 = ${result}`);

// Nested namespace usage
const point1: Geometry.TwoDimensional.Point = { x: 0, y: 0 };
const point2: Geometry.TwoDimensional.Point = { x: 3, y: 4 };
const dist = Geometry.TwoDimensional.distance(point1, point2);
console.log(`Distance: ${dist}`);

// Using namespace with classes
const stack = new DataStructures.Stack<string>();
stack.push('first');
stack.push('second');
console.log(`Stack size: ${stack.size()}`);

// HTTP status namespace
console.log(`Status 200: ${HttpStatus.Messages[HttpStatus.Code.OK]}`);
console.log(`Is 200 success? ${HttpStatus.isSuccess(HttpStatus.Code.OK)}`);

// Validation namespace
const emailRule = Validation.email();
console.log(`Valid email test: ${emailRule.validate('test@example.com')}`);

export default {
  BasicMath,
  Geometry,
  DataStructures,
  HttpStatus,
  Validation,
  TwoDim,
  ThreeDim,
  DS,
  DatabaseConnection,
  Application,
};