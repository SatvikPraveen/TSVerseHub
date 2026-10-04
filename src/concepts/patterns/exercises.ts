// File: concepts/patterns/exercises.ts

/**
 * DESIGN PATTERNS EXERCISES
 * 
 * Complete these exercises to master design patterns in TypeScript.
 * Each exercise focuses on implementing and understanding core patterns
 * with practical, real-world scenarios.
 */

/**
 * Placeholder used by the exercise stubs below. Each stub keeps the class
 * type-correct against its interface while leaving the real behaviour to you:
 * replace the `notImplemented(...)` call with your implementation.
 */
export function notImplemented(member: string): never {
  throw new Error(`${member} is not implemented yet - complete the exercise!`);
}

// ===== EXERCISE 1: SINGLETON PATTERN =====
// TODO: Implement a ConfigurationManager singleton that:
// - Stores application configuration
// - Prevents multiple instances
// - Provides thread-safe access
// - Allows configuration updates

export class ConfigurationManager {
  // Your implementation here
  // Hint: Use static instance property and private constructor
}

// Test your ConfigurationManager
// const config1 = ConfigurationManager.getInstance();
// const config2 = ConfigurationManager.getInstance();
// console.log(config1 === config2); // Should be true

// ===== EXERCISE 2: FACTORY METHOD PATTERN =====
// TODO: Create a DocumentFactory that can create different document types:
// - PDFDocument, WordDocument, TextDocument
// - Each document should have: title, content, and export() method
// - Factory should determine which document type to create based on extension

export interface Document {
  title: string;
  content: string;
  export(): string;
}

export class PDFDocument implements Document {
  constructor(public title: string, public content: string) {}

  // Your implementation here
  export(): string {
    return notImplemented('PDFDocument.export');
  }
}

export class WordDocument implements Document {
  constructor(public title: string, public content: string) {}

  // Your implementation here
  export(): string {
    return notImplemented('WordDocument.export');
  }
}

export class TextDocument implements Document {
  constructor(public title: string, public content: string) {}

  // Your implementation here
  export(): string {
    return notImplemented('TextDocument.export');
  }
}

export abstract class DocumentFactory {
  // Your factory method implementation here
  abstract createDocument(title: string, content: string): Document;
  
  // Template method
  public processDocument(title: string, content: string, filename: string): string {
    const document = this.createDocument(title, content);
    console.log(`Exporting ${filename}`);
    return document.export();
  }
}

export class ConcreteDocumentFactory extends DocumentFactory {
  // Your implementation here
  createDocument(title: string, _content: string): Document {
    // Determine document type from title or implement logic
    return notImplemented(`ConcreteDocumentFactory.createDocument(${title})`);
  }
}

// ===== EXERCISE 3: OBSERVER PATTERN =====
// TODO: Implement a Stock Trading System with:
// - Stock class that notifies when price changes
// - Multiple observer types: Trader, NewsAgency, Portfolio
// - Each observer reacts differently to price changes

export interface StockObserver {
  update(stock: string, price: number, change: number): void;
}

export class Stock {
  private symbol: string;
  private price: number;
  private observers: StockObserver[] = [];

  constructor(symbol: string, price: number) {
    this.symbol = symbol;
    this.price = price;
  }

  getSymbol(): string {
    return this.symbol;
  }

  getPrice(): number {
    return this.price;
  }

  getObserverCount(): number {
    return this.observers.length;
  }

  // Your implementation here
  // Need: addObserver, removeObserver, notifyObservers, setPrice methods
}

export class Trader implements StockObserver {
  constructor(private name: string) {}

  getName(): string {
    return this.name;
  }
  
  update(_stock: string, _price: number, _change: number): void {
    // Your implementation here
    // Trader should decide whether to buy/sell based on price change
    notImplemented('Trader.update');
  }
}

export class NewsAgency implements StockObserver {
  // Your implementation here
  // NewsAgency should publish news about significant price changes
  update(_stock: string, _price: number, _change: number): void {
    notImplemented('NewsAgency.update');
  }
}

