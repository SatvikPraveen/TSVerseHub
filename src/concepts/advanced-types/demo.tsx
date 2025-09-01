// File location: src/data/concepts/advanced-types/demo.tsx

import React, { useState, useCallback, useEffect } from 'react';

// Demo component showcasing advanced TypeScript types
export const AdvancedTypesDemo: React.FC = () => {
  // State for different type demonstrations
  const [activeDemo, setActiveDemo] = useState<string>('conditional');
  const [output, setOutput] = useState<string[]>([]);

  // Utility to add output messages
  const addOutput = useCallback((message: string) => {
    setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  // Clear output
  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  // Demo 1: Conditional Types
  const runConditionalTypesDemo = useCallback(() => {
    clearOutput();
    addOutput('=== Conditional Types Demo ===');
    
    // Basic conditional type
    type IsString<T> = T extends string ? true : false;
    
    type Test1 = IsString<string>;    // true
    type Test2 = IsString<number>;    // false
    
    addOutput(`IsString<string> = ${true as Test1 extends true ? 'true' : 'false'}`);
    addOutput(`IsString<number> = ${false as Test2 extends false ? 'false' : 'true'}`);
    
    // Distributive conditional type
    type ToArray<T> = T extends any ? T[] : never;
    type UnionArray = ToArray<string | number>; // string[] | number[]
    
    addOutput('ToArray<string | number> creates: string[] | number[]');
    
    // Practical example with type guards
    function processValue<T>(value: T): T extends string ? string : T extends number ? number : T {
      if (typeof value === 'string') {
        return value.toUpperCase() as any;
      }
      if (typeof value === 'number') {
        return (value * 2) as any;
      }
      return value as any;
    }
    
    const stringResult = processValue("hello");
    const numberResult = processValue(42);
    const boolResult = processValue(true);
    
    addOutput(`processValue("hello") = "${stringResult}"`);
    addOutput(`processValue(42) = ${numberResult}`);
    addOutput(`processValue(true) = ${boolResult}`);
    
  }, [addOutput, clearOutput]);

  // Demo 2: Mapped Types
  const runMappedTypesDemo = useCallback(() => {
    clearOutput();
    addOutput('=== Mapped Types Demo ===');
    
    // Basic mapped type
    interface User {
      id: number;
      name: string;
      email: string;
    }
    
    // Create getters type
    type Getters<T> = {
      [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
    };
    
    type UserGetters = Getters<User>;
    // Results in: { getId: () => number; getName: () => string; getEmail: () => string; }
    
    addOutput('Created getter types for User interface:');
    addOutput('- getId: () => number');
    addOutput('- getName: () => string'); 
    addOutput('- getEmail: () => string');
    
    // Practical implementation
    const createUserGetters = (user: User): UserGetters => ({
      getId: () => user.id,
      getName: () => user.name,
      getEmail: () => user.email
    });
    
    const user = { id: 1, name: "John", email: "john@example.com" };
    const userGetters = createUserGetters(user);
    
    addOutput(`User: ${JSON.stringify(user)}`);
    addOutput(`getId(): ${userGetters.getId()}`);
    addOutput(`getName(): "${userGetters.getName()}"`);
    addOutput(`getEmail(): "${userGetters.getEmail()}"`);
    
    // Key remapping with filtering
    type EventHandlers<T> = {
      [K in keyof T as K extends `on${string}` ? K : never]: T[K];
    };
    
    interface Component {
      name: string;
      onClick: () => void;
      onHover: () => void;
      render: () => JSX.Element;
      onSubmit: (data: any) => void;
    }
    
    type Handlers = EventHandlers<Component>;
    // Results in: { onClick: () => void; onHover: () => void; onSubmit: (data: any) => void; }
    
    addOutput('Extracted event handlers from Component:');
    addOutput('- onClick, onHover, onSubmit (render and name filtered out)');
    
  }, [addOutput, clearOutput]);

  // Demo 3: Template Literal Types
  const runTemplateLiteralDemo = useCallback(() => {
    clearOutput();
    addOutput('=== Template Literal Types Demo ===');
    
    // Basic template literals
    type EventName = "click" | "hover" | "focus";
    type EventHandler = `on${Capitalize<EventName>}`;
    // Results in: "onClick" | "onHover" | "onFocus"
    
    addOutput('Event handlers generated from event names:');
    addOutput('["click", "hover", "focus"] → ["onClick", "onHover", "onFocus"]');
    
    // URL building
    type Protocol = "http" | "https";
    type Domain = "api.example.com" | "localhost:3000";
    type Path = "users" | "posts" | "comments";
    type ApiUrl = `${Protocol}://${Domain}/${Path}`;
    
    const apiUrls: ApiUrl[] = [
      "https://api.example.com/users",
      "http://localhost:3000/posts"
    ];
    
    addOutput('Generated API URLs:');
    apiUrls.forEach(url => addOutput(`- ${url}`));
    
    // CSS class generation
    type Size = "sm" | "md" | "lg";
    type Variant = "primary" | "secondary";
    type BtnClass = `btn-${Size}-${Variant}`;
    
    const buttonClasses: BtnClass[] = [
      "btn-sm-primary",
      "btn-md-secondary", 
      "btn-lg-primary"
    ];
    
    addOutput('CSS button classes:');
    buttonClasses.forEach(cls => addOutput(`- ${cls}`));
    
    // Route parameter extraction
    type ExtractParams<T extends string> = 
      T extends `${string}/:${infer Param}/${infer Rest}`
        ? Param | ExtractParams<`/${Rest}`>
        : T extends `${string}/:${infer Param}`
          ? Param
          : never;
    
    type RouteParams = ExtractParams<"/users/:userId/posts/:postId">;
    // Results in: "userId" | "postId"
    
    addOutput('Route parameters extracted from "/users/:userId/posts/:postId":');
    addOutput('- userId, postId');
    
  }, [addOutput, clearOutput]);

  // Demo 4: Type Guards
  const runTypeGuardsDemo = useCallback(() => {
    clearOutput();
    addOutput('=== Type Guards Demo ===');
    
    // Discriminated union
    interface LoadingState {
      status: "loading";
      progress: number;
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
    
    function handleState(state: AsyncState): string {
      switch (state.status) {
        case "loading":
          return `Loading... ${state.progress}%`;
        case "success":
          return `Success: ${JSON.stringify(state.data)}`;
        case "error":
          return `Error: ${state.error}`;
        default:
          const _exhaustive: never = state;
          throw new Error(`Unhandled state: ${_exhaustive}`);
      }
    }
    
    const states: AsyncState[] = [
      { status: "loading", progress: 50 },
      { status: "success", data: { id: 1, name: "Test" } },
      { status: "error", error: "Network timeout" }
    ];
    
    addOutput('Processing different async states:');
    states.forEach(state => {
      const result = handleState(state);
      addOutput(`- ${result}`);
    });
    
    // User-defined type guard
    function isString(value: unknown): value is string {
      return typeof value === "string";
    }
    
    function isNumber(value: unknown): value is number {
      return typeof value === "number" && !isNaN(value);
    }
    
    function processUnknown(value: unknown): string {
      if (isString(value)) {
        return `String: "${value.toUpperCase()}"`;
      }
      if (isNumber(value)) {
        return `Number: ${value.toFixed(2)}`;
      }
      return `Unknown type: ${typeof value}`;
    }
    
    const unknownValues: unknown[] = ["hello", 42, true, null, undefined];
    
    addOutput('Processing unknown values with type guards:');
    unknownValues.forEach(value => {
      const result = processUnknown(value);
      addOutput(`- ${result}`);
    });
    
  }, [addOutput, clearOutput]);

  // Demo 5: Union and Intersection Types
  const runUnionIntersectionDemo = useCallback(() => {
    clearOutput();
    addOutput('=== Union and Intersection Types Demo ===');
    
    // Union types
    type StringOrNumber = string | number;
    
    function formatValue(value: StringOrNumber): string {
      if (typeof value === "string") {
        return `"${value}"`;
      } else {
        return value.toString();
      }
    }
    
    const unionValues: StringOrNumber[] = ["hello", 42, "world", 3.14];
    
    addOutput('Formatting union type values:');
    unionValues.forEach(value => {
      const formatted = formatValue(value);
      addOutput(`- ${formatted}`);
    });
    
    // Intersection types
    interface Timestamped {
      createdAt: Date;
      updatedAt: Date;
    }
    
    interface Versioned {
      version: number;
    }
    
    type User = {
      id: number;
      name: string;
    };
    
    type UserWithMeta = User & Timestamped & Versioned;
    
    const userWithMeta: UserWithMeta = {
      id: 1,
      name: "John",
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      version: 1
    };
    
    addOutput('User with intersection types:');
    addOutput(`- ID: ${userWithMeta.id}`);
    addOutput(`- Name: ${userWithMeta.name}`);
    addOutput(`- Created: ${userWithMeta.createdAt.toLocaleDateString()}`);
    addOutput(`- Version: ${userWithMeta.version}`);
    
    // Literal unions
    type Theme = "light" | "dark" | "auto";
    type Size = "xs" | "sm" | "md" | "lg" | "xl";
    
    function getButtonStyle(theme: Theme, size: Size): string {
      const themes = {
        light: "bg-white text-black",
        dark: "bg-black text-white", 
        auto: "bg-gray-500 text-white"
      };
      
      const sizes = {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-md",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-xl"
      };
      
      return `${themes[theme]} ${sizes[size]}`;
    }
    
    addOutput('Button styles with literal unions:');
    addOutput(`- Light MD: "${getButtonStyle("light", "md")}"`);
    addOutput(`- Dark SM: "${getButtonStyle("dark", "sm")}"`);
    
  }, [addOutput, clearOutput]);

  // Demo 6: Infer Keyword
  const runInferDemo = useCallback(() => {
    clearOutput();
    addOutput('=== Infer Keyword Demo ===');
    
    // Extract return type
    type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
    
    function getUser(): { id: number; name: string } {
      return { id: 1, name: "John" };
    }
    
    type UserType = ReturnType<typeof getUser>;
    // Results in: { id: number; name: string }
    
    addOutput('Extracted return type from getUser function:');
    addOutput('{ id: number; name: string }');
    
    // Extract array element type
    type ElementType<T> = T extends (infer U)[] ? U : never;
    
    type StringElement = ElementType<string[]>; // string
    type NumberElement = ElementType<number[]>; // number
    
    addOutput('Extracted array element types:');
    addOutput('string[] → string');
    addOutput('number[] → number');
    
    // Extract first parameter
    type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
    
    function processUser(id: number, name: string, active: boolean): void {}
    
    type FirstParamType = FirstParam<typeof processUser>; // number
    
    addOutput('Extracted first parameter type from processUser:');
    addOutput('number (from id parameter)');
    
    // Promise unwrapping
    type Awaited<T> = T extends Promise<infer U> ? U : T;
    
    async function fetchData(): Promise<{ data: string[] }> {
      return { data: ["item1", "item2"] };
    }
    
    type FetchResult = Awaited<ReturnType<typeof fetchData>>;
    // Results in: { data: string[] }
    
    addOutput('Unwrapped Promise return type:');
    addOutput('Promise<{ data: string[] }> → { data: string[] }');
    
    // Practical infer usage - deep property extraction
    type DeepGet<T, K extends string> = K extends `${infer First}.${infer Rest}`
      ? First extends keyof T
        ? DeepGet<T[First], Rest>
        : never
      : K extends keyof T
        ? T[K]
        : never;
    
    interface NestedConfig {
      database: {
        connection: {
          host: string;
          port: number;
        };
      };
    }
    
    type HostType = DeepGet<NestedConfig, "database.connection.host">; // string
    type PortType = DeepGet<NestedConfig, "database.connection.port">; // number
    
    addOutput('Deep property extraction with infer:');
    addOutput('"database.connection.host" → string');
    addOutput('"database.connection.port" → number');
    
  }, [addOutput, clearOutput]);

  // Demo runner mapping
  const demos = {
    conditional: {
      title: "Conditional Types",
      run: runConditionalTypesDemo,
      description: "Types that select based on conditions"
    },
    mapped: {
      title: "Mapped Types", 
      run: runMappedTypesDemo,
      description: "Transform object types systematically"
    },
    template: {
      title: "Template Literals",
      run: runTemplateLiteralDemo,
      description: "String manipulation at the type level"
    },
    guards: {
      title: "Type Guards",
      run: runTypeGuardsDemo,
      description: "Runtime type checking and narrowing"
    },
    union: {
      title: "Union & Intersection",
      run: runUnionIntersectionDemo,
      description: "Combine and separate types"
    },
    infer: {
      title: "Infer Keyword",
      run: runInferDemo,
      description: "Extract types from other types"
    }
  };

  // Auto-run demo when selection changes
  useEffect(() => {
    if (demos[activeDemo as keyof typeof demos]) {
      demos[activeDemo as keyof typeof demos].run();
    }
  }, [activeDemo, demos]);

  return (
    <div className="advanced-types-demo p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Advanced TypeScript Types Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive demonstrations of advanced TypeScript type system features.
          Select a demo to see practical examples and live code execution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demo Selection */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Demo
          </h2>
          <div className="space-y-2">
            {Object.entries(demos).map(([key, demo]) => (
              <button
                key={key}
                onClick={() => setActiveDemo(key)}
                className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                  activeDemo === key
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {demo.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {demo.description}
                </p>
              </button>
            ))}
          </div>
          
          <div className="mt-6">
            <button
              onClick={clearOutput}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Clear Output
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Demo Output
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {output.length} messages
            </div>
          </div>
          
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 h-96 overflow-auto">
            {output.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a demo to see output
              </div>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {output.map((line, index) => (
                  <div
                    key={index}
                    className={`${
                      line.includes('===') 
                        ? 'text-yellow-400 font-bold' 
                        : line.includes('Error:') || line.includes('❌')
                          ? 'text-red-400'
                          : line.includes('Success:') || line.includes('✅')
                            ? 'text-green-400'
                            : 'text-gray-300'
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              💡 <strong>Tip:</strong> This demo shows runtime behavior alongside TypeScript's 
              compile-time type checking. The type transformations happen during compilation, 
              while the output shows the actual JavaScript execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTypesDemo;