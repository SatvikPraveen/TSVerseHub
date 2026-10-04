// File: mini-projects/decorator-driven-di/Inject.ts

import { Container, container as defaultContainer, type Constructor } from './Container';

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

/** Shape of the optional global container registered on `globalThis`. */
interface GlobalWithContainer {
  __DI_CONTAINER__?: Container;
}

/** Per-instance storage used by the lazy-injection decorator. */
interface LazyHost {
  _lazyInstances?: Map<string | symbol, unknown>;
}

/** Static side-channel data attached to decorated constructors. */
interface LifecycleConstructor {
  _postConstructMethods?: string[];
  _preDestroyMethods?: string[];
}

interface OptionalDefaultsHolder {
  _optionalDefaults?: unknown[];
}

function getGlobalContainer(): Container {
  return (globalThis as GlobalWithContainer).__DI_CONTAINER__ || defaultContainer;
}

// Main Inject decorator for constructor parameters
export function Inject(token: string | symbol) {
  return function(target: object, _propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const existingTokens = Container.getInjectMetadata(target) || [];
    existingTokens[parameterIndex] = token;
    Container.setInjectMetadata(target, existingTokens);
  };
}

// Decorator for marking classes as injectable
export function Injectable(token?: string | symbol) {
  return function<T extends Constructor>(constructor: T): T {
    if (token) {
      // Auto-register the class with the provided token
      getGlobalContainer().registerClass(token, constructor);
    }
    
    return constructor;
  };
}

// Lazy injection decorator - resolves dependency on first access
export function LazyInject(token: string | symbol) {
  return function(target: object, propertyKey: string | symbol): void {
    const getter = function(this: LazyHost) {
      if (!this._lazyInstances) {
        this._lazyInstances = new Map();
      }
      
      if (!this._lazyInstances.has(token)) {
        // Assuming there's a global container instance
        const container = getGlobalContainer();
        this._lazyInstances.set(token, container.resolve(token));
      }
      
      return this._lazyInstances.get(token);
    };

    const setter = function(this: LazyHost, value: unknown) {
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
export function OptionalInject(token: string | symbol, defaultValue?: unknown) {
  return function(target: object, _propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const holder = target as OptionalDefaultsHolder;
    const existingTokens = Container.getInjectMetadata(target) || [];
    const existingDefaults = holder._optionalDefaults || [];
    
    existingTokens[parameterIndex] = token;
    existingDefaults[parameterIndex] = defaultValue;
    
    Container.setInjectMetadata(target, existingTokens);
    holder._optionalDefaults = existingDefaults;
  };
}

// Multi-inject decorator for injecting arrays of services
export function InjectAll(token: string | symbol) {
  return function(target: object, _propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const existingTokens = Container.getInjectMetadata(target) || [];
    existingTokens[parameterIndex] = `${String(token)}[]`;
    Container.setInjectMetadata(target, existingTokens);
  };
}

// Named injection decorator
export function Named(name: string) {
  return function(token: string | symbol) {
    return function(target: object, _propertyKey: string | symbol | undefined, parameterIndex: number): void {
      const namedToken = `${String(token)}:${name}`;
      const existingTokens = Container.getInjectMetadata(target) || [];
      existingTokens[parameterIndex] = namedToken;
      Container.setInjectMetadata(target, existingTokens);
    };
  };
}

// Factory injection decorator
export function InjectFactory<T>(token: string | symbol) {
  return function(target: object, propertyKey: string | symbol): void {
    Object.defineProperty(target, propertyKey, {
      get() {
        const container: Container = getGlobalContainer();
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
  return function(target: object, _propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const conditionalToken = condition() ? token : (fallbackToken || token);
    const existingTokens = Container.getInjectMetadata(target) || [];
    existingTokens[parameterIndex] = conditionalToken;
    Container.setInjectMetadata(target, existingTokens);
  };
}

// Scoped injection decorator
export function Scoped(scope: 'singleton' | 'transient' | 'request' = 'transient') {
  return function<T extends Constructor>(constructor: T): T {
    (constructor as T & { _injectionScope?: string })._injectionScope = scope;
    return constructor;
  };
}

// Auto-bind methods to maintain 'this' context
export function AutoBind(_target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const method = descriptor.value;
  
  return {
    configurable: true,
    get(this: { _boundMethods?: Map<string, unknown> }) {
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

function lifecycleConstructorOf(instanceOrPrototype: object): LifecycleConstructor {
  return instanceOrPrototype.constructor as LifecycleConstructor;
}

/**
 * Record a lifecycle method on the decorated class's own list. The list is
 * copied from the base class on first use so that a subclass never appends to
 * (and leaks its hooks into) its parent's list, and each name is kept once so
 * that an overridden hook is not invoked twice.
 */
function registerLifecycleMethod(
  target: object,
  key: '_postConstructMethods' | '_preDestroyMethods',
  propertyKey: string
): void {
  const ctor = lifecycleConstructorOf(target);
  if (!Object.prototype.hasOwnProperty.call(ctor, key)) {
    ctor[key] = [...(ctor[key] ?? [])];
  }
  const methods = ctor[key] ?? [];
  if (!methods.includes(propertyKey)) {
    methods.push(propertyKey);
  }
  ctor[key] = methods;
}

// Post-construct decorator for initialization after injection
export function PostConstruct(target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  // Store the post-construct method name
  registerLifecycleMethod(target, '_postConstructMethods', propertyKey);
  
  return descriptor;
}

// Pre-destroy decorator for cleanup
export function PreDestroy(target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  // Store the pre-destroy method name
  registerLifecycleMethod(target, '_preDestroyMethods', propertyKey);
  
  return descriptor;
}

function invokeLifecycleMethods(instance: object, methodNames: string[]): void {
  const members = instance as Record<string, unknown>;
  for (const methodName of methodNames) {
    const method = members[methodName];
    if (typeof method === 'function') {
      method.call(instance);
    }
  }
}

// Helper function to call post-construct methods
export function callPostConstruct(instance: object): void {
  const postConstructMethods = lifecycleConstructorOf(instance)._postConstructMethods || [];
  invokeLifecycleMethods(instance, postConstructMethods);
}

// Helper function to call pre-destroy methods
export function callPreDestroy(instance: object): void {
  const preDestroyMethods = lifecycleConstructorOf(instance)._preDestroyMethods || [];
  invokeLifecycleMethods(instance, preDestroyMethods);
}