export class Portfolio implements StockObserver {
  // Your implementation here
  // Portfolio should update total value when stock prices change
  update(_stock: string, _price: number, _change: number): void {
    notImplemented('Portfolio.update');
  }
}

// ===== EXERCISE 4: STRATEGY PATTERN =====
// TODO: Create a Sorting System that can use different sorting algorithms:
// - BubbleSort, QuickSort, MergeSort strategies
// - SortContext that can switch between strategies
// - Measure and compare performance of different strategies

export interface SortStrategy<T> {
  sort(data: T[]): T[];
  getName(): string;
}

export class BubbleSortStrategy<T> implements SortStrategy<T> {
  // Your implementation here
  sort(_data: T[]): T[] {
    return notImplemented('BubbleSortStrategy.sort');
  }

  getName(): string {
    return 'Bubble Sort';
  }
}

export class QuickSortStrategy<T> implements SortStrategy<T> {
  // Your implementation here
  sort(_data: T[]): T[] {
    return notImplemented('QuickSortStrategy.sort');
  }

  getName(): string {
    return 'Quick Sort';
  }
}

export class MergeSortStrategy<T> implements SortStrategy<T> {
  // Your implementation here
  sort(_data: T[]): T[] {
    return notImplemented('MergeSortStrategy.sort');
  }

  getName(): string {
    return 'Merge Sort';
  }
}

export class SortContext<T> {
  private strategy: SortStrategy<T>;

  constructor(strategy: SortStrategy<T>) {
    this.strategy = strategy;
  }

  getStrategy(): SortStrategy<T> {
    return this.strategy;
  }

  // Your implementation here
  // Need: setStrategy, sort, and performance measurement methods
}

// ===== EXERCISE 5: DECORATOR PATTERN =====
// TODO: Create a Coffee Shop system with:
// - Basic Coffee interface
// - SimpleCoffee base implementation
// - Decorators for: Milk, Sugar, Whip, Caramel
// - Each decorator adds cost and modifies description

export interface Coffee {
  getCost(): number;
  getDescription(): string;
}

export class SimpleCoffee implements Coffee {
  // Your implementation here
  getCost(): number {
    return notImplemented('SimpleCoffee.getCost');
  }

  getDescription(): string {
    return notImplemented('SimpleCoffee.getDescription');
  }
}

export abstract class CoffeeDecorator implements Coffee {
  protected coffee: Coffee;

  constructor(coffee: Coffee) {
    this.coffee = coffee;
  }

  // Your implementation here
  abstract getCost(): number;
  abstract getDescription(): string;
}

export class MilkDecorator extends CoffeeDecorator {
  // Your implementation here
  getCost(): number {
    return notImplemented('MilkDecorator.getCost');
  }

  getDescription(): string {
    return notImplemented('MilkDecorator.getDescription');
  }
}

export class SugarDecorator extends CoffeeDecorator {
  // Your implementation here
  getCost(): number {
    return notImplemented('SugarDecorator.getCost');
  }

  getDescription(): string {
    return notImplemented('SugarDecorator.getDescription');
  }
}

// ===== EXERCISE 6: COMMAND PATTERN =====
// TODO: Implement a Remote Control system:
// - Command interface for different operations
// - Light, Fan, Stereo devices with on/off commands
// - RemoteControl with execute/undo functionality
// - Macro commands that execute multiple commands

export interface Command {
  execute(): void;
  undo(): void;
}

export class Light {
  private lit: boolean = false;
  private location: string;

  constructor(location: string) {
    this.location = location;
  }

  getLocation(): string {
    return this.location;
  }

  isOn(): boolean {
    return this.lit;
  }

  // Your implementation here
  // Need: on() and off() methods that toggle `lit`
}

export class LightOnCommand implements Command {
  // Your implementation here
  execute(): void {
    notImplemented('LightOnCommand.execute');
  }

  undo(): void {
    notImplemented('LightOnCommand.undo');
  }
}

export class LightOffCommand implements Command {
  // Your implementation here
  execute(): void {
    notImplemented('LightOffCommand.execute');
  }

  undo(): void {
    notImplemented('LightOffCommand.undo');
  }
}

export class RemoteControl {
  private commands: Command[] = [];
  private lastCommand?: Command;

  getCommandCount(): number {
    return this.commands.length;
  }

  getLastCommand(): Command | undefined {
    return this.lastCommand;
  }

  // Your implementation here
  // Need: setCommand, pressButton, pressUndo methods
}

// ===== EXERCISE 7: ADAPTER PATTERN =====
// TODO: Create a Media Player system that:
// - Plays MP3 files natively
// - Uses adapters to play MP4 and AVI files
// - Each adapter wraps a specific advanced media player

export interface MediaPlayer {
  play(audioType: string, fileName: string): void;
}

export interface AdvancedMediaPlayer {
  playVlc(fileName: string): void;
  playMp4(fileName: string): void;
}

export class VlcPlayer implements AdvancedMediaPlayer {
  // Your implementation here
  playVlc(_fileName: string): void {
    notImplemented('VlcPlayer.playVlc');
  }

  playMp4(_fileName: string): void {
    notImplemented('VlcPlayer.playMp4');
  }
}

export class Mp4Player implements AdvancedMediaPlayer {
  // Your implementation here
  playVlc(_fileName: string): void {
    notImplemented('Mp4Player.playVlc');
  }

  playMp4(_fileName: string): void {
    notImplemented('Mp4Player.playMp4');
  }
}

export class MediaAdapter implements MediaPlayer {
  // Your implementation here
  // Should adapt AdvancedMediaPlayer to MediaPlayer interface
  play(_audioType: string, _fileName: string): void {
    notImplemented('MediaAdapter.play');
  }
}

export class AudioPlayer implements MediaPlayer {
  // Your implementation here
  // Should play MP3 directly, use adapter for other formats
  play(_audioType: string, _fileName: string): void {
    notImplemented('AudioPlayer.play');
  }
}

// ===== EXERCISE 8: FACADE PATTERN =====
// TODO: Create a Computer System facade that:
// - Simplifies starting a computer (CPU, Memory, HardDrive)
// - Provides simple start() method that handles complex subsystem interactions
// - Hides internal complexity from the client

export class CPU {
  // Your implementation here
  // Methods: freeze(), jump(position: number), execute()
}

export class Memory {
  // Your implementation here
  // Methods: load(position: number, data: string)
}

export class HardDrive {
  // Your implementation here
  // Methods: read(lba: number, size: number): string
}

export class ComputerFacade {
  // Your implementation here
  // Should coordinate CPU, Memory, and HardDrive
  // Provide simple start() method
}

// ===== EXERCISE 9: TEMPLATE METHOD PATTERN =====
// TODO: Create a Data Processing framework:
// - Abstract DataProcessor with template method
// - Concrete processors for CSV, JSON, XML
// - Template method defines the algorithm structure
// - Subclasses implement specific steps

export abstract class DataProcessor {
  // Template method
  public process(data: string): any {
    const parsed = this.parseData(data);
    const validated = this.validateData(parsed);
    const transformed = this.transformData(validated);
    return this.saveData(transformed);
  }

  // Abstract methods to be implemented by subclasses
  protected abstract parseData(data: string): any;
  protected abstract validateData(data: any): any;
  protected abstract transformData(data: any): any;
  protected abstract saveData(data: any): any;
}

export class CSVProcessor extends DataProcessor {
  // Your implementation here
  protected parseData(_data: string): unknown {
    return notImplemented('CSVProcessor.parseData');
  }

  protected validateData(_data: unknown): unknown {
    return notImplemented('CSVProcessor.validateData');
  }

  protected transformData(_data: unknown): unknown {
    return notImplemented('CSVProcessor.transformData');
  }

  protected saveData(_data: unknown): unknown {
    return notImplemented('CSVProcessor.saveData');
  }
}

