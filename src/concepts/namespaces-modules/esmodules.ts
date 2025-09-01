// File: concepts/namespaces-modules/esmodules.ts

/**
 * ES MODULES IN TYPESCRIPT
 * 
 * TypeScript fully supports ES6 modules (ECMAScript modules), which are
 * the standard module system for JavaScript. This file demonstrates
 * various module patterns and features.
 */

// ===== BASIC EXPORTS =====

// Named exports - can have multiple per module
export const API_VERSION = '1.0.0';
export const MAX_RETRY_ATTEMPTS = 3;

// Export function
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Export class
export class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout = 5000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`GET ${url}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: 'mock data' } as T);
      }, 100);
    });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`POST ${url}`, data);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data } as T);
      }, 100);
    });
  }
}

// Export interface
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// Export type alias
export type UserRole = 'admin' | 'user' | 'moderator';

// Export enum
export enum ResponseStatus {
  Success = 'success',
  Error = 'error',
  Loading = 'loading',
}

// ===== ADVANCED EXPORT PATTERNS =====

// Re-export from another module (barrel pattern)
// export { SomeClass, SomeInterface } from './other-module';
// export * from './utilities';

// Export with different name
const internalFunction = () => 'internal';
export { internalFunction as publicFunction };

// Export namespace
export namespace ValidationHelpers {
  export function isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  export function isStrongPassword(password: string): boolean {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  }

  export function sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, '');
  }
}

// ===== TYPE-ONLY EXPORTS =====

// Export types without runtime code
export type { User as UserType };

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  ssl?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: ResponseStatus;
  message?: string;
  errors?: string[];
}

// ===== DEFAULT EXPORT =====

// Default export - only one per module
class ApplicationService {
  private apiClient: ApiClient;
  private users: User[] = [];

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async loadUsers(): Promise<User[]> {
    try {
      const response = await this.apiClient.get<ApiResponse<User[]>>('/users');
      this.users = response.data;
      return this.users;
    } catch (error) {
      console.error('Failed to load users:', error);
      return [];
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now(),
      createdAt: new Date(),
    };

    try {
      await this.apiClient.post<ApiResponse<User>>('/users', newUser);
      this.users.push(newUser);
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUsersByRole(role: UserRole): User[] {
    // In a real app, would filter by role property
    return this.users;
  }
}

export default ApplicationService;

// ===== MODULE AUGMENTATION EXAMPLE =====

// Extend built-in types
declare global {
  interface String {
    toTitleCase(): string;
    truncate(length: number, suffix?: string): string;
  }
}

String.prototype.toTitleCase = function(): string {
  return this.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

String.prototype.truncate = function(length: number, suffix = '...'): string {
  if (this.length <= length) return this.toString();
  return this.substr(0, length) + suffix;
};

// ===== CONDITIONAL EXPORTS =====

// Export different implementations based on environment
export const Logger = process.env.NODE_ENV === 'production'
  ? {
      log: () => {}, // No-op in production
      error: console.error,
      warn: console.warn,
    }
  : {
      log: console.log,
      error: console.error,
      warn: console.warn,
    };

// ===== FACTORY FUNCTIONS =====

export function createApiClient(baseUrl: string, options?: {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}): ApiClient {
  const client = new ApiClient(baseUrl, options?.timeout);
  
  // Could add additional configuration here
  if (options?.headers) {
    console.log('Adding default headers:', options.headers);
  }
  
  return client;
}

export function createUser(
  name: string, 
  email: string, 
  role: UserRole = 'user'
): Omit<User, 'id' | 'createdAt'> {
  if (!ValidationHelpers.isEmail(email)) {
    throw new Error('Invalid email address');
  }

  return {
    name: name.trim(),
    email: email.toLowerCase(),
  };
}

// ===== UTILITY FUNCTIONS =====

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number = MAX_RETRY_ATTEMPTS,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retry attempts exceeded');
}

// ===== CONSTANTS AND CONFIGURATION =====

export const APP_CONFIG = {
  name: 'TypeScript Demo App',
  version: API_VERSION,
  environment: process.env.NODE_ENV || 'development',
  features: {
    authentication: true,
    analytics: process.env.NODE_ENV === 'production',
    debugMode: process.env.NODE_ENV === 'development',
  },
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ===== ERROR CLASSES =====

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ===== GENERIC UTILITIES =====

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

export function pick<T, K extends keyof T>(
  obj: T, 
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function omit<T, K extends keyof T>(
  obj: T, 
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// ===== MODULE METADATA =====

// Module information that can be inspected
export const MODULE_INFO = {
  name: 'esmodules',
  version: '1.0.0',
  exports: [
    'API_VERSION',
    'ApiClient',
    'User',
    'UserRole', 
    'ResponseStatus',
    'ValidationHelpers',
    'ApplicationService',
    'Logger',
    'createApiClient',
    'createUser',
    'debounce',
    'throttle',
    'retry',
    'APP_CONFIG',
    'HTTP_STATUS_CODES',
    'ApiError',
    'ValidationError',
  ],
  types: [
    'User',
    'UserType',
    'DatabaseConfig',
    'ApiResponse',
  ],
} as const;