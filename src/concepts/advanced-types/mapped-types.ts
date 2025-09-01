// File location: src/data/concepts/advanced-types/mapped-types.ts

export interface MappedTypesContent {
  title: string;
  description: string;
  codeExamples: {
    basic: string;
    modifiers: string;
    keyRemapping: string;
    templateLiterals: string;
    advanced: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const mappedTypesContent: MappedTypesContent = {
  title: "Mapped Types",
  description: "Mapped types build on the syntax for index signatures to create new types based on existing ones. They're a powerful way to transform types systematically.",
  
  codeExamples: {
    basic: `// Basic mapped type syntax
// { [P in K]: T }

// Simple property transformation
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type ReadonlyUser = Readonly<User>;
// { readonly id: number; readonly name: string; readonly email: string; }

type PartialUser = Optional<User>;
// { id?: number; name?: string; email?: string; }

// Mapping over union types
type Keys = "name" | "age" | "email";
type StringRecord = {
  [K in Keys]: string;
};
// { name: string; age: string; email: string; }

// Using literal types as keys
type HttpMethods = "GET" | "POST" | "PUT" | "DELETE";
type ApiEndpoints = {
  [Method in HttpMethods]: (url: string) => Promise<any>;
};

// Transforming property types
type Stringify<T> = {
  [P in keyof T]: string;
};

type Nullify<T> = {
  [P in keyof T]: T[P] | null;
};

type StringUser = Stringify<User>;
// { id: string; name: string; email: string; }`,

    modifiers: `// Mapped type modifiers: readonly, optional, and their removal

// Adding modifiers
type AddReadonly<T> = {
  +readonly [P in keyof T]: T[P];
};

type AddOptional<T> = {
  [P in keyof T]+?: T[P];
};

// Removing modifiers
type RemoveReadonly<T> = {
  -readonly [P in keyof T]: T[P];
};

type RemoveOptional<T> = {
  [P in keyof T]-?: T[P];
};

interface ReadonlyUser {
  readonly id: number;
  readonly name?: string;
  readonly email?: string;
}

type MutableUser = RemoveReadonly<ReadonlyUser>;
// { id: number; name?: string; email?: string; }

type RequiredUser = RemoveOptional<ReadonlyUser>;
// { readonly id: number; readonly name: string; readonly email: string; }

type MutableRequiredUser = RemoveReadonly<RemoveOptional<ReadonlyUser>>;
// { id: number; name: string; email: string; }

// Conditional modifier application
type MakeOptional<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | undefined : T[P];
} & {
  [P in K]?: T[P];
};

type UserWithOptionalEmail = MakeOptional<User, "email">;
// Makes only the email property optional

// Selective readonly application
type MakeReadonly<T, K extends keyof T> = {
  readonly [P in K]: T[P];
} & {
  [P in Exclude<keyof T, K>]: T[P];
};

type UserWithReadonlyId = MakeReadonly<User, "id">;
// Only id becomes readonly`,

    keyRemapping: `// Key remapping in mapped types (TypeScript 4.1+)
// { [P in keyof T as NewKey]: T[P] }

// Rename all keys with a prefix
type Prefixed<T, Prefix extends string> = {
  [K in keyof T as \`\${Prefix}\${string & K}\`]: T[K];
};

type PrefixedUser = Prefixed<User, "user_">;
// { user_id: number; user_name: string; user_email: string; }

// Filter and transform keys
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string; getEmail: () => string; }

// Remove keys that match a pattern
type RemoveKindField<T> = {
  [K in keyof T as K extends \`\${string}Kind\` ? never : K]: T[K];
};

interface NodeWithKind {
  nodeKind: string;
  elementKind: string;
  name: string;
  value: number;
}

type CleanNode = RemoveKindField<NodeWithKind>;
// { name: string; value: number; }

// Conditional key remapping
type ApiResponse<T> = {
  [K in keyof T as \`\${string & K}Response\`]: {
    data: T[K];
    status: number;
    message: string;
  };
};

interface ApiMethods {
  getUser: User;
  createUser: User;
  updateUser: User;
}

type ApiResponses = ApiResponse<ApiMethods>;
// {
//   getUserResponse: { data: User; status: number; message: string; };
//   createUserResponse: { data: User; status: number; message: string; };
//   updateUserResponse: { data: User; status: number; message: string; };
// }

// Extract specific key patterns
type EventHandlers<T> = {
  [K in keyof T as K extends \`on\${string}\` ? K : never]: T[K];
};

interface Component {
  name: string;
  onClick: () => void;
  onHover: () => void;
  onSubmit: (data: any) => void;
  render: () => JSX.Element;
}

type Handlers = EventHandlers<Component>;
// { onClick: () => void; onHover: () => void; onSubmit: (data: any) => void; }`,

    templateLiterals: `// Template literal types in mapped types

// Create discriminated union from object keys
type EventMap = {
  click: { x: number; y: number; };
  keypress: { key: string; };
  focus: { target: Element; };
};

type EventNames = keyof EventMap; // "click" | "keypress" | "focus"

// Create event handler types
type EventHandlers<T> = {
  [K in keyof T as \`on\${Capitalize<string & K>}\`]?: (event: T[K]) => void;
};

type TypedEventHandlers = EventHandlers<EventMap>;
// {
//   onClick?: (event: { x: number; y: number; }) => void;
//   onKeypress?: (event: { key: string; }) => void;
//   onFocus?: (event: { target: Element; }) => void;
// }

// State management pattern
type State = {
  user: User;
  posts: Post[];
  loading: boolean;
};

type Actions = {
  [K in keyof State as \`set\${Capitalize<string & K>}\`]: (value: State[K]) => void;
} & {
  [K in keyof State as \`reset\${Capitalize<string & K>}\`]: () => void;
};

// Result:
// {
//   setUser: (value: User) => void;
//   setPosts: (value: Post[]) => void;
//   setLoading: (value: boolean) => void;
//   resetUser: () => void;
//   resetPosts: () => void;
//   resetLoading: () => void;
// }

// Database column mapping
type TableColumns = {
  user_id: number;
  user_name: string;
  created_at: Date;
  updated_at: Date;
};

type CamelCaseColumns<T> = {
  [K in keyof T as K extends \`\${infer Start}_\${infer End}\`
    ? \`\${Start}\${Capitalize<End>}\`
    : K]: T[K];
};

type CamelCaseTable = CamelCaseColumns<TableColumns>;
// { userId: number; userName: string; createdAt: Date; updatedAt: Date; }

// API endpoint generation
type Resources = {
  user: User;
  post: Post;
  comment: Comment;
};

type RestEndpoints<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: (id: string) => Promise<T[K]>;
} & {
  [K in keyof T as \`create\${Capitalize<string & K>}\`]: (data: Omit<T[K], 'id'>) => Promise<T[K]>;
} & {
  [K in keyof T as \`update\${Capitalize<string & K>}\`]: (id: string, data: Partial<T[K]>) => Promise<T[K]>;
} & {
  [K in keyof T as \`delete\${Capitalize<string & K>}\`]: (id: string) => Promise<void>;
};

type Api = RestEndpoints<Resources>;`,

    advanced: `// Advanced mapped type patterns

// Deep readonly implementation
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? T[P] extends Function 
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};

// Proxy type that logs property access
type Proxied<T> = {
  [P in keyof T]: T[P] extends Function
    ? T[P] & { __proxy: true }
    : T[P];
};

// Create a type with all properties as promises
type Promisify<T> = {
  [P in keyof T]: Promise<T[P]>;
};

// Flatten nested object one level
type Flatten<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : {
          [SubK in keyof T[K] as \`\${string & K}.\${string & SubK}\`]: T[K][SubK];
        }[keyof T[K]]
    : T[K];
}[keyof T];

interface NestedUser {
  id: number;
  profile: {
    name: string;
    age: number;
  };
  settings: {
    theme: string;
    notifications: boolean;
  };
}

type FlatUser = Flatten<NestedUser>;
// { "profile.name": string; "profile.age": number; "settings.theme": string; "settings.notifications": boolean; }

// Type-safe builder pattern
type Builder<T> = {
  [K in keyof T as \`set\${Capitalize<string & K>}\`]: (value: T[K]) => Builder<T>;
} & {
  build(): T;
};

// Validation schema type generation
type ValidationSchema<T> = {
  [K in keyof T]: {
    required?: boolean;
    type: T[K] extends string ? 'string'
         : T[K] extends number ? 'number'
         : T[K] extends boolean ? 'boolean'
         : T[K] extends Date ? 'date'
         : 'object';
    validator?: (value: T[K]) => boolean;
    message?: string;
  };
};

type UserValidation = ValidationSchema<User>;
// {
//   id: { required?: boolean; type: 'number'; validator?: (value: number) => boolean; message?: string; };
//   name: { required?: boolean; type: 'string'; validator?: (value: string) => boolean; message?: string; };
//   email: { required?: boolean; type: 'string'; validator?: (value: string) => boolean; message?: string; };
// }

// Reactive state type
type Reactive<T> = {
  [K in keyof T]: {
    value: T[K];
    subscribe: (callback: (newValue: T[K], oldValue: T[K]) => void) => () => void;
    update: (updater: (current: T[K]) => T[K]) => void;
  };
};

// Form field types
type FormFields<T> = {
  [K in keyof T]: {
    value: T[K];
    error?: string;
    touched: boolean;
    validate: () => boolean;
    reset: () => void;
  };
};

type UserForm = FormFields<User>;`
  },

  exercises: [
    `// Exercise 1: Create a mapped type that makes all function properties optional
type OptionalMethods<T> = // Your implementation here

interface Service {
  getData: () => Promise<any>;
  name: string;
  saveData: (data: any) => Promise<void>;
  version: number;
}

type PartialService = OptionalMethods<Service>;
// Should make getData and saveData optional while keeping name and version required`,

    `// Exercise 2: Create a type that prefixes all keys with a namespace
type Namespaced<T, Namespace extends string> = // Your implementation here

interface Config {
  host: string;
  port: number;
  ssl: boolean;
}

type DatabaseConfig = Namespaced<Config, "db">;
// Should result in: { "db:host": string; "db:port": number; "db:ssl": boolean; }`,

    `// Exercise 3: Create a mapped type that converts snake_case keys to camelCase
type CamelCase<S extends string> = // Helper type
type SnakeToCamel<T> = // Your implementation here

interface SnakeCaseUser {
  user_id: number;
  first_name: string;
  last_name: string;
  created_at: Date;
}

type CamelCaseUser = SnakeToCamel<SnakeCaseUser>;
// Should result in: { userId: number; firstName: string; lastName: string; createdAt: Date; }`,

    `// Exercise 4: Create a type that generates setter methods for all properties
type Setters<T> = // Your implementation here

interface State {
  count: number;
  name: string;
  isLoading: boolean;
}

type StateSetters = Setters<State>;
// Should generate: { setCount: (value: number) => void; setName: (value: string) => void; setIsLoading: (value: boolean) => void; }`,

    `// Exercise 5: Create a deep partial type that works recursively
type DeepPartial<T> = // Your implementation here

interface NestedConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  server: {
    port: number;
    ssl: boolean;
  };
}

type PartialConfig = DeepPartial<NestedConfig>;
// Should make all properties and nested properties optional`
  ],

  keyPoints: [
    "Mapped types use the syntax { [P in K]: T } to create new types from existing ones",
    "The 'keyof' operator is commonly used to iterate over object property keys",
    "Modifiers (+readonly, -readonly, +?, -?) can be added or removed from properties",
    "Key remapping with 'as' allows transformation of property names (TypeScript 4.1+)",
    "Template literal types can be used with mapped types for dynamic key generation",
    "Mapped types are the foundation for TypeScript's built-in utility types",
    "Conditional types can be combined with mapped types for complex transformations",
    "Mapped types enable type-safe patterns like builders, proxies, and reactive systems",
    "They provide a way to maintain type safety while transforming object structures",
    "Recursive mapped types can handle deeply nested object transformations"
  ]
};

export default mappedTypesContent;