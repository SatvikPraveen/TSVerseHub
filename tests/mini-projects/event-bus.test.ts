// File: tests/mini-projects/event-bus.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Event Bus System', () => {
  beforeEach(() => {
    // Reset any global state or mocks
    vi.clearAllMocks();
  });

  describe('Basic Event Bus', () => {
    it('should implement a basic event bus with pub/sub functionality', () => {
      type EventCallback<T = any> = (data: T) => void;
      
      interface EventSubscription {
        unsubscribe(): void;
      }
      
      class EventBus {
        private events: Map<string, EventCallback[]> = new Map();
        
        subscribe<T = any>(event: string, callback: EventCallback<T>): EventSubscription {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          
          const callbacks = this.events.get(event)!;
          callbacks.push(callback);
          
          // Return subscription object
          return {
            unsubscribe: () => {
              const index = callbacks.indexOf(callback);
              if (index > -1) {
                callbacks.splice(index, 1);
              }
              
              // Clean up empty event arrays
              if (callbacks.length === 0) {
                this.events.delete(event);
              }
            }
          };
        }
        
        publish<T = any>(event: string, data: T): void {
          const callbacks = this.events.get(event);
          if (callbacks) {
            callbacks.forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error(`Error in event handler for '${event}':`, error);
              }
            });
          }
        }
        
        once<T = any>(event: string, callback: EventCallback<T>): EventSubscription {
          const subscription = this.subscribe(event, (data: T) => {
            callback(data);
            subscription.unsubscribe();
          });
          
          return subscription;
        }
        
        getEventCount(): number {
          return this.events.size;
        }
        
        getSubscriberCount(event: string): number {
          return this.events.get(event)?.length || 0;
        }
        
        clear(): void {
          this.events.clear();
        }
        
        hasEvent(event: string): boolean {
          return this.events.has(event);
        }
      }
      
      const eventBus = new EventBus();
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      
      // Test subscription
      const subscription1 = eventBus.subscribe('test-event', mockCallback1);
      const subscription2 = eventBus.subscribe('test-event', mockCallback2);
      
      expect(eventBus.hasEvent('test-event')).toBe(true);
      expect(eventBus.getSubscriberCount('test-event')).toBe(2);
      
      // Test publishing
      eventBus.publish('test-event', 'test data');
      
      expect(mockCallback1).toHaveBeenCalledWith('test data');
      expect(mockCallback2).toHaveBeenCalledWith('test data');
      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
      
      // Test unsubscribe
      subscription1.unsubscribe();
      expect(eventBus.getSubscriberCount('test-event')).toBe(1);
      
      eventBus.publish('test-event', 'test data 2');
      expect(mockCallback1).toHaveBeenCalledTimes(1); // Should not be called again
      expect(mockCallback2).toHaveBeenCalledTimes(2);
      
      // Test once subscription
      const mockOnceCallback = vi.fn();
      eventBus.once('once-event', mockOnceCallback);
      
      eventBus.publish('once-event', 'once data');
      eventBus.publish('once-event', 'once data 2');
      
      expect(mockOnceCallback).toHaveBeenCalledTimes(1);
      expect(mockOnceCallback).toHaveBeenCalledWith('once data');
      
      // Test error handling
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      eventBus.subscribe('error-event', errorCallback);
      eventBus.subscribe('error-event', normalCallback);
      
      eventBus.publish('error-event', 'error data');
      
      expect(errorCallback).toHaveBeenCalledWith('error data');
      expect(normalCallback).toHaveBeenCalledWith('error data');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Typed Event Bus', () => {
    it('should support strongly typed events', () => {
      interface UserCreatedEvent {
        userId: string;
        username: string;
        email: string;
        timestamp: Date;
      }
      
      interface UserDeletedEvent {
        userId: string;
        timestamp: Date;
      }
      
      interface ProductUpdatedEvent {
        productId: string;
        changes: Record<string, any>;
        timestamp: Date;
      }
      
      type EventMap = {
        'user:created': UserCreatedEvent;
        'user:deleted': UserDeletedEvent;
        'product:updated': ProductUpdatedEvent;
      };
      
      class TypedEventBus<TEventMap extends Record<string, any> = Record<string, any>> {
        private events = new Map<keyof TEventMap, Array<(data: any) => void>>();
        
        subscribe<K extends keyof TEventMap>(
          event: K,
          callback: (data: TEventMap[K]) => void
        ): { unsubscribe(): void } {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          
          const callbacks = this.events.get(event)!;
          callbacks.push(callback);
          
          return {
            unsubscribe: () => {
              const index = callbacks.indexOf(callback);
              if (index > -1) {
                callbacks.splice(index, 1);
              }
            }
          };
        }
        
        publish<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
          const callbacks = this.events.get(event);
          if (callbacks) {
            callbacks.forEach(callback => callback(data));
          }
        }
        
        once<K extends keyof TEventMap>(
          event: K,
          callback: (data: TEventMap[K]) => void
        ): { unsubscribe(): void } {
          const subscription = this.subscribe(event, (data) => {
            callback(data);
            subscription.unsubscribe();
          });
          return subscription;
        }
      }
      
      const eventBus = new TypedEventBus<EventMap>();
      
      // Test typed user created event
      const userCreatedCallback = vi.fn((data: UserCreatedEvent) => {
        expect(typeof data.userId).toBe('string');
        expect(typeof data.username).toBe('string');
        expect(typeof data.email).toBe('string');
        expect(data.timestamp).toBeInstanceOf(Date);
      });
      
      eventBus.subscribe('user:created', userCreatedCallback);
      
      const userCreatedData: UserCreatedEvent = {
        userId: 'user123',
        username: 'john_doe',
        email: 'john@example.com',
        timestamp: new Date()
      };
      
      eventBus.publish('user:created', userCreatedData);
      expect(userCreatedCallback).toHaveBeenCalledWith(userCreatedData);
      
      // Test typed product updated event
      const productUpdatedCallback = vi.fn((data: ProductUpdatedEvent) => {
        expect(typeof data.productId).toBe('string');
        expect(typeof data.changes).toBe('object');
        expect(data.timestamp).toBeInstanceOf(Date);
      });
      
      eventBus.subscribe('product:updated', productUpdatedCallback);
      
      const productUpdatedData: ProductUpdatedEvent = {
        productId: 'prod456',
        changes: { price: 29.99, name: 'Updated Product' },
        timestamp: new Date()
      };
      
      eventBus.publish('product:updated', productUpdatedData);
      expect(productUpdatedCallback).toHaveBeenCalledWith(productUpdatedData);
    });
  });

  describe('Event Bus with Middleware', () => {
    it('should support middleware for event processing', () => {
      type Middleware<T = any> = (event: string, data: T, next: () => void) => void;
      
      class MiddlewareEventBus {
        private events = new Map<string, Array<(data: any) => void>>();
        private middlewares: Middleware[] = [];
        
        use(middleware: Middleware): void {
          this.middlewares.push(middleware);
        }
        
        subscribe<T = any>(event: string, callback: (data: T) => void): { unsubscribe(): void } {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          
          const callbacks = this.events.get(event)!;
          callbacks.push(callback);
          
          return {
            unsubscribe: () => {
              const index = callbacks.indexOf(callback);
              if (index > -1) {
                callbacks.splice(index, 1);
              }
            }
          };
        }
        
        publish<T = any>(event: string, data: T): void {
          this.executeMiddlewares(event, data, 0, () => {
            const callbacks = this.events.get(event);
            if (callbacks) {
              callbacks.forEach(callback => callback(data));
            }
          });
        }
        
        private executeMiddlewares<T>(
          event: string,
          data: T,
          index: number,
          finalCallback: () => void
        ): void {
          if (index >= this.middlewares.length) {
            finalCallback();
            return;
          }
          
          const middleware = this.middlewares[index];
          middleware(event, data, () => {
            this.executeMiddlewares(event, data, index + 1, finalCallback);
          });
        }
      }
      
      const eventBus = new MiddlewareEventBus();
      
      // Logging middleware
      const loggingMiddleware: Middleware = vi.fn((event, data, next) => {
        console.log(`[LOG] Event: ${event}`, data);
        next();
      });
      
      // Validation middleware
      const validationMiddleware: Middleware = vi.fn((event, data, next) => {
        if (event.startsWith('user:') && (!data || !data.userId)) {
          console.error('User events must have userId');
          return; // Don't call next() to stop execution
        }
        next();
      });
      
      // Timing middleware
      const timingMiddleware: Middleware = vi.fn((event, data, next) => {
        const start = Date.now();
        next();
        const duration = Date.now() - start;
        console.log(`[TIMING] Event ${event} processed in ${duration}ms`);
      });
      
      eventBus.use(loggingMiddleware);
      eventBus.use(validationMiddleware);
      eventBus.use(timingMiddleware);
      
      const userCallback = vi.fn();
      eventBus.subscribe('user:created', userCallback);
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Test valid event (should pass all middlewares)
      eventBus.publish('user:created', { userId: 'user123', name: 'John' });
      
      expect(loggingMiddleware).toHaveBeenCalled();
      expect(validationMiddleware).toHaveBeenCalled();
      expect(timingMiddleware).toHaveBeenCalled();
      expect(userCallback).toHaveBeenCalledWith({ userId: 'user123', name: 'John' });
      
      // Test invalid event (should be stopped by validation middleware)
      vi.clearAllMocks();
      eventBus.publish('user:created', { name: 'John' }); // Missing userId
      
      expect(loggingMiddleware).toHaveBeenCalled();
      expect(validationMiddleware).toHaveBeenCalled();
      expect(timingMiddleware).not.toHaveBeenCalled(); // Should not reach this middleware
      expect(userCallback).not.toHaveBeenCalled(); // Should not reach the callback
      expect(errorSpy).toHaveBeenCalledWith('User events must have userId');
      
      consoleSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('Async Event Bus', () => {
    it('should handle async event handlers', async () => {
      type AsyncCallback<T = any> = (data: T) => Promise<void> | void;
      
      class AsyncEventBus {
        private events = new Map<string, AsyncCallback[]>();
        
        subscribe<T = any>(event: string, callback: AsyncCallback<T>): { unsubscribe(): void } {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          
          const callbacks = this.events.get(event)!;
          callbacks.push(callback);
          
          return {
            unsubscribe: () => {
              const index = callbacks.indexOf(callback);
              if (index > -1) {
                callbacks.splice(index, 1);
              }
            }
          };
        }
        
        async publish<T = any>(event: string, data: T): Promise<void> {
          const callbacks = this.events.get(event);
          if (callbacks) {
            await Promise.all(callbacks.map(callback => Promise.resolve(callback(data))));
          }
        }
        
        async publishSequential<T = any>(event: string, data: T): Promise<void> {
          const callbacks = this.events.get(event);
          if (callbacks) {
            for (const callback of callbacks) {
              await Promise.resolve(callback(data));
            }
          }
        }
      }
      
      const eventBus = new AsyncEventBus();
      const results: string[] = [];
      
      // Mock async handlers
      const handler1 = vi.fn(async (data: string) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        results.push(`handler1: ${data}`);
      });
      
      const handler2 = vi.fn(async (data: string) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        results.push(`handler2: ${data}`);
      });
      
      const handler3 = vi.fn((data: string) => {
        results.push(`handler3: ${data}`);
      });
      
      eventBus.subscribe('async-event', handler1);
      eventBus.subscribe('async-event', handler2);
      eventBus.subscribe('async-event', handler3);
      
      // Test parallel execution
      await eventBus.publish('async-event', 'test data');
      
      expect(handler1).toHaveBeenCalledWith('test data');
      expect(handler2).toHaveBeenCalledWith('test data');
      expect(handler3).toHaveBeenCalledWith('test data');
      expect(results).toContain('handler1: test data');
      expect(results).toContain('handler2: test data');
      expect(results).toContain('handler3: test data');
      
      // Test sequential execution
      results.length = 0;
      await eventBus.publishSequential('async-event', 'sequential data');
      
      expect(results).toHaveLength(3);
      expect(results[0]).toBe('handler1: sequential data'); // Should be first due to sequential execution
    });
  });

  describe('Event Bus with Priority', () => {
    it('should handle event priorities', () => {
      interface SubscriptionOptions {
        priority?: number;
        once?: boolean;
      }
      
      interface PrioritySubscription {
        callback: (data: any) => void;
        priority: number;
        once: boolean;
      }
      
      class PriorityEventBus {
        private events = new Map<string, PrioritySubscription[]>();
        
        subscribe<T = any>(
          event: string,
          callback: (data: T) => void,
          options: SubscriptionOptions = {}
        ): { unsubscribe(): void } {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          
          const subscription: PrioritySubscription = {
            callback,
            priority: options.priority || 0,
            once: options.once || false
          };
          
          const subscriptions = this.events.get(event)!;
          subscriptions.push(subscription);
          
          // Sort by priority (higher priority first)
          subscriptions.sort((a, b) => b.priority - a.priority);
          
          return {
            unsubscribe: () => {
              const index = subscriptions.indexOf(subscription);
              if (index > -1) {
                subscriptions.splice(index, 1);
              }
            }
          };
        }
        
        publish<T = any>(event: string, data: T): void {
          const subscriptions = this.events.get(event);
          if (!subscriptions) return;
          
          const toRemove: PrioritySubscription[] = [];
          
          for (const subscription of subscriptions) {
            subscription.callback(data);
            
            if (subscription.once) {
              toRemove.push(subscription);
            }
          }
          
          // Remove one-time subscriptions
          toRemove.forEach(subscription => {
            const index = subscriptions.indexOf(subscription);
            if (index > -1) {
              subscriptions.splice(index, 1);
            }
          });
        }
      }
      
      const eventBus = new PriorityEventBus();
      const executionOrder: string[] = [];
      
      // Subscribe with different priorities
      eventBus.subscribe('priority-event', () => executionOrder.push('low'), { priority: 1 });
      eventBus.subscribe('priority-event', () => executionOrder.push('high'), { priority: 10 });
      eventBus.subscribe('priority-event', () => executionOrder.push('medium'), { priority: 5 });
      eventBus.subscribe('priority-event', () => executionOrder.push('once'), { priority: 15, once: true });
      
      // First publish
      eventBus.publish('priority-event', 'test');
      expect(executionOrder).toEqual(['once', 'high', 'medium', 'low']);
      
      // Second publish (once subscription should be gone)
      executionOrder.length = 0;
      eventBus.publish('priority-event', 'test2');
      expect(executionOrder).toEqual(['high', 'medium', 'low']);
    });
  });

  describe('Namespace Event Bus', () => {
    it('should support namespaced events', () => {
      class NamespaceEventBus {
        private events = new Map<string, Array<(data: any) => void>>();
        
        subscribe<T = any>(
          event: string,
          callback: (data: T) => void
        ): { unsubscribe(): void } {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          
          const callbacks = this.events.get(event)!;
          callbacks.push(callback);
          
          return {
            unsubscribe: () => {
              const index = callbacks.indexOf(callback);
              if (index > -1) {
                callbacks.splice(index, 1);
              }
            }
          };
        }
        
        subscribeToNamespace<T = any>(
          namespace: string,
          callback: (event: string, data: T) => void
        ): { unsubscribe(): void } {
          const subscriptions: Array<{ unsubscribe(): void }> = [];
          
          // Subscribe to existing events in namespace
          for (const eventName of this.events.keys()) {
            if (eventName.startsWith(`${namespace}:`)) {
              const subscription = this.subscribe(eventName, (data: T) => {
                callback(eventName, data);
              });
              subscriptions.push(subscription);
            }
          }
          
          return {
            unsubscribe: () => {
              subscriptions.forEach(sub => sub.unsubscribe());
            }
          };
        }
        
        publish<T = any>(event: string, data: T): void {
          const callbacks = this.events.get(event);
          if (callbacks) {
            callbacks.forEach(callback => callback(data));
          }
        }
        
        publishToNamespace<T = any>(namespace: string, data: T): void {
          for (const [eventName, callbacks] of this.events) {
            if (eventName.startsWith(`${namespace}:`)) {
              callbacks.forEach(callback => callback(data));
            }
          }
        }
        
        getEventsByNamespace(namespace: string): string[] {
          return Array.from(this.events.keys()).filter(event => 
            event.startsWith(`${namespace}:`)
          );
        }
      }
      
      const eventBus = new NamespaceEventBus();
      const userEvents: Array<{ event: string; data: any }> = [];
      const productEvents: Array<{ event: string; data: any }> = [];
      
      // Subscribe to specific events
      eventBus.subscribe('user:created', (data) => userEvents.push({ event: 'user:created', data }));
      eventBus.subscribe('user:updated', (data) => userEvents.push({ event: 'user:updated', data }));
      eventBus.subscribe('product:created', (data) => productEvents.push({ event: 'product:created', data }));
      
      // Subscribe to namespace
      const namespaceSubscription = eventBus.subscribeToNamespace('order', (event, data) => {
        console.log(`Order event: ${event}`, data);
      });
      
      eventBus.subscribe('order:created', () => {}); // This should be picked up by namespace subscription
      
      // Test individual event publishing
      eventBus.publish('user:created', { userId: '123', name: 'John' });
      eventBus.publish('product:created', { productId: '456', name: 'Widget' });
      
      expect(userEvents).toHaveLength(1);
      expect(userEvents[0].data.userId).toBe('123');
      expect(productEvents).toHaveLength(1);
      expect(productEvents[0].data.productId).toBe('456');
      
      // Test namespace publishing
      eventBus.publishToNamespace('user', { broadcast: true });
      expect(userEvents).toHaveLength(3); // Should trigger both user events
      
      // Test getting events by namespace
      const userEventNames = eventBus.getEventsByNamespace('user');
      expect(userEventNames).toContain('user:created');
      expect(userEventNames).toContain('user:updated');
      expect(userEventNames).not.toContain('product:created');
    });
  });

  describe('Event Bus with Replay', () => {
    it('should support event replay functionality', () => {
      interface ReplayOptions {
        maxEvents?: number;
        ttl?: number; // Time to live in milliseconds
      }
      
      interface StoredEvent<T = any> {
        event: string;
        data: T;
        timestamp: number;
      }
      
      class ReplayEventBus {
        private events = new Map<string, Array<(data: any) => void>>();
        private eventHistory: StoredEvent[] = [];
        private maxEvents: number;
        private ttl: number;
        
        constructor(options: ReplayOptions = {}) {
          this.maxEvents = options.maxEvents || 100;
          this.ttl = options.ttl || 60000; // 1 minute default
        }
        
        subscribe<T = any>(
          event: string,
          callback: (data: T) => void,
          replay: boolean = false
        ): { unsubscribe(): void } {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          
          const callbacks = this.events.get(event)!;
          callbacks.push(callback);
          
          // Replay recent events if requested
          if (replay) {
            this.replayEvents(event, callback);
          }
          
          return {
            unsubscribe: () => {
              const index = callbacks.indexOf(callback);
              if (index > -1) {
                callbacks.splice(index, 1);
              }
            }
          };
        }
        
        publish<T = any>(event: string, data: T): void {
          // Store event for replay
          const storedEvent: StoredEvent<T> = {
            event,
            data,
            timestamp: Date.now()
          };
          
          this.eventHistory.push(storedEvent);
          this.cleanupExpiredEvents();
          this.limitEventHistory();
          
          // Publish to current subscribers
          const callbacks = this.events.get(event);
          if (callbacks) {
            callbacks.forEach(callback => callback(data));
          }
        }
        
        private replayEvents<T>(event: string, callback: (data: T) => void): void {
          const now = Date.now();
          const recentEvents = this.eventHistory
            .filter(e => e.event === event && (now - e.timestamp) <= this.ttl)
            .sort((a, b) => a.timestamp - b.timestamp);
          
          recentEvents.forEach(storedEvent => {
            callback(storedEvent.data);
          });
        }
        
        private cleanupExpiredEvents(): void {
          const now = Date.now();
          this.eventHistory = this.eventHistory.filter(
            e => (now - e.timestamp) <= this.ttl
          );
        }
        
        private limitEventHistory(): void {
          if (this.eventHistory.length > this.maxEvents) {
            this.eventHistory = this.eventHistory.slice(-this.maxEvents);
          }
        }
        
        getEventHistory(event?: string): StoredEvent[] {
          if (event) {
            return this.eventHistory.filter(e => e.event === event);
          }
          return [...this.eventHistory];
        }
        
        clearHistory(): void {
          this.eventHistory = [];
        }
      }
      
      const eventBus = new ReplayEventBus({ maxEvents: 5, ttl: 1000 });
      const receivedEvents: any[] = [];
      
      // Publish some events before subscription
      eventBus.publish('test-event', 'event 1');
      eventBus.publish('test-event', 'event 2');
      eventBus.publish('other-event', 'other data');
      eventBus.publish('test-event', 'event 3');
      
      // Subscribe with replay
      eventBus.subscribe('test-event', (data) => {
        receivedEvents.push(data);
      }, true); // Enable replay
      
      // Should receive replayed events
      expect(receivedEvents).toEqual(['event 1', 'event 2', 'event 3']);
      
      // Publish new event
      eventBus.publish('test-event', 'event 4');
      expect(receivedEvents).toEqual(['event 1', 'event 2', 'event 3', 'event 4']);
      
      // Test history retrieval
      const testEventHistory = eventBus.getEventHistory('test-event');
      expect(testEventHistory).toHaveLength(4);
      expect(testEventHistory.map(e => e.data)).toEqual(['event 1', 'event 2', 'event 3', 'event 4']);
      
      const allHistory = eventBus.getEventHistory();
      expect(allHistory).toHaveLength(5); // 4 test-events + 1 other-event
      
      // Test max events limit
      eventBus.publish('test-event', 'event 5');
      eventBus.publish('test-event', 'event 6'); // Should push out 'other-event'
      
      const limitedHistory = eventBus.getEventHistory();
      expect(limitedHistory).toHaveLength(5); // Should be limited to maxEvents
    });
  });

  describe('Real-world Event Bus Usage', () => {
    it('should demonstrate practical event bus usage in an application', () => {
      // Define application events
      interface AppEvents {
        'user:login': { userId: string; username: string; timestamp: Date };
        'user:logout': { userId: string; timestamp: Date };
        'order:placed': { orderId: string; userId: string; total: number; timestamp: Date };
        'payment:processed': { paymentId: string; orderId: string; amount: number; status: 'success' | 'failed' };
        'notification:send': { userId: string; type: string; message: string };
      }
      
      class ApplicationEventBus {
        private events = new Map<keyof AppEvents, Array<(data: any) => void>>();
        private middlewares: Array<(event: keyof AppEvents, data: any, next: () => void) => void> = [];
        
        use(middleware: (event: keyof AppEvents, data: any, next: () => void) => void): void {
          this.middlewares.push(middleware);
        }
        
        subscribe<K extends keyof AppEvents>(
          event: K,
          callback: (data: AppEvents[K]) => void
        ): { unsubscribe(): void } {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          
          const callbacks = this.events.get(event)!;
          callbacks.push(callback);
          
          return {
            unsubscribe: () => {
              const index = callbacks.indexOf(callback);
              if (index > -1) {
                callbacks.splice(index, 1);
              }
            }
          };
        }
        
        publish<K extends keyof AppEvents>(event: K, data: AppEvents[K]): void {
          this.executeMiddlewares(event, data, 0, () => {
            const callbacks = this.events.get(event);
            if (callbacks) {
              callbacks.forEach(callback => callback(data));
            }
          });
        }
        
        private executeMiddlewares<K extends keyof AppEvents>(
          event: K,
          data: AppEvents[K],
          index: number,
          finalCallback: () => void
        ): void {
          if (index >= this.middlewares.length) {
            finalCallback();
            return;
          }
          
          const middleware = this.middlewares[index];
          middleware(event, data, () => {
            this.executeMiddlewares(event, data, index + 1, finalCallback);
          });
        }
      }
      
      // Create services that use the event bus
      class UserService {
        constructor(private eventBus: ApplicationEventBus) {}
        
        login(userId: string, username: string): void {
          // Simulate login logic
          console.log(`User ${username} logged in`);
          
          this.eventBus.publish('user:login', {
            userId,
            username,
            timestamp: new Date()
          });
        }
        
        logout(userId: string): void {
          // Simulate logout logic
          console.log(`User ${userId} logged out`);
          
          this.eventBus.publish('user:logout', {
            userId,
            timestamp: new Date()
          });
        }
      }
      
      class OrderService {
        constructor(private eventBus: ApplicationEventBus) {}
        
        placeOrder(orderId: string, userId: string, total: number): void {
          // Simulate order placement logic
          console.log(`Order ${orderId} placed by user ${userId}`);
          
          this.eventBus.publish('order:placed', {
            orderId,
            userId,
            total,
            timestamp: new Date()
          });
        }
      }
      
      class NotificationService {
        constructor(private eventBus: ApplicationEventBus) {
          this.setupSubscriptions();
        }
        
        private setupSubscriptions(): void {
          this.eventBus.subscribe('user:login', (data) => {
            this.sendNotification(data.userId, 'welcome', `Welcome back, ${data.username}!`);
          });
          
          this.eventBus.subscribe('order:placed', (data) => {
            this.sendNotification(data.userId, 'order_confirmation', `Your order ${data.orderId} has been placed.`);
          });
        }
        
        private sendNotification(userId: string, type: string, message: string): void {
          this.eventBus.publish('notification:send', {
            userId,
            type,
            message
          });
        }
      }
      
      class AnalyticsService {
        private events: Array<{ event: string; data: any; timestamp: Date }> = [];
        
        constructor(private eventBus: ApplicationEventBus) {
          this.setupSubscriptions();
        }
        
        private setupSubscriptions(): void {
          // Subscribe to all events for analytics
          this.eventBus.subscribe('user:login', (data) => this.track('user:login', data));
          this.eventBus.subscribe('user:logout', (data) => this.track('user:logout', data));
          this.eventBus.subscribe('order:placed', (data) => this.track('order:placed', data));
        }
        
        private track(event: string, data: any): void {
          this.events.push({
            event,
            data,
            timestamp: new Date()
          });
        }
        
        getEvents(): Array<{ event: string; data: any; timestamp: Date }> {
          return [...this.events];
        }
      }
      
      // Set up the application
      const eventBus = new ApplicationEventBus();
      
      // Add logging middleware
      const loggingMiddleware = vi.fn((event: keyof AppEvents, data: any, next: () => void) => {
        console.log(`[EVENT] ${String(event)}:`, data);
        next();
      });
      
      eventBus.use(loggingMiddleware);
      
      // Create services
      const userService = new UserService(eventBus);
      const orderService = new OrderService(eventBus);
      const notificationService = new NotificationService(eventBus);
      const analyticsService = new AnalyticsService(eventBus);
      
      // Track notifications
      const sentNotifications: Array<{ userId: string; type: string; message: string }> = [];
      eventBus.subscribe('notification:send', (data) => {
        sentNotifications.push(data);
      });
      
      // Simulate user interactions
      userService.login('user123', 'john_doe');
      orderService.placeOrder('order456', 'user123', 99.99);
      userService.logout('user123');
      
      // Verify events were processed
      expect(loggingMiddleware).toHaveBeenCalledTimes(5); // 3 main events + 2 notification events
      expect(sentNotifications).toHaveLength(2); // Welcome + order confirmation
      expect(sentNotifications[0].type).toBe('welcome');
      expect(sentNotifications[1].type).toBe('order_confirmation');
      
      const analyticsEvents = analyticsService.getEvents();
      expect(analyticsEvents).toHaveLength(3); // login, order, logout
      expect(analyticsEvents[0].event).toBe('user:login');
      expect(analyticsEvents[1].event).toBe('order:placed');
      expect(analyticsEvents[2].event).toBe('user:logout');
    });
  });
});