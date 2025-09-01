/* File: src/concepts/basics/interfaces-vs-types.ts */

import { ConceptTopic } from './index';

export const interfacesVsTypes: ConceptTopic = {
  id: 'interfaces-vs-types',
  title: 'Interfaces vs Type Aliases',
  description: 'Understand the differences between interfaces and type aliases, when to use each, and how they can work together.',
  codeExample: `// INTERFACES
// Basic interface declaration
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Interface with optional properties
interface UserProfile {
  bio?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

// Interface with methods
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
  divide(a: number, b: number): number;
}

// Interface with index signatures
interface StringDictionary {
  [key: string]: string;
}

interface NumberDictionary {
  [index: number]: string;
  length: number; // Can mix with explicit properties
}

// Interface extension (inheritance)
interface ExtendedUser extends User {
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

// Multiple interface inheritance
interface AdminUser extends User, UserProfile {
  role: "admin" | "superuser";
  permissions: string[];
}

// Interface merging (declaration merging)
interface Window {
  customProperty: string;
}

interface Window {
  anotherCustomProperty: number;
}
// Now Window has both properties

// Generic interfaces
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// ===========================================

// TYPE ALIASES
// Basic type alias
type UserType = {
  id: string;
  name: string;
  email: string;
  age: number;
};

// Union types (interfaces can't do this)
type Status = "pending" | "approved" | "rejected";
type ID = string | number;
type Theme = "light" | "dark";

// Intersection types
type UserWithProfile = UserType & {
  profile: UserProfile;
  createdAt: Date;
};

// Function types
type EventHandler = (event: Event) => void;
type AsyncOperation<T> = () => Promise<T>;

// Tuple types
type Coordinates = [number, number];
type RGB = [number, number, number];
type UserTuple = [string, string, number]; // [id, name, age]

// Conditional types (interfaces can't do this)
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// Mapped types (interfaces can't do this directly)
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};

// Template literal types
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type APIEndpoint = \`/api/\${string}\`;
type CSSProperty = \`--\${string}\`;

// Generic type aliases with constraints
type KeyValuePair<K extends string | number | symbol, V> = {
  key: K;
  value: V;
};

type StringKeyValue<V> = KeyValuePair<string, V>;

// ===========================================

// PRACTICAL COMPARISONS

// 1. Object shapes - both work similarly
interface IUser {
  name: string;
  age: number;
}

type TUser = {
  name: string;
  age: number;
};

// Both can be used identically
const user1: IUser = { name: "Alice", age: 30 };
const user2: TUser = { name: "Bob", age: 25 };

// 2. Extension vs Intersection
// Interface extension
interface Student extends IUser {
  studentId: string;
  grade: number;
}

// Type intersection
type StudentType = TUser & {
  studentId: string;
  grade: number;
};

// 3. Declaration merging (only interfaces)
interface MergeableInterface {
  property1: string;
}

interface MergeableInterface {
  property2: number;
}
// Result: { property1: string; property2: number; }

// Types cannot be reopened
// type MergeableType = { property1: string; }
// type MergeableType = { property2: number; } // Error!

// 4. Computed properties (only types)
type Keys = "name" | "age" | "email";
type UserRecord = {
  [K in Keys]: string;
};

// Interfaces can't use mapped types directly
// interface UserRecord {
//   [K in Keys]: string; // Error!
// }

// 5. Union types (only type aliases)
type StringOrNumber = string | number;
type UserOrAdmin = User | AdminUser;

// Interfaces can't represent unions
// interface StringOrNumber = string | number; // Error!

// ===========================================

// WHEN TO USE WHICH?

// Use INTERFACES when:
// - Defining object shapes that might be extended
// - Creating contracts for classes to implement
// - Taking advantage of declaration merging
// - Building libraries where extensibility is important

interface LibraryConfig {
  version: string;
  debug: boolean;
}

interface APIClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
}

class HttpClient implements APIClient {
  async get<T>(url: string): Promise<T> {
    // implementation
    return {} as T;
  }
  
  async post<T>(url: string, data: unknown): Promise<T> {
    // implementation
    return {} as T;
  }
}

// Use TYPE ALIASES when:
// - Creating union or intersection types
// - Working with computed/mapped types
// - Defining primitive aliases or function signatures
// - Creating complex conditional types

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiResponse<T> = {
  data: T;
  status: number;
  headers: Record<string, string>;
};

type RequestConfig = {
  method: RequestMethod;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
};

// ===========================================

// ADVANCED PATTERNS

// Combining interfaces and types
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

type EntityWithStatus = BaseEntity & {
  status: Status; // Using the union type defined earlier
};

// Interface implementing a type
type Callable = {
  (): void;
};

interface CallableWithProps extends Callable {
  prop: string;
}

// Generic interface with type constraints
interface Validator<T> {
  validate(value: unknown): value is T;
  sanitize?(value: T): T;
}

type ValidationResult<T> = {
  isValid: boolean;
  value?: T;
  errors?: string[];
};

// Hybrid approach for maximum flexibility
interface UserActions {
  login(credentials: { username: string; password: string }): Promise<User>;
  logout(): Promise<void>;
}

type UserState = {
  currentUser: User | null;
  isAuthenticated: boolean;
  lastLoginAt?: Date;
};

type UserStore = UserActions & {
  state: UserState;
  subscribe(listener: (state: UserState) => void): () => void;
};`,

  explanation: `Understanding when to use interfaces versus type aliases is crucial for writing clean, maintainable TypeScript code:

**Interfaces** are primarily designed for defining object shapes and contracts. They excel at:
- Describing the structure of objects and classes
- Supporting extension through inheritance
- Enabling declaration merging for library extensibility
- Providing clear contracts that classes can implement

**Type Aliases** are more flexible and can represent any type. They're essential for:
- Creating union and intersection types
- Working with primitive type aliases
- Defining function signatures
- Creating computed and conditional types
- Working with tuple types and template literals

**Key Differences:**

1. **Extensibility**: Interfaces use \`extends\` keyword, while types use intersection (&) operators
2. **Declaration Merging**: Only interfaces support merging multiple declarations
3. **Union Types**: Only type aliases can represent unions
4. **Computed Types**: Type aliases support mapped types and conditional types
5. **Implementation**: Classes can implement interfaces more naturally

**Performance**: Interfaces are generally faster for TypeScript compiler as they create a flat object type, while type aliases with intersections may create more complex type structures.

**When to Choose:**
- Use **interfaces** for object shapes, class contracts, and when you need extensibility
- Use **type aliases** for unions, intersections, primitives, functions, and computed types
- Consider using both together for maximum flexibility`,

  keyPoints: [
    'Interfaces are ideal for defining object shapes and class contracts',
    'Type aliases are more flexible and can represent any type',
    'Only interfaces support declaration merging',
    'Only type aliases can create union types',
    'Interfaces use extends, type aliases use intersection (&)',
    'Classes implement interfaces more naturally than type aliases',
    'Type aliases support advanced type operations like mapped and conditional types',
    'Both can be generic and work well together',
    'Choose based on your specific use case and future extensibility needs'
  ],

  commonMistakes: [
    'Using type aliases for simple object shapes that could be interfaces',
    'Trying to use declaration merging with type aliases',
    'Using interfaces for union types (not possible)',
    'Not leveraging interface extension when building related types',
    'Mixing interface and type alias syntax incorrectly',
    'Using interfaces for function types when type aliases are clearer',
    'Not considering future extensibility needs when choosing',
    'Creating overly complex type intersections when interface extension would be simpler'
  ],

  bestPractices: [
    'Use interfaces for object shapes and class contracts',
    'Use type aliases for unions, intersections, and computed types',
    'Prefer interfaces for public APIs that might need extension',
    'Use consistent naming conventions (Interface vs Type prefixes if needed)',
    'Combine both approaches when it makes sense',
    'Consider future extensibility when making the choice',
    'Use interfaces for defining component props in React',
    'Use type aliases for complex business logic types',
    'Document the reasoning behind your choice for complex cases'
  ],

  relatedTopics: [
    'type-aliases',
    'variables',
    'functions',
    'classes',
    'generics',
    'advanced-types'
  ]
};

export default interfacesVsTypes;