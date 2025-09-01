// File: concepts/decorators/exercises.ts

/**
 * DECORATORS EXERCISES
 * 
 * Complete these exercises to practice working with TypeScript decorators.
 * Each exercise builds upon decorator concepts and real-world use cases.
 */

import 'reflect-metadata';

// Exercise 1: Create a simple timing decorator
// TODO: Implement a @Timer decorator that measures method execution time

export function Timer(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  // Your implementation here
  // Hint: Use performance.now() to measure time
}

// Exercise 2: Create a validation decorator for classes
// TODO: Implement a @Validate decorator that validates all properties of a class

export function Validate<T extends { new (...args: any[]): {} }>(constructor: T) {
  // Your implementation here
  // Should add a validate() method that checks all decorated properties
}

// Exercise 3: Create a rate limiting decorator
// TODO: Implement @RateLimit(maxCalls, windowMs) that limits method calls

export function RateLimit(maxCalls: number, windowMs: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Your implementation here
    // Hint: Keep track of call timestamps
  };
}

// Exercise 4: Create a caching decorator with TTL
// TODO: Implement @Cache(ttlSeconds) that caches method results

export function Cache(ttlSeconds: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Your implementation here
    // Should cache results and expire them after ttlSeconds
  };
}

// Exercise 5: Create a property decorator for automatic formatting
// TODO: Implement @Format that automatically formats property values

export function Format(formatter: (value: any) => any) {
  return function (target: any, propertyName: string) {
    // Your implementation here
    // Should automatically format values when they're set
  };
}

// Exercise 6: Create a parameter decorator for dependency injection
// TODO: Implement @Inject that marks parameters for dependency injection

export function Inject(token: string) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    // Your implementation here
    // Store metadata about which parameters need injection
  };
}

// Exercise 7: Create an authorization decorator
// TODO: Implement @Authorized that checks user permissions before method execution

export function Authorized(requiredRoles: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Your implementation here
    // Should check if current user has required roles
  };
}

// Exercise 8: Create a retry decorator for async operations
// TODO: Implement @Retry that retries failed async operations

export function Retry(attempts: number, delayMs: number = 1000) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Your implementation here
    // Should retry failed operations with delay between attempts
  };
}

// Test Classes for Your Decorators

// Use this class to test your Timer and Cache decorators
export class MathService {
  @Timer
  @Cache(5) // Cache for 5 seconds
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  @RateLimit(5, 60000) // Max 5 calls per minute
  expensiveOperation(data: any): string {
    // Simulate expensive operation
    return `Processed: ${JSON.stringify(data)}`;
  }
}

// Use this class to test your property decorators
@Validate
export class User {
  @Format((name: string) => name?.trim().toLowerCase())
  username!: string;

  @Format((email: string) => email?.toLowerCase())
  email!: string;

  age!: number;
}

// Use this class to test your method decorators
export class AuthService {
  private currentUser = { roles: ['user'] };

  getCurrentUser() {
    return this.currentUser;
  }

  @Authorized(['admin'])
  deleteUser(id: string): boolean {
    console.log(`Deleting user: ${id}`);
    return true;
  }

  @Retry(3, 2000)
  async fetchUserProfile(userId: string): Promise<any> {
    // Simulate API call that might fail
    if (Math.random() < 0.7) {
      throw new Error('Network timeout');
    }
    return { id: userId, name: 'User Name' };
  }
}

// Use this class to test your parameter decorator
export class UserController {
  constructor(@Inject('UserService') private userService: any) {}

  createUser(@Inject('Logger') logger: any, userData: any) {
    logger.log('Creating user...');
    return this.userService.create(userData);
  }
}

// Advanced Exercise 9: Create a method decorator that automatically logs errors
// TODO: Implement @CatchAndLog that catches errors and logs them

export function CatchAndLog(logLevel: 'error' | 'warn' | 'info' = 'error') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Your implementation here
    // Should catch errors and log them with specified level
  };
}

// Advanced Exercise 10: Create a class decorator that adds event emitting capabilities
// TODO: Implement @EventEmitter that adds event emitting methods to a class

export function EventEmitter<T extends { new (...args: any[]): {} }>(constructor: T) {
  // Your implementation here
  // Should add methods: on(), off(), emit()
}

