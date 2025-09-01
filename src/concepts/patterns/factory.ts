// File: concepts/patterns/factory.ts

/**
 * FACTORY PATTERN
 * 
 * The Factory pattern provides an interface for creating objects without
 * specifying their exact classes. It encapsulates object creation logic
 * and makes code more flexible and maintainable.
 */

// ===== SIMPLE FACTORY =====

export enum VehicleType {
  CAR = 'car',
  TRUCK = 'truck',
  MOTORCYCLE = 'motorcycle',
}

export interface Vehicle {
  type: VehicleType;
  wheels: number;
  capacity: number;
  start(): void;
  stop(): void;
  getInfo(): string;
}

export class Car implements Vehicle {
  type = VehicleType.CAR;
  wheels = 4;
  capacity = 5;

  start(): void {
    console.log('Car engine started');
  }

  stop(): void {
    console.log('Car engine stopped');
  }

  getInfo(): string {
    return `${this.type}: ${this.wheels} wheels, capacity: ${this.capacity}`;
  }
}

export class Truck implements Vehicle {
  type = VehicleType.TRUCK;
  wheels = 8;
  capacity = 2;

  start(): void {
    console.log('Truck engine started');
  }

  stop(): void {
    console.log('Truck engine stopped');
  }

  getInfo(): string {
    return `${this.type}: ${this.wheels} wheels, capacity: ${this.capacity}`;
  }
}

export class Motorcycle implements Vehicle {
  type = VehicleType.MOTORCYCLE;
  wheels = 2;
  capacity = 2;

  start(): void {
    console.log('Motorcycle engine started');
  }

  stop(): void {
    console.log('Motorcycle engine stopped');
  }

  getInfo(): string {
    return `${this.type}: ${this.wheels} wheels, capacity: ${this.capacity}`;
  }
}

// Simple Factory
export class VehicleFactory {
  public static createVehicle(type: VehicleType): Vehicle {
    switch (type) {
      case VehicleType.CAR:
        return new Car();
      case VehicleType.TRUCK:
        return new Truck();
      case VehicleType.MOTORCYCLE:
        return new Motorcycle();
      default:
        throw new Error(`Vehicle type ${type} is not supported`);
    }
  }
}

// ===== FACTORY METHOD PATTERN =====

export interface Product {
  name: string;
  price: number;
  category: string;
  getDescription(): string;
}

export class Book implements Product {
  name: string;
  price: number;
  category = 'Books';

  constructor(name: string, price: number, public author: string, public pages: number) {
    this.name = name;
    this.price = price;
  }

  getDescription(): string {
    return `${this.name} by ${this.author} (${this.pages} pages) - $${this.price}`;
  }
}

export class Electronics implements Product {
  name: string;
  price: number;
  category = 'Electronics';

  constructor(name: string, price: number, public brand: string, public warranty: number) {
    this.name = name;
    this.price = price;
  }

  getDescription(): string {
    return `${this.name} by ${this.brand} (${this.warranty}yr warranty) - $${this.price}`;
  }
}

export class Clothing implements Product {
  name: string;
  price: number;
  category = 'Clothing';

  constructor(name: string, price: number, public size: string, public material: string) {
    this.name = name;
    this.price = price;
  }

  getDescription(): string {
    return `${this.name} (Size ${this.size}, ${this.material}) - $${this.price}`;
  }
}

// Abstract Factory Creator
export abstract class ProductFactory {
  public abstract createProduct(...args: any[]): Product;

  public processOrder(product: Product): void {
    console.log(`Processing order for: ${product.getDescription()}`);
    console.log(`Category: ${product.category}`);
    console.log('Order completed successfully');
  }
}

// Concrete Factory Implementations
export class BookFactory extends ProductFactory {
  public createProduct(name: string, price: number, author: string, pages: number): Product {
    return new Book(name, price, author, pages);
  }
}

export class ElectronicsFactory extends ProductFactory {
  public createProduct(name: string, price: number, brand: string, warranty: number): Product {
    return new Electronics(name, price, brand, warranty);
  }
}

export class ClothingFactory extends ProductFactory {
  public createProduct(name: string, price: number, size: string, material: string): Product {
    return new Clothing(name, price, size, material);
  }
}

// ===== ABSTRACT FACTORY PATTERN =====

// Abstract Products
export interface Button {
  render(): string;
  onClick(): void;
}

export interface Checkbox {
  render(): string;
  toggle(): void;
}

export interface TextField {
  render(): string;
  setValue(value: string): void;
  getValue(): string;
}

// Windows Implementation
export class WindowsButton implements Button {
  render(): string {
    return '<button class="windows-btn">Windows Button</button>';
  }

  onClick(): void {
    console.log('Windows button clicked');
  }
}

export class WindowsCheckbox implements Checkbox {
  private checked = false;

  render(): string {
    return `<input type="checkbox" class="windows-checkbox" ${this.checked ? 'checked' : ''}>`;
  }

  toggle(): void {
    this.checked = !this.checked;
    console.log(`Windows checkbox ${this.checked ? 'checked' : 'unchecked'}`);
  }
}

export class WindowsTextField implements TextField {
  private value = '';

  render(): string {
    return `<input type="text" class="windows-textfield" value="${this.value}">`;
  }

  setValue(value: string): void {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}

// macOS Implementation
export class MacButton implements Button {
  render(): string {
    return '<button class="mac-btn">macOS Button</button>';
  }

  onClick(): void {
    console.log('macOS button clicked');
  }
}

export class MacCheckbox implements Checkbox {
  private checked = false;

  render(): string {
    return `<input type="checkbox" class="mac-checkbox" ${this.checked ? 'checked' : ''}>`;
  }

  toggle(): void {
    this.checked = !this.checked;
    console.log(`macOS checkbox ${this.checked ? 'checked' : 'unchecked'}`);
  }
}

export class MacTextField implements TextField {
  private value = '';

  render(): string {
    return `<input type="text" class="mac-textfield" value="${this.value}">`;
  }

  setValue(value: string): void {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}

// Abstract Factory
export interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
  createTextField(): TextField;
}

// Concrete Factories
export class WindowsUIFactory implements UIFactory {
  createButton(): Button {
    return new WindowsButton();
  }

  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }

  createTextField(): TextField {
    return new WindowsTextField();
  }
}

export class MacUIFactory implements UIFactory {
  createButton(): Button {
    return new MacButton();
  }

  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }

  createTextField(): TextField {
    return new MacTextField();
  }
}

// Client code that uses the abstract factory
export class Application {
  private factory: UIFactory;
  private button: Button;
  private checkbox: Checkbox;
  private textField: TextField;

  constructor(factory: UIFactory) {
    this.factory = factory;
    this.button = this.factory.createButton();
    this.checkbox = this.factory.createCheckbox();
    this.textField = this.factory.createTextField();
  }

  render(): string {
    return `
      ${this.button.render()}
      ${this.checkbox.render()}
      ${this.textField.render()}
    `;
  }

  interact(): void {
    this.button.onClick();
    this.checkbox.toggle();
    this.textField.setValue('Hello World');
  }
}

// ===== PARAMETRIZED FACTORY =====

export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(sql: string): Promise<T[]>;
  getType(): string;
}

export class MySQLConnection implements DatabaseConnection {
  constructor(private config: { host: string; port: number; database: string }) {}

  async connect(): Promise<void> {
    console.log(`Connecting to MySQL at ${this.config.host}:${this.config.port}`);
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting from MySQL');
  }

  async query<T>(sql: string): Promise<T[]> {
    console.log(`MySQL Query: ${sql}`);
    return [] as T[];
  }

  getType(): string {
    return 'MySQL';
  }
}

export class PostgreSQLConnection implements DatabaseConnection {
  constructor(private config: { host: string; port: number; database: string }) {}

  async connect(): Promise<void> {
    console.log(`Connecting to PostgreSQL at ${this.config.host}:${this.config.port}`);
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting from PostgreSQL');
  }

  async query<T>(sql: string): Promise<T[]> {
    console.log(`PostgreSQL Query: ${sql}`);
    return [] as T[];
  }

  getType(): string {
    return 'PostgreSQL';
  }
}

export class MongoDBConnection implements DatabaseConnection {
  constructor(private config: { host: string; port: number; database: string }) {}

  async connect(): Promise<void> {
    console.log(`Connecting to MongoDB at ${this.config.host}:${this.config.port}`);
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting from MongoDB');
  }

  async query<T>(sql: string): Promise<T[]> {
    console.log(`MongoDB Query: ${sql}`);
    return [] as T[];
  }

  getType(): string {
    return 'MongoDB';
  }
}

