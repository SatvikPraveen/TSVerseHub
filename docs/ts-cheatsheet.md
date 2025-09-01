# TypeScript Cheatsheet
**File Location:** `docs/ts-cheatsheet.md`

A quick reference guide for TypeScript syntax, types, and common patterns.

## Table of Contents
1. [Basic Types](#basic-types)
2. [Interfaces and Types](#interfaces-and-types)
3. [Functions](#functions)
4. [Classes](#classes)
5. [Generics](#generics)
6. [Utility Types](#utility-types)
7. [Advanced Types](#advanced-types)
8. [Decorators](#decorators)
9. [Modules](#modules)
10. [Configuration](#configuration)

## Basic Types

### Primitive Types
```typescript
// String
let name: string = "John";
let template: string = `Hello, ${name}`;

// Number
let age: number = 25;
let hex: number = 0xf00d;
let binary: number = 0b1010;

// Boolean
let isActive: boolean = true;
let isComplete: boolean = false;

// Null and Undefined
let nullable: null = null;
let undefinedValue: undefined = undefined;

// Any (avoid when possible)
let anything: any = 42;
anything = "string";
anything = true;

// Unknown (safer than any)
let unknownValue: unknown = 42;
if (typeof unknownValue === "string") {
  console.log(unknownValue.toUpperCase());
}

// Void
function logMessage(): void {
  console.log("Hello");
}

// Never
function throwError(): never {
  throw new Error("Always fails");
}
```

### Array Types
```typescript
// Array declaration
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Multi-dimensional arrays
let matrix: number[][] = [[1, 2], [3, 4]];

// Mixed arrays (tuples)
let tuple: [string, number] = ["hello", 42];
let namedTuple: [name: string, age: number] = ["John", 25];

// Optional tuple elements
let optionalTuple: [string, number?] = ["hello"];

// Rest in tuples
let restTuple: [string, ...number[]] = ["hello", 1, 2, 3];
```

### Object Types
```typescript
// Object literal type
let person: { name: string; age: number } = {
  name: "John",
  age: 30
};

// Optional properties
let config: { host: string; port?: number } = {
  host: "localhost"
};

// Index signatures
let dictionary: { [key: string]: string } = {
  key1: "value1",
  key2: "value2"
};

// Record type (preferred over index signatures)
let record: Record<string, number> = {
  a: 1,
  b: 2
};
```

## Interfaces and Types

### Interfaces
```typescript
// Basic interface
interface User {
  id: number;
  name: string;
  email: string;
}

// Optional properties
interface Config {
  apiUrl: string;
  timeout?: number;
  retries?: number;
}

// Readonly properties
interface ReadonlyUser {
  readonly id: number;
  name: string;
}

// Method signatures
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
}

// Index signatures
interface StringDictionary {
  [key: string]: string;
}

// Extending interfaces
interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}

// Multiple inheritance
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface AuditableUser extends User, Timestamped {
  lastLoginAt?: Date;
}
```

### Type Aliases
```typescript
// Basic type alias
type ID = string | number;
type Status = "pending" | "approved" | "rejected";

// Object types
type Point = {
  x: number;
  y: number;
};

// Function types
type EventHandler = (event: Event) => void;
type AsyncHandler<T> = (data: T) => Promise<void>;

// Union types
type StringOrNumber = string | number;
type Theme = "light" | "dark" | "auto";

// Intersection types
type User = {
  name: string;
  email: string;
};

type Admin = {
  role: "admin";
  permissions: string[];
};

type AdminUser = User & Admin;

// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

## Functions

### Function Declarations
```typescript
// Function declaration
function add(a: number, b: number): number {
  return a + b;
}

// Function expression
const multiply = function(a: number, b: number): number {
  return a * b;
};

// Arrow function
const divide = (a: number, b: number): number => a / b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}`;
}

// Default parameters
function createUser(name: string, role: string = "user"): User {
  return { name, role };
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}
```

### Function Overloads
```typescript
// Function overloads
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value * 2;
}

// Method overloads in interfaces
interface Processor {
  process(value: string): string;
  process(value: number): number;
}
```

### Higher-Order Functions
```typescript
// Function that takes another function
function withLogging<T, R>(fn: (arg: T) => R): (arg: T) => R {
  return (arg: T) => {
    console.log(`Calling function with:`, arg);
    const result = fn(arg);
    console.log(`Result:`, result);
    return result;
  };
}

// Function that returns a function
function createValidator(min: number): (value: number) => boolean {
  return (value: number) => value >= min;
}

// Generic function types
type MapFn<T, R> = (item: T, index: number) => R;
type FilterFn<T> = (item: T, index: number) => boolean;
```

## Classes

### Basic Classes
```typescript
class Person {
  // Properties
  name: string;
  private age: number;
  protected email: string;
  readonly id: number;

  // Constructor
  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
    this.id = Date.now();
  }

  // Methods
  getAge(): number {
    return this.age;
  }

  protected sendEmail(): void {
    console.log(`Sending email to ${this.email}`);
  }

  // Static members
  static species: string = "Homo sapiens";
  
  static createAnonymous(): Person {
    return new Person("Anonymous", 0, "");
  }
}

// Shorthand constructor
class User {
  constructor(
    public name: string,
    private age: number,
    protected email: string,
    readonly id: number = Date.now()
  ) {}
}
```

### Inheritance
```typescript
class Employee extends Person {
  constructor(
    name: string,
    age: number,
    email: string,
    public department: string
  ) {
    super(name, age, email);
  }

  // Override method
  getAge(): number {
    return super.getAge();
  }

  // New method using protected member
  notifyByEmail(): void {
    this.sendEmail();
  }
}
```

### Abstract Classes
```typescript
abstract class Shape {
  abstract area(): number;
  abstract perimeter(): number;

  // Concrete method
  describe(): string {
    return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}
```

## Generics

### Basic Generics
```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

// Usage
const stringResult = identity<string>("hello");
const numberResult = identity(42); // Type inference

// Generic interface
interface Container<T> {
  value: T;
  setValue(value: T): void;
  getValue(): T;
}

// Generic class
class Box<T> {
  constructor(private _value: T) {}

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    this._value = newValue;
  }
}
```

### Generic Constraints
```typescript
// Constraint with extends
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// Using keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Multiple constraints
interface Serializable {
  serialize(): string;
}

function processSerializable<T extends Serializable & Lengthwise>(
  item: T
): string {
  console.log(`Length: ${item.length}`);
  return item.serialize();
}
```

### Advanced Generic Patterns
```typescript
// Conditional types with generics
type ApiResponse<T> = T extends string
  ? { message: T }
  : T extends number
  ? { count: T }
  : { data: T };

// Mapped types with generics
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Generic utility functions
function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}
```

## Utility Types

### Built-in Utility Types
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Pick - Select specific properties
type UserInfo = Pick<User, "name" | "email">;

// Omit - Exclude specific properties
type CreateUser = Omit<User, "id">;

// Partial - Make all properties optional
type PartialUser = Partial<User>;

// Required - Make all properties required
type RequiredUser = Required<Partial<User>>;

// Readonly - Make all properties readonly
type ReadonlyUser = Readonly<User>;

// Record - Create object type with specific keys and values
type UserRoles = Record<"admin" | "user" | "guest", string[]>;

// Exclude - Remove types from union
type Status = "loading" | "success" | "error";
type NonLoadingStatus = Exclude<Status, "loading">;

// Extract - Keep only specified types from union
type SuccessOrError = Extract<Status, "success" | "error">;

// ReturnType - Get function return type
function getUser(): User {
  return {} as User;
}
type UserReturnType = ReturnType<typeof getUser>;

// Parameters - Get function parameters as tuple
function updateUser(id: number, data: Partial<User>): void {}
type UpdateUserParams = Parameters<typeof updateUser>;
```

### Custom Utility Types
```typescript
// Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Non-nullable
type NonNullable<T> = T extends null | undefined ? never : T;

// Function property names
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

// Non-function property names
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
```

## Advanced Types

### Template Literal Types
```typescript
// Basic template literals
type Color = "red" | "blue" | "green";
type Size = "small" | "medium" | "large";
type ColorSize = `${Color}-${Size}`;

// String manipulation
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;

type EventName<T extends string> = `on${Capitalize<T>}`;
type ButtonEvents = EventName<"click" | "hover">;

// Pattern matching
type ExtractParams<T extends string> = 
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`:${Rest}`>
    : T extends `${infer _Start}:${infer Param}`
    ? Param
    : never;

type Params = ExtractParams<"/users/:id/posts/:postId">;
```

### Mapped Types
```typescript
// Basic mapped type
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// Key remapping
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Changed`]: (
    newValue: T[K]
  ) => void;
};

// Filtering properties
type StringProperties<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// Conditional mapping
type OptionalByType<T, U> = {
  [K in keyof T]: T[K] extends U ? T[K] | undefined : T[K];
};
```

### Recursive Types
```typescript
// JSON type
type JSONValue = 
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

interface JSONObject {
  [key: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

// Tree structure
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

// Deeply nested paths
type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${Path<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;
```

## Decorators

### Class Decorators
```typescript
// Class decorator
function Component(target: any) {
  target.prototype.isComponent = true;
}

@Component
class MyComponent {
  render() {
    return "<div>Hello</div>";
  }
}

// Decorator factory
function Injectable(token?: string) {
  return function<T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      token = token || constructor.name;
    };
  };
}

@Injectable("MyService")
class MyService {}
```

### Method Decorators
```typescript
// Method decorator
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }
}

// Decorator with parameters
function Timeout(ms: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
      );
      
      const methodPromise = originalMethod.apply(this, args);
      
      return Promise.race([methodPromise, timeoutPromise]);
    };
  };
}
```

### Property Decorators
```typescript
// Property decorator
function Min(min: number) {
  return function (target: any, propertyKey: string) {
    let value = target[propertyKey];

    const getter = () => value;
    const setter = (newValue: number) => {
      if (newValue < min) {
        throw new Error(`${propertyKey} must be >= ${min}`);
      }
      value = newValue;
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

class Person {
  @Min(0)
  age: number = 0;
}
```

## Modules

### Export/Import Syntax
```typescript
// Named exports
export const PI = 3.14159;
export function calculateArea(radius: number): number {
  return PI * radius * radius;
}

export class Circle {
  constructor(public radius: number) {}
}

// Default export
export default class DefaultClass {
  name = "Default";
}

// Re-exports
export { SomeClass } from './other-module';
export * from './utils';
export * as Utils from './utils';

// Import syntax
import DefaultClass, { PI, calculateArea, Circle } from './module';
import * as MathUtils from './math-utils';
import type { UserType } from './types';

// Dynamic imports
async function loadModule() {
  const module = await import('./dynamic-module');
  return new module.DynamicClass();
}
```

### Namespace (Legacy)
```typescript
// Namespace declaration
namespace Geometry {
  export interface Point {
    x: number;
    y: number;
  }

  export function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

You're correct that both files appear to be incomplete. Looking at the documents provided, I can see that:

1. **ts-cheatsheet.md** cuts off mid-sentence in the namespace section
2. **mini-projects.md** ends abruptly in the State Management Library section

Let me provide the content needed to complete both files:

## For `docs/ts-cheatsheet.md` - Content to append:

```typescript
  export namespace Shapes {
    export class Rectangle {
      constructor(public width: number, public height: number) {}
      
      area(): number {
        return this.width * this.height;
      }
    }
  }
}

// Usage
const point1: Geometry.Point = { x: 0, y: 0 };
const point2: Geometry.Point = { x: 3, y: 4 };
const dist = Geometry.distance(point1, point2);
const rect = new Geometry.Shapes.Rectangle(10, 20);
```

### Module Augmentation
```typescript
// Augmenting existing modules
declare module "express" {
  interface Request {
    user?: User;
  }
}

// Global augmentation
declare global {
  interface Window {
    myGlobalVar: string;
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
    }
  }
}
```

## Configuration

### tsconfig.json Essential Options
```json
{
  "compilerOptions": {
    /* Basic Options */
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    
    /* Strict Type-Checking Options */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Module Resolution Options */
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/types/*": ["src/types/*"]
    },
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    
    /* Source Map Options */
    "sourceMap": true,
    "inlineSourceMap": false,
    "declaration": true,
    "declarationMap": true,
    
    /* Experimental Options */
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    
    /* Advanced Options */
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Compiler Options Quick Reference
```typescript
// Target versions
"target": "ES5" | "ES2015" | "ES2016" | "ES2017" | "ES2018" | "ES2019" | "ES2020" | "ESNext"

// Module systems
"module": "none" | "commonjs" | "amd" | "system" | "umd" | "es6" | "es2015" | "es2020" | "esnext"

// Library files
"lib": ["ES5", "ES6", "ES2015", "ES2016", "ES2017", "ES2018", "ES2019", "ES2020", "ESNext", "DOM", "WebWorker"]

// JSX options
"jsx": "preserve" | "react" | "react-jsx" | "react-jsxdev"

// Module resolution
"moduleResolution": "node" | "classic"
```

## Common Patterns and Idioms

### Type Guards
```typescript
// User-defined type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  );
}

// Using type guards
function processValue(value: unknown) {
  if (isString(value)) {
    // value is now typed as string
    console.log(value.toUpperCase());
  }
}
```

### Assertion Functions
```typescript
// Assertion function
function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg || 'Assertion failed');
  }
}

function assertIsUser(obj: unknown): asserts obj is User {
  if (!isUser(obj)) {
    throw new Error('Not a user object');
  }
}

// Usage
function processUser(data: unknown) {
  assertIsUser(data);
  // data is now typed as User
  console.log(data.name);
}
```

### Branded Types
```typescript
// Branded types for type safety
type UserId = string & { readonly brand: unique symbol };
type Email = string & { readonly brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createEmail(email: string): Email {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  return email as Email;
}

// Usage ensures type safety
function getUserById(id: UserId): User {
  // Implementation
  return {} as User;
}

const id = createUserId('123');
const email = createEmail('user@example.com');

getUserById(id); // ✅ Correct
// getUserById('123'); // ❌ Error - string is not UserId
```

## Best Practices Summary

### Type Safety
- Always enable strict mode
- Avoid `any` type, use `unknown` instead
- Use type guards for runtime type checking
- Prefer interfaces over type aliases for object shapes

### Code Organization
- Use meaningful names for types and interfaces
- Group related types in separate files
- Use barrel exports for cleaner imports
- Document complex types with comments

### Performance
- Use type imports when possible
- Avoid deeply nested conditional types
- Use project references for large codebases
- Enable incremental compilation

### Maintainability
- Keep types close to their usage
- Use utility types instead of duplicating logic
- Favor composition over inheritance
- Write tests for complex type logic

This cheatsheet covers the most commonly used TypeScript features and patterns. Keep it handy as a quick reference while developing TypeScript applications!