// File: mini-projects/decorator-driven-di/Inject.ts

import { Container, Injectable } from './Container';

// Symbols for common service types
export const TOKENS = {
  LOGGER: Symbol('Logger'),
  HTTP_CLIENT: Symbol('HttpClient'),
  CONFIG: Symbol('Config'),
  DATABASE: Symbol('Database'),
  USER_SERVICE: Symbol('UserService'),
  AUTH_SERVICE: Symbol('AuthService'),
  NOTIFICATION_SERVICE: Symbol('NotificationService')
} as const;

// Main Inject decorator for constructor parameters
export function Inject(token: string | symbol) {
  return function(target: any, propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const existingTokens = Container.getInjectMetadata(target) || [];
    existingTokens[parameterIndex] = token;
    Container.setInjectMetadata(target, existingTokens);
  };
}

// Decorator for marking classes as injectable
export function Injectable(token?: string | symbol) {
  return function<T extends new (...args: any[]) => any>(constructor: T): T {
    if (token) {
      // Auto-register the class with the provided token
      const container = new Container();
      container.registerClass(token, constructor);
    }
    
    return constructor;
  };
}

// Lazy injection decorator - resolves dependency on first access
export function LazyInject(token: string | symbol) {
  return function(target: any, propertyKey: string | symbol): void {
    const getter = function(this: any) {
      if (!this._lazyInstances) {
        this._lazyInstances = new Map();
      }
      
      if (!this._lazyInstances.has(token)) {
        // Assuming there's a global container instance
        const container = (globalThis as any).__DI_CONTAINER__ || new Container();
        this._lazyInstances.set(token, container.resolve(token));
      }
      
      return this._lazyInstances.get(token);
    };

    const setter = function(this: any, value: any) {
      if (!this._lazyInstances) {
        this._lazyInstances = new Map();
      }
      this._lazyInstances.set(token, value);
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

// Optional injection decorator - doesn't throw if service not found
export function OptionalInject(token: string | symbol, defaultValue?: any) {
  return function(target: any, propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const existingTokens = Container.getInjectMetadata(target) || [];
    const existingDefaults = (target as any)._optionalDefaults || [];
    
    existingTokens[parameterIndex] = token;
    existingDefaults[parameterIndex] = defaultValue;
    
    Container.setInjectMetadata(target, existingTokens);
    (target as any)._optionalDefaults = existingDefaults;
  };
}

// Multi-inject decorator for injecting arrays of services
export function InjectAll(token: string | symbol) {
  return function(target: any, propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const existingTokens = Container.getInjectMetadata(target) || [];
    existingTokens[parameterIndex] = `${String(token)}[]`;
    Container.setInjectMetadata(target, existingTokens);
  };
}

// Named injection decorator
export function Named(name: string) {
  return function(token: string | symbol) {
    return function(target: any, propertyKey: string | symbol | undefined, parameterIndex: number): void {
      const namedToken = `${String(token)}:${name}`;
      const existingTokens = Container.getInjectMetadata(target) || [];
      existingTokens[parameterIndex] = namedToken;
      Container.setInjectMetadata(target, existingTokens);
    };
  };
}

// Factory injection decorator
export function InjectFactory<T>(token: string | symbol) {
  return function(target: any, propertyKey: string | symbol): void {
    Object.defineProperty(target, propertyKey, {
      get() {
        const container = (globalThis as any).__DI_CONTAINER__ || new Container();
        return () => container.resolve<T>(token);
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Conditional injection based on environment or config
export function ConditionalInject(
  token: string | symbol,
  condition: () => boolean,
  fallbackToken?: string | symbol
) {
  return function(target: any, propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const conditionalToken = condition() ? token : (fallbackToken || token);
    const existingTokens = Container.getInjectMetadata(target) || [];
    existingTokens[parameterIndex] = conditionalToken;
    Container.setInjectMetadata(target, existingTokens);
  };
}

// Scoped injection decorator
export function Scoped(scope: 'singleton' | 'transient' | 'request' = 'transient') {
  return function<T extends new (...args: any[]) => any>(constructor: T): T {
    (constructor as any)._injectionScope = scope;
    return constructor;
  };
}

// Auto-bind methods to maintain 'this' context
export function AutoBind(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const method = descriptor.value;
  
  return {
    configurable: true,
    get() {
      if (!this._boundMethods) {
        this._boundMethods = new Map();
      }
      
      if (!this._boundMethods.has(propertyKey)) {
        this._boundMethods.set(propertyKey, method.bind(this));
      }
      
      return this._boundMethods.get(propertyKey);
    }
  };
}

// Post-construct decorator for initialization after injection
export function PostConstruct(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;
  
  // Store the post-construct method name
  if (!target.constructor._postConstructMethods) {
    target.constructor._postConstructMethods = [];
  }
  target.constructor._postConstructMethods.push(propertyKey);
  
  return descriptor;
}

// Pre-destroy decorator for cleanup
export function PreDestroy(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;
  
  // Store the pre-destroy method name
  if (!target.constructor._preDestroyMethods) {
    target.constructor._preDestroyMethods = [];
  }
  target.constructor._preDestroyMethods.push(propertyKey);
  
  return descriptor;
}

// Helper function to call post-construct methods
export function callPostConstruct(instance: any): void {
  const constructor = instance.constructor;
  const postConstructMethods = constructor._postConstructMethods || [];
  
  for (const methodName of postConstructMethods) {
    if (typeof instance[methodName] === 'function') {
      instance[methodName]();
    }
  }
}

// Helper function to call pre-destroy methods
export function callPreDestroy(instance: any): void {
  const constructor = instance.constructor;
  const preDestroyMethods = constructor._preDestroyMethods || [];
  
  for (const methodName of preDestroyMethods) {
    if (typeof instance[methodName] === 'function') {
      instance[methodName]();
    }
  }
}