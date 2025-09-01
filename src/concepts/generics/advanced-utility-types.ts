// File location: src/data/concepts/generics/advanced-utility-types.ts

export interface AdvancedUtilityTypesContent {
  title: string;
  description: string;
  codeExamples: {
    recursive: string;
    computation: string;
    parsing: string;
    metaprogramming: string;
    advanced: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const advancedUtilityTypesContent: AdvancedUtilityTypesContent = {
  title: "Advanced Utility Types",
  description: "Advanced utility types push the boundaries of TypeScript's type system, enabling complex type-level computations, recursive transformations, and meta-programming patterns that provide powerful abstractions and compile-time guarantees.",
  
  codeExamples: {
    recursive: `// Recursive utility types for deep transformations

// ===== DEEP OBJECT MANIPULATION =====
// Deep partial that makes all nested properties optional
type DeepPartial<T> = T extends object
  ? T extends readonly any[]
    ? T
    : { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// Deep required that makes all nested properties required
type DeepRequired<T> = T extends object
  ? T extends readonly any[]
    ? T
    : { [P in keyof T]-?: DeepRequired<T[P]> }
  : T;

// Deep readonly that makes all nested properties readonly
type DeepReadonly<T> = T extends object
  ? T extends readonly any[]
    ? readonly DeepReadonly<T[number]>[]
    : { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

// Deep mutable that removes all readonly modifiers
type DeepMutable<T> = T extends object
  ? T extends readonly any[]
    ? DeepMutable<T[number]>[]
    : { -readonly [P in keyof T]: DeepMutable<T[P]> }
  : T;

interface ComplexNested {
  id: string;
  user: {
    profile: {
      personal: {
        name: string;
        age: number;
        contacts: {
          email: string;
          phone?: string;
        };
      };
      preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
        privacy: {
          showEmail: boolean;
          showAge: boolean;
        };
      };
    };
    settings: {
      language: string;
      timezone: string;
    };
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
}

type PartialComplex = DeepPartial<ComplexNested>;
// All nested properties become optional

type RequiredComplex = DeepRequired<PartialComplex>;
// All nested properties become required again

type ReadonlyComplex = DeepReadonly<ComplexNested>;
// All nested properties become readonly

type MutableComplex = DeepMutable<ReadonlyComplex>;
// All readonly modifiers removed

// ===== RECURSIVE PATH UTILITIES =====
// Generate all possible paths in an object
type Paths<T> = T extends object
  ? T extends readonly any[]
    ? never
    : {
        [K in keyof T]: K extends string | number
          ? T[K] extends object
            ? T[K] extends readonly any[]
              ? \`\${K}\` | \`\${K}.\${number}\`
              : \`\${K}\` | \`\${K}.\${Paths<T[K]>}\`
            : \`\${K}\`
          : never;
      }[keyof T]
  : never;

// Get value type at a specific path
type PathValue<T, P extends Paths<T> | keyof T> = 
  P extends keyof T
    ? T[P]
    : P extends \`\${infer K}.\${infer Rest}\`
      ? K extends keyof T
        ? Rest extends Paths<T[K]>
          ? PathValue<T[K], Rest>
          : never
        : never
      : never;

// Set value at a specific path
type SetPath<T, P extends Paths<T>, V> = 
  P extends keyof T
    ? Omit<T, P> & Record<P, V>
    : P extends \`\${infer K}.\${infer Rest}\`
      ? K extends keyof T
        ? Rest extends Paths<T[K]>
          ? Omit<T, K> & Record<K, SetPath<T[K], Rest, V>>
          : T
        : T
      : T;

type AllPaths = Paths<ComplexNested>;
// 'id' | 'user' | 'user.profile' | 'user.profile.personal' | 'user.profile.personal.name' | ...

type UserName = PathValue<ComplexNested, 'user.profile.personal.name'>;
// string

type WithUpdatedName = SetPath<ComplexNested, 'user.profile.personal.name', 'John Doe'>;
// ComplexNested with name changed to 'John Doe'

// ===== RECURSIVE ARRAY UTILITIES =====
// Flatten nested arrays recursively
type DeepFlatten<T> = T extends readonly (infer U)[]
  ? U extends readonly any[]
    ? DeepFlatten<U>
    : U
  : T;

type Nested1 = number[];
type Nested2 = number[][];
type Nested3 = number[][][];

type Flat1 = DeepFlatten<Nested1>; // number
type Flat2 = DeepFlatten<Nested2>; // number
type Flat3 = DeepFlatten<Nested3>; // number

// Get depth of nested arrays
type ArrayDepth<T> = T extends readonly (infer U)[]
  ? U extends readonly any[]
    ? ArrayDepth<U> extends infer D
      ? D extends number
        ? [never, 0, 1, 2, 3, 4, 5][D] extends infer Next
          ? Next extends number
            ? Next
            : never
          : never
        : never
      : never
    : 0
  : never;

type Depth1 = ArrayDepth<number[]>; // 0
type Depth2 = ArrayDepth<number[][]>; // 1
type Depth3 = ArrayDepth<number[][][]>; // 2

// ===== RECURSIVE FUNCTION COMPOSITION =====
// Compose multiple functions recursively
type ComposeFunctions<T extends readonly any[]> = T extends readonly [
  (...args: any[]) => infer R1,
  (arg: R1) => infer R2,
  ...infer Rest
]
  ? Rest extends readonly any[]
    ? Rest['length'] extends 0
      ? (arg: R1) => R2
      : ComposeFunctions<[(arg: R1) => R2, ...Rest]>
    : never
  : T extends readonly [(arg: infer P) => infer R]
    ? (arg: P) => R
    : never;

type Pipeline = ComposeFunctions<[
  (x: string) => number,
  (x: number) => boolean,
  (x: boolean) => string,
  (x: string) => Date
]>;
// (x: string) => Date

// ===== RECURSIVE VALIDATION SCHEMAS =====
// Create recursive validation schema
type ValidationSchema<T> = T extends object
  ? T extends readonly any[]
    ? {
        type: 'array';
        items: ValidationSchema<T[number]>;
        minLength?: number;
        maxLength?: number;
      }
    : {
        type: 'object';
        properties: {
          [K in keyof T]: ValidationSchema<T[K]>;
        };
        required?: (keyof T)[];
      }
  : T extends string
    ? {
        type: 'string';
        minLength?: number;
        maxLength?: number;
        pattern?: string;
      }
    : T extends number
      ? {
          type: 'number';
          min?: number;
          max?: number;
        }
      : T extends boolean
        ? { type: 'boolean' }
        : { type: 'unknown' };

type ComplexSchema = ValidationSchema<ComplexNested>;
// Generates a complete validation schema structure

// ===== RECURSIVE TYPE GUARDS =====
// Create recursive type guards
type TypeGuard<T> = (value: unknown) => value is T;

type RecursiveTypeGuard<T> = T extends object
  ? T extends readonly any[]
    ? (value: unknown) => value is T
    : {
        [K in keyof T]: RecursiveTypeGuard<T[K]>;
      } & TypeGuard<T>
  : TypeGuard<T>;

function createRecursiveGuard<T>(schema: ValidationSchema<T>): RecursiveTypeGuard<T> {
  // Implementation would create nested type guards
  return ((value: unknown): value is T => {
    // Recursive validation logic
    return true; // Simplified
  }) as RecursiveTypeGuard<T>;
}`,

    computation: `// Type-level computation and arithmetic

// ===== BASIC ARITHMETIC =====
// Define number literals up to a reasonable limit
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Tuple<N extends number, Result extends unknown[] = []> = 
  Result['length'] extends N ? Result : Tuple<N, [...Result, unknown]>;

type Length<T extends readonly unknown[]> = T['length'];

// Addition using tuple length
type Add<A extends number, B extends number> = 
  Length<[...Tuple<A>, ...Tuple<B>]>;

// Subtraction using conditional types
type Subtract<A extends number, B extends number> = 
  Tuple<A> extends [...Tuple<B>, ...infer Rest] 
    ? Length<Rest> 
    : never;

// Multiplication using recursive addition
type Multiply<A extends number, B extends number, Counter extends unknown[] = [], Acc extends unknown[] = []> =
  Counter['length'] extends B
    ? Length<Acc>
    : Multiply<A, B, [...Counter, unknown], [...Acc, ...Tuple<A>]>;

// Division (integer division)
type Divide<A extends number, B extends number, Counter extends unknown[] = []> =
  A extends 0
    ? 0
    : [...Counter, ...Tuple<B>]['length'] extends A
      ? Length<[...Counter, unknown]>
      : [...Counter, ...Tuple<B>]['length'] extends infer Current
        ? Current extends number
          ? Current extends A
            ? Length<[...Counter, unknown]>
            : Current extends Add<A, infer _>
              ? Length<Counter>
              : Divide<A, B, [...Counter, unknown]>
          : never
        : never;

// Test arithmetic operations
type Sum = Add<3, 4>; // 7
type Difference = Subtract<10, 3>; // 7
type Product = Multiply<3, 4>; // 12
type Quotient = Divide<12, 3>; // 4

// ===== COMPARISON OPERATIONS =====
type IsGreater<A extends number, B extends number> = 
  [A, B] extends [B, A] 
    ? false
    : Tuple<B> extends [...Tuple<A>, ...unknown[]]
      ? false
      : true;

type IsLess<A extends number, B extends number> = 
  [A, B] extends [B, A] 
    ? false
    : Tuple<A> extends [...Tuple<B>, ...unknown[]]
      ? false
      : true;

type IsEqual<A extends number, B extends number> = A extends B ? B extends A ? true : false : false;

type Max<A extends number, B extends number> = IsGreater<A, B> extends true ? A : B;
type Min<A extends number, B extends number> = IsLess<A, B> extends true ? A : B;

// Test comparisons
type IsGreaterTest = IsGreater<5, 3>; // true
type IsLessTest = IsLess<3, 5>; // true
type IsEqualTest = IsEqual<4, 4>; // true
type MaxValue = Max<8, 12>; // 12
type MinValue = Min<8, 12>; // 8

// ===== FIBONACCI SEQUENCE =====
type Fibonacci<N extends number, Current extends unknown[] = [unknown], Next extends unknown[] = [unknown], Counter extends unknown[] = []> =
  Counter['length'] extends N
    ? Length<Current>
    : Fibonacci<N, Next, [...Current, ...Next], [...Counter, unknown]>;

type Fib0 = Fibonacci<0>; // 1
type Fib1 = Fibonacci<1>; // 1
type Fib5 = Fibonacci<5>; // 8
type Fib7 = Fibonacci<7>; // 21

// ===== FACTORIAL =====
type Factorial<N extends number, Counter extends unknown[] = [unknown], Acc extends unknown[] = [unknown]> =
  Counter['length'] extends N
    ? Length<Acc>
    : Factorial<N, [...Counter, unknown], [...Acc, ...Acc, ...Repeat<Acc, Counter['length']>]>;

type Repeat<T extends unknown[], N extends number, Counter extends unknown[] = [], Acc extends unknown[] = []> =
  Counter['length'] extends N
    ? Acc
    : Repeat<T, N, [...Counter, unknown], [...Acc, ...T]>;

// Simplified factorial for small numbers
type SimpleFactorial<N extends number> = 
  N extends 0 ? 1
  : N extends 1 ? 1
  : N extends 2 ? 2
  : N extends 3 ? 6
  : N extends 4 ? 24
  : N extends 5 ? 120
  : never;

type Fact3 = SimpleFactorial<3>; // 6
type Fact4 = SimpleFactorial<4>; // 24
type Fact5 = SimpleFactorial<5>; // 120

// ===== PRIME NUMBER CHECK =====
type IsDivisible<A extends number, B extends number> = 
  Multiply<Divide<A, B>, B> extends A ? true : false;

type IsPrime<N extends number, Divisor extends number = 2> =
  N extends 0 | 1 ? false
  : N extends 2 ? true
  : IsGreater<Multiply<Divisor, Divisor>, N> extends true
    ? true
    : IsDivisible<N, Divisor> extends true
      ? false
      : IsPrime<N, Add<Divisor, 1>>;

// Note: These would work for very small numbers due to TypeScript's recursion limits
type IsPrime2 = IsPrime<2>; // true
type IsPrime4 = IsPrime<4>; // false

// ===== ARRAY OPERATIONS =====
// Sum all numbers in a tuple
type SumArray<T extends readonly number[], Acc extends number = 0> = 
  T extends readonly [infer First, ...infer Rest]
    ? First extends number
      ? Rest extends readonly number[]
        ? SumArray<Rest, Add<Acc, First>>
        : Acc
      : Acc
    : Acc;

type ArraySum = SumArray<[1, 2, 3, 4]>; // 10

// Find maximum in array
type MaxArray<T extends readonly number[], Current extends number = 0> =
  T extends readonly [infer First, ...infer Rest]
    ? First extends number
      ? Rest extends readonly number[]
        ? MaxArray<Rest, Max<Current, First>>
        : Max<Current, First>
      : Current
    : Current;

type ArrayMax = MaxArray<[3, 7, 2, 9, 1]>; // 9

// Count occurrences of a value in array
type CountInArray<T extends readonly any[], Value, Counter extends unknown[] = []> =
  T extends readonly [infer First, ...infer Rest]
    ? First extends Value
      ? CountInArray<Rest, Value, [...Counter, unknown]>
      : CountInArray<Rest, Value, Counter>
    : Length<Counter>;

type CountOnes = CountInArray<[1, 2, 1, 3, 1], 1>; // 3

// ===== ADVANCED MATHEMATICAL OPERATIONS =====
// GCD (Greatest Common Divisor) using Euclidean algorithm
type GCD<A extends number, B extends number> =
  B extends 0
    ? A
    : GCD<B, Subtract<A, Multiply<Divide<A, B>, B>>>;

// Simplified GCD for demonstration
type SimpleGCD<A extends number, B extends number> =
  [A, B] extends [12, 8] ? 4
  : [A, B] extends [15, 10] ? 5
  : [A, B] extends [21, 14] ? 7
  : never;

type GCD12_8 = SimpleGCD<12, 8>; // 4

// LCM (Least Common Multiple)
type LCM<A extends number, B extends number> = 
  Divide<Multiply<A, B>, GCD<A, B>>;

// Power operation (limited to small exponents)
type Power<Base extends number, Exp extends number, Counter extends unknown[] = [], Acc extends number = 1> =
  Counter['length'] extends Exp
    ? Acc
    : Power<Base, Exp, [...Counter, unknown], Multiply<Acc, Base>>;

type TwoToTheFourth = Power<2, 4>; // 16

// ===== COMBINATORICS =====
// Permutations: P(n,r) = n! / (n-r)!
type Permutations<N extends number, R extends number> = 
  Divide<SimpleFactorial<N>, SimpleFactorial<Subtract<N, R>>>;

// Combinations: C(n,r) = n! / (r! * (n-r)!)
type Combinations<N extends number, R extends number> = 
  Divide<SimpleFactorial<N>, Multiply<SimpleFactorial<R>, SimpleFactorial<Subtract<N, R>>>>;

// Example: C(5,2) = 5!/(2! * 3!) = 120/(2 * 6) = 10
type Choose5From2 = Combinations<5, 2>; // Would be 10 with full implementation`,

    parsing: `// Type-level parsing and string manipulation

// ===== STRING PARSING UTILITIES =====
// Split string by delimiter
type Split<S extends string, Delimiter extends string> = 
  S extends \`\${infer First}\${Delimiter}\${infer Rest}\`
    ? [First, ...Split<Rest, Delimiter>]
    : [S];

type SplitPath = Split<'user.profile.name', '.'>; // ['user', 'profile', 'name']
type SplitUrl = Split<'api/v1/users/123', '/'>; // ['api', 'v1', 'users', '123']

// Join array of strings
type Join<T extends readonly string[], Delimiter extends string = ''> = 
  T extends readonly [infer First, ...infer Rest]
    ? First extends string
      ? Rest extends readonly string[]
        ? Rest['length'] extends 0
          ? First
          : \`\${First}\${Delimiter}\${Join<Rest, Delimiter>}\`
        : First
      : ''
    : '';

type JoinPath = Join<['user', 'profile', 'name'], '.'>; // 'user.profile.name'
type JoinCsv = Join<['apple', 'banana', 'cherry'], ', '>; // 'apple, banana, cherry'

// Reverse string
type ReverseString<S extends string> = 
  S extends \`\${infer First}\${infer Rest}\`
    ? \`\${ReverseString<Rest>}\${First}\`
    : '';

type Reversed = ReverseString<'hello'>; // 'olleh'

// String length
type StringLength<S extends string, Counter extends unknown[] = []> = 
  S extends \`\${string}\${infer Rest}\`
    ? StringLength<Rest, [...Counter, unknown]>
    : Counter['length'];

type Length5 = StringLength<'hello'>; // 5

// ===== CASE CONVERSIONS =====
// Convert to different cases
type ToUpperCase<S extends string> = Uppercase<S>;
type ToLowerCase<S extends string> = Lowercase<S>;
type ToCapitalize<S extends string> = Capitalize<S>;
type ToUncapitalize<S extends string> = Uncapitalize<S>;

// CamelCase to kebab-case
type CamelToKebab<S extends string> = 
  S extends \`\${infer First}\${infer Rest}\`
    ? First extends Uppercase<First>
      ? First extends Lowercase<First>
        ? \`\${First}\${CamelToKebab<Rest>}\`
        : \`-\${Lowercase<First>}\${CamelToKebab<Rest>}\`
      : \`\${First}\${CamelToKebab<Rest>}\`
    : '';

type KebabCase1 = CamelToKebab<'backgroundColor'>; // '-background-color' (would need refinement)
type KebabCase2 = CamelToKebab<'fontSize'>; // '-font-size'

// kebab-case to CamelCase
type KebabToCamel<S extends string> = 
  S extends \`\${infer First}-\${infer Rest}\`
    ? \`\${First}\${Capitalize<KebabToCamel<Rest>>}\`
    : S;

type CamelCase1 = KebabToCamel<'background-color'>; // 'backgroundColor'
type CamelCase2 = KebabToCamel<'font-size'>; // 'fontSize'

// Snake_case to CamelCase
type SnakeToCamel<S extends string> = 
  S extends \`\${infer First}_\${infer Rest}\`
    ? \`\${First}\${Capitalize<SnakeToCamel<Rest>>}\`
    : S;

type FromSnake = SnakeToCamel<'user_profile_name'>; // 'userProfileName'

// ===== ADVANCED STRING PARSING =====
// Parse URL with parameters
type ParseUrl<T extends string> = 
  T extends \`\${infer Protocol}://\${infer Rest}\`
    ? ParseUrlRest<Rest> & { protocol: Protocol }
    : ParseUrlRest<T>;

type ParseUrlRest<T extends string> = 
  T extends \`\${infer Host}/\${infer Path}\`
    ? { host: Host; path: \`/\${Path}\` }
    : { host: T; path: '/' };

type UrlParts = ParseUrl<'https://api.example.com/users/123'>; 
// { protocol: 'https'; host: 'api.example.com'; path: '/users/123' }

// Extract path parameters
type ExtractPathParams<T extends string> = 
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param]: string } & ExtractPathParams<Rest>
    : T extends \`\${string}:\${infer Param}\`
      ? { [K in Param]: string }
      : {};

type ApiParams = ExtractPathParams<'/users/:userId/posts/:postId/comments/:commentId'>;
// { userId: string; postId: string; commentId: string }

// ===== CSS SELECTOR PARSING =====
// Parse CSS selectors
type ParseSelector<T extends string> = 
  T extends \`#\${infer Id}\`
    ? { type: 'id'; value: Id }
    : T extends \`.\${infer Class}\`
      ? { type: 'class'; value: Class }
      : T extends \`[\${infer Attr}]\`
        ? { type: 'attribute'; value: Attr }
        : { type: 'element'; value: T };

type Selector1 = ParseSelector<'#header'>; // { type: 'id'; value: 'header' }
type Selector2 = ParseSelector<'.nav-item'>; // { type: 'class'; value: 'nav-item' }
type Selector3 = ParseSelector<'[data-test]'>; // { type: 'attribute'; value: 'data-test' }

// ===== QUERY STRING PARSING =====
// Parse query string parameters
type ParseQueryString<T extends string> = 
  T extends \`\${infer Key}=\${infer Value}&\${infer Rest}\`
    ? { [K in Key]: Value } & ParseQueryString<Rest>
    : T extends \`\${infer Key}=\${infer Value}\`
      ? { [K in Key]: Value }
      : {};

type QueryParams = ParseQueryString<'page=1&limit=10&sort=name&active=true'>;
// { page: '1'; limit: '10'; sort: 'name'; active: 'true' }

// ===== EMAIL VALIDATION =====
// Basic email structure validation at type level
type IsEmail<T extends string> = 
  T extends \`\${string}@\${string}.\${string}\`
    ? true
    : false;

type ValidEmail = IsEmail<'user@example.com'>; // true
type InvalidEmail = IsEmail<'notanemail'>; // false

// ===== JSON PATH PARSING =====
// Parse JSONPath expressions
type ParseJsonPath<T extends string> = 
  T extends \`$.\${infer Path}\`
    ? Split<Path, '.'>
    : T extends \`$[\${infer Index}]\`
      ? [Index]
      : never;

type JsonPath1 = ParseJsonPath<'$.user.profile.name'>; // ['user', 'profile', 'name']
type JsonPath2 = ParseJsonPath<'$[0]'>; // ['0']

// ===== TEMPLATE LITERAL VALIDATION =====
// Validate template literal patterns
type ValidateFormat<T extends string, Pattern extends string> = 
  Pattern extends \`\${infer Before}{\${infer Variable}}\${infer After}\`
    ? T extends \`\${Before}\${string}\${After}\`
      ? true
      : false
    : T extends Pattern
      ? true
      : false;

type ValidFormat1 = ValidateFormat<'Hello John!', 'Hello {name}!'>; // true
type ValidFormat2 = ValidateFormat<'Goodbye!', 'Hello {name}!'>; // false

// Extract variables from template
type ExtractVariables<T extends string> = 
  T extends \`\${string}{\${infer Variable}}\${infer Rest}\`
    ? [Variable, ...ExtractVariables<Rest>]
    : [];

type Variables = ExtractVariables<'Hello {name}, you have {count} messages!'>; 
// ['name', 'count']

// ===== SQL QUERY PARSING =====
// Basic SQL SELECT parsing
type ParseSelect<T extends string> = 
  T extends \`SELECT \${infer Columns} FROM \${infer Table}\`
    ? {
        type: 'SELECT';
        columns: Split<Columns, ', '>;
        table: Table;
      }
    : never;

type SelectQuery = ParseSelect<'SELECT id, name, email FROM users'>;
// { type: 'SELECT'; columns: ['id', 'name', 'email']; table: 'users' }

// ===== MARKDOWN PARSING =====
// Parse markdown headers
type ParseMarkdownHeader<T extends string> = 
  T extends \`# \${infer Title}\`
    ? { level: 1; title: Title }
    : T extends \`## \${infer Title}\`
      ? { level: 2; title: Title }
      : T extends \`### \${infer Title}\`
        ? { level: 3; title: Title }
        : never;

type Header1 = ParseMarkdownHeader<'# Main Title'>; // { level: 1; title: 'Main Title' }
type Header2 = ParseMarkdownHeader<'## Subtitle'>; // { level: 2; title: 'Subtitle' }`,

    metaprogramming: `// Type-level meta-programming and reflection

// ===== TYPE REFLECTION =====
// Get detailed information about types
type TypeInfo<T> = T extends string
  ? { kind: 'string'; type: T }
  : T extends number
    ? { kind: 'number'; type: T }
    : T extends boolean
      ? { kind: 'boolean'; type: T }
      : T extends undefined
        ? { kind: 'undefined'; type: T }
        : T extends null
          ? { kind: 'null'; type: T }
          : T extends (...args: any[]) => any
            ? { kind: 'function'; type: T; parameters: Parameters<T>; returnType: ReturnType<T> }
            : T extends readonly any[]
              ? { kind: 'array'; type: T; element: T[number] }
              : T extends object
                ? { kind: 'object'; type: T; keys: keyof T }
                : { kind: 'unknown'; type: T };

type StringInfo = TypeInfo<'hello'>; 
// { kind: 'string'; type: 'hello' }

type FunctionInfo = TypeInfo<(a: string, b: number) => boolean>;
// { kind: 'function'; type: ...; parameters: [string, number]; returnType: boolean }

type ArrayInfo = TypeInfo<string[]>;
// { kind: 'array'; type: string[]; element: string }

// ===== INTERFACE ANALYSIS =====
// Analyze interface structure
type InterfaceAnalysis<T extends Record<string, any>> = {
  properties: keyof T;
  optionalProperties: {
    [K in keyof T]: undefined extends T[K] ? K : never;
  }[keyof T];
  requiredProperties: {
    [K in keyof T]: undefined extends T[K] ? never : K;
  }[keyof T];
  methods: {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
  }[keyof T];
  dataProperties: {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
  }[keyof T];
};

interface ExampleInterface {
  id: string;
  name?: string;
  count: number;
  isActive: boolean;
  calculate(x: number): number;
  process(): void;
  metadata?: Record<string, any>;
}

type Analysis = InterfaceAnalysis<ExampleInterface>;
// {
//   properties: 'id' | 'name' | 'count' | 'isActive' | 'calculate' | 'process' | 'metadata';
//   optionalProperties: 'name' | 'metadata';
//   requiredProperties: 'id' | 'count' | 'isActive' | 'calculate' | 'process';
//   methods: 'calculate' | 'process';
//   dataProperties: 'id' | 'name' | 'count' | 'isActive' | 'metadata';
// }

// ===== DEPENDENCY INJECTION CONTAINER =====
// Type-safe dependency injection
type ServiceDefinition<T = any> = {
  factory: () => T;
  singleton?: boolean;
  dependencies?: string[];
};

type ServiceRegistry = Record<string, ServiceDefinition>;

type InferServices<T extends ServiceRegistry> = {
  [K in keyof T]: T[K] extends ServiceDefinition<infer S> ? S : never;
};

type Container<T extends ServiceRegistry> = {
  get<K extends keyof T>(key: K): InferServices<T>[K];
  register<K extends string, S>(key: K, definition: ServiceDefinition<S>): Container<T & Record<K, ServiceDefinition<S>>>;
};

// Usage example
const serviceRegistry = {
  logger: {
    factory: () => ({ log: (msg: string) => console.log(msg) }),
    singleton: true
  },
  database: {
    factory: () => ({ query: (sql: string) => [] }),
    dependencies: ['logger']
  }
} as const;

type Services = InferServices<typeof serviceRegistry>;
// {
//   logger: { log: (msg: string) => void };
//   database: { query: (sql: string) => never[] };
// }

// ===== PLUGIN ARCHITECTURE =====
// Type-safe plugin system
interface Plugin<TName extends string, TApi = {}, TConfig = {}> {
  name: TName;
  api?: TApi;
  config?: TConfig;
  dependencies?: string[];
  init?: (context: PluginContext) => void | Promise<void>;
  destroy?: () => void | Promise<void>;
}

type PluginContext = {
  getPlugin: <T>(name: string) => T;
  config: Record<string, any>;
  logger: { log: (msg: string) => void };
};

type PluginRegistry<T extends Plugin<any, any, any>[]> = {
  [P in T[number] as P['name']]: P;
};

type PluginApis<T extends Plugin<any, any, any>[]> = {
  [P in T[number] as P['name']]: P extends Plugin<any, infer Api, any> ? Api : {};
};

// Example plugins
type AuthPlugin = Plugin<'auth', {
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
}, {
  secret: string;
  tokenExpiry: number;
}>;

type CachePlugin = Plugin<'cache', {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
}, {
  maxSize: number;
  ttl: number;
}>;

type MyPlugins = [AuthPlugin, CachePlugin];
type MyRegistry = PluginRegistry<MyPlugins>;
type MyApis = PluginApis<MyPlugins>;

// ===== ORM-LIKE QUERY BUILDER =====
// Type-safe query builder
type QueryBuilder<T extends Record<string, any>> = {
  select<K extends keyof T>(...keys: K[]): QueryBuilder<Pick<T, K>>;
  where<K extends keyof T>(key: K, operator: '=' | '!=' | '>' | '<', value: T[K]): QueryBuilder<T>;
  orderBy<K extends keyof T>(key: K, direction?: 'asc' | 'desc'): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  join<U extends Record<string, any>, K extends keyof T, FK extends keyof U>(
    table: QueryBuilder<U>,
    localKey: K,
    foreignKey: FK
  ): QueryBuilder<T & U>;
  execute(): Promise<T[]>;
};

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  userId: number;
}

// Usage would be:
// const users = new QueryBuilder<User>()
//   .select('id', 'name', 'email')
//   .where('age', '>', 18)
//   .orderBy('name')
//   .limit(10)
//   .execute();

// ===== VALIDATION SCHEMA GENERATOR =====
// Generate validation schemas from types
type ValidationRule<T> = T extends string
  ? {
      type: 'string';
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      enum?: string[];
    }
  : T extends number
    ? {
        type: 'number';
        min?: number;
        max?: number;
        integer?: boolean;
      }
    : T extends boolean
      ? { type: 'boolean' }
      : T extends Date
        ? {
            type: 'date';
            min?: Date;
            max?: Date;
          }
        : T extends (infer U)[]
          ? {
              type: 'array';
              items: ValidationRule<U>;
              minItems?: number;
              maxItems?: number;
            }
          : T extends Record<string, any>
            ? {
                type: 'object';
                properties: {
                  [K in keyof T]: ValidationRule<T[K]>;
                };
                required: (keyof T)[];
              }
            : { type: 'any' };

type UserValidation = ValidationRule<User>;
// Complex nested validation structure

// ===== STATE MACHINE BUILDER =====
// Type-safe finite state machine
type StateMachine<
  TStates extends string,
  TEvents extends string,
  TTransitions extends Array<{ from: TStates; event: TEvents; to: TStates }>
> = {
  currentState: TStates;
  transition(event: TEvents): TStates;
  canTransition(event: TEvents): boolean;
  getAvailableEvents(): TEvents[];
};

type TrafficLightStates = 'red' | 'yellow' | 'green';
type TrafficLightEvents = 'timer' | 'emergency';

type TrafficLightTransitions = [
  { from: 'red'; event: 'timer'; to: 'green' },
  { from: 'green'; event: 'timer'; to: 'yellow' },
  { from: 'yellow'; event: 'timer'; to: 'red' },
  { from: 'red'; event: 'emergency'; to: 'green' },
  { from: 'green'; event: 'emergency'; to: 'red' },
  { from: 'yellow'; event: 'emergency'; to: 'red' }
];

type TrafficLight = StateMachine<TrafficLightStates, TrafficLightEvents, TrafficLightTransitions>;

// ===== MACRO SYSTEM =====
// Template-based code generation
type MacroTemplate<T extends string> = T extends \`@\${infer MacroName}(\${infer Args})\`
  ? { macro: MacroName; args: Split<Args, ','> }
  : never;

type ExpandMacro<T extends { macro: string; args: string[] }> = 
  T extends { macro: 'getter'; args: [infer Property] }
    ? Property extends string
      ? \`get\${Capitalize<Property>}(): this.\${Property} { return this._\${Property}; }\`
      : never
    : T extends { macro: 'setter'; args: [infer Property, infer Type] }
      ? Property extends string
        ? Type extends string
          ? \`set\${Capitalize<Property>}(value: \${Type}): void { this._\${Property} = value; }\`
          : never
        : never
      : never;

type GetterMacro = MacroTemplate<'@getter(name)'>;
type SetterMacro = MacroTemplate<'@setter(age,number)'>;

type ExpandedGetter = ExpandMacro<GetterMacro>;
// 'getName(): this.name { return this._name; }'

type ExpandedSetter = ExpandMacro<SetterMacro>;
// 'setAge(value: number): void { this._age = value; }'`,

    advanced: `// Most advanced type-level programming patterns

// ===== TYPE-LEVEL INTERPRETER =====
// Simple expression language interpreter at type level
type Expression = 
  | { type: 'number'; value: number }
  | { type: 'add'; left: Expression; right: Expression }
  | { type: 'multiply'; left: Expression; right: Expression }
  | { type: 'variable'; name: string };

type Environment = Record<string, number>;

type Evaluate<E extends Expression, Env extends Environment = {}> = 
  E extends { type: 'number'; value: infer N }
    ? N
    : E extends { type: 'variable'; name: infer Name }
      ? Name extends keyof Env
        ? Env[Name]
        : never
      : E extends { type: 'add'; left: infer L; right: infer R }
        ? L extends Expression
          ? R extends Expression
            ? Add<Evaluate<L, Env>, Evaluate<R, Env>>
            : never
          : never
        : E extends { type: 'multiply'; left: infer L; right: infer R }
          ? L extends Expression
            ? R extends Expression
              ? Multiply<Evaluate<L, Env>, Evaluate<R, Env>>
              : never
            : never
          : never;

type SimpleExpr = {
  type: 'add';
  left: { type: 'number'; value: 5 };
  right: { type: 'number'; value: 3 };
};

type ExprResult = Evaluate<SimpleExpr>; // 8

// ===== ADVANCED PATTERN MATCHING =====
// Pattern matching system
type Pattern<T> = 
  | { type: 'literal'; value: T }
  | { type: 'wildcard' }
  | { type: 'guard'; pattern: Pattern<T>; condition: (value: T) => boolean };

type Match<T, Patterns extends Array<{ pattern: Pattern<T>; result: any }>> = 
  Patterns extends [infer First, ...infer Rest]
    ? First extends { pattern: Pattern<T>; result: infer R }
      ? Rest extends Array<{ pattern: Pattern<T>; result: any }>
        ? R | Match<T, Rest>
        : R
      : never
    : never;

// Usage would require runtime implementation for full functionality

// ===== COMPILE-TIME UNIT SYSTEM =====
// Physics units at type level
type Unit = {
  mass: number;
  length: number;
  time: number;
};

type Quantity<T extends Unit, Value extends number = number> = {
  value: Value;
  unit: T;
};

type Kilogram = { mass: 1; length: 0; time: 0 };
type Meter = { mass: 0; length: 1; time: 0 };
type Second = { mass: 0; length: 0; time: 1 };
type Newton = { mass: 1; length: 1; time: -2 };

type AddUnits<A extends Unit, B extends Unit> = {
  mass: Add<A['mass'], B['mass']>;
  length: Add<A['length'], B['length']>;
  time: Add<A['time'], B['time']>;
};

type MultiplyQuantities<
  A extends Quantity<Unit, number>,
  B extends Quantity<Unit, number>
> = Quantity<
  AddUnits<A['unit'], B['unit']>,
  Multiply<A['value'], B['value']>
>;

// Force = Mass × Acceleration
type Mass = Quantity<Kilogram, 10>;
type Acceleration = Quantity<{ mass: 0; length: 1; time: -2 }, 2>;
type Force = MultiplyQuantities<Mass, Acceleration>; // Should be Newton with value 20

// ===== ADVANCED ERROR HANDLING =====
// Compile-time error propagation
type Result<T, E = string> = 
  | { success: true; value: T; error?: never }
  | { success: false; value?: never; error: E };

type Chain<T, U, E> = T extends { success: true; value: infer V }
  ? (value: V) => Result<U, E>
  : T;

type Sequence<Operations extends readonly any[]> = 
  Operations extends readonly [infer First, ...infer Rest]
    ? First extends Result<any, any>
      ? First extends { success: true }
        ? Rest extends readonly any[]
          ? Sequence<Rest>
          : First
        : First
      : never
    : { success: true; value: undefined };

// ===== TYPE-LEVEL DATABASE QUERIES =====
// SQL-like operations at type level
type Table<T extends Record<string, any>> = T[];

type Select<T extends Table<any>, Columns extends keyof T[0]> = 
  T extends Table<infer Row>
    ? Table<Pick<Row, Columns>>
    : never;

type Where<T extends Table<any>, Condition> = 
  T extends Table<infer Row>
    ? Row extends Condition
      ? T
      : Table<never>
    : never;

type Join<
  T1 extends Table<any>,
  T2 extends Table<any>,
  K1 extends keyof T1[0],
  K2 extends keyof T2[0]
> = T1 extends Table<infer Row1>
  ? T2 extends Table<infer Row2>
    ? Table<Row1 & Row2>
    : never
  : never;

// ===== PROOF SYSTEM =====
// Simple theorem proving at type level
type Proposition = string;

type Proof<P extends Proposition> = {
  proposition: P;
  premises: Proposition[];
  rule: string;
};

type ValidProof<P extends Proof<any>> = 
  P extends Proof<'A -> B'>
    ? P['premises'] extends ['A']
      ? true
      : false
    : P extends Proof<'A'>
      ? P['premises'] extends []
        ? true
        : false
      : false;

type ModusPonens = Proof<'B'> & {
  premises: ['A', 'A -> B'];
  rule: 'modus-ponens';
};

type ValidMP = ValidProof<ModusPonens>; // Would be true with full implementation

// ===== CONSTRAINT SOLVING =====
// Simple constraint solver at type level
type Constraint<T extends Record<string, number>> = {
  variables: (keyof T)[];
  equations: Array<{
    left: keyof T;
    operator: '=' | '<' | '>';
    right: keyof T | number;
  }>;
};

type Solve<C extends Constraint<any>> = 
  C extends Constraint<infer Variables>
    ? Partial<Variables>
    : never;

// ===== CATEGORY THEORY CONCEPTS =====
// Basic category theory structures
type Functor<F> = {
  map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>;
};

type Monad<M> = Functor<M> & {
  pure: <A>(a: A) => HKT<M, A>;
  flatMap: <A, B>(ma: HKT<M, A>, f: (a: A) => HKT<M, B>) => HKT<M, B>;
};

// Higher-kinded types simulation
interface HKT<F, A> {
  readonly _F: F;
  readonly _A: A;
}

interface ArrayHKT {}
interface Array<T> extends HKT<ArrayHKT, T> {}

interface MaybeHKT {}
interface Maybe<T> extends HKT<MaybeHKT, T> {
  readonly tag: 'Some' | 'None';
  readonly value?: T;
}

// ===== ADVANCED VALIDATION COMBINATORS =====
// Composable validation system
type Validator<T> = (value: unknown) => value is T;

type And<A extends Validator<any>, B extends Validator<any>> = 
  A extends Validator<infer TA>
    ? B extends Validator<infer TB>
      ? Validator<TA & TB>
      : never
    : never;

type Or<A extends Validator<any>, B extends Validator<any>> = 
  A extends Validator<infer TA>
    ? B extends Validator<infer TB>
      ? Validator<TA | TB>
      : never
    : never;

type Not<A extends Validator<any>> = 
  A extends Validator<infer T>
    ? Validator<Exclude<unknown, T>>
    : never;

// ===== LENS SYSTEM =====
// Functional lenses at type level
type Lens<S, A> = {
  get: (s: S) => A;
  set: (a: A) => (s: S) => S;
};

type Compose<L1 extends Lens<any, any>, L2 extends Lens<any, any>> = 
  L1 extends Lens<infer S, infer A>
    ? L2 extends Lens<A, infer B>
      ? Lens<S, B>
      : never
    : never;

type PropertyLens<T, K extends keyof T> = Lens<T, T[K]>;

// Create lenses for deep property access
function lens<S, A>(
  get: (s: S) => A,
  set: (a: A) => (s: S) => S
): Lens<S, A> {
  return { get, set };
}

function prop<T, K extends keyof T>(key: K): PropertyLens<T, T[K]> {
  return lens(
    (obj: T) => obj[key],
    (value: T[K]) => (obj: T) => ({ ...obj, [key]: value })
  );
}

// ===== ADVANCED TYPE TRANSFORMATIONS =====
// Transform types based on complex conditions
type DeepTransform<T, Condition, Transform> = T extends Condition
  ? Transform
  : T extends object
    ? T extends readonly any[]
      ? { [K in keyof T]: DeepTransform<T[K], Condition, Transform> }
      : { [K in keyof T]: DeepTransform<T[K], Condition, Transform> }
    : T;

type ReplaceAllStringsWithNumbers<T> = DeepTransform<T, string, number>;

interface ComplexStructure {
  id: string;
  user: {
    name: string;
    age: number;
    settings: {
      theme: string;
      auto: boolean;
    };
  };
  tags: string[];
}

type NumberizedStructure = ReplaceAllStringsWithNumbers<ComplexStructure>;
// All string properties become number properties

// ===== COMPILE-TIME GRAPH ALGORITHMS =====
// Represent graphs and perform operations
type Graph<T extends string> = Record<T, T[]>;

type HasPath<G extends Graph<any>, Start extends keyof G, End extends keyof G, Visited extends any[] = []> =
  Start extends End
    ? true
    : Start extends Visited[number]
      ? false
      : G[Start] extends readonly (infer Neighbor)[]
        ? Neighbor extends keyof G
          ? HasPath<G, Neighbor, End, [...Visited, Start]> extends true
            ? true
            : false
          : false
        : false;

type TestGraph = {
  A: ['B', 'C'];
  B: ['D'];
  C: ['D'];
  D: [];
};

type PathExists = HasPath<TestGraph, 'A', 'D'>; // true
type NoPath = HasPath<TestGraph, 'D', 'A'>; // false

// ===== COMPILE-TIME AST TRANSFORMATIONS =====
// Transform abstract syntax trees at type level
type ASTNode = 
  | { type: 'Literal'; value: string | number }
  | { type: 'Identifier'; name: string }
  | { type: 'BinaryExpression'; operator: '+' | '-' | '*' | '/'; left: ASTNode; right: ASTNode }
  | { type: 'UnaryExpression'; operator: '-' | '+'; argument: ASTNode };

type TransformAST<T extends ASTNode> = 
  T extends { type: 'Literal' }
    ? T
    : T extends { type: 'Identifier' }
      ? T
      : T extends { type: 'BinaryExpression'; left: infer L; right: infer R }
        ? L extends ASTNode
          ? R extends ASTNode
            ? { type: 'BinaryExpression'; operator: T['operator']; left: TransformAST<L>; right: TransformAST<R> }
            : never
          : never
        : T extends { type: 'UnaryExpression'; argument: infer A }
          ? A extends ASTNode
            ? { type: 'UnaryExpression'; operator: T['operator']; argument: TransformAST<A> }
            : never
          : never;

// ===== TYPE-LEVEL REGEX ENGINE =====
// Simple regex matching at type level
type RegexMatch<S extends string, Pattern extends string> = 
  Pattern extends \`\${infer Start}*\${infer End}\`
    ? S extends \`\${Start}\${string}\${End}\`
      ? true
      : false
    : Pattern extends \`\${infer Start}+\${infer End}\`
      ? S extends \`\${Start}\${infer Middle}\${End}\`
        ? Middle extends ''
          ? false
          : true
        : false
      : S extends Pattern
        ? true
        : false;

type EmailMatch = RegexMatch<'user@example.com', '*@*.*'>; // true
type PhoneMatch = RegexMatch<'123-456-7890', '++++-++++-++++'>; // false

// ===== ADVANCED SERIALIZATION =====
// Create serializable and deserializable types
type SerializationMap = {
  Date: string;
  RegExp: string;
  Function: never;
  undefined: null;
};

type Serialize<T> = T extends keyof SerializationMap
  ? SerializationMap[T]
  : T extends object
    ? { [K in keyof T]: Serialize<T[K]> }
    : T;

type Deserialize<T> = T extends string
  ? T extends \`\${number}-\${number}-\${number}T\${string}\`
    ? Date
    : T
  : T extends object
    ? { [K in keyof T]: Deserialize<T[K]> }
    : T;

interface ComplexObject {
  id: number;
  date: Date;
  regex: RegExp;
  fn: () => void;
  nested: {
    value: string;
    timestamp: Date;
  };
}

type Serialized = Serialize<ComplexObject>;
type Deserialized = Deserialize<Serialized>;`
  },

  exercises: [
    "Create a recursive type that validates deeply nested object schemas at compile time",
    "Implement a type-level calculator that can perform arithmetic operations on literal numbers",
    "Build a template literal type that parses and validates SQL SELECT statements",
    "Design a type-safe state machine with compile-time transition validation",
    "Create a type that generates TypeScript interfaces from JSON schema definitions",
    "Implement a recursive type that flattens deeply nested object structures with dot notation keys",
    "Build a type-level parser for CSS selectors with full specificity calculation",
    "Design a dependency injection system with automatic circular dependency detection",
    "Create a type that validates and transforms GraphQL query types at compile time",
    "Implement a type-level interpreter for a simple functional programming language"
  ],

  keyPoints: [
    "Recursive utility types enable deep transformations of complex nested structures",
    "Type-level computation can perform arithmetic and logical operations at compile time",
    "Template literal types allow sophisticated string parsing and manipulation",
    "Meta-programming patterns enable reflection and code generation at the type level",
    "Advanced constraint systems can enforce complex business rules in types",
    "Type-level interpreters can evaluate domain-specific languages at compile time",
    "Functional programming concepts like lenses and functors can be implemented in types",
    "Graph algorithms and pathfinding can be performed at the type level",
    "Database query operations can be type-checked and validated at compile time",
    "The TypeScript type system is Turing complete and capable of complex computations"
  ]
};