// File location: src/data/concepts/generics/constraints.ts

export interface ConstraintsContent {
  title: string;
  description: string;
  codeExamples: {
    basic: string;
    keyof: string;
    multiple: string;
    conditional: string;
    advanced: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const constraintsContent: ConstraintsContent = {
  title: "Generic Constraints",
  description: "Generic constraints allow you to limit the types that can be used as generic arguments. They ensure that generic types have specific properties or capabilities, enabling type-safe operations within generic functions and classes.",
  
  codeExamples: {
    basic: `// Basic generic constraints using 'extends'
// T extends U means T must be assignable to U

// Constraint requiring a length property
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(\`Length: \${arg.length}\`);
  return arg;
}

// These work because they have a length property
logLength("Hello world");        // string has length
logLength([1, 2, 3, 4]);         // array has length
logLength({ length: 42 });       // object with length property

// This would cause an error:
// logLength(123);               // number doesn't have length property

// Constraint with primitive types
function processStringOrNumber<T extends string | number>(value: T): string {
  return String(value).toUpperCase();
}

const result1 = processStringOrNumber("hello");  // Works
const result2 = processStringOrNumber(42);       // Works
// const result3 = processStringOrNumber(true);  // Error: boolean not allowed

// Constraint with object shape
interface Identifiable {
  id: string | number;
}

function updateItem<T extends Identifiable>(item: T, updates: Partial<T>): T {
  return { ...item, ...updates };
}

const user = { id: 1, name: "John", email: "john@example.com" };
const product = { id: "abc", title: "Widget", price: 29.99 };

const updatedUser = updateItem(user, { name: "Jane" });
const updatedProduct = updateItem(product, { price: 24.99 });

// Constraint with function signature
function executeFunction<T extends () => any>(fn: T): ReturnType<T> {
  return fn();
}

const getString = () => "hello";
const getNumber = () => 42;

const str = executeFunction(getString);  // Type: string
const num = executeFunction(getNumber);  // Type: number

// Constraint with class constructor
interface Constructable {
  new (...args: any[]): any;
}

function createInstance<T extends Constructable>(
  constructor: T,
  ...args: any[]
): InstanceType<T> {
  return new constructor(...args);
}

class Person {
  constructor(public name: string) {}
}

class Car {
  constructor(public make: string, public model: string) {}
}

const person = createInstance(Person, "John");        // Type: Person
const car = createInstance(Car, "Toyota", "Camry");   // Type: Car`,

    keyof: `// Using keyof constraint for type-safe property access
// K extends keyof T means K must be a key of T

// Basic keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = {
  name: "John",
  age: 30,
  email: "john@example.com",
  isActive: true
};

const name = getProperty(person, "name");        // Type: string
const age = getProperty(person, "age");          // Type: number
const email = getProperty(person, "email");      // Type: string
// const invalid = getProperty(person, "height"); // Error: "height" is not a key

// Setting properties with keyof constraint
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value };
}

const updatedPerson = setProperty(person, "age", 31);        // Works
const activePerson = setProperty(person, "isActive", false); // Works
// const invalid = setProperty(person, "age", "thirty");     // Error: wrong type

// Multiple property access
function getProperties<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const nameAndAge = getProperties(person, "name", "age");
// Type: { name: string; age: number; }

// Safe property deletion
function omitProperty<T, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const { [key]: _, ...rest } = obj;
  return rest;
}

const withoutEmail = omitProperty(person, "email");
// Type: { name: string; age: number; isActive: boolean; }

// Nested property access with keyof
function getNestedProperty<T, K extends keyof T, U extends keyof T[K]>(
  obj: T,
  key1: K,
  key2: U
): T[K][U] {
  return obj[key1][key2];
}

const company = {
  info: {
    name: "Acme Corp",
    founded: 1995
  },
  address: {
    street: "123 Main St",
    city: "Anytown"
  }
};

const companyName = getNestedProperty(company, "info", "name");     // Type: string
const street = getNestedProperty(company, "address", "street");     // Type: string`,

    multiple: `// Multiple constraints and complex constraint relationships

// Multiple independent constraints
function processData<
  T extends { length: number },
  U extends string | number
>(data: T, processor: (item: T) => U): U {
  console.log(\`Processing data of length \${data.length}\`);
  return processor(data);
}

const result1 = processData("hello", str => str.length);        // string -> number
const result2 = processData([1, 2, 3], arr => arr.join(","));   // array -> string

// Constraint relationships - one parameter constrains another
function updateField<T, K extends keyof T>(
  obj: T,
  field: K,
  value: T[K]
): T {
  return { ...obj, [field]: value };
}

// Multiple constraints with intersection
interface Serializable {
  serialize(): string;
}

interface Identifiable {
  id: string;
}

function saveEntity<T extends Serializable & Identifiable>(entity: T): void {
  const data = entity.serialize();
  console.log(\`Saving entity \${entity.id}: \${data}\`);
}

class User implements Serializable, Identifiable {
  constructor(public id: string, public name: string) {}
  
  serialize(): string {
    return JSON.stringify({ id: this.id, name: this.name });
  }
}

const user = new User("123", "John");
saveEntity(user); // Works because User implements both interfaces

// Mapped constraints
function validateFields<T, K extends keyof T>(
  obj: T,
  validators: { [P in K]: (value: T[P]) => boolean }
): { [P in K]: boolean } {
  const results = {} as { [P in K]: boolean };
  
  for (const key of Object.keys(validators) as K[]) {
    results[key] = validators[key](obj[key]);
  }
  
  return results;
}

const validationResults = validateFields(person, {
  name: (value) => value.length > 0,
  age: (value) => value >= 18
});
// Type: { name: boolean; age: boolean; }`,

    conditional: `// Conditional constraints and advanced constraint patterns

// Conditional constraint based on input type
function processInput<T>(
  input: T
): T extends string 
  ? { type: "string"; value: string; length: number }
  : T extends number
    ? { type: "number"; value: number; squared: number }
    : { type: "other"; value: T } {
  
  if (typeof input === "string") {
    return {
      type: "string",
      value: input,
      length: input.length
    } as any;
  }
  
  if (typeof input === "number") {
    return {
      type: "number",
      value: input,
      squared: input * input
    } as any;
  }
  
  return {
    type: "other",
    value: input
  } as any;
}

const stringResult = processInput("hello");    // { type: "string"; value: string; length: number }
const numberResult = processInput(42);         // { type: "number"; value: number; squared: number }
const boolResult = processInput(true);         // { type: "other"; value: boolean }

// Constraint with type extraction
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function callAndReturn<T extends (...args: any[]) => any>(
  fn: T
): GetReturnType<T> {
  return fn();
}

const getString = () => "hello";
const getNumber = () => 42;

const str = callAndReturn(getString);  // Type: string
const num = callAndReturn(getNumber);  // Type: number

// Constraint with template literal types
function createApiEndpoint<T extends string>(
  resource: T
): \`/api/\${T}\` {
  return \`/api/\${resource}\`;
}

const userEndpoint = createApiEndpoint("users");      // Type: "/api/users"
const postEndpoint = createApiEndpoint("posts");      // Type: "/api/posts"`,

    advanced: `// Advanced constraint patterns and edge cases

// Constraint with branded types
type Brand<K, T> = K & { __brand: T };
type UserId = Brand<string, "UserId">;
type ProductId = Brand<string, "ProductId">;

function createUserId(id: string): UserId {
  return id as UserId;
}

function getUser<T extends UserId>(id: T): Promise<{ id: T; name: string }> {
  return Promise.resolve({ id, name: "John Doe" });
}

const userId = createUserId("user-123");
// const user = await getUser(userId); // Type-safe, won't accept ProductId

// Higher-kinded type constraints
interface Functor<T> {
  map<U>(fn: (value: T) => U): Functor<U>;
}

interface Monad<T> extends Functor<T> {
  flatMap<U>(fn: (value: T) => Monad<U>): Monad<U>;
}

class Maybe<T> implements Monad<T> {
  constructor(private value: T | null) {}

  map<U>(fn: (value: T) => U): Maybe<U> {
    return this.value === null ? new Maybe<U>(null) : new Maybe(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return this.value === null ? new Maybe<U>(null) : fn(this.value);
  }

  getValue(): T | null {
    return this.value;
  }
}

// Constraint with tuple manipulation
type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;
type Tail<T extends readonly any[]> = T extends readonly [any, ...infer R] ? R : [];

function processFirstAndRest<T extends readonly any[]>(
  tuple: T
): { first: Head<T>; rest: Tail<T> } {
  const [first, ...rest] = tuple;
  return { first: first as Head<T>, rest: rest as Tail<T> };
}

const result = processFirstAndRest([1, "hello", true]);
// Type: { first: number; rest: [string, boolean] }

// Extreme constraint example: Type-level computation
type Add<A extends number, B extends number> = 
  [...Array<A>, ...Array<B>]['length'] extends infer R
    ? R extends number 
      ? R 
      : never
    : never;

function addNumbers<A extends number, B extends number>(
  a: A,
  b: B
): Add<A, B> {
  return (a + b) as Add<A, B>;
}

// This would work with literal types
const sum = addNumbers(2 as const, 3 as const); // Type: 5`
  },

  exercises: [
    `// Exercise 1: Build a type-safe configuration system
// Create a system that enforces configuration constraints

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  ssl?: boolean;
}

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

interface AppConfig {
  database: DatabaseConfig;
  redis: RedisConfig;
  apiKeys: Record<string, string>;
}

// Helper types to implement
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepKeys<T> = T extends object 
  ? {
      [K in keyof T]: K extends string | number
        ? \`\${K}\` | \`\${K}.\${DeepKeys<T[K]>}\`
        : never;
    }[keyof T]
  : never;

type DeepGet<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends \`\${infer P}.\${infer S}\`
  ? P extends keyof T
    ? DeepGet<T[P], S>
    : never
  : never;

// Create a function that validates and merges partial configurations
function createConfig<T extends Record<string, any>>(
  defaults: T,
  overrides: DeepPartial<T>
): T {
  // Implementation: deeply merge overrides into defaults
  const result = { ...defaults };
  
  for (const key in overrides) {
    const override = overrides[key];
    if (override !== undefined) {
      if (typeof override === 'object' && !Array.isArray(override) && override !== null) {
        result[key] = createConfig(defaults[key] || {}, override);
      } else {
        result[key] = override as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
}

// Create a function that gets nested configuration values safely
function getConfigValue<T, K extends DeepKeys<T>>(
  config: T,
  path: K
): DeepGet<T, K> {
  const keys = path.split('.');
  let current: any = config;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined as any;
    }
  }
  
  return current;
}

// Usage example:
const defaultConfig: AppConfig = {
  database: { host: 'localhost', port: 5432, database: 'myapp' },
  redis: { host: 'localhost', port: 6379 },
  apiKeys: { openai: 'default-key' }
};

const config = createConfig(defaultConfig, {
  database: { ssl: true },
  apiKeys: { openai: 'real-key' }
});

const dbHost = getConfigValue(config, 'database.host'); // Type: string`,

    `// Exercise 2: Generic event system with type constraints
// Build a type-safe event emitter with constrained event types

interface EventMap {
  [eventName: string]: any[];
}

interface TypedEventEmitter<TEvents extends EventMap> {
  on<K extends keyof TEvents>(
    event: K,
    listener: (...args: TEvents[K]) => void
  ): void;

  emit<K extends keyof TEvents>(
    event: K,
    ...args: TEvents[K]
  ): void;

  off<K extends keyof TEvents>(
    event: K,
    listener?: (...args: TEvents[K]) => void
  ): void;
}

class EventEmitter<TEvents extends EventMap> implements TypedEventEmitter<TEvents> {
  private listeners: {
    [K in keyof TEvents]?: ((...args: TEvents[K]) => void)[];
  } = {};

  on<K extends keyof TEvents>(
    event: K,
    listener: (...args: TEvents[K]) => void
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof TEvents>(
    event: K,
    ...args: TEvents[K]
  ): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }

  off<K extends keyof TEvents>(
    event: K,
    listener?: (...args: TEvents[K]) => void
  ): void {
    const eventListeners = this.listeners[event];
    if (!eventListeners) return;

    if (listener) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    } else {
      delete this.listeners[event];
    }
  }
}

// Define your event types
interface MyEvents extends EventMap {
  "user:login": [{ userId: string; timestamp: Date }];
  "user:logout": [{ userId: string }];
  "data:update": [{ id: string; data: any }];
  "error": [{ message: string; code: number }];
}

// Create type-safe middleware
function createEventMiddleware<TEvents extends EventMap>(
  emitter: TypedEventEmitter<TEvents>
) {
  return function middleware<K extends keyof TEvents>(
    eventName: K,
    handler: (eventName: K, ...args: TEvents[K]) => void | Promise<void>
  ) {
    const originalEmit = emitter.emit.bind(emitter);
    
    emitter.emit = function<EventK extends keyof TEvents>(
      event: EventK,
      ...args: TEvents[EventK]
    ): void {
      if (event === eventName) {
        const result = handler(event as K, ...(args as TEvents[K]));
        if (result instanceof Promise) {
          result.catch(console.error);
        }
      }
      originalEmit(event, ...args);
    };
  };
}

// Usage:
const emitter = new EventEmitter<MyEvents>();
const middleware = createEventMiddleware(emitter);

middleware("user:login", (event, data) => {
  console.log(\`User \${data.userId} logged in at \${data.timestamp}\`);
});`,

    `// Exercise 3: Advanced validation with constraints
// Create a validation system that uses generic constraints

interface ValidationRule<T> {
  name: string;
  validate: (value: T) => boolean;
  message: string;
}

interface Schema<T extends Record<string, any>> {
  [K in keyof T]: ValidationRule<T[K]>[];
}

interface ValidationResult<T extends Record<string, any>> {
  isValid: boolean;
  errors: {
    [K in keyof T]?: string[];
  };
  data: T;
}

class Validator<T extends Record<string, any>> {
  constructor(private schema: Schema<T>) {}

  validate(data: unknown): ValidationResult<T> {
    const typedData = data as T;
    const errors: { [K in keyof T]?: string[] } = {};
    let isValid = true;

    for (const key in this.schema) {
      const rules = this.schema[key];
      const value = typedData[key];
      const fieldErrors: string[] = [];

      for (const rule of rules) {
        if (!rule.validate(value)) {
          fieldErrors.push(rule.message);
          isValid = false;
        }
      }

      if (fieldErrors.length > 0) {
        errors[key] = fieldErrors;
      }
    }

    return {
      isValid,
      errors,
      data: typedData
    };
  }

  static create<T extends Record<string, any>>(): SchemaBuilder<T> {
    return new SchemaBuilder<T>();
  }
}

class SchemaBuilder<T extends Record<string, any>> {
  private rules: Partial<Schema<T>> = {};

  field<K extends keyof T>(
    key: K,
    ...validators: ValidationRule<T[K]>[]
  ): this {
    this.rules[key] = validators;
    return this;
  }

  build(): Schema<T> {
    return this.rules as Schema<T>;
  }

  // Utility methods for common validations
  required<K extends keyof T>(key: K): this {
    const rule: ValidationRule<T[K]> = {
      name: 'required',
      validate: (value) => value != null && value !== '',
      message: 'This field is required'
    };
    return this.field(key, rule);
  }

  string<K extends keyof T>(
    key: K,
    minLength?: number,
    maxLength?: number
  ): this {
    const rules: ValidationRule<T[K]>[] = [];
    
    if (minLength !== undefined) {
      rules.push({
        name: 'minLength',
        validate: (value) => typeof value === 'string' && value.length >= minLength,
        message: \`Must be at least \${minLength} characters\`
      });
    }
    
    if (maxLength !== undefined) {
      rules.push({
        name: 'maxLength',
        validate: (value) => typeof value === 'string' && value.length <= maxLength,
        message: \`Must be no more than \${maxLength} characters\`
      });
    }
    
    return this.field(key, ...rules);
  }

  number<K extends keyof T>(
    key: K,
    min?: number,
    max?: number
  ): this {
    const rules: ValidationRule<T[K]>[] = [];
    
    if (min !== undefined) {
      rules.push({
        name: 'min',
        validate: (value) => typeof value === 'number' && value >= min,
        message: \`Must be at least \${min}\`
      });
    }
    
    if (max !== undefined) {
      rules.push({
        name: 'max',
        validate: (value) => typeof value === 'number' && value <= max,
        message: \`Must be no more than \${max}\`
      });
    }
    
    return this.field(key, ...rules);
  }
}

// Usage example:
interface UserData {
  name: string;
  email: string;
  age: number;
}

const userSchema = Validator.create<UserData>()
  .required('name')
  .string('name', 2, 50)
  .required('email')
  .string('email', 5, 100)
  .required('age')
  .number('age', 0, 120)
  .build();

const userValidator = new Validator(userSchema);
const result = userValidator.validate({
  name: 'John',
  email: 'john@example.com',
  age: 25
});

console.log(result.isValid); // true or false
console.log(result.errors);  // field-specific errors`
  ],

  keyPoints: [
    "Generic constraints use the 'extends' keyword to limit type parameters",
    "keyof constraints enable type-safe property access and manipulation",
    "Multiple constraints can be combined using intersection (&) types",
    "Conditional constraints allow different behavior based on input types",
    "Constraints enable IntelliSense and compile-time type checking",
    "Use constraints to ensure generic types have required properties or methods",
    "Constraint relationships allow one type parameter to depend on another",
    "Branded types with constraints create nominal typing in TypeScript",
    "Advanced constraints can perform type-level computations",
    "Constraints are essential for building type-safe APIs and libraries"
  ]
};