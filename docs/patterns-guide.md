# TypeScript Design Patterns Guide
**File Location:** `docs/patterns-guide.md`

This guide covers common design patterns implemented in TypeScript, demonstrating how to leverage TypeScript's type system to create robust and maintainable code.

## Table of Contents
1. [Creational Patterns](#creational-patterns)
2. [Structural Patterns](#structural-patterns)
3. [Behavioral Patterns](#behavioral-patterns)
4. [TypeScript-Specific Patterns](#typescript-specific-patterns)
5. [Functional Programming Patterns](#functional-programming-patterns)
6. [Architectural Patterns](#architectural-patterns)

## Creational Patterns

### Singleton Pattern

Ensure a class has only one instance and provide global access to it.

```typescript
class Singleton {
  private static instance: Singleton;
  private constructor() {
    // Private constructor prevents external instantiation
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  public doSomething(): void {
    console.log("Doing something...");
  }
}

// Usage
const singleton1 = Singleton.getInstance();
const singleton2 = Singleton.getInstance();
console.log(singleton1 === singleton2); // true
```

### Factory Pattern

Create objects without specifying their exact classes.

```typescript
interface Product {
  operation(): string;
}

class ConcreteProductA implements Product {
  operation(): string {
    return "Result of ConcreteProductA";
  }
}

class ConcreteProductB implements Product {
  operation(): string {
    return "Result of ConcreteProductB";
  }
}

abstract class Creator {
  public abstract factoryMethod(): Product;

  public someOperation(): string {
    const product = this.factoryMethod();
    return `Creator: ${product.operation()}`;
  }
}

class ConcreteCreatorA extends Creator {
  factoryMethod(): Product {
    return new ConcreteProductA();
  }
}

class ConcreteCreatorB extends Creator {
  factoryMethod(): Product {
    return new ConcreteProductB();
  }
}

// Generic Factory with type constraints
interface Constructable<T = {}> {
  new (...args: any[]): T;
}

class GenericFactory<T> {
  constructor(private ctor: Constructable<T>) {}

  create(...args: any[]): T {
    return new this.ctor(...args);
  }
}

// Usage
const factoryA = new GenericFactory(ConcreteProductA);
const productA = factoryA.create();
```

### Builder Pattern

Construct complex objects step by step.

```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
  timeout?: number;
  poolSize?: number;
}

class DatabaseConfigBuilder {
  private config: Partial<DatabaseConfig> = {};

  setHost(host: string): this {
    this.config.host = host;
    return this;
  }

  setPort(port: number): this {
    this.config.port = port;
    return this;
  }

  setCredentials(username: string, password: string): this {
    this.config.username = username;
    this.config.password = password;
    return this;
  }

  setDatabase(database: string): this {
    this.config.database = database;
    return this;
  }

  enableSSL(enable = true): this {
    this.config.ssl = enable;
    return this;
  }

  setTimeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  setPoolSize(poolSize: number): this {
    this.config.poolSize = poolSize;
    return this;
  }

  build(): DatabaseConfig {
    if (!this.config.host || !this.config.port || !this.config.username || 
        !this.config.password || !this.config.database) {
      throw new Error("Missing required configuration");
    }
    
    return {
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      password: this.config.password,
      database: this.config.database,
      ssl: this.config.ssl ?? false,
      timeout: this.config.timeout ?? 30000,
      poolSize: this.config.poolSize ?? 10
    };
  }
}

// Usage
const dbConfig = new DatabaseConfigBuilder()
  .setHost("localhost")
  .setPort(5432)
  .setCredentials("user", "password")
  .setDatabase("mydb")
  .enableSSL()
  .setTimeout(60000)
  .build();
```

### Abstract Factory Pattern

Create families of related objects.

```typescript
interface Button {
  render(): void;
  onClick(): void;
}

interface Checkbox {
  render(): void;
  toggle(): void;
}

// Concrete implementations for Windows
class WindowsButton implements Button {
  render(): void {
    console.log("Rendering Windows button");
  }
  
  onClick(): void {
    console.log("Windows button clicked");
  }
}

class WindowsCheckbox implements Checkbox {
  render(): void {
    console.log("Rendering Windows checkbox");
  }
  
  toggle(): void {
    console.log("Windows checkbox toggled");
  }
}

// Concrete implementations for Mac
class MacButton implements Button {
  render(): void {
    console.log("Rendering Mac button");
  }
  
  onClick(): void {
    console.log("Mac button clicked");
  }
}

class MacCheckbox implements Checkbox {
  render(): void {
    console.log("Rendering Mac checkbox");
  }
  
  toggle(): void {
    console.log("Mac checkbox toggled");
  }
}

// Abstract factory interface
interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

// Concrete factories
class WindowsFactory implements GUIFactory {
  createButton(): Button {
    return new WindowsButton();
  }
  
  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }
}

class MacFactory implements GUIFactory {
  createButton(): Button {
    return new MacButton();
  }
  
  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }
}

// Factory provider
type Platform = 'windows' | 'mac';

class GUIFactoryProvider {
  static getFactory(platform: Platform): GUIFactory {
    switch (platform) {
      case 'windows':
        return new WindowsFactory();
      case 'mac':
        return new MacFactory();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

// Usage
const factory = GUIFactoryProvider.getFactory('windows');
const button = factory.createButton();
const checkbox = factory.createCheckbox();
```

## Structural Patterns

### Adapter Pattern

Allow incompatible interfaces to work together.

```typescript
// Target interface that the client expects
interface MediaPlayer {
  play(audioType: string, fileName: string): void;
}

// Adaptee classes with incompatible interfaces
class Mp4Player {
  playMp4(fileName: string): void {
    console.log(`Playing mp4 file: ${fileName}`);
  }
}

class VlcPlayer {
  playVlc(fileName: string): void {
    console.log(`Playing vlc file: ${fileName}`);
  }
}

// Adapter to make incompatible interfaces work with MediaPlayer
class MediaAdapter implements MediaPlayer {
  constructor(private audioType: string) {}

  play(audioType: string, fileName: string): void {
    if (audioType.toLowerCase() === "mp4") {
      const mp4Player = new Mp4Player();
      mp4Player.playMp4(fileName);
    } else if (audioType.toLowerCase() === "vlc") {
      const vlcPlayer = new VlcPlayer();
      vlcPlayer.playVlc(fileName);
    }
  }
}

// Client class
class AudioPlayer implements MediaPlayer {
  play(audioType: string, fileName: string): void {
    if (audioType.toLowerCase() === "mp3") {
      console.log(`Playing mp3 file: ${fileName}`);
    } else {
      const adapter = new MediaAdapter(audioType);
      adapter.play(audioType, fileName);
    }
  }
}

// Generic adapter using type constraints
interface Adaptable<T> {
  adapt(): T;
}

class GenericAdapter<TSource, TTarget> implements Adaptable<TTarget> {
  constructor(
    private source: TSource,
    private transformer: (source: TSource) => TTarget
  ) {}

  adapt(): TTarget {
    return this.transformer(this.source);
  }
}
```

### Decorator Pattern

Add behavior to objects dynamically without altering their class.

```typescript
// Base interface
interface Coffee {
  cost(): number;
  description(): string;
}

// Concrete component
class SimpleCoffee implements Coffee {
  cost(): number {
    return 2;
  }

  description(): string {
    return "Simple coffee";
  }
}

// Base decorator
abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}

  cost(): number {
    return this.coffee.cost();
  }

  description(): string {
    return this.coffee.description();
  }
}

// Concrete decorators
class MilkDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.5;
  }

  description(): string {
    return this.coffee.description() + ", milk";
  }
}

class SugarDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.25;
  }

  description(): string {
    return this.coffee.description() + ", sugar";
  }
}

class WhipDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.75;
  }

  description(): string {
    return this.coffee.description() + ", whip";
  }
}

// Method decorator for TypeScript classes
function LogMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with arguments:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Method ${propertyKey} returned:`, result);
    return result;
  };

  return descriptor;
}

function Memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const cache = new Map();
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    return result;
  };

  return descriptor;
}

// Usage of decorators
class Calculator {
  @LogMethod
  @Memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}

// Usage
let coffee: Coffee = new SimpleCoffee();
console.log(`${coffee.description()}: $${coffee.cost()}`);

coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);

coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);
```

### Facade Pattern

Provide a simplified interface to a complex subsystem.

```typescript
// Complex subsystem classes
class CPU {
  freeze(): void {
    console.log("Freezing CPU");
  }

  jump(position: number): void {
    console.log(`Jumping to position ${position}`);
  }

  execute(): void {
    console.log("Executing");
  }
}

class Memory {
  load(position: number, data: string): void {
    console.log(`Loading data "${data}" at position ${position}`);
  }
}

class HardDrive {
  read(lba: number, size: number): string {
    console.log(`Reading ${size} bytes from LBA ${lba}`);
    return "Boot data";
  }
}

// Facade class
class ComputerFacade {
  private cpu: CPU;
  private memory: Memory;
  private hardDrive: HardDrive;

  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }

  start(): void {
    console.log("Starting computer...");
    this.cpu.freeze();
    const bootData = this.hardDrive.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
    console.log("Computer started successfully!");
  }
}

// Generic facade pattern
interface Subsystem {
  operation(): void;
}

class Facade<T extends Record<string, Subsystem>> {
  constructor(private subsystems: T) {}

  executeAll(): void {
    Object.values(this.subsystems).forEach(subsystem => {
      subsystem.operation();
    });
  }

  execute<K extends keyof T>(subsystemName: K): void {
    this.subsystems[subsystemName].operation();
  }
}

