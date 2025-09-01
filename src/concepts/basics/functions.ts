/* File: src/concepts/basics/functions.ts */

import { ConceptTopic } from './index';

export const functions: ConceptTopic = {
  id: 'functions',
  title: 'Functions and Parameters',
  description: 'Master TypeScript function declarations, parameters, return types, and advanced function patterns.',
  codeExample: `// Basic function with explicit types
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Function with multiple parameters
function add(a: number, b: number): number {
  return a + b;
}

// Optional parameters (must come after required parameters)
function introduce(name: string, age?: number): string {
  if (age !== undefined) {
    return \`I'm \${name} and I'm \${age} years old\`;
  }
  return \`I'm \${name}\`;
}

// Default parameters
function createUser(name: string, role: string = "user"): object {
  return { name, role };
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

// Arrow functions
const multiply = (x: number, y: number): number => x * y;
const square = (n: number): number => n * n;

// Function expressions
const divide = function(x: number, y: number): number {
  if (y === 0) {
    throw new Error("Division by zero");
  }
  return x / y;
};

// Functions with no return value (void)
function logMessage(message: string): void {
  console.log(message);
}

// Functions that never return (never)
function throwError(message: string): never {
  throw new Error(message);
}

// Function overloads
function process(input: string): string;
function process(input: number): number;
function process(input: boolean): boolean;
function process(input: string | number | boolean): string | number | boolean {
  if (typeof input === "string") {
    return input.toUpperCase();
  } else if (typeof input === "number") {
    return input * 2;
  } else {
    return !input;
  }
}

// Higher-order functions
function createMultiplier(factor: number): (num: number) => number {
  return function(num: number): number {
    return num * factor;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

// Generic functions
function identity<T>(arg: T): T {
  return arg;
}

function getFirstElement<T>(array: T[]): T | undefined {
  return array[0];
}

// Using the generic functions
const stringResult = identity("hello"); // string
const numberResult = identity(42); // number
const firstNumber = getFirstElement([1, 2, 3]); // number | undefined
const firstName = getFirstElement(["Alice", "Bob"]); // string | undefined

// Callback functions
function processData(
  data: number[],
  callback: (item: number, index: number) => number
): number[] {
  return data.map(callback);
}

const doubled = processData([1, 2, 3], (num, index) => num * 2);

// Async functions
async function fetchUser(id: string): Promise<{name: string; email: string}> {
  const response = await fetch(\`/api/users/\${id}\`);
  const user = await response.json();
  return user;
}

// Method signatures in objects
const calculator = {
  add(a: number, b: number): number {
    return a + b;
  },
  
  subtract: (a: number, b: number): number => {
    return a - b;
  }
};`,

  explanation: `TypeScript functions provide powerful type safety features that help catch errors at compile time:

**Function Signatures**: Every function can have its parameters and return type explicitly typed. This makes the function's contract clear and helps prevent runtime errors.

**Parameter Types**: All parameters should be typed. TypeScript will enforce that the correct types are passed when the function is called.

**Optional Parameters**: Use the \`?\` syntax to make parameters optional. Optional parameters must come after required parameters in the function signature.

**Default Parameters**: Provide default values for parameters. TypeScript infers the type from the default value, making the parameter implicitly optional.

**Rest Parameters**: Use the spread operator \`...\` to accept an arbitrary number of arguments of the same type as an array.

**Return Types**: While TypeScript can infer return types, it's good practice to explicitly declare them, especially for public APIs.

**Function Overloads**: Define multiple function signatures for the same function name, allowing different parameter combinations while maintaining type safety.

**Generic Functions**: Use generics to create reusable functions that work with multiple types while preserving type information.

**Higher-Order Functions**: Functions that take other functions as parameters or return functions. TypeScript can type both the function parameters and return values.

**Async Functions**: Functions that return promises should be typed with \`Promise<T>\` where T is the type of the resolved value.`,

  keyPoints: [
    'Always type function parameters - TypeScript cannot infer them',
    'Return types can be inferred but explicit typing improves readability',
    'Optional parameters use ? and must come after required parameters',
    'Rest parameters collect multiple arguments into an array',
    'Use void for functions that don\'t return a value',
    'Use never for functions that never return (throw errors, infinite loops)',
    'Function overloads allow multiple signatures for the same function',
    'Generic functions provide type safety with reusability',
    'Arrow functions have concise syntax but different `this` binding'
  ],

  commonMistakes: [
    'Forgetting to type function parameters',
    'Using `any` for callback function parameters',
    'Not handling `undefined` return values from functions that might not return',
    'Placing optional parameters before required ones',
    'Not typing the return value of async functions with Promise<T>',
    'Using function overloads when union types would be simpler',
    'Forgetting that arrow functions don\'t have their own `this` context',
    'Not providing proper types for higher-order functions'
  ],

  bestPractices: [
    'Always explicitly type function parameters',
    'Use descriptive parameter names that indicate their purpose',
    'Prefer explicit return types for public functions',
    'Use readonly for array/object parameters that shouldn\'t be modified',
    'Keep functions small and focused on a single responsibility',
    'Use generic functions for reusable logic across types',
    'Prefer function declarations for named functions',
    'Use arrow functions for short callbacks and when preserving `this` context',
    'Handle edge cases and validate inputs appropriately'
  ],

  relatedTopics: [
    'variables',
    'generics',
    'advanced-types',
    'classes'
  ]
};

