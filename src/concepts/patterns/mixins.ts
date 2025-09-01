// File: concepts/patterns/mixins.ts

/**
 * MIXINS PATTERN
 * 
 * Mixins provide a way to add functionality to classes through composition
 * rather than inheritance. TypeScript supports mixins through intersection
 * types and clever use of the type system.
 */

// ===== BASIC MIXIN PATTERN =====

// Constructor type helper
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin function for adding timestamp functionality
export function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    touch(): void {
      this.updatedAt = new Date();
    }

    getAge(): number {
      return Date.now() - this.createdAt.getTime();
    }

    getTimeSinceUpdate(): number {
      return Date.now() - this.updatedAt.getTime();
    }
  };
}

// Mixin function for adding logging functionality
export function Loggable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private logs: Array<{ timestamp: Date; message: string; level: string }> = [];

    log(message: string, level: string = 'info'): void {
      const entry = {
        timestamp: new Date(),
        message,
        level,
      };
      this.logs.push(entry);
      console.log(`[${level.toUpperCase()}] ${message}`);
    }

    getLogs(): typeof this.logs {
      return [...this.logs];
    }

    clearLogs(): void {
      this.logs = [];
    }

    getLogCount(): number {
      return this.logs.length;
    }
  };
}

// Mixin for adding validation functionality
export function Validatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private validationRules: Array<(obj: any) => { isValid: boolean; errors: string[] }> = [];

    addValidationRule(rule: (obj: any) => { isValid: boolean; errors: string[] }): void {
      this.validationRules.push(rule);
    }

    validate(): { isValid: boolean; errors: string[] } {
      const allErrors: string[] = [];
      
      for (const rule of this.validationRules) {
        const result = rule(this);
        if (!result.isValid) {
          allErrors.push(...result.errors);
        }
      }

      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
      };
    }

    isValid(): boolean {
      return this.validate().isValid;
    }
  };
}

// Mixin for adding serialization functionality
export function Serializable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    serialize(): string {
      // Get all enumerable properties
      const obj: any = {};
      const proto = Object.getPrototypeOf(this);
      
      // Get own properties
      Object.keys(this).forEach(key => {
        obj[key] = (this as any)[key];
      });

      return JSON.stringify(obj);
    }

    deserialize(json: string): void {
      const data = JSON.parse(json);
      Object.assign(this, data);
    }

    clone(): this {
      const serialized = this.serialize();
      const Constructor = this.constructor as any;
      const cloned = new Constructor();
      cloned.deserialize(serialized);
      return cloned;
    }
  };
}

// Mixin for adding event emitter functionality
export function EventEmitting<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map();

    on(event: string, listener: (...args: any[]) => void): void {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event)!.push(listener);
    }

    off(event: string, listener: (...args: any[]) => void): void {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }

    emit(event: string, ...args: any[]): void {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.forEach(listener => listener(...args));
      }
    }

    removeAllListeners(event?: string): void {
      if (event) {
        this.eventListeners.delete(event);
      } else {
        this.eventListeners.clear();
      }
    }

    getListenerCount(event: string): number {
      const listeners = this.eventListeners.get(event);
      return listeners ? listeners.length : 0;
    }
  };
}

// ===== DISPOSABLE MIXIN =====

export function Disposable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private _disposed: boolean = false;
    private disposables: Array<() => void> = [];

    addDisposable(disposeFn: () => void): void {
      this.disposables.push(disposeFn);
    }

    dispose(): void {
      if (this._disposed) return;

      this.disposables.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Error during disposal:', error);
        }
      });

      this.disposables = [];
      this._disposed = true;
    }

    isDisposed(): boolean {
      return this._disposed;
    }
  };
}

// ===== CACHEABLE MIXIN =====

export function Cacheable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private cache: Map<string, { value: any; expiry: number }> = new Map();

    setCache(key: string, value: any, ttl: number = 300000): void {
      const expiry = Date.now() + ttl;
      this.cache.set(key, { value, expiry });
    }

    getCache(key: string): any {
      const item = this.cache.get(key);
      if (!item) return null;

      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }

      return item.value;
    }

    clearCache(): void {
      this.cache.clear();
    }

    getCacheSize(): number {
      return this.cache.size;
    }

    getCacheKeys(): string[] {
      return Array.from(this.cache.keys());
    }
  };
}

// ===== OBSERVABLE MIXIN =====

export function Observable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private observers: Array<(change: { property: string; oldValue: any; newValue: any }) => void> = [];
    private propertyValues: Map<string, any> = new Map();

    addObserver(observer: (change: { property: string; oldValue: any; newValue: any }) => void): void {
      this.observers.push(observer);
    }

    removeObserver(observer: (change: { property: string; oldValue: any; newValue: any }) => void): void {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    }

    setProperty(property: string, value: any): void {
      const oldValue = this.propertyValues.get(property);
      this.propertyValues.set(property, value);
      (this as any)[property] = value;

      this.notifyObservers({ property, oldValue, newValue: value });
    }

    getProperty(property: string): any {
      return this.propertyValues.get(property);
    }

    private notifyObservers(change: { property: string; oldValue: any; newValue: any }): void {
      this.observers.forEach(observer => observer(change));
    }
  };
}

// ===== EXAMPLE BASE CLASSES =====

class User {
  constructor(public name: string, public email: string) {}

  greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}

class Product {
  constructor(public name: string, public price: number) {}

  getDisplayName(): string {
    return `${this.name} - $${this.price}`;
  }
}

class Document {
  constructor(public title: string, public content: string) {}

  getWordCount(): number {
    return this.content.split(/\s+/).length;
  }
}

// ===== APPLYING MIXINS =====

// Single mixin
const TimestampedUser = Timestamped(User);

