// File location: src/data/concepts/generics/generic-classes.ts

export interface GenericClassesContent {
  title: string;
  description: string;
  codeExamples: {
    basic: string;
    constraints: string;
    inheritance: string;
    static: string;
    advanced: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const genericClassesContent: GenericClassesContent = {
  title: "Generic Classes",
  description: "Generic classes allow you to create reusable class templates that work with multiple types while maintaining type safety. They enable you to build flexible, type-safe data structures and components.",
  
  codeExamples: {
    basic: `// Basic generic class definition
// Generic type parameters are defined after the class name

class Container<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  get(index: number): T | undefined {
    return this.items[index];
  }

  getAll(): T[] {
    return [...this.items];
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }
}

// Using the generic class with different types
const stringContainer = new Container<string>();
stringContainer.add("hello");
stringContainer.add("world");
console.log(stringContainer.get(0)); // Type: string | undefined

const numberContainer = new Container<number>();
numberContainer.add(42);
numberContainer.add(100);
console.log(numberContainer.getAll()); // Type: number[]

// Type inference works too
const boolContainer = new Container<boolean>();
boolContainer.add(true);
boolContainer.add(false);

// Generic class for key-value pairs
class Pair<K, V> {
  constructor(
    public readonly key: K,
    public readonly value: V
  ) {}

  getKey(): K {
    return this.key;
  }

  getValue(): V {
    return this.value;
  }

  toString(): string {
    return \`Pair(\${this.key}, \${this.value})\`;
  }

  // Static factory method
  static of<K, V>(key: K, value: V): Pair<K, V> {
    return new Pair(key, value);
  }

  // Method with additional generic parameter
  map<U>(mapper: (value: V) => U): Pair<K, U> {
    return new Pair(this.key, mapper(this.value));
  }

  // Type guard method
  hasValueOfType<T>(type: new (...args: any[]) => T): this is Pair<K, T> {
    return this.value instanceof type;
  }
}

const stringNumberPair = new Pair("count", 42);
const userIdPair = Pair.of("userId", "12345");

const mappedPair = stringNumberPair.map(num => num.toString());
// Type: Pair<string, string>

// Generic class with default type parameters
class Stack<T = any> {
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

  toArray(): T[] {
    return [...this.items];
  }
}

const defaultStack = new Stack(); // Uses default type 'any'
const stringStack = new Stack<string>();

// Generic class implementing generic interface
interface Comparable<T> {
  compareTo(other: T): number;
}

class Version implements Comparable<Version> {
  constructor(
    private major: number,
    private minor: number,
    private patch: number
  ) {}

  compareTo(other: Version): number {
    if (this.major !== other.major) {
      return this.major - other.major;
    }
    if (this.minor !== other.minor) {
      return this.minor - other.minor;
    }
    return this.patch - other.patch;
  }

  toString(): string {
    return \`\${this.major}.\${this.minor}.\${this.patch}\`;
  }
}

// Generic class that works with comparable items
class SortedList<T extends Comparable<T>> {
  private items: T[] = [];

  add(item: T): void {
    let inserted = false;
    for (let i = 0; i < this.items.length; i++) {
      if (item.compareTo(this.items[i]) < 0) {
        this.items.splice(i, 0, item);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.items.push(item);
    }
  }

  getAll(): T[] {
    return [...this.items];
  }

  first(): T | undefined {
    return this.items[0];
  }

  last(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

const versionList = new SortedList<Version>();
versionList.add(new Version(2, 0, 0));
versionList.add(new Version(1, 5, 3));
versionList.add(new Version(2, 1, 0));

console.log(versionList.getAll().map(v => v.toString()));
// Output: ["1.5.3", "2.0.0", "2.1.0"]`,

    constraints: `// Generic classes with constraints and advanced type relationships

// Generic class with multiple constraints
interface Serializable {
  serialize(): string;
}

interface Timestamped {
  timestamp: Date;
}

class Repository<T extends Serializable & Timestamped & { id: string }> {
  private items: Map<string, T> = new Map();

  save(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  findAll(): T[] {
    return Array.from(this.items.values());
  }

  findRecentItems(sinceDate: Date): T[] {
    return this.findAll().filter(item => item.timestamp >= sinceDate);
  }

  export(): string[] {
    return this.findAll().map(item => item.serialize());
  }

  deleteById(id: string): boolean {
    return this.items.delete(id);
  }

  count(): number {
    return this.items.size;
  }
}

// Entity class that meets the repository constraints
class BlogPost implements Serializable, Timestamped {
  constructor(
    public readonly id: string,
    public title: string,
    public content: string,
    public timestamp: Date = new Date()
  ) {}

  serialize(): string {
    return JSON.stringify({
      id: this.id,
      title: this.title,
      content: this.content,
      timestamp: this.timestamp.toISOString()
    });
  }
}

const blogRepository = new Repository<BlogPost>();
const post = new BlogPost("1", "TypeScript Generics", "Content about generics...");
blogRepository.save(post);

// Generic class with keyof constraint
class PropertyAccessor<T extends Record<string, any>> {
  constructor(private obj: T) {}

  get<K extends keyof T>(key: K): T[K] {
    return this.obj[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.obj[key] = value;
  }

  has<K extends keyof T>(key: K): boolean {
    return key in this.obj;
  }

  keys(): (keyof T)[] {
    return Object.keys(this.obj) as (keyof T)[];
  }

  pick<K extends keyof T>(...keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      result[key] = this.obj[key];
    }
    return result;
  }

  omit<K extends keyof T>(...keys: K[]): Omit<T, K> {
    const result = { ...this.obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }
}

const user = { id: 1, name: "John", email: "john@example.com", age: 30 };
const accessor = new PropertyAccessor(user);

const name = accessor.get("name");        // Type: string
const nameAndEmail = accessor.pick("name", "email"); // Type: Pick<User, "name" | "email">
const withoutAge = accessor.omit("age");  // Type: Omit<User, "age">

// Generic class with conditional types and method overloading
interface AsyncOperation<T> {
  execute(): Promise<T>;
}

interface SyncOperation<T> {
  execute(): T;
}

class OperationExecutor<T, TSync extends boolean = false> {
  constructor(
    private operation: TSync extends true ? SyncOperation<T> : AsyncOperation<T>
  ) {}

  // Method overloading based on generic type
  run(): TSync extends true ? T : Promise<T> {
    return this.operation.execute() as TSync extends true ? T : Promise<T>;
  }

  // Additional methods with constraints
  runWithTimeout(
    timeoutMs: number
  ): TSync extends true ? T : Promise<T> {
    if ('then' in (this.operation.execute() as any)) {
      // Async operation
      return Promise.race([
        this.operation.execute() as Promise<T>,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
      ]) as TSync extends true ? T : Promise<T>;
    } else {
      // Sync operation
      return this.operation.execute() as TSync extends true ? T : Promise<T>;
    }
  }
}

// Usage with sync operation
const syncOp: SyncOperation<number> = {
  execute: () => 42
};
const syncExecutor = new OperationExecutor<number, true>(syncOp);
const syncResult = syncExecutor.run(); // Type: number

// Usage with async operation
const asyncOp: AsyncOperation<string> = {
  execute: async () => "hello"
};
const asyncExecutor = new OperationExecutor<string, false>(asyncOp);
const asyncResult = asyncExecutor.run(); // Type: Promise<string>

// Generic class with builder pattern
class QueryBuilder<T extends Record<string, any>> {
  private conditions: Array<(item: T) => boolean> = [];
  private sortKey?: keyof T;
  private sortDirection: 'asc' | 'desc' = 'asc';
  private limitCount?: number;

  where<K extends keyof T>(
    key: K,
    value: T[K]
  ): QueryBuilder<T> {
    this.conditions.push(item => item[key] === value);
    return this;
  }

  whereGreaterThan<K extends keyof T>(
    key: K,
    value: T[K] extends number ? T[K] : never
  ): QueryBuilder<T> {
    this.conditions.push(item => (item[key] as number) > (value as number));
    return this;
  }

  whereLessThan<K extends keyof T>(
    key: K,
    value: T[K] extends number ? T[K] : never
  ): QueryBuilder<T> {
    this.conditions.push(item => (item[key] as number) < (value as number));
    return this;
  }

  orderBy<K extends keyof T>(
    key: K,
    direction: 'asc' | 'desc' = 'asc'
  ): QueryBuilder<T> {
    this.sortKey = key;
    this.sortDirection = direction;
    return this;
  }

  limit(count: number): QueryBuilder<T> {
    this.limitCount = count;
    return this;
  }

  execute(data: T[]): T[] {
    let result = data.filter(item => 
      this.conditions.every(condition => condition(item))
    );

    if (this.sortKey) {
      result = result.sort((a, b) => {
        const aVal = a[this.sortKey!];
        const bVal = b[this.sortKey!];
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount) {
      result = result.slice(0, this.limitCount);
    }

    return result;
  }
}

// Usage
const users = [
  { id: 1, name: "John", age: 30, city: "NYC" },
  { id: 2, name: "Jane", age: 25, city: "LA" },
  { id: 3, name: "Bob", age: 35, city: "NYC" }
];

const query = new QueryBuilder<typeof users[0]>()
  .where("city", "NYC")
  .whereGreaterThan("age", 28)
  .orderBy("age", "desc")
  .limit(10);

const results = query.execute(users);
console.log(results); // [{ id: 3, name: "Bob", age: 35, city: "NYC" }, { id: 1, name: "John", age: 30, city: "NYC" }]`,

    inheritance: `// Generic class inheritance and extension patterns

// Base generic class
abstract class Collection<T> {
  protected items: T[] = [];

  abstract add(item: T): void;
  abstract remove(item: T): boolean;

  // Shared implementations
  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }

  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback);
  }

  // Generic method in base class
  map<U>(mapper: (item: T) => U): U[] {
    return this.items.map(mapper);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }
}

// Specific implementation extending generic base
class ArrayList<T> extends Collection<T> {
  add(item: T): void {
    this.items.push(item);
  }

  remove(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  get(index: number): T | undefined {
    return this.items[index];
  }

  set(index: number, item: T): void {
    if (index >= 0 && index < this.items.length) {
      this.items[index] = item;
    }
  }

  indexOf(item: T): number {
    return this.items.indexOf(item);
  }

  insert(index: number, item: T): void {
    this.items.splice(index, 0, item);
  }
}

// Another implementation with different behavior
class UniqueSet<T> extends Collection<T> {
  add(item: T): void {
    if (!this.items.includes(item)) {
      this.items.push(item);
    }
  }

  remove(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  has(item: T): boolean {
    return this.items.includes(item);
  }
}

// Generic class extending another generic class with additional type parameters
class IndexedCollection<T, K extends keyof T> extends Collection<T> {
  private index: Map<T[K], T[]> = new Map();

  constructor(private indexKey: K) {
    super();
  }

  add(item: T): void {
    this.items.push(item);
    this.addToIndex(item);
  }

  remove(item: T): boolean {
    const removed = this.removeFromArray(item);
    if (removed) {
      this.removeFromIndex(item);
    }
    return removed;
  }

  findByIndex(key: T[K]): T[] {
    return this.index.get(key) || [];
  }

  private addToIndex(item: T): void {
    const key = item[this.indexKey];
    const existing = this.index.get(key) || [];
    existing.push(item);
    this.index.set(key, existing);
  }

  private removeFromIndex(item: T): void {
    const key = item[this.indexKey];
    const existing = this.index.get(key);
    if (existing) {
      const filtered = existing.filter(x => x !== item);
      if (filtered.length === 0) {
        this.index.delete(key);
      } else {
        this.index.set(key, filtered);
      }
    }
  }

  private removeFromArray(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Usage of indexed collection
interface User {
  id: number;
  name: string;
  department: string;
}

const usersByDepartment = new IndexedCollection<User, 'department'>('department');
usersByDepartment.add({ id: 1, name: "John", department: "Engineering" });
usersByDepartment.add({ id: 2, name: "Jane", department: "Engineering" });
usersByDepartment.add({ id: 3, name: "Bob", department: "Sales" });

const engineers = usersByDepartment.findByIndex("Engineering");
console.log(engineers); // [{ id: 1, name: "John", department: "Engineering" }, ...]

// Mixin pattern with generics
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin function
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = new Date();

    getAge(): number {
      return Date.now() - this.timestamp.getTime();
    }
  };
}

function Identifiable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    id = Math.random().toString(36);

    getId(): string {
      return this.id;
    }
  };
}

// Base class
class Document {
  constructor(public title: string) {}
}

// Apply mixins
const TimestampedDocument = Timestamped(Document);
const IdentifiableDocument = Identifiable(TimestampedDocument);

class MyDocument extends IdentifiableDocument {
  constructor(title: string, public content: string) {
    super(title);
  }
}

const doc = new MyDocument("My Doc", "Content here");
console.log(doc.getId());    // From Identifiable mixin
console.log(doc.getAge());   // From Timestamped mixin
console.log(doc.title);      // From Document base
console.log(doc.content);    // From MyDocument

// Generic interface with inheritance
interface Readable<T> {
  read(): T;
}

interface Writable<T> {
  write(value: T): void;
}

interface ReadWritable<T> extends Readable<T>, Writable<T> {
  // Additional methods specific to read-write
  readWrite(transformer: (value: T) => T): T;
}

class FileHandler<T> implements ReadWritable<T> {
  constructor(
    private data: T,
    private serializer: (value: T) => string,
    private deserializer: (value: string) => T
  ) {}

  read(): T {
    return this.data;
  }

  write(value: T): void {
    this.data = value;
  }

  readWrite(transformer: (value: T) => T): T {
    const currentValue = this.read();
    const newValue = transformer(currentValue);
    this.write(newValue);
    return newValue;
  }

  serialize(): string {
    return this.serializer(this.data);
  }

  static fromSerialized<T>(
    serialized: string,
    deserializer: (value: string) => T,
    serializer: (value: T) => string
  ): FileHandler<T> {
    const data = deserializer(serialized);
    return new FileHandler(data, serializer, deserializer);
  }
}

const jsonHandler = new FileHandler(
  { name: "John", age: 30 },
  JSON.stringify,
  JSON.parse
);

const updated = jsonHandler.readWrite(user => ({ ...user, age: user.age + 1 }));
console.log(updated); // { name: "John", age: 31 }`,

    static: `// Static members in generic classes

class Utility<T> {
  // Static properties are shared across all instances regardless of generic type
  static version = "1.0.0";
  private static instanceCount = 0;

  // Static methods cannot use class generic type parameters
  static getVersion(): string {
    return Utility.version;
  }

  static getInstanceCount(): number {
    return Utility.instanceCount;
  }

  // Static method with its own generic parameters
  static identity<U>(value: U): U {
    return value;
  }

  // Static factory method with generic parameter
  static create<U>(initialValue: U): Utility<U> {
    return new Utility(initialValue);
  }

  // Static method that works with arrays of generic type
  static combine<U>(...utilities: Utility<U>[]): U[] {
    return utilities.map(u => u.getValue());
  }

  // Static method with constraints
  static serialize<U extends { toString(): string }>(value: U): string {
    return value.toString();
  }

  // Instance properties and methods
  constructor(private value: T) {
    Utility.instanceCount++;
  }

  getValue(): T {
    return this.value;
  }

  setValue(value: T): void {
    this.value = value;
  }

  // Instance method using static method
  getVersionInfo(): string {
    return \`Utility v\${Utility.getVersion()}, instance #\${Utility.getInstanceCount()}\`;
  }
}

// Usage
const stringUtil = Utility.create("hello");
const numberUtil = Utility.create(42);

console.log(Utility.getVersion()); // "1.0.0"
console.log(Utility.identity("test")); // "test"
console.log(Utility.combine(stringUtil, Utility.create("world"))); // ["hello", "world"]

// Generic class with static factory methods for different types
class Result<T, E = Error> {
  private constructor(
    private readonly isSuccess: boolean,
    private readonly value?: T,
    private readonly error?: E
  ) {}

  // Static factory methods
  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static error<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  // Static method to wrap potentially throwing operations
  static from<T, E = Error>(fn: () => T): Result<T, E> {
    try {
      const value = fn();
      return Result.ok<T, E>(value);
    } catch (error) {
      return Result.error<T, E>(error as E);
    }
  }

  // Static method to handle Promise<T>
  static async fromPromise<T, E = Error>(
    promise: Promise<T>
  ): Promise<Result<T, E>> {
    try {
      const value = await promise;
      return Result.ok<T, E>(value);
    } catch (error) {
      return Result.error<T, E>(error as E);
    }
  }

  // Static method to combine multiple results
  static all<T, E = Error>(...results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    
    for (const result of results) {
      if (result.isError()) {
        return Result.error<T[], E>(result.getError());
      }
      values.push(result.getValue());
    }
    
    return Result.ok<T[], E>(values);
  }

  // Instance methods
  isOk(): this is Result<T, E> & { getValue(): T } {
    return this.isSuccess;
  }

  isError(): this is Result<T, E> & { getError(): E } {
    return !this.isSuccess;
  }

  getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Cannot get value from error result");
    }
    return this.value!;
  }

  getError(): E {
    if (this.isSuccess) {
      throw new Error("Cannot get error from success result");
    }
    return this.error!;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isSuccess) {
      return Result.ok<U, E>(fn(this.value!));
    }
    return Result.error<U, E>(this.error!);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess) {
      return fn(this.value!);
    }
    return Result.error<U, E>(this.error!);
  }
}

// Usage
const successResult = Result.ok("hello world");
const errorResult = Result.error(new Error("Something went wrong"));

const parseResult = Result.from(() => JSON.parse('{"name": "John"}'));
const promiseResult = await Result.fromPromise(fetch('/api/data'));

const combined = Result.all(
  Result.ok(1),
  Result.ok(2),
  Result.ok(3)
);

if (combined.isOk()) {
  console.log(combined.getValue()); // [1, 2, 3]
}

// Generic singleton pattern
abstract class Singleton<T> {
  private static instances: Map<string, any> = new Map();

  protected constructor() {}

  static getInstance<U extends Singleton<any>>(
    this: new() => U
  ): U {
    const className = this.name;
    
    if (!Singleton.instances.has(className)) {
      Singleton.instances.set(className, new this());
    }
    
    return Singleton.instances.get(className) as U;
  }

  // Static method to clear all instances (useful for testing)
  static clearAllInstances(): void {
    Singleton.instances.clear();
  }

  // Abstract method that must be implemented by subclasses
  abstract process(data: T): T;
}

class DatabaseConnection extends Singleton<string> {
  private connectionString = "";

  setConnectionString(cs: string): void {
    this.connectionString = cs;
  }

  process(query: string): string {
    return \`Executing: \${query} on \${this.connectionString}\`;
  }
}

class CacheManager extends Singleton<Record<string, any>> {
  private cache: Map<string, any> = new Map();

  process(data: Record<string, any>): Record<string, any> {
    // Process and cache data
    for (const [key, value] of Object.entries(data)) {
      this.cache.set(key, value);
    }
    return data;
  }

  get(key: string): any {
    return this.cache.get(key);
  }
}

// Usage
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true - same instance

const cache1 = CacheManager.getInstance();
const cache2 = CacheManager.getInstance();
console.log(cache1 === cache2); // true - same instance`,

    advanced: `// Advanced generic class patterns and techniques

// Generic class with phantom types for type safety
type Phantom<T, P> = T & { readonly __phantom: P };

type UserId = Phantom<string, "UserId">;
type ProductId = Phantom<string, "ProductId">;
type OrderId = Phantom<string, "OrderId">;

class EntityManager<TId extends Phantom<string, any>, TEntity> {
  private entities: Map<TId, TEntity> = new Map();

  create(id: TId, entity: TEntity): void {
    this.entities.set(id, entity);
  }

  findById(id: TId): TEntity | undefined {
    return this.entities.get(id);
  }

  update(id: TId, updates: Partial<TEntity>): void {
    const entity = this.entities.get(id);
    if (entity) {
      Object.assign(entity, updates);
    }
  }

  delete(id: TId): boolean {
    return this.entities.delete(id);
  }

  // Type-safe relationship method
  relateToOrder<TOtherId extends OrderId>(
    entityId: TId,
    orderId: TOtherId
  ): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      (entity as any).orderId = orderId;
    }
  }
}

// Usage with phantom types
const userManager = new EntityManager<UserId, { name: string; email: string }>();
const productManager = new EntityManager<ProductId, { name: string; price: number }>();

const userId = "user-123" as UserId;
const productId = "prod-456" as ProductId;

userManager.create(userId, { name: "John", email: "john@example.com" });
// productManager.create(userId, { name: "Widget", price: 29.99 }); // Error: wrong ID type

// Generic class with fluent interface and method chaining
class FluentValidator<T extends Record<string, any>> {
  private rules: Array<(obj: T) => string | null> = [];

  // Rule builders return 'this' for chaining
  required<K extends keyof T>(field: K, message?: string): this {
    this.rules.push(obj => {
      if (obj[field] == null || obj[field] === '') {
        return message || \`\${String(field)} is required\`;
      }
      return null;
    });
    return this;
  }

  minLength<K extends keyof T>(
    field: K,
    min: number,
    message?: string
  ): this {
    this.rules.push(obj => {
      const value = obj[field];
      if (typeof value === 'string' && value.length < min) {
        return message || \`\${String(field)} must be at least \${min} characters\`;
      }
      return null;
    });
    return this;
  }

  email<K extends keyof T>(field: K, message?: string): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.rules.push(obj => {
      const value = obj[field];
      if (typeof value === 'string' && !emailRegex.test(value)) {
        return message || \`\${String(field)} must be a valid email\`;
      }
      return null;
    });
    return this;
  }

  custom(rule: (obj: T) => string | null): this {
    this.rules.push(rule);
    return this;
  }

  // Terminal method that executes validation
  validate(obj: T): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const rule of this.rules) {
      const error = rule(obj);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Static factory method
  static for<T extends Record<string, any>>(): FluentValidator<T> {
    return new FluentValidator<T>();
  }
}

// Generic class with template method pattern
abstract class DataAnalyzer<T> {
  // Template method defining the algorithm structure
  public analyze(data: T[]): AnalysisResult<T> {
    const preprocessed = this.preprocess(data);
    const processed = this.processData(preprocessed);
    const results = this.generateResults(processed);
    const formatted = this.formatResults(results);
    
    return {
      originalDataSize: data.length,
      processedDataSize: processed.length,
      results: formatted,
      timestamp: new Date()
    };
  }

  // Abstract methods that subclasses must implement
  protected abstract preprocess(data: T[]): T[];
  protected abstract processData(data: T[]): ProcessedData<T>[];
  protected abstract generateResults(data: ProcessedData<T>[]): any;

  // Hook method with default implementation
  protected formatResults(results: any): any {
    return results;
  }
}

interface ProcessedData<T> {
  original: T;
  processed: any;
}

interface AnalysisResult<T> {
  originalDataSize: number;
  processedDataSize: number;
  results: any;
  timestamp: Date;
}

class NumberAnalyzer extends DataAnalyzer<number> {
  protected preprocess(data: number[]): number[] {
    // Remove outliers
    return data.filter(n => n >= 0 && n <= 1000);
  }

  protected processData(data: number[]): ProcessedData<number>[] {
    return data.map(n => ({
      original: n,
      processed: {
        squared: n * n,
        sqrt: Math.sqrt(n),
        log: Math.log(n)
      }
    }));
  }

  protected generateResults(data: ProcessedData<number>[]): any {
    const values = data.map(d => d.original);
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }
}

const numberAnalyzer = new NumberAnalyzer();
const analysisResult = numberAnalyzer.analyze([1, 2, 3, 4, 5, 1500, -10]);

// Generic class with visitor pattern
interface Visitor<T> {
  visit(item: T): void;
}

abstract class Visitable<T> {
  abstract accept(visitor: Visitor<T>): void;
}

class DataNode<T> extends Visitable<T> {
  constructor(
    public value: T,
    public children: DataNode<T>[] = []
  ) {
    super();
  }

  accept(visitor: Visitor<T>): void {
    visitor.visit(this.value);
    for (const child of this.children) {
      child.accept(visitor);
    }
  }

  addChild(child: DataNode<T>): void {
    this.children.push(child);
  }
}

class LoggingVisitor<T> implements Visitor<T> {
  private logs: T[] = [];

  visit(item: T): void {
    this.logs.push(item);
    console.log('Visiting:', item);
  }

  getLogs(): T[] {
    return [...this.logs];
  }
}

// Usage
const root = new DataNode('root');
const child1 = new DataNode('child1');
const child2 = new DataNode('child2');
root.addChild(child1);
root.addChild(child2);

const loggingVisitor = new LoggingVisitor<string>();
root.accept(loggingVisitor);
console.log('Visited nodes:', loggingVisitor.getLogs()); // ['root', 'child1', 'child2']`
  },

  exercises: [
    `// Exercise 1: Generic Cache System
// Create a comprehensive caching system with different eviction strategies

interface CacheEntry<V> {
  value: V;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

abstract class Cache<K, V> {
  protected storage: Map<K, CacheEntry<V>> = new Map();
  protected maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  abstract evict(): void;

  get(key: K): V | undefined {
    const entry = this.storage.get(key);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      return entry.value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.storage.size >= this.maxSize && !this.storage.has(key)) {
      this.evict();
    }

    const now = Date.now();
    this.storage.set(key, {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    });
  }

  delete(key: K): boolean {
    return this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  size(): number {
    return this.storage.size;
  }

  keys(): K[] {
    return Array.from(this.storage.keys());
  }

  // Additional methods to implement
  abstract getStats(): CacheStats;
  abstract cleanup(): void;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  evictionCount: number;
}

// Implement these cache strategies:
// 1. LRUCache - Least Recently Used eviction
// 2. LFUCache - Least Frequently Used eviction  
// 3. TTLCache - Time To Live based eviction
// 4. FIFOCache - First In First Out eviction

// Also create a CacheManager class that can manage multiple caches
class CacheManager<K, V> {
  private caches: Map<string, Cache<K, V>> = new Map();

  registerCache(name: string, cache: Cache<K, V>): void {
    // Implementation here
  }

  getCache(name: string): Cache<K, V> | undefined {
    // Implementation here
  }

  getAllStats(): Map<string, CacheStats> {
    // Implementation here
  }
}`,

    `// Exercise 2: Generic State Machine
// Build a type-safe finite state machine with generic states and events

interface State<TState extends string> {
  name: TState;
  onEnter?: () => void;
  onExit?: () => void;
  onUpdate?: (deltaTime: number) => void;
}

interface Transition<TState extends string, TEvent extends string> {
  from: TState;
  to: TState;
  event: TEvent;
  guard?: () => boolean;
  action?: () => void;
}

interface StateMachineConfig<TState extends string, TEvent extends string> {
  initialState: TState;
  states: State<TState>[];
  transitions: Transition<TState, TEvent>[];
}

class StateMachine<TState extends string, TEvent extends string> {
  private currentState: TState;
  private states: Map<TState, State<TState>>;
  private transitions: Map<TState, Map<TEvent, Transition<TState, TEvent>>>;
  private eventQueue: TEvent[] = [];
  private isProcessing = false;

  constructor(config: StateMachineConfig<TState, TEvent>) {
    // Initialize the state machine
    // Implementation here
  }

  getCurrentState(): TState {
    return this.currentState;
  }

  sendEvent(event: TEvent): boolean {
    // Process the event and potentially transition states
    // Implementation here
  }

  canTransition(event: TEvent): boolean {
    // Check if transition is possible from current state
    // Implementation here
  }

  update(deltaTime: number): void {
    // Update current state and process queued events
    // Implementation here
  }

  // Add methods for:
  // - Getting available events for current state
  // - State history tracking
  // - Event listeners/observers
  // - Serialization/deserialization
}

// Example usage types:
type PlayerState = "idle" | "walking" | "running" | "jumping" | "falling";
type PlayerEvent = "walk" | "run" | "jump" | "land" | "stop";

// Create a player state machine with proper typing`,

    `// Exercise 3: Generic Repository Pattern with Query Builder
// Create a complete repository system with type-safe querying

interface Entity {
  id: string;
}

interface QueryOperator<T> {
  equals(value: T): QueryCondition<T>;
  notEquals(value: T): QueryCondition<T>;
  in(values: T[]): QueryCondition<T>;
  notIn(values: T[]): QueryCondition<T>;
}

interface NumberQueryOperator<T extends number> extends QueryOperator<T> {
  greaterThan(value: T): QueryCondition<T>;
  lessThan(value: T): QueryCondition<T>;
  between(min: T, max: T): QueryCondition<T>;
}

interface StringQueryOperator<T extends string> extends QueryOperator<T> {
  contains(substring: string): QueryCondition<T>;
  startsWith(prefix: string): QueryCondition<T>;
  endsWith(suffix: string): QueryCondition<T>;
  matches(pattern: RegExp): QueryCondition<T>;
}

interface QueryCondition<T> {
  field: string;
  operator: string;
  value: T | T[];
}

class Query<TEntity extends Entity> {
  private conditions: QueryCondition<any>[] = [];
  private sortField?: keyof TEntity;
  private sortDirection: 'asc' | 'desc' = 'asc';
  private limitValue?: number;
  private offsetValue?: number;

  // Implement fluent query interface
  where<K extends keyof TEntity>(
    field: K
  ): TEntity[K] extends number
    ? NumberQueryOperator<TEntity[K]>
    : TEntity[K] extends string
    ? StringQueryOperator<TEntity[K]>
    : QueryOperator<TEntity[K]> {
    // Implementation here
  }

  and(): Query<TEntity> {
    // Implementation here
  }

  or(): Query<TEntity> {
    // Implementation here
  }

  orderBy<K extends keyof TEntity>(
    field: K,
    direction?: 'asc' | 'desc'
  ): Query<TEntity> {
    // Implementation here
  }

  limit(count: number): Query<TEntity> {
    // Implementation here
  }

  offset(count: number): Query<TEntity> {
    // Implementation here
  }

  build(): CompiledQuery<TEntity> {
    // Implementation here
  }
}

interface CompiledQuery<TEntity extends Entity> {
  conditions: QueryCondition<any>[];
  sorting?: { field: keyof TEntity; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

abstract class Repository<TEntity extends Entity> {
  protected abstract storage: Map<string, TEntity>;

  abstract find(query: Query<TEntity>): Promise<TEntity[]>;
  abstract findById(id: string): Promise<TEntity | undefined>;
  abstract save(entity: TEntity): Promise<void>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(query?: Query<TEntity>): Promise<number>;

  // Implement additional methods:
  // - Batch operations
  // - Transactions
  // - Indexing support
  // - Event hooks (beforeSave, afterDelete, etc.)
}

// Create concrete implementations:
// - InMemoryRepository<T>
// - IndexedRepository<T> (with indexing support)
// - ObservableRepository<T> (with event notifications)

// Example entity types:
interface User extends Entity {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  tags: string[];
}

interface Product extends Entity {
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

// Usage example:
// const userRepo = new InMemoryRepository<User>();
// const query = new Query<User>()
//   .where('age').greaterThan(18)
//   .and()
//   .where('isActive').equals(true)
//   .orderBy('name')
//   .limit(10);
// 
// const users = await userRepo.find(query);`
  ],

  keyPoints: [
    "Generic classes provide type-safe containers and reusable components",
    "Type parameters can have default values and constraints",
    "Static members cannot access class-level generic parameters",
    "Generic class inheritance allows for flexible hierarchies",
    "Constraints enable type-safe operations within generic classes",
    "Phantom types provide additional type safety for identifiers",
    "Mixin patterns work well with generic classes for composition",
    "Generic classes support fluent interfaces and method chaining",
    "Template method pattern combines well with generics",
    "Visitor pattern can be made type-safe with generic classes"
  ]
};