// File location: src/data/concepts/advanced-types/exercises.ts

export interface AdvancedTypesExercise {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  description: string;
  starterCode: string;
  solution: string;
  tests: Array<{
    description: string;
    code: string;
    expectedResult: string;
  }>;
  hints: string[];
  explanation: string;
}

export const advancedTypesExercises: AdvancedTypesExercise[] = [
  {
    id: 'conditional-type-checker',
    title: 'Type Checker with Conditional Types',
    difficulty: 'beginner',
    category: 'conditional-types',
    description: 'Create conditional types to check if a type is an array, function, or object.',
    starterCode: `// Create conditional types to identify different type categories
type IsArray<T> = // Your implementation here
type IsFunction<T> = // Your implementation here  
type IsObject<T> = // Your implementation here

// Test your implementations
type Test1 = IsArray<string[]>;      // Should be true
type Test2 = IsArray<number>;        // Should be false
type Test3 = IsFunction<() => void>; // Should be true
type Test4 = IsFunction<string>;     // Should be false
type Test5 = IsObject<{ id: number }>; // Should be true
type Test6 = IsObject<string>;       // Should be false`,
    solution: `type IsArray<T> = T extends any[] ? true : false;
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
type IsObject<T> = T extends object 
  ? T extends any[] 
    ? false 
    : T extends (...args: any[]) => any 
      ? false 
      : true 
  : false;

// Test implementations
type Test1 = IsArray<string[]>;      // true
type Test2 = IsArray<number>;        // false
type Test3 = IsFunction<() => void>; // true
type Test4 = IsFunction<string>;     // false
type Test5 = IsObject<{ id: number }>; // true
type Test6 = IsObject<string>;       // false`,
    tests: [
      {
        description: 'IsArray should correctly identify arrays',
        code: 'type Result = IsArray<number[]>',
        expectedResult: 'true'
      },
      {
        description: 'IsFunction should correctly identify functions',
        code: 'type Result = IsFunction<(x: string) => number>',
        expectedResult: 'true'
      },
      {
        description: 'IsObject should correctly identify plain objects',
        code: 'type Result = IsObject<{ name: string }>',
        expectedResult: 'true'
      }
    ],
    hints: [
      'Use the extends keyword with appropriate type patterns',
      'For IsObject, you need to exclude arrays and functions from objects',
      'Consider the order of conditions in IsObject - more specific checks first'
    ],
    explanation: 'Conditional types allow you to create type-level logic. The pattern T extends U ? X : Y checks if type T is assignable to type U, then returns either type X or Y. For complex conditions like IsObject, you need to use nested conditional types to exclude specific cases.'
  },

  {
    id: 'mapped-type-getters-setters',
    title: 'Generate Getters and Setters with Mapped Types',
    difficulty: 'intermediate',
    category: 'mapped-types',
    description: 'Create mapped types that generate getter and setter method signatures for object properties.',
    starterCode: `interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// Create mapped types for getters and setters
type Getters<T> = // Your implementation here
type Setters<T> = // Your implementation here

// Should generate:
// type UserGetters = {
//   getId: () => number;
//   getName: () => string;
//   getEmail: () => string;
//   getIsActive: () => boolean;
// }

// type UserSetters = {
//   setId: (value: number) => void;
//   setName: (value: string) => void;
//   setEmail: (value: string) => void;
//   setIsActive: (value: boolean) => void;
// }`,
    solution: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as \`set\${Capitalize<string & K>}\`]: (value: T[K]) => void;
};

// Test the implementations
type UserGetters = Getters<User>;
type UserSetters = Setters<User>;

// Implementation example
function createAccessors<T extends Record<string, any>>(obj: T): Getters<T> & Setters<T> {
  const result = {} as any;
  
  for (const key in obj) {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    
    // Getter
    result[\`get\${capitalizedKey}\`] = () => obj[key];
    
    // Setter  
    result[\`set\${capitalizedKey}\`] = (value: any) => {
      obj[key] = value;
    };
  }
  
  return result;
}`,
    tests: [
      {
        description: 'Getters should create correct method signatures',
        code: 'type UserGetters = Getters<{ name: string; age: number }>',
        expectedResult: '{ getName: () => string; getAge: () => number }'
      },
      {
        description: 'Setters should create correct method signatures',
        code: 'type UserSetters = Setters<{ active: boolean }>',
        expectedResult: '{ setActive: (value: boolean) => void }'
      }
    ],
    hints: [
      'Use template literal types with Capitalize utility type',
      'The key remapping syntax is [K in keyof T as NewKey]',
      'string & K ensures the key is a string for template literal usage'
    ],
    explanation: 'Mapped types with key remapping allow you to transform property names while creating new type structures. The template literal syntax \`get\${Capitalize<string & K>}\` creates method names like getId, getName, etc. This pattern is commonly used in ORM libraries and API clients.'
  },

  {
    id: 'template-literal-url-parser',
    title: 'URL Route Parameter Parser',
    difficulty: 'advanced',
    category: 'template-literals',
    description: 'Create a type that extracts parameter names from URL route patterns.',
    starterCode: `// Create a type that extracts route parameters from URL patterns
type ExtractRouteParams<T extends string> = // Your implementation here

// Test cases:
type Test1 = ExtractRouteParams<"/users/:userId">;           // { userId: string }
type Test2 = ExtractRouteParams<"/users/:userId/posts/:postId">; // { userId: string; postId: string }
type Test3 = ExtractRouteParams<"/static/page">;             // {}
type Test4 = ExtractRouteParams<"/api/:version/users/:id/profile">; // { version: string; id: string }

// Bonus: Create a route handler type
type RouteHandler<T extends string> = ExtractRouteParams<T> extends {}
  ? () => Response
  : (params: ExtractRouteParams<T>) => Response;

type Handler1 = RouteHandler<"/users/:userId">;    // (params: { userId: string }) => Response
type Handler2 = RouteHandler<"/static/about">;     // () => Response`,
    solution: `type ExtractRouteParams<T extends string> = 
  T extends \`\${string}/:\${infer Param}/\${infer Rest}\`
    ? { [K in Param]: string } & ExtractRouteParams<\`/\${Rest}\`>
    : T extends \`\${string}/:\${infer Param}\`
      ? { [K in Param]: string }
      : {};

// Alternative more robust implementation
type ExtractRouteParamsRobust<T extends string> = string extends T
  ? Record<string, string>
  : T extends \`\${infer _Start}/:\${infer Param}\${infer Rest}\`
    ? (Param extends \`\${infer ParamName}/\${string}\` 
        ? never 
        : Param extends \`\${infer ParamName}?\${string}\`
          ? never
          : { [K in Param]: string }) & 
      (Rest extends \`/\${infer RestPath}\` 
        ? ExtractRouteParams<\`/\${RestPath}\`>
        : Rest extends \`?\${string}\`
          ? {}
          : {})
    : {};

type RouteHandler<T extends string> = 
  ExtractRouteParams<T> extends infer P
    ? P extends {}
      ? keyof P extends never
        ? () => Response
        : (params: P) => Response
      : never
    : never;

// Test implementations
type Test1 = ExtractRouteParams<"/users/:userId">;
type Test2 = ExtractRouteParams<"/users/:userId/posts/:postId">;
type Test3 = ExtractRouteParams<"/static/page">;
type Test4 = ExtractRouteParams<"/api/:version/users/:id/profile">;

type Handler1 = RouteHandler<"/users/:userId">;
type Handler2 = RouteHandler<"/static/about">;`,
    tests: [
      {
        description: 'Should extract single parameter',
        code: 'type Result = ExtractRouteParams<"/users/:id">',
        expectedResult: '{ id: string }'
      },
      {
        description: 'Should extract multiple parameters',
        code: 'type Result = ExtractRouteParams<"/users/:userId/posts/:postId">',
        expectedResult: '{ userId: string; postId: string }'
      },
      {
        description: 'Should return empty object for static routes',
        code: 'type Result = ExtractRouteParams<"/about/contact">',
        expectedResult: '{}'
      }
    ],
    hints: [
      'Use recursive pattern matching with template literals',
      'Handle both middle parameters and ending parameters differently',
      'Use intersection types (&) to combine multiple parameter objects'
    ],
    explanation: 'This exercise demonstrates recursive template literal parsing. The pattern matching works by extracting one parameter at a time and recursively processing the remainder. This technique is used in many routing libraries to provide type-safe route parameter extraction.'
  },

  {
    id: 'type-guard-builder',
    title: 'Generic Type Guard Builder',
    difficulty: 'advanced', 
    category: 'type-guards',
    description: 'Create a system for building and composing type guards.',
    starterCode: `// Create a type guard builder system
interface TypeGuard<T> {
  (value: unknown): value is T;
}

// Schema definition for validation
interface ValidationSchema<T> {
  [K in keyof T]: TypeGuard<T[K]>;
}

// Build a type guard from a schema
function createObjectGuard<T extends Record<string, any>>(
  schema: ValidationSchema<T>
): TypeGuard<T> {
  // Your implementation here
}

// Combine multiple type guards
function oneOf<T extends readonly any[]>(
  ...guards: { [K in keyof T]: TypeGuard<T[K]> }
): TypeGuard<T[number]> {
  // Your implementation here
}

// Create primitive type guards
const isString: TypeGuard<string> = (value): value is string => typeof value === 'string';
const isNumber: TypeGuard<number> = (value): value is number => typeof value === 'number';
const isBoolean: TypeGuard<boolean> = (value): value is boolean => typeof value === 'boolean';

// Test your implementation
interface User {
  id: number;
  name: string;
  isActive: boolean;
}

const userGuard = createObjectGuard<User>({
  id: isNumber,
  name: isString,
  isActive: isBoolean
});

const stringOrNumberGuard = oneOf(isString, isNumber);`,
    solution: `interface TypeGuard<T> {
  (value: unknown): value is T;
}

interface ValidationSchema<T> {
  [K in keyof T]: TypeGuard<T[K]>;
}

function createObjectGuard<T extends Record<string, any>>(
  schema: ValidationSchema<T>
): TypeGuard<T> {
  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    
    const obj = value as Record<string, unknown>;
    
    // Check all required properties exist and pass their guards
    return Object.keys(schema).every(key => {
      const guard = schema[key];
      return key in obj && guard(obj[key]);
    });
  };
}

function oneOf<T extends readonly any[]>(
  ...guards: { [K in keyof T]: TypeGuard<T[K]> }
): TypeGuard<T[number]> {
  return (value: unknown): value is T[number] => {
    return guards.some(guard => guard(value));
  };
}

// Array type guard
function arrayOf<T>(guard: TypeGuard<T>): TypeGuard<T[]> {
  return (value: unknown): value is T[] => {
    return Array.isArray(value) && value.every(guard);
  };
}

// Optional property guard
function optional<T>(guard: TypeGuard<T>): TypeGuard<T | undefined> {
  return (value: unknown): value is T | undefined => {
    return value === undefined || guard(value);
  };
}

// Primitive guards
const isString: TypeGuard<string> = (value): value is string => typeof value === 'string';
const isNumber: TypeGuard<number> = (value): value is number => typeof value === 'number' && !isNaN(value);
const isBoolean: TypeGuard<boolean> = (value): value is boolean => typeof value === 'boolean';

// Usage examples
interface User {
  id: number;
  name: string;
  isActive: boolean;
  tags?: string[];
}

const userGuard = createObjectGuard<User>({
  id: isNumber,
  name: isString,
  isActive: isBoolean
});

// With optional properties
const userWithTagsGuard = createObjectGuard<Required<User>>({
  id: isNumber,
  name: isString,
  isActive: isBoolean,
  tags: arrayOf(isString)
});

const stringOrNumberGuard = oneOf(isString, isNumber);`,
    tests: [
      {
        description: 'Object guard should validate correct objects',
        code: 'userGuard({ id: 1, name: "John", isActive: true })',
        expectedResult: 'true'
      },
      {
        description: 'Object guard should reject invalid objects',
        code: 'userGuard({ id: "1", name: "John", isActive: true })',
        expectedResult: 'false'
      },
      {
        description: 'Union guard should accept any valid type',
        code: 'stringOrNumberGuard("hello") && stringOrNumberGuard(42)',
        expectedResult: 'true'
      }
    ],
    hints: [
      'Use Object.keys() and Array.every() for object validation',
      'Remember to check if the value is an object first',
      'The oneOf function should use Array.some() to check if any guard passes'
    ],
    explanation: 'This exercise creates a composable type guard system. Type guards are essential for runtime type safety when dealing with external data. The pattern shown here allows building complex validation schemas from simple primitive guards, similar to libraries like Zod or Yup.'
  },

  {
    id: 'union-intersection-utils',
    title: 'Advanced Union and Intersection Utilities',
    difficulty: 'expert',
    category: 'union-intersection',
    description: 'Create utility types for advanced union and intersection manipulations.',
    starterCode: `// Create advanced union and intersection utility types

// 1. Convert union to intersection
type UnionToIntersection<U> = // Your implementation here

// 2. Get union keys that are common to all members  
type CommonKeys<T> = // Your implementation here

// 3. Merge objects in a union while preserving discriminants
type MergeUnion<T> = // Your implementation here

// 4. Distribute a mapped type over a union
type DistributedPick<T, K extends keyof T> = // Your implementation here

// Test cases:
type Union1 = { a: string } | { b: number } | { c: boolean };
type Union2 = { type: "user"; name: string } | { type: "admin"; permissions: string[] };
type Union3 = { id: number; name: string } | { id: number; age: number };

type Test1 = UnionToIntersection<Union1>;     // { a: string } & { b: number } & { c: boolean }
type Test2 = CommonKeys<Union3>;              // "id" 
type Test3 = MergeUnion<Union2>;              // Complex merged type
type Test4 = DistributedPick<Union3, "id">;   // { id: number } | { id: number }`,
    solution: `// 1. Convert union to intersection using contravariance
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

// 2. Extract keys that exist in all union members
type CommonKeys<T> = keyof UnionToIntersection<T>;

// 3. Merge union members while preserving structure
type MergeUnion<T> = {
  [K in keyof UnionToIntersection<T>]: 
    UnionToIntersection<T>[K];
};

// 4. Distributive Pick over union types
type DistributedPick<T, K extends keyof T> = T extends any 
  ? Pick<T, K> 
  : never;

// Additional utility: Extract discriminated union by discriminant value
type ExtractByDiscriminant<T, K extends keyof T, V extends T[K]> = 
  T extends Record<K, V> ? T : never;

// Get all possible values of a discriminant property
type DiscriminantValues<T, K extends keyof T> = T extends Record<K, infer V> ? V : never;

// Create a mapped type of discriminated union
type MapDiscriminatedUnion<T, K extends keyof T> = {
  [V in DiscriminantValues<T, K>]: ExtractByDiscriminant<T, K, V>;
};

// Test implementations
type Union1 = { a: string } | { b: number } | { c: boolean };
type Union2 = { type: "user"; name: string; id: number } | { type: "admin"; permissions: string[]; id: number };
type Union3 = { id: number; name: string } | { id: number; age: number };

type Test1 = UnionToIntersection<Union1>; 
// { a: string } & { b: number } & { c: boolean }

type Test2 = CommonKeys<Union3>; 
// "id"

type Test3 = MergeUnion<Union2>; 
// { type: "user" | "admin"; name: string; permissions: string[]; id: number }

type Test4 = DistributedPick<Union3, "id">; 
// { id: number } | { id: number }

type Test5 = MapDiscriminatedUnion<Union2, "type">;
// {
//   user: { type: "user"; name: string; id: number };
//   admin: { type: "admin"; permissions: string[]; id: number };
// }

// Practical example: API response handler
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
  code: number;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

type ResponseMap<T> = MapDiscriminatedUnion<ApiResponse<T>, "success">;
// {
//   true: SuccessResponse<T>;
//   false: ErrorResponse;
// }

// Usage in response handler
function handleResponse<T>(
  response: ApiResponse<T>,
  handlers: {
    [K in keyof ResponseMap<T>]: (response: ResponseMap<T>[K]) => void;
  }
) {
  if (response.success) {
    handlers[true](response);
  } else {
    handlers[false](response);
  }
}`,
    tests: [
      {
        description: 'UnionToIntersection should combine all union members',
        code: 'type Result = UnionToIntersection<{ a: string } | { b: number }>',
        expectedResult: '{ a: string } & { b: number }'
      },
      {
        description: 'CommonKeys should find shared properties',
        code: 'type Result = CommonKeys<{ id: number; name: string } | { id: number; age: number }>',
        expectedResult: '"id"'
      },
      {
        description: 'DistributedPick should distribute over union',
        code: 'type Result = DistributedPick<{ a: string; b: number } | { a: string; c: boolean }, "a">',
        expectedResult: '{ a: string } | { a: string }'
      }
    ],
    hints: [
      'UnionToIntersection uses contravariance in function parameters',
      'Use keyof with UnionToIntersection to find common keys',
      'DistributedPick should use T extends any to trigger distribution'
    ],
    explanation: 'These advanced utilities demonstrate sophisticated type-level programming. UnionToIntersection uses the contravariance of function parameters to convert unions to intersections. This technique is used in many advanced TypeScript libraries for type manipulation and is fundamental to understanding how complex type transformations work.'
  },

  {
    id: 'infer-recursive-parser',
    title: 'Recursive Type Parser with Infer',
    difficulty: 'expert',
    category: 'infer',
    description: 'Build a recursive parser that can extract and transform nested type structures.',
    starterCode: `// Create a recursive parser for nested object paths
type DeepKeys<T> = // Your implementation here - extract all possible deep paths

type DeepValue<T, K extends string> = // Your implementation here - get value at path

type PathsToStringProps<T> = // Your implementation here - paths to string properties only

type TransformValues<T, From, To> = // Your implementation here - replace all From types with To

// Test with this nested structure:
interface NestedData {
  user: {
    profile: {
      name: string;
      age: number;
      settings: {
        theme: string;
        notifications: boolean;
      };
    };
    posts: Array<{
      title: string;
      content: string;
      publishedAt: Date;
    }>;
  };
  metadata: {
    version: string;
    lastUpdate: Date;
  };
}

// Expected results:
type AllPaths = DeepKeys<NestedData>;
// "user" | "user.profile" | "user.profile.name" | "user.profile.age" | ... etc

type UserName = DeepValue<NestedData, "user.profile.name">; // string
type Theme = DeepValue<NestedData, "user.profile.settings.theme">; // string

type StringPaths = PathsToStringProps<NestedData>; 
// Only paths that lead to string values

type WithStringDates = TransformValues<NestedData, Date, string>;
// Replace all Date types with string`,
    solution: `// Recursive deep key extraction
type DeepKeys<T, K extends keyof T = keyof T> = K extends string | number
  ? T[K] extends object
    ? T[K] extends any[]
      ? K
      : K | \`\${K}.\${DeepKeys<T[K]>}\`
    : K
  : never;

// Deep value extraction using recursive template literal parsing
type DeepValue<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends \`\${infer First}.\${infer Rest}\`
    ? First extends keyof T
      ? DeepValue<T[First], Rest>
      : never
    : never;

// Extract paths that lead to string properties
type PathsToStringProps<T, K extends keyof T = keyof T> = K extends string | number
  ? T[K] extends string
    ? K
    : T[K] extends object
      ? T[K] extends any[]
        ? never
        : \`\${K}.\${PathsToStringProps<T[K]>}\`
      : never
  : never;

// Transform all occurrences of From type to To type
type TransformValues<T, From, To> = T extends From
  ? To
  : T extends object
    ? T extends any[]
      ? TransformValues<T[number], From, To>[]
      : {
          [K in keyof T]: TransformValues<T[K], From, To>;
        }
    : T;

// Alternative implementation with better recursion handling
type DeepKeysImproved<T, P extends string = ""> = {
  [K in keyof T]-?: K extends string | number
    ? T[K] extends object
      ? T[K] extends any[]
        ? P extends ""
          ? K
          : \`\${P}.\${K}\`
        : T[K] extends Date
          ? P extends ""
            ? K
            : \`\${P}.\${K}\`
          : P extends ""
            ? K | DeepKeysImproved<T[K], \`\${K}\`>
            : \`\${P}.\${K}\` | DeepKeysImproved<T[K], \`\${P}.\${K}\`>
      : P extends ""
        ? K
        : \`\${P}.\${K}\`
    : never;
}[keyof T];

// Advanced path validation
type ValidPath<T, P extends string> = P extends DeepKeys<T> ? P : never;

// Safe deep value extraction with validation
type SafeDeepValue<T, K extends DeepKeys<T>> = DeepValue<T, K>;

// Utility to create type-safe getters
type DeepGetters<T> = {
  [K in DeepKeys<T> as \`get\${Capitalize<string & K>}\`]: () => DeepValue<T, K>;
};

// Test implementations
interface NestedData {
  user: {
    profile: {
      name: string;
      age: number;
      settings: {
        theme: string;
        notifications: boolean;
      };
    };
    posts: Array<{
      title: string;
      content: string;
      publishedAt: Date;
    }>;
  };
  metadata: {
    version: string;
    lastUpdate: Date;
  };
}

type AllPaths = DeepKeys<NestedData>;
type UserName = DeepValue<NestedData, "user.profile.name">;
type Theme = DeepValue<NestedData, "user.profile.settings.theme">;
type StringPaths = PathsToStringProps<NestedData>;
type WithStringDates = TransformValues<NestedData, Date, string>;

// Practical implementation for runtime usage
function createDeepGetter<T extends object>() {
  return function get<K extends DeepKeys<T>>(
    obj: T, 
    path: K
  ): DeepValue<T, K> {
    const keys = (path as string).split('.');
    let result: any = obj;
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return undefined as any;
      }
      result = result[key];
    }
    
    return result;
  };
}

// Usage example
const getData = createDeepGetter<NestedData>();
// getData(data, "user.profile.name") returns string
// getData(data, "invalid.path") // Type error!`,
    tests: [
      {
        description: 'DeepKeys should extract all nested paths',
        code: 'type Paths = DeepKeys<{ a: { b: { c: string } } }>',
        expectedResult: '"a" | "a.b" | "a.b.c"'
      },
      {
        description: 'DeepValue should extract correct nested value',
        code: 'type Value = DeepValue<{ user: { name: string } }, "user.name">',
        expectedResult: 'string'
      },
      {
        description: 'TransformValues should replace all occurrences',
        code: 'type Result = TransformValues<{ date: Date; user: { birth: Date } }, Date, string>',
        expectedResult: '{ date: string; user: { birth: string } }'
      }
    ],
    hints: [
      'Use template literal types with recursive patterns',
      'Handle array types separately to avoid infinite recursion',
      'Use mapped types with key remapping for complex transformations'
    ],
    explanation: 'This advanced exercise demonstrates recursive type parsing and transformation. The techniques shown here are used in libraries like Lodash for type-safe deep property access, and in form libraries for nested field validation. Understanding these patterns is crucial for building sophisticated type-safe APIs.'
  }
];

export default advancedTypesExercises;