// Multiple mixins
const AdvancedUser = Loggable(Timestamped(Validatable(User)));

// Complex mixin composition
const SuperProduct = EventEmitting(
  Cacheable(
    Disposable(
      Serializable(
        Observable(
          Timestamped(Product)
        )
      )
    )
  )
);

// Full-featured document
const EnhancedDocument = Validatable(
  Loggable(
    Serializable(
      Timestamped(Document)
    )
  )
);

// ===== MIXIN FACTORY =====

export function createMixin<T>(
  mixins: Array<(base: Constructor) => Constructor>
): (base: Constructor<T>) => Constructor<T> {
  return (base: Constructor<T>) => {
    return mixins.reduce((currentBase, mixin) => mixin(currentBase), base) as Constructor<T>;
  };
}

// Using the mixin factory
const AllFeaturesMixin = createMixin([
  Timestamped,
  Loggable,
  Validatable,
  Serializable,
  EventEmitting,
  Disposable,
  Cacheable,
  Observable,
]);

const SuperUser = AllFeaturesMixin(User);

// ===== CONDITIONAL MIXINS =====

export function ConditionalMixin<TBase extends Constructor>(
  Base: TBase,
  condition: boolean,
  mixin: (base: TBase) => Constructor
): TBase | Constructor {
  return condition ? mixin(Base) : Base;
}

// ===== TYPED MIXINS WITH INTERFACES =====

export interface ITimestamped {
  createdAt: Date;
  updatedAt: Date;
  touch(): void;
  getAge(): number;
  getTimeSinceUpdate(): number;
}

export interface ILoggable {
  log(message: string, level?: string): void;
  getLogs(): Array<{ timestamp: Date; message: string; level: string }>;
  clearLogs(): void;
  getLogCount(): number;
}

export interface IValidatable {
  addValidationRule(rule: (obj: any) => { isValid: boolean; errors: string[] }): void;
  validate(): { isValid: boolean; errors: string[] };
  isValid(): boolean;
}

export interface ISerializable {
  serialize(): string;
  deserialize(json: string): void;
  clone(): any;
}

export interface IDisposable {
  addDisposable(disposeFn: () => void): void;
  dispose(): void;
  isDisposed(): boolean;
}

// Type-safe mixin application
export type TimestampedUser = User & ITimestamped;
export type LoggableUser = User & ILoggable;
export type ValidatableUser = User & IValidatable;

// ===== USAGE EXAMPLES =====

console.log('=== Mixins Pattern Examples ===');

// Basic timestamped user
const timestampedUser = new TimestampedUser('John Doe', 'john@example.com');
console.log('User created at:', timestampedUser.createdAt);
console.log('User greeting:', timestampedUser.greet());

setTimeout(() => {
  timestampedUser.touch();
  console.log('User age:', timestampedUser.getAge());
  console.log('Time since update:', timestampedUser.getTimeSinceUpdate());
}, 100);

// Advanced user with multiple mixins
const advancedUser = new AdvancedUser('Jane Smith', 'jane@example.com');

// Add validation rules
advancedUser.addValidationRule((user: any) => {
  if (!user.name || user.name.length < 2) {
    return { isValid: false, errors: ['Name must be at least 2 characters'] };
  }
  return { isValid: true, errors: [] };
});

advancedUser.addValidationRule((user: any) => {
  if (!user.email || !user.email.includes('@')) {
    return { isValid: false, errors: ['Invalid email format'] };
  }
  return { isValid: true, errors: [] };
});

// Test validation
const validationResult = advancedUser.validate();
console.log('Validation result:', validationResult);

// Log activities
advancedUser.log('User created successfully');
advancedUser.log('Validation completed', 'debug');

// Super product with all features
const superProduct = new SuperProduct('Laptop', 999.99);

// Set up event listeners
superProduct.on('priceChanged', (oldPrice: number, newPrice: number) => {
  console.log(`Price changed from $${oldPrice} to $${newPrice}`);
});

// Use caching
superProduct.setCache('description', 'High-performance laptop');
console.log('Cached description:', superProduct.getCache('description'));

// Observe property changes
superProduct.addObserver((change) => {
  console.log('Property changed:', change);
});

superProduct.setProperty('price', 899.99);

// Emit events
superProduct.emit('priceChanged', 999.99, 899.99);

// Serialize
const serialized = superProduct.serialize();
console.log('Serialized product:', serialized);

// Clone
const clonedProduct = superProduct.clone();
console.log('Cloned product name:', clonedProduct.name);

// Using mixin factory
const superUser = new SuperUser('Alice Johnson', 'alice@example.com');

superUser.log('SuperUser created with all features');
superUser.touch();

superUser.addValidationRule((user: any) => ({
  isValid: user.email.endsWith('.com'),
  errors: user.email.endsWith('.com') ? [] : ['Email must end with .com'],
}));

const isUserValid = superUser.isValid();
console.log('SuperUser is valid:', isUserValid);

// Set up disposal
superUser.addDisposable(() => {
  console.log('Cleaning up user resources');
});

superUser.addDisposable(() => {
  console.log('Closing user connections');
});

// Dispose when done
setTimeout(() => {
  superUser.dispose();
  console.log('User disposed:', superUser.isDisposed());
}, 2000);

// Conditional mixin example
const ConditionalUser = ConditionalMixin(
  User,
  process.env.NODE_ENV === 'development',
  Loggable
) as typeof User & (typeof Loggable extends (base: any) => infer R ? R : never);

export default {
  Timestamped,
  Loggable,
  Validatable,
  Serializable,
  EventEmitting,
  Disposable,
  Cacheable,
  Observable,
  TimestampedUser,
  AdvancedUser,
  SuperProduct,
  EnhancedDocument,
  SuperUser,
  createMixin,
  ConditionalMixin,
};