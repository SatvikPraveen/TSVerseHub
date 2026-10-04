// File: mini-projects/event-bus/EventBus.ts

export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

/**
 * Handlers are stored with a `never` payload: because function parameters are
 * contravariant, a handler for any concrete payload type is assignable to it.
 * The bus re-widens the payload type at the call site when it invokes them.
 */
type StoredHandler = EventHandler<never>;

/** Payload delivered to listeners of the reserved `error` event. */
export interface EventBusErrorEvent {
  eventName: string;
  error: unknown;
  handler: EventHandler<never>;
  timestamp: Date;
}

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
  private listeners = new Map<string, Set<StoredHandler>>();
  private onceListeners = new Map<string, Set<StoredHandler>>();
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
  on<T = unknown>(eventName: string, handler: EventHandler<T>): EventSubscription {
    this.validateEventName(eventName);
    this.validateHandler(handler);

    const listeners = this.ensureListenerSet(this.listeners, eventName);
    
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
  once<T = unknown>(eventName: string, handler: EventHandler<T>): EventSubscription {
    this.validateEventName(eventName);
    this.validateHandler(handler);

    const onceListeners = this.ensureListenerSet(this.onceListeners, eventName);
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
  off<T = unknown>(eventName: string, handler: EventHandler<T>): void {
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
  private offOnce<T = unknown>(eventName: string, handler: EventHandler<T>): void {
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
  async emit<T = unknown>(eventName: string, data?: T): Promise<void> {
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
          const result = this.invoke<T>(handler, data);
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
          const result = this.invoke<T>(handler, data);
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
  emitSync<T = unknown>(eventName: string, data?: T): void {
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
          this.invoke<T>(handler, data);
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
          this.invoke<T>(handler, data);
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

  private validateHandler(handler: StoredHandler): void {
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function');
    }
  }

  private invoke<T>(handler: StoredHandler, data: T | undefined): void | Promise<void> {
    return (handler as EventHandler<T | undefined>)(data);
  }

  private ensureListenerSet(
    registry: Map<string, Set<StoredHandler>>,
    eventName: string
  ): Set<StoredHandler> {
    let listeners = registry.get(eventName);
    if (!listeners) {
      listeners = new Set();
      registry.set(eventName, listeners);
    }
    return listeners;
  }

  private handleError(eventName: string, error: unknown, handler: StoredHandler): void {
    if (this.options.enableLogging) {
      console.error(`[EventBus] Error in handler for event "${eventName}":`, error);
    }

    // Emit error event
    const errorListeners = this.listeners.get('error');
    if (errorListeners) {
      for (const errorHandler of errorListeners) {
        try {
          const errorEvent: EventBusErrorEvent = {
            eventName,
            error,
            handler,
            timestamp: new Date()
          };
          (errorHandler as EventHandler<EventBusErrorEvent>)(errorEvent);
        } catch (errorInErrorHandler) {
          console.error('[EventBus] Error in error handler:', errorInErrorHandler);
        }
      }
    }
  }

  private ensureMetrics(eventName: string): EventMetrics {
    let metrics = this.metrics.get(eventName);
    if (!metrics) {
      metrics = {
        eventName,
        emitCount: 0,
        lastEmitted: null,
        listenerCount: this.getListenerCount(eventName),
        errorCount: 0
      };
      this.metrics.set(eventName, metrics);
    }
    return metrics;
  }

  private updateMetrics(eventName: string): void {
    if (!this.options.enableMetrics) return;

    const metrics = this.ensureMetrics(eventName);
    metrics.listenerCount = this.getListenerCount(eventName);
  }

  private updateEmitMetrics(eventName: string, errorCount: number): void {
    if (!this.options.enableMetrics) return;

    const metrics = this.ensureMetrics(eventName);
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

  on<T = unknown>(eventName: string, handler: EventHandler<T>): EventSubscription {
    return this.parentBus.on(this.getNamespacedEvent(eventName), handler);
  }

  once<T = unknown>(eventName: string, handler: EventHandler<T>): EventSubscription {
    return this.parentBus.once(this.getNamespacedEvent(eventName), handler);
  }

  off<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    return this.parentBus.off(this.getNamespacedEvent(eventName), handler);
  }

  async emit<T = unknown>(eventName: string, data?: T): Promise<void> {
    return this.parentBus.emit(this.getNamespacedEvent(eventName), data);
  }

  emitSync<T = unknown>(eventName: string, data?: T): void {
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
export function createTypedEventBus<T extends Record<string, unknown>>(): {
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