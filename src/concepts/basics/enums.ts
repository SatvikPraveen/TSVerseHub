/* File: src/concepts/basics/enums.ts */

import { ConceptTopic } from './index';

export const enums: ConceptTopic = {
  id: 'enums',
  title: 'Enumerations (Enums)',
  description: 'Learn how to use TypeScript enums to define named constants and create more readable, maintainable code.',
  codeExample: `// Basic numeric enum
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

// Usage
let playerDirection: Direction = Direction.Up;
console.log(playerDirection); // 0
console.log(Direction[0]); // "Up"

// Enum with custom numeric values
enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500
}

// Usage
function handleResponse(status: HttpStatus) {
  switch (status) {
    case HttpStatus.OK:
      return "Success!";
    case HttpStatus.NotFound:
      return "Resource not found";
    case HttpStatus.InternalServerError:
      return "Server error";
    default:
      return "Unknown status";
  }
}

// String enums
enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
  Yellow = "yellow"
}

enum Theme {
  Light = "light",
  Dark = "dark",
  Auto = "system-auto"
}

// Usage
let primaryColor: Color = Color.Blue;
let appTheme: Theme = Theme.Dark;

console.log(primaryColor); // "blue"
console.log(appTheme); // "dark"

// Heterogeneous enums (mixed string/number - not recommended)
enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = "YES",
}

// Computed and constant members
enum FileAccess {
  // Constant members
  None,
  Read = 1 << 1,     // 2
  Write = 1 << 2,    // 4
  ReadWrite = Read | Write, // 6
  
  // Computed member
  G = "123".length   // 3
}

// Const enums (compile-time only)
const enum Directions {
  Up,
  Down,
  Left,
  Right
}

// Usage of const enum
let directions = [
  Directions.Up,    // Inlined as 0
  Directions.Down,  // Inlined as 1
  Directions.Left,  // Inlined as 2
  Directions.Right  // Inlined as 3
];

// Ambient enums (declare existing enums)
declare enum Enum {
  A = 1,
  B,
  C = 2
}

// Reverse mapping (numeric enums only)
enum Status {
  Active,
  Inactive,
  Pending
}

console.log(Status.Active); // 0
console.log(Status[0]); // "Active"
console.log(Status[Status.Active]); // "Active"

// Using enums as types
function setStatus(newStatus: Status): void {
  console.log(\`Setting status to: \${Status[newStatus]}\`);
}

setStatus(Status.Active); // Valid
// setStatus("active"); // Error: not assignable

// Enum with methods (using namespace merging)
enum Planet {
  Mercury,
  Venus,
  Earth,
  Mars
}

namespace Planet {
  export function getDistanceFromSun(planet: Planet): number {
    switch (planet) {
      case Planet.Mercury: return 57.9;
      case Planet.Venus: return 108.2;
      case Planet.Earth: return 149.6;
      case Planet.Mars: return 227.9;
      default: return 0;
    }
  }
  
  export function isInnerPlanet(planet: Planet): boolean {
    return planet <= Planet.Mars;
  }
}

// Usage
console.log(Planet.getDistanceFromSun(Planet.Earth)); // 149.6
console.log(Planet.isInnerPlanet(Planet.Venus)); // true

// Enum iteration
enum ResponseCode {
  Success = 200,
  NotFound = 404,
  Error = 500
}

// Get all enum keys
const responseKeys = Object.keys(ResponseCode).filter(key => isNaN(Number(key)));
console.log(responseKeys); // ["Success", "NotFound", "Error"]

// Get all enum values
const responseValues = Object.values(ResponseCode).filter(value => typeof value === 'number');
console.log(responseValues); // [200, 404, 500]

// Utility functions for enums
function getEnumValues<T extends Record<string, string | number>>(enumObject: T): T[keyof T][] {
  return Object.values(enumObject);
}

function getEnumKeys<T extends Record<string, string | number>>(enumObject: T): string[] {
  return Object.keys(enumObject);
}

function isValidEnumValue<T extends Record<string, string | number>>(
  enumObject: T, 
  value: any
): value is T[keyof T] {
  return Object.values(enumObject).includes(value);
}

// Usage
const colorValues = getEnumValues(Color);
const colorKeys = getEnumKeys(Color);
const isValidColor = isValidEnumValue(Color, "blue"); // true

// Alternative to enums: Union types with const assertions
const DIRECTION = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
} as const;

type DirectionType = typeof DIRECTION[keyof typeof DIRECTION];

// Alternative: String literal union types
type Status2 = 'active' | 'inactive' | 'pending';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Comparison of approaches
function processWithEnum(status: Status): void {
  // Enum approach - has runtime object
  console.log(\`Processing with enum: \${Status[status]}\`);
}

function processWithUnion(status: Status2): void {
  // Union type approach - no runtime footprint
  console.log(\`Processing with union: \${status}\`);
}

function processWithConstObject(direction: DirectionType): void {
  // Const assertion approach - has runtime object but type-safe
  console.log(\`Processing direction: \${direction}\`);
}

// Advanced enum pattern: Branded enums
enum UserRole {
  Admin = "admin",
  User = "user",
  Guest = "guest"
}

type RolePermissions = {
  [UserRole.Admin]: ["read", "write", "delete"];
  [UserRole.User]: ["read", "write"];
  [UserRole.Guest]: ["read"];
};

function getPermissions<T extends UserRole>(role: T): RolePermissions[T] {
  const permissions: RolePermissions = {
    [UserRole.Admin]: ["read", "write", "delete"],
    [UserRole.User]: ["read", "write"],
    [UserRole.Guest]: ["read"]
  };
  return permissions[role];
}

// Usage
const adminPermissions = getPermissions(UserRole.Admin); // ["read", "write", "delete"]
const userPermissions = getPermissions(UserRole.User);   // ["read", "write"]`,

  explanation: `Enums in TypeScript provide a way to define named constants, making code more readable and maintainable:

**Numeric Enums**: By default, enums assign incrementing numeric values starting from 0. You can also set custom numeric values and TypeScript will continue the sequence from there.

**String Enums**: Each member must be explicitly initialized with a string value. String enums don't have reverse mapping and are more self-descriptive at runtime.

**Heterogeneous Enums**: Can mix string and numeric values, but this is generally not recommended as it can lead to confusion.

**Const Enums**: Are completely removed during compilation and their values are inlined at usage sites. They provide better performance but lose runtime representation.

**Reverse Mapping**: Numeric enums automatically create a reverse mapping from values back to names, allowing you to get the enum name from its value.

**Computed Members**: Enum values can be computed using constant expressions or function calls, but computed members must come after constant members.

**Ambient Enums**: Used to describe existing enums from other libraries or environments using the `declare` keyword.

**Enum as Type**: Enums can be used as types, ensuring only valid enum values are accepted.

**Alternatives**: Union types and const assertions often provide similar functionality with less runtime overhead and better tree-shaking.`,

  keyPoints: [
    'Numeric enums start at 0 by default and auto-increment',
    'String enums require explicit initialization for each member',
    'Const enums are inlined at compile time for better performance',
    'Only numeric enums support reverse mapping',
    'Enums create both a type and a runtime object',
    'Enums can be used as types to restrict function parameters',
    'String literal unions are often a better alternative to string enums',
    'Const assertions with objects provide enum-like behavior',
    'Enums support computed and constant members'
  ],

  commonMistakes: [
    'Using heterogeneous enums (mixing strings and numbers)',
    'Relying on numeric enum auto-increment when order might change',
    'Using regular enums when const enums would be more appropriate',
    'Not considering string literal unions as an alternative',
    'Assuming all enums have reverse mapping (only numeric enums do)',
    'Using enums for values that might change frequently',
    'Not understanding the runtime cost of regular enums',
    'Mixing computed and constant members incorrectly'
  ],

  bestPractices: [
    'Prefer string enums for better debugging and self-documentation',
    'Use const enums when you don\'t need runtime representation',
    'Consider string literal unions instead of string enums',
    'Use PascalCase for enum names and descriptive member names',
    'Group related constants in a single enum',
    'Avoid heterogeneous enums unless absolutely necessary',
    'Use enums for fixed sets of related constants',
    'Document the purpose and expected usage of complex enums',
    'Consider using const assertions for object-based enums'
  ],

  relatedTopics: [
    'variables',
    'type-aliases',
    'interfaces-vs-types',
    'advanced-types'
  ]
};

// Additional enum patterns and utilities
export const enumExamples = {
  enumUtilities: {
    title: 'Enum Utility Functions',
    code: `// Generic enum utilities
class EnumUtils {
  static getValues<T extends Record<string, string | number>>(enumObject: T): T[keyof T][] {
    return Object.values(enumObject);
  }
  
  static getKeys<T extends Record<string, string | number>>(enumObject: T): string[] {
    return Object.keys(enumObject);
  }
  
  static isValidValue<T extends Record<string, string | number>>(
    enumObject: T, 
    value: any
  ): value is T[keyof T] {
    return Object.values(enumObject).includes(value);
  }
  
  static parse<T extends Record<string, string | number>>(
    enumObject: T,
    value: string,
    ignoreCase = false
  ): T[keyof T] | undefined {
    const keys = Object.keys(enumObject);
    const key = ignoreCase 
      ? keys.find(k => k.toLowerCase() === value.toLowerCase())
      : keys.find(k => k === value);
      
    return key ? enumObject[key] : undefined;
  }
}`
  },

  enumPatterns: {
    title: 'Advanced Enum Patterns',
    code: `// Flags enum (bitwise operations)
enum Permission {
  None = 0,
  Read = 1 << 0,     // 1
  Write = 1 << 1,    // 2
  Execute = 1 << 2,  // 4
  Delete = 1 << 3,   // 8
  All = Read | Write | Execute | Delete // 15
}

// Check permissions
function hasPermission(userPermissions: Permission, required: Permission): boolean {
  return (userPermissions & required) === required;
}

// Usage
const userPerms = Permission.Read | Permission.Write;
console.log(hasPermission(userPerms, Permission.Read)); // true
console.log(hasPermission(userPerms, Permission.Delete)); // false

// State machine enum
enum ConnectionState {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  Reconnecting = "reconnecting",
  Failed = "failed"
}

const validTransitions: Record<ConnectionState, ConnectionState[]> = {
  [ConnectionState.Disconnected]: [ConnectionState.Connecting],
  [ConnectionState.Connecting]: [ConnectionState.Connected, ConnectionState.Failed],
  [ConnectionState.Connected]: [ConnectionState.Disconnected, ConnectionState.Reconnecting],
  [ConnectionState.Reconnecting]: [ConnectionState.Connected, ConnectionState.Failed],
  [ConnectionState.Failed]: [ConnectionState.Connecting]
};

function canTransition(from: ConnectionState, to: ConnectionState): boolean {
  return validTransitions[from].includes(to);
}`
  }
};

export default enums;