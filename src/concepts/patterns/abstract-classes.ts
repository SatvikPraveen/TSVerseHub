// File: concepts/patterns/abstract-classes.ts

/**
 * ABSTRACT CLASSES PATTERN
 * 
 * Abstract classes provide a way to define common functionality and structure
 * that subclasses must implement. They cannot be instantiated directly and
 * serve as templates for concrete implementations.
 */

// ===== BASIC ABSTRACT CLASS =====

export abstract class Shape {
  protected name: string;
  protected color: string;

  constructor(name: string, color: string = 'black') {
    this.name = name;
    this.color = color;
  }

  // Abstract methods - must be implemented by subclasses
  abstract calculateArea(): number;
  abstract calculatePerimeter(): number;

  // Concrete methods - shared implementation
  public getName(): string {
    return this.name;
  }

  public getColor(): string {
    return this.color;
  }

  public setColor(color: string): void {
    this.color = color;
  }

  public getInfo(): string {
    return `${this.name} (${this.color}) - Area: ${this.calculateArea()}, Perimeter: ${this.calculatePerimeter()}`;
  }

  // Template method pattern
  public display(): string {
    return `Drawing ${this.getColor()} ${this.getName()} with area ${this.calculateArea()}`;
  }
}

export class Circle extends Shape {
  constructor(private radius: number, color?: string) {
    super('Circle', color);
  }

  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }

  calculatePerimeter(): number {
    return 2 * Math.PI * this.radius;
  }

  getRadius(): number {
    return this.radius;
  }
}

export class Rectangle extends Shape {
  constructor(private width: number, private height: number, color?: string) {
    super('Rectangle', color);
  }

  calculateArea(): number {
    return this.width * this.height;
  }

