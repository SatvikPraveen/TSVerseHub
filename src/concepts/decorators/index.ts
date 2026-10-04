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

import { defineMetadata, getOwnMetadata } from './metadata';

// Re-export all decorator concepts.
// Several sub-modules export the same names; `export *` cannot pick between them
// (and TypeScript silently drops the ambiguous names), so every public name is
// listed explicitly exactly once, with module-qualified aliases for duplicates.
export {
  defineMetadata, hasOwnMetadata, getOwnMetadata, hasMetadata, getMetadata,
} from './metadata';
export type {
  MetadataKey, MemberKey,
} from './metadata';
export {
  Sealed, Component, Entity, Logged, Timestamped, Singleton, Validatable, Cacheable, Controller,
  SealedClass, UserComponent, User, Product, DatabaseConnection, Employee, DataService,
  ApiController, ProductService,
} from './class-decorators';
export {
  Log, Retry, Measure, Cached, RateLimit, ValidateArgs, Timeout, Deprecated, RequireAuth, Debounce,
  GET, POST, AutoBind, UserService as MethodUserService, ApiController as MethodApiController,
  DataProcessor, EventHandler,
} from './method-decorators';
export {
  Required as RequiredProperty, MinLength as MinLengthProperty, MaxLength, Email, Range, Format,
  ReadOnly, Default, Observable, Computed, DeprecatedProperty, Lazy, Type, validateObject,
  User as ValidatedUser, Calculator, Product as ValidatedProduct,
} from './property-decorators';
export type {
  ValidationRule, ValidationMap,
} from './property-decorators';
export {
  Required as RequiredParam, ValidateType, Range as RangeParam, MinLength as MinLengthParam,
  EmailParam, Transform, DefaultValue, Validate, Inject, Optional, Body, Query, Param, Header,
  ValidateParams, getParameterMetadata, UserService as ParameterUserService, MathService,
  ApiController as ParameterApiController, BusinessService,
} from './parameter-decorators';
export type {
  ParameterTransformer, ParameterValidator, ParameterTypeName, ParameterRange, ParameterValidation,
  Logger, Database,
} from './parameter-decorators';

// Decorator factory - a function that returns the actual decorator
export function LoggedClass<T extends new (...args: any[]) => object>(target: T): T {
  console.log(`Creating class: ${target.name}`);
  return target;
}

// Property decorator factory
export function MinLength(minLength: number) {
  return function (target: object, propertyName: string) {
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
  return function (_target: object, _propertyName: string, descriptor: PropertyDescriptor) {
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
  return function (_target: object, _propertyName: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = enumerable;
  };
}

// Parameter decorator
export function Required(target: object, propertyName: string | symbol | undefined, parameterIndex: number) {
  const existingRequiredParameters =
    getOwnMetadata<number[]>('required', target, propertyName) ?? [];
  
  existingRequiredParameters.push(parameterIndex);
  
  defineMetadata('required', existingRequiredParameters, target, propertyName);
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
  return function (_target: object, _propertyName: string, _descriptor: PropertyDescriptor) {
    console.log('First(): called');
  };
}

export function Second() {
  console.log('Second(): factory evaluated');
  return function (_target: object, _propertyName: string, _descriptor: PropertyDescriptor) {
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