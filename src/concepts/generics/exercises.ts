// File location: src/data/concepts/generics/exercises.ts

export interface GenericsExercisesContent {
  title: string;
  description: string;
  exercises: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    expert: string[];
  };
  solutions: string[];
  keyPoints: string[];
}

export const genericsExercisesContent: GenericsExercisesContent = {
  title: "Generics Exercises",
  description: "Practice exercises to master TypeScript generics, from basic type parameters to advanced type-level programming. Each exercise builds upon previous concepts and introduces new patterns.",
  
  exercises: {
    beginner: [
      `// Exercise 1: Basic Generic Functions
// Create generic functions for common operations

// 1.1: Create a generic identity function
function identity<T>(/* parameters here */): /* return type */ {
  // Your implementation
}

// Test cases:
const num = identity(42);        // Should be number
const str = identity("hello");   // Should be string
const bool = identity(true);     // Should be boolean

// 1.2: Create a generic swap function for arrays
function swap<T>(/* parameters here */): /* return type */ {
  // Your implementation
}

// Test case:
const swapped = swap([1, 2, 3], 0, 2); // Should swap first and third elements

// 1.3: Create a generic first function that gets the first element
function first<T>(/* parameters here */): /* return type */ {
  // Your implementation
}

// Test cases:
const firstNum = first([1, 2, 3]);        // Should be number | undefined
const firstName = first(["a", "b", "c"]); // Should be string | undefined
const emptyFirst = first([]);              // Should be undefined

// 1.4: Create a generic last function
function last<T>(/* parameters here */): /* return type */ {
  // Your implementation
}

// 1.5: Create a generic pair function that creates a tuple
function pair<T, U>(/* parameters here */): /* return type */ {
  // Your implementation
}

const numStringPair = pair(42, "hello"); // Should be [number, string]`,

      `// Exercise 2: Generic Classes
// Create generic data structures

// 2.1: Create a generic Box class
class Box<T> {
  // Your implementation
  constructor(/* parameters */) {}
  
  getValue(): /* return type */ {
    // Your implementation
  }
  
  setValue(/* parameters */): void {
    // Your implementation
  }
  
  map<U>(/* parameters */): /* return type */ {
    // Your implementation
  }
}

// Test cases:
const stringBox = new Box("hello");
const numberBox = new Box(42);
const upperBox = stringBox.map(s => s.toUpperCase()); // Should be Box<string>
const lengthBox = stringBox.map(s => s.length);       // Should be Box<number>

// 2.2: Create a generic Stack class
class Stack<T> {
  // Your implementation
  
  push(/* parameters */): void {}
  pop(): /* return type */ {}
  peek(): /* return type */ {}
  isEmpty(): boolean {}
  size(): number {}
}

// 2.3: Create a generic Queue class
class Queue<T> {
  // Your implementation
  
  enqueue(/* parameters */): void {}
  dequeue(): /* return type */ {}
  front(): /* return type */ {}
  isEmpty(): boolean {}
  size(): number {}
}`,

      `// Exercise 3: Basic Constraints
// Practice using generic constraints

// 3.1: Create a function that works only with objects that have a length property
function logLength<T /* constraint here */>(/* parameters */): void {
  // Your implementation
}

logLength("hello");     // Should work
logLength([1, 2, 3]);   // Should work
logLength({length: 5}); // Should work
// logLength(123);      // Should error

// 3.2: Create a function that clones objects
function clone<T /* constraint here */>(/* parameters */): /* return type */ {
  // Your implementation
}

const user = { name: "John", age: 30 };
const clonedUser = clone(user); // Should have same type as user

// 3.3: Create a function that gets property from object
function getProperty<T, K /* constraint here */>(/* parameters */): /* return type */ {
  // Your implementation
}

const person = { name: "Alice", age: 25, city: "NYC" };
const name = getProperty(person, "name");     // Should be string
const age = getProperty(person, "age");       // Should be number
// const invalid = getProperty(person, "foo"); // Should error

// 3.4: Create a function that sets property on object
function setProperty<T, K /* constraint here */>(/* parameters */): /* return type */ {
  // Your implementation
}

const updatedPerson = setProperty(person, "age", 26); // Should work
// const invalid = setProperty(person, "age", "26");   // Should error`,
    ],

    intermediate: [
      `// Exercise 4: Conditional Types and Mapped Types
// Practice advanced type transformations

// 4.1: Create a type that makes all string properties optional
type OptionalStrings<T> = /* Your implementation */

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

type UserWithOptionalStrings = OptionalStrings<User>;
// Should be: { id: number; name?: string; email?: string; age: number; isActive: boolean; }

// 4.2: Create a type that extracts all function property names
type FunctionPropertyNames<T> = /* Your implementation */

interface Service {
  name: string;
  version: number;
  start(): void;
  stop(): void;
  restart(): Promise<void>;
  getStatus(): boolean;
}

type ServiceMethods = FunctionPropertyNames<Service>; // Should be 'start' | 'stop' | 'restart' | 'getStatus'

// 4.3: Create a type that converts all methods to async
type AsyncMethods<T> = /* Your implementation */

type AsyncService = AsyncMethods<Service>;
// All methods should return Promise<OriginalReturnType>

// 4.4: Create a DeepReadonly type
type DeepReadonly<T> = /* Your implementation */

interface NestedObject {
  user: {
    profile: {
      name: string;
      settings: {
        theme: string;
      };
    };
  };
}

type ReadonlyNested = DeepReadonly<NestedObject>; // All properties should be readonly`,

      `// Exercise 5: Utility Type Creation
// Build custom utility types

// 5.1: Create a Diff type that gets properties in T but not in U
type Diff<T, U> = /* Your implementation */

type A = { a: string; b: number; c: boolean };
type B = { a: string; d: Date };
type DiffResult = Diff<A, B>; // Should be { b: number; c: boolean }

// 5.2: Create an Intersection type
type Intersection<T, U> = /* Your implementation */

type IntersectionResult = Intersection<A, B>; // Should be { a: string }

// 5.3: Create a NonNullable utility for nested objects
type DeepNonNullable<T> = /* Your implementation */

interface MaybeUser {
  name?: string | null;
  profile?: {
    email?: string | null;
    age?: number | null;
  } | null;
}

type DefiniteUser = DeepNonNullable<MaybeUser>; // Remove all null and undefined

// 5.4: Create a Flatten type for nested arrays
type Flatten<T> = /* Your implementation */

type NestedNumbers = number[][];
type FlatNumbers = Flatten<NestedNumbers>; // Should be number[]

// 5.5: Create a Paths type that generates all possible object paths
type Paths<T> = /* Your implementation */

interface Config {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
}

type ConfigPaths = Paths<Config>; 
// Should include: 'database' | 'database.host' | 'database.port' | 'database.credentials' | etc.`,

      `// Exercise 6: Advanced Generic Functions
// Create complex generic function signatures

// 6.1: Create a pipe function for function composition
function pipe<A, B>(f1: (a: A) => B): (a: A) => B;
function pipe<A, B, C>(
  f1: (a: A) => B,
  f2: (b: B) => C
): (a: A) => C;
function pipe<A, B, C, D>(
  f1: (a: A) => B,
  f2: (b: B) => C,
  f3: (c: C) => D
): (a: A) => D;
// Add more overloads and implement
function pipe(...fns: any[]): any {
  // Your implementation
}

// Test:
const result = pipe(
  (x: number) => x.toString(),
  (s: string) => s.length,
  (n: number) => n > 5
);

// 6.2: Create a curry function
type Curry<T> = /* Your implementation */

function curry<T extends (...args: any[]) => any>(fn: T): /* return type */ {
  // Your implementation
}

const add = (a: number, b: number, c: number) => a + b + c;
const curriedAdd = curry(add);
const result2 = curriedAdd(1)(2)(3); // Should be number

// 6.3: Create a memoization function
function memoize<Args extends any[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  // Your implementation
}

// 6.4: Create a retry function with generic error handling
async function retry<T, E extends Error = Error>(
  fn: () => Promise<T>,
  maxAttempts: number,
  onError?: (error: E, attempt: number) => void
): Promise<T> {
  // Your implementation
}`,
    ],

    advanced: [
      `// Exercise 7: Complex Type Constraints and Relationships
// Master advanced constraint patterns

// 7.1: Create a type-safe EventEmitter
interface EventMap {
  [eventName: string]: any[];
}

class TypedEventEmitter<Events extends EventMap> {
  // Your implementation
  
  on<K extends keyof Events>(
    event: K,
    listener: (...args: Events[K]) => void
  ): this {}
  
  emit<K extends keyof Events>(
    event: K,
    ...args: Events[K]
  ): boolean {}
  
  off<K extends keyof Events>(
    event: K,
    listener: (...args: Events[K]) => void
  ): this {}
}

// Define your event types
interface AppEvents extends EventMap {
  'user:login': [{ userId: string; timestamp: Date }];
  'user:logout': [{ userId: string }];
  'error': [{ message: string; code: number }];
}

const emitter = new TypedEventEmitter<AppEvents>();

// 7.2: Create a type-safe State Machine
type StateDefinition<TState extends string, TEvent extends string> = {
  [State in TState]: {
    [Event in TEvent]?: TState;
  };
};

class StateMachine<
  TState extends string,
  TEvent extends string,
  TDefinition extends StateDefinition<TState, TEvent>
> {
  constructor(
    private definition: TDefinition,
    private currentState: TState
  ) {}
  
  // Your implementation
  transition(/* parameters */): /* return type */ {}
  getCurrentState(): TState {}
  canTransition(/* parameters */): boolean {}
}

// 7.3: Create a type-safe Query Builder
interface Entity {
  id: number;
}

class QueryBuilder<T extends Entity> {
  constructor(private entity: new () => T) {}
  
  // Your implementation
  select<K extends keyof T>(...fields: K[]): /* return type */ {}
  where<K extends keyof T>(field: K, operator: '=' | '!=' | '>' | '<', value: T[K]): this {}
  orderBy<K extends keyof T>(field: K, direction?: 'ASC' | 'DESC'): this {}
  limit(count: number): this {}
  execute(): Promise<T[]> {}
}`,

      `// Exercise 8: Advanced Type Transformations
// Create sophisticated type manipulation utilities

// 8.1: Create a JSON serialization type
type Serializable<T> = /* Your implementation */
// Should convert Date to string, Function to never, etc.

// 8.2: Create a form validation schema generator
type ValidationSchema<T> = /* Your implementation */
// Should generate validation rules for each property

// 8.3: Create an API client type generator
interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  params?: Record<string, any>;
  body?: any;
  response: any;
}

type ApiClient<Endpoints extends Record<string, ApiEndpoint>> = /* Your implementation */
// Should generate methods for each endpoint

// 8.4: Create a database model type
interface Model {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

type Repository<T extends Model> = /* Your implementation */
// Should generate CRUD operations

// 8.5: Create a type-safe CSS-in-JS system
type CSSProperties = /* Your implementation */
type StyleSheet<T extends Record<string, CSSProperties>> = /* Your implementation */

const styles = createStyleSheet({
  button: {
    backgroundColor: 'blue',
    color: 'white',
    padding: '10px'
  },
  input: {
    border: '1px solid gray',
    borderRadius: '4px'
  }
});`,

      `// Exercise 9: Meta-programming with Generics
// Advanced patterns for library and framework development

// 9.1: Create a Dependency Injection Container
interface ServiceDefinition<T = any> {
  factory: (...deps: any[]) => T;
  dependencies?: string[];
  singleton?: boolean;
}

type ServiceRegistry = Record<string, ServiceDefinition>;

class DIContainer<Registry extends ServiceRegistry> {
  // Your implementation
  register<K extends string, T>(
    key: K,
    definition: ServiceDefinition<T>
  ): /* return type */ {}
  
  get<K extends keyof Registry>(key: K): /* return type */ {}
  
  resolve<T>(dependencies: string[]): any[] {}
}

// 9.2: Create a Plugin System
interface Plugin<TName extends string, TApi = {}, TConfig = {}> {
  name: TName;
  api?: TApi;
  config?: TConfig;
  init?: (context: PluginContext) => void;
}

type PluginRegistry<Plugins extends Plugin<any, any, any>[]> = /* Your implementation */

class PluginManager<Plugins extends Plugin<any, any, any>[]> {
  // Your implementation
  register<P extends Plugin<any, any, any>>(plugin: P): /* return type */ {}
  getPlugin<Name extends string>(name: Name): /* return type */ {}
  init(): Promise<void> {}
}

// 9.3: Create a Type-safe ORM
interface TableDefinition {
  [columnName: string]: {
    type: 'string' | 'number' | 'boolean' | 'date';
    nullable?: boolean;
    primary?: boolean;
    unique?: boolean;
  };
}

type InferModelType<T extends TableDefinition> = /* Your implementation */

class Table<T extends TableDefinition> {
  constructor(private definition: T) {}
  
  // Your implementation
  find(): QueryBuilder<InferModelType<T>> {}
  create(data: /* type */): Promise<InferModelType<T>> {}
  update(id: number, data: /* type */): Promise<InferModelType<T>> {}
  delete(id: number): Promise<boolean> {}
}`,
    ],

    expert: [
      `// Exercise 10: Type-level Programming Challenges
      // Push TypeScript's type system to its limits

      // 10.1: Create a type-level calculator
      type Add<A extends number, B extends number> = /* Your implementation */
      type Subtract<A extends number, B extends number> = /* Your implementation */
      type Multiply<A extends number, B extends number> = /* Your implementation */
      
      // Test cases:
      type Test1 = Add<5, 3>;        // Should be 8
      type Test2 = Multiply<4, 6>;   // Should be 24
      type Test3 = Subtract<10, 3>;  // Should be 7

      // 10.2: Create a type-level parser
      type ParseExpression<S extends string> = /* Your implementation */
      
      type Parsed1 = ParseExpression<"1 + 2 * 3">; // Should parse into AST
      type Parsed2 = ParseExpression<"(4 + 5) * 2">; // Should handle parentheses

      // 10.3: Create a type-level interpreter
      type Evaluate<AST, Variables extends Record<string, number> = {}> = /* Your implementation */
      
      type Result1 = Evaluate<Parsed1>; // Should be 7
      type Result2 = Evaluate<Parsed2>; // Should be 18

      // 10.4: Create a type-level SQL query engine
      type ExecuteSQL<
        Query extends string,
        Schema extends Record<string, any[]>
      > = /* Your implementation */

      type Users = Array<{ id: number; name: string; age: number }>;
      type Posts = Array<{ id: number; title: string; userId: number }>;
      
      type Schema = {
        users: Users;
        posts: Posts;
      };
      
      type QueryResult = ExecuteSQL<
        "SELECT users.name, posts.title FROM users JOIN posts ON users.id = posts.userId WHERE users.age > 25",
        Schema
      >;

      // 10.5: Create a type-level regular expression engine
      type RegexMatch<Pattern extends string, Input extends string> = /* Your implementation */
      
      type EmailMatch = RegexMatch<"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", "user@example.com">;
      // Should return match groups

      // 10.6: Create a type-level template engine
      type RenderTemplate<
        Template extends string,
        Context extends Record<string, any>
      > = /* Your implementation */
      
      type Rendered = RenderTemplate<
        "Hello {{name}}, you have {{count}} messages",
        { name: "John"; count: 5 }
      >; // Should be "Hello John, you have 5 messages"

      // 10.7: Create a type-level graph traversal algorithm
      type Graph<T extends string> = Record<T, T[]>;
      
      type FindPath<
        G extends Graph<any>,
        Start extends keyof G,
        End extends keyof G
      > = /* Your implementation */
      
      type TestGraph = {
        A: ["B", "C"];
        B: ["D"];
        C: ["D"];
        D: ["E"];
        E: [];
      };
      
      type Path = FindPath<TestGraph, "A", "E">; // Should find a path`,

      `// Exercise 11: Real-world Framework Development
      // Build complete type-safe frameworks

      // 11.1: Create a React-like component system
      interface ComponentProps {
        [key: string]: any;
      }
      
      type Component<P extends ComponentProps = {}> = (props: P) => VNode;
      
      interface VNode {
        type: string | Component<any>;
        props: ComponentProps;
        children?: VNode[];
      }
      
      // Your implementation for JSX-like syntax support
      declare function createElement<P extends ComponentProps>(
        type: string | Component<P>,
        props: P | null,
        ...children: VNode[]
      ): VNode;

      // 11.2: Create a type-safe router system
      type RouteParams<Path extends string> = /* Your implementation */
      // Should extract :param from "/users/:id/posts/:postId"
      
      interface RouteDefinition<Path extends string> {
        path: Path;
        component: Component<{ params: RouteParams<Path> }>;
        guards?: Array<(params: RouteParams<Path>) => boolean>;
      }
      
      class Router<Routes extends Record<string, RouteDefinition<any>>> {
        // Your implementation
        register<Name extends string, Path extends string>(
          name: Name,
          route: RouteDefinition<Path>
        ): Router<Routes & Record<Name, RouteDefinition<Path>>> {}
        
        navigate<Name extends keyof Routes>(
          name: Name,
          params: /* infer from route */
        ): void {}
      }

      // 11.3: Create a type-safe state management system
      interface Action<Type extends string = string, Payload = any> {
        type: Type;
        payload?: Payload;
      }
      
      type Reducer<State, Actions extends Action> = (
        state: State,
        action: Actions
      ) => State;
      
      class Store<State, Actions extends Action> {
        // Your implementation
        constructor(
          private reducer: Reducer<State, Actions>,
          private initialState: State
        ) {}
        
        dispatch(action: Actions): void {}
        getState(): State {}
        subscribe(listener: (state: State) => void): () => void {}
      }

      // 11.4: Create a type-safe form validation library
      interface FieldValidation<T> {
        required?: boolean;
        validators?: Array<(value: T) => string | null>;
        transform?: (value: any) => T;
      }
      
      type FormSchema<T extends Record<string, any>> = {
        [K in keyof T]: FieldValidation<T[K]>;
      };
      
      type FormState<T extends Record<string, any>> = {
        values: T;
        errors: Partial<Record<keyof T, string>>;
        touched: Partial<Record<keyof T, boolean>>;
        isValid: boolean;
      };
      
      class FormValidator<T extends Record<string, any>> {
        // Your implementation
        constructor(private schema: FormSchema<T>) {}
        
        validate(values: Partial<T>): FormState<T> {}
        validateField<K extends keyof T>(field: K, value: T[K]): string | null {}
      }`,
    ],
  },

  solutions: [
    `// Solutions for Exercise 1: Basic Generic Functions

// 1.1: Generic identity function
function identity<T>(value: T): T {
  return value;
}

// 1.2: Generic swap function
function swap<T>(arr: T[], i: number, j: number): T[] {
  const result = [...arr];
  [result[i], result[j]] = [result[j], result[i]];
  return result;
}

// 1.3: Generic first function
function first<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[0] : undefined;
}

// 1.4: Generic last function  
function last<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

// 1.5: Generic pair function
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}`,

    `// Solutions for Exercise 2: Generic Classes

// 2.1: Generic Box class
class Box<T> {
  constructor(private value: T) {}
  
  getValue(): T {
    return this.value;
  }
  
  setValue(value: T): void {
    this.value = value;
  }
  
  map<U>(fn: (value: T) => U): Box<U> {
    return new Box(fn(this.value));
  }
}

// 2.2: Generic Stack class
class Stack<T> {
  private items: T[] = [];
  
  push(item: T): void {
    this.items.push(item);
  }
  
  pop(): T | undefined {
    return this.items.pop();
  }
  
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  size(): number {
    return this.items.length;
  }
}

// 2.3: Generic Queue class
class Queue<T> {
  private items: T[] = [];
  
  enqueue(item: T): void {
    this.items.push(item);
  }
  
  dequeue(): T | undefined {
    return this.items.shift();
  }
  
  front(): T | undefined {
    return this.items[0];
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  size(): number {
    return this.items.length;
  }
}`,

    `// Solutions for Exercise 4: Conditional Types and Mapped Types

// 4.1: OptionalStrings type
type OptionalStrings<T> = {
  [K in keyof T]: T[K] extends string ? T[K] | undefined : T[K];
} & {
  [K in keyof T as T[K] extends string ? K : never]?: T[K];
} & {
  [K in keyof T as T[K] extends string ? never : K]: T[K];
};

// Simplified version:
type OptionalStrings<T> = {
  [K in keyof T]: T[K] extends string ? T[K] | undefined : T[K];
};

// Better version with proper optional modifier:
type OptionalStrings<T> = Omit<T, {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T]> & {
  [K in keyof T as T[K] extends string ? K : never]?: T[K];
};

// 4.2: FunctionPropertyNames type
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

// 4.3: AsyncMethods type
type AsyncMethods<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? (...args: P) => Promise<R>
    : T[K];
};

// 4.4: DeepReadonly type
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? T[P] extends any[]
      ? readonly DeepReadonly<T[P][number]>[]
      : DeepReadonly<T[P]>
    : T[P];
};`,
  ],

  keyPoints: [
    "Start with simple generic functions before moving to complex type transformations",
    "Practice constraints early - they're fundamental to useful generic code",
    "Build generic classes step by step, starting with basic containers",
    "Master conditional types - they're the key to advanced type manipulation",
    "Understand mapped types for transforming object structures",
    "Practice utility type creation to build reusable type transformations",
    "Work with real-world scenarios like form validation and API clients",
    "Challenge yourself with type-level programming for deeper understanding",
    "Focus on type safety and developer experience in your solutions",
    "Remember that generics should make code more flexible, not more complex"
  ]
};