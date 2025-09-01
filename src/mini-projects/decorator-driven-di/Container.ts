// File: mini-projects/decorator-driven-di/Container.ts

export interface ServiceDescriptor<T = any> {
  token: string | symbol;
  factory: () => T;
  singleton?: boolean;
  instance?: T;
}

export interface Injectable {
  new (...args: any[]): any;
}

export type ConstructorParameters<T> = T extends new (...args: infer P) => any ? P : never;

export class Container {
  private services = new Map<string | symbol, ServiceDescriptor>();
  private instances = new Map<string | symbol, any>();
  
  // Metadata storage for injection tokens
  private static injectMetadata = new WeakMap<Injectable, (string | symbol)[]>();
  
  static setInjectMetadata(target: Injectable, tokens: (string | symbol)[]): void {
    Container.injectMetadata.set(target, tokens);
  }
  
  static getInjectMetadata(target: Injectable): (string | symbol)[] {
    return Container.injectMetadata.get(target) || [];
  }

  register<T>(
    token: string | symbol,
    factory: () => T,
    options: { singleton?: boolean } = {}
  ): this {
    this.services.set(token, {
      token,
      factory,
      singleton: options.singleton ?? false
    });
    return this;
  }

  registerClass<T>(
    token: string | symbol,
    constructor: new (...args: any[]) => T,
    options: { singleton?: boolean } = {}
  ): this {
    const factory = () => {
      const dependencies = this.resolveDependencies(constructor);
      return new constructor(...dependencies);
    };

    return this.register(token, factory, options);
  }

  registerSingleton<T>(
    token: string | symbol,
    factory: () => T
  ): this {
    return this.register(token, factory, { singleton: true });
  }

  registerSingletonClass<T>(
    token: string | symbol,
    constructor: new (...args: any[]) => T
  ): this {
    return this.registerClass(token, constructor, { singleton: true });
  }

  resolve<T>(token: string | symbol): T {
    const service = this.services.get(token);
    
    if (!service) {
      throw new Error(`Service not registered: ${String(token)}`);
    }

    if (service.singleton) {
      if (!this.instances.has(token)) {
        const instance = service.factory();
        this.instances.set(token, instance);
        return instance;
      }
      return this.instances.get(token);
    }

    return service.factory();
  }

  has(token: string | symbol): boolean {
    return this.services.has(token);
  }

  private resolveDependencies(constructor: Injectable): any[] {
    const tokens = Container.getInjectMetadata(constructor);
    return tokens.map(token => this.resolve(token));
  }

  // Auto-wire a class instance by resolving its dependencies
  autoWire<T>(constructor: new (...args: any[]) => T): T {
    const dependencies = this.resolveDependencies(constructor);
    return new constructor(...dependencies);
  }

  // Create a child container that inherits services
  createChild(): Container {
    const child = new Container();
    
    // Copy services from parent
    for (const [token, descriptor] of this.services) {
      child.services.set(token, { ...descriptor });
    }
    
    // Copy singleton instances from parent
    for (const [token, instance] of this.instances) {
      child.instances.set(token, instance);
    }
    
    return child;
  }

  // Clear all registrations and instances
  clear(): void {
    this.services.clear();
    this.instances.clear();
  }

  // Get all registered service tokens
  getRegisteredTokens(): (string | symbol)[] {
    return Array.from(this.services.keys());
  }

  // Debug information
  getServiceInfo(): Array<{
    token: string | symbol;
    singleton: boolean;
    hasInstance: boolean;
  }> {
    return Array.from(this.services.entries()).map(([token, descriptor]) => ({
      token,
      singleton: descriptor.singleton ?? false,
      hasInstance: this.instances.has(token)
    }));
  }
}

// Default global container instance
export const container = new Container();

// Service registration helpers
export function Service(token: string | symbol) {
  return function<T extends Injectable>(constructor: T): T {
    container.registerClass(token, constructor);
    return constructor;
  };
}

export function Singleton(token: string | symbol) {
  return function<T extends Injectable>(constructor: T): T {
    container.registerSingletonClass(token, constructor);
    return constructor;
  };
}

// Property injection decorator
export function InjectProperty(token: string | symbol) {
  return function(target: any, propertyKey: string | symbol): void {
    Object.defineProperty(target, propertyKey, {
      get() {
        return container.resolve(token);
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Method parameter injection
export function InjectParam(token: string | symbol) {
  return function(target: any, propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const existingTokens = Container.getInjectMetadata(target) || [];
    existingTokens[parameterIndex] = token;
    Container.setInjectMetadata(target, existingTokens);
  };
}