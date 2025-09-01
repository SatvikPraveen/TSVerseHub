/* File: src/concepts/basics/type-aliases.ts */

import { ConceptTopic } from './index';

export const typeAliases: ConceptTopic = {
  id: 'type-aliases',
  title: 'Type Aliases',
  description: 'Learn how to create reusable type definitions using type aliases to make your code more readable and maintainable.',
  codeExample: `// Basic type aliases
type Username = string;
type Age = number;
type IsActive = boolean;

// Using basic type aliases
let user: Username = "johnsmith";
let userAge: Age = 25;
let accountActive: IsActive = true;

// Union type aliases
type Status = "pending" | "approved" | "rejected" | "cancelled";
type ID = string | number;
type Theme = "light" | "dark" | "auto";

// Using union types
let orderStatus: Status = "pending";
let userId: ID = "user_123";
let appTheme: Theme = "dark";

// Object type aliases
type User = {
  id: ID;
  username: Username;
  age: Age;
  isActive: IsActive;
  status: Status;
};

type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

// Using object type aliases
const currentUser: User = {
  id: 1,
  username: "alice",
  age: 30,
  isActive: true,
  status: "approved"
};

const homeAddress: Address = {
  street: "123 Main St",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  country: "USA"
};

// Function type aliases
type Calculator = (a: number, b: number) => number;
type StringProcessor = (input: string) => string;
type EventHandler = (event: Event) => void;
type AsyncFetcher<T> = (url: string) => Promise<T>;

// Using function type aliases
const add: Calculator = (a, b) => a + b;
const multiply: Calculator = (a, b) => a * b;

const toUpperCase: StringProcessor = (str) => str.toUpperCase();
const trim: StringProcessor = (str) => str.trim();

// Array type aliases
type NumberArray = number[];
type StringList = Array<string>;
type UserList = User[];
type Matrix = number[][];

// Generic type aliases
type Container<T> = {
  value: T;
  isEmpty: boolean;
  toString: () => string;
};

type KeyValuePair<K, V> = {
  key: K;
  value: V;
};

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
};

// Using generic type aliases
const stringContainer: Container<string> = {
  value: "hello",
  isEmpty: false,
  toString: () => "String container"
};

const numberContainer: Container<number> = {
  value: 42,
  isEmpty: false,
  toString: () => "Number container"
};

const userResponse: ApiResponse<User> = {
  data: currentUser,
  status: 200,
  message: "User retrieved successfully",
  timestamp: new Date()
};

// Complex nested type aliases
type DatabaseEntity = {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
};

type ExtendedUser = User & DatabaseEntity & {
  email: string;
  address?: Address;
  preferences: {
    theme: Theme;
    notifications: boolean;
    language: string;
  };
};

// Conditional type aliases (advanced)
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// Utility type aliases
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Using utility types
type UserWithOptionalEmail = Optional<ExtendedUser, 'email'>;
type UserWithRequiredAddress = RequiredFields<ExtendedUser, 'address'>;

// Recursive type aliases
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONValue[] 
  | { [key: string]: JSONValue };

// Template literal types
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type APIEndpoint = \`/api/\${string}\`;
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

// Using template literal types
const endpoint: APIEndpoint = "/api/users";
const clickHandler: EventName<"click"> = "onClick";
const hoverHandler: EventName<"hover"> = "onHover";`,

  explanation: `Type aliases provide a way to create custom names for types, making your TypeScript code more readable, maintainable, and self-documenting:

**Basic Type Aliases**: You can create aliases for primitive types, which acts as semantic labels that make your code's intent clearer.

**Union Type Aliases**: Combine multiple types using the union operator (|) to create types that can accept multiple specific values.

**Object Type Aliases**: Define the structure of objects with specific property types. This is similar to interfaces but with different syntax and capabilities.

**Function Type Aliases**: Create reusable type definitions for functions with specific parameter and return types.

**Generic Type Aliases**: Use type parameters to create flexible, reusable type definitions that work with multiple types while maintaining type safety.

**Intersection Types**: Combine multiple types using the intersection operator (&) to create types that have all properties from the combined types.

**Conditional Types**: Create types that depend on conditions, allowing for more dynamic type definitions.

**Template Literal Types**: Use template literal syntax to create types based on string patterns, enabling more precise string typing.

**Recursive Types**: Define types that reference themselves, useful for tree structures and nested data.`,

  keyPoints: [
    'Type aliases create reusable type definitions with the `type` keyword',
    'Union types use | to allow multiple possible types',
    'Generic type aliases accept type parameters for reusability',
    'Intersection types combine multiple types with &',
    'Type aliases can reference other type aliases',
    'Template literal types enable pattern-based string typing',
    'Recursive types can reference themselves for nested structures',
    'Type aliases are compile-time only and don\'t exist at runtime',
    'Good naming makes type aliases self-documenting'
  ],

  commonMistakes: [
    'Using `any` instead of creating proper union types',
    'Creating overly complex nested type aliases that are hard to understand',
    'Not using descriptive names for type aliases',
    'Confusing type aliases with interfaces - they have different use cases',
    'Creating circular dependencies between type aliases',
    'Not leveraging generic type aliases for reusability',
    'Using type aliases for simple cases where inline types would be clearer',
    'Forgetting that type aliases don\'t create new types, just new names'
  ],

  bestPractices: [
    'Use descriptive, semantic names that indicate the type\'s purpose',
    'Keep type aliases simple and focused on a single concept',
    'Use union types instead of `any` when multiple types are valid',
    'Leverage generic type aliases for reusable patterns',
    'Group related type aliases together in modules',
    'Use PascalCase for type alias names',
    'Document complex type aliases with comments',
    'Prefer type aliases for unions and computed types',
    'Use interfaces for object shapes that might be extended'
  ],

  relatedTopics: [
    'interfaces-vs-types',
    'variables',
    'functions',
    'generics',
    'advanced-types'
  ]
};

