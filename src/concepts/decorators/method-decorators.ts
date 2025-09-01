// File: concepts/decorators/method-decorators.ts

/**
 * METHOD DECORATORS
 * 
 * A method decorator is declared just before a method declaration. The decorator
 * is applied to the Property Descriptor for the method, and can be used to observe,
 * modify, or replace a method definition.
 */

import 'reflect-metadata';

// Simple method decorator that logs method calls
export function Log(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyName} with arguments:`, args);
    const result = method.apply(this, args);
    console.log(`${propertyName} returned:`, result);
    return result;
  };

  return descriptor;
}

// Method decorator factory with parameters
export function Retry(attempts: number = 3) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: any;
      
      for (let i = 0; i < attempts; i++) {
        try {
          console.log(`Attempt ${i + 1} for ${propertyName}`);
          return await method.apply(this, args);
        } catch (error) {
          lastError = error;
          console.log(`Attempt ${i + 1} failed:`, error.message);
          if (i < attempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          }
        }
      }
      
      throw new Error(`${propertyName} failed after ${attempts} attempts: ${lastError.message}`);
    };

    return descriptor;
  };
}

// Performance measurement decorator
export function Measure(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = method.apply(this, args);
    const end = performance.now();
    
    console.log(`${propertyName} execution time: ${(end - start).toFixed(2)}ms`);
    return result;
  };

  return descriptor;
}

// Caching decorator
export function Cached(ttl: number = 5000) { // Time to live in milliseconds
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = new Map<string, { value: any; timestamp: number }>();

    descriptor.value = function (...args: any[]) {
      const key = JSON.stringify(args);
      const cached = cache.get(key);
      
      if (cached && (Date.now() - cached.timestamp) < ttl) {
        console.log(`Cache hit for ${propertyName} with args:`, args);
        return cached.value;
      }

      console.log(`Cache miss for ${propertyName} with args:`, args);
      const result = method.apply(this, args);
      cache.set(key, { value: result, timestamp: Date.now() });
      
      return result;
    };

    return descriptor;
  };
}

// Rate limiting decorator
export function RateLimit(maxCalls: number, windowMs: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const calls: number[] = [];

    descriptor.value = function (...args: any[]) {
      const now = Date.now();
      
      // Remove old calls outside the window
      while (calls.length > 0 && calls[0] <= now - windowMs) {
        calls.shift();
      }

      if (calls.length >= maxCalls) {
        throw new Error(`Rate limit exceeded for ${propertyName}. Max ${maxCalls} calls per ${windowMs}ms`);
      }

      calls.push(now);
      return method.apply(this, args);
    };

    return descriptor;
  };
}

// Validation decorator
export function ValidateArgs(validators: ((arg: any) => boolean)[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      for (let i = 0; i < validators.length && i < args.length; i++) {
        if (!validators[i](args[i])) {
          throw new Error(`Validation failed for argument ${i} in ${propertyName}`);
        }
      }

      return method.apply(this, args);
    };

    return descriptor;
  };
}

// Async timeout decorator
export function Timeout(ms: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const promise = method.apply(this, args);
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`${propertyName} timed out after ${ms}ms`)), ms);
      });

      return Promise.race([promise, timeout]);
    };

    return descriptor;
  };
}

// Deprecated method decorator
export function Deprecated(message?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      console.warn(`⚠️ Method ${propertyName} is deprecated.${message ? ` ${message}` : ''}`);
      return method.apply(this, args);
    };

    return descriptor;
  };
}

// Authorization decorator
export function RequireAuth(roles: string[] = []) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Simulate getting current user context
      const currentUser = (this as any).getCurrentUser?.() || { roles: [] };
      
      if (!currentUser.authenticated) {
        throw new Error(`Authentication required for ${propertyName}`);
      }

      if (roles.length > 0) {
        const hasRequiredRole = roles.some(role => currentUser.roles.includes(role));
        if (!hasRequiredRole) {
          throw new Error(`Insufficient permissions for ${propertyName}. Required roles: ${roles.join(', ')}`);
        }
      }

      return method.apply(this, args);
    };

    return descriptor;
  };
}

// Debounce decorator
export function Debounce(delay: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    let timeout: NodeJS.Timeout;

    descriptor.value = function (...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        method.apply(this, args);
      }, delay);
    };

    return descriptor;
  };
}

// HTTP Method decorators
export function GET(path: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('http:method', 'GET', target, propertyName);
    Reflect.defineMetadata('http:path', path, target, propertyName);
    return descriptor;
  };
}

export function POST(path: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('http:method', 'POST', target, propertyName);
    Reflect.defineMetadata('http:path', path, target, propertyName);
    return descriptor;
  };
}

// Usage Examples

export class UserService {
  private users = new Map<string, any>();
  private currentUser = { authenticated: true, roles: ['admin'] };

  getCurrentUser() {
    return this.currentUser;
  }

  @Log
  @Measure
  getUser(id: string) {
    return this.users.get(id) || { id, name: `User ${id}` };
  }

  @Retry(3)
  @Timeout(5000)
  async fetchUserFromAPI(id: string): Promise<any> {
    // Simulate API call that might fail
    if (Math.random() < 0.7) {
      throw new Error('Network error');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id, name: `API User ${id}`, email: `user${id}@example.com` };
  }

  @Cached(3000)
  getExpensiveCalculation(input: number): number {
    console.log('Performing expensive calculation...');
    // Simulate expensive operation
    let result = 0;
    for (let i = 0; i < input * 1000000; i++) {
      result += Math.sqrt(i);
    }
    return result;
  }

  @RateLimit(5, 60000) // Max 5 calls per minute
  sendNotification(message: string) {
    console.log(`Sending notification: ${message}`);
    return `Notification sent: ${message}`;
  }

  @ValidateArgs([
    (email: string) => email.includes('@'),
    (password: string) => password.length >= 6
  ])
  createUser(email: string, password: string) {
    const user = { email, password, id: Date.now().toString() };
    this.users.set(user.id, user);
    return user;
  }

  @RequireAuth(['admin'])
  deleteUser(id: string) {
    const deleted = this.users.delete(id);
    console.log(`User ${id} ${deleted ? 'deleted' : 'not found'}`);
    return deleted;
  }

  @Deprecated('Use getUserProfile instead')
  getUserInfo(id: string) {
    return this.getUser(id);
  }

  @Debounce(1000)
  saveUserPreferences(userId: string, preferences: any) {
    console.log(`Saving preferences for user ${userId}:`, preferences);
  }
}

export class ApiController {
  @GET('/users/:id')
  getUser(id: string) {
    return { id, name: `User ${id}` };
  }

  @POST('/users')
  @ValidateArgs([
    (userData: any) => userData && userData.email && userData.name
  ])
  createUser(userData: any) {
    return { ...userData, id: Date.now().toString() };
  }
}

// Multiple decorators on the same method
export class DataProcessor {
  @Log
  @Measure
  @Cached(5000)
  @Retry(2)
  async processData(data: any[]): Promise<any[]> {
    // Simulate processing that might fail
    if (Math.random() < 0.3) {
      throw new Error('Processing failed');
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    return data.map(item => ({ ...item, processed: true, timestamp: Date.now() }));
  }
}

// Decorator for auto-binding methods
export function AutoBind(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  return {
    configurable: true,
    get() {
      const bound = method.bind(this);
      Object.defineProperty(this, propertyName, {
        value: bound,
        configurable: true,
        writable: true,
      });
      return bound;
    },
  };
}

export class EventHandler {
  private message = 'Hello from EventHandler';

  @AutoBind
  handleClick() {
    console.log(this.message);
  }

  setupEventListener() {
    // This will work correctly even when the method is used as a callback
    document.addEventListener('click', this.handleClick);
  }
}

export default {
  Log,
  Retry,
  Measure,
  Cached,
  RateLimit,
  ValidateArgs,
  Timeout,
  Deprecated,
  RequireAuth,
  Debounce,
  GET,
  POST,
  AutoBind,
  UserService,
  ApiController,
  DataProcessor,
  EventHandler,
};