// Usage
const computer = new ComputerFacade();
computer.start();
```

## Behavioral Patterns

### Observer Pattern

Define a one-to-many dependency between objects.

```typescript
interface Observer<T = any> {
  update(data: T): void;
}

interface Subject<T = any> {
  subscribe(observer: Observer<T>): void;
  unsubscribe(observer: Observer<T>): void;
  notify(data: T): void;
}

class ConcreteSubject<T> implements Subject<T> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): void {
    const existingIndex = this.observers.indexOf(observer);
    if (existingIndex === -1) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: T): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

// Concrete observers
class EmailNotifier implements Observer<string> {
  update(message: string): void {
    console.log(`Email notification: ${message}`);
  }
}

class SMSNotifier implements Observer<string> {
  update(message: string): void {
    console.log(`SMS notification: ${message}`);
  }
}

// Type-safe observable using generics
class TypedObservable<T> {
  private observers: ((data: T) => void)[] = [];

  subscribe(observer: (data: T) => void): () => void {
    this.observers.push(observer);
    return () => this.unsubscribe(observer);
  }

  private unsubscribe(observer: (data: T) => void): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  next(data: T): void {
    this.observers.forEach(observer => observer(data));
  }
}

// Usage
const newsAgency = new ConcreteSubject<string>();
const emailNotifier = new EmailNotifier();
const smsNotifier = new SMSNotifier();

newsAgency.subscribe(emailNotifier);
newsAgency.subscribe(smsNotifier);
newsAgency.notify("Breaking news: TypeScript patterns are awesome!");

// Type-safe observable usage
const userActions = new TypedObservable<{ action: string; userId: string }>();
const unsubscribe = userActions.subscribe(({ action, userId }) => {
  console.log(`User ${userId} performed ${action}`);
});

userActions.next({ action: "login", userId: "user123" });
```

### Strategy Pattern

Define a family of algorithms and make them interchangeable.

```typescript
interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
  constructor(private cardNumber: string, private cvv: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Credit Card ending in ${this.cardNumber.slice(-4)}`);
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using PayPal account ${this.email}`);
  }
}

