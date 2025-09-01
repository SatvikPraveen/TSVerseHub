// File: tests/concepts/patterns.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TypeScript Design Patterns', () => {
  describe('Singleton Pattern', () => {
    it('should implement singleton pattern', () => {
      class DatabaseConnection {
        private static instance: DatabaseConnection;
        private connectionString: string;
        private isConnected: boolean = false;
        
        private constructor() {
          this.connectionString = 'default-connection';
        }
        
        public static getInstance(): DatabaseConnection {
          if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
          }
          return DatabaseConnection.instance;
        }
        
        connect(): void {
          if (!this.isConnected) {
            this.isConnected = true;
            console.log('Connected to database');
          }
        }
        
        disconnect(): void {
          if (this.isConnected) {
            this.isConnected = false;
            console.log('Disconnected from database');
          }
        }
        
        isConnectionActive(): boolean {
          return this.isConnected;
        }
        
        getConnectionString(): string {
          return this.connectionString;
        }
      }
      
      const db1 = DatabaseConnection.getInstance();
      const db2 = DatabaseConnection.getInstance();
      
      expect(db1).toBe(db2); // Same instance
      expect(db1.getConnectionString()).toBe('default-connection');
      
      db1.connect();
      expect(db2.isConnectionActive()).toBe(true); // Both references point to same instance
    });
  });

  describe('Factory Pattern', () => {
    it('should implement factory pattern', () => {
      interface Animal {
        makeSound(): string;
        getType(): string;
      }
      
      class Dog implements Animal {
        makeSound(): string {
          return 'Woof!';
        }
        
        getType(): string {
          return 'Dog';
        }
      }
      
      class Cat implements Animal {
        makeSound(): string {
          return 'Meow!';
        }
        
        getType(): string {
          return 'Cat';
        }
      }
      
      class Bird implements Animal {
        makeSound(): string {
          return 'Tweet!';
        }
        
        getType(): string {
          return 'Bird';
        }
      }
      
      type AnimalType = 'dog' | 'cat' | 'bird';
      
      class AnimalFactory {
        static createAnimal(type: AnimalType): Animal {
          switch (type) {
            case 'dog':
              return new Dog();
            case 'cat':
              return new Cat();
            case 'bird':
              return new Bird();
            default:
              throw new Error(`Unknown animal type: ${type}`);
          }
        }
      }
      
      const dog = AnimalFactory.createAnimal('dog');
      const cat = AnimalFactory.createAnimal('cat');
      const bird = AnimalFactory.createAnimal('bird');
      
      expect(dog.makeSound()).toBe('Woof!');
      expect(cat.makeSound()).toBe('Meow!');
      expect(bird.makeSound()).toBe('Tweet!');
      
      expect(dog.getType()).toBe('Dog');
      expect(cat.getType()).toBe('Cat');
      expect(bird.getType()).toBe('Bird');
    });

    it('should implement abstract factory pattern', () => {
      interface Button {
        render(): string;
        onClick(): void;
      }
      
      interface Dialog {
        render(): string;
        show(): void;
      }
      
      // Windows implementations
      class WindowsButton implements Button {
        render(): string {
          return 'Windows Button';
        }
        
        onClick(): void {
          console.log('Windows button clicked');
        }
      }
      
      class WindowsDialog implements Dialog {
        render(): string {
          return 'Windows Dialog';
        }
        
        show(): void {
          console.log('Showing Windows dialog');
        }
      }
      
      // Mac implementations
      class MacButton implements Button {
        render(): string {
          return 'Mac Button';
        }
        
        onClick(): void {
          console.log('Mac button clicked');
        }
      }
      
      class MacDialog implements Dialog {
        render(): string {
          return 'Mac Dialog';
        }
        
        show(): void {
          console.log('Showing Mac dialog');
        }
      }
      
      // Abstract factory
      interface UIFactory {
        createButton(): Button;
        createDialog(): Dialog;
      }
      
      class WindowsUIFactory implements UIFactory {
        createButton(): Button {
          return new WindowsButton();
        }
        
        createDialog(): Dialog {
          return new WindowsDialog();
        }
      }
      
      class MacUIFactory implements UIFactory {
        createButton(): Button {
          return new MacButton();
        }
        
        createDialog(): Dialog {
          return new MacDialog();
        }
      }
      
      function createUI(factory: UIFactory): { button: Button; dialog: Dialog } {
        return {
          button: factory.createButton(),
          dialog: factory.createDialog()
        };
      }
      
      const windowsUI = createUI(new WindowsUIFactory());
      const macUI = createUI(new MacUIFactory());
      
      expect(windowsUI.button.render()).toBe('Windows Button');
      expect(windowsUI.dialog.render()).toBe('Windows Dialog');
      expect(macUI.button.render()).toBe('Mac Button');
      expect(macUI.dialog.render()).toBe('Mac Dialog');
    });
  });

  describe('Observer Pattern', () => {
    it('should implement observer pattern', () => {
      interface Observer<T> {
        update(data: T): void;
      }
      
      interface Subject<T> {
        subscribe(observer: Observer<T>): void;
        unsubscribe(observer: Observer<T>): void;
        notify(data: T): void;
      }
      
      class EventEmitter<T> implements Subject<T> {
        private observers: Observer<T>[] = [];
        
        subscribe(observer: Observer<T>): void {
          this.observers.push(observer);
        }
        
        unsubscribe(observer: Observer<T>): void {
          const index = this.observers.indexOf(observer);
          if (index > -1) {
            this.observers.splice(index, 1);
          }
        }
        
        notify(data: T): void {
          for (const observer of this.observers) {
            observer.update(data);
          }
        }
      }
      
      interface NewsData {
        title: string;
        content: string;
        timestamp: Date;
      }
      
      class NewsSubscriber implements Observer<NewsData> {
        constructor(private name: string) {}
        
        update(news: NewsData): void {
          console.log(`${this.name} received news: ${news.title}`);
        }
        
        getName(): string {
          return this.name;
        }
      }
      
      const newsChannel = new EventEmitter<NewsData>();
      const subscriber1 = new NewsSubscriber('Alice');
      const subscriber2 = new NewsSubscriber('Bob');
      
      // Mock console.log to verify calls
      const consoleSpy = vi.spyOn(console, 'log');
      
      newsChannel.subscribe(subscriber1);
      newsChannel.subscribe(subscriber2);
      
      const news: NewsData = {
        title: 'Breaking News',
        content: 'Important announcement',
        timestamp: new Date()
      };
      
      newsChannel.notify(news);
      
      expect(consoleSpy).toHaveBeenCalledWith('Alice received news: Breaking News');
      expect(consoleSpy).toHaveBeenCalledWith('Bob received news: Breaking News');
      
      newsChannel.unsubscribe(subscriber1);
      consoleSpy.mockClear();
      
      newsChannel.notify(news);
      
      expect(consoleSpy).toHaveBeenCalledWith('Bob received news: Breaking News');
      expect(consoleSpy).not.toHaveBeenCalledWith('Alice received news: Breaking News');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Strategy Pattern', () => {
    it('should implement strategy pattern', () => {
      interface SortStrategy<T> {
        sort(data: T[]): T[];
      }
      
      class BubbleSortStrategy<T> implements SortStrategy<T> {
        sort(data: T[]): T[] {
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
        sort(data: T[]): T[] {
          if (data.length <= 1) return [...data];
          
          const pivot = data[Math.floor(data.length / 2)];
          const less = data.filter(item => item < pivot);
          const equal = data.filter(item => item === pivot);
          const greater = data.filter(item => item > pivot);
          
          return [
            ...this.sort(less),
            ...equal,
            ...this.sort(greater)
          ];
        }
      }
      
      class SortContext<T> {
        private strategy: SortStrategy<T>;
        
        constructor(strategy: SortStrategy<T>) {
          this.strategy = strategy;
        }
        
        setStrategy(strategy: SortStrategy<T>): void {
          this.strategy = strategy;
        }
        
        sort(data: T[]): T[] {
          return this.strategy.sort(data);
        }
      }
      
      const data = [64, 34, 25, 12, 22, 11, 90];
      const expected = [11, 12, 22, 25, 34, 64, 90];
      
      const bubbleSort = new BubbleSortStrategy<number>();
      const quickSort = new QuickSortStrategy<number>();
      
      const sorter = new SortContext(bubbleSort);
      const bubbleSortResult = sorter.sort(data);
      
      sorter.setStrategy(quickSort);
      const quickSortResult = sorter.sort(data);
      
      expect(bubbleSortResult).toEqual(expected);
      expect(quickSortResult).toEqual(expected);
    });
  });

  describe('Decorator Pattern', () => {
    it('should implement decorator pattern', () => {
      interface Coffee {
        getDescription(): string;
        getCost(): number;
      }
      
      class SimpleCoffee implements Coffee {
        getDescription(): string {
          return 'Simple coffee';
        }
        
        getCost(): number {
          return 5;
        }
      }
      
      abstract class CoffeeDecorator implements Coffee {
        protected coffee: Coffee;
        
        constructor(coffee: Coffee) {
          this.coffee = coffee;
        }
        
        getDescription(): string {
          return this.coffee.getDescription();
        }
        
        getCost(): number {
          return this.coffee.getCost();
        }
      }
      
      class MilkDecorator extends CoffeeDecorator {
        getDescription(): string {
          return `${this.coffee.getDescription()}, milk`;
        }
        
        getCost(): number {
          return this.coffee.getCost() + 2;
        }
      }
      
      class SugarDecorator extends CoffeeDecorator {
        getDescription(): string {
          return `${this.coffee.getDescription()}, sugar`;
        }
        
        getCost(): number {
          return this.coffee.getCost() + 1;
        }
      }
      
      class VanillaDecorator extends CoffeeDecorator {
        getDescription(): string {
          return `${this.coffee.getDescription()}, vanilla`;
        }
        
        getCost(): number {
          return this.coffee.getCost() + 3;
        }
      }
      
      let coffee: Coffee = new SimpleCoffee();
      expect(coffee.getDescription()).toBe('Simple coffee');
      expect(coffee.getCost()).toBe(5);
      
      coffee = new MilkDecorator(coffee);
      expect(coffee.getDescription()).toBe('Simple coffee, milk');
      expect(coffee.getCost()).toBe(7);
      
      coffee = new SugarDecorator(coffee);
      expect(coffee.getDescription()).toBe('Simple coffee, milk, sugar');
      expect(coffee.getCost()).toBe(8);
      
      coffee = new VanillaDecorator(coffee);
      expect(coffee.getDescription()).toBe('Simple coffee, milk, sugar, vanilla');
      expect(coffee.getCost()).toBe(11);
    });
  });

  describe('Command Pattern', () => {
    it('should implement command pattern', () => {
      interface Command {
        execute(): void;
        undo(): void;
      }
      
      class Light {
        private isOn: boolean = false;
        
        turnOn(): void {
          this.isOn = true;
          console.log('Light is ON');
        }
        
        turnOff(): void {
          this.isOn = false;
          console.log('Light is OFF');
        }
        
        getState(): boolean {
          return this.isOn;
        }
      }
      
      class LightOnCommand implements Command {
        constructor(private light: Light) {}
        
        execute(): void {
          this.light.turnOn();
        }
        
        undo(): void {
          this.light.turnOff();
        }
      }
      
      class LightOffCommand implements Command {
        constructor(private light: Light) {}
        
        execute(): void {
          this.light.turnOff();
        }
        
        undo(): void {
          this.light.turnOn();
        }
      }
      
      class RemoteControl {
        private commands: Command[] = [];
        private currentIndex: number = -1;
        
        setCommand(command: Command): void {
          this.commands.push(command);
        }
        
        executeCommand(index: number): void {
          if (index >= 0 && index < this.commands.length) {
            this.commands[index].execute();
            this.currentIndex = index;
          }
        }
        
        undo(): void {
          if (this.currentIndex >= 0) {
            this.commands[this.currentIndex].undo();
            this.currentIndex = -1;
          }
        }
      }
      
      const light = new Light();
      const lightOnCommand = new LightOnCommand(light);
      const lightOffCommand = new LightOffCommand(light);
      
      const remote = new RemoteControl();
      remote.setCommand(lightOnCommand); // index 0
      remote.setCommand(lightOffCommand); // index 1
      
      expect(light.getState()).toBe(false);
      
      remote.executeCommand(0); // Turn on
      expect(light.getState()).toBe(true);
      
      remote.executeCommand(1); // Turn off
      expect(light.getState()).toBe(false);
      
      remote.undo(); // Undo turn off (turn on)
      expect(light.getState()).toBe(true);
    });
  });

  describe('Builder Pattern', () => {
    it('should implement builder pattern', () => {
      class Computer {
        private cpu?: string;
        private ram?: number;
        private storage?: string;
        private gpu?: string;
        private os?: string;
        
        setCpu(cpu: string): void {
          this.cpu = cpu;
        }
        
        setRam(ram: number): void {
          this.ram = ram;
        }
        
        setStorage(storage: string): void {
          this.storage = storage;
        }
        
        setGpu(gpu: string): void {
          this.gpu = gpu;
        }
        
        setOs(os: string): void {
          this.os = os;
        }
        
        getSpecs(): string {
          return `CPU: ${this.cpu}, RAM: ${this.ram}GB, Storage: ${this.storage}, GPU: ${this.gpu}, OS: ${this.os}`;
        }
      }
      
      class ComputerBuilder {
        private computer: Computer;
        
        constructor() {
          this.computer = new Computer();
        }
        
        addCpu(cpu: string): ComputerBuilder {
          this.computer.setCpu(cpu);
          return this;
        }
        
        addRam(ram: number): ComputerBuilder {
          this.computer.setRam(ram);
          return this;
        }
        
        addStorage(storage: string): ComputerBuilder {
          this.computer.setStorage(storage);
          return this;
        }
        
        addGpu(gpu: string): ComputerBuilder {
          this.computer.setGpu(gpu);
          return this;
        }
        
        addOs(os: string): ComputerBuilder {
          this.computer.setOs(os);
          return this;
        }
        
        build(): Computer {
          return this.computer;
        }
      }
      
      const computer = new ComputerBuilder()
        .addCpu('Intel i7-12700K')
        .addRam(32)
        .addStorage('1TB NVMe SSD')
        .addGpu('RTX 4080')
        .addOs('Windows 11')
        .build();
      
      const specs = computer.getSpecs();
      expect(specs).toContain('Intel i7-12700K');
      expect(specs).toContain('32GB');
      expect(specs).toContain('1TB NVMe SSD');
      expect(specs).toContain('RTX 4080');
      expect(specs).toContain('Windows 11');
    });
  });

  describe('Adapter Pattern', () => {
    it('should implement adapter pattern', () => {
      // Old system
      class OldPrinter {
        printOldFormat(text: string): void {
          console.log(`[OLD PRINTER] ${text}`);
        }
      }
      
      // New system interface
      interface ModernPrinter {
        print(document: Document): void;
      }
      
      interface Document {
        getTitle(): string;
        getContent(): string;
      }
      
      class SimpleDocument implements Document {
        constructor(private title: string, private content: string) {}
        
        getTitle(): string {
          return this.title;
        }
        
        getContent(): string {
          return this.content;
        }
      }
      
      // Adapter
      class PrinterAdapter implements ModernPrinter {
        constructor(private oldPrinter: OldPrinter) {}
        
        print(document: Document): void {
          const formattedText = `${document.getTitle()}: ${document.getContent()}`;
          this.oldPrinter.printOldFormat(formattedText);
        }
      }
      
      const oldPrinter = new OldPrinter();
      const adapter = new PrinterAdapter(oldPrinter);
      
      const document = new SimpleDocument('Test Document', 'This is the content');
      
      const consoleSpy = vi.spyOn(console, 'log');
      
      adapter.print(document);
      
      expect(consoleSpy).toHaveBeenCalledWith('[OLD PRINTER] Test Document: This is the content');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Facade Pattern', () => {
    it('should implement facade pattern', () => {
      class AudioCodec {
        decode(filename: string): string {
          return `Decoded audio: ${filename}`;
        }
      }
      
      class VideoCodec {
        decode(filename: string): string {
          return `Decoded video: ${filename}`;
        }
      }
      
      class CompressionCodec {
        decompress(data: string): string {
          return `Decompressed: ${data}`;
        }
      }
      
      class BitrateReader {
        read(filename: string): string {
          return `Bitrate data for: ${filename}`;
        }
      }
      
      // Facade
      class VideoConverter {
        private audioCodec = new AudioCodec();
        private videoCodec = new VideoCodec();
        private compressionCodec = new CompressionCodec();
        private bitrateReader = new BitrateReader();
        
        convert(filename: string, format: string): string {
          const steps: string[] = [];
          
          steps.push(this.bitrateReader.read(filename));
          steps.push(this.audioCodec.decode(filename));
          steps.push(this.videoCodec.decode(filename));
          steps.push(this.compressionCodec.decompress(`${filename}.${format}`));
          steps.push(`Converted to ${format}`);
          
          return steps.join(' -> ');
        }
      }
      
      const converter = new VideoConverter();
      const result = converter.convert('movie.mp4', 'avi');
      
      expect(result).toContain('Bitrate data for: movie.mp4');
      expect(result).toContain('Decoded audio: movie.mp4');
      expect(result).toContain('Decoded video: movie.mp4');
      expect(result).toContain('Converted to avi');
    });
  });

  describe('State Pattern', () => {
    it('should implement state pattern', () => {
      interface State {
        insertCoin(): void;
        selectItem(): void;
        dispenseItem(): void;
      }
      
      class VendingMachine {
        private noCoinState: State;
        private hasCoinState: State;
        private soldState: State;
        private currentState: State;
        private items: number = 10;
        
        constructor() {
          this.noCoinState = new NoCoinState(this);
          this.hasCoinState = new HasCoinState(this);
          this.soldState = new SoldState(this);
          this.currentState = this.noCoinState;
        }
        
        insertCoin(): void {
          this.currentState.insertCoin();
        }
        
        selectItem(): void {
          this.currentState.selectItem();
        }
        
        dispenseItem(): void {
          this.currentState.dispenseItem();
        }
        
        setState(state: State): void {
          this.currentState = state;
        }
        
        getNoCoinState(): State {
          return this.noCoinState;
        }
        
        getHasCoinState(): State {
          return this.hasCoinState;
        }
        
        getSoldState(): State {
          return this.soldState;
        }
        
        getItemCount(): number {
          return this.items;
        }
        
        releaseItem(): void {
          if (this.items > 0) {
            this.items--;
            console.log('Item dispensed');
          }
        }
      }
      
      class NoCoinState implements State {
        constructor(private machine: VendingMachine) {}
        
        insertCoin(): void {
          console.log('Coin inserted');
          this.machine.setState(this.machine.getHasCoinState());
        }
        
        selectItem(): void {
          console.log('Please insert coin first');
        }
        
        dispenseItem(): void {
          console.log('Please insert coin first');
        }
      }
      
      class HasCoinState implements State {
        constructor(private machine: VendingMachine) {}
        
        insertCoin(): void {
          console.log('Coin already inserted');
        }
        
        selectItem(): void {
          console.log('Item selected');
          this.machine.setState(this.machine.getSoldState());
        }
        
        dispenseItem(): void {
          console.log('Please select item first');
        }
      }
      
      class SoldState implements State {
        constructor(private machine: VendingMachine) {}
        
        insertCoin(): void {
          console.log('Please wait, dispensing item');
        }
        
        selectItem(): void {
          console.log('Please wait, dispensing item');
        }
        
        dispenseItem(): void {
          this.machine.releaseItem();
          this.machine.setState(this.machine.getNoCoinState());
        }
      }
      
      const vendingMachine = new VendingMachine();
      const initialItems = vendingMachine.getItemCount();
      
      vendingMachine.selectItem(); // Should ask for coin
      vendingMachine.insertCoin();
      vendingMachine.selectItem();
      vendingMachine.dispenseItem();
      
      expect(vendingMachine.getItemCount()).toBe(initialItems - 1);
    });
  });

  describe('Chain of Responsibility Pattern', () => {
    it('should implement chain of responsibility pattern', () => {
      abstract class Handler {
        protected nextHandler?: Handler;
        
        setNext(handler: Handler): Handler {
          this.nextHandler = handler;
          return handler;
        }
        
        abstract handle(request: string): string | null;
        
        protected handleNext(request: string): string | null {
          if (this.nextHandler) {
            return this.nextHandler.handle(request);
          }
          return null;
        }
      }
      
      class AuthenticationHandler extends Handler {
        handle(request: string): string | null {
          if (request.includes('auth:')) {
            return `Authentication handled: ${request}`;
          }
          return this.handleNext(request);
        }
      }
      
      class AuthorizationHandler extends Handler {
        handle(request: string): string | null {
          if (request.includes('auth:') && request.includes('role:admin')) {
            return `Authorization handled: ${request}`;
          }
          return this.handleNext(request);
        }
      }
      
      class ValidationHandler extends Handler {
        handle(request: string): string | null {
          if (request.includes('validate:')) {
            return `Validation handled: ${request}`;
          }
          return this.handleNext(request);
        }
      }
      
      class LoggingHandler extends Handler {
        handle(request: string): string | null {
          if (request.includes('log:')) {
            return `Logging handled: ${request}`;
          }
          return this.handleNext(request);
        }
      }
      
      const auth = new AuthenticationHandler();
      const authz = new AuthorizationHandler();
      const validation = new ValidationHandler();
      const logging = new LoggingHandler();
      
      // Chain: auth -> authz -> validation -> logging
      auth.setNext(authz).setNext(validation).setNext(logging);
      
      const result1 = auth.handle('auth: login user');
      const result2 = auth.handle('validate: user input');
      const result3 = auth.handle('log: system event');
      const result4 = auth.handle('unknown: request');
      
      expect(result1).toBe('Authentication handled: auth: login user');
      expect(result2).toBe('Validation handled: validate: user input');
      expect(result3).toBe('Logging handled: log: system event');
      expect(result4).toBeNull(); // No handler found
    });
  });

  describe('Template Method Pattern', () => {
    it('should implement template method pattern', () => {
      abstract class DataProcessor {
        // Template method
        public process(data: string): string {
          const loaded = this.loadData(data);
          const processed = this.processData(loaded);
          const saved = this.saveData(processed);
          return saved;
        }
        
        protected abstract loadData(data: string): string;
        protected abstract processData(data: string): string;
        protected abstract saveData(data: string): string;
      }
      
      class CSVProcessor extends DataProcessor {
        protected loadData(data: string): string {
          return `CSV loaded: ${data}`;
        }
        
        protected processData(data: string): string {
          return `${data} -> CSV processed`;
        }
        
        protected saveData(data: string): string {
          return `${data} -> CSV saved`;
        }
      }
      
      class XMLProcessor extends DataProcessor {
        protected loadData(data: string): string {
          return `XML loaded: ${data}`;
        }
        
        protected processData(data: string): string {
          return `${data} -> XML processed`;
        }
        
        protected saveData(data: string): string {
          return `${data} -> XML saved`;
        }
      }
      
      const csvProcessor = new CSVProcessor();
      const xmlProcessor = new XMLProcessor();
      
      const csvResult = csvProcessor.process('data.csv');
      const xmlResult = xmlProcessor.process('data.xml');
      
      expect(csvResult).toBe('CSV loaded: data.csv -> CSV processed -> CSV saved');
      expect(xmlResult).toBe('XML loaded: data.xml -> XML processed -> XML saved');
    });
  });

  describe('Proxy Pattern', () => {
    it('should implement proxy pattern', () => {
      interface Image {
        display(): string;
      }
      
      class RealImage implements Image {
        private filename: string;
        
        constructor(filename: string) {
          this.filename = filename;
          this.loadFromDisk();
        }
        
        private loadFromDisk(): void {
          console.log(`Loading image: ${this.filename}`);
        }
        
        display(): string {
          return `Displaying image: ${this.filename}`;
        }
      }
      
      class ImageProxy implements Image {
        private realImage?: RealImage;
        private filename: string;
        
        constructor(filename: string) {
          this.filename = filename;
        }
        
        display(): string {
          if (!this.realImage) {
            this.realImage = new RealImage(this.filename);
          }
          return this.realImage.display();
        }
      }
      
      const consoleSpy = vi.spyOn(console, 'log');
      
      const imageProxy = new ImageProxy('test.jpg');
      
      // Image should not be loaded yet
      expect(consoleSpy).not.toHaveBeenCalled();
      
      // First display - should load the image
      const result1 = imageProxy.display();
      expect(consoleSpy).toHaveBeenCalledWith('Loading image: test.jpg');
      expect(result1).toBe('Displaying image: test.jpg');
      
      consoleSpy.mockClear();
      
      // Second display - should not reload
      const result2 = imageProxy.display();
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(result2).toBe('Displaying image: test.jpg');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Composite Pattern', () => {
    it('should implement composite pattern', () => {
      interface FileSystemComponent {
        getName(): string;
        getSize(): number;
        display(indent: string): string;
      }
      
      class File implements FileSystemComponent {
        constructor(private name: string, private size: number) {}
        
        getName(): string {
          return this.name;
        }
        
        getSize(): number {
          return this.size;
        }
        
        display(indent: string = ''): string {
          return `${indent}File: ${this.name} (${this.size} bytes)`;
        }
      }
      
      class Directory implements FileSystemComponent {
        private children: FileSystemComponent[] = [];
        
        constructor(private name: string) {}
        
        getName(): string {
          return this.name;
        }
        
        add(component: FileSystemComponent): void {
          this.children.push(component);
        }
        
        remove(component: FileSystemComponent): void {
          const index = this.children.indexOf(component);
          if (index > -1) {
            this.children.splice(index, 1);
          }
        }
        
        getSize(): number {
          return this.children.reduce((total, child) => total + child.getSize(), 0);
        }
        
        display(indent: string = ''): string {
          let result = `${indent}Directory: ${this.name} (${this.getSize()} bytes total)\n`;
          
          for (const child of this.children) {
            result += child.display(indent + '  ') + '\n';
          }
          
          return result.trim();
        }
      }
      
      const root = new Directory('root');
      const documents = new Directory('documents');
      const images = new Directory('images');
      
      const file1 = new File('readme.txt', 1024);
      const file2 = new File('config.json', 512);
      const file3 = new File('photo.jpg', 2048);
      const file4 = new File('logo.png', 1536);
      
      documents.add(file1);
      documents.add(file2);
      images.add(file3);
      images.add(file4);
      
      root.add(documents);
      root.add(images);
      
      expect(root.getSize()).toBe(5120); // 1024 + 512 + 2048 + 1536
      expect(documents.getSize()).toBe(1536); // 1024 + 512
      expect(images.getSize()).toBe(3584); // 2048 + 1536
      
      const display = root.display();
      expect(display).toContain('Directory: root');
      expect(display).toContain('Directory: documents');
      expect(display).toContain('File: readme.txt');
      expect(display).toContain('File: photo.jpg');
    });
  });

  describe('Iterator Pattern', () => {
    it('should implement iterator pattern', () => {
      interface Iterator<T> {
        hasNext(): boolean;
        next(): T | null;
        current(): T | null;
      }
      
      interface Iterable<T> {
        createIterator(): Iterator<T>;
      }
      
      class ArrayIterator<T> implements Iterator<T> {
        private index: number = 0;
        
        constructor(private items: T[]) {}
        
        hasNext(): boolean {
          return this.index < this.items.length;
        }
        
        next(): T | null {
          if (this.hasNext()) {
            return this.items[this.index++];
          }
          return null;
        }
        
        current(): T | null {
          if (this.index > 0 && this.index <= this.items.length) {
            return this.items[this.index - 1];
          }
          return null;
        }
      }
      
      class CustomCollection<T> implements Iterable<T> {
        private items: T[] = [];
        
        add(item: T): void {
          this.items.push(item);
        }
        
        remove(item: T): void {
          const index = this.items.indexOf(item);
          if (index > -1) {
            this.items.splice(index, 1);
          }
        }
        
        createIterator(): Iterator<T> {
          return new ArrayIterator(this.items);
        }
        
        size(): number {
          return this.items.length;
        }
      }
      
      const collection = new CustomCollection<string>();
      collection.add('first');
      collection.add('second');
      collection.add('third');
      
      const iterator = collection.createIterator();
      const results: string[] = [];
      
      while (iterator.hasNext()) {
        const item = iterator.next();
        if (item !== null) {
          results.push(item);
        }
      }
      
      expect(results).toEqual(['first', 'second', 'third']);
      expect(iterator.hasNext()).toBe(false);
      expect(iterator.next()).toBeNull();
    });
  });

  describe('Mediator Pattern', () => {
    it('should implement mediator pattern', () => {
      interface Mediator {
        notify(sender: Component, event: string): void;
      }
      
      abstract class Component {
        protected mediator: Mediator;
        
        constructor(mediator: Mediator) {
          this.mediator = mediator;
        }
      }
      
      class Button extends Component {
        click(): void {
          console.log('Button clicked');
          this.mediator.notify(this, 'click');
        }
      }
      
      class Textbox extends Component {
        private value: string = '';
        
        setValue(value: string): void {
          this.value = value;
          this.mediator.notify(this, 'change');
        }
        
        getValue(): string {
          return this.value;
        }
      }
      
      class Checkbox extends Component {
        private checked: boolean = false;
        
        setChecked(checked: boolean): void {
          this.checked = checked;
          this.mediator.notify(this, 'toggle');
        }
        
        isChecked(): boolean {
          return this.checked;
        }
      }
      
      class DialogMediator implements Mediator {
        private button: Button;
        private textbox: Textbox;
        private checkbox: Checkbox;
        private submitted: boolean = false;
        
        constructor() {
          this.button = new Button(this);
          this.textbox = new Textbox(this);
          this.checkbox = new Checkbox(this);
        }
        
        notify(sender: Component, event: string): void {
          if (sender === this.button && event === 'click') {
            this.handleSubmit();
          } else if (sender === this.textbox && event === 'change') {
            this.validateForm();
          } else if (sender === this.checkbox && event === 'toggle') {
            this.updateButtonState();
          }
        }
        
        private handleSubmit(): void {
          if (this.checkbox.isChecked() && this.textbox.getValue().length > 0) {
            this.submitted = true;
            console.log('Form submitted');
          } else {
            console.log('Form validation failed');
          }
        }
        
        private validateForm(): void {
          console.log('Form validated');
        }
        
        private updateButtonState(): void {
          console.log('Button state updated');
        }
        
        getButton(): Button {
          return this.button;
        }
        
        getTextbox(): Textbox {
          return this.textbox;
        }
        
        getCheckbox(): Checkbox {
          return this.checkbox;
        }
        
        isSubmitted(): boolean {
          return this.submitted;
        }
      }
      
      const dialog = new DialogMediator();
      const consoleSpy = vi.spyOn(console, 'log');
      
      // Initial state - form should not be submittable
      dialog.getButton().click();
      expect(consoleSpy).toHaveBeenCalledWith('Form validation failed');
      expect(dialog.isSubmitted()).toBe(false);
      
      // Add text and check checkbox
      dialog.getTextbox().setValue('test');
      dialog.getCheckbox().setChecked(true);
      
      // Now form should be submittable
      consoleSpy.mockClear();
      dialog.getButton().click();
      expect(consoleSpy).toHaveBeenCalledWith('Form submitted');
      expect(dialog.isSubmitted()).toBe(true);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Visitor Pattern', () => {
    it('should implement visitor pattern', () => {
      interface Visitor {
        visitCircle(circle: Circle): number;
        visitRectangle(rectangle: Rectangle): number;
        visitTriangle(triangle: Triangle): number;
      }
      
      interface Shape {
        accept(visitor: Visitor): number;
      }
      
      class Circle implements Shape {
        constructor(private radius: number) {}
        
        getRadius(): number {
          return this.radius;
        }
        
        accept(visitor: Visitor): number {
          return visitor.visitCircle(this);
        }
      }
      
      class Rectangle implements Shape {
        constructor(private width: number, private height: number) {}
        
        getWidth(): number {
          return this.width;
        }
        
        getHeight(): number {
          return this.height;
        }
        
        accept(visitor: Visitor): number {
          return visitor.visitRectangle(this);
        }
      }
      
      class Triangle implements Shape {
        constructor(private base: number, private height: number) {}
        
        getBase(): number {
          return this.base;
        }
        
        getHeight(): number {
          return this.height;
        }
        
        accept(visitor: Visitor): number {
          return visitor.visitTriangle(this);
        }
      }
      
      class AreaCalculator implements Visitor {
        visitCircle(circle: Circle): number {
          return Math.PI * circle.getRadius() * circle.getRadius();
        }
        
        visitRectangle(rectangle: Rectangle): number {
          return rectangle.getWidth() * rectangle.getHeight();
        }
        
        visitTriangle(triangle: Triangle): number {
          return 0.5 * triangle.getBase() * triangle.getHeight();
        }
      }
      
      class PerimeterCalculator implements Visitor {
        visitCircle(circle: Circle): number {
          return 2 * Math.PI * circle.getRadius();
        }
        
        visitRectangle(rectangle: Rectangle): number {
          return 2 * (rectangle.getWidth() + rectangle.getHeight());
        }
        
        visitTriangle(triangle: Triangle): number {
          // Assuming equilateral triangle for simplicity
          return 3 * triangle.getBase();
        }
      }
      
      const shapes: Shape[] = [
        new Circle(5),
        new Rectangle(10, 6),
        new Triangle(8, 6)
      ];
      
      const areaCalculator = new AreaCalculator();
      const perimeterCalculator = new PerimeterCalculator();
      
      const areas = shapes.map(shape => shape.accept(areaCalculator));
      const perimeters = shapes.map(shape => shape.accept(perimeterCalculator));
      
      expect(areas[0]).toBeCloseTo(78.54, 2); // Circle area
      expect(areas[1]).toBe(60); // Rectangle area
      expect(areas[2]).toBe(24); // Triangle area
      
      expect(perimeters[0]).toBeCloseTo(31.42, 2); // Circle perimeter
      expect(perimeters[1]).toBe(32); // Rectangle perimeter
      expect(perimeters[2]).toBe(24); // Triangle perimeter
    });
  });

  describe('Memento Pattern', () => {
    it('should implement memento pattern', () => {
      class Memento {
        constructor(private state: string, private timestamp: Date) {}
        
        getState(): string {
          return this.state;
        }
        
        getTimestamp(): Date {
          return this.timestamp;
        }
      }
      
      class TextEditor {
        private content: string = '';
        
        write(text: string): void {
          this.content += text;
        }
        
        getContent(): string {
          return this.content;
        }
        
        save(): Memento {
          return new Memento(this.content, new Date());
        }
        
        restore(memento: Memento): void {
          this.content = memento.getState();
        }
        
        clear(): void {
          this.content = '';
        }
      }
      
      class History {
        private mementos: Memento[] = [];
        
        push(memento: Memento): void {
          this.mementos.push(memento);
        }
        
        pop(): Memento | undefined {
          return this.mementos.pop();
        }
        
        size(): number {
          return this.mementos.length;
        }
      }
      
      const editor = new TextEditor();
      const history = new History();
      
      editor.write('Hello ');
      history.push(editor.save());
      
      editor.write('World');
      history.push(editor.save());
      
      editor.write('!');
      
      expect(editor.getContent()).toBe('Hello World!');
      
      // Restore to previous state
      const lastSave = history.pop();
      if (lastSave) {
        editor.restore(lastSave);
      }
      expect(editor.getContent()).toBe('Hello World');
      
      // Restore to first state
      const firstSave = history.pop();
      if (firstSave) {
        editor.restore(firstSave);
      }
      expect(editor.getContent()).toBe('Hello ');
      
      expect(history.size()).toBe(0);
    });
  });
});