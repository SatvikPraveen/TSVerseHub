// File: concepts/patterns/observer.ts

/**
 * OBSERVER PATTERN
 * 
 * The Observer pattern defines a one-to-many dependency between objects
 * so that when one object changes state, all dependents are notified
 * and updated automatically. This pattern is fundamental to event-driven programming.
 */

// ===== BASIC OBSERVER PATTERN =====

export interface Observer {
  update(data: any): void;
}

export interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(data: any): void;
}

export class ConcreteSubject implements Subject {
  private observers: Observer[] = [];
  private state: any;

  attach(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      console.log('Observer already attached');
      return;
    }
    this.observers.push(observer);
    console.log('Observer attached');
  }

  detach(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      console.log('Observer not found');
      return;
    }
    this.observers.splice(observerIndex, 1);
    console.log('Observer detached');
  }

  notify(data: any): void {
    console.log('Notifying observers...');
    for (const observer of this.observers) {
      observer.update(data);
    }
  }

  setState(state: any): void {
    this.state = state;
    this.notify(state);
  }

  getState(): any {
    return this.state;
  }
}

export class ConcreteObserverA implements Observer {
  constructor(private name: string) {}

  update(data: any): void {
    console.log(`${this.name} received update:`, data);
  }
}

export class ConcreteObserverB implements Observer {
  constructor(private name: string) {}

  update(data: any): void {
    console.log(`${this.name} processed data:`, JSON.stringify(data));
  }
}

// ===== EVENT EMITTER PATTERN =====

export type EventListener<T = any> = (data: T) => void;

export class EventEmitter {
  private events: Map<string, EventListener[]> = new Map();

  on<T = any>(event: string, listener: EventListener<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(listener);
    
    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  off<T = any>(event: string, listener: EventListener<T>): void {
    const listeners = this.events.get(event);
    if (!listeners) return;
    
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    
    if (listeners.length === 0) {
      this.events.delete(event);
    }
  }

  emit<T = any>(event: string, data?: T): void {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) return;
    
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    });
  }

  once<T = any>(event: string, listener: EventListener<T>): void {
    const onceListener = (data: T) => {
      listener(data);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}

// ===== TYPED EVENT EMITTER =====

export interface EventMap {
  [key: string]: any;
}

export class TypedEventEmitter<T extends EventMap> {
  private events: Map<keyof T, Array<(data: T[keyof T]) => void>> = new Map();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(listener);
    
    return () => this.off(event, listener);
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    const listeners = this.events.get(event);
    if (!listeners) return;
    
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const listeners = this.events.get(event);
    if (!listeners) return;
    
    listeners.forEach(listener => listener(data));
  }

  once<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    const onceListener = (data: T[K]) => {
      listener(data);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }
}

// Example usage of typed event emitter
interface UserEvents {
  'user:created': { id: number; name: string; email: string };
  'user:updated': { id: number; changes: Partial<{ name: string; email: string }> };
  'user:deleted': { id: number };
}

export class UserService extends TypedEventEmitter<UserEvents> {
  private users: Map<number, any> = new Map();

  createUser(name: string, email: string): void {
    const id = Date.now();
    const user = { id, name, email };
    this.users.set(id, user);
    
    this.emit('user:created', user);
  }

  updateUser(id: number, changes: Partial<{ name: string; email: string }>): void {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, changes);
      this.emit('user:updated', { id, changes });
    }
  }

  deleteUser(id: number): void {
    if (this.users.delete(id)) {
      this.emit('user:deleted', { id });
    }
  }
}

// ===== MODEL-VIEW PATTERN =====

export interface Model {
  getData(): any;
  setData(data: any): void;
  addObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
}

export class DataModel implements Model {
  private data: any = {};
  private observers: Observer[] = [];

  getData(): any {
    return { ...this.data };
  }

  setData(data: any): void {
    this.data = { ...this.data, ...data };
    this.notifyObservers();
  }

  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => {
      observer.update(this.data);
    });
  }
}

export class View implements Observer {
  constructor(private name: string, private model: Model) {
    this.model.addObserver(this);
  }

  update(data: any): void {
    this.render(data);
  }

  render(data: any): void {
    console.log(`${this.name} rendering:`, data);
  }

  destroy(): void {
    this.model.removeObserver(this);
  }
}

// ===== REACTIVE PROGRAMMING PATTERN =====

export class ReactiveProperty<T> {
  private _value: T;
  private observers: Array<(value: T, oldValue: T) => void> = [];

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    const oldValue = this._value;
    this._value = newValue;
    this.notifyObservers(newValue, oldValue);
  }

  subscribe(observer: (value: T, oldValue: T) => void): () => void {
    this.observers.push(observer);
    
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  map<U>(mapper: (value: T) => U): ReactiveProperty<U> {
    const mapped = new ReactiveProperty(mapper(this._value));
    
    this.subscribe((value) => {
      mapped.value = mapper(value);
    });
    
    return mapped;
  }

  filter(predicate: (value: T) => boolean): ReactiveProperty<T | undefined> {
    const filtered = new ReactiveProperty<T | undefined>(
      predicate(this._value) ? this._value : undefined
    );
    
    this.subscribe((value) => {
      filtered.value = predicate(value) ? value : undefined;
    });
    
    return filtered;
  }

  private notifyObservers(newValue: T, oldValue: T): void {
    this.observers.forEach(observer => {
      try {
        observer(newValue, oldValue);
      } catch (error) {
        console.error('Error in reactive property observer:', error);
      }
    });
  }
}

// ===== PUBLISH-SUBSCRIBE PATTERN =====

export class MessageBroker {
  private subscribers: Map<string, Array<(message: any) => void>> = new Map();

  subscribe(topic: string, callback: (message: any) => void): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    
    this.subscribers.get(topic)!.push(callback);
    
    return () => this.unsubscribe(topic, callback);
  }

  unsubscribe(topic: string, callback: (message: any) => void): void {
    const subscribers = this.subscribers.get(topic);
    if (subscribers) {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
      
      if (subscribers.length === 0) {
        this.subscribers.delete(topic);
      }
    }
  }

  publish(topic: string, message: any): void {
    const subscribers = this.subscribers.get(topic);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`Error in subscriber for topic '${topic}':`, error);
        }
      });
    }
  }

  getTopics(): string[] {
    return Array.from(this.subscribers.keys());
  }

  getSubscriberCount(topic: string): number {
    const subscribers = this.subscribers.get(topic);
    return subscribers ? subscribers.length : 0;
  }
}

// ===== STOCK PRICE OBSERVER EXAMPLE =====

export interface StockObserver {
  update(symbol: string, price: number): void;
}

export class Stock {
  private symbol: string;
  private price: number;
  private observers: StockObserver[] = [];

  constructor(symbol: string, initialPrice: number) {
    this.symbol = symbol;
    this.price = initialPrice;
  }

  addObserver(observer: StockObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: StockObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  setPrice(price: number): void {
    this.price = price;
    this.notifyObservers();
  }

  getPrice(): number {
    return this.price;
  }

  getSymbol(): string {
    return this.symbol;
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => {
      observer.update(this.symbol, this.price);
    });
  }
}

export class StockDisplay implements StockObserver {
  private stockPrices: Map<string, number> = new Map();

  update(symbol: string, price: number): void {
    this.stockPrices.set(symbol, price);
    console.log(`Stock Display - ${symbol}: $${price}`);
  }

  getPortfolioValue(): number {
    return Array.from(this.stockPrices.values()).reduce((sum, price) => sum + price, 0);
  }
}

export class StockLogger implements StockObserver {
  private logs: Array<{ symbol: string; price: number; timestamp: Date }> = [];

  update(symbol: string, price: number): void {
    const log = { symbol, price, timestamp: new Date() };
    this.logs.push(log);
    console.log(`Stock Logger - ${symbol} changed to $${price} at ${log.timestamp}`);
  }

  getLogs(): typeof this.logs {
    return [...this.logs];
  }
}

// ===== USAGE EXAMPLES =====

console.log('=== Observer Pattern Examples ===');

// Basic Observer Pattern
const subject = new ConcreteSubject();
const observerA = new ConcreteObserverA('Observer A');
const observerB = new ConcreteObserverB('Observer B');

subject.attach(observerA);
subject.attach(observerB);

subject.setState({ message: 'Hello Observers!' });
subject.setState({ count: 42 });

// Event Emitter
const emitter = new EventEmitter();

const unsubscribe = emitter.on('test', (data) => {
  console.log('Event received:', data);
});

emitter.emit('test', { message: 'Hello EventEmitter!' });
unsubscribe();
emitter.emit('test', { message: 'This will not be received' });

// User Service with Typed Events
const userService = new UserService();

userService.on('user:created', (user) => {
  console.log('User created:', user.name);
});

userService.on('user:updated', (event) => {
  console.log('User updated:', event.id, event.changes);
});

userService.createUser('John Doe', 'john@example.com');

// Reactive Property
const counter = new ReactiveProperty(0);
const doubled = counter.map(x => x * 2);
const evenNumbers = counter.filter(x => x % 2 === 0);

counter.subscribe((value, oldValue) => {
  console.log(`Counter changed from ${oldValue} to ${value}`);
});

doubled.subscribe((value) => {
  console.log(`Doubled value: ${value}`);
});

evenNumbers.subscribe((value) => {
  console.log(`Even number: ${value}`);
});

counter.value = 1;
counter.value = 2;
counter.value = 3;
counter.value = 4;

// Message Broker
const broker = new MessageBroker();

broker.subscribe('orders', (order) => {
  console.log('Processing order:', order);
});

broker.subscribe('orders', (order) => {
  console.log('Sending order confirmation:', order);
});

broker.publish('orders', { id: 1, product: 'Laptop', quantity: 1 });

// Stock Example
const appleStock = new Stock('AAPL', 150.00);
const stockDisplay = new StockDisplay();
const stockLogger = new StockLogger();

appleStock.addObserver(stockDisplay);
appleStock.addObserver(stockLogger);

appleStock.setPrice(155.00);
appleStock.setPrice(148.75);

export default {
  ConcreteSubject,
  ConcreteObserverA,
  ConcreteObserverB,
  EventEmitter,
  TypedEventEmitter,
  UserService,
  DataModel,
  View,
  ReactiveProperty,
  MessageBroker,
  Stock,
  StockDisplay,
  StockLogger,
};