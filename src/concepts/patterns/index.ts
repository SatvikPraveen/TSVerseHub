// File: concepts/patterns/index.ts

/**
 * DESIGN PATTERNS IN TYPESCRIPT
 * 
 * This module demonstrates common design patterns implemented in TypeScript,
 * showcasing how TypeScript's type system enhances traditional patterns
 * with better type safety and developer experience.
 */

// Re-export all design patterns
export * from './singleton';
export * from './factory';
export * from './observer';
export * from './strategy';
export * from './abstract-classes';
export * from './mixins';

// Import pattern implementations for demonstration
import { Singleton } from './singleton';
import { UserFactory, AdminFactory } from './factory';
import { EventEmitter } from './observer';
import { PaymentProcessor } from './strategy';

// ===== CREATIONAL PATTERNS =====

// Singleton Pattern - Ensure only one instance exists
export const ConfigManager = Singleton.getInstance();

// Factory Pattern - Create objects without specifying exact classes
export const userFactory = new UserFactory();
export const adminFactory = new AdminFactory();

// Builder Pattern - Construct complex objects step by step
export class QueryBuilder {
  private query: string = '';
  private conditions: string[] = [];
  private orderBy: string = '';
  private limitValue: number = 0;

  select(fields: string[]): this {
    this.query = `SELECT ${fields.join(', ')}`;
    return this;
  }

  from(table: string): this {
    this.query += ` FROM ${table}`;
    return this;
  }

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  orderByField(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderBy = ` ORDER BY ${field} ${direction}`;
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  build(): string {
    let finalQuery = this.query;
    
    if (this.conditions.length > 0) {
      finalQuery += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    
    if (this.orderBy) {
      finalQuery += this.orderBy;
    }
    
    if (this.limitValue > 0) {
      finalQuery += ` LIMIT ${this.limitValue}`;
    }
    
    return finalQuery;
  }
}

// Prototype Pattern - Create objects by cloning
export abstract class Prototype<T> {
  abstract clone(): T;
}

export class Document extends Prototype<Document> {
  constructor(
    public title: string,
    public content: string,
    public tags: string[] = []
  ) {
    super();
  }

  clone(): Document {
    return new Document(this.title, this.content, [...this.tags]);
  }

  setTitle(title: string): void {
    this.title = title;
  }

  addTag(tag: string): void {
    this.tags.push(tag);
  }
}

// ===== STRUCTURAL PATTERNS =====

// Adapter Pattern - Allow incompatible interfaces to work together
export interface MediaPlayer {
  play(audioType: string, fileName: string): void;
}

export interface AdvancedMediaPlayer {
  playVlc(fileName: string): void;
  playMp4(fileName: string): void;
}

export class VlcPlayer implements AdvancedMediaPlayer {
  playVlc(fileName: string): void {
    console.log(`Playing VLC file: ${fileName}`);
  }

  playMp4(fileName: string): void {
    // Empty - VLC player doesn't support MP4 in this example
  }
}

export class Mp4Player implements AdvancedMediaPlayer {
  playVlc(fileName: string): void {
    // Empty - MP4 player doesn't support VLC
  }

  playMp4(fileName: string): void {
    console.log(`Playing MP4 file: ${fileName}`);
  }
}

export class MediaAdapter implements MediaPlayer {
  private advancedPlayer: AdvancedMediaPlayer;

  constructor(audioType: string) {
    if (audioType === 'vlc') {
      this.advancedPlayer = new VlcPlayer();
    } else if (audioType === 'mp4') {
      this.advancedPlayer = new Mp4Player();
    } else {
      throw new Error(`Unsupported audio type: ${audioType}`);
    }
  }

  play(audioType: string, fileName: string): void {
    if (audioType === 'vlc') {
      this.advancedPlayer.playVlc(fileName);
    } else if (audioType === 'mp4') {
      this.advancedPlayer.playMp4(fileName);
    }
  }
}

export class AudioPlayer implements MediaPlayer {
  private adapter: MediaAdapter | null = null;

  play(audioType: string, fileName: string): void {
    if (audioType === 'mp3') {
      console.log(`Playing MP3 file: ${fileName}`);
    } else if (audioType === 'vlc' || audioType === 'mp4') {
      this.adapter = new MediaAdapter(audioType);
      this.adapter.play(audioType, fileName);
    } else {
      console.log(`${audioType} format not supported`);
    }
  }
}

// Decorator Pattern - Add behavior to objects dynamically
export interface Coffee {
  cost(): number;
  description(): string;
}

export class SimpleCoffee implements Coffee {
  cost(): number {
    return 2;
  }

  description(): string {
    return 'Simple coffee';
  }
}

export abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}

  abstract cost(): number;
  abstract description(): string;
}

export class MilkDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.5;
  }

  description(): string {
    return this.coffee.description() + ', milk';
  }
}

export class SugarDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.25;
  }

  description(): string {
    return this.coffee.description() + ', sugar';
  }
}

