// File: concepts/patterns/singleton.ts

/**
 * SINGLETON PATTERN
 * 
 * The Singleton pattern ensures that a class has only one instance
 * and provides a global access point to that instance. This is useful
 * for managing shared resources like database connections, loggers,
 * or configuration objects.
 */

// ===== BASIC SINGLETON =====

export class BasicSingleton {
  private static instance: BasicSingleton | null = null;
  private data: string = 'Default data';

  // Private constructor prevents direct instantiation
  private constructor() {
    console.log('BasicSingleton instance created');
  }

  public static getInstance(): BasicSingleton {
    if (!BasicSingleton.instance) {
      BasicSingleton.instance = new BasicSingleton();
    }
    return BasicSingleton.instance;
  }

  public setData(data: string): void {
    this.data = data;
  }

  public getData(): string {
    return this.data;
  }
}

// ===== THREAD-SAFE SINGLETON =====

export class ThreadSafeSingleton {
  private static instance: ThreadSafeSingleton | null = null;
  private static isCreatingInstance: boolean = false;
  private connectionCount: number = 0;

  private constructor() {
    if (ThreadSafeSingleton.isCreatingInstance) {
      throw new Error('Cannot create instance directly');
    }
    console.log('ThreadSafeSingleton instance created');
  }

  public static getInstance(): ThreadSafeSingleton {
    if (!ThreadSafeSingleton.instance && !ThreadSafeSingleton.isCreatingInstance) {
      ThreadSafeSingleton.isCreatingInstance = true;
      ThreadSafeSingleton.instance = new ThreadSafeSingleton();
      ThreadSafeSingleton.isCreatingInstance = false;
    }
    return ThreadSafeSingleton.instance!;
  }

  public getConnectionCount(): number {
    return this.connectionCount;
  }

  public incrementConnection(): void {
    this.connectionCount++;
  }
}

// ===== LAZY INITIALIZATION SINGLETON =====

export class LazySingleton {
  private static _instance: LazySingleton;
  private initializationData: string;

  private constructor() {
    console.log('LazySingleton: Performing expensive initialization...');
    // Simulate expensive initialization
    this.initializationData = `Initialized at ${new Date().toISOString()}`;
  }

  public static get instance(): LazySingleton {
    if (!this._instance) {
      this._instance = new LazySingleton();
    }
    return this._instance;
  }

  public getInitializationData(): string {
    return this.initializationData;
  }
}

// ===== GENERIC SINGLETON =====

export abstract class GenericSingleton<T> {
  private static instances: Map<Function, any> = new Map();

  public static getInstance<T>(this: new () => T): T {
    if (!GenericSingleton.instances.has(this)) {
      GenericSingleton.instances.set(this, new this());
    }
    return GenericSingleton.instances.get(this);
  }
}

// Example usage of generic singleton
export class DatabaseManager extends GenericSingleton<DatabaseManager> {
  private connections: Map<string, any> = new Map();

  public createConnection(name: string, config: any): void {
    this.connections.set(name, { name, config, connected: true });
    console.log(`Database connection '${name}' created`);
  }

  public getConnection(name: string): any {
    return this.connections.get(name);
  }

  public listConnections(): string[] {
    return Array.from(this.connections.keys());
  }
}

export class CacheManager extends GenericSingleton<CacheManager> {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  public set(key: string, value: any, ttl: number = 300000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  public get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// ===== CONFIGURATION SINGLETON =====

interface AppConfig {
  apiUrl: string;
  timeout: number;
  retries: number;
  debug: boolean;
  database: {
    host: string;
    port: number;
    name: string;
  };
}

export class ConfigManager {
  private static instance: ConfigManager | null = null;
  private config: AppConfig;

  private constructor() {
    // Load configuration from environment or config file
    this.config = this.loadConfiguration();
    console.log('ConfigManager initialized with config:', this.config);
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfiguration(): AppConfig {
    // In real application, this would load from process.env, config files, etc.
    return {
      apiUrl: process.env.API_URL || 'https://api.example.com',
      timeout: parseInt(process.env.TIMEOUT || '5000'),
      retries: parseInt(process.env.RETRIES || '3'),
      debug: process.env.NODE_ENV === 'development',
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME || 'myapp',
      },
    };
  }

  public getConfig(): AppConfig {
    return { ...this.config }; // Return a copy to prevent mutations
  }

  public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  public updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('Configuration updated:', updates);
  }
}

// ===== LOGGER SINGLETON =====

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static instance: Logger | null = null;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: { level: LogLevel; message: string; timestamp: Date }[] = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private log(level: LogLevel, message: string): void {
    if (level >= this.logLevel) {
      const logEntry = {
        level,
        message,
        timestamp: new Date(),
      };
      
      this.logs.push(logEntry);
      
      const levelName = LogLevel[level];
      const timestamp = logEntry.timestamp.toISOString();
      console.log(`[${timestamp}] ${levelName}: ${message}`);
    }
  }

  public debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  public info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  public warn(message: string): void {
    this.log(LogLevel.WARN, message);
  }

  public error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  public getLogs(): typeof this.logs {
    return [...this.logs]; // Return a copy
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

// ===== SINGLETON WITH DEPENDENCY INJECTION =====

export interface Database {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
}

export class MockDatabase implements Database {
  private connected: boolean = false;

  async connect(): Promise<void> {
    this.connected = true;
    console.log('Mock database connected');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('Mock database disconnected');
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    console.log(`Executing query: ${sql}`, params);
    return [] as T[];
  }
}

export class DatabaseService {
  private static instance: DatabaseService | null = null;
  private database: Database;

  private constructor(database: Database) {
    this.database = database;
  }

  public static getInstance(database?: Database): DatabaseService {
    if (!DatabaseService.instance) {
      if (!database) {
        throw new Error('Database instance required for first initialization');
      }
      DatabaseService.instance = new DatabaseService(database);
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    await this.database.connect();
  }

  public async query<T>(sql: string, params?: any[]): Promise<T[]> {
    return this.database.query<T>(sql, params);
  }

  public async shutdown(): Promise<void> {
    await this.database.disconnect();
  }
}

// ===== ENUM-BASED SINGLETON =====

export class EnumSingleton {
  public static readonly INSTANCE = new EnumSingleton();
  private value: string = 'Initial value';

  private constructor() {
    // Private constructor
  }

  public setValue(value: string): void {
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }
}

// ===== SINGLETON REGISTRY =====

export class SingletonRegistry {
  private static registry: Map<string, any> = new Map();

  public static register<T>(name: string, instance: T): void {
    SingletonRegistry.registry.set(name, instance);
  }

  public static get<T>(name: string): T {
    const instance = SingletonRegistry.registry.get(name);
    if (!instance) {
      throw new Error(`No singleton registered with name: ${name}`);
    }
    return instance;
  }

  public static has(name: string): boolean {
    return SingletonRegistry.registry.has(name);
  }

  public static unregister(name: string): boolean {
    return SingletonRegistry.registry.delete(name);
  }

  public static clear(): void {
    SingletonRegistry.registry.clear();
  }

  public static list(): string[] {
    return Array.from(SingletonRegistry.registry.keys());
  }
}

// ===== USAGE EXAMPLES =====

console.log('=== Singleton Pattern Examples ===');

// Basic Singleton
const singleton1 = BasicSingleton.getInstance();
const singleton2 = BasicSingleton.getInstance();
console.log('Same instance?', singleton1 === singleton2); // true

singleton1.setData('Modified data');
console.log('Data from second reference:', singleton2.getData()); // 'Modified data'

// Generic Singleton
const dbManager1 = DatabaseManager.getInstance();
const dbManager2 = DatabaseManager.getInstance();
console.log('DatabaseManager same instance?', dbManager1 === dbManager2); // true

const cacheManager1 = CacheManager.getInstance();
const cacheManager2 = CacheManager.getInstance();
console.log('CacheManager same instance?', cacheManager1 === cacheManager2); // true

// Different singleton types are different instances
console.log('Different types same instance?', dbManager1 === cacheManager1); // false

// Configuration Manager
const config = ConfigManager.getInstance();
console.log('API URL:', config.get('apiUrl'));
config.updateConfig({ timeout: 10000 });

// Logger
const logger = Logger.getInstance();
logger.setLogLevel(LogLevel.DEBUG);
logger.debug('This is a debug message');
logger.info('Application started');
logger.warn('This is a warning');
logger.error('This is an error');

// Database Service with DI
const mockDb = new MockDatabase();
const dbService = DatabaseService.getInstance(mockDb);
dbService.initialize();

// Singleton Registry
SingletonRegistry.register('config', config);
SingletonRegistry.register('logger', logger);

const retrievedConfig = SingletonRegistry.get<ConfigManager>('config');
console.log('Retrieved from registry:', retrievedConfig === config); // true

// ===== ANTI-PATTERNS AND CONSIDERATIONS =====

/**
 * WHEN TO USE SINGLETON:
 * - Logging services
 * - Configuration management
 * - Database connections
 * - Caching services
 * - Thread pools
 * - Device drivers
 * 
 * WHEN NOT TO USE SINGLETON:
 * - When you need multiple instances
 * - For stateless utility classes
 * - When it makes testing difficult
 * - When it violates single responsibility
 * 
 * DRAWBACKS:
 * - Global state (can be problematic)
 * - Difficult to test
 * - Hidden dependencies
 * - Violates single responsibility principle
 * - Difficult to extend
 */

// Better alternative: Dependency Injection
export interface IConfigService {
  get<T>(key: string): T;
}

export interface ILogService {
  log(message: string): void;
}

export class UserService {
  constructor(
    private config: IConfigService,
    private logger: ILogService
  ) {}

  async getUser(id: string): Promise<any> {
    const apiUrl = this.config.get<string>('apiUrl');
    this.logger.log(`Fetching user ${id} from ${apiUrl}`);
    // Implementation...
  }
}

// Export the main Singleton for compatibility
export const Singleton = BasicSingleton;

export default {
  BasicSingleton,
  ThreadSafeSingleton,
  LazySingleton,
  GenericSingleton,
  DatabaseManager,
  CacheManager,
  ConfigManager,
  Logger,
  LogLevel,
  DatabaseService,
  EnumSingleton,
  SingletonRegistry,
  UserService,
};