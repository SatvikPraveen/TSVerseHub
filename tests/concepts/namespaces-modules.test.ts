// File: tests/concepts/namespaces-modules.test.ts

import { describe, it, expect, beforeEach } from 'vitest';

describe('TypeScript Namespaces and Modules', () => {
  describe('Namespaces', () => {
    it('should work with basic namespaces', () => {
      namespace Geometry {
        export interface Point {
          x: number;
          y: number;
        }
        
        export class Circle {
          constructor(private center: Point, private radius: number) {}
          
          getCenter(): Point {
            return this.center;
          }
          
          getRadius(): number {
            return this.radius;
          }
          
          getArea(): number {
            return Math.PI * this.radius * this.radius;
          }
        }
        
        export function distance(p1: Point, p2: Point): number {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          return Math.sqrt(dx * dx + dy * dy);
        }
        
        // Internal helper (not exported)
        function validatePoint(point: Point): boolean {
          return typeof point.x === 'number' && typeof point.y === 'number';
        }
      }
      
      const center: Geometry.Point = { x: 0, y: 0 };
      const circle = new Geometry.Circle(center, 5);
      const point1: Geometry.Point = { x: 0, y: 0 };
      const point2: Geometry.Point = { x: 3, y: 4 };
      
      expect(circle.getRadius()).toBe(5);
      expect(circle.getArea()).toBeCloseTo(78.54, 2);
      expect(Geometry.distance(point1, point2)).toBe(5);
    });

    it('should work with nested namespaces', () => {
      namespace Company {
        export namespace HR {
          export interface Employee {
            id: number;
            name: string;
            department: string;
          }
          
          export class EmployeeManager {
            private employees: Employee[] = [];
            
            addEmployee(employee: Employee): void {
              this.employees.push(employee);
            }
            
            getEmployee(id: number): Employee | undefined {
              return this.employees.find(emp => emp.id === id);
            }
            
            getEmployeesByDepartment(department: string): Employee[] {
              return this.employees.filter(emp => emp.department === department);
            }
          }
        }
        
        export namespace Finance {
          export interface Transaction {
            id: string;
            amount: number;
            date: Date;
            description: string;
          }
          
          export class AccountManager {
            private transactions: Transaction[] = [];
            
            addTransaction(transaction: Transaction): void {
              this.transactions.push(transaction);
            }
            
            getBalance(): number {
              return this.transactions.reduce((sum, t) => sum + t.amount, 0);
            }
            
            getTransactionHistory(): Transaction[] {
              return [...this.transactions];
            }
          }
        }
      }
      
      const hrManager = new Company.HR.EmployeeManager();
      const employee: Company.HR.Employee = {
        id: 1,
        name: 'John Doe',
        department: 'Engineering'
      };
      
      hrManager.addEmployee(employee);
      
      const financeManager = new Company.Finance.AccountManager();
      const transaction: Company.Finance.Transaction = {
        id: 'tx1',
        amount: 1000,
        date: new Date(),
        description: 'Salary payment'
      };
      
      financeManager.addTransaction(transaction);
      
      expect(hrManager.getEmployee(1)?.name).toBe('John Doe');
      expect(financeManager.getBalance()).toBe(1000);
    });

    it('should work with namespace aliases', () => {
      namespace VeryLongNamespaceName {
        export namespace AnotherLongNamespaceName {
          export class UtilityClass {
            static performAction(): string {
              return 'Action performed';
            }
          }
          
          export const CONSTANT_VALUE = 42;
        }
      }
      
      // Create alias for easier access
      import Util = VeryLongNamespaceName.AnotherLongNamespaceName;
      
      const result = Util.UtilityClass.performAction();
      const constant = Util.CONSTANT_VALUE;
      
      expect(result).toBe('Action performed');
      expect(constant).toBe(42);
    });

    it('should work with namespace merging', () => {
      namespace MergeExample {
        export interface Config {
          apiUrl: string;
        }
        
        export function initialize(config: Config): void {
          console.log(`Initializing with ${config.apiUrl}`);
        }
      }
      
      // Merge additional functionality
      namespace MergeExample {
        export interface Config {
          timeout?: number; // Extending the interface
        }
        
        export function setTimeout(ms: number): void {
          console.log(`Setting timeout to ${ms}ms`);
        }
      }
      
      const config: MergeExample.Config = {
        apiUrl: 'https://api.example.com',
        timeout: 5000
      };
      
      MergeExample.initialize(config);
      MergeExample.setTimeout(5000);
      
      expect(config.apiUrl).toBe('https://api.example.com');
      expect(config.timeout).toBe(5000);
    });
  });

  describe('Module Patterns', () => {
    it('should work with module-like patterns using namespaces', () => {
      namespace Logger {
        enum LogLevel {
          DEBUG = 0,
          INFO = 1,
          WARN = 2,
          ERROR = 3
        }
        
        let currentLogLevel: LogLevel = LogLevel.INFO;
        
        export function setLogLevel(level: LogLevel): void {
          currentLogLevel = level;
        }
        
        export function debug(message: string): void {
          if (currentLogLevel <= LogLevel.DEBUG) {
            console.log(`[DEBUG] ${message}`);
          }
        }
        
        export function info(message: string): void {
          if (currentLogLevel <= LogLevel.INFO) {
            console.log(`[INFO] ${message}`);
          }
        }
        
        export function warn(message: string): void {
          if (currentLogLevel <= LogLevel.WARN) {
            console.log(`[WARN] ${message}`);
          }
        }
        
        export function error(message: string): void {
          if (currentLogLevel <= LogLevel.ERROR) {
            console.log(`[ERROR] ${message}`);
          }
        }
        
        // Export the enum for external use
        export { LogLevel };
      }
      
      Logger.setLogLevel(Logger.LogLevel.WARN);
      Logger.debug('This should not appear');
      Logger.info('This should not appear');
      Logger.warn('This should appear');
      Logger.error('This should appear');
      
      expect(Logger.LogLevel.ERROR).toBe(3);
      expect(Logger.LogLevel.DEBUG).toBe(0);
    });

    it('should simulate ES6 module patterns with namespaces', () => {
      // Simulating default export pattern
      namespace MathUtils {
        class Calculator {
          add(a: number, b: number): number {
            return a + b;
          }
          
          subtract(a: number, b: number): number {
            return a - b;
          }
          
          multiply(a: number, b: number): number {
            return a * b;
          }
          
          divide(a: number, b: number): number {
            if (b === 0) {
              throw new Error('Division by zero');
            }
            return a / b;
          }
        }
        
        // Named exports
        export const PI = 3.14159;
        export const E = 2.71828;
        
        export function factorial(n: number): number {
          if (n <= 1) return 1;
          return n * factorial(n - 1);
        }
        
        // Default export simulation
        export const default_export = new Calculator();
      }
      
      // Simulating import patterns
      import calc = MathUtils.default_export;
      import { PI, factorial } = MathUtils;
      
      expect(calc.add(5, 3)).toBe(8);
      expect(calc.multiply(4, 6)).toBe(24);
      expect(PI).toBeCloseTo(3.14159, 5);
      expect(factorial(5)).toBe(120);
    });
  });

  describe('Ambient Namespaces and Declarations', () => {
    it('should work with ambient namespace declarations', () => {
      // Simulating ambient declarations (normally in .d.ts files)
      declare namespace GlobalLibrary {
        interface Config {
          version: string;
          features: string[];
        }
        
        function init(config: Config): void;
        function getVersion(): string;
        
        namespace Utils {
          function format(input: string): string;
          function parse(input: string): any;
        }
      }
      
      // Mock implementation for testing
      (global as any).GlobalLibrary = {
        init: (config: { version: string; features: string[] }) => {
          console.log(`Initializing with version ${config.version}`);
        },
        getVersion: () => '1.0.0',
        Utils: {
          format: (input: string) => input.toUpperCase(),
          parse: (input: string) => JSON.parse(input)
        }
      };
      
      const config: GlobalLibrary.Config = {
        version: '1.0.0',
        features: ['feature1', 'feature2']
      };
      
      GlobalLibrary.init(config);
      const version = GlobalLibrary.getVersion();
      const formatted = GlobalLibrary.Utils.format('hello');
      
      expect(version).toBe('1.0.0');
      expect(formatted).toBe('HELLO');
    });

    it('should work with module augmentation patterns', () => {
      // Base namespace
      namespace BaseLibrary {
        export interface User {
          id: number;
          name: string;
        }
        
        export function getUser(id: number): User {
          return { id, name: `User ${id}` };
        }
      }
      
      // Augmenting the namespace
      namespace BaseLibrary {
        export interface User {
          email?: string; // Adding optional property
        }
        
        export function getUserWithEmail(id: number, email: string): User {
          const user = getUser(id);
          user.email = email;
          return user;
        }
      }
      
      const user = BaseLibrary.getUser(1);
      const userWithEmail = BaseLibrary.getUserWithEmail(2, 'test@example.com');
      
      expect(user.name).toBe('User 1');
      expect(userWithEmail.email).toBe('test@example.com');
      expect(userWithEmail.name).toBe('User 2');
    });
  });

  describe('Triple-Slash Directives Simulation', () => {
    it('should demonstrate reference directive concepts', () => {
      // Simulating /// <reference path="..." /> behavior
      namespace LibraryA {
        export interface BaseEntity {
          id: string;
          createdAt: Date;
        }
        
        export function generateId(): string {
          return Math.random().toString(36).substr(2, 9);
        }
      }
      
      // Simulating a file that references LibraryA
      namespace LibraryB {
        // Using types from LibraryA
        export interface User extends LibraryA.BaseEntity {
          name: string;
          email: string;
        }
        
        export function createUser(name: string, email: string): User {
          return {
            id: LibraryA.generateId(),
            createdAt: new Date(),
            name,
            email
          };
        }
      }
      
      const user = LibraryB.createUser('John Doe', 'john@example.com');
      
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(typeof user.id).toBe('string');
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Namespace vs Module Trade-offs', () => {
    it('should demonstrate namespace benefits', () => {
      // Namespaces are good for organizing code within a single file
      // and creating logical groupings
      
      namespace ValidationLibrary {
        export namespace Email {
          const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          
          export function isValid(email: string): boolean {
            return EMAIL_REGEX.test(email);
          }
          
          export function normalize(email: string): string {
            return email.toLowerCase().trim();
          }
        }
        
        export namespace Password {
          const MIN_LENGTH = 8;
          
          export function isValid(password: string): boolean {
            return password.length >= MIN_LENGTH && 
                   /[A-Z]/.test(password) && 
                   /[a-z]/.test(password) && 
                   /\d/.test(password);
          }
          
          export function getStrength(password: string): 'weak' | 'medium' | 'strong' {
            if (!isValid(password)) return 'weak';
            if (password.length >= 12 && /[!@#$%^&*]/.test(password)) return 'strong';
            return 'medium';
          }
        }
        
        export function validateUser(email: string, password: string): { valid: boolean; errors: string[] } {
          const errors: string[] = [];
          
          if (!Email.isValid(email)) {
            errors.push('Invalid email format');
          }
          
          if (!Password.isValid(password)) {
            errors.push('Password does not meet requirements');
          }
          
          return { valid: errors.length === 0, errors };
        }
      }
      
      const validationResult = ValidationLibrary.validateUser(
        'test@example.com',
        'ValidPassword123'
      );
      
      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toEqual([]);
      
      expect(ValidationLibrary.Email.isValid('invalid-email')).toBe(false);
      expect(ValidationLibrary.Password.getStrength('VeryStrongPassword123!')).toBe('strong');
    });

    it('should demonstrate internal organization patterns', () => {
      namespace DataProcessing {
        // Private namespace (not exported)
        namespace Internal {
          export function sanitizeInput(input: string): string {
            return input.replace(/[<>]/g, '');
          }
          
          export function validateInput(input: string): boolean {
            return input.length > 0 && input.length < 1000;
          }
        }
        
        // Public API
        export class Processor {
          process(input: string): string {
            if (!Internal.validateInput(input)) {
              throw new Error('Invalid input');
            }
            
            const sanitized = Internal.sanitizeInput(input);
            return sanitized.toUpperCase();
          }
        }
        
        export function quickProcess(input: string): string {
          const processor = new Processor();
          return processor.process(input);
        }
      }
      
      const processor = new DataProcessing.Processor();
      const result1 = processor.process('hello <script>');
      const result2 = DataProcessing.quickProcess('world');
      
      expect(result1).toBe('HELLO SCRIPT');
      expect(result2).toBe('WORLD');
      
      // Internal namespace is not accessible from outside
      // DataProcessing.Internal would cause a compilation error
    });
  });

  describe('Namespace with Generics', () => {
    it('should work with generic namespace members', () => {
      namespace Collections {
        export interface Collection<T> {
          add(item: T): void;
          remove(item: T): boolean;
          contains(item: T): boolean;
          size(): number;
          toArray(): T[];
        }
        
        export class ArrayList<T> implements Collection<T> {
          private items: T[] = [];
          
          add(item: T): void {
            this.items.push(item);
          }
          
          remove(item: T): boolean {
            const index = this.items.indexOf(item);
            if (index > -1) {
              this.items.splice(index, 1);
              return true;
            }
            return false;
          }
          
          contains(item: T): boolean {
            return this.items.includes(item);
          }
          
          size(): number {
            return this.items.length;
          }
          
          toArray(): T[] {
            return [...this.items];
          }
        }
        
        export class LinkedList<T> implements Collection<T> {
          private head: ListNode<T> | null = null;
          private count = 0;
          
          add(item: T): void {
            const newNode = new ListNode(item);
            if (!this.head) {
              this.head = newNode;
            } else {
              let current = this.head;
              while (current.next) {
                current = current.next;
              }
              current.next = newNode;
            }
            this.count++;
          }
          
          remove(item: T): boolean {
            if (!this.head) return false;
            
            if (this.head.data === item) {
              this.head = this.head.next;
              this.count--;
              return true;
            }
            
            let current = this.head;
            while (current.next) {
              if (current.next.data === item) {
                current.next = current.next.next;
                this.count--;
                return true;
              }
              current = current.next;
            }
            return false;
          }
          
          contains(item: T): boolean {
            let current = this.head;
            while (current) {
              if (current.data === item) return true;
              current = current.next;
            }
            return false;
          }
          
          size(): number {
            return this.count;
          }
          
          toArray(): T[] {
            const result: T[] = [];
            let current = this.head;
            while (current) {
              result.push(current.data);
              current = current.next;
            }
            return result;
          }
        }
        
        class ListNode<T> {
          constructor(public data: T, public next: ListNode<T> | null = null) {}
        }
      }
      
      const arrayList = new Collections.ArrayList<string>();
      arrayList.add('first');
      arrayList.add('second');
      arrayList.add('third');
      
      const linkedList = new Collections.LinkedList<number>();
      linkedList.add(1);
      linkedList.add(2);
      linkedList.add(3);
      
      expect(arrayList.size()).toBe(3);
      expect(arrayList.contains('second')).toBe(true);
      expect(arrayList.toArray()).toEqual(['first', 'second', 'third']);
      
      expect(linkedList.size()).toBe(3);
      expect(linkedList.contains(2)).toBe(true);
      expect(linkedList.toArray()).toEqual([1, 2, 3]);
      
      expect(arrayList.remove('second')).toBe(true);
      expect(linkedList.remove(2)).toBe(true);
      
      expect(arrayList.toArray()).toEqual(['first', 'third']);
      expect(linkedList.toArray()).toEqual([1, 3]);
    });
  });
});