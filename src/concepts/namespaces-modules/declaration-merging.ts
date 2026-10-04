// File: concepts/namespaces-modules/declaration-merging.ts

/**
 * DECLARATION MERGING IN TYPESCRIPT
 * 
 * Declaration merging means the compiler merges two or more separate
 * declarations declared with the same name into a single definition.
 * This merged definition has the features of both original declarations.
 */

// ===== INTERFACE MERGING =====

// The merged names in this file are declared locally and re-exported once at the
// bottom (see the note next to the export statement there).

// First interface declaration
interface User {
  id: number;
  name: string;
}

// Second interface declaration - merges with the first
interface User {
  email: string;
  createdAt: Date;
}

// Third interface declaration - adds more properties
interface User {
  lastLoginAt?: Date;
  isActive: boolean;
}

// Now User has all properties: id, name, email, createdAt, lastLoginAt, isActive
const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date(),
  lastLoginAt: new Date(),
  isActive: true,
};

// ===== NAMESPACE MERGING =====

// First namespace declaration
export namespace MathUtils {
  export function add(a: number, b: number): number {
    return a + b;
  }
  
  export const PI = 3.14159;
}

// Second namespace declaration - merges with the first
export namespace MathUtils {
  export function multiply(a: number, b: number): number {
    return a * b;
  }
  
  export function subtract(a: number, b: number): number {
    return a - b;
  }
}

// Third namespace declaration - adds more functionality
export namespace MathUtils {
  export function divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
  
  export function power(base: number, exponent: number): number {
    return Math.pow(base, exponent);
  }
}

// Now MathUtils has all functions: add, multiply, subtract, divide, power, and PI
export const result1 = MathUtils.add(5, 3);
export const result2 = MathUtils.multiply(4, 6);
export const result3 = MathUtils.divide(10, 2);

// ===== NAMESPACE WITH CLASS MERGING =====

export class Album {
  constructor(public title: string, public artist: string) {}
}

export namespace Album {
  export class AlbumManager {
    private albums: Album[] = [];

    addAlbum(album: Album): void {
      this.albums.push(album);
    }

    getAlbums(): Album[] {
      return [...this.albums];
    }

    findByTitle(title: string): Album | undefined {
      return this.albums.find(album => album.title === title);
    }
  }

  export function createAlbum(title: string, artist: string): Album {
    return new Album(title, artist);
  }
}

// Usage: Album is both a class and a namespace
export const album = new Album('Abbey Road', 'The Beatles');
export const manager = new Album.AlbumManager();
export const newAlbum = Album.createAlbum('Dark Side of the Moon', 'Pink Floyd');
manager.addAlbum(album);
manager.addAlbum(newAlbum);

// ===== NAMESPACE WITH FUNCTION MERGING =====

export function buildQuery(table: string): string {
  return `SELECT * FROM ${table}`;
}

export namespace buildQuery {
  export function select(columns: string[], table: string): string {
    return `SELECT ${columns.join(', ')} FROM ${table}`;
  }

  export function insert(table: string, data: Record<string, any>): string {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).map(v => `'${v}'`).join(', ');
    return `INSERT INTO ${table} (${columns}) VALUES (${values})`;
  }

  export function update(table: string, data: Record<string, any>, condition: string): string {
    const sets = Object.entries(data)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ');
    return `UPDATE ${table} SET ${sets} WHERE ${condition}`;
  }

  export function deleteFrom(table: string, condition: string): string {
    return `DELETE FROM ${table} WHERE ${condition}`;
  }
}

// Usage: buildQuery is both a function and a namespace
export const query1 = buildQuery('users');
export const query2 = buildQuery.select(['name', 'email'], 'users');
export const query3 = buildQuery.insert('users', { name: 'John', email: 'john@example.com' });

// ===== ENUM MERGING =====

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

export namespace Color {
  export function getHex(color: Color): string {
    switch (color) {
      case Color.Red: return '#FF0000';
      case Color.Green: return '#00FF00';
      case Color.Blue: return '#0000FF';
      default: return '#000000';
    }
  }

  export function getRgb(color: Color): [number, number, number] {
    switch (color) {
      case Color.Red: return [255, 0, 0];
      case Color.Green: return [0, 255, 0];
      case Color.Blue: return [0, 0, 255];
      default: return [0, 0, 0];
    }
  }

  // Explicit annotation: inside the merged namespace, `Color` refers to the
  // enum *and* the namespace, so inference here would be circular.
  export const PRIMARY_COLORS: Color[] = [Color.Red, Color.Green, Color.Blue];
}

// Usage: Color is both an enum and a namespace
const color = Color.Red;
export const hexValue = Color.getHex(color);
export const rgbValue = Color.getRgb(color);

// ===== GLOBAL AUGMENTATION =====