export class JSONProcessor extends DataProcessor {
  // Your implementation here
  protected parseData(_data: string): unknown {
    return notImplemented('JSONProcessor.parseData');
  }

  protected validateData(_data: unknown): unknown {
    return notImplemented('JSONProcessor.validateData');
  }

  protected transformData(_data: unknown): unknown {
    return notImplemented('JSONProcessor.transformData');
  }

  protected saveData(_data: unknown): unknown {
    return notImplemented('JSONProcessor.saveData');
  }
}

// ===== EXERCISE 10: BUILDER PATTERN =====
// TODO: Create a Pizza Builder system:
// - Pizza class with various properties
// - PizzaBuilder with fluent interface
// - Director class that can build common pizza types

export class Pizza {
  public size?: string;
  public crust?: string;
  public toppings: string[] = [];
  public cheese?: string;
  public sauce?: string;

  public getDescription(): string {
    // Your implementation here
    return '';
  }
}

export class PizzaBuilder {
  private pizza: Pizza;

  constructor() {
    this.pizza = new Pizza();
  }

  build(): Pizza {
    return this.pizza;
  }

  // Your implementation here
  // Need fluent interface methods: size(), crust(), addTopping(), cheese(), sauce()
}

export class PizzaDirector {
  private builder: PizzaBuilder;

  constructor(builder: PizzaBuilder) {
    this.builder = builder;
  }

  getBuilder(): PizzaBuilder {
    return this.builder;
  }

  // Your implementation here
  // Methods to build common pizzas: buildMargherita(), buildPepperoni(), etc.
}

// ===== ADVANCED EXERCISE 11: COMPOSITE PATTERN =====
// TODO: Create a File System structure:
// - Component interface for files and directories
// - File (leaf) and Directory (composite) classes
// - Directory can contain files and other directories

export interface FileSystemComponent {
  getName(): string;
  getSize(): number;
  display(indent: number): string;
}

export class File implements FileSystemComponent {
  // Your implementation here
  getName(): string {
    return notImplemented('File.getName');
  }

  getSize(): number {
    return notImplemented('File.getSize');
  }

  display(_indent: number): string {
    return notImplemented('File.display');
  }
}

export class Directory implements FileSystemComponent {
  // Your implementation here
  // Should manage collection of FileSystemComponent objects
  getName(): string {
    return notImplemented('Directory.getName');
  }

  getSize(): number {
    return notImplemented('Directory.getSize');
  }

  display(_indent: number): string {
    return notImplemented('Directory.display');
  }
}

// ===== ADVANCED EXERCISE 12: PROXY PATTERN =====
// TODO: Create a Virtual Proxy for image loading:
// - Image interface with display() method
// - RealImage class that loads image from disk
// - ProxyImage that loads RealImage only when needed

export interface Image {
  display(): void;
}

export class RealImage implements Image {
  // Your implementation here
  // Should simulate loading image from disk
  display(): void {
    notImplemented('RealImage.display');
  }
}

export class ProxyImage implements Image {
  // Your implementation here
  // Should create RealImage only when display() is called
  display(): void {
    notImplemented('ProxyImage.display');
  }
}

// ===== SOLUTIONS REFERENCE (UNCOMMENT TO SEE EXAMPLES) =====

/*
// SOLUTION 1: Singleton Pattern
export class ConfigurationManager {
  private static instance: ConfigurationManager | null = null;
  private config: Record<string, any> = {};

  private constructor() {
    // Load default configuration
    this.config = {
      apiUrl: 'https://api.example.com',
      timeout: 5000,
      retryAttempts: 3
    };
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  public get<T>(key: string): T {
    return this.config[key] as T;
  }

  public set(key: string, value: any): void {
    this.config[key] = value;
  }

  public getAll(): Record<string, any> {
    return { ...this.config };
  }
}

// SOLUTION 2: Factory Method Pattern
export class PDFDocument implements Document {
  constructor(public title: string, public content: string) {}

  export(): string {
    return `PDF: ${this.title}\n${this.content}\n[Exported as PDF]`;
  }
}

export class WordDocument implements Document {
  constructor(public title: string, public content: string) {}

  export(): string {
    return `DOCX: ${this.title}\n${this.content}\n[Exported as Word Document]`;
  }
}

export class ConcreteDocumentFactory extends DocumentFactory {
  createDocument(title: string, content: string): Document {
    // Simple logic - in real app would check file extension
    if (title.toLowerCase().includes('pdf')) {
      return new PDFDocument(title, content);
    } else if (title.toLowerCase().includes('doc')) {
      return new WordDocument(title, content);
    } else {
      return new TextDocument(title, content);
    }
  }
}
*/

