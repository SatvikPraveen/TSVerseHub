// File: tests/concepts/generics.test.ts

import { describe, it, expect, beforeEach } from 'vitest';

describe('TypeScript Generics', () => {
  describe('Basic Generic Functions', () => {
    it('should work with basic generic functions', () => {
      function identity<T>(arg: T): T {
        return arg;
      }
      
      const stringResult = identity<string>('hello');
      const numberResult = identity<number>(42);
      const booleanResult = identity(true); // Type inference
      
      expect(stringResult).toBe('hello');
      expect(numberResult).toBe(42);
      expect(booleanResult).toBe(true);
      expect(typeof stringResult).toBe('string');
      expect(typeof numberResult).toBe('number');
      expect(typeof booleanResult).toBe('boolean');
    });

    it('should handle generic functions with constraints', () => {
      interface Lengthwise {
        length: number;
      }
      
      function logLength<T extends Lengthwise>(arg: T): T {
        console.log(arg.length);
        return arg;
      }
      
      const stringResult = logLength('hello world');
      const arrayResult = logLength([1, 2, 3, 4, 5]);
      
      expect(stringResult).toBe('hello world');
      expect(arrayResult).toEqual([1, 2, 3, 4, 5]);
      expect(stringResult.length).toBe(11);
      expect(arrayResult.length).toBe(5);
    });

    it('should work with multiple generic parameters', () => {
      function pair<T, U>(first: T, second: U): [T, U] {
        return [first, second];
      }
      
      const stringNumberPair = pair<string, number>('age', 25);
      const booleanArrayPair = pair(true, [1, 2, 3]);
      
      expect(stringNumberPair).toEqual(['age', 25]);
      expect(booleanArrayPair).toEqual([true, [1, 2, 3]]);
    });
  });

  describe('Generic Interfaces', () => {
    it('should work with generic interfaces', () => {
      interface KeyValuePair<K, V> {
        key: K;
        value: V;
      }
      
      interface Collection<T> {
        add(item: T): void;
        get(index: number): T | undefined;
        size(): number;
      }
      
      const stringNumberPair: KeyValuePair<string, number> = {
        key: 'count',
        value: 42
      };
      
      class SimpleCollection<T> implements Collection<T> {
        private items: T[] = [];
        
        add(item: T): void {
          this.items.push(item);
        }
        
        get(index: number): T | undefined {
          return this.items[index];
        }
        
        size(): number {
          return this.items.length;
        }
      }
      
      const numberCollection = new SimpleCollection<number>();
      numberCollection.add(10);
      numberCollection.add(20);
      
      expect(stringNumberPair.key).toBe('count');
      expect(stringNumberPair.value).toBe(42);
      expect(numberCollection.get(0)).toBe(10);
      expect(numberCollection.size()).toBe(2);
    });

    it('should handle generic interfaces with default types', () => {
      interface ApiResponse<T = any> {
        data: T;
        status: number;
        message: string;
      }
      
      interface User {
        id: number;
        name: string;
        email: string;
      }
      
      const userResponse: ApiResponse<User> = {
        data: { id: 1, name: 'John', email: 'john@example.com' },
        status: 200,
        message: 'Success'
      };
      
      const genericResponse: ApiResponse = {
        data: { anything: 'goes here' },
        status: 200,
        message: 'Success'
      };
      
      expect(userResponse.data.name).toBe('John');
      expect(userResponse.status).toBe(200);
      expect(genericResponse.data.anything).toBe('goes here');
    });
  });

  describe('Generic Classes', () => {
    it('should work with basic generic classes', () => {
      class GenericStack<T> {
        private items: T[] = [];
        
        push(item: T): void {
          this.items.push(item);
        }
        
        pop(): T | undefined {
          return this.items.pop();
        }
        
        peek(): T | undefined {
          return this.items[this.items.length - 1];
        }
        
        isEmpty(): boolean {
          return this.items.length === 0;
        }
        
        size(): number {
          return this.items.length;
        }
      }
      
      const numberStack = new GenericStack<number>();
      numberStack.push(1);
      numberStack.push(2);
      numberStack.push(3);
      
      expect(numberStack.peek()).toBe(3);
      expect(numberStack.size()).toBe(3);
      expect(numberStack.pop()).toBe(3);
      expect(numberStack.size()).toBe(2);
      expect(numberStack.isEmpty()).toBe(false);
      
      const stringStack = new GenericStack<string>();
      stringStack.push('hello');
      stringStack.push('world');
      
      expect(stringStack.pop()).toBe('world');
      expect(stringStack.peek()).toBe('hello');
    });

    it('should work with generic class inheritance', () => {
      abstract class Animal<T> {
        constructor(protected data: T) {}
        
        abstract makeSound(): string;
        
        getData(): T {
          return this.data;
        }
      }
      
      interface DogData {
        name: string;
        breed: string;
        age: number;
      }
      
      class Dog extends Animal<DogData> {
        makeSound(): string {
          return `${this.data.name} barks!`;
        }
        
        getBreed(): string {
          return this.data.breed;
        }
      }
      
      const dogData: DogData = {
        name: 'Rex',
        breed: 'German Shepherd',
        age: 3
      };
      
      const dog = new Dog(dogData);
      
      expect(dog.makeSound()).toBe('Rex barks!');
      expect(dog.getBreed()).toBe('German Shepherd');
      expect(dog.getData().age).toBe(3);
    });
  });

  describe('Generic Constraints', () => {
    it('should work with keyof constraints', () => {
      function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
        return obj[key];
      }
      
      const person = {
        name: 'Alice',
        age: 30,
        email: 'alice@example.com'
      };
      
      const name = getProperty(person, 'name');
      const age = getProperty(person, 'age');
      const email = getProperty(person, 'email');
      
      expect(name).toBe('Alice');
      expect(age).toBe(30);
      expect(email).toBe('alice@example.com');
      expect(typeof name).toBe('string');
      expect(typeof age).toBe('number');
    });

    it('should work with conditional type constraints', () => {
      type NonNullable<T> = T extends null | undefined ? never : T;
      
      function processValue<T>(value: T): NonNullable<T> {
        if (value === null || value === undefined) {
          throw new Error('Value cannot be null or undefined');
        }
        return value as NonNullable<T>;
      }
      
      const stringValue = processValue('hello');
      const numberValue = processValue(42);
      const objectValue = processValue({ key: 'value' });
      
      expect(stringValue).toBe('hello');
      expect(numberValue).toBe(42);
      expect(objectValue.key).toBe('value');
      
      expect(() => processValue(null)).toThrow();
      expect(() => processValue(undefined)).toThrow();
    });

    it('should work with mapped type constraints', () => {
      type Partial<T> = {
        [P in keyof T]?: T[P];
      };
      
      type Required<T> = {
        [P in keyof T]-?: T[P];
      };
      
      interface User {
        name: string;
        email: string;
        age?: number;
      }
      
      function updateUser(user: User, updates: Partial<User>): User {
        return { ...user, ...updates };
      }
      
      function createUser(data: Required<User>): User {
        return data;
      }
      
      const originalUser: User = {
        name: 'John',
        email: 'john@example.com'
      };
      
      const updatedUser = updateUser(originalUser, { age: 25 });
      
      const completeUser = createUser({
        name: 'Jane',
        email: 'jane@example.com',
        age: 30
      });
      
      expect(updatedUser.age).toBe(25);
      expect(completeUser.name).toBe('Jane');
      expect(completeUser.age).toBe(30);
    });
  });

  describe('Generic Utility Types', () => {
    it('should work with Pick and Omit', () => {
      interface User {
        id: number;
        name: string;
        email: string;
        password: string;
        createdAt: Date;
      }
      
      type PublicUser = Omit<User, 'password'>;
      type UserCredentials = Pick<User, 'email' | 'password'>;
      type UserSummary = Pick<User, 'id' | 'name'>;
      
      const publicUser: PublicUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date()
      };
      
      const credentials: UserCredentials = {
        email: 'john@example.com',
        password: 'secret123'
      };
      
      const summary: UserSummary = {
        id: 1,
        name: 'John Doe'
      };
      
      expect(publicUser.name).toBe('John Doe');
      expect(credentials.password).toBe('secret123');
      expect(summary.id).toBe(1);
    });

    it('should work with Record type', () => {
      type UserRole = 'admin' | 'user' | 'guest';
      type Permissions = Record<UserRole, string[]>;
      
      const permissions: Permissions = {
        admin: ['read', 'write', 'delete'],
        user: ['read', 'write'],
        guest: ['read']
      };
      
      function hasPermission(role: UserRole, permission: string): boolean {
        return permissions[role].includes(permission);
      }
      
      expect(hasPermission('admin', 'delete')).toBe(true);
      expect(hasPermission('user', 'delete')).toBe(false);
      expect(hasPermission('guest', 'read')).toBe(true);
    });

    it('should work with Exclude and Extract', () => {
      type AllColors = 'red' | 'green' | 'blue' | 'yellow' | 'purple';
      type PrimaryColors = Extract<AllColors, 'red' | 'green' | 'blue'>;
      type NonPrimaryColors = Exclude<AllColors, 'red' | 'green' | 'blue'>;
      
      const primary: PrimaryColors = 'red';
      const nonPrimary: NonPrimaryColors = 'yellow';
      
      expect(primary).toBe('red');
      expect(nonPrimary).toBe('yellow');
      
      // Type checking
      const isPrimaryColor = (color: string): color is PrimaryColors => {
        return ['red', 'green', 'blue'].includes(color);
      };
      
      expect(isPrimaryColor('red')).toBe(true);
      expect(isPrimaryColor('yellow')).toBe(false);
    });
  });

  describe('Advanced Generic Patterns', () => {
    it('should work with conditional types', () => {
      type ApiResponse<T> = T extends string
        ? { message: T }
        : T extends number
        ? { count: T }
        : T extends boolean
        ? { success: T }
        : { data: T };
      
      function createResponse<T>(value: T): ApiResponse<T> {
        if (typeof value === 'string') {
          return { message: value } as ApiResponse<T>;
        }
        if (typeof value === 'number') {
          return { count: value } as ApiResponse<T>;
        }
        if (typeof value === 'boolean') {
          return { success: value } as ApiResponse<T>;
        }
        return { data: value } as ApiResponse<T>;
      }
      
      const stringResponse = createResponse('Hello');
      const numberResponse = createResponse(42);
      const booleanResponse = createResponse(true);
      const objectResponse = createResponse({ name: 'test' });
      
      expect(stringResponse).toEqual({ message: 'Hello' });
      expect(numberResponse).toEqual({ count: 42 });
      expect(booleanResponse).toEqual({ success: true });
      expect(objectResponse).toEqual({ data: { name: 'test' } });
    });

    it('should work with infer keyword', () => {
      type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
      type Parameters<T> = T extends (...args: infer P) => any ? P : never;
      
      function getString(prefix: string, suffix: string): string {
        return `${prefix}-${suffix}`;
      }
      
      function getNumber(): number {
        return 42;
      }
      
      type GetStringReturn = ReturnType<typeof getString>; // string
      type GetStringParams = Parameters<typeof getString>; // [string, string]
      type GetNumberReturn = ReturnType<typeof getNumber>; // number
      
      // Test with actual implementations
      const stringResult: GetStringReturn = getString('hello', 'world');
      const numberResult: GetNumberReturn = getNumber();
      
      expect(stringResult).toBe('hello-world');
      expect(numberResult).toBe(42);
      expect(typeof stringResult).toBe('string');
      expect(typeof numberResult).toBe('number');
    });

    it('should work with recursive generic types', () => {
      type TreeNode<T> = {
        value: T;
        children: TreeNode<T>[];
      };
      
      class Tree<T> {
        constructor(private root: TreeNode<T>) {}
        
        traverse(callback: (value: T) => void): void {
          this.traverseNode(this.root, callback);
        }
        
        private traverseNode(node: TreeNode<T>, callback: (value: T) => void): void {
          callback(node.value);
          for (const child of node.children) {
            this.traverseNode(child, callback);
          }
        }
        
        getRoot(): TreeNode<T> {
          return this.root;
        }
      }
      
      const numberTree: TreeNode<number> = {
        value: 1,
        children: [
          {
            value: 2,
            children: [
              { value: 4, children: [] },
              { value: 5, children: [] }
            ]
          },
          {
            value: 3,
            children: [
              { value: 6, children: [] }
            ]
          }
        ]
      };
      
      const tree = new Tree(numberTree);
      const values: number[] = [];
      
      tree.traverse((value) => values.push(value));
      
      expect(values).toEqual([1, 2, 4, 5, 3, 6]);
      expect(tree.getRoot().value).toBe(1);
    });
  });

  describe('Generic Type Guards', () => {
    it('should work with generic type guards', () => {
      function isArray<T>(value: T | T[]): value is T[] {
        return Array.isArray(value);
      }
      
      function isNotNull<T>(value: T | null): value is T {
        return value !== null;
      }
      
      function processValue<T>(value: T | T[] | null): T[] {
        if (isNotNull(value)) {
          if (isArray(value)) {
            return value;
          }
          return [value];
        }
        return [];
      }
      
      expect(processValue(5)).toEqual([5]);
      expect(processValue([1, 2, 3])).toEqual([1, 2, 3]);
      expect(processValue(null)).toEqual([]);
      expect(processValue('hello')).toEqual(['hello']);
    });

    it('should work with assertion functions', () => {
      function assertIsNumber<T>(value: T): asserts value is Extract<T, number> {
        if (typeof value !== 'number') {
          throw new Error('Expected number');
        }
      }
      
      function assertIsArray<T>(value: T): asserts value is Extract<T, any[]> {
        if (!Array.isArray(value)) {
          throw new Error('Expected array');
        }
      }
      
      function processUnknownValue(value: unknown): number {
        assertIsNumber(value);
        return value * 2; // value is now narrowed to number
      }
      
      function processUnknownArray(value: unknown): number {
        assertIsArray(value);
        return value.length; // value is now narrowed to array
      }
      
      expect(processUnknownValue(5)).toBe(10);
      expect(processUnknownArray([1, 2, 3])).toBe(3);
      
      expect(() => processUnknownValue('not a number')).toThrow('Expected number');
      expect(() => processUnknownArray('not an array')).toThrow('Expected array');
    });
  });

  describe('Generic Factory Patterns', () => {
    it('should work with generic factory functions', () => {
      interface Serializable {
        serialize(): string;
        deserialize(data: string): void;
      }
      
      class GenericFactory<T extends Serializable> {
        constructor(private constructor: new () => T) {}
        
        create(): T {
          return new this.constructor();
        }
        
        createFromData(data: string): T {
          const instance = this.create();
          instance.deserialize(data);
          return instance;
        }
      }
      
      class User implements Serializable {
        constructor(public name: string = '', public email: string = '') {}
        
        serialize(): string {
          return JSON.stringify({ name: this.name, email: this.email });
        }
        
        deserialize(data: string): void {
          const parsed = JSON.parse(data);
          this.name = parsed.name;
          this.email = parsed.email;
        }
      }
      
      const userFactory = new GenericFactory(User);
      const emptyUser = userFactory.create();
      const userFromData = userFactory.createFromData('{"name":"John","email":"john@example.com"}');
      
      expect(emptyUser.name).toBe('');
      expect(userFromData.name).toBe('John');
      expect(userFromData.email).toBe('john@example.com');
    });
  });
});