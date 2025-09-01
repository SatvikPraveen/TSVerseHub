// File location: src/data/concepts/advanced-types/infer-keyword.ts

export interface InferKeywordContent {
  title: string;
  description: string;
  codeExamples: {
    basics: string;
    functions: string;
    arrays: string;
    objects: string;
    advanced: string;
    recursive: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const inferKeywordContent: InferKeywordContent = {
  title: "The infer Keyword",
  description: "The 'infer' keyword introduces a type variable within conditional types that can be inferred from the type being checked. It's a powerful tool for extracting types from complex type structures.",
  
  codeExamples: {
    basics: `// Basic infer usage in conditional types
// The infer keyword can only be used within the extends clause of a conditional type

// Extract the return type of a function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type StringFunction = () => string;
type NumberFunction = (x: number) => number;

type StringReturn = ReturnType<StringFunction>; // string
type NumberReturn = ReturnType<NumberFunction>; // number

// Extract parameter types
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type FunctionWithParams = (a: string, b: number, c: boolean) => void;
type Params = Parameters<FunctionWithParams>; // [string, number, boolean]

// Extract the first parameter type
type FirstParameter<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type FirstParam = FirstParameter<FunctionWithParams>; // string

// Extract the last parameter type
type LastParameter<T> = T extends (...args: [...any[], infer L]) => any ? L : never;
type LastParam = LastParameter<FunctionWithParams>; // boolean

// Multiple infer in the same conditional type
type FunctionInfo<T> = T extends (first: infer F, ...rest: infer R) => infer Ret
  ? {
      firstParam: F;
      restParams: R;
      returnType: Ret;
    }
  : never;

type Info = FunctionInfo<(name: string, age: number, active: boolean) => User>;
// {
//   firstParam: string;
//   restParams: [number, boolean];
//   returnType: User;
// }

// Infer from union types
type ExtractStrings<T> = T extends infer U 
  ? U extends string 
    ? U 
    : never 
  : never;

type OnlyStrings = ExtractStrings<string | number | "hello" | boolean>;
// string | "hello"

// Conditional with multiple branches using infer
type TypeName<T> = T extends string
  ? "string"
  : T extends number
    ? "number" 
    : T extends boolean
      ? "boolean"
      : T extends (...args: any[]) => infer R
        ? \`function returning \${TypeName<R>}\`
        : T extends (infer U)[]
          ? \`array of \${TypeName<U>}\`
          : "unknown";

type Examples = [
  TypeName<string>,           // "string"
  TypeName<() => number>,     // "function returning number"
  TypeName<boolean[]>,        // "array of boolean"
  TypeName<object>           // "unknown"
];`,

    functions: `// Advanced function type inference patterns

// Curry function type inference
type Curry<T> = T extends (first: infer F, ...rest: infer R) => infer Ret
  ? R extends []
    ? (arg: F) => Ret
    : (arg: F) => Curry<(...args: R) => Ret>
  : never;

declare function curry<T extends (...args: any[]) => any>(fn: T): Curry<T>;

const add = (a: number, b: number, c: number) => a + b + c;
const curriedAdd = curry(add);
// Type: (arg: number) => (arg: number) => (arg: number) => number

const result = curriedAdd(1)(2)(3); // 6

// Promise resolution type inference
type Awaited<T> = T extends Promise<infer U>
  ? U extends Promise<any>
    ? Awaited<U> // Handle nested promises
    : U
  : T;

type PromiseString = Awaited<Promise<string>>; // string
type NestedPromise = Awaited<Promise<Promise<number>>>; // number
type NotPromise = Awaited<string>; // string

// Function composition type inference
type Compose<F, G> = F extends (arg: infer A) => infer B
  ? G extends (arg: B) => infer C
    ? (arg: A) => C
    : never
  : never;

declare function compose<F extends (arg: any) => any, G extends (arg: any) => any>(
  f: F,
  g: G
): Compose<F, G>;

const toString = (n: number): string => n.toString();
const toUpperCase = (s: string): string => s.toUpperCase();

const numberToUpperString = compose(toString, toUpperCase);
// Type: (arg: number) => string

// Method extraction from class
type ExtractMethods<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
    ? (...args: Args) => Return
    : never;
}[keyof T];

class Calculator {
  add(a: number, b: number): number { return a + b; }
  multiply(x: number, y: number): number { return x * y; }
  name: string = "calc";
}

type CalcMethods = ExtractMethods<Calculator>;
// (a: number, b: number) => number

// Async function inference
type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;

async function fetchUser(): Promise<User> {
  return {} as User;
}

type UserType = AsyncReturnType<typeof fetchUser>; // User

// Event handler inference
type EventHandler<T> = T extends \`on\${infer Event}\`
  ? Event extends keyof HTMLElementEventMap
    ? (event: HTMLElementEventMap[Event]) => void
    : (event: Event) => void
  : never;

type ClickHandler = EventHandler<"onclick">; // (event: MouseEvent) => void
type CustomHandler = EventHandler<"onCustom">; // (event: Event) => void`,

    arrays: `// Array and tuple type inference

// Extract array element type
type ElementType<T> = T extends (infer U)[] ? U : never;

type StringArray = string[];
type NumberTuple = [number, string, boolean];

type StringElement = ElementType<StringArray>; // string
type TupleElement = ElementType<NumberTuple>; // number | string | boolean

// Extract first element of tuple
type Head<T> = T extends [infer H, ...any[]] ? H : never;

type FirstElement = Head<[string, number, boolean]>; // string
type EmptyFirst = Head<[]>; // never

// Extract tail of tuple
type Tail<T> = T extends [any, ...infer Rest] ? Rest : never;

type RestElements = Tail<[string, number, boolean]>; // [number, boolean]
type EmptyTail = Tail<[string]>; // []

// Extract last element of tuple
type Last<T extends readonly any[]> = T extends readonly [...any[], infer L] ? L : never;

type LastElement = Last<[string, number, boolean]>; // boolean

// Reverse tuple type
type Reverse<T extends readonly any[]> = T extends readonly [...infer Rest, infer Last]
  ? [Last, ...Reverse<Rest>]
  : [];

type Reversed = Reverse<[1, 2, 3, 4]>; // [4, 3, 2, 1]

// Tuple length
type Length<T extends readonly any[]> = T["length"];

type TupleLength = Length<[1, 2, 3]>; // 3

// Flatten nested arrays
type FlattenArray<T> = T extends (infer U)[]
  ? U extends any[]
    ? FlattenArray<U>[]
    : U[]
  : T;

type Nested = number[][][];
type Flattened = FlattenArray<Nested>; // number[]

// Join array elements into string
type Join<T extends readonly any[], D extends string> = T extends readonly [infer First, ...infer Rest]
  ? Rest extends readonly []
    ? \`\${First & string}\`
    : \`\${First & string}\${D}\${Join<Rest, D>}\`
  : "";

type JoinedPath = Join<["users", "123", "posts"], "/">; // "users/123/posts"

// Split string into tuple
type Split<S extends string, D extends string> = S extends \`\${infer First}\${D}\${infer Rest}\`
  ? [First, ...Split<Rest, D>]
  : [S];

type PathSegments = Split<"users/123/posts", "/">; // ["users", "123", "posts"]

// Array operations with infer
type Push<T extends readonly any[], U> = [...T, U];
type Unshift<T extends readonly any[], U> = [U, ...T];
type Pop<T extends readonly any[]> = T extends readonly [...infer Rest, any] ? Rest : [];
type Shift<T extends readonly any[]> = T extends readonly [any, ...infer Rest] ? Rest : [];

type PushedArray = Push<[1, 2, 3], 4>; // [1, 2, 3, 4]
type UnshiftedArray = Unshift<[2, 3, 4], 1>; // [1, 2, 3, 4]
type PoppedArray = Pop<[1, 2, 3, 4]>; // [1, 2, 3]
type ShiftedArray = Shift<[1, 2, 3, 4]>; // [2, 3, 4]

// Filter tuple by type
type Filter<T extends readonly any[], U> = T extends readonly [infer First, ...infer Rest]
  ? First extends U
    ? [First, ...Filter<Rest, U>]
    : Filter<Rest, U>
  : [];

type OnlyStrings = Filter<[1, "hello", 2, "world", true], string>; // ["hello", "world"]`,

    objects: `// Object type inference patterns

// Extract property type
type PropertyType<T, K extends keyof T> = T extends Record<K, infer P> ? P : never;

interface User {
  name: string;
  age: number;
  settings: {
    theme: string;
    notifications: boolean;
  };
}

type NameType = PropertyType<User, "name">; // string
type SettingsType = PropertyType<User, "settings">; // { theme: string; notifications: boolean; }

// Deep property extraction
type DeepPropertyType<T, K extends string> = K extends \`\${infer First}.\${infer Rest}\`
  ? First extends keyof T
    ? DeepPropertyType<T[First], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;

type ThemeType = DeepPropertyType<User, "settings.theme">; // string
type NotificationsType = DeepPropertyType<User, "settings.notifications">; // boolean

// Extract object keys as union
type Keys<T> = keyof T;
type UserKeys = Keys<User>; // "name" | "age" | "settings"

// Extract object values as union
type Values<T> = T[keyof T];
type UserValues = Values<User>; // string | number | { theme: string; notifications: boolean; }

// Object entries type
type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

type UserEntries = Entries<User>;
// ["name", string] | ["age", number] | ["settings", { theme: string; notifications: boolean; }]

// Partial object creation
type PartialBy<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

type PartialUserSettings = PartialBy<User, "settings">;
// { name: string; age: number; settings?: { theme: string; notifications: boolean; }; }

// Required fields extraction
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface PartialUser {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

type Required = RequiredKeys<PartialUser>; // "id" | "name"
type Optional = OptionalKeys<PartialUser>; // "email" | "phone"

// Mutable keys extraction
type MutableKeys<T> = {
  [K in keyof T]-?: Equal<Pick<T, K>, Readonly<Pick<T, K>>> extends true ? never : K;
}[keyof T];

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

interface MixedUser {
  readonly id: number;
  name: string;
  readonly email: string;
  age: number;
}

type MutableFields = MutableKeys<MixedUser>; // "name" | "age"

// Nested object flattening
type FlattenObject<T, Prefix extends string = ""> = {
  [K in keyof T as T[K] extends object
    ? T[K] extends any[]
      ? \`\${Prefix}\${string & K}\`
      : T[K] extends (...args: any[]) => any
        ? \`\${Prefix}\${string & K}\`
        : keyof FlattenObject<T[K], \`\${Prefix}\${string & K}.\`>
    : \`\${Prefix}\${string & K}\`]: T[K] extends object
    ? T[K] extends any[]
      ? T[K]
      : T[K] extends (...args: any[]) => any
        ? T[K]
        : FlattenObject<T[K], \`\${Prefix}\${string & K}.\`>[keyof FlattenObject<T[K], \`\${Prefix}\${string & K}.\`>]
    : T[K];
}[keyof T extends string ? keyof T : never];

// Path-based property access
type PathValue<T, P extends string> = P extends \`\${infer K}.\${infer Rest}\`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

type NestedValue = PathValue<User, "settings.theme">; // string`,

    advanced: `// Advanced infer patterns and edge cases

// Multiple infer constraints
type ExtractFromPromise<T> = T extends Promise<infer U>
  ? U extends Promise<infer V>
    ? ExtractFromPromise<V>
    : U extends Array<infer W>
      ? W
      : U
  : never;

type NestedPromiseArray = Promise<Promise<string[]>>;
type Extracted = ExtractFromPromise<NestedPromiseArray>; // string

// Infer with constraints
type ExtractArrayElement<T> = T extends (infer U extends string)[] ? U : never;

type StringElements = ExtractArrayElement<string[]>; // string
type NumberElements = ExtractArrayElement<number[]>; // never (constraint failed)

// Conditional infer with distribution
type ExtractFunctionNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

class ApiClient {
  get(url: string): Promise<any> { return Promise.resolve(); }
  post(url: string, data: any): Promise<any> { return Promise.resolve(); }
  baseUrl: string = "";
  timeout: number = 5000;
}

type ApiMethods = ExtractFunctionNames<ApiClient>; // "get" | "post"

// Recursive infer with termination
type DeepReadonly<T> = T extends any[]
  ? ReadonlyArray<DeepReadonly<T[number]>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

// Template literal parsing with infer
type ParseRoute<T extends string> = T extends \`/\${infer Segment}/\${infer Rest}\`
  ? Segment extends \`:$\{infer Param}\`
    ? { [K in Param]: string } & ParseRoute<\`/\${Rest}\`>
    : ParseRoute<\`/\${Rest}\`>
  : T extends \`/:$\{infer Param}\`
    ? { [K in Param]: string }
    : {};

type RouteParams = ParseRoute<"/users/:userId/posts/:postId">; 
// { userId: string; postId: string; }

// Function overload resolution with infer
type OverloadedFunction = {
  (x: string): string;
  (x: number): number;
  (x: boolean): boolean;
};

type ResolveOverload<T, Args extends any[]> = T extends {
  (...args: infer P): infer R;
  (...args: any[]): any;
}
  ? Args extends P
    ? R
    : T extends {
        (...args: any[]): any;
        (...args: infer P2): infer R2;
        (...args: any[]): any;
      }
      ? Args extends P2
        ? R2
        : never
      : never
  : never;

type StringOverload = ResolveOverload<OverloadedFunction, [string]>; // string
type NumberOverload = ResolveOverload<OverloadedFunction, [number]>; // number

// Class constructor parameter inference
type ConstructorParameters<T> = T extends abstract new (...args: infer P) => any ? P : never;
type InstanceType<T> = T extends abstract new (...args: any) => infer R ? R : any;

class DatabaseConnection {
  constructor(
    public host: string,
    public port: number,
    public options?: { ssl: boolean }
  ) {}
}

type DbConstructorParams = ConstructorParameters<typeof DatabaseConnection>;
// [string, number, { ssl: boolean }?]

type DbInstance = InstanceType<typeof DatabaseConnection>;
// DatabaseConnection

// Mapped type with infer
type InferredGetters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type UserGetters = InferredGetters<User>;
// {
//   getName: () => string;
//   getAge: () => number;
//   getSettings: () => { theme: string; notifications: boolean; };
// }

// Complex generic inference
type APIResponse<T> = {
  data: T;
  meta: {
    total: number;
    page: number;
  };
};

type ExtractAPIData<T> = T extends APIResponse<infer U> ? U : never;

type UsersResponse = APIResponse<User[]>;
type ExtractedUsers = ExtractAPIData<UsersResponse>; // User[]

// Variadic tuple inference
type VariadicFunction<T extends readonly any[]> = (...args: T) => void;

type InferVariadicArgs<T> = T extends VariadicFunction<infer Args> ? Args : never;

type TestVariadic = VariadicFunction<[string, number, boolean]>;
type VariadicArgs = InferVariadicArgs<TestVariadic>; // [string, number, boolean]`,

    recursive: `// Recursive patterns with infer

// Deep object path building
type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string | number
          ? \`\${K}\` | Join<K, Paths<T[K], Prev[D]>>
          : never;
      }[keyof T]
    : "";

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? \`\${K}.\${P}\`
    : never
  : never;

type UserPaths = Paths<User>;
// "name" | "age" | "settings" | "settings.theme" | "settings.notifications"

// Recursive tuple manipulation
type Concat<A extends readonly any[], B extends readonly any[]> = [...A, ...B];

type RecursiveConcat<T extends readonly (readonly any[])[]> = T extends readonly [
  infer First,
  ...infer Rest
]
  ? First extends readonly any[]
    ? Rest extends readonly (readonly any[])[]
      ? Concat<First, RecursiveConcat<Rest>>
      : First
    : []
  : [];

// Recursive tuple manipulation
type Concat<A extends readonly any[], B extends readonly any[]> = [...A, ...B];

type RecursiveConcat<T extends readonly (readonly any[])[]> = T extends readonly [
  infer First,
  ...infer Rest
]
  ? First extends readonly any[]
    ? Rest extends readonly (readonly any[])[]
      ? Concat<First, RecursiveConcat<Rest>>
      : First
    : []
  : [];

type ConcatenatedArrays = RecursiveConcat<[[1, 2], [3, 4], [5, 6]]>; // [1, 2, 3, 4, 5, 6]

// Recursive object merging
type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
      ? T[K]
      : never;
};

type BaseConfig = {
  api: {
    timeout: number;
    retries: number;
  };
  ui: {
    theme: string;
  };
};

type UserConfig = {
  api: {
    retries: 5;
    baseUrl: string;
  };
  logging: {
    level: string;
  };
};

type MergedConfig = DeepMerge<BaseConfig, UserConfig>;
// {
//   api: { timeout: number; retries: 5; baseUrl: string; };
//   ui: { theme: string; };
//   logging: { level: string; };
// }

// Tree traversal with infer
type TreeNode<T> = {
  value: T;
  children?: TreeNode<T>[];
};

type ExtractTreeValues<T> = T extends TreeNode<infer U>
  ? T["children"] extends TreeNode<U>[]
    ? U | ExtractTreeValues<T["children"][number]>
    : U
  : never;

type StringTree = TreeNode<string>;
type TreeValues = ExtractTreeValues<StringTree>; // string

// Recursive promise unwrapping
type DeepAwaited<T> = T extends Promise<infer U>
  ? DeepAwaited<U>
  : T extends (...args: any[]) => Promise<infer R>
    ? DeepAwaited<R>
    : T;

type NestedAsyncFunction = () => Promise<Promise<() => Promise<string>>>;
type FinalType = DeepAwaited<NestedAsyncFunction>; // string

// Recursive type building
type BuildArray<T, N extends number, Counter extends any[] = []> = Counter["length"] extends N
  ? Counter
  : BuildArray<T, N, [...Counter, T]>;

type FiveStrings = BuildArray<string, 5>; // [string, string, string, string, string]

// JSON parsing with recursive infer
type ParseJSON<T extends string> = T extends "null"
  ? null
  : T extends "true" | "false"
    ? T extends "true"
      ? true
      : false
    : T extends \`"\${infer S}"\`
      ? S
      : T extends \`\${infer N extends number}\`
        ? N
        : T extends \`[\${infer Items}]\`
          ? ParseArray<Items>
          : T extends \`{\${infer Props}}\`
            ? ParseObject<Props>
            : never;

type ParseArray<T extends string> = T extends ""
  ? []
  : T extends \`\${infer First},\${infer Rest}\`
    ? [ParseJSON<First>, ...ParseArray<Rest>]
    : [ParseJSON<T>];

type ParseObject<T extends string> = T extends ""
  ? {}
  : T extends \`"\${infer Key}": \${infer Value},\${infer Rest}\`
    ? { [K in Key]: ParseJSON<Value> } & ParseObject<Rest>
    : T extends \`"\${infer Key}": \${infer Value}\`
      ? { [K in Key]: ParseJSON<Value> }
      : {};

// Recursive validation chain
type ValidationChain<T, Rules extends readonly any[]> = Rules extends readonly [
  infer First,
  ...infer Rest
]
  ? First extends (value: T) => infer R
    ? R extends boolean
      ? ValidationChain<T, Rest>
      : never
    : never
  : T;

type ValidatedString = ValidationChain<
  string,
  [
    (s: string) => boolean, // minLength check
    (s: string) => boolean, // pattern check
    (s: string) => boolean  // custom validation
  ]
>; // string (if all validations pass)`
  },

  exercises: [
    `// Exercise 1: Create a type to extract all function parameter types from an object
type ExtractAllParamTypes<T> = // Your implementation here

interface ApiMethods {
  getUser: (id: string) => Promise<User>;
  createUser: (data: CreateUserData, options?: { validate: boolean }) => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}

type AllParamTypes = ExtractAllParamTypes<ApiMethods>;
// Should extract: string | CreateUserData | { validate: boolean } | Partial<User>`,

    `// Exercise 2: Build a type that parses CSS selectors
type ParseCSSSelector<T extends string> = // Your implementation here

type Selector1 = ParseCSSSelector<".my-class">; // { type: "class"; name: "my-class" }
type Selector2 = ParseCSSSelector<"#my-id">; // { type: "id"; name: "my-id" }
type Selector3 = ParseCSSSelector<"div.container#main">; // Complex parsing
type Selector4 = ParseCSSSelector<"button[disabled]">; // Attribute selector`,

    `// Exercise 3: Create a deep property setter type
type DeepSetter<T> = // Your implementation here

interface NestedConfig {
  database: {
    connection: {
      host: string;
      port: number;
    };
    pool: {
      min: number;
      max: number;
    };
  };
  cache: {
    ttl: number;
  };
}

type ConfigSetters = DeepSetter<NestedConfig>;
// Should generate setter functions for all nested properties
// e.g., setDatabaseConnectionHost: (value: string) => void`,

    `// Exercise 4: Build a type-safe query builder with infer
type QueryBuilder<T> = // Your implementation here

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  active: boolean;
}

type UserQuery = QueryBuilder<User>;
// Should support: where("name", "=", "John").where("age", ">", 18).select("name", "email")
// With proper type inference for field names, operators, and values`,

    `// Exercise 5: Create a recursive flattening type for complex nested structures
type DeepFlatten<T> = // Your implementation here

type ComplexNested = {
  a: {
    b: {
      c: string;
      d: number;
    };
    e: boolean;
  };
  f: {
    g: {
      h: {
        i: string;
      };
    };
  };
};

type Flattened = DeepFlatten<ComplexNested>;
// Should result in: { "a.b.c": string; "a.b.d": number; "a.e": boolean; "f.g.h.i": string; }`
  ],

  keyPoints: [
    "The 'infer' keyword can only be used within the extends clause of conditional types",
    "It introduces a type variable that TypeScript will attempt to infer from the type being checked",
    "Multiple infer variables can be used in the same conditional type",
    "Infer is essential for extracting types from complex generic structures",
    "It enables powerful utility types like ReturnType, Parameters, and Awaited",
    "Infer works with function types, array types, object types, and more complex structures",
    "Recursive patterns with infer allow for deep type transformations",
    "Infer with constraints (infer U extends SomeType) provides additional type safety",
    "It's commonly used in mapped types and template literal types for advanced transformations",
    "Understanding infer is crucial for building sophisticated type-level programming solutions",
    "Infer enables type-safe parsing and manipulation of string literal types",
    "It's the foundation for many advanced TypeScript patterns and utility libraries"
  ]
};

export default inferKeywordContent;