// Additional function patterns and examples
export const functionExamples = {
  advancedParameters: {
    title: 'Advanced Parameter Patterns',
    code: `// Destructuring parameters
function updateUser({name, age}: {name: string; age: number}): void {
  console.log(\`Updating user: \${name}, age: \${age}\`);
}

// Destructuring with default values
function createConfig({
  host = "localhost",
  port = 3000,
  ssl = false
}: {
  host?: string;
  port?: number;
  ssl?: boolean;
} = {}): object {
  return { host, port, ssl };
}

// Array destructuring in parameters
function getCoordinates([x, y]: [number, number]): string {
  return \`x: \${x}, y: \${y}\`;
}

// Rest parameters with destructuring
function logUserAction(action: string, ...details: string[]): void {
  console.log(\`Action: \${action}\`);
  details.forEach(detail => console.log(\`  - \${detail}\`));
}`
  },

  functionTypes: {
    title: 'Function Types and Interfaces',
    code: `// Function type aliases
type MathOperation = (a: number, b: number) => number;
type StringProcessor = (input: string) => string;
type Predicate<T> = (item: T) => boolean;

// Using function types
const add: MathOperation = (a, b) => a + b;
const multiply: MathOperation = (a, b) => a * b;

const toUpperCase: StringProcessor = (str) => str.toUpperCase();
const isEven: Predicate<number> = (num) => num % 2 === 0;

// Interface with function properties
interface Calculator {
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
  multiply: (a: number, b: number) => number;
  divide: (a: number, b: number) => number;
}

// Interface with call signature
interface Formatter {
  (input: string): string;
  prefix: string;
  suffix: string;
}

// Implementing the call signature
const formatter: Formatter = Object.assign(
  (input: string) => formatter.prefix + input + formatter.suffix,
  { prefix: '[', suffix: ']' }
);`
  },

  errorHandling: {
    title: 'Error Handling in Functions',
    code: `// Functions that may throw
function parseJSON(json: string): object {
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new Error(\`Invalid JSON: \${error}\`);
  }
}

// Result type pattern for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function safeDivide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { success: false, error: new Error("Division by zero") };
  }
  return { success: true, data: a / b };
}

// Using the result
const result = safeDivide(10, 2);
if (result.success) {
  console.log(\`Result: \${result.data}\`);
} else {
  console.error(\`Error: \${result.error.message}\`);
}

// Optional return values
function findUser(id: string): {name: string; email: string} | undefined {
  // Implementation would search for user
  // Return undefined if not found
  return undefined;
}

// Null object pattern
const NULL_USER = { name: '', email: '', isNull: true } as const;

function findUserOrNull(id: string): {name: string; email: string; isNull?: boolean} {
  // Return NULL_USER if not found instead of undefined
  return NULL_USER;
}`
  },

  asyncPatterns: {
    title: 'Async Function Patterns',
    code: `// Basic async function
async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  return response.json();
}

// Async function with error handling
async function safeFetchData(url: string): Promise<Result<any>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: new Error(\`HTTP \${response.status}\`) };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Async generators
async function* generateNumbers(): AsyncGenerator<number> {
  let i = 0;
  while (i < 5) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i++;
  }
}

// Promise-based function types
type AsyncOperation<T> = () => Promise<T>;
type AsyncMapper<T, U> = (item: T) => Promise<U>;

// Higher-order async functions
async function asyncMap<T, U>(
  items: T[],
  mapper: AsyncMapper<T, U>
): Promise<U[]> {
  const promises = items.map(mapper);
  return Promise.all(promises);
}

// Using async map
const urls = ['url1', 'url2', 'url3'];
const results = await asyncMap(urls, async (url) => {
  const response = await fetch(url);
  return response.json();
});`
  }
};

export default functions;