// ===== TEST RUNNER =====
export function runExerciseTests() {
  console.log('=== DESIGN PATTERNS EXERCISE TESTS ===\n');

  try {
    // Test Singleton
    console.log('Testing Singleton Pattern...');
    // const config1 = ConfigurationManager.getInstance();
    // const config2 = ConfigurationManager.getInstance();
    // console.log('Same instance?', config1 === config2);

    // Test Factory
    console.log('\nTesting Factory Pattern...');
    // const factory = new ConcreteDocumentFactory();
    // const pdfDoc = factory.createDocument('Report.pdf', 'Content');
    // console.log(pdfDoc.export());

    // Test Observer
    console.log('\nTesting Observer Pattern...');
    // const stock = new Stock('AAPL', 150.00);
    // const trader = new Trader('John');
    // stock.addObserver(trader);
    // stock.setPrice(155.00);

    // Test Strategy
    console.log('\nTesting Strategy Pattern...');
    // const context = new SortContext(new QuickSortStrategy());
    // const result = context.sort([3, 1, 4, 1, 5, 9, 2, 6]);
    // console.log('Sorted:', result);

    console.log('\n✅ Implement the patterns above to see results!');
  } catch (error) {
    console.error('❌ Error running tests:', error instanceof Error ? error.message : String(error));
  }
}

// ===== PATTERN IMPLEMENTATION CHECKLIST =====
export const implementationChecklist = {
  singleton: [
    '✅ Private constructor',
    '✅ Static instance property',
    '✅ Static getInstance() method',
    '✅ Thread-safe implementation',
    '✅ Prevent reflection attacks'
  ],
  factory: [
    '✅ Product interface/abstract class',
    '✅ Concrete product implementations', 
    '✅ Factory method in creator class',
    '✅ Concrete creator implementations',
    '✅ Client uses factory, not constructors'
  ],
  observer: [
    '✅ Observer interface',
    '✅ Subject interface',
    '✅ Concrete observers',
    '✅ Concrete subject',
    '✅ Register/unregister mechanism'
  ],
  strategy: [
    '✅ Strategy interface',
    '✅ Concrete strategy implementations',
    '✅ Context class',
    '✅ Runtime strategy switching',
    '✅ Algorithm isolation'
  ]
};

// ===== BONUS CHALLENGES =====

// BONUS 1: Implement a Thread-Safe Singleton with lazy initialization
export class LazySingleton {
  // Challenge: Implement with lazy loading and thread safety
}

// BONUS 2: Create a Generic Factory
export interface GenericFactory<T> {
  create(...args: any[]): T;
}

// BONUS 3: Implement Chain of Responsibility
export abstract class Handler {
  protected nextHandler?: Handler;

  public setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  public abstract handle(request: string): string | null;
}

// BONUS 4: Create a Memento Pattern for Undo/Redo
export interface Memento {
  getState(): any;
}

export class Originator {
  // Your memento implementation here
}

export default {
  ConfigurationManager,
  ConcreteDocumentFactory,
  Stock,
  Trader,
  SortContext,
  SimpleCoffee,
  RemoteControl,
  AudioPlayer,
  ComputerFacade,
  DataProcessor,
  PizzaBuilder,
  Directory,
  ProxyImage,
  runExerciseTests,
  implementationChecklist,
};