// Test class for advanced exercises
@EventEmitter
export class OrderService {
  @CatchAndLog('warn')
  async processOrder(order: any): Promise<void> {
    if (Math.random() < 0.3) {
      throw new Error('Order processing failed');
    }
    console.log('Order processed successfully');
  }
}

// SOLUTIONS (Uncomment to see reference implementations)

/*
// Solution 1: Timer decorator
export function Timer(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = method.apply(this, args);
    const end = performance.now();
    console.log(`${propertyName} took ${(end - start).toFixed(2)}ms`);
    return result;
  };
  
  return descriptor;
}

// Solution 2: Validate class decorator
export function Validate<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    validate(): boolean {
      const instance = this as any;
      const errors: string[] = [];
      
      // Check for required properties
      const requiredProps = Reflect.getMetadata('required', constructor.prototype) || [];
      for (const prop of requiredProps) {
        if (!instance[prop]) {
          errors.push(`${prop} is required`);
        }
      }
      
      if (errors.length > 0) {
        console.error('Validation errors:', errors);
        return false;
      }
      
      return true;
    }
  };
}

// Solution 3: RateLimit decorator
export function RateLimit(maxCalls: number, windowMs: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const calls: number[] = [];
    
    descriptor.value = function (...args: any[]) {
      const now = Date.now();
      
      // Remove old calls
      while (calls.length > 0 && calls[0] <= now - windowMs) {
        calls.shift();
      }
      
      if (calls.length >= maxCalls) {
        throw new Error(`Rate limit exceeded: max ${maxCalls} calls per ${windowMs}ms`);
      }
      
      calls.push(now);
      return method.apply(this, args);
    };
    
    return descriptor;
  };
}

// Solution 4: Cache decorator
export function Cache(ttlSeconds: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = new Map<string, { value: any; expires: number }>();
    
    descriptor.value = function (...args: any[]) {
      const key = JSON.stringify(args);
      const cached = cache.get(key);
      const now = Date.now();
      
      if (cached && cached.expires > now) {
        return cached.value;
      }
      
      const result = method.apply(this, args);
      cache.set(key, {
        value: result,
        expires: now + (ttlSeconds * 1000)
      });
      
      return result;
    };
    
    return descriptor;
  };
}

// Solution 5: Format decorator
export function Format(formatter: (value: any) => any) {
  return function (target: any, propertyName: string) {
    let value: any;
    
    Object.defineProperty(target, propertyName, {
      get: () => value,
      set: (newValue: any) => {
        value = formatter(newValue);
      },
      enumerable: true,
      configurable: true
    });
  };
}
*/

// EXERCISE VERIFICATION
// Run these tests to verify your decorator implementations

export function runExerciseTests() {
  console.log('=== DECORATOR EXERCISES TESTS ===\n');

  try {
    // Test Timer and Cache decorators
    const mathService = new MathService();
    console.log('Testing Timer and Cache decorators...');
    console.log('Result:', mathService.fibonacci(10));
    console.log('Result (should be cached):', mathService.fibonacci(10));

    // Test RateLimit decorator
    console.log('\nTesting RateLimit decorator...');
    try {
      for (let i = 0; i < 7; i++) {
        mathService.expensiveOperation({ iteration: i });
      }
    } catch (error) {
      console.log('Rate limit error (expected):', error.message);
    }

    // Test Format decorator
    console.log('\nTesting Format decorator...');
    const user = new User();
    user.username = '  JOHN_DOE  ';
    user.email = 'JOHN@EXAMPLE.COM';
    console.log('Formatted username:', user.username);
    console.log('Formatted email:', user.email);

    // Test Authorized decorator
    console.log('\nTesting Authorized decorator...');
    const authService = new AuthService();
    try {
      authService.deleteUser('123');
    } catch (error) {
      console.log('Authorization error (expected):', error.message);
    }

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Bonus: Create your own custom decorator
// TODO: Design and implement a decorator that solves a specific problem
// Examples: @Memoize, @Debounce, @Throttle, @Deprecated, @Measure

export function YourCustomDecorator() {
  // Your custom decorator implementation
}

export default {
  Timer,
  Validate,
  RateLimit,
  Cache,
  Format,
  Inject,
  Authorized,
  Retry,
  CatchAndLog,
  EventEmitter,
  MathService,
  User,
  AuthService,
  UserController,
  OrderService,
  runExerciseTests,
  YourCustomDecorator,
};