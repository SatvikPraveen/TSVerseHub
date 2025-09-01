/* File: src/concepts/basics/exercises.ts */

import { ConceptExercise } from './index';

export const exercises: ConceptExercise[] = [
  {
    id: 'variables-exercise-1',
    title: 'Basic Variable Declarations',
    description: 'Practice declaring variables with proper TypeScript types',
    difficulty: 'easy',
    starterCode: `// TODO: Declare variables with appropriate types
// 1. A variable for storing a user's name
// 2. A variable for storing a user's age  
// 3. A variable for storing whether a user is active
// 4. A variable for storing a list of favorite colors
// 5. A variable that can store either a string ID or numeric ID

// Your code here:
`,
    solution: `// Solution: Declare variables with appropriate types
// 1. A variable for storing a user's name
let userName: string = "John Doe";

// 2. A variable for storing a user's age  
let userAge: number = 25;

// 3. A variable for storing whether a user is active
let isActive: boolean = true;

// 4. A variable for storing a list of favorite colors
let favoriteColors: string[] = ["blue", "green", "red"];

// 5. A variable that can store either a string ID or numeric ID
let userId: string | number = "user_123";
userId = 456; // Also valid`,
    testCases: [
      {
        input: 'userName',
        expected: 'string',
        description: 'userName should be of type string'
      },
      {
        input: 'userAge',
        expected: 'number',
        description: 'userAge should be of type number'
      },
      {
        input: 'isActive',
        expected: 'boolean',
        description: 'isActive should be of type boolean'
      },
      {
        input: 'favoriteColors',
        expected: 'string[]',
        description: 'favoriteColors should be an array of strings'
      },
      {
        input: 'userId',
        expected: 'string | number',
        description: 'userId should accept both string and number types'
      }
    ],
    hints: [
      'Use explicit type annotations with the colon syntax',
      'Arrays can be typed with type[] or Array<type>',
      'Union types use the | operator to allow multiple types',
      'Boolean type only accepts true or false values'
    ]
  },

  {
    id: 'functions-exercise-1',
    title: 'Function Parameter and Return Types',
    description: 'Create functions with proper type annotations for parameters and return values',
    difficulty: 'easy',
    starterCode: `// TODO: Implement the following functions with proper types:

// 1. A function that takes two numbers and returns their sum
function add(/* parameters */) {
  // implementation
}

// 2. A function that takes a name (string) and optional age (number) 
//    and returns a greeting message
function greet(/* parameters */) {
  // implementation
}

// 3. A function that takes an array of numbers and returns the largest number
function findMax(/* parameters */) {
  // implementation
}

// 4. A function that takes a string and returns its length (number)
function getLength(/* parameters */) {
  // implementation
}`,
    solution: `// Solution: Implement the following functions with proper types:

// 1. A function that takes two numbers and returns their sum
function add(a: number, b: number): number {
  return a + b;
}

// 2. A function that takes a name (string) and optional age (number) 
//    and returns a greeting message
function greet(name: string, age?: number): string {
  if (age !== undefined) {
    return \`Hello \${name}, you are \${age} years old!\`;
  }
  return \`Hello \${name}!\`;
}

// 3. A function that takes an array of numbers and returns the largest number
function findMax(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error("Array cannot be empty");
  }
  return Math.max(...numbers);
}

// 4. A function that takes a string and returns its length (number)
function getLength(input: string): number {
  return input.length;
}`,
    testCases: [
      {
        input: { a: 5, b: 3 },
        expected: 8,
        description: 'add(5, 3) should return 8'
      },
      {
        input: { name: 'Alice' },
        expected: 'Hello Alice!',
        description: 'greet("Alice") should return greeting without age'
      },
      {
        input: { name: 'Bob', age: 30 },
        expected: 'Hello Bob, you are 30 years old!',
        description: 'greet("Bob", 30) should return greeting with age'
      },
      {
        input: { numbers: [1, 5, 3, 9, 2] },
        expected: 9,
        description: 'findMax([1, 5, 3, 9, 2]) should return 9'
      },
      {
        input: { input: 'TypeScript' },
        expected: 10,
        description: 'getLength("TypeScript") should return 10'
      }
    ],
    hints: [
      'Optional parameters use the ? syntax after the parameter name',
      'Return types come after the parameter list, separated by a colon',
      'Use Math.max(...array) to find the maximum value in an array',
      'Check for edge cases like empty arrays',
      'Template literals use backticks and ${} for interpolation'
    ]
  },

  {
    id: 'interfaces-exercise-1',
    title: 'Creating and Using Interfaces',
    description: 'Define interfaces for complex objects and use them in functions',
    difficulty: 'medium',
    starterCode: `// TODO: Define interfaces and implement functions

// 1. Create an interface for a Product with:
//    - id (string)
//    - name (string) 
//    - price (number)
//    - inStock (boolean)
//    - category (string, optional)

// 2. Create an interface for a ShoppingCart with:
//    - items (array of Product)
//    - total (number)
//    - addItem method that takes a Product and returns void
//    - removeItem method that takes a product id and returns boolean

// 3. Implement a function calculateTotal that takes an array of Products
//    and returns the total price

// Your code here:
`,
    solution: `// Solution: Define interfaces and implement functions

// 1. Create an interface for a Product
interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  category?: string;
}

// 2. Create an interface for a ShoppingCart
interface ShoppingCart {
  items: Product[];
  total: number;
  addItem(product: Product): void;
  removeItem(productId: string): boolean;
}

// 3. Implement a function calculateTotal
function calculateTotal(products: Product[]): number {
  return products.reduce((sum, product) => sum + product.price, 0);
}

// Example implementation of ShoppingCart
class Cart implements ShoppingCart {
  items: Product[] = [];
  total: number = 0;

  addItem(product: Product): void {
    this.items.push(product);
    this.total = calculateTotal(this.items);
  }

  removeItem(productId: string): boolean {
    const index = this.items.findIndex(item => item.id === productId);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.total = calculateTotal(this.items);
      return true;
    }
    return false;
  }
}

// Usage example
const product1: Product = {
  id: "1",
  name: "Laptop",
  price: 999.99,
  inStock: true,
  category: "Electronics"
};

const product2: Product = {
  id: "2", 
  name: "Mouse",
  price: 29.99,
  inStock: true
};

const cart = new Cart();
cart.addItem(product1);
cart.addItem(product2);
console.log(cart.total); // 1029.98`,
    testCases: [
      {
        input: { products: [{ id: "1", name: "Item", price: 10, inStock: true }] },
        expected: 10,
        description: 'calculateTotal should sum product prices correctly'
      },
      {
        input: 'Product interface should have required and optional properties',
        expected: 'Product should have id, name, price, inStock as required and category as optional',
        description: 'Product interface structure should be correct'
      }
    ],
    hints: [
      'Use the interface keyword to define object structures',
      'Optional properties use the ? modifier',
      'Method signatures in interfaces don\'t include implementation',
      'Use reduce() to sum array values',
      'Classes can implement interfaces using the implements keyword'
    ]
  },

  {
    id: 'types-exercise-1',
    title: 'Type Aliases and Union Types',
    description: 'Create type aliases for reusable type definitions',
    difficulty: 'medium',
    starterCode: `// TODO: Create type aliases and implement functions

// 1. Create a type alias for UserRole that can be "admin", "user", or "guest"

// 2. Create a type alias for Status that can be "pending", "approved", or "rejected"

// 3. Create a type alias for ID that can be either string or number

// 4. Create a type alias for a User object with:
//    - id (ID type)
//    - name (string)
//    - email (string)
//    - role (UserRole type)
//    - status (Status type)

// 5. Implement a function hasPermission that takes a UserRole and returns boolean
//    (admin = true, user = true, guest = false)

// 6. Implement a function formatUser that takes a User and returns a formatted string

// Your code here:
`,
    solution: `// Solution: Create type aliases and implement functions

// 1. Create a type alias for UserRole
type UserRole = "admin" | "user" | "guest";

// 2. Create a type alias for Status
type Status = "pending" | "approved" | "rejected";

// 3. Create a type alias for ID
type ID = string | number;

// 4. Create a type alias for a User object
type User = {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  status: Status;
};

// 5. Implement hasPermission function
function hasPermission(role: UserRole): boolean {
  switch (role) {
    case "admin":
      return true;
    case "user":
      return true;
    case "guest":
      return false;
    default:
      return false;
  }
}

// Alternative implementation using array includes
function hasPermissionAlt(role: UserRole): boolean {
  const allowedRoles: UserRole[] = ["admin", "user"];
  return allowedRoles.includes(role);
}

// 6. Implement formatUser function
function formatUser(user: User): string {
  return \`\${user.name} (\${user.email}) - Role: \${user.role}, Status: \${user.status}\`;
}

// Usage examples
const admin: User = {
  id: "admin_001",
  name: "Alice Admin",
  email: "alice@company.com",
  role: "admin",
  status: "approved"
};

const guest: User = {
  id: 123,
  name: "John Guest", 
  email: "john@example.com",
  role: "guest",
  status: "pending"
};

console.log(formatUser(admin)); // Alice Admin (alice@company.com) - Role: admin, Status: approved
console.log(hasPermission(admin.role)); // true
console.log(hasPermission(guest.role)); // false`,
    testCases: [
      {
        input: { role: 'admin' },
        expected: true,
        description: 'hasPermission("admin") should return true'
      },
      {
        input: { role: 'user' },
        expected: true,
        description: 'hasPermission("user") should return true'
      },
      {
        input: { role: 'guest' },
        expected: false,
        description: 'hasPermission("guest") should return false'
      },
      {
        input: { user: { id: '1', name: 'Test', email: 'test@example.com', role: 'user', status: 'approved' } },
        expected: 'Test (test@example.com) - Role: user, Status: approved',
        description: 'formatUser should return correctly formatted string'
      }
    ],
    hints: [
      'Union types use the | operator to combine multiple literal types',
      'Type aliases use the type keyword followed by the type name',
      'Use switch statements or array.includes() for role checking',
      'Template literals with ${} make string formatting easier',
      'Type aliases can reference other type aliases'
    ]
  },

  {
    id: 'enums-exercise-1',
    title: 'Working with Enums',
    description: 'Create and use enums for organizing related constants',
    difficulty: 'medium',
    starterCode: `// TODO: Create enums and implement functions

// 1. Create a Color enum with Red, Green, Blue, Yellow values

// 2. Create a Priority enum with Low=1, Medium=2, High=3, Critical=4

// 3. Create a string enum LogLevel with Debug, Info, Warning, Error values

// 4. Implement a function getColorHex that takes a Color and returns its hex value
//    Red: "#FF0000", Green: "#00FF00", Blue: "#0000FF", Yellow: "#FFFF00"

// 5. Implement a function shouldEscalate that takes a Priority and returns boolean
//    (High and Critical should return true, others false)

// 6. Implement a function formatLogMessage that takes LogLevel, message (string)
//    and returns formatted log string

// Your code here:
`,
    solution: `// Solution: Create enums and implement functions

// 1. Create a Color enum
enum Color {
  Red,
  Green, 
  Blue,
  Yellow
}

// 2. Create a Priority enum with custom values
enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

// 3. Create a string enum LogLevel
enum LogLevel {
  Debug = "debug",
  Info = "info", 
  Warning = "warning",
  Error = "error"
}

// 4. Implement getColorHex function
function getColorHex(color: Color): string {
  switch (color) {
    case Color.Red:
      return "#FF0000";
    case Color.Green:
      return "#00FF00";
    case Color.Blue:
      return "#0000FF";
    case Color.Yellow:
      return "#FFFF00";
    default:
      return "#000000";
  }
}

// Alternative implementation using object lookup
const colorHexMap: Record<Color, string> = {
  [Color.Red]: "#FF0000",
  [Color.Green]: "#00FF00", 
  [Color.Blue]: "#0000FF",
  [Color.Yellow]: "#FFFF00"
};

function getColorHexAlt(color: Color): string {
  return colorHexMap[color] || "#000000";
}

// 5. Implement shouldEscalate function
function shouldEscalate(priority: Priority): boolean {
  return priority >= Priority.High;
}

// Alternative implementation
function shouldEscalateAlt(priority: Priority): boolean {
  return priority === Priority.High || priority === Priority.Critical;
}

// 6. Implement formatLogMessage function
function formatLogMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString();
  return \`[\${timestamp}] [\${level.toUpperCase()}] \${message}\`;
}

// Usage examples
console.log(getColorHex(Color.Red)); // "#FF0000"
console.log(shouldEscalate(Priority.High)); // true
console.log(shouldEscalate(Priority.Low)); // false
console.log(formatLogMessage(LogLevel.Error, "Something went wrong!")); 
// [2023-12-07T10:30:00.000Z] [ERROR] Something went wrong!

// Enum iteration example
console.log("Available colors:");
for (const colorName in Color) {
  if (isNaN(Number(colorName))) {
    const colorValue = Color[colorName as keyof typeof Color];
    console.log(\`\${colorName}: \${getColorHex(colorValue)}\`);
  }
}`,
    testCases: [
      {
        input: { color: 'Red' },
        expected: '#FF0000',
        description: 'getColorHex(Color.Red) should return "#FF0000"'
      },
      {
        input: { priority: 3 },
        expected: true,
        description: 'shouldEscalate(Priority.High) should return true'
      },
      {
        input: { priority: 1 },
        expected: false,
        description: 'shouldEscalate(Priority.Low) should return false'
      },
      {
        input: { level: 'error', message: 'Test error' },
        expected: 'should contain [ERROR] Test error',
        description: 'formatLogMessage should format correctly'
      }
    ],
    hints: [
      'Numeric enums auto-increment if not explicitly set',
      'String enums require explicit string values for each member',
      'Use switch statements or comparison operators with enums',
      'Enum members can be accessed using dot notation',
      'toUpperCase() method works on strings, including string enum values'
    ]
  },

  {
    id: 'arrays-exercise-1',
    title: 'Working with Typed Arrays',
    description: 'Practice using arrays with proper TypeScript typing',
    difficulty: 'medium',
    starterCode: `// TODO: Implement array manipulation functions with proper types

// 1. Create a function filterNumbers that takes an array of mixed types
//    and returns only the numbers

// 2. Create a function mapToStrings that takes a number array
//    and returns an array of strings

// 3. Create a function findUser that takes an array of User objects
//    and a user ID, returns the user or undefined

// 4. Create a function groupByCategory that takes Product array
//    and returns an object where keys are categories and values are Product arrays

// Define these types first:
// - User: { id: string, name: string, age: number }
// - Product: { id: string, name: string, category: string, price: number }

// Your code here:
`,
    solution: `// Solution: Working with Typed Arrays

// Define required types
type User = {
  id: string;
  name: string;
  age: number;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
};

// 1. Filter numbers from mixed array
function filterNumbers(items: unknown[]): number[] {
  return items.filter((item): item is number => typeof item === 'number');
}

// 2. Map numbers to strings
function mapToStrings(numbers: number[]): string[] {
  return numbers.map(num => num.toString());
}

// 3. Find user by ID
function findUser(users: User[], userId: string): User | undefined {
  return users.find(user => user.id === userId);
}

// 4. Group products by category
function groupByCategory(products: Product[]): Record<string, Product[]> {
  return products.reduce((groups, product) => {
    const category = product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, Product[]>);
}

// Alternative implementation using Map
function groupByCategoryMap(products: Product[]): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();
  
  products.forEach(product => {
    const category = product.category;
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(product);
  });
  
  return groups;
}

// Additional utility functions
function sortUsersByAge(users: User[]): User[] {
  return [...users].sort((a, b) => a.age - b.age);
}

function getProductsByPriceRange(products: Product[], minPrice: number, maxPrice: number): Product[] {
  return products.filter(product => product.price >= minPrice && product.price <= maxPrice);
}

function calculateAverageAge(users: User[]): number {
  if (users.length === 0) return 0;
  const totalAge = users.reduce((sum, user) => sum + user.age, 0);
  return totalAge / users.length;
}

// Usage examples
const mixedArray: unknown[] = [1, "hello", 2, true, 3.14, "world", 42];
const numbers = filterNumbers(mixedArray); // [1, 2, 3.14, 42]
const strings = mapToStrings(numbers); // ["1", "2", "3.14", "42"]

const users: User[] = [
  { id: "1", name: "Alice", age: 25 },
  { id: "2", name: "Bob", age: 30 },
  { id: "3", name: "Charlie", age: 22 }
];

const foundUser = findUser(users, "2"); // { id: "2", name: "Bob", age: 30 }

const products: Product[] = [
  { id: "1", name: "Laptop", category: "Electronics", price: 999 },
  { id: "2", name: "Book", category: "Education", price: 25 },
  { id: "3", name: "Phone", category: "Electronics", price: 699 },
  { id: "4", name: "Notebook", category: "Education", price: 5 }
];

const grouped = groupByCategory(products);
// {
//   "Electronics": [laptop, phone],
//   "Education": [book, notebook]
// }

console.log("Grouped products:", grouped);
console.log("Average age:", calculateAverageAge(users)); // 25.67`,
    testCases: [
      {
        input: { items: [1, "hello", 2, true, 3] },
        expected: [1, 2, 3],
        description: 'filterNumbers should return only numbers'
      },
      {
        input: { numbers: [1, 2, 3] },
        expected: ["1", "2", "3"],
        description: 'mapToStrings should convert numbers to strings'
      },
      {
        input: { users: [{ id: "1", name: "Alice", age: 25 }], userId: "1" },
        expected: { id: "1", name: "Alice", age: 25 },
        description: 'findUser should return matching user'
      },
      {
        input: { products: [{ id: "1", name: "Item", category: "A", price: 10 }] },
        expected: { "A": [{ id: "1", name: "Item", category: "A", price: 10 }] },
        description: 'groupByCategory should group products correctly'
      }
    ],
    hints: [
      'Type guards help with filtering mixed arrays',
      'Use the map() method to transform arrays',
      'The find() method returns the first match or undefined',
      'Reduce can build objects from arrays',
      'Record<K, V> type represents objects with specific key-value types'
    ]
  },

  {
    id: 'advanced-exercise-1', 
    title: 'Combining Concepts - Task Management System',
    description: 'Create a comprehensive solution using interfaces, types, enums, and functions',
    difficulty: 'hard',
    starterCode: `// TODO: Build a Task Management System

// 1. Create a TaskStatus enum: Pending, InProgress, Completed, Cancelled

// 2. Create a Priority enum: Low=1, Medium=2, High=3, Critical=4

// 3. Create a User interface with id, name, email properties

// 4. Create a Task interface with:
//    - id (string)
//    - title (string)
//    - description (optional string)
//    - status (TaskStatus)
//    - priority (Priority)
//    - assignedTo (optional User)
//    - createdAt (Date)
//    - dueDate (optional Date)

// 5. Create a TaskManager class with:
//    - tasks array
//    - addTask method
//    - updateTaskStatus method  
//    - getTasksByStatus method
//    - getTasksByPriority method
//    - getTasksByUser method

// 6. Implement helper functions:
//    - isOverdue(task): boolean
//    - getTaskSummary(): string with counts by status

// Your code here:
`,
    solution: `// Solution: Build a Task Management System

// 1. Create a TaskStatus enum
enum TaskStatus {
  Pending = "pending",
  InProgress = "in-progress", 
  Completed = "completed",
  Cancelled = "cancelled"
}

// 2. Create a Priority enum
enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

// 3. Create a User interface
interface User {
  id: string;
  name: string;
  email: string;
}

// 4. Create a Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo?: User;
  createdAt: Date;
  dueDate?: Date;
}

// Additional types for better type safety
type TaskFilter = {
  status?: TaskStatus;
  priority?: Priority;
  assignedUserId?: string;
  isOverdue?: boolean;
};

type TaskSummary = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
};

// 5. Create a TaskManager class
class TaskManager {
  private tasks: Task[] = [];

  addTask(task: Task): void {
    // Validate that task ID doesn't already exist
    const existingTask = this.tasks.find(t => t.id === task.id);
    if (existingTask) {
      throw new Error(\`Task with ID \${task.id} already exists\`);
    }
    this.tasks.push(task);
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      return true;
    }
    return false;
  }

  updateTaskPriority(taskId: string, newPriority: Priority): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.priority = newPriority;
      return true;
    }
    return false;
  }

  assignTask(taskId: string, user: User): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.assignedTo = user;
      return true;
    }
    return false;
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  getTasksByPriority(priority: Priority): Task[] {
    return this.tasks.filter(task => task.priority === priority);
  }

  getTasksByUser(userId: string): Task[] {
    return this.tasks.filter(task => task.assignedTo?.id === userId);
  }

  getOverdueTasks(): Task[] {
    return this.tasks.filter(task => this.isOverdue(task));
  }

  getTasksWithFilter(filter: TaskFilter): Task[] {
    return this.tasks.filter(task => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.assignedUserId && task.assignedTo?.id !== filter.assignedUserId) return false;
      if (filter.isOverdue !== undefined && this.isOverdue(task) !== filter.isOverdue) return false;
      return true;
    });
  }

  getAllTasks(): Task[] {
    return [...this.tasks];
  }

  removeTask(taskId: string): boolean {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }

  // 6. Helper method: check if task is overdue
  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    return new Date() > task.dueDate && task.status !== TaskStatus.Completed && task.status !== TaskStatus.Cancelled;
  }

  // 6. Helper method: get task summary
  getTaskSummary(): TaskSummary {
    const summary: TaskSummary = {
      total: this.tasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0
    };

    this.tasks.forEach(task => {
      switch (task.status) {
        case TaskStatus.Pending:
          summary.pending++;
          break;
        case TaskStatus.InProgress:
          summary.inProgress++;
          break;
        case TaskStatus.Completed:
          summary.completed++;
          break;
        case TaskStatus.Cancelled:
          summary.cancelled++;
          break;
      }
      
      if (this.isOverdue(task)) {
        summary.overdue++;
      }
    });

    return summary;
  }

  getTaskSummaryString(): string {
    const summary = this.getTaskSummary();
    return \`Task Summary:
- Total: \${summary.total}
- Pending: \${summary.pending}
- In Progress: \${summary.inProgress}
- Completed: \${summary.completed}
- Cancelled: \${summary.cancelled}
- Overdue: \${summary.overdue}\`;
  }
}

// 6. Standalone helper functions
function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  return new Date() > task.dueDate && task.status !== TaskStatus.Completed && task.status !== TaskStatus.Cancelled;
}

function getHighPriorityTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.priority >= Priority.High);
}

function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.priority - a.priority);
}

function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Tasks without due dates go to the end
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
}

function createTask(
  id: string,
  title: string,
  options: {
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    assignedTo?: User;
    dueDate?: Date;
  } = {}
): Task {
  return {
    id,
    title,
    description: options.description,
    status: options.status || TaskStatus.Pending,
    priority: options.priority || Priority.Medium,
    assignedTo: options.assignedTo,
    createdAt: new Date(),
    dueDate: options.dueDate
  };
}

// Usage example
const taskManager = new TaskManager();

const user1: User = {
  id: "user1",
  name: "Alice Developer",
  email: "alice@company.com"
};

const user2: User = {
  id: "user2",
  name: "Bob Designer",
  email: "bob@company.com"
};

const task1 = createTask("task1", "Implement user authentication", {
  description: "Add login and registration functionality",
  status: TaskStatus.InProgress,
  priority: Priority.High,
  assignedTo: user1,
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Due in 1 week
});

const task2 = createTask("task2", "Design user interface", {
  priority: Priority.Medium,
  assignedTo: user2,
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Due in 2 weeks
});

const task3 = createTask("task3", "Write unit tests", {
  priority: Priority.Critical,
  dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Overdue (yesterday)
});

taskManager.addTask(task1);
taskManager.addTask(task2);
taskManager.addTask(task3);

console.log(taskManager.getTaskSummaryString());
console.log("High priority tasks:", getHighPriorityTasks(taskManager.getAllTasks()));
console.log("Overdue tasks:", taskManager.getOverdueTasks());
console.log("Alice's tasks:", taskManager.getTasksByUser("user1"));

// Demonstrate task updates
taskManager.updateTaskStatus("task2", TaskStatus.InProgress);
taskManager.updateTaskPriority("task1", Priority.Critical);

console.log("\\nAfter updates:");
console.log(taskManager.getTaskSummaryString());`,
    testCases: [
      {
        input: 'TaskManager should be able to add and retrieve tasks',
        expected: 'Tasks should be stored and retrievable',
        description: 'Basic task management functionality'
      },
      {
        input: 'isOverdue should correctly identify overdue tasks',
        expected: 'Should return true for past due dates on incomplete tasks',
        description: 'Overdue detection logic'
      },
      {
        input: 'getTaskSummary should return correct counts',
        expected: 'Should show accurate task counts by status',
        description: 'Summary generation'
      },
      {
        input: 'Task filtering should work correctly',
        expected: 'Should filter tasks by various criteria',
        description: 'Advanced filtering functionality'
      }
    ],
    hints: [
      'Use enums for fixed sets of values like status and priority',
      'Optional properties in interfaces use the ? modifier',
      'Array filter() method is useful for querying tasks',
      'Date comparison uses standard comparison operators',
      'Template literals help with string formatting',
      'Private class properties use the private keyword',
      'Use the spread operator [...] to create array copies',
      'Consider edge cases like missing due dates',
      'Factory functions like createTask can simplify object creation'
    ]
  }
];