  calculatePerimeter(): number {
    return 2 * (this.width + this.height);
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

export class Triangle extends Shape {
  constructor(private base: number, private height: number, private side1: number, private side2: number, color?: string) {
    super('Triangle', color);
  }

  calculateArea(): number {
    return (this.base * this.height) / 2;
  }

  calculatePerimeter(): number {
    return this.base + this.side1 + this.side2;
  }

  getBase(): number {
    return this.base;
  }

  getHeight(): number {
    return this.height;
  }
}

// ===== ABSTRACT VEHICLE CLASS =====

export abstract class Vehicle {
  protected brand: string;
  protected model: string;
  protected year: number;
  protected isRunning: boolean = false;

  constructor(brand: string, model: string, year: number) {
    this.brand = brand;
    this.model = model;
    this.year = year;
  }

  // Abstract methods
  abstract start(): void;
  abstract stop(): void;
  abstract getMaxSpeed(): number;
  abstract getFuelType(): string;

  // Concrete methods
  public getBrand(): string {
    return this.brand;
  }

  public getModel(): string {
    return this.model;
  }

  public getYear(): number {
    return this.year;
  }

  public isEngineRunning(): boolean {
    return this.isRunning;
  }

  public getVehicleInfo(): string {
    return `${this.year} ${this.brand} ${this.model} (${this.getFuelType()})`;
  }

  // Template method
  public performMaintenance(): string[] {
    const tasks = [
      'Check tire pressure',
      'Check oil level',
      'Test brakes',
    ];
    
    tasks.push(...this.getSpecificMaintenanceTasks());
    tasks.push('Update maintenance log');
    
    return tasks;
  }

  // Hook method - can be overridden by subclasses
  protected getSpecificMaintenanceTasks(): string[] {
    return [];
  }
}

export class Car extends Vehicle {
  constructor(brand: string, model: string, year: number, private doors: number = 4) {
    super(brand, model, year);
  }

  start(): void {
    if (!this.isRunning) {
      console.log(`${this.getVehicleInfo()} engine started`);
      this.isRunning = true;
    } else {
      console.log(`${this.getVehicleInfo()} is already running`);
    }
  }

  stop(): void {
    if (this.isRunning) {
      console.log(`${this.getVehicleInfo()} engine stopped`);
      this.isRunning = false;
    } else {
      console.log(`${this.getVehicleInfo()} is already stopped`);
    }
  }

  getMaxSpeed(): number {
    return 200; // km/h
  }

  getFuelType(): string {
    return 'Gasoline';
  }

  getDoors(): number {
    return this.doors;
  }

  protected getSpecificMaintenanceTasks(): string[] {
    return [
      'Check air conditioning',
      'Test radio and electronics',
      'Clean interior',
    ];
  }
}

export class Motorcycle extends Vehicle {
  constructor(brand: string, model: string, year: number, private engineSize: number) {
    super(brand, model, year);
  }

  start(): void {
    if (!this.isRunning) {
      console.log(`${this.getVehicleInfo()} started with a roar!`);
      this.isRunning = true;
    } else {
      console.log(`${this.getVehicleInfo()} is already running`);
    }
  }

  stop(): void {
    if (this.isRunning) {
      console.log(`${this.getVehicleInfo()} engine turned off`);
      this.isRunning = false;
    } else {
      console.log(`${this.getVehicleInfo()} is already stopped`);
    }
  }

  getMaxSpeed(): number {
    return this.engineSize > 1000 ? 300 : 180; // km/h based on engine size
  }

  getFuelType(): string {
    return 'Gasoline';
  }

  getEngineSize(): number {
    return this.engineSize;
  }

  protected getSpecificMaintenanceTasks(): string[] {
    return [
      'Check chain tension',
      'Inspect helmet and safety gear',
      'Check suspension',
    ];
  }
}

export class ElectricCar extends Vehicle {
  constructor(brand: string, model: string, year: number, private batteryCapacity: number) {
    super(brand, model, year);
  }

  start(): void {
    if (!this.isRunning) {
      console.log(`${this.getVehicleInfo()} silently started`);
      this.isRunning = true;
    } else {
      console.log(`${this.getVehicleInfo()} is already on`);
    }
  }

  stop(): void {
    if (this.isRunning) {
      console.log(`${this.getVehicleInfo()} turned off`);
      this.isRunning = false;
    } else {
      console.log(`${this.getVehicleInfo()} is already off`);
    }
  }

  getMaxSpeed(): number {
    return 250; // km/h
  }

  getFuelType(): string {
    return 'Electric';
  }

  getBatteryCapacity(): number {
    return this.batteryCapacity;
  }

  protected getSpecificMaintenanceTasks(): string[] {
    return [
      'Check battery health',
      'Inspect charging cable',
      'Update software',
      'Check electric motor',
    ];
  }
}

// ===== ABSTRACT DATA PROCESSOR =====

export abstract class DataProcessor<TInput, TOutput> {
  protected processingSteps: string[] = [];

  // Template method that defines the processing workflow
  public process(data: TInput): TOutput {
    console.log('Starting data processing...');
    
    this.preprocessData(data);
    const result = this.executeProcessing(data);
    this.postprocessData(result);
    
    console.log('Data processing completed');
    console.log('Processing steps:', this.processingSteps);
    
    return result;
  }

  // Abstract methods to be implemented by subclasses
  abstract executeProcessing(data: TInput): TOutput;

  // Hook methods that can be overridden
  protected preprocessData(data: TInput): void {
    this.processingSteps.push('Data preprocessing');
    console.log('Preprocessing data...');
  }

  protected postprocessData(result: TOutput): void {
    this.processingSteps.push('Data postprocessing');
    console.log('Postprocessing result...');
  }

  // Concrete utility methods
  protected log(message: string): void {
    console.log(`[${this.constructor.name}] ${message}`);
    this.processingSteps.push(message);
  }

  public getProcessingSteps(): string[] {
    return [...this.processingSteps];
  }
}

export class TextProcessor extends DataProcessor<string, string> {
  executeProcessing(data: string): string {
    this.log('Processing text data');
    
    // Convert to uppercase and remove extra spaces
    let result = data.toUpperCase().replace(/\s+/g, ' ').trim();
    
    this.log(`Processed ${data.length} characters`);
    return result;
  }

  protected preprocessData(data: string): void {
    super.preprocessData(data);
    this.log('Validating text input');
    
    if (!data || data.trim().length === 0) {
      throw new Error('Input text cannot be empty');
    }
  }

  protected postprocessData(result: string): void {
    super.postprocessData(result);
    this.log('Text processing completed successfully');
  }
}

export class NumberProcessor extends DataProcessor<number[], number> {
  executeProcessing(data: number[]): number {
    this.log('Processing numerical data');
    
    // Calculate average
    const sum = data.reduce((acc, num) => acc + num, 0);
    const average = sum / data.length;
    
    this.log(`Calculated average of ${data.length} numbers`);
    return average;
  }

  protected preprocessData(data: number[]): void {
    super.preprocessData(data);
    this.log('Validating numerical input');
    
    if (!data || data.length === 0) {
      throw new Error('Input array cannot be empty');
    }
    
    if (data.some(num => isNaN(num))) {
      throw new Error('All array elements must be valid numbers');
    }
  }

  protected postprocessData(result: number): void {
    super.postprocessData(result);
    this.log(`Final result: ${result}`);
  }
}

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

export class UserProcessor extends DataProcessor<User[], User[]> {
  constructor(private minAge: number = 18) {
    super();
  }

  executeProcessing(data: User[]): User[] {
    this.log('Processing user data');
    
    // Filter users by age and sort by name
    const result = data
      .filter(user => user.age >= this.minAge)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    this.log(`Filtered ${data.length} users to ${result.length} valid users`);
    return result;
  }

  protected preprocessData(data: User[]): void {
    super.preprocessData(data);
    this.log('Validating user data');
    
    if (!data || data.length === 0) {
      throw new Error('User array cannot be empty');
    }
    
    const invalidUsers = data.filter(user => 
      !user.name || !user.email || !user.id || user.age < 0
    );
    
    if (invalidUsers.length > 0) {
      throw new Error(`Found ${invalidUsers.length} invalid user records`);
    }
  }
}

// ===== ABSTRACT GAME ENGINE =====

export abstract class GameEngine {
  protected isRunning: boolean = false;
  protected frameRate: number = 60;
  protected gameObjects: any[] = [];

  // Template method for game loop
  public start(): void {
    console.log('Starting game engine...');
    
    this.initialize();
    this.loadAssets();
    this.setupScene();
    
    this.isRunning = true;
    this.gameLoop();
  }

  public stop(): void {
    console.log('Stopping game engine...');
    this.isRunning = false;
    this.cleanup();
  }

  // Abstract methods to be implemented by subclasses
  abstract initialize(): void;
  abstract loadAssets(): void;
  abstract setupScene(): void;
  abstract update(deltaTime: number): void;
  abstract render(): void;
  abstract cleanup(): void;

  // Template method for game loop
  private gameLoop(): void {
    let lastTime = Date.now();
    
    const loop = () => {
      if (!this.isRunning) return;
      
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      this.update(deltaTime);
      this.render();
      
      setTimeout(loop, 1000 / this.frameRate);
    };
    
    loop();
  }

  // Concrete methods
  public setFrameRate(fps: number): void {
    this.frameRate = fps;
  }

  public addGameObject(obj: any): void {
    this.gameObjects.push(obj);
  }

  public removeGameObject(obj: any): void {
    const index = this.gameObjects.indexOf(obj);
    if (index > -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  public getGameObjectCount(): number {
    return this.gameObjects.length;
  }
}

export class Simple2DGame extends GameEngine {
  private canvas: string = 'canvas-2d';
  private score: number = 0;

  initialize(): void {
    console.log('Initializing 2D game engine');
    this.setFrameRate(30);
  }

  loadAssets(): void {
    console.log('Loading 2D game assets (sprites, sounds, etc.)');
    // Simulate asset loading
  }

  setupScene(): void {
    console.log('Setting up 2D game scene');
    this.addGameObject({ type: 'player', x: 100, y: 100 });
    this.addGameObject({ type: 'enemy', x: 200, y: 50 });
  }

  update(deltaTime: number): void {
    // Update game logic
    this.score += Math.floor(deltaTime / 100);
    
    // Update game objects (simplified)
    this.gameObjects.forEach(obj => {
      if (obj.type === 'enemy') {
        obj.x += deltaTime * 0.1;
      }
    });
  }

  render(): void {
    // Simulate rendering
    console.log(`Rendering 2D frame - Objects: ${this.getGameObjectCount()}, Score: ${this.score}`);
  }

  cleanup(): void {
    console.log('Cleaning up 2D game resources');
    this.gameObjects = [];
    this.score = 0;
  }
}

export class Simple3DGame extends GameEngine {
  private renderer: string = 'webgl';
  private camera: any = { x: 0, y: 0, z: 10 };

  initialize(): void {
    console.log('Initializing 3D game engine');
    this.setFrameRate(60);
  }

  loadAssets(): void {
    console.log('Loading 3D game assets (models, textures, shaders)');
  }

  setupScene(): void {
    console.log('Setting up 3D game scene');
    this.addGameObject({ type: 'cube', x: 0, y: 0, z: 0, rotation: 0 });
    this.addGameObject({ type: 'sphere', x: 5, y: 2, z: -3 });
  }

  update(deltaTime: number): void {
    // Update 3D objects
    this.gameObjects.forEach(obj => {
      if (obj.type === 'cube') {
        obj.rotation += deltaTime * 0.001;
      }
    });
    
    // Update camera (simple orbit)
    const time = Date.now() * 0.001;
    this.camera.x = Math.cos(time) * 15;
    this.camera.z = Math.sin(time) * 15;
  }

  render(): void {
    console.log(`Rendering 3D frame - Camera: (${this.camera.x.toFixed(1)}, ${this.camera.y}, ${this.camera.z.toFixed(1)})`);
  }

  cleanup(): void {
    console.log('Cleaning up 3D game resources');
    this.gameObjects = [];
  }
}

// ===== USAGE EXAMPLES =====

console.log('=== Abstract Classes Examples ===');

// Shape examples
const shapes: Shape[] = [
  new Circle(5, 'red'),
  new Rectangle(10, 8, 'blue'),
  new Triangle(6, 8, 5, 7, 'green'),
];

shapes.forEach(shape => {
  console.log(shape.getInfo());
  console.log(shape.display());
});

// Vehicle examples
const vehicles: Vehicle[] = [
  new Car('Toyota', 'Camry', 2023, 4),
  new Motorcycle('Harley-Davidson', 'Street 750', 2022, 750),
  new ElectricCar('Tesla', 'Model 3', 2023, 75),
];

vehicles.forEach(vehicle => {
  vehicle.start();
  console.log(`Max speed: ${vehicle.getMaxSpeed()} km/h`);
  console.log('Maintenance tasks:', vehicle.performMaintenance());
  vehicle.stop();
  console.log('---');
});

// Data processing examples
const textProcessor = new TextProcessor();
const processedText = textProcessor.process('  hello   world  ');
console.log('Processed text:', processedText);

const numberProcessor = new NumberProcessor();
const average = numberProcessor.process([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
console.log('Average:', average);

const userProcessor = new UserProcessor(21);
const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 17 },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 30 },
];

const validUsers = userProcessor.process(users);
console.log('Valid users:', validUsers);

// Game engine examples
const game2D = new Simple2DGame();
game2D.start();

setTimeout(() => {
  game2D.stop();
}, 3000);

export default {
  Shape,
  Circle,
  Rectangle,
  Triangle,
  Vehicle,
  Car,
  Motorcycle,
  ElectricCar,
  DataProcessor,
  TextProcessor,
  NumberProcessor,
  UserProcessor,
  GameEngine,
  Simple2DGame,
  Simple3DGame,
};