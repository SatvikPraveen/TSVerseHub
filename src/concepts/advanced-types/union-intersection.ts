// File location: src/data/concepts/advanced-types/union-intersection.ts

export interface UnionIntersectionContent {
  title: string;
  description: string;
  codeExamples: {
    basicUnions: string;
    literalUnions: string;
    discriminatedUnions: string;
    intersectionTypes: string;
    distributiveTypes: string;
    advanced: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const unionIntersectionContent: UnionIntersectionContent = {
  title: "Union and Intersection Types",
  description: "Union types (|) represent values that can be one of several types, while intersection types (&) combine multiple types into one. These are fundamental building blocks for advanced type compositions in TypeScript.",
  
  codeExamples: {
    basicUnions: `// Basic union types with the | operator
type StringOrNumber = string | number;
type Status = "loading" | "success" | "error";

function processValue(value: StringOrNumber) {
  // TypeScript narrows the type based on runtime checks
  if (typeof value === "string") {
    // value is narrowed to string here
    console.log(value.toUpperCase());
  } else {
    // value is narrowed to number here
    console.log(value.toFixed(2));
  }
}

// Union with multiple types
type ID = string | number | symbol;
type Primitive = string | number | boolean | null | undefined;

// Function parameter unions
function logMessage(message: string | string[]) {
  if (Array.isArray(message)) {
    message.forEach(msg => console.log(msg));
  } else {
    console.log(message);
  }
}

// Return type unions
function parseInput(input: string): number | Error {
  const parsed = parseInt(input, 10);
  if (isNaN(parsed)) {
    return new Error("Invalid number");
  }
  return parsed;
}

// Optional properties create unions with undefined
interface User {
  id: number;
  name: string;
  email?: string; // string | undefined
}

function greetUser(user: User) {
  // user.email is string | undefined
  if (user.email) {
    // user.email is narrowed to string here
    console.log(\`Hello \${user.name} at \${user.email}\`);
  } else {
    console.log(\`Hello \${user.name}\`);
  }
}

// Union with null and undefined
type MaybeString = string | null | undefined;

function processString(str: MaybeString) {
  if (str != null) {
    // str is narrowed to string (removes both null and undefined)
    return str.trim();
  }
  return "";
}

// Array unions
type NumberOrStringArray = number[] | string[];

function processArray(arr: NumberOrStringArray) {
  // Access common array properties
  console.log("Length:", arr.length);
  
  // Type narrowing for specific operations
  if (typeof arr[0] === "number") {
    // arr is narrowed to number[]
    return arr.reduce((sum, num) => sum + num, 0);
  } else {
    // arr is narrowed to string[]
    return arr.join(", ");
  }
}`,

    literalUnions: `// Literal type unions for precise type control
type Theme = "light" | "dark" | "auto";
type Size = "xs" | "sm" | "md" | "lg" | "xl";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Combining literal unions
type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
}

// Numeric literal unions
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
type Port = 80 | 443 | 3000 | 8080;

// Boolean literal unions (less common but possible)
type StrictBoolean = true | false; // equivalent to boolean

// Template literal unions
type EventName = "click" | "hover" | "focus";
type EventHandler = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onHover" | "onFocus"

// Combining different literal types
type Config = {
  environment: "development" | "staging" | "production";
  port: 3000 | 8080 | 80;
  ssl: true | false;
  logLevel: "debug" | "info" | "warn" | "error";
};

// Literal unions with type guards
function isValidTheme(value: string): value is Theme {
  return ["light", "dark", "auto"].includes(value as Theme);
}

function applyTheme(theme: string) {
  if (isValidTheme(theme)) {
    // theme is narrowed to Theme literal union
    document.body.className = \`theme-\${theme}\`;
  }
}

// Const assertions create literal unions
const themes = ["light", "dark", "auto"] as const;
type ThemeFromArray = typeof themes[number]; // "light" | "dark" | "auto"

const statusCodes = {
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
} as const;
type StatusCode = typeof statusCodes[keyof typeof statusCodes]; // 200 | 404 | 500

// Mapped literal unions
type HttpStatusCode = 200 | 201 | 400 | 401 | 404 | 500;
type StatusMessage = {
  [K in HttpStatusCode]: string;
};
// { 200: string; 201: string; 400: string; ... }`,

    discriminatedUnions: `// Discriminated unions (tagged unions) for type-safe state management
interface LoadingState {
  status: "loading";
  progress?: number;
}

interface SuccessState {
  status: "success";
  data: any;
  timestamp: number;
}

interface ErrorState {
  status: "error";
  error: string;
  retryCount: number;
}

type AsyncState = LoadingState | SuccessState | ErrorState;

function handleState(state: AsyncState) {
  switch (state.status) {
    case "loading":
      // state is narrowed to LoadingState
      console.log(\`Loading... \${state.progress || 0}%\`);
      break;
    
    case "success":
      // state is narrowed to SuccessState
      console.log("Success at", new Date(state.timestamp));
      console.log("Data:", state.data);
      break;
    
    case "error":
      // state is narrowed to ErrorState
      console.log(\`Error (attempt \${state.retryCount}): \${state.error}\`);
      break;
    
    default:
      // Exhaustiveness check - ensures all cases are handled
      const _exhaustive: never = state;
      throw new Error(\`Unhandled state: \${_exhaustive}\`);
  }
}

// Shape discriminated union
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    
    case "rectangle":
      return shape.width * shape.height;
    
    case "triangle":
      return (shape.base * shape.height) / 2;
    
    default:
      const _exhaustive: never = shape;
      throw new Error(\`Unknown shape: \${_exhaustive}\`);
  }
}

// API response discriminated union
interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    totalPages: number;
  };
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

function processApiResponse<T>(response: ApiResponse<T>): T | null {
  if (response.success) {
    // response is narrowed to ApiSuccess<T>
    console.log("Success! Data received:", response.data);
    if (response.meta) {
      console.log(\`Page \${response.meta.page} of \${response.meta.totalPages}\`);
    }
    return response.data;
  } else {
    // response is narrowed to ApiError
    console.error(\`API Error \${response.error.code}: \${response.error.message}\`);
    return null;
  }
}

// Event discriminated union
interface ClickEvent {
  type: "click";
  x: number;
  y: number;
  button: "left" | "right" | "middle";
}

interface KeyboardEvent {
  type: "keypress";
  key: string;
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
  };
}

interface ScrollEvent {
  type: "scroll";
  scrollTop: number;
  scrollLeft: number;
}

type UIEvent = ClickEvent | KeyboardEvent | ScrollEvent;

function handleUIEvent(event: UIEvent) {
  switch (event.type) {
    case "click":
      console.log(\`Clicked at (\${event.x}, \${event.y}) with \${event.button} button\`);
      break;
    
    case "keypress":
      const modStr = Object.entries(event.modifiers)
        .filter(([_, pressed]) => pressed)
        .map(([key, _]) => key)
        .join("+");
      console.log(\`Key pressed: \${modStr ? modStr + "+" : ""}\${event.key}\`);
      break;
    
    case "scroll":
      console.log(\`Scrolled to (\${event.scrollLeft}, \${event.scrollTop})\`);
      break;
  }
}`,

    intersectionTypes: `// Intersection types with the & operator
// Combine multiple types into one

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Versioned {
  version: number;
}

interface Audited {
  createdBy: string;
  updatedBy: string;
}

// Basic intersection
type User = {
  id: number;
  name: string;
  email: string;
};

type UserWithTimestamps = User & Timestamped;
// Has all properties from User AND Timestamped

type UserWithAudit = User & Timestamped & Versioned & Audited;
// Has properties from all four types

const auditedUser: UserWithAudit = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
  createdBy: "admin",
  updatedBy: "admin"
};

// Function intersections
type Printable = {
  print(): void;
};

type Serializable = {
  serialize(): string;
  deserialize(data: string): void;
};

type Document = {
  title: string;
  content: string;
};

type PrintableDocument = Document & Printable & Serializable;

class PDFDocument implements PrintableDocument {
  constructor(public title: string, public content: string) {}
  
  print() {
    console.log(\`Printing: \${this.title}\`);
  }
  
  serialize() {
    return JSON.stringify({ title: this.title, content: this.content });
  }
  
  deserialize(data: string) {
    const parsed = JSON.parse(data);
    this.title = parsed.title;
    this.content = parsed.content;
  }
}

// Mixin pattern with intersections
type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
    updatedAt = new Date();
    
    touch() {
      this.updatedAt = new Date();
    }
  };
}

function Versioned<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    version = 1;
    
    incrementVersion() {
      this.version++;
    }
  };
}

// Compose mixins
class BaseEntity {
  constructor(public id: number) {}
}

const TimestampedEntity = Timestamped(BaseEntity);
const VersionedTimestampedEntity = Versioned(TimestampedEntity);

// Type represents intersection of all mixin types
type EntityInstance = InstanceType<typeof VersionedTimestampedEntity>;

// Intersection with function types
type EventListener = (event: Event) => void;
type Logger = (message: string) => void;

// Function that combines both behaviors
type LoggingEventListener = EventListener & Logger & {
  removeListener(): void;
};

// Utility function intersection types
type Readable<T> = {
  read(): T;
};

type Writable<T> = {
  write(value: T): void;
};

type ReadWrite<T> = Readable<T> & Writable<T>;

class FileHandler<T> implements ReadWrite<T> {
  private data: T;
  
  constructor(initialData: T) {
    this.data = initialData;
  }
  
  read(): T {
    return this.data;
  }
  
  write(value: T): void {
    this.data = value;
  }
}`,

    distributiveTypes: `// Distributive properties of union types
// When conditional types meet union types, they distribute

type ToArray<T> = T extends any ? T[] : never;

// With union input, distributes over each member
type StringOrNumberArray = ToArray<string | number>;
// Equivalent to: string[] | number[]

// Non-distributive version (wrap in tuple to prevent distribution)
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;
type Combined = ToArrayNonDistributive<string | number>;
// Result: (string | number)[]

// Practical example: Extract function types
interface MixedInterface {
  name: string;
  age: number;
  greet(): string;
  calculate(x: number): number;
  isActive: boolean;
}

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type FunctionProps = FunctionPropertyNames<MixedInterface>;
// "greet" | "calculate"

type NonFunctionProps = NonFunctionPropertyNames<MixedInterface>;
// "name" | "age" | "isActive"

// Distributive conditional types with unions
type Flatten<T> = T extends any[] ? T[number] : T;

type Test1 = Flatten<string[]>; // string
type Test2 = Flatten<number[]>; // number
type Test3 = Flatten<string[] | number[]>; // string | number (distributed)

// Exclude utility type implementation
type MyExclude<T, U> = T extends U ? never : T;

type WithoutStrings = MyExclude<string | number | boolean, string>;
// number | boolean

// Extract utility type implementation
type MyExtract<T, U> = T extends U ? T : never;

type OnlyStrings = MyExtract<string | number | boolean, string>;
// string

// Complex distributive example
type ApiEndpoint = 
  | { method: "GET"; path: string; }
  | { method: "POST"; path: string; data: any; }
  | { method: "DELETE"; path: string; };

type ExtractMethod<T> = T extends { method: infer M } ? M : never;
type Methods = ExtractMethod<ApiEndpoint>; // "GET" | "POST" | "DELETE"

type ExtractPostEndpoints<T> = T extends { method: "POST" } ? T : never;
type PostEndpoints = ExtractPostEndpoints<ApiEndpoint>;
// { method: "POST"; path: string; data: any; }

// Union to intersection conversion (advanced)
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void 
    ? I 
    : never;

type Combined = UnionToIntersection<
  | { a: string }
  | { b: number }
  | { c: boolean }
>;
// { a: string } & { b: number } & { c: boolean }

// Distributive mapped types
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};

// When applied to union types
type AB = { a: string } | { b: number };
type NullableAB = Nullable<AB>;
// { a: string | null } | { b: number | null }

// Pick with union distribution
type PickUnion<T, K extends keyof any> = T extends any 
  ? Pick<T, K & keyof T>
  : never;

type PersonOrCompany = 
  | { type: "person"; name: string; age: number; }
  | { type: "company"; name: string; employees: number; };

type Names = PickUnion<PersonOrCompany, "name">;
// { name: string } | { name: string }
// (which simplifies to { name: string })`,

    advanced: `// Advanced union and intersection patterns

// 1. Branded unions for type safety
type Brand<T, B> = T & { __brand: B };

type UserId = Brand<string, "UserId">;
type ProductId = Brand<string, "ProductId">;
type Email = Brand<string, "Email">;

// These are all strings at runtime but distinct at compile time
function getUser(id: UserId): User | null {
  // Implementation
  return null;
}

function getProduct(id: ProductId): Product | null {
  // Implementation  
  return null;
}

// This would cause a type error:
// getUser("some-product-id" as ProductId); // Error!

// 2. Conditional distribution with mapped types
type PartialByKeys<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | undefined : T[P];
};

interface FullUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

type UserWithOptionalContact = PartialByKeys<FullUser, "email" | "phone">;
// { id: number; name: string; email: string | undefined; phone: string | undefined; }

// 3. Recursive union types
type JsonValue = 
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// 4. Higher-order union manipulation
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
} : T;

type DeepRequired<T> = T extends object ? {
  [P in keyof T]-?: T[P] extends (infer U)[]
    ? DeepRequired<U>[]
    : T[P] extends object | undefined
      ? DeepRequired<NonNullable<T[P]>>
      : T[P];
} : T;

// 5. Union narrowing with type predicates
type Shape = 
  | { kind: "circle"; radius: number; }
  | { kind: "square"; sideLength: number; }
  | { kind: "rectangle"; width: number; height: number; };

function isCircle(shape: Shape): shape is Extract<Shape, { kind: "circle" }> {
  return shape.kind === "circle";
}

function isRectangular(shape: Shape): shape is Extract<Shape, { kind: "square" | "rectangle" }> {
  return shape.kind === "square" || shape.kind === "rectangle";
}

// 6. Conditional intersection types
type MergeObjects<T, U> = T extends object
  ? U extends object
    ? T & U
    : T
  : U extends object
    ? U
    : T | U;

type Merged1 = MergeObjects<{ a: number }, { b: string }>; // { a: number } & { b: string }
type Merged2 = MergeObjects<string, { b: string }>; // { b: string }
type Merged3 = MergeObjects<string, number>; // string | number

// 7. Union to tuple conversion
type UnionToTuple<T> = (
  (T extends any ? (t: T) => T : never) extends infer U
    ? (U extends any ? (u: U) => any : never) extends (v: infer V) => any
      ? V
      : never
    : never
) extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];

type Tuple = UnionToTuple<"a" | "b" | "c">;
// ["a", "b", "c"] (order may vary)

// 8. Discriminated union helpers
type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;
type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> = {
  [V in T[K]]: DiscriminateUnion<T, K, V>;
};

type ShapeMap = MapDiscriminatedUnion<Shape, "kind">;
// {
//   circle: { kind: "circle"; radius: number; };
//   square: { kind: "square"; sideLength: number; };
//   rectangle: { kind: "rectangle"; width: number; height: number; };
// }

// 9. Dynamic object creation with unions
type EventMap = {
  "user:login": { userId: string; timestamp: number; };
  "user:logout": { userId: string; };
  "page:view": { path: string; referrer?: string; };
};

type EventName = keyof EventMap;
type EventData<T extends EventName> = EventMap[T];

class EventEmitter {
  private listeners: {
    [K in EventName]?: Array<(data: EventData<K>) => void>;
  } = {};

  on<T extends EventName>(event: T, listener: (data: EventData<T>) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<T extends EventName>(event: T, data: EventData<T>) {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

// 10. Complex validation with unions
type ValidationRule<T> = 
  | { type: "required" }
  | { type: "minLength"; value: number }
  | { type: "maxLength"; value: number }
  | { type: "pattern"; value: RegExp }
  | { type: "custom"; validator: (value: T) => boolean; message: string };

type FieldValidation<T> = {
  rules: ValidationRule<T>[];
  message?: string;
};

type FormSchema<T extends Record<string, any>> = {
  [K in keyof T]: FieldValidation<T[K]>;
};

// Usage
const userFormSchema: FormSchema<{
  username: string;
  email: string;
  age: number;
}> = {
  username: {
    rules: [
      { type: "required" },
      { type: "minLength", value: 3 },
      { type: "pattern", value: /^[a-zA-Z0-9_]+$/ }
    ]
  },
  email: {
    rules: [
      { type: "required" },
      { type: "pattern", value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    ]
  },
  age: {
    rules: [
      { type: "required" },
      { type: "custom", validator: (age) => age >= 13, message: "Must be at least 13 years old" }
    ]
  }
};`
  },

  exercises: [
    `// Exercise 1: Create a type-safe state machine
type State = "idle" | "loading" | "success" | "error";
type Event = "FETCH" | "SUCCESS" | "ERROR" | "RETRY" | "RESET";

type Transition<S extends State, E extends Event> = // Your implementation here
type StateMachine = // Your implementation here

// Should define valid state transitions:
// idle + FETCH -> loading
// loading + SUCCESS -> success  
// loading + ERROR -> error
// error + RETRY -> loading
// Any state + RESET -> idle`,

    `// Exercise 2: Create a flexible API client type system
interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  params?: Record<string, string | number>;
  body?: any;
  response: any;
}

type ApiClient<T extends Record<string, ApiEndpoint>> = // Your implementation here

// Should create a type-safe client where:
// - GET endpoints don't accept body
// - POST/PUT endpoints require body if endpoint defines it
// - Return types match endpoint response types
// - Path parameters are type-checked`,

    `// Exercise 3: Build a type-safe form builder
type FormFieldType = "text" | "email" | "password" | "number" | "select" | "checkbox";

interface FormField<T extends FormFieldType> {
  type: T;
  label: string;
  required?: boolean;
  // Add type-specific properties based on T
}

type FormSchema<T extends Record<string, FormFieldType>> = // Your implementation here
type FormValues<T extends FormSchema<any>> = // Your implementation here

// Should infer correct value types:
// text/email/password -> string
// number -> number
// checkbox -> boolean
// select -> union of option values`,

    `// Exercise 4: Create a deep merge utility type
type DeepMerge<T, U> = // Your implementation here

interface Target {
  a: string;
  nested: {
    x: number;
    y: string;
  };
}

interface Source {
  b: boolean;
  nested: {
    y: number; // Should override
    z: string; // Should add
  };
}

type Merged = DeepMerge<Target, Source>;
// Should result in proper intersection with conflict resolution`,

    `// Exercise 5: Build a query builder type system
type Operator = "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "in" | "nin";
type LogicalOperator = "and" | "or";

interface QueryCondition<T extends Record<string, any>, K extends keyof T> {
  field: K;
  operator: Operator;
  value: T[K] | T[K][]; // Array for 'in' and 'nin' operators
}

type QueryBuilder<T extends Record<string, any>> = // Your implementation here

// Should provide type-safe query building:
// - Field names must exist in T
// - Value types must match field types
// - Support logical combinations
// - Provide fluent API methods`
  ],

  keyPoints: [
    "Union types (|) create a type that can be one of several types",
    "Intersection types (&) combine multiple types into a single type with all properties",
    "Type narrowing helps TypeScript understand which specific type is being used at runtime",
    "Discriminated unions use a common property to distinguish between union members",
    "Literal unions provide precise type control with specific string, number, or boolean values",
    "Union types distribute over conditional types, enabling powerful type transformations",
    "Intersection types are useful for mixins, composition, and combining behaviors",
    "Exhaustiveness checking ensures all union cases are handled in switch statements",
    "Type guards are essential for safely working with union types at runtime",
    "Branded types use intersections to create distinct types from the same base type",
    "Advanced patterns like union-to-intersection enable complex type manipulations",
    "Understanding distribution is key to creating reusable utility types"
  ]
};

export default unionIntersectionContent;