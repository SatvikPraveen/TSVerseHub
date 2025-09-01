// File location: src/data/concepts/advanced-types/template-literals.ts

export interface TemplateLiteralsContent {
  title: string;
  description: string;
  codeExamples: {
    basic: string;
    intrinsic: string;
    patterns: string;
    parsing: string;
    advanced: string;
  };
  exercises: string[];
  keyPoints: string[];
}

export const templateLiteralsContent: TemplateLiteralsContent = {
  title: "Template Literal Types",
  description: "Template literal types build on string literal types and have the ability to expand into many possible strings via unions. They have the same syntax as template literal strings in JavaScript.",
  
  codeExamples: {
    basic: `// Basic template literal type syntax
type World = "world";
type Greeting = \`hello \${World}\`; // "hello world"

// With union types
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";
type AllLocaleIDs = \`\${EmailLocaleIDs | FooterLocaleIDs}_id\`;
// "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"

// Building CSS property names
type HorizontalAlignment = "left" | "center" | "right";
type VerticalAlignment = "top" | "middle" | "bottom";
type Alignment = \`\${HorizontalAlignment}-\${VerticalAlignment}\`;
// "left-top" | "left-middle" | "left-bottom" | "center-top" | ... (9 total combinations)

// Event listener patterns
type EventNames = "click" | "scroll" | "mousemove";
type GlobalEventHandlers = \`on\${Capitalize<EventNames>}\`;
// "onClick" | "onScroll" | "onMousemove"

// URL building
type Protocol = "http" | "https";
type Domain = "example.com" | "test.com";
type Path = "users" | "posts" | "comments";
type ApiUrl = \`\${Protocol}://\${Domain}/api/\${Path}\`;
// "http://example.com/api/users" | "http://example.com/api/posts" | ...

// Version strings
type Major = 1 | 2 | 3;
type Minor = 0 | 1 | 2 | 3 | 4 | 5;
type Patch = 0 | 1 | 2 | 3 | 4 | 5;
type Version = \`\${Major}.\${Minor}.\${Patch}\`;
// "1.0.0" | "1.0.1" | "1.0.2" | ... (many combinations)

// CSS units
type Size = 1 | 2 | 4 | 8 | 16 | 32;
type Unit = "px" | "rem" | "em" | "%";
type CSSSize = \`\${Size}\${Unit}\`;
// "1px" | "1rem" | "1em" | "1%" | "2px" | "2rem" | ...`,

    intrinsic: `// Intrinsic string manipulation utilities
// TypeScript provides built-in helper types for common string transformations

// Uppercase
type UppercaseGreeting = Uppercase<"Hello World">; // "HELLO WORLD"
type UppercaseUnion = Uppercase<"hello" | "world">; // "HELLO" | "WORLD"

// Lowercase  
type LowercaseGreeting = Lowercase<"Hello World">; // "hello world"
type LowercaseUnion = Lowercase<"HELLO" | "WORLD">; // "hello" | "world"

// Capitalize
type CapitalizedGreeting = Capitalize<"hello world">; // "Hello world"
type CapitalizedUnion = Capitalize<"hello" | "world">; // "Hello" | "World"

// Uncapitalize
type UncapitalizedGreeting = Uncapitalize<"Hello World">; // "hello World"
type UncapitalizedUnion = Uncapitalize<"Hello" | "World">; // "hello" | "world"

// Combining transformations
type EventHandler<T extends string> = \`on\${Capitalize<T>}\`;
type ButtonEvents = "click" | "hover" | "focus";
type ButtonHandlers = EventHandler<ButtonEvents>;
// "onClick" | "onHover" | "onFocus"

// Creating getter/setter patterns
type GetterName<T extends string> = \`get\${Capitalize<T>}\`;
type SetterName<T extends string> = \`set\${Capitalize<T>}\`;

type Properties = "name" | "age" | "email";
type Getters = GetterName<Properties>; // "getName" | "getAge" | "getEmail"
type Setters = SetterName<Properties>; // "setName" | "setAge" | "setEmail"

// Database field naming convention
type SnakeCase<T extends string> = Lowercase<T>;
type DbField<T extends string> = \`\${SnakeCase<T>}_field\`;
type UserFields = "Name" | "Email" | "CreatedAt";
type DbUserFields = DbField<UserFields>;
// "name_field" | "email_field" | "createdat_field"

// HTTP methods with endpoints
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Endpoint = "/users" | "/posts" | "/comments";
type ApiCall = \`\${HttpMethod} \${Endpoint}\`;
// "GET /users" | "POST /users" | "PUT /users" | "DELETE /users" | ...

// CSS class naming
type State = "active" | "inactive" | "disabled";
type Component = "button" | "input" | "select";
type CSSClass = \`\${Component}--\${State}\`;
// "button--active" | "button--inactive" | "button--disabled" | ...`,

    patterns: `// Common template literal patterns for type-safe APIs

// 1. Path parameters
type ExtractPathParams<T extends string> = 
  T extends \`\${string}/:\${infer Param}/\${infer Rest}\`
    ? Param | ExtractPathParams<\`/\${Rest}\`>
    : T extends \`\${string}/:\${infer Param}\`
      ? Param
      : never;

type UserPath = "/users/:userId/posts/:postId";
type PathParams = ExtractPathParams<UserPath>; // "userId" | "postId"

// 2. Query string builder
type QueryParams = {
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  filter?: string;
};

type QueryString<T> = {
  [K in keyof T]: T[K] extends string | number | boolean 
    ? \`\${string & K}=\${T[K]}\`
    : never;
}[keyof T];

// 3. Environment variables
type Environment = "development" | "staging" | "production";
type Service = "api" | "database" | "redis";
type EnvVar = \`\${Uppercase<Environment>}_\${Uppercase<Service>}_URL\`;
// "DEVELOPMENT_API_URL" | "DEVELOPMENT_DATABASE_URL" | ...

// 4. Typed CSS-in-JS
type CSSProperty = "margin" | "padding" | "border";
type CSSDirection = "top" | "right" | "bottom" | "left";
type CSSPropertyWithDirection = \`\${CSSProperty}-\${CSSDirection}\`;
// "margin-top" | "margin-right" | "margin-bottom" | "margin-left" | ...

type CSSValue<T extends string> = T extends CSSPropertyWithDirection
  ? string | number
  : never;

// 5. Event system
type DomEvent = "click" | "change" | "input" | "submit";
type CustomEvent = "userLogin" | "dataUpdate" | "navigationChange";
type AllEvents = DomEvent | CustomEvent;

type EventListener<T extends AllEvents> = \`addEventListener\${Capitalize<T>}\`;
type EventListeners = {
  [K in AllEvents as EventListener<K>]: (callback: (event: any) => void) => void;
};

// 6. Validation messages
type ValidationRule = "required" | "minLength" | "maxLength" | "pattern";
type FieldName = "email" | "password" | "firstName" | "lastName";
type ValidationMessage = \`\${FieldName}.\${ValidationRule}\`;
// "email.required" | "email.minLength" | "email.maxLength" | "email.pattern" | ...

// 7. Feature flags
type FeatureArea = "auth" | "payment" | "search" | "social";
type FeatureAction = "enabled" | "disabled" | "beta";
type FeatureFlag = \`feature_\${FeatureArea}_\${FeatureAction}\`;
// "feature_auth_enabled" | "feature_auth_disabled" | "feature_auth_beta" | ...

// 8. Localization keys
type Language = "en" | "es" | "fr" | "de";
type Component = "header" | "footer" | "sidebar";
type Element = "title" | "subtitle" | "button" | "link";
type LocalizationKey = \`\${Language}.\${Component}.\${Element}\`;
// "en.header.title" | "en.header.subtitle" | "en.header.button" | ...`,

    parsing: `// Parsing and extracting from template literals

// 1. Parse file extensions
type GetFileExtension<T extends string> = 
  T extends \`\${string}.\${infer Extension}\`
    ? Extension
    : never;

type ImageExt = GetFileExtension<"photo.jpg">; // "jpg"
type DocExt = GetFileExtension<"document.pdf">; // "pdf"

// 2. Extract domain from URL
type GetDomain<T extends string> = 
  T extends \`http://\${infer Domain}/\${string}\` 
    ? Domain
    : T extends \`https://\${infer Domain}/\${string}\`
      ? Domain
      : T extends \`http://\${infer Domain}\`
        ? Domain
        : T extends \`https://\${infer Domain}\`
          ? Domain
          : never;

type Domain1 = GetDomain<"https://example.com/path">; // "example.com"
type Domain2 = GetDomain<"http://test.org">; // "test.org"

// 3. Parse semantic versions
type ParseVersion<T extends string> = 
  T extends \`\${infer Major}.\${infer Minor}.\${infer Patch}\`
    ? {
        major: Major;
        minor: Minor;
        patch: Patch;
      }
    : never;

type Version = ParseVersion<"2.1.0">;
// { major: "2"; minor: "1"; patch: "0"; }

// 4. Extract route parameters
type RouteParams<T extends string> = 
  T extends \`\${string}/:\${infer Param}\`
    ? Record<Param, string>
    : {};

type UserRoute = RouteParams<"/users/:userId">;
// { userId: string; }

type PostRoute = RouteParams<"/users/:userId/posts/:postId">;
// This would need a more complex recursive implementation

// 5. Parse CSS selectors
type ParseSelector<T extends string> = 
  T extends \`.\${infer ClassName}\`
    ? { type: "class"; name: ClassName; }
    : T extends \`#\${infer Id}\`
      ? { type: "id"; name: Id; }
      : T extends \`\${infer Tag}\`
        ? { type: "tag"; name: Tag; }
        : never;

type ClassSelector = ParseSelector<".my-class">;
// { type: "class"; name: "my-class"; }

// 6. Convert snake_case to camelCase
type SnakeToCamel<S extends string> = 
  S extends \`\${infer Start}_\${infer End}\`
    ? \`\${Start}\${SnakeToCamel<Capitalize<End>>}\`
    : S;

type CamelCase1 = SnakeToCamel<"hello_world">; // "helloWorld"
type CamelCase2 = SnakeToCamel<"user_first_name">; // "userFirstName"

// 7. Split string by delimiter
type Split<S extends string, D extends string> = 
  S extends \`\${infer Head}\${D}\${infer Tail}\`
    ? [Head, ...Split<Tail, D>]
    : [S];

type PathParts = Split<"users/123/posts", "/">;
// ["users", "123", "posts"]

// 8. Join string array
type Join<T extends readonly string[], D extends string> = 
  T extends readonly [infer First, ...infer Rest]
    ? First extends string
      ? Rest extends readonly string[]
        ? Rest["length"] extends 0
          ? First
          : \`\${First}\${D}\${Join<Rest, D>}\`
        : never
      : never
    : "";

type JoinedPath = Join<["users", "123", "posts"], "/">;
// "users/123/posts"`,

    advanced: `// Advanced template literal type patterns

// 1. SQL query builder types
type SQLOperator = "=" | "!=" | ">" | "<" | ">=" | "<=";
type WhereClause<Table extends string, Column extends string> = 
  \`WHERE \${Table}.\${Column} \${SQLOperator} ?\`;

type UserWhere = WhereClause<"users", "id">;
// "WHERE users.id = ?" | "WHERE users.id != ?" | ...

// 2. Type-safe GraphQL query builder
type GraphQLField = "id" | "name" | "email" | "createdAt";
type GraphQLQuery<T extends readonly GraphQLField[]> = 
  \`query {
  user {
    \${Join<T, "\n    ">}
  }
}\`;

type UserQuery = GraphQLQuery<["id", "name", "email"]>;

// 3. Branded types with template literals
type Brand<T, B extends string> = T & { __brand: B };
type UserId = Brand<string, "UserId">;
type Email = Brand<string, \`Email:\${string}@\${string}\`>;

// 4. Type-safe environment configuration
type EnvPrefix = "REACT_APP" | "VITE" | "NEXT_PUBLIC";
type ConfigKey = "API_URL" | "APP_NAME" | "DEBUG";
type EnvVariable = \`\${EnvPrefix}_\${ConfigKey}\`;

type AppConfig = {
  [K in EnvVariable]: string;
};

// 5. Micro-frontend module federation types
type MFEApp = "shell" | "auth" | "dashboard" | "settings";
type MFEExpose = "components" | "services" | "utils";
type MFEModule = \`\${MFEApp}/\${MFEExpose}\`;

type ModuleFederationConfig = {
  [K in MFEModule]: () => Promise<any>;
};

// 6. CSS custom properties (CSS variables)
type CSSVar<T extends string> = \`--\${T}\`;
type ThemeColor = "primary" | "secondary" | "accent" | "background";
type ColorVar = CSSVar<\`color-\${ThemeColor}\`>;
// "--color-primary" | "--color-secondary" | ...

type ThemeVars = {
  [K in ColorVar]: string;
};

// 7. Type-safe logging with levels
type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
type LogCategory = "auth" | "database" | "api" | "ui";
type LogMessage = \`[\${Uppercase<LogLevel>}] \${LogCategory}: \${string}\`;

type Logger = {
  [K in LogLevel]: (category: LogCategory, message: string) => LogMessage;
};

// 8. Advanced route parameter extraction
type ExtractRouteParams<T extends string> = 
  T extends \`\${infer Start}/:\${infer Param}/\${infer Rest}\`
    ? { [K in Param]: string } & ExtractRouteParams<\`/\${Rest}\`>
    : T extends \`\${infer Start}/:\${infer Param}\`
      ? { [K in Param]: string }
      : {};

type ComplexRoute = ExtractRouteParams<"/api/users/:userId/posts/:postId/comments/:commentId">;
// { userId: string; postId: string; commentId: string; }

// 9. Type-safe CSS grid areas
type GridArea = "header" | "sidebar" | "main" | "footer";
type GridTemplate = \`
  "header header header"
  "sidebar main main"  
  "footer footer footer"
\`;

type GridAreas = {
  [K in GridArea]: { gridArea: K };
};

// 10. Internationalization key builder
type Locale = "en" | "es" | "fr";
type Namespace = "common" | "auth" | "dashboard";
type I18nKey<N extends Namespace, K extends string> = \`\${Locale}:\${N}.\${K}\`;

type AuthKeys = I18nKey<"auth", "login" | "logout" | "register">;
// "en:auth.login" | "en:auth.logout" | "en:auth.register" | 
// "es:auth.login" | "es:auth.logout" | "es:auth.register" | ...`
  },

  exercises: [
    `// Exercise 1: Create a type that generates REST API endpoint types
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Resource = "users" | "posts" | "comments";
type ApiEndpoint = // Your implementation here

// Should generate: "GET /users" | "POST /users" | "PUT /users" | "DELETE /users" | ...`,

    `// Exercise 2: Build a type-safe CSS class generator
type Component = "button" | "input" | "card";
type Size = "sm" | "md" | "lg";
type Variant = "primary" | "secondary" | "outline";
type CSSClass = // Your implementation here

// Should generate: "button-sm-primary" | "button-sm-secondary" | "input-lg-outline" | ...`,

    `// Exercise 3: Create a version comparison type
type CompareVersions<V1 extends string, V2 extends string> = // Your implementation here

type Test1 = CompareVersions<"1.2.3", "1.2.4">; // Should be "less"
type Test2 = CompareVersions<"2.0.0", "1.9.9">; // Should be "greater"
type Test3 = CompareVersions<"1.0.0", "1.0.0">; // Should be "equal"`,

    `// Exercise 4: Extract and validate email domains
type ExtractEmailDomain<T extends string> = // Your implementation here
type IsValidEmailDomain<T extends string> = // Your implementation here

type Domain1 = ExtractEmailDomain<"user@example.com">; // Should be "example.com"
type Domain2 = ExtractEmailDomain<"test@gmail.com">; // Should be "gmail.com"
type Valid = IsValidEmailDomain<"gmail.com">; // Should validate common domains`,

    `// Exercise 5: Create a type-safe SQL query builder
type Table = "users" | "posts" | "comments";
type Column<T extends Table> = T extends "users" 
  ? "id" | "name" | "email"
  : T extends "posts"
    ? "id" | "title" | "content" | "userId"
    : "id" | "text" | "postId";

type SelectQuery<T extends Table, C extends Column<T>> = // Your implementation here

type UserQuery = SelectQuery<"users", "name" | "email">;
// Should generate: "SELECT name, email FROM users"`
  ],

  keyPoints: [
    "Template literal types use backtick syntax with \${} interpolation like JavaScript template literals",
    "They work with union types to generate all possible string combinations",
    "TypeScript provides intrinsic string manipulation utilities: Uppercase, Lowercase, Capitalize, Uncapitalize",
    "Template literals can be used with conditional types and infer for parsing strings",
    "They enable type-safe string manipulation and validation at compile time",
    "Commonly used for generating API endpoints, CSS classes, event handlers, and configuration keys",
    "Can be combined with mapped types for powerful type transformations",
    "Support recursive patterns for complex string parsing and manipulation",
    "Essential for building type-safe DSLs (Domain Specific Languages)",
    "Help create branded types and enforce string format constraints",
    "Enable compile-time string validation and autocompletion in IDEs"
  ]
};

export default templateLiteralsContent;