export type DatabaseType = 'mysql' | 'postgresql' | 'mongodb';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
}

export class DatabaseConnectionFactory {
  private static connectionCreators: Map<DatabaseType, (config: DatabaseConfig) => DatabaseConnection> = new Map([
    ['mysql', (config) => new MySQLConnection(config)],
    ['postgresql', (config) => new PostgreSQLConnection(config)],
    ['mongodb', (config) => new MongoDBConnection(config)],
  ]);

  public static createConnection(type: DatabaseType, config: DatabaseConfig): DatabaseConnection {
    const creator = this.connectionCreators.get(type);
    if (!creator) {
      throw new Error(`Database type ${type} is not supported`);
    }
    return creator(config);
  }

  public static registerConnectionType(
    type: DatabaseType, 
    creator: (config: DatabaseConfig) => DatabaseConnection
  ): void {
    this.connectionCreators.set(type, creator);
  }

  public static getSupportedTypes(): DatabaseType[] {
    return Array.from(this.connectionCreators.keys());
  }
}

// ===== GENERIC FACTORY =====

export interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

export class User implements Serializable {
  constructor(public id: number, public name: string, public email: string) {}

  serialize(): string {
    return JSON.stringify({ id: this.id, name: this.name, email: this.email });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.id = parsed.id;
    this.name = parsed.name;
    this.email = parsed.email;
  }
}

export class Order implements Serializable {
  constructor(public id: number, public userId: number, public total: number) {}

  serialize(): string {
    return JSON.stringify({ id: this.id, userId: this.userId, total: this.total });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.id = parsed.id;
    this.userId = parsed.userId;
    this.total = parsed.total;
  }
}

export type Constructor<T = {}> = new (...args: any[]) => T;

export class GenericFactory<T extends Serializable> {
  constructor(private ctor: Constructor<T>) {}

  create(...args: any[]): T {
    return new this.ctor(...args);
  }

  createFromData(data: string): T {
    const instance = new this.ctor();
    instance.deserialize(data);
    return instance;
  }

  createBatch(items: any[][]): T[] {
    return items.map(args => new this.ctor(...args));
  }
}

// ===== USAGE EXAMPLES =====

console.log('=== Factory Pattern Examples ===');

// Simple Factory
const car = VehicleFactory.createVehicle(VehicleType.CAR);
const truck = VehicleFactory.createVehicle(VehicleType.TRUCK);
console.log('Created vehicles:', car.getInfo(), truck.getInfo());

// Factory Method
const bookFactory = new BookFactory();
const electronicsFactory = new ElectronicsFactory();

const book = bookFactory.createProduct('TypeScript Handbook', 29.99, 'Microsoft', 500);
const laptop = electronicsFactory.createProduct('MacBook Pro', 1999.99, 'Apple', 1);

bookFactory.processOrder(book);
electronicsFactory.processOrder(laptop);

// Abstract Factory
const windowsApp = new Application(new WindowsUIFactory());
const macApp = new Application(new MacUIFactory());

console.log('Windows UI:', windowsApp.render());
console.log('macOS UI:', macApp.render());

windowsApp.interact();
macApp.interact();

// Parametrized Factory
const dbConfig: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  database: 'myapp',
};

const pgConnection = DatabaseConnectionFactory.createConnection('postgresql', dbConfig);
const mysqlConnection = DatabaseConnectionFactory.createConnection('mysql', { ...dbConfig, port: 3306 });

console.log('Database types:', pgConnection.getType(), mysqlConnection.getType());

// Generic Factory
const userFactory = new GenericFactory(User);
const orderFactory = new GenericFactory(Order);

const user1 = userFactory.create(1, 'John Doe', 'john@example.com');
const user2 = userFactory.createFromData('{"id":2,"name":"Jane Doe","email":"jane@example.com"}');

const orders = orderFactory.createBatch([
  [1, 1, 99.99],
  [2, 1, 149.99],
  [3, 2, 199.99],
]);

console.log('Created users:', user1, user2);
console.log('Created orders:', orders);

export { VehicleFactory as SimpleFactory };

export default {
  VehicleFactory,
  ProductFactory,
  BookFactory,
  ElectronicsFactory,
  ClothingFactory,
  WindowsUIFactory,
  MacUIFactory,
  Application,
  DatabaseConnectionFactory,
  GenericFactory,
  User,
  Order,
};