// Facade Pattern - Provide simplified interface to complex subsystem
export class CPU {
  freeze(): void { console.log('CPU: Freeze'); }
  jump(position: number): void { console.log(`CPU: Jump to ${position}`); }
  execute(): void { console.log('CPU: Execute'); }
}

export class Memory {
  load(position: number, data: string): void {
    console.log(`Memory: Load ${data} at ${position}`);
  }
}

export class HardDrive {
  read(lba: number, size: number): string {
    console.log(`HardDrive: Read ${size} bytes from ${lba}`);
    return 'boot data';
  }
}

export class ComputerFacade {
  private cpu: CPU;
  private memory: Memory;
  private hardDrive: HardDrive;

  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }

  start(): void {
    console.log('Computer: Starting...');
    this.cpu.freeze();
    const bootData = this.hardDrive.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
    console.log('Computer: Started successfully');
  }
}

// ===== BEHAVIORAL PATTERNS =====

// Command Pattern - Encapsulate requests as objects
export interface Command {
  execute(): void;
  undo(): void;
}

export class Light {
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

export class LightOnCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOn();
  }

  undo(): void {
    this.light.turnOff();
  }
}

export class LightOffCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOff();
  }

  undo(): void {
    this.light.turnOn();
  }
}

export class RemoteControl {
  private commands: Command[] = [];
  private lastCommand: Command | null = null;

  setCommand(command: Command): void {
    this.commands.push(command);
  }

  pressButton(): void {
    const command = this.commands[this.commands.length - 1];
    if (command) {
      command.execute();
      this.lastCommand = command;
    }
  }

  pressUndo(): void {
    if (this.lastCommand) {
      this.lastCommand.undo();
    }
  }
}

// Template Method Pattern - Define algorithm skeleton
export abstract class DataProcessor {
  // Template method
  public process(): void {
    this.readData();
    this.processData();
    this.writeData();
  }

  protected abstract readData(): void;
  protected abstract processData(): void;
  protected abstract writeData(): void;
}

export class CSVProcessor extends DataProcessor {
  protected readData(): void {
    console.log('Reading data from CSV file');
  }

  protected processData(): void {
    console.log('Processing CSV data');
  }

  protected writeData(): void {
    console.log('Writing processed CSV data');
  }
}

export class XMLProcessor extends DataProcessor {
  protected readData(): void {
    console.log('Reading data from XML file');
  }

  protected processData(): void {
    console.log('Processing XML data');
  }

  protected writeData(): void {
    console.log('Writing processed XML data');
  }
}

// ===== TYPESCRIPT-SPECIFIC PATTERNS =====

// Type-safe Builder with fluent interface
export class TypedQueryBuilder<T = {}> {
  private fields: (keyof T)[] = [];
  private tableName: string = '';
  private whereConditions: string[] = [];

  select<K extends keyof T>(...fields: K[]): TypedQueryBuilder<Pick<T, K>> {
    return Object.assign(Object.create(this), { fields: [...fields] });
  }

  from(table: string): this {
    this.tableName = table;
    return this;
  }

  where<K extends keyof T>(field: K, operator: string, value: T[K]): this {
    this.whereConditions.push(`${String(field)} ${operator} ${value}`);
    return this;
  }

  build(): string {
    const fieldList = this.fields.length > 0 ? this.fields.join(', ') : '*';
    let query = `SELECT ${fieldList} FROM ${this.tableName}`;
    
    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    return query;
  }
}

// Generic Repository Pattern
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

export class InMemoryRepository<T extends { id: ID }, ID> implements Repository<T, ID> {
  private data = new Map<ID, T>();

  async findById(id: ID): Promise<T | null> {
    return this.data.get(id) || null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.data.values());
  }

  async save(entity: T): Promise<T> {
    this.data.set(entity.id, entity);
    return entity;
  }

  async delete(id: ID): Promise<boolean> {
    return this.data.delete(id);
  }
}

// ===== USAGE EXAMPLES =====

console.log('=== Design Patterns Examples ===');

// Builder Pattern
const query = new QueryBuilder()
  .select(['name', 'email'])
  .from('users')
  .where('active = 1')
  .where('age > 18')
  .orderByField('name')
  .limit(10)
  .build();

console.log('Built query:', query);

// Decorator Pattern
let coffee: Coffee = new SimpleCoffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()} costs ${coffee.cost()}`);

// Command Pattern
const light = new Light();
const lightOn = new LightOnCommand(light);
const lightOff = new LightOffCommand(light);
const remote = new RemoteControl();

remote.setCommand(lightOn);
remote.pressButton();
remote.pressUndo();

// Facade Pattern
const computer = new ComputerFacade();
computer.start();

export default {
  QueryBuilder,
  Document,
  MediaAdapter,
  AudioPlayer,
  CoffeeDecorator,
  MilkDecorator,
  SugarDecorator,
  ComputerFacade,
  RemoteControl,
  LightOnCommand,
  LightOffCommand,
  DataProcessor,
  CSVProcessor,
  XMLProcessor,
  TypedQueryBuilder,
  InMemoryRepository,
};