// Augment global Array interface
declare global {
  interface Array<T> {
    chunk(size: number): T[][];
    unique(): T[];
    // Named differently from the Record-returning `groupBy` declared in
    // module-augmentation.ts: both files augment the same global interface,
    // so a shared name with a different return type would conflict.
    groupToMap<K>(keyFn: (item: T) => K): Map<K, T[]>;
  }
}

Array.prototype.chunk = function<T>(this: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < this.length; i += size) {
    chunks.push(this.slice(i, i + size));
  }
  return chunks;
};

Array.prototype.unique = function<T>(this: T[]): T[] {
  return [...new Set(this)];
};

Array.prototype.groupToMap = function<T, K>(this: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of this) {
    const key = keyFn(item);
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
};

// ===== MODULE AUGMENTATION =====

// Augment existing module
declare module './esmodules' {
  interface User {
    profilePicture?: string;
    preferences?: {
      theme: 'light' | 'dark';
      language: string;
    };
  }

  namespace ValidationHelpers {
    export function isUrl(url: string): boolean;
    export function isPhoneNumber(phone: string): boolean;
  }
}

// ===== COMPLEX MERGING EXAMPLE =====

interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

namespace ApiEndpoint {
  export function create(path: string, method: ApiEndpoint['method']): ApiEndpoint {
    return { path, method };
  }

  export function toString(endpoint: ApiEndpoint): string {
    return `${endpoint.method} ${endpoint.path}`;
  }
}

interface ApiEndpoint {
  headers?: Record<string, string>;
  query?: Record<string, any>;
}

namespace ApiEndpoint {
  export function withHeaders(endpoint: ApiEndpoint, headers: Record<string, string>): ApiEndpoint {
    return { ...endpoint, headers: { ...endpoint.headers, ...headers } };
  }

  export function withQuery(endpoint: ApiEndpoint, query: Record<string, any>): ApiEndpoint {
    return { ...endpoint, query: { ...endpoint.query, ...query } };
  }

  export function getFullUrl(endpoint: ApiEndpoint, baseUrl: string): string {
    let url = `${baseUrl}${endpoint.path}`;
    if (endpoint.query) {
      const queryString = new URLSearchParams(endpoint.query).toString();
      url += `?${queryString}`;
    }
    return url;
  }
}

// Usage of merged ApiEndpoint
const endpoint: ApiEndpoint = {
  path: '/users',
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  query: { page: 1, limit: 10 }
};

export const endpointString = ApiEndpoint.toString(endpoint);
export const fullUrl = ApiEndpoint.getFullUrl(endpoint, 'https://api.example.com');

// ===== CONDITIONAL MERGING =====

export interface Config {
  apiUrl: string;
  timeout: number;
}

// Merge additional properties in development
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      API_URL: string;
      DEBUG?: string;
    }
  }
}

// Development-specific config. Note: declaration merging is purely static, so
// an interface declared inside an `if` block would be a *new* block-scoped
// interface rather than a merge with the module-level `Config`. To express
// "extra properties in development" use interface extension instead.
export interface DevConfig extends Config {
  debug: boolean;
  mockApi: boolean;
  devTools: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

export const appConfig: Config | DevConfig =
  process.env.NODE_ENV === 'development'
    ? {
        apiUrl: 'https://api.example.com',
        timeout: 5000,
        debug: true,
        mockApi: true,
        devTools: { enabled: true, logLevel: 'debug' },
      }
    : { apiUrl: 'https://api.example.com', timeout: 5000 };

// ===== MERGING WITH GENERICS =====

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(entity: Omit<T, 'id'>): Promise<T>;
}

interface Repository<T> {
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  findAll(options?: { page?: number; limit?: number }): Promise<T[]>;
}

namespace Repository {
  export function createInMemory<T extends { id: string }>(): Repository<T> {
    const data = new Map<string, T>();

    return {
      async findById(id: string): Promise<T | null> {
        return data.get(id) || null;
      },

      async create(entity: Omit<T, 'id'>): Promise<T> {
        const newEntity = { ...entity, id: Date.now().toString() } as T;
        data.set(newEntity.id, newEntity);
        return newEntity;
      },

      async update(id: string, updates: Partial<T>): Promise<T> {
        const existing = data.get(id);
        if (!existing) throw new Error('Entity not found');
        
        const updated = { ...existing, ...updates };
        data.set(id, updated);
        return updated;
      },

      async delete(id: string): Promise<boolean> {
        return data.delete(id);
      },

      async findAll(options?: { page?: number; limit?: number }): Promise<T[]> {
        const items = Array.from(data.values());
        if (!options) return items;
        
        const { page = 1, limit = 10 } = options;
        const start = (page - 1) * limit;
        return items.slice(start, start + limit);
      }
    };
  }
}

// ===== MERGING CONSTRAINTS =====

// Generic interface: all merged declarations must have identical type
// parameters (same names and constraints). A default may be given on one
// declaration and omitted on the others.
interface ValidationRule<T = unknown> {
  validate(value: T): boolean;
  message: string;
}

