// File location: src/data/concepts/advanced-types/type-guards.ts

export interface TypeGuardsContent {
  title: string;
  description: string;
  codeExamples: {
    basic: string;
    userDefined: string;
    discriminatedUnions: string;
    assertionFunctions: string;
    advanced: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const typeGuardsContent: TypeGuardsContent = {
  title: "Type Guards",
  description: "Type guards are expressions that perform runtime checks and guarantee the type in some scope. They help TypeScript's type system narrow types based on runtime conditions.",
  
  codeExamples: {
    basic: `// Built-in type guards
function processValue(value: string | number | boolean) {
  // typeof type guard
  if (typeof value === "string") {
    // value is narrowed to string here
    console.log(value.toUpperCase());
  }
  
  if (typeof value === "number") {
    // value is narrowed to number here
    console.log(value.toFixed(2));
  }
  
  if (typeof value === "boolean") {
    // value is narrowed to boolean here
    console.log(value ? "true" : "false");
  }
}

// instanceof type guard
class Dog {
  bark() { console.log("Woof!"); }
}

class Cat {
  meow() { console.log("Meow!"); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    // animal is narrowed to Dog here
    animal.bark();
  } else {
    // animal is narrowed to Cat here (by elimination)
    animal.meow();
  }
}

// in operator type guard
interface Fish {
  swim: () => void;
}

interface Bird {
  fly: () => void;
}

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    // animal is narrowed to Fish here
    animal.swim();
  } else {
    // animal is narrowed to Bird here
    animal.fly();
  }
}

// Array.isArray type guard
function processArrayOrString(value: string[] | string) {
  if (Array.isArray(value)) {
    // value is narrowed to string[] here
    value.forEach(item => console.log(item.toUpperCase()));
  } else {
    // value is narrowed to string here
    console.log(value.toUpperCase());
  }
}

// Nullish checks
function processOptionalValue(value: string | null | undefined) {
  // Null/undefined checks
  if (value != null) {
    // value is narrowed to string here (removes null and undefined)
    console.log(value.length);
  }
  
  // More explicit checks
  if (value !== null && value !== undefined) {
    // value is narrowed to string here
    console.log(value.charAt(0));
  }
  
  // Truthy check (be careful - empty string is falsy!)
  if (value) {
    // value is narrowed to string here, but excludes ""
    console.log(value.trim());
  }
}`,

    userDefined: `// User-defined type guards
// Function that returns 'value is Type'

// Basic user-defined type guard
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

function processUnknown(value: unknown) {
  if (isString(value)) {
    // value is narrowed to string here
    console.log(value.toUpperCase());
  }
  
  if (isNumber(value)) {
    // value is narrowed to number here
    console.log(value.toFixed(2));
  }
}

// Object type guards
interface User {
  id: number;
  name: string;
  email: string;
}

interface AdminUser extends User {
  adminLevel: number;
  permissions: string[];
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as User).id === "number" &&
    typeof (obj as User).name === "string" &&
    typeof (obj as User).email === "string"
  );
}

function isAdminUser(obj: unknown): obj is AdminUser {
  return (
    isUser(obj) &&
    typeof (obj as AdminUser).adminLevel === "number" &&
    Array.isArray((obj as AdminUser).permissions)
  );
}

// Generic type guard
function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

// Array type guard
function isArrayOf<T>(
  arr: unknown,
  guard: (item: unknown) => item is T
): arr is T[] {
  return Array.isArray(arr) && arr.every(guard);
}

const stringArray: unknown = ["hello", "world"];
if (isArrayOf(stringArray, isString)) {
  // stringArray is narrowed to string[] here
  stringArray.forEach(str => console.log(str.toUpperCase()));
}

// Optional property type guard
interface ConfigWithOptional {
  host: string;
  port?: number;
  ssl?: boolean;
}

function hasPort(config: ConfigWithOptional): config is ConfigWithOptional & { port: number } {
  return config.port !== undefined;
}

function processConfig(config: ConfigWithOptional) {
  if (hasPort(config)) {
    // config.port is guaranteed to be number here
    console.log(\`Connecting to \${config.host}:\${config.port}\`);
  }
}

// Branded type guards
type PositiveNumber = number & { __brand: "positive" };
type Email = string & { __brand: "email" };

function isPositiveNumber(n: number): n is PositiveNumber {
  return n > 0;
}

function isEmail(s: string): s is Email {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}`,

    discriminatedUnions: `// Type guards with discriminated unions
// Using a common discriminant property to distinguish union members

interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: any;
}

interface ErrorState {
  status: "error";
  error: string;
}

type AsyncState = LoadingState | SuccessState | ErrorState;

// Discriminated union type guards
function handleAsyncState(state: AsyncState) {
  switch (state.status) {
    case "loading":
      // state is narrowed to LoadingState
      console.log("Loading...");
      break;
    
    case "success":
      // state is narrowed to SuccessState
      console.log("Data:", state.data);
      break;
    
    case "error":
      // state is narrowed to ErrorState
      console.log("Error:", state.error);
      break;
    
    default:
      // Exhaustiveness check - TypeScript will error if we miss a case
      const _exhaustiveCheck: never = state;
      break;
  }
}

// Custom discriminated union
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

// Type guard functions for discriminated unions
function isCircle(shape: Shape): shape is Circle {
  return shape.kind === "circle";
}

function isRectangle(shape: Shape): shape is Rectangle {
  return shape.kind === "rectangle";
}

function isTriangle(shape: Shape): shape is Triangle {
  return shape.kind === "triangle";
}

function calculateArea(shape: Shape): number {
  if (isCircle(shape)) {
    return Math.PI * shape.radius ** 2;
  }
  
  if (isRectangle(shape)) {
    return shape.width * shape.height;
  }
  
  if (isTriangle(shape)) {
    return (shape.base * shape.height) / 2;
  }
  
  // This should never be reached due to exhaustiveness
  const _exhaustiveCheck: never = shape;
  return _exhaustiveCheck;
}

// API response discriminated union
interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: string;
  code: number;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

function handleApiResponse<T>(response: ApiResponse<T>) {
  if (isApiSuccess(response)) {
    // response is narrowed to ApiSuccess<T>
    console.log("Success:", response.data);
  } else {
    // response is narrowed to ApiError
    console.log(\`Error \${response.code}: \${response.error}\`);
  }
}`,

    assertionFunctions: `// Assertion functions (TypeScript 3.7+)
// Functions that throw an error if the assertion fails

// Basic assertion function
function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// Type assertion function
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Expected string");
  }
}

function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error("Expected number");
  }
}

function processValue(value: unknown) {
  assertIsString(value);
  // value is narrowed to string after this point
  console.log(value.toUpperCase());
  
  // This would cause a compile-time error since value is already narrowed to string:
  // assertIsNumber(value);
}

// Object assertion
function assertIsUser(obj: unknown): asserts obj is User {
  if (!isUser(obj)) {
    throw new Error("Expected User object");
  }
}

// Property assertion
function assertHasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
  message?: string
): asserts obj is T & Record<K, unknown> {
  if (!(key in obj)) {
    throw new Error(message || \`Expected property \${String(key)}\`);
  }
}

// Non-null assertion
function assertNonNull<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value == null) {
    throw new Error(message || "Expected non-null value");
  }
}

// Usage examples
function processUser(data: unknown) {
  assertIsUser(data);
  // data is now narrowed to User
  console.log(\`Processing user: \${data.name}\`);
  
  // Check for optional admin properties
  if ("adminLevel" in data) {
    assertHasProperty(data, "permissions");
    // data now has permissions property
    console.log("Admin permissions:", data.permissions);
  }
}

// Array assertion
function assertIsArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
  message?: string
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error(message || "Expected array");
  }
  
  for (let i = 0; i < value.length; i++) {
    if (!guard(value[i])) {
      throw new Error(\`Invalid array item at index \${i}\`);
    }
  }
}

// Environment variable assertion
function assertEnvVar(name: string): asserts process.env is Record<string, string> & Record<typeof name, string> {
  if (!process.env[name]) {
    throw new Error(\`Missing required environment variable: \${name}\`);
  }
}

// Usage in configuration
function getConfig() {
  assertEnvVar("DATABASE_URL");
  assertEnvVar("API_KEY");
  
  // TypeScript now knows these exist and are strings
  return {
    databaseUrl: process.env.DATABASE_URL,
    apiKey: process.env.API_KEY
  };
}`,

    advanced: `// Advanced type guard patterns

// 1. Recursive type guards for nested objects
interface NestedObject {
  [key: string]: string | number | NestedObject;
}

function isNestedObject(obj: unknown): obj is NestedObject {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  
  const record = obj as Record<string, unknown>;
  return Object.values(record).every(value => 
    typeof value === "string" || 
    typeof value === "number" || 
    isNestedObject(value)
  );
}

// 2. Generic type guards with constraints
function isInstanceOfClass<T extends abstract new (...args: any) => any>(
  obj: unknown,
  constructor: T
): obj is InstanceType<T> {
  return obj instanceof constructor;
}

class MyClass {
  myMethod() {}
}

function processObject(obj: unknown) {
  if (isInstanceOfClass(obj, MyClass)) {
    // obj is narrowed to MyClass
    obj.myMethod();
  }
}

// 3. Validation schema type guards
interface ValidationSchema<T> {
  [K in keyof T]: (value: unknown) => value is T[K];
}

function validateObject<T extends Record<string, any>>(
  obj: unknown,
  schema: ValidationSchema<T>
): obj is T {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  
  const record = obj as Record<string, unknown>;
  
  return Object.entries(schema).every(([key, validator]) => {
    return key in record && validator(record[key]);
  });
}

// Usage
const userSchema: ValidationSchema<User> = {
  id: (value): value is number => typeof value === "number",
  name: (value): value is string => typeof value === "string" && value.length > 0,
  email: (value): value is string => typeof value === "string" && isEmail(value)
};

function processApiData(data: unknown) {
  if (validateObject(data, userSchema)) {
    // data is narrowed to User
    console.log(\`Valid user: \${data.name}\`);
  }
}

// 4. Conditional type guards
type ExtractArrayType<T> = T extends (infer U)[] ? U : never;

function isArrayOfType<T extends readonly unknown[]>(
  value: unknown,
  example: T
): value is T {
  if (!Array.isArray(value)) {
    return false;
  }
  
  if (example.length === 0) {
    return true; // Empty array matches any array type
  }
  
  // Simple type checking based on first element
  const firstExample = example[0];
  return value.every(item => typeof item === typeof firstExample);
}

// 5. Promise type guards
function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    value != null &&
    typeof value === "object" &&
    "then" in value &&
    typeof (value as any).then === "function"
  );
}

async function handleAsyncValue(value: unknown) {
  if (isPromise(value)) {
    // value is narrowed to Promise<unknown>
    const result = await value;
    console.log("Resolved:", result);
  } else {
    console.log("Synchronous value:", value);
  }
}

// 6. Error type guards
class CustomError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

function isCustomError(error: unknown): error is CustomError {
  return error instanceof CustomError;
}

function isErrorWithCode(error: unknown): error is Error & { code: string } {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof (error as any).code === "string"
  );
}

function handleError(error: unknown) {
  if (isCustomError(error)) {
    // error is narrowed to CustomError
    console.log(\`Custom error \${error.code}: \${error.message}\`);
  } else if (isErrorWithCode(error)) {
    // error is narrowed to Error & { code: string }
    console.log(\`Error \${error.code}: \${error.message}\`);
  } else if (error instanceof Error) {
    // error is narrowed to Error
    console.log(\`Standard error: \${error.message}\`);
  } else {
    // error is unknown
    console.log("Unknown error:", error);
  }
}

// 7. Function type guards
type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;
type SyncFunction<T extends any[], R> = (...args: T) => R;

function isAsyncFunction<T extends any[], R>(
  fn: unknown
): fn is AsyncFunction<T, R> {
  if (typeof fn !== "function") {
    return false;
  }
  
  // Check if function returns a Promise by testing with empty args
  try {
    const result = (fn as Function)();
    return isPromise(result);
  } catch {
    // Function might require arguments
    return fn.constructor.name === "AsyncFunction";
  }
}

function isSyncFunction<T extends any[], R>(
  fn: unknown
): fn is SyncFunction<T, R> {
  return typeof fn === "function" && !isAsyncFunction(fn);
}

// 8. Date type guards
function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && !isNaN(Date.parse(value));
}

function processDateValue(value: unknown) {
  if (isValidDate(value)) {
    // value is narrowed to Date
    console.log("Valid date:", value.toISOString());
  } else if (isDateString(value)) {
    // value is narrowed to string (that can be parsed as date)
    const date = new Date(value);
    console.log("Parsed date:", date.toISOString());
  } else {
    console.log("Not a valid date value");
  }
}

// 9. URL type guards
function isURL(value: unknown): value is URL {
  return value instanceof URL;
}

function isURLString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// 10. Complex object structure guards
interface ApiUser {
  id: number;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: {
      url: string;
      size: number;
    };
  };
  settings: {
    notifications: boolean;
    theme: "light" | "dark";
  };
}

function isApiUser(obj: unknown): obj is ApiUser {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  
  const user = obj as any;
  
  // Check top-level properties
  if (typeof user.id !== "number") {
    return false;
  }
  
  // Check nested profile
  if (typeof user.profile !== "object" || user.profile === null) {
    return false;
  }
  
  if (typeof user.profile.firstName !== "string" || 
      typeof user.profile.lastName !== "string") {
    return false;
  }
  
  // Check optional avatar
  if (user.profile.avatar !== undefined) {
    if (typeof user.profile.avatar !== "object" || 
        user.profile.avatar === null ||
        typeof user.profile.avatar.url !== "string" ||
        typeof user.profile.avatar.size !== "number") {
      return false;
    }
  }
  
  // Check settings
  if (typeof user.settings !== "object" || user.settings === null) {
    return false;
  }
  
  if (typeof user.settings.notifications !== "boolean" ||
      !["light", "dark"].includes(user.settings.theme)) {
    return false;
  }
  
  return true;
}

// 11. Generic collection type guards
function isRecord<T>(
  obj: unknown,
  valueGuard: (value: unknown) => value is T
): obj is Record<string, T> {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return false;
  }
  
  return Object.values(obj).every(valueGuard);
}

function isMap<K, V>(
  obj: unknown,
  keyGuard: (key: unknown) => key is K,
  valueGuard: (value: unknown) => value is V
): obj is Map<K, V> {
  if (!(obj instanceof Map)) {
    return false;
  }
  
  for (const [key, value] of obj) {
    if (!keyGuard(key) || !valueGuard(value)) {
      return false;
    }
  }
  
  return true;
}

// 12. Enum type guards
enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest"
}

function isUserRole(value: unknown): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

function isEnumValue<T extends Record<string | number, string | number>>(
  enumObject: T,
  value: unknown
): value is T[keyof T] {
  return Object.values(enumObject).includes(value as T[keyof T]);
}

// Usage
const roleGuard = (value: unknown) => isEnumValue(UserRole, value);`
  },

  exercises: [
    `// Exercise 1: Create a type guard for a complex API response
interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
  };
  tags: string[];
  publishedAt: string; // ISO date string
  metadata?: {
    views: number;
    likes: number;
  };
}

function isBlogPost(obj: unknown): obj is BlogPost {
  // Your implementation here
}

// Test your implementation with various inputs`,

    `// Exercise 2: Create assertion functions for environment validation
interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  nodeEnv: "development" | "production" | "test";
  enableLogging?: boolean;
}

function assertValidConfig(config: unknown): asserts config is AppConfig {
  // Your implementation here
}

// Should throw descriptive errors for invalid configurations`,

    `// Exercise 3: Create a generic type guard for API responses
interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: number;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

function isApiSuccess<T>(
  response: unknown,
  dataGuard: (data: unknown) => data is T
): response is ApiSuccess<T> {
  // Your implementation here
}

// Test with different data types`,

    `// Exercise 4: Create type guards for discriminated unions
interface TextNode {
  type: "text";
  content: string;
}

interface ImageNode {
  type: "image";
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface ContainerNode {
  type: "container";
  children: DocumentNode[];
  className?: string;
}

type DocumentNode = TextNode | ImageNode | ContainerNode;

function isTextNode(node: unknown): node is TextNode {
  // Your implementation here
}

function isImageNode(node: unknown): node is ImageNode {
  // Your implementation here
}

function isContainerNode(node: unknown): node is ContainerNode {
  // Your implementation here
}

function isDocumentNode(node: unknown): node is DocumentNode {
  // Your implementation here
}`,

    `// Exercise 5: Create a validation system with custom error messages
interface ValidationResult<T> {
  success: true;
  data: T;
} | {
  success: false;
  errors: Array<{
    path: string;
    message: string;
    value: unknown;
  }>;
}

interface UserRegistration {
  username: string; // min 3 chars, alphanumeric
  email: string;    // valid email format
  password: string; // min 8 chars
  age: number;      // 13-120
  termsAccepted: true; // must be exactly true
}

function validateUserRegistration(data: unknown): ValidationResult<UserRegistration> {
  // Your implementation here
  // Should collect all validation errors, not just the first one
}

// Test with various invalid inputs to ensure comprehensive error reporting`
  ],

  keyPoints: [
    "Type guards are runtime checks that help TypeScript narrow types within conditional blocks",
    "Built-in type guards include typeof, instanceof, Array.isArray, and the 'in' operator",
    "User-defined type guards use the 'value is Type' return type annotation",
    "Discriminated unions use a common discriminant property to distinguish union members",
    "Assertion functions use 'asserts condition' or 'asserts value is Type' syntax",
    "Type guards enable safe access to type-specific properties and methods",
    "They're essential for working with union types, unknown types, and API data",
    "Assertion functions throw errors instead of returning boolean values",
    "Type guards can be combined with generic types for reusable validation logic",
    "They provide runtime type safety while maintaining TypeScript's compile-time benefits",
    "Exhaustiveness checking ensures all cases in a discriminated union are handled",
    "Type guards are crucial for validating external data like API responses and user input"
  ]
};

export default typeGuardsContent;