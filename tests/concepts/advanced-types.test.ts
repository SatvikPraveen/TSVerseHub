// File: tests/concepts/advanced-types.test.ts

import { describe, it, expect, beforeEach } from 'vitest';

describe('Advanced Types in TypeScript', () => {
  describe('Union Types', () => {
    it('should work with union types', () => {
      type StringOrNumber = string | number;
      
      function formatId(id: StringOrNumber): string {
        if (typeof id === 'string') {
          return id.toUpperCase();
        }
        return id.toString();
      }
      
      expect(formatId('abc')).toBe('ABC');
      expect(formatId(123)).toBe('123');
    });

    it('should handle discriminated unions', () => {
      interface Bird {
        type: 'bird';
        flyingSpeed: number;
      }
      
      interface Horse {
        type: 'horse';
        runningSpeed: number;
      }
      
      type Animal = Bird | Horse;
      
      function moveAnimal(animal: Animal): string {
        switch (animal.type) {
          case 'bird':
            return `Flying at ${animal.flyingSpeed} mph`;
          case 'horse':
            return `Running at ${animal.runningSpeed} mph`;
        }
      }
      
      const bird: Bird = { type: 'bird', flyingSpeed: 50 };
      const horse: Horse = { type: 'horse', runningSpeed: 30 };
      
      expect(moveAnimal(bird)).toBe('Flying at 50 mph');
      expect(moveAnimal(horse)).toBe('Running at 30 mph');
    });
  });

  describe('Intersection Types', () => {
    it('should combine types with intersection', () => {
      interface Colorful {
        color: string;
      }
      
      interface Circle {
        radius: number;
      }
      
      type ColorfulCircle = Colorful & Circle;
      
      function createColorfulCircle(color: string, radius: number): ColorfulCircle {
        return { color, radius };
      }
      
      const circle = createColorfulCircle('red', 10);
      expect(circle.color).toBe('red');
      expect(circle.radius).toBe(10);
    });

    it('should work with function intersection types', () => {
      type StringFunction = (x: string) => string;
      type NumberFunction = (x: number) => number;
      type Overloaded = StringFunction & NumberFunction;
      
      const overloadedFunc: Overloaded = (x: any) => {
        if (typeof x === 'string') return x.toUpperCase();
        return x * 2;
      };
      
      expect(overloadedFunc('hello')).toBe('HELLO');
      expect(overloadedFunc(5)).toBe(10);
    });
  });

  describe('Conditional Types', () => {
    it('should work with conditional types', () => {
      type NonNullable<T> = T extends null | undefined ? never : T;
      
      type Result1 = NonNullable<string | null>; // string
      type Result2 = NonNullable<number | undefined>; // number
      
      function removeNull<T>(value: T): NonNullable<T> {
        if (value === null || value === undefined) {
          throw new Error('Value cannot be null or undefined');
        }
        return value as NonNullable<T>;
      }
      
      expect(removeNull('hello')).toBe('hello');
      expect(removeNull(42)).toBe(42);
      expect(() => removeNull(null)).toThrow();
    });

    it('should use infer in conditional types', () => {
      type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
      
      function getString(): string {
        return 'hello';
      }
      
      function getNumber(): number {
        return 42;
      }
      
      type StringReturn = ReturnType<typeof getString>; // string
      type NumberReturn = ReturnType<typeof getNumber>; // number
      
      const str: StringReturn = 'test';
      const num: NumberReturn = 123;
      
      expect(typeof str).toBe('string');
      expect(typeof num).toBe('number');
    });
  });

  describe('Mapped Types', () => {
    it('should create mapped types', () => {
      interface Person {
        name: string;
        age: number;
        email: string;
      }
      
      type Partial<T> = {
        [P in keyof T]?: T[P];
      };
      
      type Required<T> = {
        [P in keyof T]-?: T[P];
      };
      
      type PartialPerson = Partial<Person>;
      type RequiredPerson = Required<Person>;
      
      const partialPerson: PartialPerson = { name: 'John' };
      const requiredPerson: RequiredPerson = {
        name: 'Jane',
        age: 30,
        email: 'jane@example.com'
      };
      
      expect(partialPerson.name).toBe('John');
      expect(requiredPerson.age).toBe(30);
    });

    it('should work with key remapping', () => {
      interface Person {
        name: string;
        age: number;
      }
      
      type Getters<Type> = {
        [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
      };
      
      type PersonGetters = Getters<Person>;
      
      class PersonClass implements PersonGetters {
        constructor(private person: Person) {}
        
        getName(): string {
          return this.person.name;
        }
        
        getAge(): number {
          return this.person.age;
        }
      }
      
      const personInstance = new PersonClass({ name: 'Alice', age: 25 });
      expect(personInstance.getName()).toBe('Alice');
      expect(personInstance.getAge()).toBe(25);
    });
  });

  describe('Template Literal Types', () => {
    it('should work with template literal types', () => {
      type EventName<T extends string> = `${T}Changed`;
      type Direction = 'left' | 'right' | 'up' | 'down';
      type MoveEvent = EventName<Direction>;
      
      function createEvent(event: MoveEvent): string {
        return `Event: ${event}`;
      }
      
      expect(createEvent('leftChanged')).toBe('Event: leftChanged');
      expect(createEvent('rightChanged')).toBe('Event: rightChanged');
    });

    it('should create complex template patterns', () => {
      type Color = 'red' | 'blue' | 'green';
      type Size = 'small' | 'medium' | 'large';
      type ButtonVariant = `${Color}-${Size}`;
      
      function createButton(variant: ButtonVariant): string {
        return `Button with variant: ${variant}`;
      }
      
      expect(createButton('red-small')).toBe('Button with variant: red-small');
      expect(createButton('blue-large')).toBe('Button with variant: blue-large');
    });
  });

  describe('Type Guards', () => {
    it('should work with user-defined type guards', () => {
      interface Fish {
        swim(): void;
      }
      
      interface Bird {
        fly(): void;
      }
      
      function isFish(pet: Fish | Bird): pet is Fish {
        return (pet as Fish).swim !== undefined;
      }
      
      function movePet(pet: Fish | Bird): string {
        if (isFish(pet)) {
          pet.swim();
          return 'swimming';
        } else {
          pet.fly();
          return 'flying';
        }
      }
      
      const fish: Fish = { swim: () => {} };
      const bird: Bird = { fly: () => {} };
      
      expect(movePet(fish)).toBe('swimming');
      expect(movePet(bird)).toBe('flying');
    });

    it('should work with assertion functions', () => {
      function assertIsNumber(val: any): asserts val is number {
        if (typeof val !== 'number') {
          throw new Error('Not a number!');
        }
      }
      
      function multiplyBy2(val: unknown): number {
        assertIsNumber(val);
        return val * 2; // val is now narrowed to number
      }
      
      expect(multiplyBy2(5)).toBe(10);
      expect(() => multiplyBy2('hello')).toThrow('Not a number!');
    });
  });

  describe('Utility Types', () => {
    it('should work with built-in utility types', () => {
      interface User {
        id: number;
        name: string;
        email: string;
        password: string;
      }
      
      type PublicUser = Omit<User, 'password'>;
      type UserUpdate = Pick<User, 'name' | 'email'>;
      type UserRecord = Record<string, User>;
      
      const publicUser: PublicUser = {
        id: 1,
        name: 'John',
        email: 'john@example.com'
      };
      
      const userUpdate: UserUpdate = {
        name: 'Jane',
        email: 'jane@example.com'
      };
      
      const users: UserRecord = {
        'user1': {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          password: 'secret'
        }
      };
      
      expect(publicUser.name).toBe('John');
      expect(userUpdate.name).toBe('Jane');
      expect(users.user1.name).toBe('Alice');
    });

    it('should work with Exclude and Extract', () => {
      type T1 = Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
      type T2 = Extract<'a' | 'b' | 'c', 'a' | 'f'>; // 'a'
      
      const excluded: T1 = 'b';
      const extracted: T2 = 'a';
      
      expect(excluded).toBe('b');
      expect(extracted).toBe('a');
    });
  });

  describe('Index Signatures', () => {
    it('should work with index signatures', () => {
      interface StringDictionary {
        [key: string]: string;
      }
      
      interface NumberDictionary {
        [key: string]: number;
        length: number; // ok, length is a number
      }
      
      const stringDict: StringDictionary = {
        name: 'John',
        city: 'New York'
      };
      
      const numberDict: NumberDictionary = {
        length: 10,
        width: 5,
        height: 3
      };
      
      expect(stringDict.name).toBe('John');
      expect(numberDict.length).toBe(10);
    });

    it('should work with mapped types and index signatures', () => {
      type OptionsFlags<Type> = {
        [Property in keyof Type]: boolean;
      };
      
      type FeatureFlags = {
        darkMode: boolean;
        beta: boolean;
        premium: boolean;
      };
      
      type FeatureOptions = OptionsFlags<FeatureFlags>;
      
      const features: FeatureOptions = {
        darkMode: true,
        beta: false,
        premium: true
      };
      
      expect(features.darkMode).toBe(true);
      expect(features.beta).toBe(false);
    });
  });
});