// String-oriented options (merged in from a "string validation" module)
interface ValidationRule<T> {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  normalize?(value: T): T;
}

// Number-oriented options (merged in from a "number validation" module)
interface ValidationRule<T> {
  min?: number;
  max?: number;
  step?: number;
  clamp?(value: T): T;
}

namespace ValidationRule {
  export function createStringRule(
    message: string,
    options?: { pattern?: RegExp; minLength?: number; maxLength?: number }
  ): ValidationRule<string> {
    return {
      message,
      ...options,
      validate(value: string): boolean {
        if (options?.minLength && value.length < options.minLength) return false;
        if (options?.maxLength && value.length > options.maxLength) return false;
        if (options?.pattern && !options.pattern.test(value)) return false;
        return true;
      }
    };
  }

  export function createNumberRule(
    message: string,
    options?: { min?: number; max?: number; step?: number }
  ): ValidationRule<number> {
    return {
      message,
      ...options,
      validate(value: number): boolean {
        if (options?.min !== undefined && value < options.min) return false;
        if (options?.max !== undefined && value > options.max) return false;
        if (options?.step && (value % options.step) !== 0) return false;
        return true;
      }
    };
  }
}

// ===== PRACTICAL EXAMPLES =====

// Logger interface that gets merged across different parts of application
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

// Database module adds database logging
interface Logger {
  logQuery(query: string, params?: any[]): void;
  logTransaction(action: 'begin' | 'commit' | 'rollback'): void;
}

// HTTP module adds request logging  
interface Logger {
  logRequest(method: string, url: string, statusCode?: number): void;
  logResponse(statusCode: number, responseTime: number): void;
}

// Authentication module adds auth logging
interface Logger {
  logLogin(userId: string, success: boolean): void;
  logLogout(userId: string): void;
  logAuthFailure(attempt: string, reason: string): void;
}

export class ConsoleLogger implements Logger {
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

  logQuery(query: string, params?: any[]): void {
    console.log(`[${this.prefix}] QUERY: ${query}`, params || '');
  }

  logTransaction(action: 'begin' | 'commit' | 'rollback'): void {
    console.log(`[${this.prefix}] TRANSACTION: ${action.toUpperCase()}`);
  }

  logRequest(method: string, url: string, statusCode?: number): void {
    const status = statusCode ? ` (${statusCode})` : '';
    console.log(`[${this.prefix}] REQUEST: ${method} ${url}${status}`);
  }

  logResponse(statusCode: number, responseTime: number): void {
    console.log(`[${this.prefix}] RESPONSE: ${statusCode} (${responseTime}ms)`);
  }

  logLogin(userId: string, success: boolean): void {
    const status = success ? 'SUCCESS' : 'FAILURE';
    console.log(`[${this.prefix}] LOGIN: User ${userId} - ${status}`);
  }

  logLogout(userId: string): void {
    console.log(`[${this.prefix}] LOGOUT: User ${userId}`);
  }

  logAuthFailure(attempt: string, reason: string): void {
    console.log(`[${this.prefix}] AUTH_FAILURE: ${attempt} - ${reason}`);
  }
}

// ===== USAGE EXAMPLES =====

console.log('=== Declaration Merging Examples ===');

// Interface merging
export const mergedUser: User = {
  id: 1,
  name: 'Jane Doe',
  email: 'jane@example.com',
  createdAt: new Date(),
  isActive: true,
};

// Namespace merging
const mathResult = MathUtils.add(MathUtils.multiply(2, 3), MathUtils.divide(8, 2));
console.log('Math result:', mathResult);

// Function with namespace merging
const selectQuery = buildQuery.select(['id', 'name'], 'users');
console.log('Select query:', selectQuery);

// Enum with namespace merging
const redColor = Color.Red;
const redHex = Color.getHex(redColor);
console.log('Red color hex:', redHex);

// Array prototype extensions
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const chunks = numbers.chunk(3);
const unique = [1, 2, 2, 3, 3, 4].unique();
console.log('Chunks:', chunks);
console.log('Unique:', unique);

// Repository with merged interface (the in-memory repository requires string ids)
export type UserRecord = Omit<User, 'id'> & { id: string };
export const userRepository = Repository.createInMemory<UserRecord>();

// Logger with merged interface
const logger = new ConsoleLogger('DEMO');
logger.log('Application started');
logger.logQuery('SELECT * FROM users WHERE active = ?', [true]);
logger.logRequest('GET', '/api/users', 200);

// Every declaration that takes part in a merge must be either exported or local
// (TS2395: "Individual declarations in merged declaration must be all exported or
// all local"), so the merged names above are declared locally and exported once here.
export { ApiEndpoint, Repository, ValidationRule };
export type { User, Logger };

export default {
  MathUtils,
  Album,
  buildQuery,
  Color,
  ApiEndpoint,
  Repository,
  ValidationRule,
  ConsoleLogger,
  user,
  mathResult,
  logger,
};