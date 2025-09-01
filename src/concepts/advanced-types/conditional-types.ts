// File location: src/data/concepts/advanced-types/conditional-types.ts

export interface ConditionalTypesContent {
  title: string;
  description: string;
  codeExamples: {
    basic: string;
    distributive: string;
    inference: string;
    practical: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const conditionalTypesContent: ConditionalTypesContent = {
  title: "Conditional Types",
  description: "Conditional types provide a way to express non-uniform type mappings. A conditional type selects one of two possible types based on a condition expressed as a type relationship test.",
  
  codeExamples: {
    basic: `// Basic conditional type syntax
// T extends U ? X : Y

type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>;    // true
type Test2 = IsString<number>;    // false
type Test3 = IsString<"hello">;   // true

// More complex conditions
type IsArray<T> = T extends any[] ? true : false;

type ArrayTest1 = IsArray<string[]>;  // true
type ArrayTest2 = IsArray<number>;    // false
type ArrayTest3 = IsArray<[1, 2, 3]>; // true

// Nested conditional types
type TypeName<T> = 
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type Example1 = TypeName<string>;     // "string"
type Example2 = TypeName<() => void>; // "function"
type Example3 = TypeName<{}>;         // "object"`,

    distributive: `// Distributive conditional types
// When the checked type is a naked type parameter, 
// the conditional type is called a distributive conditional type

type ToArray<T> = T extends any ? T[] : never;

// When T is a union type, it distributes over the union
type StrArrOrNumArr = ToArray<string | number>;
// Equivalent to: string[] | number[]

// Non-distributive conditional types (wrapped in tuple)
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;
type Test = ToArrayNonDistributive<string | number>;
// Result: (string | number)[]

// Practical example: Extract function types
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

interface Example {
  name: string;
  age: number;
  greet(): void;
  calculate(x: number): number;
}

type FunctionProps = FunctionPropertyNames<Example>;     // "greet" | "calculate"
type NonFunctionProps = NonFunctionPropertyNames<Example>; // "name" | "age"`,

    inference: `// Type inference with conditional types using 'infer'
// The 'infer' keyword can be used to infer types within conditional types

// Extract return type of a function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Func = (x: string, y: number) => boolean;
type Return = ReturnType<Func>; // boolean

// Extract parameter types
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type Params = Parameters<Func>; // [string, number]

// Extract the first parameter type
type FirstParameter<T> = T extends (first: infer F, ...args: any[]) => any ? F : never;
type First = FirstParameter<Func>; // string

// Extract array element type
type ElementType<T> = T extends (infer U)[] ? U : never;
type Element = ElementType<string[]>; // string

// Extract Promise resolution type
type Awaited<T> = T extends Promise<infer U> ? U : never;
type Result = Awaited<Promise<string>>; // string

// More complex inference - extract deep property type
type DeepProperty<T, K> = K extends \`\${infer First}.\${infer Rest}\`
  ? First extends keyof T
    ? DeepProperty<T[First], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;

interface User {
  profile: {
    settings: {
      theme: string;
    };
  };
}

type Theme = DeepProperty<User, "profile.settings.theme">; // string`,

    practical: `// Practical applications of conditional types

// 1. Exclude null and undefined
type NonNullable<T> = T extends null | undefined ? never : T;
type SafeString = NonNullable<string | null | undefined>; // string

// 2. Pick optional properties
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

type Optional = OptionalKeys<User>;  // "email" | "phone"
type Required = RequiredKeys<User>;  // "id" | "name"

// 3. Create a type that makes specific properties required
type RequireProps<T, K extends keyof T> = T & Required<Pick<T, K>>;
type UserWithEmail = RequireProps<User, "email">; // email is now required

// 4. Flatten nested arrays
type Flatten<T> = T extends (infer U)[] 
  ? U extends (infer V)[] 
    ? Flatten<U>
    : U
  : T;

type Nested = number[][][];
type Flat = Flatten<Nested>; // number

// 5. JSON serialization type
type Serialized<T> = T extends string | number | boolean | null
  ? T
  : T extends Function | undefined
    ? never
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : never;

interface ApiData {
  id: number;
  name: string;
  callback: () => void;
  metadata?: object;
}

type SerializedData = Serialized<ApiData>;
// { id: number; name: string; metadata?: {} }

// 6. Event handler type extraction
type EventHandler<T> = T extends \`on\${infer Event}\`
  ? \`handle\${Capitalize<Event>}\`
  : never;

type ClickHandler = EventHandler<"onClick">;    // "handleClick"
type SubmitHandler = EventHandler<"onSubmit">;  // "handleSubmit"

// 7. Deep readonly type
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object 
    ? DeepReadonly<T[K]>
    : T[K];
};

interface MutableUser {
  name: string;
  settings: {
    theme: string;
    notifications: {
      email: boolean;
    };
  };
}

type ImmutableUser = DeepReadonly<MutableUser>;
// All properties and nested properties become readonly`
  },

  exercises: [
    `// Exercise 1: Create a conditional type that checks if a type is a function
type IsFunction<T> = // Your implementation here

// Test cases:
type Test1 = IsFunction<() => void>;        // Should be true
type Test2 = IsFunction<string>;            // Should be false
type Test3 = IsFunction<(x: number) => boolean>; // Should be true`,

    `// Exercise 2: Create a type that extracts all string literal types from a union
type ExtractStrings<T> = // Your implementation here

// Test cases:
type Strings = ExtractStrings<"hello" | 42 | "world" | boolean>; // Should be "hello" | "world"`,

    `// Exercise 3: Create a conditional type that makes properties optional based on their type
type OptionalByType<T, U> = // Your implementation here

interface Example {
  id: number;
  name: string;
  callback: () => void;
  data: object;
}

type OptionalFunctions = OptionalByType<Example, Function>;
// Should make 'callback' optional while keeping others required`,

    `// Exercise 4: Create a type that deeply picks properties by path
type DeepPick<T, K> = // Your implementation here

interface Nested {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: string;
    };
  };
}

type UserName = DeepPick<Nested, "user.profile.name">; // Should be string`,

    `// Exercise 5: Create a conditional type that transforms object properties
type Transform<T, From, To> = // Your implementation here

interface Original {
  id: string;
  name: string;
  count: number;
}

type Transformed = Transform<Original, string, number>;
// Should transform all string properties to number`
  ],

  keyPoints: [
    "Conditional types use the syntax 'T extends U ? X : Y' to select between two types",
    "Distributive conditional types distribute over union types when the checked type is a naked type parameter",
    "The 'infer' keyword allows type inference within conditional types",
    "Conditional types are evaluated lazily and can create recursive type definitions",
    "They're essential for creating advanced utility types and type-safe APIs",
    "Non-distributive conditional types can be created by wrapping the type parameter in a tuple",
    "Conditional types enable powerful type transformations and validations",
    "They're commonly used in library development for creating flexible, type-safe interfaces"
  ]
};

export default conditionalTypesContent;