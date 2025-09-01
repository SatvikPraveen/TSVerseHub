// File: concepts/decorators/class-decorators.ts

/**
 * CLASS DECORATORS
 * 
 * A class decorator is declared just before a class declaration. The class decorator
 * is applied to the constructor of the class and can be used to observe, modify,
 * or replace a class definition.
 */

import 'reflect-metadata';

// Simple class decorator
export function Sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

// Class decorator with parameters (decorator factory)
export function Component(options: { selector: string; template: string }) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      selector = options.selector;
      template = options.template;
      
      render() {
        console.log(`Rendering ${options.selector}: ${options.template}`);
      }
    };
  };
}

// Decorator for adding metadata
export function Entity(tableName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata('tableName', tableName, constructor);
    
    return class extends constructor {
      static getTableName() {
        return Reflect.getMetadata('tableName', constructor) || 'unknown';
      }
    };
  };
}

// Decorator for logging class instantiation
export function Logged<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      console.log(`Creating instance of ${constructor.name} with args:`, args);
      super(...args);
      console.log(`Instance of ${constructor.name} created successfully`);
    }
  };
}

// Decorator for adding timestamp functionality
export function Timestamped<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    touch() {
      this.updatedAt = new Date();
      console.log(`${constructor.name} updated at: ${this.updatedAt}`);
    }
  };
}

// Decorator for making class a singleton
export function Singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
  let instance: T | null = null;

  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance as any;
      }
      super(...args);
      instance = this as any;
    }

    static getInstance(): T {
      if (!instance) {
        instance = new this() as any;
      }
      return instance;
    }
  };
}

// Decorator for adding validation capabilities
export function Validatable<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    validate(): boolean {
      const errors: string[] = [];
      
      // Check for required properties
      const requiredFields = Reflect.getMetadata('required', constructor) || [];
      for (const field of requiredFields) {
        if (!(this as any)[field]) {
          errors.push(`${field} is required`);
        }
      }

      if (errors.length > 0) {
        console.error('Validation errors:', errors);
        return false;
      }

      console.log(`${constructor.name} validation passed`);
      return true;
    }

    getValidationErrors(): string[] {
      const errors: string[] = [];
      const requiredFields = Reflect.getMetadata('required', constructor) || [];
      
      for (const field of requiredFields) {
        if (!(this as any)[field]) {
          errors.push(`${field} is required`);
        }
      }

      return errors;
    }
  };
}

// Usage examples

@Sealed
export class SealedClass {
  name: string = 'Sealed';
}

@Component({ selector: 'app-user', template: '<div>User Component</div>' })
export class UserComponent {
  name: string = 'User';
}

@Entity('users')
export class User {
  id!: number;
  name!: string;
  email!: string;
}

@Logged
@Timestamped
export class Product {
  constructor(public name: string, public price: number) {}

  updatePrice(newPrice: number) {
    this.price = newPrice;
    (this as any).touch(); // Call the method added by Timestamped decorator
  }
}

@Singleton
export class DatabaseConnection {
  private connectionString: string = 'default-connection';

  connect() {
    console.log(`Connecting to database: ${this.connectionString}`);
  }

  setConnectionString(connectionString: string) {
    this.connectionString = connectionString;
  }

  getConnectionString() {
    return this.connectionString;
  }
}

@Validatable
export class Employee {
  constructor(
    public name?: string,
    public email?: string,
    public department?: string
  ) {}
}

// Decorator that adds caching functionality
export function Cacheable<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    private cache = new Map<string, any>();

    getCached(key: string): any {
      return this.cache.get(key);
    }

    setCached(key: string, value: any): void {
      this.cache.set(key, value);
    }

    clearCache(): void {
      this.cache.clear();
      console.log(`Cache cleared for ${constructor.name}`);
    }

    getCacheSize(): number {
      return this.cache.size;
    }
  };
}

@Cacheable
export class DataService {
  private data: any[] = [];

  fetchData(id: string): any {
    // Check cache first
    const cached = (this as any).getCached(id);
    if (cached) {
      console.log(`Returning cached data for ${id}`);
      return cached;
    }

    // Simulate data fetching
    const result = { id, data: `Data for ${id}`, timestamp: Date.now() };
    (this as any).setCached(id, result);
    console.log(`Fetched and cached data for ${id}`);
    return result;
  }
}

// Advanced decorator with options and metadata
interface ControllerOptions {
  path: string;
  middleware?: Function[];
}

export function Controller(options: ControllerOptions) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata('controller:path', options.path, constructor);
    Reflect.defineMetadata('controller:middleware', options.middleware || [], constructor);

    return class extends constructor {
      static getPath(): string {
        return Reflect.getMetadata('controller:path', constructor);
      }

      static getMiddleware(): Function[] {
        return Reflect.getMetadata('controller:middleware', constructor);
      }

      getRouteInfo() {
        return {
          path: Reflect.getMetadata('controller:path', constructor),
          middleware: Reflect.getMetadata('controller:middleware', constructor),
        };
      }
    };
  };
}

@Controller({
  path: '/api/users',
  middleware: [(req: any, res: any, next: any) => next()]
})
export class ApiController {
  constructor(private service: any) {}

  handleRequest(req: any, res: any) {
    console.log(`Handling request for ${(this.constructor as any).getPath()}`);
  }
}

// Example of using multiple class decorators
@Logged
@Timestamped
@Cacheable
@Entity('products')
export class ProductService {
  constructor(private products: any[] = []) {}

  getProduct(id: string) {
    const cached = (this as any).getCached(id);
    if (cached) return cached;

    const product = this.products.find(p => p.id === id);
    if (product) {
      (this as any).setCached(id, product);
    }
    return product;
  }

  addProduct(product: any) {
    this.products.push(product);
    (this as any).touch();
    (this as any).clearCache(); // Clear cache when data changes
  }
}

export default {
  Sealed,
  Component,
  Entity,
  Logged,
  Timestamped,
  Singleton,
  Validatable,
  Cacheable,
  Controller,
  SealedClass,
  UserComponent,
  User,
  Product,
  DatabaseConnection,
  Employee,
  DataService,
  ApiController,
  ProductService,
};