class BankTransferPayment implements PaymentStrategy {
  constructor(private accountNumber: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Bank Transfer to account ${this.accountNumber}`);
  }
}

class PaymentContext {
  private strategy?: PaymentStrategy;

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  processPayment(amount: number): void {
    if (!this.strategy) {
      throw new Error("Payment strategy not set");
    }
    this.strategy.pay(amount);
  }
}

// Generic strategy pattern
interface Strategy<T, R> {
  execute(data: T): R;
}

class Context<T, R> {
  private strategy?: Strategy<T, R>;

  setStrategy(strategy: Strategy<T, R>): void {
    this.strategy = strategy;
  }

  executeStrategy(data: T): R {
    if (!this.strategy) {
      throw new Error("Strategy not set");
    }
    return this.strategy.execute(data);
  }
}

// Sorting strategies example
interface SortStrategy<T> extends Strategy<T[], T[]> {}

class BubbleSortStrategy<T> implements SortStrategy<T> {
  execute(data: T[]): T[] {
    const result = [...data];
    const n = result.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (result[j] > result[j + 1]) {
          [result[j], result[j + 1]] = [result[j + 1], result[j]];
        }
      }
    }
    return result;
  }
}

class QuickSortStrategy<T> implements SortStrategy<T> {
  execute(data: T[]): T[] {
    if (data.length <= 1) return [...data];
    
    const pivot = data[0];
    const left = data.slice(1).filter(x => x <= pivot);
    const right = data.slice(1).filter(x => x > pivot);
    
    return [
      ...this.execute(left),
      pivot,
      ...this.execute(right)
    ];
  }
}

// Usage
const paymentContext = new PaymentContext();
paymentContext.setStrategy(new CreditCardPayment("1234-5678-9012-3456", "123"));
paymentContext.processPayment(100);

const sortContext = new Context<number[], number[]>();
sortContext.setStrategy(new QuickSortStrategy<number>());
const sorted = sortContext.executeStrategy([64, 34, 25, 12, 22, 11, 90]);
console.log("Sorted:", sorted);
```

### Command Pattern

Encapsulate requests as objects.

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

// Receiver
class TextEditor {
  private content = "";

  write(text: string): void {
    this.content += text;
  }

  delete(length: number): string {
    const deleted = this.content.slice(-length);
    this.content = this.content.slice(0, -length);
    return deleted;
  }

  getContent(): string {
    return this.content;
  }
}

// Concrete commands
class WriteCommand implements Command {
  private text: string;

  constructor(private editor: TextEditor, text: string) {
    this.text = text;
  }

  execute(): void {
    this.editor.write(this.text);
  }

  undo(): void {
    this.editor.delete(this.text.length);
  }
}

class DeleteCommand implements Command {
  private deletedText = "";

  constructor(private editor: TextEditor, private length: number) {}

  execute(): void {
    this.deletedText = this.editor.delete(this.length);
  }

  undo(): void {
    this.editor.write(this.deletedText);
  }
}

// Invoker
class EditorInvoker {
  private history: Command[] = [];
  private currentPosition = -1;

  execute(command: Command): void {
    // Remove any commands after current position (for new branch after undo)
    this.history = this.history.slice(0, this.currentPosition + 1);
    
    this.history.push(command);
    this.currentPosition++;
    command.execute();
  }

  undo(): void {
    if (this.currentPosition >= 0) {
      const command = this.history[this.currentPosition];
      command.undo();
      this.currentPosition--;
    }
  }

  redo(): void {
    if (this.currentPosition < this.history.length - 1) {
      this.currentPosition++;
      const command = this.history[this.currentPosition];
      command.execute();
    }
  }
}

// Generic command pattern
type CommandFn<T = void> = () => T;
type UndoFn<T = void> = (result?: T) => void;

class GenericCommand<T = void> implements Command {
  private result?: T;

  constructor(
    private executeFn: CommandFn<T>,
    private undoFn: UndoFn<T>
  ) {}

  execute(): void {
    this.result = this.executeFn();
  }

  undo(): void {
    this.undoFn(this.result);
  }
}

// Usage
const editor = new TextEditor();
const invoker = new EditorInvoker();

const writeHello = new WriteCommand(editor, "Hello ");
const writeWorld = new WriteCommand(editor, "World!");
const deleteChars = new DeleteCommand(editor, 6);

invoker.execute(writeHello);
invoker.execute(writeWorld);
console.log(editor.getContent()); // "Hello World!"

invoker.execute(deleteChars);
console.log(editor.getContent()); // "Hello "

invoker.undo();
console.log(editor.getContent()); // "Hello World!"

invoker.undo();
console.log(editor.getContent()); // "Hello "
```

## TypeScript-Specific Patterns

### Mixin Pattern

Combine multiple classes into one.

```typescript
// Mixin constructor type
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin functions
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now();
    
    getTimestamp() {
      return new Date(this.timestamp);
    }
  };
}

function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActive = false;

    activate() {
      this.isActive = true;
    }

    deactivate() {
      this.isActive = false;
    }

    toggle() {
      this.isActive = !this.isActive;
    }
  };
}

function Serializable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    serialize(): string {
      return JSON.stringify(this);
    }

    static deserialize<T>(this: Constructor<T>, json: string): T {
      const data = JSON.parse(json);
      return Object.assign(new this(), data);
    }
  };
}

// Base class
class User {
  constructor(public name: string, public email: string) {}
}

// Apply mixins
const TimestampedUser = Timestamped(User);
const ActivatableUser = Activatable(TimestampedUser);
const FullUser = Serializable(ActivatableUser);

// Usage
const user = new FullUser("John Doe", "john@example.com");
user.activate();
console.log(user.serialize());
console.log(user.getTimestamp());

// Advanced mixin with interfaces
interface Disposable {
  dispose(): void;
}

function Disposable<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Disposable {
    private disposed = false;

    dispose(): void {
      if (this.disposed) return;
      this.disposed = true;
      this.cleanup();
    }

    protected cleanup(): void {
      // Override in subclasses
    }

    isDisposed(): boolean {
      return this.disposed;
    }
  };
}

// Multiple constraint mixin
function Loggable<TBase extends Constructor<{ name?: string }>>(Base: TBase) {
  return class extends Base {
    log(message: string): void {
      const name = this.name || this.constructor.name;
      console.log(`[${name}] ${message}`);
    }
  };
}
```

### Module Pattern with Namespaces

```typescript
namespace DataStructures {
  export interface Comparable<T> {
    compareTo(other: T): number;
  }

  export class BinarySearchTree<T extends Comparable<T>> {
    private root: TreeNode<T> | null = null;

    insert(value: T): void {
      this.root = this.insertNode(this.root, value);
    }

    search(value: T): boolean {
      return this.searchNode(this.root, value);
    }

    private insertNode(node: TreeNode<T> | null, value: T): TreeNode<T> {
      if (node === null) {
        return new TreeNode(value);
      }

      if (value.compareTo(node.value) < 0) {
        node.left = this.insertNode(node.left, value);
      } else if (value.compareTo(node.value) > 0) {
        node.right = this.insertNode(node.right, value);
      }

      return node;
    }

    private searchNode(node: TreeNode<T> | null, value: T): boolean {
      if (node === null) {
        return false;
      }

      const comparison = value.compareTo(node.value);
      if (comparison === 0) {
        return true;
      } else if (comparison < 0) {
        return this.searchNode(node.left, value);
      } else {
        return this.searchNode(node.right, value);
      }
    }
  }

  class TreeNode<T> {
    left: TreeNode<T> | null = null;
    right: TreeNode<T> | null = null;

    constructor(public value: T) {}
  }

  export class NumberValue implements Comparable<NumberValue> {
    constructor(public value: number) {}

    compareTo(other: NumberValue): number {
      return this.value - other.value;
    }
  }
}

// Usage
const bst = new DataStructures.BinarySearchTree<DataStructures.NumberValue>();
bst.insert(new DataStructures.NumberValue(5));
bst.insert(new DataStructures.NumberValue(3));
bst.insert(new DataStructures.NumberValue(7));

console.log(bst.search(new DataStructures.NumberValue(3))); // true
```

### Type Guards Pattern

```typescript
// Type predicate functions
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

// Generic type guard
function hasProperty<T, K extends string | number | symbol>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return obj !== null && typeof obj === 'object' && prop in obj;
}

// Class-based type guards
abstract class Shape {
  abstract area(): number;
}

class Rectangle extends Shape {
  constructor(public width: number, public height: number) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius * this.radius;
  }
}

function isRectangle(shape: Shape): shape is Rectangle {
  return shape instanceof Rectangle;
}

function isCircle(shape: Shape): shape is Circle {
  return shape instanceof Circle;
}

// Tagged union pattern
interface LoadingState {
  type: 'loading';
}

interface SuccessState {
  type: 'success';
  data: any;
}

interface ErrorState {
  type: 'error';
  error: string;
}

type AsyncState = LoadingState | SuccessState | ErrorState;

// Type guard for tagged unions
function isSuccessState(state: AsyncState): state is SuccessState {
  return state.type === 'success';
}

function isErrorState(state: AsyncState): state is ErrorState {
  return state.type === 'error';
}

// Usage with type narrowing
function handleAsyncState(state: AsyncState): void {
  switch (state.type) {
    case 'loading':
      console.log('Loading...');
      break;
    case 'success':
      console.log('Success:', state.data); // TypeScript knows state.data exists
      break;
    case 'error':
      console.log('Error:', state.error); // TypeScript knows state.error exists
      break;
  }
}
```

## Functional Programming Patterns

### Higher-Order Functions

```typescript
// Function composition
type Fn<T, R> = (arg: T) => R;

function compose<A, B, C>(f: Fn<B, C>, g: Fn<A, B>): Fn<A, C> {
  return (arg: A) => f(g(arg));
}

function pipe<A, B, C>(g: Fn<A, B>, f: Fn<B, C>): Fn<A, C> {
  return (arg: A) => f(g(arg));
}

// Multiple function composition
function composeMany<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

// Currying
function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

function curry3<A, B, C, D>(fn: (a: A, b: B, c: C) => D): (a: A) => (b: B) => (c: C) => D {
  return (a: A) => (b: B) => (c: C) => fn(a, b, c);
}

// Partial application
function partial<T extends any[], R>(
  fn: (...args: T) => R,
  ...partialArgs: T
): (...remainingArgs: any[]) => R {
  return (...remainingArgs: any[]) => fn(...partialArgs, ...remainingArgs);
}

// Example usage
const add = (a: number, b: number) => a + b;
const multiply = (a: number, b: number) => a * b;

const addThenMultiply = compose(
  curry(multiply)(2),
  curry(add)(5)
);

console.log(addThenMultiply(3)); // (3 + 5) * 2 = 16
```

### Monad Pattern

```typescript
// Maybe monad for null safety
abstract class Maybe<T> {
  abstract isNone(): boolean;
  abstract isSome(): boolean;
  abstract map<U>(fn: (value: T) => U): Maybe<U>;
  abstract flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U>;
  abstract filter(predicate: (value: T) => boolean): Maybe<T>;
  abstract getOrElse(defaultValue: T): T;
}

class Some<T> extends Maybe<T> {
  constructor(private value: T) {
    super();
  }

  isNone(): boolean {
    return false;
  }

  isSome(): boolean {
    return true;
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    return new Some(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return fn(this.value);
  }

  filter(predicate: (value: T) => boolean): Maybe<T> {
    return predicate(this.value) ? this : new None<T>();
  }

  getOrElse(_defaultValue: T): T {
    return this.value;
  }
}

class None<T> extends Maybe<T> {
  isNone(): boolean {
    return true;
  }

  isSome(): boolean {
    return false;
  }

  map<U>(_fn: (value: T) => U): Maybe<U> {
    return new None<U>();
  }

  flatMap<U>(_fn: (value: T) => Maybe<U>): Maybe<U> {
    return new None<U>();
  }

  filter(_predicate: (value: T) => boolean): Maybe<T> {
    return this;
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }
}

// Helper functions
function some<T>(value: T): Maybe<T> {
  return new Some(value);
}

function none<T>(): Maybe<T> {
  return new None<T>();
}

function maybe<T>(value: T | null | undefined): Maybe<T> {
  return value == null ? none<T>() : some(value);
}

// Either monad for error handling
abstract class Either<L, R> {
  abstract isLeft(): boolean;
  abstract isRight(): boolean;
  abstract map<T>(fn: (value: R) => T): Either<L, T>;
  abstract mapLeft<T>(fn: (value: L) => T): Either<T, R>;
  abstract flatMap<T>(fn: (value: R) => Either<L, T>): Either<L, T>;
  abstract getOrElse(defaultValue: R): R;
}

class Left<L, R> extends Either<L, R> {
  constructor(private value: L) {
    super();
  }

  isLeft(): boolean {
    return true;
  }

  isRight(): boolean {
    return false;
  }

  map<T>(_fn: (value: R) => T): Either<L, T> {
    return new Left<L, T>(this.value);
  }

  mapLeft<T>(fn: (value: L) => T): Either<T, R> {
    return new Left<T, R>(fn(this.value));
  }

  flatMap<T>(_fn: (value: R) => Either<L, T>): Either<L, T> {
    return new Left<L, T>(this.value);
  }

  getOrElse(defaultValue: R): R {
    return defaultValue;
  }
}

class Right<L, R> extends Either<L, R> {
  constructor(private value: R) {
    super();
  }

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return true;
  }

  map<T>(fn: (value: R) => T): Either<L, T> {
    return new Right<L, T>(fn(this.value));
  }

  mapLeft<T>(_fn: (value: L) => T): Either<T, R> {
    return new Right<T, R>(this.value);
  }

  flatMap<T>(fn: (value: R) => Either<L, T>): Either<L, T> {
    return fn(this.value);
  }

  getOrElse(_defaultValue: R): R {
    return this.value;
  }
}

// Helper functions
function left<L, R>(value: L): Either<L, R> {
  return new Left(value);
}

function right<L, R>(value: R): Either<L, R> {
  return new Right(value);
}

// Usage examples
const maybeUser = maybe(getUserById("123"))
  .filter(user => user.active)
  .map(user => user.name);

console.log(maybeUser.getOrElse("Unknown user"));

// Error handling with Either
function divide(a: number, b: number): Either<string, number> {
  if (b === 0) {
    return left("Division by zero");
  }
  return right(a / b);
}

const result = divide(10, 2)
  .map(x => x * 2)
  .map(x => x + 1);

console.log(result.getOrElse(0)); // 11
```

## Architectural Patterns

### Repository Pattern

```typescript
interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(id: ID, updates: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UserRepository extends Repository<User, string> {
  findByEmail(email: string): Promise<User | null>;
  findActiveUsers(): Promise<User[]>;
}

class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, { ...user });
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email === email) || null;
  }

  async findActiveUsers(): Promise<User[]> {
    // Implementation would check active status
    return this.findAll();
  }
}

// Generic repository
class GenericRepository<T extends { id: string }> implements Repository<T, string> {
  private items: Map<string, T> = new Map();

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.items.values());
  }

  async save(entity: T): Promise<T> {
    this.items.set(entity.id, { ...entity });
    return entity;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const entity = this.items.get(id);
    if (!entity) return null;
    
    const updatedEntity = { ...entity, ...updates };
    this.items.set(id, updatedEntity);
    return updatedEntity;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}
```

### Unit of Work Pattern

```typescript
interface UnitOfWork {
  registerNew<T>(entity: T): void;
  registerDirty<T>(entity: T): void;
  registerDeleted<T>(entity: T): void;
  commit(): Promise<void>;
  rollback(): void;
}

class SimpleUnitOfWork implements UnitOfWork {
  private newEntities: any[] = [];
  private dirtyEntities: any[] = [];
  private deletedEntities: any[] = [];

  registerNew<T>(entity: T): void {
    this.newEntities.push(entity);
  }

  registerDirty<T>(entity: T): void {
    this.dirtyEntities.push(entity);
  }

  registerDeleted<T>(entity: T): void {
    this.deletedEntities.push(entity);
  }

  async commit(): Promise<void> {
    try {
      // Process in order: inserts, updates, deletes
      for (const entity of this.newEntities) {
        await this.insert(entity);
      }
      
      for (const entity of this.dirtyEntities) {
        await this.update(entity);
      }
      
      for (const entity of this.deletedEntities) {
        await this.delete(entity);
      }
      
      this.clear();
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  rollback(): void {
    this.clear();
  }

  private clear(): void {
    this.newEntities.length = 0;
    this.dirtyEntities.length = 0;
    this.deletedEntities.length = 0;
  }

  private async insert(entity: any): Promise<void> {
    console.log('Inserting:', entity);
    // Database insert logic
  }

  private async update(entity: any): Promise<void> {
    console.log('Updating:', entity);
    // Database update logic
  }

  private async delete(entity: any): Promise<void> {
    console.log('Deleting:', entity);
    // Database delete logic
  }
}
```

### Dependency Injection Pattern

```typescript
// Service container
type ServiceConstructor<T = any> = new (...args: any[]) => T;
type ServiceFactory<T = any> = () => T;
type ServiceIdentifier<T = any> = string | symbol | ServiceConstructor<T>;

interface Container {
  register<T>(identifier: ServiceIdentifier<T>, implementation: ServiceConstructor<T> | ServiceFactory<T>): void;
  registerSingleton<T>(identifier: ServiceIdentifier<T>, implementation: ServiceConstructor<T> | ServiceFactory<T>): void;
  resolve<T>(identifier: ServiceIdentifier<T>): T;
}

class DIContainer implements Container {
  private services = new Map<ServiceIdentifier, any>();
  private singletons = new Map<ServiceIdentifier, any>();

  register<T>(
    identifier: ServiceIdentifier<T>,
    implementation: ServiceConstructor<T> | ServiceFactory<T>
  ): void {
    this.services.set(identifier, implementation);
  }

  registerSingleton<T>(
    identifier: ServiceIdentifier<T>,
    implementation: ServiceConstructor<T> | ServiceFactory<T>
  ): void {
    this.services.set(identifier, implementation);
    this.singletons.set(identifier, null); // Mark as singleton
  }

  resolve<T>(identifier: ServiceIdentifier<T>): T {
    // Check if it's a singleton and already created
    if (this.singletons.has(identifier)) {
      const existingInstance = this.singletons.get(identifier);
      if (existingInstance !== null) {
        return existingInstance;
      }
    }

    const implementation = this.services.get(identifier);
    if (!implementation) {
      throw new Error(`Service ${String(identifier)} not registered`);
    }

    let instance: T;
    if (typeof implementation === 'function') {
      if (implementation.prototype && implementation.prototype.constructor === implementation) {
        // It's a constructor
        instance = new implementation();
      } else {
        // It's a factory function
        instance = implementation();
      }
    } else {
      throw new Error(`Invalid implementation for ${String(identifier)}`);
    }

    // Store singleton instance
    if (this.singletons.has(identifier)) {
      this.singletons.set(identifier, instance);
    }

    return instance;
  }
}

// Service interfaces
interface Logger {
  log(message: string): void;
}

interface EmailService {
  sendEmail(to: string, subject: string, body: string): void;
}

interface UserService {
  createUser(name: string, email: string): void;
}

// Implementations
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class SMTPEmailService implements EmailService {
  sendEmail(to: string, subject: string, body: string): void {
    console.log(`Sending email to ${to}: ${subject}`);
  }
}

class UserServiceImpl implements UserService {
  constructor(
    private logger: Logger,
    private emailService: EmailService
  ) {}

  createUser(name: string, email: string): void {
    this.logger.log(`Creating user: ${name}`);
    // User creation logic
    this.emailService.sendEmail(email, "Welcome!", "Welcome to our service");
  }
}

// Decorator for dependency injection
const SERVICE_TOKENS = {
  Logger: Symbol('Logger'),
  EmailService: Symbol('EmailService'),
  UserService: Symbol('UserService')
} as const;

// Usage
const container = new DIContainer();

// Register services
container.registerSingleton(SERVICE_TOKENS.Logger, ConsoleLogger);
container.registerSingleton(SERVICE_TOKENS.EmailService, SMTPEmailService);
container.register(SERVICE_TOKENS.UserService, () => {
  return new UserServiceImpl(
    container.resolve(SERVICE_TOKENS.Logger),
    container.resolve(SERVICE_TOKENS.EmailService)
  );
});

// Resolve and use services
const userService = container.resolve<UserService>(SERVICE_TOKENS.UserService);
userService.createUser("John Doe", "john@example.com");
```

## Best Practices

1. **Choose the Right Pattern**: Don't force patterns where they don't fit. Consider the problem you're solving.

2. **Leverage TypeScript's Type System**: Use generics, type constraints, and type guards to make patterns more robust.

3. **Keep It Simple**: Start with simple implementations and add complexity only when needed.

4. **Document Your Patterns**: Use clear interfaces and comments to explain the pattern's purpose and usage.

5. **Test Your Patterns**: Write unit tests to ensure your pattern implementations work correctly.

6. **Consider Performance**: Some patterns like decorators and proxies can impact performance if overused.

## Conclusion

Design patterns in TypeScript provide powerful tools for creating maintainable, scalable applications. TypeScript's type system adds an extra layer of safety and expressiveness to these classical patterns. Remember to use patterns judiciously and always consider the specific needs of your application.