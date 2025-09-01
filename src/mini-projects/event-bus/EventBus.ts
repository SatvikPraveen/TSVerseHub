// File: mini-projects/event-bus/EventBus.ts

export type EventHandler<T = any> = (data: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe: () => void;
}

export interface EventBusOptions {
  maxListeners?: number;
  enableLogging?: boolean;
  enableMetrics?: boolean;
}

export interface EventMetrics {
  eventName: string;
  emitCount: number;
  lastEmitted: Date | null;
  listenerCount: number;
  errorCount: number;
}

export class EventBus {
  private listeners = new Map<string, Set<EventHandler>>();
  private onceListeners = new Map<string, Set<EventHandler>>();
  private options: Required<EventBusOptions>;
  private metrics = new Map<string, EventMetrics>();

  constructor(options: EventBusOptions = {}) {
    this.options = {
      maxListeners: options.maxListeners ?? 100,
      enableLogging: options.enableLogging ?? false,
      enableMetrics: options.enableMetrics ?? true
    };
  }

  /**
   * Subscribe to an event
   */
  on<T = any>(eventName: string, handler: EventHandler<T>): EventSubscription {
    this.validateEventName(eventName);
    this.validateHandler(handler);

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    const listeners = this.listeners.get(eventName)!;
    
    // Check max listeners limit
    if (listeners.size >= this.options.maxListeners) {
      throw new Error(
        `Maximum number of listeners (${this.options.maxListeners}) exceeded for event "${eventName}"`
      );
    }

    listeners.add(handler);
    this.updateMetrics(eventName);
    
    if (this.options.enableLogging) {
      console.log(`[EventBus] Subscribed to event: ${eventName}`);
    }

    return {
      unsubscribe: () => this.off(eventName, handler)
    };
  }

  /**
   * Subscribe to an event once (auto-unsubscribe after first emit)
   */
  once<T = any>(eventName: string, handler: EventHandler<T>): EventSubscription {
    this.validateEventName(eventName);
    this.validateHandler(handler);

    if (!this.onceListeners.has(eventName)) {
      this.onceListeners.set(eventName, new Set());
    }

    const onceListeners = this.onceListeners.get(eventName)!;
    onceListeners.add(handler);
    this.updateMetrics(eventName);

    if (this.options.enableLogging) {
      console.log(`[EventBus] Subscribed once to event: ${eventName}`);
    }

    return {
      unsubscribe: () => this.offOnce(eventName, handler)
    };
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(eventName: string, handler: EventHandler<T>): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.listeners.delete(eventName);
      }
      this.updateMetrics(eventName);
    }

    if (this.options.enableLogging) {
      console.log(`[EventBus] Unsubscribed from event: ${eventName}`);
    }
  }

  /**
   * Remove once listener
   */
  private offOnce<T = any>(eventName: string, handler: EventHandler<T>): void {
    const onceListeners = this.onceListeners.get(eventName);
    if (onceListeners) {
      onceListeners.delete(handler);
      if (onceListeners.size === 0) {
        this.onceListeners.delete(eventName);
      }
      this.updateMetrics(eventName);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  async emit<T = any>(eventName: string, data?: T): Promise<void> {
    this.validateEventName(eventName);

    if (this.options.enableLogging) {
      console.log(`[EventBus] Emitting event: ${eventName}`, data);
    }

    const promises: Promise<void>[] = [];
    let errorCount = 0;

    // Handle regular listeners
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      for (const handler of listeners) {
        try {
          const result = handler(data);
          if (result instanceof Promise) {
            promises.push(result.catch(error => {
              errorCount++;
              this.handleError(eventName, error, handler);
            }));
          }
        } catch (error) {
          errorCount++;
          this.handleError(eventName, error, handler);
        }
      }
    }

    // Handle once listeners
    const onceListeners = this.onceListeners.get(eventName);
    if (onceListeners) {
      const handlers = Array.from(onceListeners);
      this.onceListeners.delete(eventName); // Clear once listeners

      for (const handler of handlers) {
        try {
          const result = handler(data);
          if (result instanceof Promise) {
            promises.push(result.catch(error => {
              errorCount++;
              this.handleError(eventName, error, handler);
            }));
          }
        } catch (error) {
          errorCount++;
          this.handleError(eventName, error, handler);
        }
      }
    }

    // Wait for all async handlers
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }

    // Update metrics
    this.updateEmitMetrics(eventName, errorCount);
  }

  /**
   * Emit an event synchronously (doesn't wait for async handlers)
   */
  emitSync<T = any>(eventName: string, data?: T): void {
    this.validateEventName(eventName);

    if (this.options.enableLogging) {
      console.log(`[EventBus] Emitting sync event: ${eventName}`, data);
    }

    let errorCount = 0;

    // Handle regular listeners
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      for (const handler of listeners) {
        try {
          handler(data);
        } catch (error) {
          errorCount++;
          this.handleError(eventName, error, handler);
        }
      }
    }

    // Handle once listeners
    const onceListeners = this.onceListeners.get(eventName);
    if (onceListeners) {
      const handlers = Array.from(onceListeners);
      this.onceListeners.delete(eventName); // Clear once listeners

      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          errorCount++;
          this.handleError(eventName, error, handler);
        }
      }
    }

    // Update metrics
    this.updateEmitMetrics(eventName, errorCount);
  }

  /**
   * Remove all listeners for a specific event
   */
  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
      this.onceListeners.delete(eventName);
      this.updateMetrics(eventName);
      
      if (this.options.enableLogging) {
        console.log(`[EventBus] Removed all listeners for event: ${eventName}`);
      }
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
      this.metrics.clear();
      
      if (this.options.enableLogging) {
        console.log('[EventBus] Removed all listeners for all events');
      }
    }
  }

  /**
   * Get list of all registered event names
   */
  getEventNames(): string[] {
    const allEvents = new Set([
      ...this.listeners.keys(),
      ...this.onceListeners.keys()
    ]);
    return Array.from(allEvents);
  }

  /**
   * Get number of listeners for an event
   */
  getListenerCount(eventName: string): number {
    const regularCount = this.listeners.get(eventName)?.size ?? 0;
    const onceCount = this.onceListeners.get(eventName)?.size ?? 0;
    return regularCount + onceCount;
  }

  /**
   * Check if event has any listeners
   */
  hasListeners(eventName: string): boolean {
    return this.getListenerCount(eventName) > 0;
  }

  /**
   * Get event metrics
   */
  getMetrics(): EventMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics for a specific event
   */
  getEventMetrics(eventName: string): EventMetrics | null {
    return this.metrics.get(eventName) ?? null;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Create a namespaced event bus
   */
  createNamespace(namespace: string): NamespacedEventBus {
    return new NamespacedEventBus(this, namespace);
  }

  private validateEventName(eventName: string): void {
    if (typeof eventName !== 'string' || eventName.trim() === '') {
      throw new Error('Event name must be a non-empty string');
    }
  }

  private validateHandler(handler: EventHandler): void {
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function');
    }
  }

  private handleError(eventName: string, error: any, handler: EventHandler): void {
    if (this.options.enableLogging) {
      console.error(`[EventBus] Error in handler for event "${eventName}":`, error);
    }

    // Emit error event
    const errorListeners = this.listeners.get('error');
    if (errorListeners) {
      for (const errorHandler of errorListeners) {
        try {
          errorHandler({
            eventName,
            error,
            handler,
            timestamp: new Date()
          });
        } catch (errorInErrorHandler) {
          console.error('[EventBus] Error in error handler:', errorInErrorHandler);
        }
      }
    }
  }

  private updateMetrics(eventName: string): void {
    if (!this.options.enableMetrics) return;

    if (!this.metrics.has(eventName)) {
      this.metrics.set(eventName, {
        eventName,
        emitCount: 0,
        lastEmitted: null,
        listenerCount: 0,
        errorCount: 0
      });
    }

    const metrics = this.metrics.get(eventName)!;
    metrics.listenerCount = this.getListenerCount(eventName);
  }

  private updateEmitMetrics(eventName: string, errorCount: number): void {
    if (!this.options.enableMetrics) return;

    if (!this.metrics.has(eventName)) {
      this.updateMetrics(eventName);
    }

    const metrics = this.metrics.get(eventName)!;
    metrics.emitCount++;
    metrics.lastEmitted = new Date();
    metrics.errorCount += errorCount;
  }
}