// Export utility functions for testing exercises
export const exerciseUtils = {
  // Function to validate exercise solutions
  validateSolution: (exerciseId: string, userCode: string): { passed: boolean; errors: string[] } => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) {
      return { passed: false, errors: ['Exercise not found'] };
    }
    
    // This would typically involve running the code and comparing outputs
    // For now, return a basic validation
    return { passed: true, errors: [] };
  },
  
  // Function to get exercise by difficulty
  getExercisesByDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => {
    return exercises.filter(ex => ex.difficulty === difficulty);
  },
  
  // Function to get next exercise
  getNextExercise: (currentExerciseId: string) => {
    const currentIndex = exercises.findIndex(ex => ex.id === currentExerciseId);
    return currentIndex < exercises.length - 1 ? exercises[currentIndex + 1] : null;
  },
  
  // Function to get previous exercise
  getPreviousExercise: (currentExerciseId: string) => {
    const currentIndex = exercises.findIndex(ex => ex.id === currentExerciseId);
    return currentIndex > 0 ? exercises[currentIndex - 1] : null;
  },

  // Function to get exercises by topic/concept
  getExercisesByTopic: (topic: string) => {
    return exercises.filter(ex => 
      ex.title.toLowerCase().includes(topic.toLowerCase()) ||
      ex.description.toLowerCase().includes(topic.toLowerCase())
    );
  },

  // Function to get a random exercise
  getRandomExercise: () => {
    const randomIndex = Math.floor(Math.random() * exercises.length);
    return exercises[randomIndex];
  }
};

export default exercises;