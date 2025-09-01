// File: concepts/decorators/index.ts

/**
 * DECORATORS IN TYPESCRIPT
 * 
 * Decorators are a stage 3 proposal for JavaScript and are available as an experimental
 * feature of TypeScript. Decorators provide a way to add both annotations and a 
 * meta-programming syntax for class declarations and members.
 * 
 * To enable experimental support for decorators, you must enable the experimentalDecorators
 * compiler option either on the command line or in your tsconfig.json.
 */

export * from './class-decorators';
export * from './method-decorators';
export * from './property-decorators';
export * from './parameter-decorators';

// Decorator factory - a function that returns the actual decorator
export function LoggedClass(target: any) {
  console.log(`Creating class: ${target.name}`);
  return target;
}

// Property decorator factory
export function MinLength(minLength: number) {
  return function (target: any, propertyName: string) {
    let value: string;

    const getter = function () {
      return value;
    };

    const setter = function (newValue: string) {
      if (newValue && newValue.length < minLength) {
        throw new Error(`${propertyName} must be at least ${minLength} characters long`);
      }
      value = newValue;
    };

    Object.defineProperty(target, propertyName, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

// Method decorator factory
export function Throttle(limit: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    let lastExecuted = 0;

    descriptor.value = function (...args: any[]) {
      const now = Date.now();
      if (now - lastExecuted >= limit) {
        lastExecuted = now;
        return method.apply(this, args);
      }
    };

    return descriptor;
  };
}

// Accessor decorator
export function Enumerable(enumerable: boolean) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = enumerable;
  };
}

// Parameter decorator
export function Required(target: any, propertyName: string | symbol, parameterIndex: number) {
  const existingRequiredParameters: number[] = 
    Reflect.getOwnMetadata('required', target, propertyName) || [];
  
  existingRequiredParameters.push(parameterIndex);
  
  Reflect.defineMetadata('required', existingRequiredParameters, target, propertyName);
}

// Decorator composition example
@LoggedClass
export class DecoratedUser {
  @MinLength(3)
  public name!: string;

  @MinLength(6)
  public password!: string;

  private _email!: string;

  @Enumerable(false)
  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  @Throttle(1000)
  public updateProfile(name: string, @Required email: string): void {
    this.name = name;
    this.email = email;
    console.log('Profile updated');
  }
}

// Multiple decorators on the same target
export function First() {
  console.log('First(): factory evaluated');
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    console.log('First(): called');
  };
}

export function Second() {
  console.log('Second(): factory evaluated');
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    console.log('Second(): called');
  };
}

export class ExampleClass {
  @First()
  @Second()
  method() {
    console.log('Method executed');
  }
}

// Decorator evaluation order demonstration
console.log('=== Decorator Evaluation Order ===');
// Factory functions are evaluated in written order
// Decorators are called in reverse order (bottom to top)

export default {
  LoggedClass,
  MinLength,
  Throttle,
  Enumerable,
  Required,
  DecoratedUser,
  First,
  Second,
  ExampleClass,
};