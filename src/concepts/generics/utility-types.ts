// File location: src/data/concepts/generics/utility-types.ts

export interface UtilityTypesContent {
  title: string;
  description: string;
  codeExamples: {
    builtin: string;
    manipulation: string;
    conditional: string;
    mapped: string;
    advanced: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const utilityTypesContent: UtilityTypesContent = {
  title: "Utility Types",
  description: "TypeScript provides many built-in utility types that help with common type transformations. These types make it easier to create new types based on existing ones and perform complex type manipulations.",
  
  codeExamples: {
    builtin: `// Built-in TypeScript utility types

// ===== PICK AND OMIT =====
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  role: 'admin' | 'user';
  metadata: Record<string, any>;
}

// Pick - Creates a type by picking specific properties
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;
// Type: { id: number; name: string; email: string; }

// Omit - Creates a type by omitting specific properties
type UserWithoutMetadata = Omit<User, 'metadata' | 'role'>;
// Type: { id: number; name: string; email: string; age: number; isActive: boolean; }

function createUserSummary(user: User): UserSummary {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

// ===== PARTIAL AND REQUIRED =====
// Partial - Makes all properties optional
type PartialUser = Partial<User>;
// Type: { id?: number; name?: string; email?: string; ... }

function updateUser(id: number, updates: Partial<User>): void {
  // Can update any subset of user properties
  console.log(\`Updating user \${id} with:\`, updates);
}

updateUser(1, { name: "New Name" });
updateUser(1, { email: "new@email.com", age: 25 });

// Required - Makes all properties required
type RequiredUser = Required<User>;
// Even if User had optional properties, this would make them all required

interface OptionalFieldsExample {
  required: string;
  optional?: number;
  maybeUndefined?: boolean;
}

type AllRequired = Required<OptionalFieldsExample>;
// Type: { required: string; optional: number; maybeUndefined: boolean; }

// ===== RECORD =====
// Record<K, T> - Creates an object type with keys of type K and values of type T
type UserRoles = Record<string, User>;
// Type: { [key: string]: User }

type StatusFlags = Record<'loading' | 'error' | 'success', boolean>;
// Type: { loading: boolean; error: boolean; success: boolean; }

const usersByRole: Record<'admin' | 'user' | 'guest', User[]> = {
  admin: [],
  user: [],
  guest: []
};

const apiStatus: StatusFlags = {
  loading: false,
  error: false,
  success: true
};

// ===== EXCLUDE AND EXTRACT =====
type Colors = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

// Exclude - Removes types from a union
type PrimaryColors = Exclude<Colors, 'yellow' | 'purple'>;
// Type: 'red' | 'blue' | 'green'

type NonStringTypes = Exclude<string | number | boolean | null, string>;
// Type: number | boolean | null

// Extract - Keeps only specified types from a union
type WarmColors = Extract<Colors, 'red' | 'yellow' | 'orange'>;
// Type: 'red' | 'yellow' (orange doesn't exist in Colors)

function processColor(color: PrimaryColors): void {
  // Only accepts 'red', 'blue', or 'green'
  console.log(\`Processing primary color: \${color}\`);
}

// ===== NONNULLABLE =====
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// Type: string

function processDefiniteValue<T>(value: NonNullable<T>): void {
  // value is guaranteed to not be null or undefined
  console.log("Processing:", value);
}

// ===== RETURNTYPE AND PARAMETERS =====
function calculateTotal(price: number, tax: number, discount: number = 0): number {
  return price + tax - discount;
}

type CalculationResult = ReturnType<typeof calculateTotal>;
// Type: number

type CalculationParams = Parameters<typeof calculateTotal>;
// Type: [number, number, number?]

function createCalculation(): CalculationResult {
  return 100; // Must return a number
}

function callCalculateWithSameParams(...args: CalculationParams): CalculationResult {
  return calculateTotal(...args);
}

// ===== CONSTRUCTORPARAMETERS AND INSTANCETYPE =====
class DatabaseConnection {
  constructor(
    private host: string,
    private port: number,
    private options?: { ssl?: boolean; timeout?: number }
  ) {}

  connect(): void {
    console.log(\`Connecting to \${this.host}:\${this.port}\`);
  }
}

type DbConstructorParams = ConstructorParameters<typeof DatabaseConnection>;
// Type: [string, number, { ssl?: boolean; timeout?: number }?]

type DbInstance = InstanceType<typeof DatabaseConnection>;
// Type: DatabaseConnection

function createDbConnection(...args: DbConstructorParams): DbInstance {
  return new DatabaseConnection(...args);
}

// ===== AWAITED =====
async function fetchUserData(): Promise<User> {
  return { id: 1, name: "John", email: "john@example.com", age: 30, isActive: true, role: 'user', metadata: {} };
}

type UserData = Awaited<ReturnType<typeof fetchUserData>>;
// Type: User

type DeepPromise = Promise<Promise<Promise<string>>>;
type UnwrappedDeepPromise = Awaited<DeepPromise>;
// Type: string

async function processAsyncData(): Promise<UserData> {
  const userData = await fetchUserData();
  return userData;
}

// ===== CONDITIONAL UTILITY COMBINATIONS =====
// Combining multiple utilities
type UpdateableUserFields = Partial<Omit<User, 'id' | 'metadata'>>;
// Type: { name?: string; email?: string; age?: number; isActive?: boolean; role?: 'admin' | 'user'; }

function updateUserSafely(id: number, updates: UpdateableUserFields): void {
  // Can update any field except id and metadata
  console.log(\`Updating user \${id}\`, updates);
}

// Creating a type for API responses
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserApiResponse = ApiResponse<User>;
type UsersListResponse = ApiResponse<User[]>;
type UserSummaryResponse = ApiResponse<UserSummary>;

// Function overloading with utility types
function processApiResponse<T>(response: ApiResponse<T>): NonNullable<T> {
  if (response.status === 200 && response.data != null) {
    return response.data as NonNullable<T>;
  }
  throw new Error(\`API Error: \${response.message}\`);
}`,

    manipulation: `// Advanced type manipulation with utility types

// ===== DEEP UTILITY TYPES =====
// Creating deep versions of existing utilities

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
}

type DeepPartialConfig = DeepPartial<NestedConfig>;
// All nested properties are optional

function mergeConfig(defaults: NestedConfig, overrides: DeepPartialConfig): NestedConfig {
  // Implementation would recursively merge the configurations
  return { ...defaults, ...overrides } as NestedConfig;
}

// DeepRequired - Makes all nested properties required
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

type FullyRequiredConfig = DeepRequired<NestedConfig>;

// DeepReadonly - Makes all nested properties readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type ImmutableConfig = DeepReadonly<NestedConfig>;

// ===== FLATTEN UTILITY =====
type Flatten<T> = T extends (infer U)[] ? U : T;

type StringArray = string[];
type FlatString = Flatten<StringArray>; // string

type NestedArray = number[][];
type StillNested = Flatten<NestedArray>; // number[] (only flattens one level)

// DeepFlatten for multi-dimensional arrays
type DeepFlatten<T> = T extends (infer U)[] 
  ? U extends any[] 
    ? DeepFlatten<U> 
    : U 
  : T;

type DoublyNested = number[][];
type CompletelyFlat = DeepFlatten<DoublyNested>; // number

// ===== KEYS AND VALUES MANIPULATION =====
// Get all possible values from an object type
type ValueOf<T> = T[keyof T];

interface Colors {
  red: '#FF0000';
  green: '#00FF00';
  blue: '#0000FF';
}

type ColorValues = ValueOf<Colors>; // '#FF0000' | '#00FF00' | '#0000FF'

// Get all keys that have values of a specific type
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

interface MixedTypes {
  id: number;
  name: string;
  isActive: boolean;
  count: number;
  tags: string[];
}

type StringKeys = KeysOfType<MixedTypes, string>; // 'name'
type NumberKeys = KeysOfType<MixedTypes, number>; // 'id' | 'count'
type ArrayKeys = KeysOfType<MixedTypes, any[]>; // 'tags'

// ===== FUNCTION TYPE MANIPULATION =====
// Transform function parameters
type OptionalParameters<T extends (...args: any[]) => any> = 
  T extends (...args: infer P) => any ? Partial<P> : never;

function strictFunction(a: string, b: number, c: boolean): void {
  console.log(a, b, c);
}

type OptionalParams = OptionalParameters<typeof strictFunction>;
// Type: Partial<[string, number, boolean]>

// Transform all methods in an interface to be async
type AsyncMethods<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R 
    ? (...args: P) => Promise<R>
    : T[K];
};

interface SyncService {
  getData(): string;
  saveData(data: string): boolean;
  deleteData(id: number): void;
}

type AsyncService = AsyncMethods<SyncService>;
// {
//   getData(): Promise<string>;
//   saveData(data: string): Promise<boolean>;
//   deleteData(id: number): Promise<void>;
// }

class AsyncServiceImpl implements AsyncService {
  async getData(): Promise<string> {
    return "data";
  }

  async saveData(data: string): Promise<boolean> {
    console.log("Saving:", data);
    return true;
  }

  async deleteData(id: number): Promise<void> {
    console.log("Deleting:", id);
  }
}

// ===== PROPERTY PATH TYPES =====
type PropertyPath<T> = T extends object 
  ? {
      [K in keyof T]: K extends string | number
        ? T[K] extends object
          ? \`\${K}\` | \`\${K}.\${PropertyPath<T[K]>}\`
          : \`\${K}\`
        : never;
    }[keyof T]
  : never;

interface NestedObject {
  user: {
    profile: {
      name: string;
      settings: {
        theme: 'light' | 'dark';
        notifications: boolean;
      };
    };
    permissions: string[];
  };
  metadata: {
    version: number;
  };
}

type ValidPaths = PropertyPath<NestedObject>;
// 'user' | 'user.profile' | 'user.profile.name' | 'user.profile.settings' | 
// 'user.profile.settings.theme' | 'user.profile.settings.notifications' | 
// 'user.permissions' | 'metadata' | 'metadata.version'

// Get type at path
type PathValue<T, P extends string> = 
  P extends keyof T 
    ? T[P]
    : P extends \`\${infer K}.\${infer R}\`
      ? K extends keyof T
        ? PathValue<T[K], R>
        : never
      : never;

type ThemeType = PathValue<NestedObject, 'user.profile.settings.theme'>;
// Type: 'light' | 'dark'

// ===== BRANDED TYPES WITH UTILITIES =====
type Brand<K, T> = K & { __brand: T };

type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;
type OrderId = Brand<string, 'OrderId'>;

// Utility to extract brand
type ExtractBrand<T> = T extends Brand<any, infer B> ? B : never;

type UserIdBrand = ExtractBrand<UserId>; // 'UserId'

// Create mapping from branded types to their base types
type UnBrand<T> = T extends Brand<infer U, any> ? U : T;

type UnbrandedUserId = UnBrand<UserId>; // string

// Function to safely cast to branded type
function createBrandedId<T extends string>(type: T) {
  return function(id: string): Brand<string, T> {
    return id as Brand<string, T>;
  };
}

const createUserId = createBrandedId('UserId');
const createProductId = createBrandedId('ProductId');

const userId = createUserId('user-123'); // UserId
const productId = createProductId('prod-456'); // ProductId

// ===== CONDITIONAL TYPE UTILITIES =====
// Check if type extends another
type IsExtends<T, U> = T extends U ? true : false;

type StringExtendsAny = IsExtends<string, any>; // true
type NumberExtendsString = IsExtends<number, string>; // false

// Check if types are equal
type IsEqual<T, U> = T extends U ? U extends T ? true : false : false;

type StringEqualsString = IsEqual<string, string>; // true
type StringEqualsNumber = IsEqual<string, number>; // false

// Get union of all possible types in a complex type
type AllTypes<T> = T extends any 
  ? T extends object 
    ? T | AllTypes<T[keyof T]>
    : T
  : never;

interface ComplexStructure {
  str: string;
  num: number;
  nested: {
    bool: boolean;
    arr: string[];
  };
}

type AllPossibleTypes = AllTypes<ComplexStructure>;
// ComplexStructure | string | number | { bool: boolean; arr: string[]; } | boolean | string[]`,

    conditional: `// Conditional utility types and advanced type manipulation

// ===== ADVANCED CONDITIONAL TYPES =====
// Switch-like conditional types
type TypeSwitch<T, Cases extends Record<string, any>, Default = never> = 
  T extends keyof Cases ? Cases[T] : Default;

type ResponseType = TypeSwitch<
  'success' | 'error' | 'loading',
  {
    success: { data: any; message: string };
    error: { error: string; code: number };
    loading: { progress: number };
  },
  { unknown: true }
>;

// Multi-condition conditional types
type ComplexCondition<T> = 
  T extends string 
    ? T extends \`prefix-\${string}\`
      ? 'prefixed-string'
      : 'regular-string'
    : T extends number
      ? T extends 0
        ? 'zero'
        : 'non-zero-number'
      : T extends boolean
        ? T extends true
          ? 'true-boolean'
          : 'false-boolean'
        : 'unknown-type';

type TestConditions = [
  ComplexCondition<'prefix-test'>,    // 'prefixed-string'
  ComplexCondition<'test'>,          // 'regular-string'
  ComplexCondition<0>,               // 'zero'
  ComplexCondition<42>,              // 'non-zero-number'
  ComplexCondition<true>,            // 'true-boolean'
  ComplexCondition<false>,           // 'false-boolean'
  ComplexCondition<object>           // 'unknown-type'
];

// ===== FUNCTION SIGNATURE MANIPULATION =====
// Transform function to return Promise
type Promisify<T> = T extends (...args: infer P) => infer R 
  ? (...args: P) => Promise<R>
  : never;

type CallbackFunction = (error: Error | null, result?: string) => void;

// Convert callback-style to Promise-style
type PromiseFunction<T> = T extends (callback: (error: any, result?: infer R) => void) => void
  ? () => Promise<R>
  : T extends (arg1: infer A1, callback: (error: any, result?: infer R) => void) => void
    ? (arg1: A1) => Promise<R>
    : T extends (arg1: infer A1, arg2: infer A2, callback: (error: any, result?: infer R) => void) => void
      ? (arg1: A1, arg2: A2) => Promise<R>
      : never;

declare function readFile(path: string, callback: (error: Error | null, data?: string) => void): void;
declare function writeFile(path: string, data: string, callback: (error: Error | null) => void): void;

type PromiseReadFile = PromiseFunction<typeof readFile>; // (path: string) => Promise<string>
type PromiseWriteFile = PromiseFunction<typeof writeFile>; // (path: string, data: string) => Promise<void>

// ===== OBJECT PROPERTY TRANSFORMATIONS =====
// Transform object properties based on their types
type TransformProperties<T, From, To> = {
  [K in keyof T]: T[K] extends From ? To : T[K];
};

interface ApiConfig {
  timeout: number;
  retries: number;
  baseUrl: string;
  apiKey: string;
  debug: boolean;
  headers: Record<string, string>;
}

// Convert all strings to optional strings
type OptionalStrings = TransformProperties<ApiConfig, string, string | undefined>;

// Convert all numbers to strings
type StringifiedNumbers = TransformProperties<ApiConfig, number, string>;

// Make specific types readonly
type ReadonlyStrings = TransformProperties<ApiConfig, string, Readonly<string>>;

// ===== ARRAY AND TUPLE MANIPULATION =====
// Get first element type
type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;

// Get tail (all elements except first)
type Tail<T extends readonly any[]> = T extends readonly [any, ...infer R] ? R : [];

// Get last element type
type Last<T extends readonly any[]> = T extends readonly [...any[], infer L] ? L : never;

// Reverse tuple
type Reverse<T extends readonly any[]> = T extends readonly [...infer Rest, infer Last]
  ? [Last, ...Reverse<Rest>]
  : [];

type ExampleTuple = [1, 'hello', true, { id: number }];

type FirstElement = Head<ExampleTuple>; // 1
type RestElements = Tail<ExampleTuple>; // ['hello', true, { id: number }]
type LastElement = Last<ExampleTuple>; // { id: number }
type ReversedTuple = Reverse<ExampleTuple>; // [{ id: number }, true, 'hello', 1]

// ===== TEMPLATE LITERAL TYPE UTILITIES =====
// Convert string to different cases
type ToUpperCase<S extends string> = Uppercase<S>;
type ToLowerCase<S extends string> = Lowercase<S>;
type ToCapitalize<S extends string> = Capitalize<S>;
type ToUncapitalize<S extends string> = Uncapitalize<S>;

// Convert camelCase to kebab-case
type CamelToKebab<S extends string> = S extends \`\${infer First}\${infer Rest}\`
  ? First extends Uppercase<First>
    ? First extends Lowercase<First>
      ? \`\${First}\${CamelToKebab<Rest>}\`
      : \`-\${Lowercase<First>}\${CamelToKebab<Rest>}\`
    : \`\${First}\${CamelToKebab<Rest>}\`
  : S;

type KebabCase1 = CamelToKebab<'backgroundColor'>; // '-background-color'
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

// ===== RECURSIVE CONDITIONAL TYPES =====
// Calculate length of tuple
type Length<T extends readonly any[]> = T extends { readonly length: infer L } ? L : never;

type TupleLength = Length<[1, 2, 3, 4, 5]>; // 5

// Join array elements with separator
type Join<T extends readonly string[], S extends string = ','> = T extends readonly [infer First, ...infer Rest]
  ? First extends string
    ? Rest extends readonly string[]
      ? Rest['length'] extends 0
        ? First
        : \`\${First}\${S}\${Join<Rest, S>}\`
      : never
    : never
  : '';

type JoinedPath = Join<['users', 'profile', 'settings'], '.'>; // 'users.profile.settings'
type CsvString = Join<['apple', 'banana', 'orange'], ', '>; // 'apple, banana, orange'

// Split string by delimiter (simplified version)
type Split<S extends string, D extends string> = S extends \`\${infer First}\${D}\${infer Rest}\`
  ? [First, ...Split<Rest, D>]
  : [S];

type PathSegments = Split<'user.profile.name', '.'>; // ['user', 'profile', 'name']
type UrlParts2 = Split<'api/v1/users/123', '/'>; // ['api', 'v1', 'users', '123']

// ===== ADVANCED OBJECT MANIPULATION =====
// Deep merge two types
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

interface DefaultConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  ui: {
    theme: 'light' | 'dark';
    language: string;
  };
}

interface UserConfig {
  api: {
    timeout: number;
    apiKey: string;
  };
  ui: {
    theme: 'dark';
  };
  features: {
    beta: boolean;
  };
}

type MergedConfig = DeepMerge<DefaultConfig, UserConfig>;
// Result combines both configurations with user config taking precedence

// Create a type-safe path validator
type IsValidPath<T, P extends string> = P extends PropertyPath<T> ? true : false;

type ValidUserPath = IsValidPath<NestedObject, 'user.profile.name'>; // true
type InvalidPath = IsValidPath<NestedObject, 'user.invalid.path'>; // false

function getDeepValue<T, P extends PropertyPath<T>>(
  obj: T,
  path: P
): PathValue<T, P> {
  // Implementation would split path and traverse object
  return path.split('.').reduce((current: any, key) => current?.[key], obj);
}`,

    mapped: `// Mapped types and advanced transformations

// ===== CUSTOM MAPPED TYPE PATTERNS =====
// Create a type where all properties are observable
type Observable<T> = {
  [K in keyof T]: {
    value: T[K];
    subscribe: (callback: (value: T[K]) => void) => () => void;
    update: (newValue: T[K]) => void;
  };
};

interface UserState {
  name: string;
  age: number;
  isOnline: boolean;
}

type ObservableUserState = Observable<UserState>;
// {
//   name: { value: string; subscribe: (callback: (value: string) => void) => () => void; update: (newValue: string) => void; };
//   age: { value: number; subscribe: (callback: (value: number) => void) => () => void; update: (newValue: number) => void; };
//   isOnline: { value: boolean; subscribe: (callback: (value: boolean) => void) => () => void; update: (newValue: boolean) => void; };
// }

// Create validation schema type
type ValidationSchema<T> = {
  [K in keyof T]-?: {
    required?: boolean;
    validators?: ((value: T[K]) => boolean | string)[];
    transform?: (value: any) => T[K];
    default?: T[K];
  };
};

type UserValidationSchema = ValidationSchema<UserState>;

const userSchema: UserValidationSchema = {
  name: {
    required: true,
    validators: [
      (value: string) => value.length >= 2 || 'Name must be at least 2 characters',
      (value: string) => /^[a-zA-Z\\s]+$/.test(value) || 'Name must contain only letters'
    ]
  },
  age: {
    required: true,
    validators: [
      (value: number) => value >= 0 && value <= 120 || 'Age must be between 0 and 120'
    ],
    transform: (value: any) => parseInt(value, 10)
  },
  isOnline: {
    default: false
  }
};

// ===== CONDITIONAL MAPPED TYPES =====
// Make specific types optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific types required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

type UserProfileWithRequiredName = RequiredBy<UserProfile, 'name' | 'email'>;
// { id: string; avatar?: string; bio?: string; name: string; email: string; }

// Create nullable version of specific properties
type NullableBy<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

type UserWithNullableAvatar = NullableBy<UserProfile, 'avatar' | 'bio'>;
// { id: string; name?: string; email?: string; avatar: string | null; bio: string | null; }

// ===== FUNCTION PROPERTY MAPPING =====
// Convert all methods to async versions
type AsyncifyMethods<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? (...args: P) => Promise<R>
    : T[K];
};

interface DataService {
  fetchUser(id: string): User;
  saveUser(user: User): boolean;
  deleteUser(id: string): void;
  metadata: { version: string; };
}

type AsyncDataService = AsyncifyMethods<DataService>;
// {
//   fetchUser(id: string): Promise<User>;
//   saveUser(user: User): Promise<boolean>;
//   deleteUser(id: string): Promise<void>;
//   metadata: { version: string; };
// }

// Create a mocked version where all methods return mocked data
type MockedMethods<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R
    ? (...args: any[]) => R | Promise<R>
    : T[K];
};

type MockDataService = MockedMethods<DataService>;

// ===== PROXY TYPES FOR RUNTIME BEHAVIOR =====
// Create a type that represents a proxy with intercepted property access
type Proxied<T> = {
  [K in keyof T]: T[K];
} & {
  $get<K extends keyof T>(key: K): T[K];
  $set<K extends keyof T>(key: K, value: T[K]): void;
  $has<K extends keyof T>(key: K): boolean;
  $delete<K extends keyof T>(key: K): boolean;
};

function createProxy<T extends object>(target: T): Proxied<T> {
  return new Proxy(target, {
    get(obj: any, prop) {
      if (typeof prop === 'string' && prop.startsWith('$')) {
        const method = prop.slice(1);
        switch (method) {
          case 'get':
            return (key: keyof T) => obj[key];
          case 'set':
            return (key: keyof T, value: any) => { obj[key] = value; };
          case 'has':
            return (key: keyof T) => key in obj;
          case 'delete':
            return (key: keyof T) => delete obj[key];
        }
      }
      return obj[prop];
    }
  }) as Proxied<T>;
}

// ===== CONDITIONAL PROPERTY MAPPING =====
// Map properties based on their types
type MapByType<T, TypeCondition, MappedType> = {
  [K in keyof T]: T[K] extends TypeCondition ? MappedType : T[K];
};

// Convert all string properties to uppercase
type UppercaseStrings<T> = MapByType<T, string, Uppercase<string & T[keyof T]>>;

// Convert all function properties to optional
type OptionalFunctions<T> = {
  [K in keyof T]: T[K] extends Function ? T[K] | undefined : T[K];
};

interface MixedInterface {
  name: string;
  count: number;
  isActive: boolean;
  process: () => void;
  calculate: (x: number) => number;
  metadata: object;
}

type OptionalFunctionProps = OptionalFunctions<MixedInterface>;
// {
//   name: string;
//   count: number;
//   isActive: boolean;
//   process: (() => void) | undefined;
//   calculate: ((x: number) => number) | undefined;
//   metadata: object;
// }

// ===== NESTED OBJECT FLATTENING =====
// Flatten nested object keys with dot notation
type FlattenObjectKeys<T, Prefix extends string = ''> = {
  [K in keyof T]: K extends string
    ? T[K] extends object
      ? T[K] extends any[]
        ? \`\${Prefix}\${K}\`
        : FlattenObjectKeys<T[K], \`\${Prefix}\${K}.\`>
      : \`\${Prefix}\${K}\`
    : never;
}[keyof T];

interface NestedData {
  user: {
    profile: {
      personal: {
        name: string;
        age: number;
      };
      social: {
        email: string;
        twitter?: string;
      };
    };
    settings: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
  app: {
    version: string;
    features: string[];
  };
}

type FlatKeys = FlattenObjectKeys<NestedData>;
// 'user.profile.personal.name' | 'user.profile.personal.age' | 
// 'user.profile.social.email' | 'user.profile.social.twitter' | 
// 'user.settings.theme' | 'user.settings.notifications' | 
// 'app.version' | 'app.features'

// ===== DISCRIMINATED UNION UTILITIES =====
// Extract specific variant from discriminated union
type ExtractVariant<T, K extends PropertyKey, V> = T extends { [P in K]: V } ? T : never;

type ApiResponse<T> = 
  | { status: 'success'; data: T; message: string }
  | { status: 'error'; error: string; code: number }
  | { status: 'loading'; progress: number };

type SuccessResponse<T> = ExtractVariant<ApiResponse<T>, 'status', 'success'>;
type ErrorResponse = ExtractVariant<ApiResponse<any>, 'status', 'error'>;
type LoadingResponse = ExtractVariant<ApiResponse<any>, 'status', 'loading'>;

// Create union of all discriminant values
type DiscriminantValues<T, K extends PropertyKey> = T extends { [P in K]: infer V } ? V : never;

type ApiStatuses = DiscriminantValues<ApiResponse<any>, 'status'>; // 'success' | 'error' | 'loading'

// ===== ADVANCED KEY MANIPULATION =====
// Filter keys by value type
type FilterKeysByValueType<T, ValueType> = {
  [K in keyof T]: T[K] extends ValueType ? K : never;
}[keyof T];

type StringKeys = FilterKeysByValueType<MixedInterface, string>; // 'name'
type FunctionKeys = FilterKeysByValueType<MixedInterface, Function>; // 'process' | 'calculate'

// Rename keys based on a mapping
type RenameKeys<T, Mapping extends Record<keyof T, PropertyKey>> = {
  [NewKey in Mapping[keyof T]]: NewKey extends Mapping[infer OriginalKey]
    ? OriginalKey extends keyof T
      ? T[OriginalKey]
      : never
    : never;
};

type KeyMapping = {
  name: 'fullName';
  count: 'total';
  isActive: 'active';
};

// This would rename the keys according to the mapping
type RenamedInterface = RenameKeys<Pick<MixedInterface, keyof KeyMapping>, KeyMapping>;

// ===== EVENT SYSTEM MAPPING =====
// Create event handler types from event definitions
type EventMap = {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string };
  'data:update': { id: string; changes: Record<string, any> };
  'error:occurred': { message: string; code: number };
};

type EventHandlers<T extends Record<string, any>> = {
  [K in keyof T as \`on\${Capitalize<string & K>}\`]?: (event: T[K]) => void;
};

type UserEventHandlers = EventHandlers<EventMap>;
// {
//   'onUser:login'?: (event: { userId: string; timestamp: Date }) => void;
//   'onUser:logout'?: (event: { userId: string }) => void;
//   'onData:update'?: (event: { id: string; changes: Record<string, any> }) => void;
//   'onError:occurred'?: (event: { message: string; code: number }) => void;
// }`,

    advanced: `// Advanced utility type patterns and meta-programming

// ===== TYPE-LEVEL PROGRAMMING =====
// Implement type-level arithmetic
type Tuple<N extends number, Result extends unknown[] = []> = 
  Result['length'] extends N ? Result : Tuple<N, [...Result, unknown]>;

type Length<T extends readonly unknown[]> = T['length'];

type Add<A extends number, B extends number> = 
  Length<[...Tuple<A>, ...Tuple<B>]>;

type Subtract<A extends number, B extends number> = 
  Tuple<A> extends [...Tuple<B>, ...infer Rest] 
    ? Length<Rest> 
    : never;

type Multiply<A extends number, B extends number, Counter extends unknown[] = [], Acc extends unknown[] = []> =
  Counter['length'] extends B
    ? Length<Acc>
    : Multiply<A, B, [...Counter, unknown], [...Acc, ...Tuple<A>]>;

type Sum = Add<3, 4>; // 7
type Difference = Subtract<10, 3>; // 7
type Product = Multiply<3, 4>; // 12

// Type-level comparison
type IsGreater<A extends number, B extends number> = 
  [A, B] extends [B, A] 
    ? false
    : Tuple<B> extends [...Tuple<A>, ...unknown[]]
      ? false
      : true;

type FiveGreaterThanThree = IsGreater<5, 3>; // true
type ThreeGreaterThanFive = IsGreater<3, 5>; // false

// ===== ADVANCED FUNCTION COMPOSITION =====
// Compose function types
type Compose<F, G> = F extends (arg: infer A) => infer B
  ? G extends (arg: B) => infer C
    ? (arg: A) => C
    : never
  : never;

type StringToNumber = (s: string) => number;
type NumberToBoolean = (n: number) => boolean;

type StringToBoolean = Compose<StringToNumber, NumberToBoolean>; // (s: string) => boolean

// Pipe multiple functions
type Pipe<T extends readonly any[]> = T extends readonly [
  (arg: infer A) => infer B,
  ...infer Rest
]
  ? Rest extends readonly [(arg: B) => any, ...any[]]
    ? (arg: A) => ReturnType<Pipe<Rest>>
    : (arg: A) => B
  : never;

type Pipeline = Pipe<[
  (s: string) => number,
  (n: number) => boolean,
  (b: boolean) => string
]>; // (s: string) => string

// Curry function types
type Curry<P extends readonly any[], R> = P extends readonly [
  infer Head,
  ...infer Tail
]
  ? (arg: Head) => Curry<Tail, R>
  : R;

type CurriedFunction = Curry<[string, number, boolean], void>;
// (arg: string) => (arg: number) => (arg: boolean) => void

// ===== ADVANCED STRING MANIPULATION =====
// String parsing and manipulation
type Split<S extends string, Delimiter extends string> = 
  S extends \`\${infer First}\${Delimiter}\${infer Rest}\`
    ? [First, ...Split<Rest, Delimiter>]
    : [S];

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

type SplitPath = Split<'user.profile.name', '.'>; // ['user', 'profile', 'name']
type JoinPath = Join<['user', 'profile', 'name'], '.'>; // 'user.profile.name'

// String length calculation
type StringLength<S extends string, Counter extends unknown[] = []> = 
  S extends \`\${string}\${infer Rest}\`
    ? StringLength<Rest, [...Counter, unknown]>
    : Counter['length'];

type Length5 = StringLength<'hello'>; // 5

// ===== STATE MACHINE AT TYPE LEVEL =====
// Define state transitions as types
type StateTransition<
  CurrentState extends string,
  Event extends string,
  NextState extends string
> = {
  from: CurrentState;
  event: Event;
  to: NextState;
};

type TrafficLightTransitions = 
  | StateTransition<'red', 'timer', 'green'>
  | StateTransition<'green', 'timer', 'yellow'>
  | StateTransition<'yellow', 'timer', 'red'>
  | StateTransition<'red', 'emergency', 'green'>
  | StateTransition<'green', 'emergency', 'red'>
  | StateTransition<'yellow', 'emergency', 'red'>;

// Get next state given current state and event
type GetNextState<
  T extends StateTransition<any, any, any>,
  State extends string,
  Event extends string
> = T extends StateTransition<State, Event, infer Next> ? Next : never;

type NextAfterRed = GetNextState<TrafficLightTransitions, 'red', 'timer'>; // 'green'

// Get all possible events from a state
type GetValidEvents<
  T extends StateTransition<any, any, any>,
  State extends string
> = T extends StateTransition<State, infer Event, any> ? Event : never;

type RedEvents = GetValidEvents<TrafficLightTransitions, 'red'>; // 'timer' | 'emergency'

// ===== ADVANCED OBJECT VALIDATION =====
// Create a type that validates object structure at compile time
type ValidateStructure<T, Schema> = {
  [K in keyof Schema]: K extends keyof T
    ? Schema[K] extends 'string'
      ? T[K] extends string
        ? T[K]
        : never
      : Schema[K] extends 'number'
        ? T[K] extends number
          ? T[K]
          : never
        : Schema[K] extends 'boolean'
          ? T[K] extends boolean
            ? T[K]
            : never
          : Schema[K] extends object
            ? ValidateStructure<T[K], Schema[K]>
            : never
    : never;
};

type UserSchema = {
  id: 'number';
  name: 'string';
  profile: {
    email: 'string';
    age: 'number';
  };
};

type ValidUser = ValidateStructure<{
  id: 123;
  name: 'John';
  profile: {
    email: 'john@example.com';
    age: 30;
  };
}, UserSchema>; // Valid - resolves to the object type

// ===== REFLECTION UTILITIES =====
// Get constructor information
type GetConstructor<T> = T extends new (...args: infer P) => infer R 
  ? { parameters: P; returnType: R }
  : never;

class ExampleClass {
  constructor(name: string, age: number) {}
}

type ClassInfo = GetConstructor<typeof ExampleClass>;
// { parameters: [string, number]; returnType: ExampleClass }

// Get all method names
type GetMethods<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

class UserService {
  create(user: User): void {}
  update(id: string, user: Partial<User>): void {}
  delete(id: string): void {}
  findById(id: string): User | undefined { return undefined; }
}

type ServiceMethods = GetMethods<UserService>; // 'create' | 'update' | 'delete' | 'findById'

// Get all property names (non-functions)
type GetProperties<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

// ===== ADVANCED TEMPLATE LITERAL MANIPULATION =====
// Parse URL parameters
type ParseUrlParams<T extends string> = 
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param]: string } & ParseUrlParams<Rest>
    : T extends \`\${string}:\${infer Param}\`
      ? { [K in Param]: string }
      : {};

type ApiParams = ParseUrlParams<'/api/users/:userId/posts/:postId'>;
// { userId: string; postId: string }

// Generate SQL-like query types
type SelectFrom<T, K extends keyof T = keyof T> = Pick<T, K>;
type WhereCondition<T> = {
  [K in keyof T]?: T[K] | { $gt?: T[K]; $lt?: T[K]; $in?: T[K][]; };
};

type OrderBy<T> = { [K in keyof T]?: 'ASC' | 'DESC' };

type Query<T> = {
  select?: (keyof T)[];
  where?: WhereCondition<T>;
  orderBy?: OrderBy<T>;
  limit?: number;
  offset?: number;
};

type UserQuery = Query<User>;
// Complex query type with proper type safety

// ===== ERROR HANDLING UTILITIES =====
// Result type with detailed error information
type Result<T, E = string> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

// Async Result
type AsyncResult<T, E = string> = Promise<Result<T, E>>;

// Chain results monadically
type ChainResults<T, U, E> = (value: T) => Result<U, E>;

// Map over successful results
type MapResult<T, U, E> = (value: T) => U;

// Collect multiple results
type CollectResults<T extends readonly Result<any, any>[]> = 
  T extends readonly [infer Head, ...infer Tail]
    ? Head extends Result<infer H, infer E>
      ? Tail extends readonly Result<any, any>[]
        ? CollectResults<Tail> extends Result<infer TailData, E>
          ? Result<[H, ...TailData], E>
          : Result<[H], E>
        : Result<[H], E>
      : never
    : Result<[], never>;

// ===== PLUGIN SYSTEM TYPES =====
// Define a plugin interface
interface Plugin<TName extends string, TConfig = {}, TApi = {}> {
  name: TName;
  config?: TConfig;
  api?: TApi;
  init?: (config: TConfig) => TApi | Promise<TApi>;
  destroy?: () => void | Promise<void>;
  dependencies?: string[];
}

// Plugin registry
type PluginRegistry<T extends Plugin<any, any, any>[]> = {
  [K in T[number]['name']]: Extract<T[number], { name: K }>;
};

// Extract plugin APIs
type PluginApis<T extends Plugin<any, any, any>[]> = {
  [K in T[number]['name']]: Extract<T[number], { name: K }> extends Plugin<any, any, infer Api>
    ? Api
    : never;
};

// Example plugins
type LoggingPlugin = Plugin<'logging', { level: 'debug' | 'info' | 'warn' | 'error' }, {
  log: (level: string, message: string) => void;
  debug: (message: string) => void;
  info: (message: string) => void;
}>;

type CachePlugin = Plugin<'cache', { maxSize: number; ttl: number }, {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  clear: () => void;
}>;

type AuthPlugin = Plugin<'auth', { providers: string[]; secret: string }, {
  login: (credentials: any) => Promise<string>;
  logout: (token: string) => Promise<void>;
  verify: (token: string) => boolean;
}>;

type MyPlugins = [LoggingPlugin, CachePlugin, AuthPlugin];
type MyPluginRegistry = PluginRegistry<MyPlugins>;
type MyPluginApis = PluginApis<MyPlugins>;
// {
//   logging: { log: ...; debug: ...; info: ... };
//   cache: { get: ...; set: ...; clear: ... };
//   auth: { login: ...; logout: ...; verify: ... };
// }

// ===== BRAND VALIDATION UTILITIES =====
type Brand<K, T> = K & { __brand: T };
type ExtractBrand<T> = T extends Brand<any, infer B> ? B : never;

// Validate branded types at runtime
type BrandValidator<T extends Brand<any, any>> = (value: any) => value is T;

function createBrandValidator<T extends Brand<any, string>>(
  brandName: ExtractBrand<T>,
  validator: (value: any) => boolean
): BrandValidator<T> {
  return (value: any): value is T => {
    return validator(value);
  };
}

type Email = Brand<string, 'Email'>;
type PhoneNumber = Brand<string, 'PhoneNumber'>;
type UserId = Brand<string, 'UserId'>;

const isEmail = createBrandValidator<Email>('Email', (value) => 
  typeof value === 'string' && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)
);

// ===== SERIALIZATION UTILITIES =====
// Create serializable versions of types
type Serializable<T> = {
  [K in keyof T]: T[K] extends Function
    ? never
    : T[K] extends Date
      ? string
      : T[K] extends RegExp
        ? string
        : T[K] extends object
          ? Serializable<T[K]>
          : T[K];
};

interface ComplexObject {
  id: number;
  name: string;
  createdAt: Date;
  pattern: RegExp;
  process: () => void;
  nested: {
    value: string;
    updatedAt: Date;
  };
}

type SerializableComplexObject = Serializable<ComplexObject>;
// {
//   id: number;
//   name: string;
//   createdAt: string;
//   pattern: string;
//   nested: {
//     value: string;
//     updatedAt: string;
//   };
// }

// JSON-safe types
type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

type ToJson<T> = T extends JsonValue ? T : Serializable<T>;

// ===== ADVANCED TYPE ASSERTIONS =====
// Create exhaustive type checks
function assertNever(value: never): never {
  throw new Error(\`Unexpected value: \${JSON.stringify(value)}\`);
}

function handleStatus(status: 'loading' | 'success' | 'error'): string {
  switch (status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return 'Success!';
    case 'error':
      return 'Error occurred';
    default:
      return assertNever(status); // TypeScript ensures all cases are handled
  }
}

// Create type-safe enum-like structures
const Colors = {
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue'
} as const;

type ColorType = typeof Colors[keyof typeof Colors]; // 'red' | 'green' | 'blue'

// ===== DEEP TRANSFORMATION UTILITIES =====
// Transform types recursively based on conditions
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

// ===== TYPE-LEVEL INTERPRETER =====
// Simple expression language interpreter
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

type ExprResult = Evaluate<SimpleExpr>; // 8`
  },

  exercises: [
    "Create a utility type that makes all string properties in a nested object uppercase",
    "Implement a type-safe event emitter using utility types",
    "Build a utility type that validates required fields in a form schema",
    "Create a type that generates API endpoint types from a route configuration",
    "Implement a utility type that creates a deep diff between two object types",
    "Build a type-safe query builder using template literal types",
    "Create a utility type that extracts all function signatures from a class",
    "Implement a type that creates reactive versions of object properties",
    "Build a utility type that validates JSON schema at the type level",
    "Create a type-safe state machine using conditional and mapped types"
  ],

  keyPoints: [
    "Built-in utility types like Pick, Omit, Partial provide common transformations",
    "Record<K, T> creates object types with specific key-value relationships",
    "Conditional types enable different behavior based on type conditions",
    "Mapped types allow systematic transformation of object properties",
    "Template literal types enable string manipulation at the type level",
    "Advanced patterns can implement type-level programming and computation",
    "Utility types can be combined to create complex type transformations",
    "Custom utility types should be reusable and composable",
    "Type-level validation can catch errors at compile time",
    "Brand types and phantom types provide additional type safety"
  ]
};