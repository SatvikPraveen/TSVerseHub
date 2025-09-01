// File location: src/data/concepts/generics/generic-functions.ts

export interface GenericFunctionsContent {
  title: string;
  description: string;
  codeExamples: {
    basic: string;
    constraints: string;
    multiple: string;
    inference: string;
    advanced: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const genericFunctionsContent: GenericFunctionsContent = {
  title: "Generic Functions",
  description: "Generic functions allow you to write reusable code that works with multiple types while maintaining type safety. They use type parameters to create flexible, type-safe functions.",
  
  codeExamples: {
    basic: `// Basic generic function syntax
// The type parameter T can be any type
function identity<T>(arg: T): T {
  return arg;
}

// Usage - TypeScript can infer the type
const stringResult = identity("hello");        // Type: string  
const numberResult = identity(42);             // Type: number
const booleanResult = identity(true);          // Type: boolean

// Explicit type specification
const explicitString = identity<string>("hello"); // Type: string
const explicitNumber = identity<number>(42);       // Type: number

// Generic function with array
function getFirst<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

const firstString = getFirst(["a", "b", "c"]);    // Type: string | undefined
const firstNumber = getFirst([1, 2, 3]);          // Type: number | undefined
const firstBoolean = getFirst([true, false]);     // Type: boolean | undefined

// Generic function with multiple parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const stringNumberPair = pair("hello", 42);       // Type: [string, number]
const numberBooleanPair = pair(123, true);        // Type: [number, boolean]

// Generic function with optional parameters
function createArray<T>(item: T, count: number = 1): T[] {
  return Array(count).fill(item);
}

const strings = createArray("hello", 3);          // Type: string[]
const numbers = createArray(42);                  // Type: number[]

// Generic function with rest parameters
function combine<T>(...items: T[]): T[] {
  return items;
}

const combined = combine("a", "b", "c");          // Type: string[]
const mixedNumbers = combine(1, 2, 3, 4);         // Type: number[]

// Generic function with callbacks
function map<T, U>(array: T[], callback: (item: T) => U): U[] {
  const result: U[] = [];
  for (const item of array) {
    result.push(callback(item));
  }
  return result;
}

const strings = ["1", "2", "3"];
const numbers = map(strings, str => parseInt(str)); // Type: number[]
const lengths = map(strings, str => str.length);    // Type: number[]

// Generic function with conditional return type
function processValue<T>(
  value: T, 
  processor?: (val: T) => string
): T | string {
  return processor ? processor(value) : value;
}

const processed1 = processValue(42);                    // Type: number | string
const processed2 = processValue(42, n => n.toString()); // Type: number | string`,

    constraints: `// Generic constraints limit what types can be used
// T extends U means T must be assignable to U

// Basic constraint - T must have a length property
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

const stringLength = getLength("hello");        // Works: string has length
const arrayLength = getLength([1, 2, 3]);      // Works: array has length
// const numberLength = getLength(123);        // Error: number doesn't have length

// Constraint with keyof - K must be a key of T
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "John", age: 30, city: "NYC" };
const name = getProperty(person, "name");       // Type: string
const age = getProperty(person, "age");         // Type: number
// const invalid = getProperty(person, "height"); // Error: "height" is not a key

// Multiple constraints
interface Identifiable {
  id: number;
}

interface Nameable {
  name: string;
}

function updateEntity<T extends Identifiable & Nameable>(
  entity: T,
  updates: Partial<T>
): T {
  return { ...entity, ...updates };
}

const user = { id: 1, name: "John", email: "john@example.com" };
const updated = updateEntity(user, { name: "Jane" }); // Type preserves all properties

// Constraint with conditional types
function stringify<T extends string | number | boolean>(value: T): string {
  return String(value);
}

const str1 = stringify("hello");    // Works
const str2 = stringify(42);         // Works  
const str3 = stringify(true);       // Works
// const str4 = stringify({});      // Error: object doesn't extend string | number | boolean

// Constraint with function signature
function executeCallback<T extends (...args: any[]) => any>(
  callback: T,
  ...args: Parameters<T>
): ReturnType<T> {
  return callback(...args);
}

const add = (a: number, b: number) => a + b;
const result = executeCallback(add, 5, 3); // Type: number

// Constraint with class constructor
function createInstance<T extends new (...args: any[]) => any>(
  constructor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new constructor(...args);
}

class User {
  constructor(public name: string, public age: number) {}
}

const user = createInstance(User, "John", 30); // Type: User

// Constraint with specific methods
interface Comparable<T> {
  compareTo(other: T): number;
}

function sort<T extends Comparable<T>>(items: T[]): T[] {
  return items.sort((a, b) => a.compareTo(b));
}

class Version implements Comparable<Version> {
  constructor(private version: string) {}
  
  compareTo(other: Version): number {
    return this.version.localeCompare(other.version);
  }
}

const versions = [new Version("1.2.0"), new Version("1.1.0"), new Version("2.0.0")];
const sorted = sort(versions); // Type: Version[]`,

    multiple: `// Functions with multiple generic type parameters

// Two independent type parameters
function swap<T, U>(a: T, b: U): [U, T] {
  return [b, a];
}

const swapped = swap("hello", 42); // Type: [number, string]

// Multiple parameters with relationships
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const merged = merge({ name: "John" }, { age: 30 }); // Type: { name: string } & { age: number }

// Three type parameters with constraints
function transform<T, U, V>(
  input: T,
  mapper: (item: T) => U,
  formatter: (item: U) => V
): V {
  return formatter(mapper(input));
}

const result = transform(
  "hello",
  str => str.length,      // string -> number
  len => len.toString()   // number -> string
); // Type: string

// Generic with default type parameters
function createPair<T = string, U = T>(first: T, second: U): [T, U] {
  return [first, second];
}

const defaultPair = createPair("a", "b");           // Type: [string, string]
const explicitPair = createPair<number, string>(1, "b"); // Type: [number, string]
const partialPair = createPair<number>(1, 2);      // Type: [number, number]

// Conditional type parameters
function processData<
  T,
  U = T extends string ? string[] : T extends number ? number[] : unknown[]
>(data: T): U {
  if (typeof data === "string") {
    return [data] as U;
  }
  if (typeof data === "number") {
    return [data] as U;
  }
  return [data] as U;
}

const stringArray = processData("hello");   // Type: string[]
const numberArray = processData(42);        // Type: number[]

// Variadic generic parameters (TypeScript 4.0+)
function concat<T extends readonly unknown[]>(...arrays: T[]): T[number][] {
  return arrays.flat();
}

const combined = concat([1, 2], [3, 4], [5, 6]); // Type: number[]

// Complex multiple generics with constraints
function createMap<K extends string | number | symbol, V, T extends Record<K, V>>(
  keys: K[],
  getValue: (key: K) => V
): T {
  const result = {} as T;
  for (const key of keys) {
    (result as any)[key] = getValue(key);
  }
  return result;
}

const numberMap = createMap(
  ["a", "b", "c"] as const,
  key => key.length
); // Creates { a: number, b: number, c: number }

// Higher-order function with multiple generics
function createComparator<T, U>(
  keyExtractor: (item: T) => U,
  comparer?: (a: U, b: U) => number
): (a: T, b: T) => number {
  const defaultComparer = (a: U, b: U): number => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };
  
  const compareFunc = comparer || defaultComparer;
  
  return (a: T, b: T) => compareFunc(keyExtractor(a), keyExtractor(b));
}

interface Person {
  name: string;
  age: number;
}

const people: Person[] = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 }
];

const sortByAge = createComparator((person: Person) => person.age);
const sortedByAge = people.sort(sortByAge); // Sorted by age`,

    inference: `// Type inference in generic functions
// TypeScript can often infer generic types from usage

// Basic inference from arguments
function wrapInArray<T>(item: T): T[] {
  return [item];
}

// TypeScript infers T as string
const stringArray = wrapInArray("hello");
// TypeScript infers T as number  
const numberArray = wrapInArray(42);

// Inference from return type context
function getValue<T>(): T {
  return {} as T;
}

// TypeScript infers T as string from the assignment
const stringValue: string = getValue();
// TypeScript infers T as number from the assignment
const numberValue: number = getValue();

// Inference with object literals
function createObject<T>(props: T): T {
  return props;
}

// TypeScript infers the complete object type
const user = createObject({
  name: "John",
  age: 30,
  active: true
}); // Type: { name: string; age: number; active: boolean }

// Inference with array methods
const numbers = [1, 2, 3, 4, 5];

// TypeScript infers types for map callback
const doubled = numbers.map(n => n * 2);        // Type: number[]
const strings = numbers.map(n => n.toString()); // Type: string[]

// Inference with conditional types
function isArray<T>(value: T | T[]): value is T[] {
  return Array.isArray(value);
}

function processValue<T>(value: T | T[]): T[] {
  if (isArray(value)) {
    return value; // TypeScript knows this is T[]
  }
  return [value]; // TypeScript knows this is T
}

// Contextual inference with function parameters
function processItems<T>(
  items: T[],
  processor: (item: T, index: number) => void
): void {
  items.forEach(processor);
}

processItems([1, 2, 3], (item, index) => {
  // TypeScript infers item as number, index as number
  console.log(\`Item \${item} at index \${index}\`);
});

// Inference with generic constraints
function findMax<T extends { valueOf(): number }>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  
  return items.reduce((max, current) => 
    current.valueOf() > max.valueOf() ? current : max
  );
}

const maxNumber = findMax([1, 5, 3, 9, 2]); // Type: number | undefined
const maxDate = findMax([
  new Date('2023-01-01'), 
  new Date('2023-06-01'), 
  new Date('2023-03-01')
]); // Type: Date | undefined

// Partial type inference
function createUpdater<T>() {
  return function<K extends keyof T>(obj: T, key: K, value: T[K]): T {
    return { ...obj, [key]: value };
  };
}

// T is inferred from usage
const userUpdater = createUpdater<{ name: string; age: number }>();
const updatedUser = userUpdater({ name: "John", age: 30 }, "name", "Jane");

// Inference with overloaded functions
function combine<T>(a: T, b: T): T;
function combine<T>(items: T[]): T[];
function combine<T>(a: T | T[], b?: T): T | T[] {
  if (Array.isArray(a)) {
    return a;
  }
  if (b !== undefined) {
    return b; // Returns the second argument in this implementation
  }
  return a;
}

const combined1 = combine("a", "b");     // Type: string
const combined2 = combine([1, 2, 3]);    // Type: number[]

// Inference with recursive types
function flatten<T>(arr: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

const flattened = flatten([1, [2, 3], [4, [5, 6]]]); // Type: number[]`,

    advanced: `// Advanced generic function patterns

// Curried functions with generics
function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

const add = (a: number, b: number) => a + b;
const curriedAdd = curry(add);
const addFive = curriedAdd(5);
const result = addFive(3); // 8

// Generic function composition
function compose<A, B, C>(f: (b: B) => C, g: (a: A) => B): (a: A) => C {
  return (a: A) => f(g(a));
}

const toString = (n: number): string => n.toString();
const double = (n: number): number => n * 2;
const doubleAndStringify = compose(toString, double);
const result = doubleAndStringify(21); // "42"

// Pipeline function with multiple stages
function pipe<T>(initial: T): {
  to<U>(fn: (input: T) => U): { to<V>(fn: (input: U) => V): { to<W>(fn: (input: V) => W): W } };
};
function pipe<T>(initial: T) {
  return {
    to<U>(fn: (input: T) => U) {
      const result = fn(initial);
      return {
        to<V>(fn2: (input: U) => V) {
          const result2 = fn2(result);
          return {
            to<W>(fn3: (input: V) => W): W {
              return fn3(result2);
            }
          };
        }
      };
    }
  };
}

const pipelineResult = pipe("123")
  .to(parseInt)
  .to(n => n * 2)
  .to(n => n.toString()); // "246"

// Generic memoization function
function memoize<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  keyGenerator?: (...args: TArgs) => string
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>();
  const generateKey = keyGenerator || ((...args) => JSON.stringify(args));
  
  return (...args: TArgs): TReturn => {
    const key = generateKey(...args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalculation = (n: number): number => {
  console.log(\`Calculating for \${n}\`);
  return n * n;
};

const memoizedCalculation = memoize(expensiveCalculation);
console.log(memoizedCalculation(5)); // Logs "Calculating for 5", returns 25
console.log(memoizedCalculation(5)); // Returns 25 from cache

// Generic retry function with exponential backoff
async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  throw lastError!;
}

// Usage
const unstableApiCall = async (): Promise<{ data: string }> => {
  if (Math.random() < 0.7) {
    throw new Error("API temporarily unavailable");
  }
  return { data: "Success!" };
};

const result = await retry(unstableApiCall, 5, 500);

// Generic event emitter
class EventEmitter<TEventMap extends Record<string, any[]>> {
  private listeners: {
    [K in keyof TEventMap]?: Array<(...args: TEventMap[K]) => void>;
  } = {};

  on<K extends keyof TEventMap>(
    event: K,
    listener: (...args: TEventMap[K]) => void
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof TEventMap>(event: K, ...args: TEventMap[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }
}

interface UserEvents {
  login: [{ userId: string; timestamp: Date }];
  logout: [{ userId: string }];
  error: [{ message: string; code: number }];
}

const userEmitter = new EventEmitter<UserEvents>();

userEmitter.on('login', (data) => {
  // data is properly typed as { userId: string; timestamp: Date }
  console.log(\`User \${data.userId} logged in at \${data.timestamp}\`);
});

userEmitter.emit('login', { userId: '123', timestamp: new Date() });

// Generic builder pattern
class QueryBuilder<T> {
  private conditions: string[] = [];
  private selectFields: (keyof T)[] = [];

  select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>> {
    this.selectFields = fields;
    return this as any;
  }

  where<K extends keyof T>(field: K, operator: string, value: T[K]): this {
    this.conditions.push(\`\${String(field)} \${operator} \${value}\`);
    return this;
  }

  build(): string {
    const select = this.selectFields.length > 0 
      ? this.selectFields.join(', ')
      : '*';
    const where = this.conditions.length > 0 
      ? \` WHERE \${this.conditions.join(' AND ')}\`
      : '';
    return \`SELECT \${select} FROM table\${where}\`;
  }
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const query = new QueryBuilder<User>()
  .select('name', 'email')
  .where('age', '>', 18)
  .where('name', 'LIKE', '%John%')
  .build();

console.log(query); // "SELECT name, email FROM table WHERE age > 18 AND name LIKE %John%"`
  },

  exercises: [
    `// Exercise 1: Generic Array Utilities
// Create generic utility functions for array operations

function unique<T>(array: T[]): T[] {
  // Your implementation here
  // Remove duplicate elements from array
}

function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  // Your implementation here
  // Group array elements by a key function
}

function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  // Your implementation here
  // Split array into two arrays based on predicate
}

// Test your implementations
const numbers = [1, 2, 2, 3, 3, 4, 5];
const people = [
  { name: "Alice", age: 25, city: "NYC" },
  { name: "Bob", age: 30, city: "LA" },
  { name: "Charlie", age: 25, city: "NYC" }
];

const uniqueNumbers = unique(numbers); // [1, 2, 3, 4, 5]
const groupedByAge = groupBy(people, p => p.age); // { 25: [...], 30: [...] }
const [adults, minors] = partition(people, p => p.age >= 18);`,

    `// Exercise 2: Generic Validation System
// Create a type-safe validation system using generics

interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

interface ValidationResult<T> {
  isValid: boolean;
  value: T;
  errors: string[];
}

class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): this {
    // Your implementation here
  }

  validate(value: T): ValidationResult<T> {
    // Your implementation here
  }
}

// Create helper functions for common validations
function required<T>(): ValidationRule<T> {
  // Your implementation here
}

function minLength(min: number): ValidationRule<string> {
  // Your implementation here
}

function range(min: number, max: number): ValidationRule<number> {
  // Your implementation here
}

// Test your implementation
const stringValidator = new Validator<string>()
  .addRule(required())
  .addRule(minLength(3));

const numberValidator = new Validator<number>()
  .addRule(required())
  .addRule(range(0, 100));`,

    `// Exercise 3: Generic Cache System
// Implement a generic caching system with TTL support

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache<K, V> {
  private storage = new Map<K, CacheEntry<V>>();

  set(key: K, value: V, ttlMs: number = 60000): void {
    // Your implementation here
  }

  get(key: K): V | undefined {
    // Your implementation here
    // Return undefined if expired or not found
  }

  has(key: K): boolean {
    // Your implementation here
  }

  delete(key: K): boolean {
    // Your implementation here
  }

  clear(): void {
    // Your implementation here
  }

  cleanup(): void {
    // Your implementation here
    // Remove expired entries
  }
}

// Bonus: Create a memoization decorator using the cache
function memoizeWithTTL<TArgs extends any[], TReturn>(
  ttlMs: number = 60000
) {
  return function(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: TArgs) => TReturn>
  ) {
    // Your implementation here
  };
}`,

    `// Exercise 4: Generic State Machine
// Create a type-safe state machine using generics

interface StateConfig<TState extends string, TEvent extends string> {
  initial: TState;
  states: Record<TState, {
    on?: Partial<Record<TEvent, TState>>;
    entry?: () => void;
    exit?: () => void;
  }>;
}

class StateMachine<TState extends string, TEvent extends string> {
  private currentState: TState;
  private config: StateConfig<TState, TEvent>;

  constructor(config: StateConfig<TState, TEvent>) {
    // Your implementation here
  }

  getCurrentState(): TState {
    // Your implementation here
  }

  send(event: TEvent): boolean {
    // Your implementation here
    // Return true if transition was successful
  }

  canTransition(event: TEvent): boolean {
    // Your implementation here
  }
}

// Test with a simple traffic light state machine
type TrafficLightState = "red" | "yellow" | "green";
type TrafficLightEvent = "timer" | "emergency";

const trafficLight = new StateMachine<TrafficLightState, TrafficLightEvent>({
  initial: "red",
  states: {
    red: {
      on: { timer: "green" },
      entry: () => console.log("Stop!")
    },
    yellow: {
      on: { timer: "red" },
      entry: () => console.log("Caution!")
    },
    green: {
      on: { timer: "yellow", emergency: "red" },
      entry: () => console.log("Go!")
    }
  }
});`,

    `// Exercise 5: Generic Repository Pattern
// Implement a generic repository pattern for data access

interface Entity {
  id: string | number;
}

interface Repository<T extends Entity> {
  create(entity: Omit<T, 'id'>): Promise<T>;
  findById(id: T['id']): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: T['id'], updates: Partial<T>): Promise<T | null>;
  delete(id: T['id']): Promise<boolean>;
  findWhere(predicate: (entity: T) => boolean): Promise<T[]>;
}

class InMemoryRepository<T extends Entity> implements Repository<T> {
  private data: T[] = [];
  private nextId = 1;

  async create(entity: Omit<T, 'id'>): Promise<T> {
    // Your implementation here
  }

  async findById(id: T['id']): Promise<T | null> {
    // Your implementation here
  }

  async findAll(): Promise<T[]> {
    // Your implementation here
  }

  async update(id: T['id'], updates: Partial<T>): Promise<T | null> {
    // Your implementation here
  }

  async delete(id: T['id']): Promise<boolean> {
    // Your implementation here
  }

  async findWhere(predicate: (entity: T) => boolean): Promise<T[]> {
    // Your implementation here
  }
}

// Test with User entity
interface User extends Entity {
  id: number;
  name: string;
  email: string;
  age: number;
}

const userRepo = new InMemoryRepository<User>();

// Should work with proper typing
const newUser = await userRepo.create({
  name: "John",
  email: "john@example.com",
  age: 30
});`
  ],

  keyPoints: [
    "Generic functions use angle brackets <T> to define type parameters",
    "Type parameters can be constrained using the 'extends' keyword",
    "TypeScript can often infer generic types from function arguments",
    "Multiple type parameters can be used in a single function",
    "Default type parameters provide fallback types when not specified",
    "Generic constraints ensure type parameters meet specific requirements",
    "The keyof operator is commonly used with generics for type-safe property access",
    "Generic functions enable code reuse while maintaining type safety",
    "Conditional types can be used with generics for advanced type logic",
    "Generic functions are the foundation for building flexible, reusable APIs"
  ]
};

export default genericFunctionsContent;