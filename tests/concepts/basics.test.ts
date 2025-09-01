// File: tests/concepts/basics.test.ts

import { describe, it, expect, beforeEach } from 'vitest';

describe('TypeScript Basics', () => {
  describe('Variable Declarations and Types', () => {
    it('should handle basic type annotations', () => {
      const name: string = 'John Doe';
      const age: number = 30;
      const isActive: boolean = true;
      const scores: number[] = [95, 87, 92];
      const tags: Array<string> = ['typescript', 'javascript', 'web'];
      
      expect(typeof name).toBe('string');
      expect(typeof age).toBe('number');
      expect(typeof isActive).toBe('boolean');
      expect(Array.isArray(scores)).toBe(true);
      expect(Array.isArray(tags)).toBe(true);
      expect(scores.length).toBe(3);
      expect(tags.includes('typescript')).toBe(true);
    });

    it('should work with tuple types', () => {
      let tuple: [string, number, boolean];
      tuple = ['hello', 42, true];
      
      expect(tuple[0]).toBe('hello');
      expect(tuple[1]).toBe(42);
      expect(tuple[2]).toBe(true);
      expect(tuple.length).toBe(3);
    });

    it('should handle enum types', () => {
      enum Color {
        Red,
        Green,
        Blue
      }
      
      enum Status {
        Active = 'ACTIVE',
        Inactive = 'INACTIVE',
        Pending = 'PENDING'
      }
      
      const favoriteColor: Color = Color.Blue;
      const currentStatus: Status = Status.Active;
      
      expect(favoriteColor).toBe(2); // Blue is 2 in numeric enum
      expect(currentStatus).toBe('ACTIVE');
      expect(Color[0]).toBe('Red');
      expect(Status.Pending).toBe('PENDING');
    });

    it('should work with any and unknown types', () => {
      let dynamicValue: any = 42;
      dynamicValue = 'hello';
      dynamicValue = true;
      
      let unknownValue: unknown = 'test';
      
      // Type checking with unknown
      if (typeof unknownValue === 'string') {
        expect(unknownValue.toUpperCase()).toBe('TEST');
      }
      
      expect(dynamicValue).toBe(true);
    });

    it('should handle void, null, and undefined', () => {
      function logMessage(message: string): void {
        console.log(message);
      }
      
      let nullableValue: string | null = null;
      let undefinedValue: string | undefined = undefined;
      
      expect(logMessage('test')).toBeUndefined();
      expect(nullableValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
      
      nullableValue = 'now has value';
      expect(nullableValue).toBe('now has value');
    });
  });

  describe('Functions', () => {
    it('should handle function type annotations', () => {
      function add(a: number, b: number): number {
        return a + b;
      }
      
      const multiply = (x: number, y: number): number => x * y;
      
      function greet(name: string, greeting?: string): string {
        return `${greeting || 'Hello'}, ${name}!`;
      }
      
      expect(add(5, 3)).toBe(8);
      expect(multiply(4, 6)).toBe(24);
      expect(greet('Alice')).toBe('Hello, Alice!');
      expect(greet('Bob', 'Hi')).toBe('Hi, Bob!');
    });

    it('should work with default parameters and rest parameters', () => {
      function createUser(name: string, age: number = 18, ...hobbies: string[]): object {
        return { name, age, hobbies };
      }
      
      const user1 = createUser('John');
      const user2 = createUser('Jane', 25, 'reading', 'swimming');
      
      expect(user1).toEqual({ name: 'John', age: 18, hobbies: [] });
      expect(user2).toEqual({ 
        name: 'Jane', 
        age: 25, 
        hobbies: ['reading', 'swimming'] 
      });
    });

    it('should handle function overloads', () => {
      function combine(a: string, b: string): string;
      function combine(a: number, b: number): number;
      function combine(a: any, b: any): any {
        return a + b;
      }
      
      expect(combine('Hello', ' World')).toBe('Hello World');
      expect(combine(10, 20)).toBe(30);
    });
  });

  describe('Objects and Interfaces', () => {
    it('should work with object type annotations', () => {
      const user: { name: string; age: number; email?: string } = {
        name: 'John',
        age: 30
      };
      
      user.email = 'john@example.com';
      
      expect(user.name).toBe('John');
      expect(user.age).toBe(30);
      expect(user.email).toBe('john@example.com');
    });

    it('should work with interfaces', () => {
      interface Person {
        readonly id: number;
        name: string;
        age: number;
        email?: string;
        greet(): string;
      }
      
      const person: Person = {
        id: 1,
        name: 'Alice',
        age: 25,
        greet() {
          return `Hi, I'm ${this.name}`;
        }
      };
      
      expect(person.id).toBe(1);
      expect(person.greet()).toBe("Hi, I'm Alice");
    });

    it('should handle interface inheritance', () => {
      interface Animal {
        name: string;
        age: number;
      }
      
      interface Dog extends Animal {
        breed: string;
        bark(): string;
      }
      
      const dog: Dog = {
        name: 'Rex',
        age: 3,
        breed: 'Golden Retriever',
        bark() {
          return 'Woof!';
        }
      };
      
      expect(dog.name).toBe('Rex');
      expect(dog.breed).toBe('Golden Retriever');
      expect(dog.bark()).toBe('Woof!');
    });
  });

  describe('Classes', () => {
    it('should work with basic class syntax', () => {
      class Calculator {
        private history: string[] = [];
        
        constructor(public name: string) {}
        
        add(a: number, b: number): number {
          const result = a + b;
          this.history.push(`${a} + ${b} = ${result}`);
          return result;
        }
        
        getHistory(): readonly string[] {
          return this.history;
        }
        
        protected log(message: string): void {
          console.log(`[${this.name}] ${message}`);
        }
      }
      
      const calc = new Calculator('MyCalc');
      const result = calc.add(5, 3);
      
      expect(result).toBe(8);
      expect(calc.name).toBe('MyCalc');
      expect(calc.getHistory()).toEqual(['5 + 3 = 8']);
    });

    it('should handle class inheritance', () => {
      abstract class Animal {
        constructor(protected name: string) {}
        
        abstract makeSound(): string;
        
        move(): string {
          return `${this.name} is moving`;
        }
      }
      
      class Cat extends Animal {
        constructor(name: string, private breed: string) {
          super(name);
        }
        
        makeSound(): string {
          return `${this.name} says meow`;
        }
        
        getBreed(): string {
          return this.breed;
        }
      }
      
      const cat = new Cat('Fluffy', 'Persian');
      
      expect(cat.makeSound()).toBe('Fluffy says meow');
      expect(cat.move()).toBe('Fluffy is moving');
      expect(cat.getBreed()).toBe('Persian');
    });

    it('should work with static members', () => {
      class MathUtils {
        static readonly PI = 3.14159;
        private static instanceCount = 0;
        
        constructor() {
          MathUtils.instanceCount++;
        }
        
        static getInstanceCount(): number {
          return MathUtils.instanceCount;
        }
        
        static circleArea(radius: number): number {
          return MathUtils.PI * radius * radius;
        }
      }
      
      expect(MathUtils.PI).toBe(3.14159);
      expect(MathUtils.circleArea(5)).toBeCloseTo(78.54, 2);
      
      const utils1 = new MathUtils();
      const utils2 = new MathUtils();
      
      expect(MathUtils.getInstanceCount()).toBe(2);
    });
  });

  describe('Type Assertions and Type Guards', () => {
    it('should work with type assertions', () => {
      let someValue: unknown = 'this is a string';
      
      let strLength1: number = (someValue as string).length;
      let strLength2: number = (<string>someValue).length;
      
      expect(strLength1).toBe(16);
      expect(strLength2).toBe(16);
    });

    it('should work with typeof type guards', () => {
      function processValue(value: string | number): string {
        if (typeof value === 'string') {
          return value.toUpperCase();
        }
        return value.toString();
      }
      
      expect(processValue('hello')).toBe('HELLO');
      expect(processValue(42)).toBe('42');
    });

    it('should work with instanceof type guards', () => {
      class Bird {
        fly(): string {
          return 'flying';
        }
      }
      
      class Fish {
        swim(): string {
          return 'swimming';
        }
      }
      
      function move(animal: Bird | Fish): string {
        if (animal instanceof Bird) {
          return animal.fly();
        }
        return animal.swim();
      }
      
      const bird = new Bird();
      const fish = new Fish();
      
      expect(move(bird)).toBe('flying');
      expect(move(fish)).toBe('swimming');
    });
  });

  describe('Arrays and Array Methods', () => {
    it('should work with typed arrays', () => {
      const numbers: number[] = [1, 2, 3, 4, 5];
      const strings: Array<string> = ['a', 'b', 'c'];
      
      const doubled = numbers.map((n: number): number => n * 2);
      const filtered = numbers.filter((n: number): boolean => n > 3);
      const sum = numbers.reduce((acc: number, curr: number): number => acc + curr, 0);
      
      expect(doubled).toEqual([2, 4, 6, 8, 10]);
      expect(filtered).toEqual([4, 5]);
      expect(sum).toBe(15);
      expect(strings.join('-')).toBe('a-b-c');
    });

    it('should handle readonly arrays', () => {
      const readonlyNumbers: readonly number[] = [1, 2, 3];
      const readonlyStrings: ReadonlyArray<string> = ['x', 'y', 'z'];
      
      expect(readonlyNumbers.length).toBe(3);
      expect(readonlyStrings.includes('y')).toBe(true);
      
      // These would cause compilation errors:
      // readonlyNumbers.push(4);
      // readonlyStrings[0] = 'new value';
    });
  });

  describe('String Literal Types and Template Literals', () => {
    it('should work with string literal types', () => {
      type Theme = 'light' | 'dark';
      type Size = 'small' | 'medium' | 'large';
      
      function applyTheme(theme: Theme): string {
        return `Applied ${theme} theme`;
      }
      
      function setSize(size: Size): string {
        return `Size set to ${size}`;
      }
      
      expect(applyTheme('light')).toBe('Applied light theme');
      expect(setSize('medium')).toBe('Size set to medium');
    });

    it('should work with template literal types', () => {
      type Greeting = `Hello ${string}`;
      type EventName = `on${Capitalize<string>}`;
      
      const greeting1: Greeting = 'Hello World';
      const greeting2: Greeting = 'Hello TypeScript';
      const eventName: EventName = 'onClick';
      
      expect(greeting1).toBe('Hello World');
      expect(greeting2).toBe('Hello TypeScript');
      expect(eventName).toBe('onClick');
    });
  });
});