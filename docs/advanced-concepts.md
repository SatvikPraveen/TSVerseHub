# Advanced TypeScript Concepts
**File Location:** `docs/advanced-concepts.md`

This guide covers advanced TypeScript concepts that will help you write more sophisticated and type-safe code.

## Table of Contents
1. [Generic Constraints](#generic-constraints)
2. [Conditional Types](#conditional-types)
3. [Mapped Types](#mapped-types)
4. [Template Literal Types](#template-literal-types)
5. [Utility Types](#utility-types)
6. [Declaration Merging](#declaration-merging)
7. [Module Augmentation](#module-augmentation)
8. [Advanced Function Types](#advanced-function-types)

## Generic Constraints

Generic constraints allow you to limit the types that can be used as generic arguments.

### Basic Constraints

```typescript
// Constraint with extends
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// Usage
loggingIdentity("hello"); // ✅ string has length
loggingIdentity([1, 2, 3]); // ✅ array has length
// loggingIdentity(3); // ❌ number doesn't have length
```

### Using Type Parameters in Generic Constraints

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 30, city: "NYC" };
const name = getProperty(person, "name"); // string
const age = getProperty(person, "age"); // number
// const invalid = getProperty(person, "salary"); // ❌ Error
```

### Multiple Constraints

```typescript
interface Serializable {
  serialize(): string;
}

interface Timestamped {
  timestamp: Date;
}

function processData<T extends Serializable & Timestamped>(data: T): string {
  return `${data.timestamp.toISOString()}: ${data.serialize()}`;
}
```

## Conditional Types

Conditional types allow you to create types based on conditions.

### Basic Conditional Types

```typescript
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false
```

### Inferring Types

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type FuncReturn = ReturnType<() => string>; // string
type ArrayReturn = ReturnType<() => number[]>; // number[]
```

### Distributive Conditional Types

```typescript
type ToArray<T> = T extends any ? T[] : never;

type StringOrNumberArray = ToArray<string | number>; // string[] | number[]
```

### Advanced Conditional Types

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type FlattenArray<T> = T extends (infer U)[] ? U : T;
type Flattened = FlattenArray<string[]>; // string

// Recursive conditional types
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

## Mapped Types

Mapped types allow you to create new types by transforming properties of existing types.

### Basic Mapped Types

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
```

### Key Remapping

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// {
//   getId: () => number;
//   getName: () => string;
//   getEmail: () => string;
// }
```

### Filtering Properties

```typescript
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

interface Mixed {
  id: number;
  name: string;
  age: number;
  active: boolean;
}

type StringProps = PickByType<Mixed, string>; // { name: string }
type NumberProps = PickByType<Mixed, number>; // { id: number; age: number }
```

## Template Literal Types

Template literal types allow you to create string types based on patterns.

### Basic Template Literals

```typescript
type Color = "red" | "blue" | "green";
type Size = "small" | "medium" | "large";

type ColorSize = `${Color}-${Size}`;
// "red-small" | "red-medium" | "red-large" | 
// "blue-small" | "blue-medium" | "blue-large" |
// "green-small" | "green-medium" | "green-large"
```

### String Manipulation

```typescript
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

type Loud = Uppercase<"hello">; // "HELLO"
type Quiet = Lowercase<"WORLD">; // "world"
```

### Advanced Template Patterns

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;

type ButtonEvents = EventName<"click" | "hover" | "focus">;
// "onClick" | "onHover" | "onFocus"

// Extract parts from template literals
type ExtractRouteParams<T extends string> = 
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<`:${Rest}`>
    : T extends `${infer _Start}:${infer Param}`
    ? Param
    : never;

type Params = ExtractRouteParams<"/users/:id/posts/:postId">;
// "id" | "postId"
```

## Utility Types

TypeScript provides many built-in utility types for common transformations.

### Object Utilities

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Pick specific properties
type PublicUser = Pick<User, "id" | "name" | "email">;

// Omit specific properties
type CreateUser = Omit<User, "id">;

// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<Partial<User>>;

// Make all properties readonly
type ReadonlyUser = Readonly<User>;
```

### Function Utilities

```typescript
function createUser(name: string, email: string): User {
  return { id: Math.random(), name, email, password: "temp" };
}

type CreateUserParams = Parameters<typeof createUser>; // [string, string]
type CreateUserReturn = ReturnType<typeof createUser>; // User

// Constructor parameters
class Database {
  constructor(public host: string, public port: number) {}
}

type DbConfig = ConstructorParameters<typeof Database>; // [string, number]
type DbInstance = InstanceType<typeof Database>; // Database
```

### String Utilities

```typescript
type Methods = "GET" | "post" | "Put" | "DELETE";

type UpperMethods = Uppercase<Methods>; // "GET" | "POST" | "PUT" | "DELETE"
type LowerMethods = Lowercase<Methods>; // "get" | "post" | "put" | "delete"
type CapMethods = Capitalize<Methods>; // "GET" | "Post" | "Put" | "DELETE"
```

## Declaration Merging

Declaration merging allows you to extend existing types and interfaces.

### Interface Merging

```typescript
interface User {
  name: string;
}

interface User {
  age: number;
}

// Merged interface
const user: User = {
  name: "Alice",
  age: 30
};
```

### Module Augmentation

```typescript
// Extending existing modules
declare module "lodash" {
  interface LoDashStatic {
    customMethod(value: any): boolean;
  }
}

// Now you can use the custom method
// import _ from "lodash";
// _.customMethod(value);
```

### Global Augmentation

```typescript
declare global {
  interface Window {
    myCustomProperty: string;
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      CUSTOM_ENV_VAR: string;
    }
  }
}

// Usage
window.myCustomProperty = "Hello";
const envVar = process.env.CUSTOM_ENV_VAR;
```

## Advanced Function Types

### Function Overloads

```typescript
function processData(data: string): string;
function processData(data: number): number;
function processData(data: boolean): boolean;
function processData(data: string | number | boolean): string | number | boolean {
  if (typeof data === "string") return data.toUpperCase();
  if (typeof data === "number") return data * 2;
  return !data;
}
```

### Higher-Order Function Types

```typescript
type Middleware<T, R> = (value: T) => (next: (value: T) => R) => R;

const loggerMiddleware: Middleware<any, any> = (value) => (next) => {
  console.log("Processing:", value);
  const result = next(value);
  console.log("Result:", result);
  return result;
};
```

### Curried Functions

```typescript
type Curry<T> = T extends (...args: infer Args) => infer Return
  ? Args extends [infer First, ...infer Rest]
    ? (arg: First) => Curry<(...args: Rest) => Return>
    : Return
  : never;

declare function curry<T extends (...args: any[]) => any>(fn: T): Curry<T>;

const add = (a: number, b: number, c: number) => a + b + c;
const curriedAdd = curry(add);
const result = curriedAdd(1)(2)(3); // number
```

## Best Practices

1. **Use Generic Constraints Wisely**: Apply constraints to make your generics more specific and safer.

2. **Prefer Type Composition**: Use intersection and union types to compose complex types.

3. **Leverage Utility Types**: Use built-in utility types instead of creating custom ones when possible.

4. **Keep Conditional Types Simple**: Complex conditional types can be hard to understand and maintain.

5. **Document Complex Types**: Add comments to explain the purpose and usage of advanced types.

## Conclusion

These advanced TypeScript concepts provide powerful tools for creating type-safe, maintainable code. Practice with these concepts will help you leverage TypeScript's full potential in your projects.