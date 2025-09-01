/* File: src/concepts/basics/demo.tsx */

import React, { useState } from 'react';
import DemoPanel from '../../components/dashboards/DemoPanel';
import Tabs from '../../components/ui/Tabs';
import { basicsSection, getAllBasicsTopics } from './index';

const BasicsDemo: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState('variables');
  const topics = getAllBasicsTopics();

  // Demo code examples for each topic
  const demoExamples = {
    variables: {
      title: 'Variables and Basic Types',
      description: 'Explore TypeScript\'s type system with interactive examples',
      code: `// Basic type annotations
let username: string = "TypeScriptUser";
let age: number = 25;
let isActive: boolean = true;

// Type inference
let inferredString = "Hello TypeScript!";
let inferredNumber = 42;

// Arrays
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];

// Union types
let id: string | number = "user_123";
id = 456; // This works too!

// Object types
let user: { name: string; age: number } = {
  name: "John Doe",
  age: 30
};

// Display results
console.log("Username:", username);
console.log("Age:", age);
console.log("Is Active:", isActive);
console.log("Numbers:", numbers);
console.log("User:", user);
console.log("ID can be:", typeof id === "string" ? "string" : "number");`,
      expectedOutput: `Username: TypeScriptUser
Age: 25
Is Active: true
Numbers: [1, 2, 3, 4, 5]
User: { name: "John Doe", age: 30 }
ID can be: number`,
      concepts: ['Type Annotations', 'Type Inference', 'Arrays', 'Union Types', 'Object Types']
    },

    functions: {
      title: 'Functions and Parameters',
      description: 'Learn about function typing, parameters, and return types',
      code: `// Basic function with types
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Optional parameters
function introduce(name: string, age?: number): string {
  if (age !== undefined) {
    return \`I'm \${name} and I'm \${age} years old\`;
  }
  return \`I'm \${name}\`;
}

// Default parameters
function createUser(name: string, role: string = "user"): object {
  return { name, role, id: Math.random().toString(36).substr(2, 9) };
}

// Arrow functions
const multiply = (x: number, y: number): number => x * y;

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

// Generic function
function identity<T>(arg: T): T {
  return arg;
}

// Usage examples
console.log(greet("TypeScript"));
console.log(introduce("Alice"));
console.log(introduce("Bob", 25));
console.log("New user:", createUser("Charlie"));
console.log("Multiply 4 * 5 =", multiply(4, 5));
console.log("Sum of [1,2,3,4,5] =", sum(1, 2, 3, 4, 5));
console.log("Identity string:", identity("Hello"));
console.log("Identity number:", identity(42));`,
      expectedOutput: `Hello, TypeScript!
I'm Alice
I'm Bob and I'm 25 years old
New user: { name: "Charlie", role: "user", id: "abc123def" }
Multiply 4 * 5 = 20
Sum of [1,2,3,4,5] = 15
Identity string: Hello
Identity number: 42`,
      concepts: ['Function Types', 'Optional Parameters', 'Default Parameters', 'Arrow Functions', 'Rest Parameters', 'Generics']
    },

    'type-aliases': {
      title: 'Type Aliases',
      description: 'Create reusable type definitions with type aliases',
      code: `// Basic type aliases
type Username = string;
type Age = number;
type UserID = string | number;

// Union type aliases
type Status = "pending" | "approved" | "rejected";
type Theme = "light" | "dark" | "auto";

// Object type aliases
type User = {
  id: UserID;
  username: Username;
  age: Age;
  status: Status;
  theme: Theme;
};

// Function type aliases
type StringProcessor = (input: string) => string;
type Calculator = (a: number, b: number) => number;

// Generic type aliases
type Container<T> = {
  value: T;
  isEmpty: boolean;
};

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// Usage examples
const user: User = {
  id: "user_001",
  username: "johndoe",
  age: 30,
  status: "approved",
  theme: "dark"
};

const toUpperCase: StringProcessor = (str) => str.toUpperCase();
const add: Calculator = (a, b) => a + b;

const stringContainer: Container<string> = {
  value: "Hello TypeScript",
  isEmpty: false
};

const userResponse: ApiResponse<User> = {
  data: user,
  status: 200,
  message: "User retrieved successfully"
};

console.log("User:", user);
console.log("Uppercase 'hello':", toUpperCase("hello"));
console.log("Add 5 + 3 =", add(5, 3));
console.log("String container:", stringContainer);
console.log("API Response status:", userResponse.status);`,
      expectedOutput: `User: { id: "user_001", username: "johndoe", age: 30, status: "approved", theme: "dark" }
Uppercase 'hello': HELLO
Add 5 + 3 = 8
String container: { value: "Hello TypeScript", isEmpty: false }
API Response status: 200`,
      concepts: ['Type Aliases', 'Union Types', 'Object Types', 'Function Types', 'Generic Types']
    },

    'interfaces-vs-types': {
      title: 'Interfaces vs Types',
      description: 'Understand the differences between interfaces and type aliases',
      code: `// Interface definition
interface IUser {
  name: string;
  email: string;
  age: number;
}

// Type alias definition
type TUser = {
  name: string;
  email: string;
  age: number;
};

// Interface extension
interface IStudent extends IUser {
  studentId: string;
  grade: number;
}

// Type intersection
type TStudent = TUser & {
  studentId: string;
  grade: number;
};

// Interface with methods
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
}

// Union types (only possible with type aliases)
type StringOrNumber = string | number;
type Status = "active" | "inactive" | "pending";

// Generic interface
interface Repository<T> {
  findById(id: string): T | null;
  save(item: T): T;
}

// Usage examples
const interfaceUser: IUser = {
  name: "Alice Interface",
  email: "alice@example.com", 
  age: 28
};

const typeUser: TUser = {
  name: "Bob Type",
  email: "bob@example.com",
  age: 32
};

const student: IStudent = {
  name: "Charlie Student",
  email: "charlie@school.edu",
  age: 20,
  studentId: "STU001",
  grade: 85
};

const calc: Calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};

// Demonstrate union type
let id: StringOrNumber = "user_123";
id = 456; // Can be reassigned to number

console.log("Interface User:", interfaceUser);
console.log("Type User:", typeUser);
console.log("Student:", student);
console.log("Calculator add(10, 5):", calc.add(10, 5));
console.log("ID type is:", typeof id);`,
      expectedOutput: `Interface User: { name: "Alice Interface", email: "alice@example.com", age: 28 }
Type User: { name: "Bob Type", email: "bob@example.com", age: 32 }
Student: { name: "Charlie Student", email: "charlie@school.edu", age: 20, studentId: "STU001", grade: 85 }
Calculator add(10, 5): 15
ID type is: number`,
      concepts: ['Interfaces', 'Type Aliases', 'Extension vs Intersection', 'Union Types', 'Generic Interfaces']
    },

    enums: {
      title: 'Enumerations (Enums)',
      description: 'Use enums to define named constants for better code organization',
      code: `// Numeric enum
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

// String enum
enum Color {
  Red = "red",
  Green = "green", 
  Blue = "blue",
  Yellow = "yellow"
}

// Enum with custom numeric values
enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500
}

// Using enums in functions
function move(direction: Direction): string {
  switch (direction) {
    case Direction.Up:
      return "Moving up";
    case Direction.Down:
      return "Moving down";
    case Direction.Left:
      return "Moving left";
    case Direction.Right:
      return "Moving right";
    default:
      return "Unknown direction";
  }
}

function getColorHex(color: Color): string {
  const hexMap = {
    [Color.Red]: "#FF0000",
    [Color.Green]: "#00FF00",
    [Color.Blue]: "#0000FF", 
    [Color.Yellow]: "#FFFF00"
  };
  return hexMap[color];
}

function getStatusMessage(status: HttpStatus): string {
  switch (status) {
    case HttpStatus.OK:
      return "Request successful";
    case HttpStatus.NotFound:
      return "Resource not found";
    case HttpStatus.InternalServerError:
      return "Server error";
    default:
      return \`Status: \${status}\`;
  }
}

// Usage examples
console.log("Direction.Up value:", Direction.Up);
console.log("Direction[0] name:", Direction[0]);
console.log("Move command:", move(Direction.Right));

console.log("Color.Blue value:", Color.Blue);
console.log("Blue hex:", getColorHex(Color.Blue));

console.log("HTTP 200 message:", getStatusMessage(HttpStatus.OK));
console.log("HTTP 404 message:", getStatusMessage(HttpStatus.NotFound));

// Enum iteration
console.log("All colors:");
Object.values(Color).forEach(color => {
  console.log(\`- \${color}: \${getColorHex(color as Color)}\`);
});`,
      expectedOutput: `Direction.Up value: 0
Direction[0] name: Up
Move command: Moving right
Color.Blue value: blue
Blue hex: #0000FF
HTTP 200 message: Request successful
HTTP 404 message: Resource not found
All colors:
- red: #FF0000
- green: #00FF00
- blue: #0000FF
- yellow: #FFFF00`,
      concepts: ['Numeric Enums', 'String Enums', 'Custom Values', 'Reverse Mapping', 'Enum Iteration']
    }
  };

  const currentExample = demoExamples[selectedTopic as keyof typeof demoExamples];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {basicsSection.title} - Interactive Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {basicsSection.description}
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
            {basicsSection.difficulty}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Estimated time: {basicsSection.estimatedTime} minutes
          </span>
        </div>
      </header>

      {/* Topic Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Choose a Topic to Explore
        </h2>
        
        <Tabs value={selectedTopic} onValueChange={setSelectedTopic}>
          <Tabs.List className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {topics.map((topic) => (
              <Tabs.Tab 
                key={topic.id} 
                value={topic.id}
                className="text-sm"
              >
                {topic.title.split(' ')[0]}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </div>

      {/* Interactive Demo */}
      {currentExample && (
        <DemoPanel
          title={currentExample.title}
          description={currentExample.description}
          initialCode={currentExample.code}
          expectedOutput={currentExample.expectedOutput}
          concepts={currentExample.concepts}
          difficulty="beginner"
          editorHeight="500px"
          showOutput={true}
          showExplanation={true}
          className="shadow-lg"
        />
      )}

      {/* Learning Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-3">📚 Key Concepts</h3>
          <ul className="space-y-2 text-blue-100">
            <li>• Type annotations and inference</li>
            <li>• Function parameter and return typing</li>
            <li>• Interfaces vs type aliases</li>
            <li>• Union and intersection types</li>
            <li>• Enums for named constants</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-3">🎯 Learning Goals</h3>
          <ul className="space-y-2 text-green-100">
            <li>• Master TypeScript's type system</li>
            <li>• Write type-safe functions</li>
            <li>• Choose between interfaces and types</li>
            <li>• Create reusable type definitions</li>
            <li>• Organize constants with enums</li>
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🚀 Ready for More?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Once you're comfortable with these basics, you can move on to more advanced TypeScript topics:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Types</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Conditional types, mapped types, and utility types
            </p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Generics</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generic functions, classes, and constraints
            </p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Decorators</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Class decorators and metadata
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicsDemo;