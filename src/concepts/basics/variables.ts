/* File: src/concepts/basics/variables.ts */

import { ConceptTopic } from './index';

export const variables: ConceptTopic = {
  id: 'variables',
  title: 'Variables and Basic Types',
  description: 'Learn how to declare variables with explicit types in TypeScript and understand the fundamental type system.',
  codeExample: `// Basic type annotations
let username: string = "alice";
let age: number = 25;
let isActive: boolean = true;
let score: number = 95.5;

// Type inference - TypeScript can infer types
let inferredString = "Hello World"; // inferred as string
let inferredNumber = 42; // inferred as number
let inferredBoolean = false; // inferred as boolean

// Arrays
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];
let flags: boolean[] = [true, false, true];

// Alternative array syntax
let scores: Array<number> = [85, 90, 78, 92];
let cities: Array<string> = ["New York", "London", "Tokyo"];

// Union types - variables that can hold multiple types
let id: string | number = "user123";
id = 456; // This is valid

let status: "pending" | "approved" | "rejected" = "pending";

// Any type (use sparingly)
let dynamicValue: any = 42;
dynamicValue = "now a string";
dynamicValue = { key: "value" };

// Undefined and null
let maybeString: string | undefined = undefined;
let nullableNumber: number | null = null;

// Literal types
let direction: "up" | "down" | "left" | "right" = "up";
let httpStatus: 200 | 404 | 500 = 200;

// Const assertions
const colors = ["red", "green", "blue"] as const;
// colors is now readonly ["red", "green", "blue"]

// Object types
let user: { name: string; age: number } = {
  name: "John",
  age: 30
};

// Optional properties
let config: { theme: string; debug?: boolean } = {
  theme: "dark"
  // debug is optional
};`,

  explanation: `TypeScript's type system provides several ways to declare and work with variables:

**Explicit Type Annotations**: You can explicitly specify the type of a variable using the colon syntax (\`variable: type\`). This makes your code more self-documenting and helps catch type errors early.

**Type Inference**: TypeScript can automatically infer types based on the initial value. While this reduces verbosity, explicit annotations are often preferred for clarity and better error messages.

**Primitive Types**: The basic types include \`string\`, \`number\`, \`boolean\`, \`null\`, and \`undefined\`. Note that \`number\` includes both integers and floating-point numbers.

**Array Types**: Arrays can be declared using either \`type[]\` syntax or \`Array<type>\` syntax. Both are equivalent, but \`type[]\` is more commonly used.

**Union Types**: Allow variables to accept multiple types using the pipe (\`|\`) operator. This is useful when a value can legitimately be one of several types.

**Literal Types**: Restrict values to specific constants rather than entire types. This is powerful for creating more precise type definitions.

**Object Types**: Define the structure of objects inline using object type literals with property names, types, and optional modifiers.`,

  keyPoints: [
    'Use explicit type annotations for function parameters and public APIs',
    'TypeScript can infer types, but annotations improve readability',
    'Arrays can be typed with element[] or Array<element> syntax',
    'Union types allow multiple possible types with the | operator',
    'Use literal types for more precise value restrictions',
    'Optional properties in objects use the ? modifier',
    'Avoid the any type unless absolutely necessary',
    'const assertions create immutable, literal-typed arrays and objects'
  ],

  commonMistakes: [
    'Using `any` type everywhere instead of proper typing',
    'Forgetting that `number` includes both integers and floats',
    'Not handling `undefined` values in union types',
    'Using array mutation methods on `readonly` arrays',
    'Mixing up `null` and `undefined` - prefer `undefined` for optional values',
    'Over-annotating when type inference would suffice',
    'Not using union types when a variable can have multiple valid types'
  ],

  bestPractices: [
    'Prefer `const` for values that won\'t change',
    'Use descriptive variable names that indicate their purpose',
    'Initialize variables at declaration when possible',
    'Use union types instead of `any` when multiple types are valid',
    'Prefer `undefined` over `null` for optional values',
    'Use readonly arrays when the array shouldn\'t be modified',
    'Leverage type inference for simple cases, use annotations for complex types',
    'Use literal types for enumeration-like values'
  ],

  relatedTopics: [
    'functions',
    'interfaces-vs-types',
    'type-aliases',
    'advanced-types'
  ]
};

// Additional examples and patterns
export const variableExamples = {
  primitiveTypes: {
    title: 'Primitive Types',
    code: `// String type
let firstName: string = "John";
let lastName: string = 'Doe';
let fullName: string = \`\${firstName} \${lastName}\`;

// Number type (integers and floats)
let integer: number = 42;
let float: number = 3.14159;
let negative: number = -100;
let scientific: number = 1e5; // 100000

// Boolean type
let isComplete: boolean = true;
let isVisible: boolean = false;

// BigInt (for very large integers)
let bigNumber: bigint = 123456789012345678901234567890n;

// Symbol (unique identifiers)
let sym: symbol = Symbol('id');`
  },

  advancedArrays: {
    title: 'Advanced Array Patterns',
    code: `// Tuple types - fixed length arrays with specific types
let coordinate: [number, number] = [10, 20];
let userInfo: [string, number, boolean] = ["Alice", 25, true];

// Readonly arrays
let readonlyNumbers: readonly number[] = [1, 2, 3];
let readonlyNames: ReadonlyArray<string> = ["a", "b", "c"];

// Multi-dimensional arrays
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

// Array of union types
let mixedArray: (string | number)[] = ["hello", 42, "world", 100];

// Rest elements in tuples
let restTuple: [string, ...number[]] = ["label", 1, 2, 3, 4];`
  },

  complexObjects: {
    title: 'Complex Object Types',
    code: `// Nested objects
let employee: {
  personal: {
    name: string;
    age: number;
  };
  work: {
    title: string;
    department: string;
    salary?: number;
  };
} = {
  personal: {
    name: "Alice",
    age: 30
  },
  work: {
    title: "Developer",
    department: "Engineering"
  }
};

// Index signatures for dynamic properties
let scores: { [subject: string]: number } = {
  math: 95,
  science: 88,
  history: 92
};

// Readonly properties
let config: {
  readonly apiUrl: string;
  timeout: number;
} = {
  apiUrl: "https://api.example.com",
  timeout: 5000
};

// config.apiUrl = "new url"; // Error: Cannot assign to readonly property`
  },

  typeAssertions: {
    title: 'Type Assertions',
    code: `// Type assertions (use with caution)
let someValue: unknown = "hello world";
let strLength: number = (someValue as string).length;

// Alternative syntax (not recommended in JSX)
let strLength2: number = (<string>someValue).length;

// Non-null assertion operator
let nullableString: string | null = getName();
let definitelyString: string = nullableString!; // Assert it's not null

// Const assertions
let point = { x: 10, y: 20 } as const;
// point is now { readonly x: 10; readonly y: 20; }

let colors = ['red', 'green', 'blue'] as const;
// colors is now readonly ['red', 'green', 'blue']`
  }
};

export default variables;