/**
 * Namespaced Event Bus for organizing events
 */
export class NamespacedEventBus {
  constructor(
    private parentBus: EventBus,
    private namespace: string
  ) {}

  private getNamespacedEvent(eventName: string): string {
    return `${this.namespace}:${eventName}`;
  }

  on<T = any>(eventName: string, handler: EventHandler<T>): EventSubscription {
    return this.parentBus.on(this.getNamespacedEvent(eventName), handler);
  }

  once<T = any>(eventName: string, handler: EventHandler<T>): EventSubscription {
    return this.parentBus.once(this.getNamespacedEvent(eventName), handler);
  }

  off<T = any>(eventName: string, handler: EventHandler<T>): void {
    return this.parentBus.off(this.getNamespacedEvent(eventName), handler);
  }

  async emit<T = any>(eventName: string, data?: T): Promise<void> {
    return this.parentBus.emit(this.getNamespacedEvent(eventName), data);
  }

  emitSync<T = any>(eventName: string, data?: T): void {
    return this.parentBus.emitSync(this.getNamespacedEvent(eventName), data);
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      return this.parentBus.removeAllListeners(this.getNamespacedEvent(eventName));
    } else {
      // Remove all listeners for this namespace
      const allEvents = this.parentBus.getEventNames();
      const namespacePrefix = `${this.namespace}:`;
      
      for (const event of allEvents) {
        if (event.startsWith(namespacePrefix)) {
          this.parentBus.removeAllListeners(event);
        }
      }
    }
  }

  getListenerCount(eventName: string): number {
    return this.parentBus.getListenerCount(this.getNamespacedEvent(eventName));
  }

  hasListeners(eventName: string): boolean {
    return this.parentBus.hasListeners(this.getNamespacedEvent(eventName));
  }
}

// Default global event bus instance
export const globalEventBus = new EventBus({
  enableLogging: process.env.NODE_ENV === 'development',
  enableMetrics: true
});

// Utility function to create typed event emitters
export function createTypedEventBus<T extends Record<string, any>>(): {
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): EventSubscription;
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): EventSubscription;
  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void;
  emit<K extends keyof T>(event: K, data: T[K]): Promise<void>;
  emitSync<K extends keyof T>(event: K, data: T[K]): void;
} {
  const bus = new EventBus();
  
  return {
    on: <K extends keyof T>(event: K, handler: EventHandler<T[K]>) =>
      bus.on(event as string, handler),
    once: <K extends keyof T>(event: K, handler: EventHandler<T[K]>) =>
      bus.once(event as string, handler),
    off: <K extends keyof T>(event: K, handler: EventHandler<T[K]>) =>
      bus.off(event as string, handler),
    emit: <K extends keyof T>(event: K, data: T[K]) =>
      bus.emit(event as string, data),
    emitSync: <K extends keyof T>(event: K, data: T[K]) =>
      bus.emitSync(event as string, data)
  };
}