// Additional type alias patterns and examples
export const typeAliasExamples = {
  practicalPatterns: {
    title: 'Practical Type Alias Patterns',
    code: `// API Response patterns
type SuccessResponse<T> = {
  success: true;
  data: T;
  timestamp: string;
};

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
};

type APIResponse<T> = SuccessResponse<T> | ErrorResponse;

// Configuration patterns
type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  ssl: boolean;
};

type RedisConfig = {
  host: string;
  port: number;
  password?: string;
};

type AppConfig = {
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: {
    secret: string;
    expiresIn: string;
  };
};

// Event system patterns
type BaseEvent = {
  id: string;
  timestamp: Date;
  source: string;
};

type UserEvent = BaseEvent & {
  type: 'user';
  action: 'login' | 'logout' | 'register';
  userId: string;
};

type SystemEvent = BaseEvent & {
  type: 'system';
  action: 'startup' | 'shutdown' | 'error';
  details: unknown;
};

type AppEvent = UserEvent | SystemEvent;`
  },

  utilityCompositions: {
    title: 'Composing with Utility Types',
    code: `// Base user type
type BaseUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
};

// Derived types using utility types
type PublicUser = Pick<BaseUser, 'id' | 'firstName' | 'lastName'>;
type UserUpdate = Partial<Omit<BaseUser, 'id' | 'createdAt' | 'updatedAt'>>;
type NewUser = Omit<BaseUser, 'id' | 'createdAt' | 'updatedAt'>;

// Form handling patterns
type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
  disabled: boolean;
};

type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

// Usage
type LoginForm = {
  email: string;
  password: string;
};

type LoginFormState = FormState<LoginForm>;

// Resource state patterns
type LoadingState = { status: 'loading' };
type SuccessState<T> = { status: 'success'; data: T };
type ErrorState = { status: 'error'; error: string };

type ResourceState<T> = LoadingState | SuccessState<T> | ErrorState;

// Usage
type UserState = ResourceState<BaseUser>;
type UsersState = ResourceState<BaseUser[]>;`
  },

  advancedPatterns: {
    title: 'Advanced Type Alias Patterns',
    code: `// Branded types for type safety
type Brand<T, B> = T & { __brand: B };
type UserId = Brand<string, 'UserId'>;
type Email = Brand<string, 'Email'>;
type PhoneNumber = Brand<string, 'PhoneNumber'>;

// Helper functions to create branded types
const createUserId = (id: string): UserId => id as UserId;
const createEmail = (email: string): Email => email as Email;

// Deep readonly type
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// String manipulation types
type Uppercase<S extends string> = Intrinsic;
type Lowercase<S extends string> = Intrinsic;
type Capitalize<S extends string> = Intrinsic;
type Uncapitalize<S extends string> = Intrinsic;

// Path types for nested objects
type PathKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | \`\${K}.\${PathKeys<T[K]>}\`
          : K
        : never;
    }[keyof T]
  : never;

// Usage with nested object
type Config = {
  database: {
    host: string;
    port: number;
  };
  api: {
    version: string;
    timeout: number;
  };
};

type ConfigPath = PathKeys<Config>;
// Result: "database" | "api" | "database.host" | "database.port" | "api.version" | "api.timeout"`
  }
};

export default typeAliases;