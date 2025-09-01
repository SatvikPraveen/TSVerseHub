// File: mini-projects/event-bus/Subscriber.ts

import { EventBus, EventHandler, EventSubscription } from './EventBus';

export interface SubscriberOptions {
  namespace?: string;
  autoStart?: boolean;
  enableMetrics?: boolean;
  errorStrategy?: 'ignore' | 'retry' | 'deadletter';
  maxRetries?: number;
  retryDelay?: number;
  deadLetterQueue?: string;
}

export interface SubscriptionConfig {
  eventName: string;
  handler: EventHandler;
  options?: {
    once?: boolean;
    priority?: number;
    filter?: (data: any) => boolean;
    transform?: (data: any) => any;
    retry?: boolean;
    maxRetries?: number;
    deadLetterQueue?: string;
  };
}

export interface SubscriptionMetrics {
  eventName: string;
  processedCount: number;
  errorCount: number;
  lastProcessed: Date | null;
  lastError: Date | null;
  averageProcessingTime: number;
}

export class Subscriber {
  private eventBus: EventBus;
  private options: Required<SubscriberOptions>;
  private subscriptions = new Map<string, EventSubscription>();
  private metrics = new Map<string, SubscriptionMetrics>();
  private isActive = false;
  private subscriberId: string;

  constructor(eventBus: EventBus, options: SubscriberOptions = {}) {
    this.eventBus = eventBus;
    this.subscriberId = this.generateSubscriberId();
    
    this.options = {
      namespace: options.namespace ?? '',
      autoStart: options.autoStart ?? true,
      enableMetrics: options.enableMetrics ?? true,
      errorStrategy: options.errorStrategy ?? 'retry',
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      deadLetterQueue: options.deadLetterQueue ?? 'dead-letter'
    };

    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * Start the subscriber
   */
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.emit('subscriber:started', { subscriberId: this.subscriberId });
  }

  /**
   * Stop the subscriber and unsubscribe from all events
   */
  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.unsubscribeAll();
    this.emit('subscriber:stopped', { subscriberId: this.subscriberId });
  }

  /**
   * Subscribe to an event
   */
  subscribe<T = any>(config: SubscriptionConfig): EventSubscription {
    const { eventName, handler, options = {} } = config;
    const fullEventName = this.getFullEventName(eventName);
    
    if (this.subscriptions.has(fullEventName)) {
      throw new Error(`Already subscribed to event: ${fullEventName}`);
    }

    // Initialize metrics
    if (this.options.enableMetrics) {
      this.initializeMetrics(fullEventName);
    }

    // Create wrapped handler with error handling and metrics
    const wrappedHandler = this.createWrappedHandler(fullEventName, handler, options);

    // Subscribe to the event
    const subscription = options.once 
      ? this.eventBus.once<T>(fullEventName, wrappedHandler)
      : this.eventBus.on<T>(fullEventName, wrappedHandler);

    this.subscriptions.set(fullEventName, subscription);

    this.emit('subscriber:subscribed', {
      subscriberId: this.subscriberId,
      eventName: fullEventName,
      options
    });

    return {
      unsubscribe: () => this.unsubscribe(eventName)
    };
  }

  /**
   * Subscribe to multiple events with the same handler
   */
  subscribeToMultiple<T = any>(
    eventNames: string[],
    handler: EventHandler<T>,
    options?: SubscriptionConfig['options']
  ): EventSubscription[] {
    return eventNames.map(eventName => 
      this.subscribe({ eventName, handler, options })
    );
  }

  /**
   * Subscribe to events matching a pattern
   */
  subscribeToPattern<T = any>(
    pattern: RegExp,
    handler: EventHandler<T>,
    options?: SubscriptionConfig['options']
  ): EventSubscription[] {
    const allEvents = this.eventBus.getEventNames();
    const matchingEvents = allEvents.filter(eventName => pattern.test(eventName));
    
    return this.subscribeToMultiple(matchingEvents, handler, options);
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(eventName: string): void {
    const fullEventName = this.getFullEventName(eventName);
    const subscription = this.subscriptions.get(fullEventName);
    
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(fullEventName);
      
      this.emit('subscriber:unsubscribed', {
        subscriberId: this.subscriberId,
        eventName: fullEventName
      });
    }
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribeAll(): void {
    for (const [eventName] of this.subscriptions) {
      this.unsubscribe(eventName.replace(`${this.options.namespace}:`, ''));
    }
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Check if subscribed to an event
   */
  isSubscribed(eventName: string): boolean {
    const fullEventName = this.getFullEventName(eventName);
    return this.subscriptions.has(fullEventName);
  }

  /**
   * Get subscription metrics
   */
  getMetrics(): SubscriptionMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics for a specific event
   */
  getEventMetrics(eventName: string): SubscriptionMetrics | null {
    const fullEventName = this.getFullEventName(eventName);
    return this.metrics.get(fullEventName) ?? null;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Create a filtered subscription
   */
  subscribeFiltered<T = any>(
    eventName: string,
    filter: (data: T) => boolean,
    handler: EventHandler<T>,
    options?: SubscriptionConfig['options']
  ): EventSubscription {
    return this.subscribe({
      eventName,
      handler,
      options: { ...options, filter }
    });
  }

  /**
   * Create a transformed subscription
   */
  subscribeTransformed<T = any, U = any>(
    eventName: string,
    transform: (data: T) => U,
    handler: EventHandler<U>,
    options?: SubscriptionConfig['options']
  ): EventSubscription {
    return this.subscribe({
      eventName,
      handler,
      options: { ...options, transform }
    });
  }

  /**
   * Create a throttled subscription
   */
  subscribeThrottled<T = any>(
    eventName: string,
    handler: EventHandler<T>,
    throttleMs: number,
    options?: SubscriptionConfig['options']
  ): EventSubscription {
    let lastExecution = 0;
    
    const throttledHandler: EventHandler<T> = (data) => {
      const now = Date.now();
      if (now - lastExecution >= throttleMs) {
        lastExecution = now;
        return handler(data);
      }
    };

    return this.subscribe({
      eventName,
      handler: throttledHandler,
      options
    });
  }

  /**
   * Create a debounced subscription
   */
  subscribeDebounced<T = any>(
    eventName: string,
    handler: EventHandler<T>,
    debounceMs: number,
    options?: SubscriptionConfig['options']
  ): EventSubscription {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const debouncedHandler: EventHandler<T> = (data) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        handler(data);
        timeoutId = null;
      }, debounceMs);
    };

    return this.subscribe({
      eventName,
      handler: debouncedHandler,
      options
    });
  }

  private createWrappedHandler<T = any>(
    eventName: string,
    handler: EventHandler<T>,
    options: SubscriptionConfig['options'] = {}
  ): EventHandler<T> {
    return async (data: T) => {
      if (!this.isActive) return;

      const startTime = Date.now();
      let processedData = data;

      try {
        // Apply filter if provided
        if (options.filter && !options.filter(data)) {
          return;
        }

        // Apply transform if provided
        if (options.transform) {
          processedData = options.transform(data);
        }

        // Call the actual handler
        await handler(processedData);

        // Update metrics
        if (this.options.enableMetrics) {
          this.updateSuccessMetrics(eventName, Date.now() - startTime);
        }

        // Send acknowledgment if required
        if ((data as any)?._requireAck && (data as any)?._ackEventName) {
          await this.eventBus.emit((data as any)._ackEventName, {
            subscriber: this.subscriberId,
            success: true,
            timestamp: new Date()
          });
        }

      } catch (error) {
        await this.handleError(eventName, error as Error, data, options);
      }
    };
  }

  private async handleError<T = any>(
    eventName: string,
    error: Error,
    data: T,
    options: SubscriptionConfig['options'] = {}
  ): Promise<void> {
    // Update error metrics
    if (this.options.enableMetrics) {
      this.updateErrorMetrics(eventName);
    }

    // Send error acknowledgment if required
    if ((data as any)?._requireAck && (data as any)?._ackEventName) {
      await this.eventBus.emit((data as any)._ackEventName, {
        subscriber: this.subscriberId,
        success: false,
        error: error.message,
        timestamp: new Date()
      });
    }

    // Apply error strategy
    switch (this.options.errorStrategy) {
      case 'ignore':
        // Do nothing, just log
        break;

      case 'retry':
        await this.handleRetry(eventName, error, data, options);
        break;

      case 'deadletter':
        await this.sendToDeadLetter(eventName, error, data);
        break;
    }

    // Emit error event
    this.emit('subscriber:error', {
      subscriberId: this.subscriberId,
      eventName,
      error,
      data,
      timestamp: new Date()
    });
  }

  private async handleRetry<T = any>(
    eventName: string,
    error: Error,
    data: T,
    options: SubscriptionConfig['options'] = {}
  ): Promise<void> {
    const maxRetries = options.maxRetries ?? this.options.maxRetries;
    const currentRetries = (data as any)._retryCount || 0;

    if (currentRetries < maxRetries) {
      setTimeout(async () => {
        const retryData = {
          ...data,
          _retryCount: currentRetries + 1,
          _originalError: error.message
        };

        await this.eventBus.emit(`${eventName}:retry`, retryData);
      }, this.options.retryDelay * Math.pow(2, currentRetries));
    } else {
      await this.sendToDeadLetter(eventName, error, data);
    }
  }

  private async sendToDeadLetter<T = any>(
    eventName: string,
    error: Error,
    data: T
  ): Promise<void> {
    const deadLetterData = {
      originalEvent: eventName,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      data,
      subscriberId: this.subscriberId,
      timestamp: new Date()
    };

    await this.eventBus.emit(this.options.deadLetterQueue, deadLetterData);
  }

  private initializeMetrics(eventName: string): void {
    if (!this.metrics.has(eventName)) {
      this.metrics.set(eventName, {
        eventName,
        processedCount: 0,
        errorCount: 0,
        lastProcessed: null,
        lastError: null,
        averageProcessingTime: 0
      });
    }
  }

  private updateSuccessMetrics(eventName: string, processingTime: number): void {
    const metrics = this.metrics.get(eventName);
    if (metrics) {
      metrics.processedCount++;
      metrics.lastProcessed = new Date();
      
      // Update average processing time
      metrics.averageProcessingTime = 
        (metrics.averageProcessingTime * (metrics.processedCount - 1) + processingTime) / 
        metrics.processedCount;
    }
  }

  private updateErrorMetrics(eventName: string): void {
    const metrics = this.metrics.get(eventName);
    if (metrics) {
      metrics.errorCount++;
      metrics.lastError = new Date();
    }
  }

  private emit<T = any>(eventName: string, data: T): void {
    this.eventBus.emitSync(`subscriber:${eventName}`, data);
  }

  private getFullEventName(eventName: string): string {
    return this.options.namespace 
      ? `${this.options.namespace}:${eventName}`
      : eventName;
  }

  private generateSubscriberId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Utility functions and decorators

/**
 * Create a subscriber with common configuration
 */
export function createSubscriber(eventBus: EventBus, options: SubscriberOptions = {}): Subscriber {
  return new Subscriber(eventBus, options);
}

/**
 * Create a namespaced subscriber
 */
export function createNamespacedSubscriber(
  eventBus: EventBus, 
  namespace: string, 
  options: Omit<SubscriberOptions, 'namespace'> = {}
): Subscriber {
  return new Subscriber(eventBus, { ...options, namespace });
}

/**
 * Decorator for automatic event subscription
 */
export function Subscribe(eventName: string, options?: SubscriptionConfig['options']) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    // Store subscription metadata
    if (!target._subscriptions) {
      target._subscriptions = [];
    }
    
    target._subscriptions.push({
      eventName,
      handler: originalMethod,
      options,
      methodName: propertyKey
    });

    return descriptor;
  };
}

/**
 * Mixin for adding subscription capabilities to classes
 */
export function withSubscriber<T extends new (...args: any[]) => {}>(
  Base: T, 
  eventBus: EventBus,
  options?: SubscriberOptions
) {
  return class extends Base {
    protected subscriber: Subscriber;

    constructor(...args: any[]) {
      super(...args);
      this.subscriber = new Subscriber(eventBus, options);
      this.autoSubscribe();
    }

    private autoSubscribe(): void {
      const subscriptions = (this as any)._subscriptions || [];
      
      for (const sub of subscriptions) {
        this.subscriber.subscribe({
          eventName: sub.eventName,
          handler: sub.handler.bind(this),
          options: sub.options
        });
      }
    }

    protected subscribe<U = any>(config: SubscriptionConfig): EventSubscription {
      return this.subscriber.subscribe(config);
    }

    protected unsubscribe(eventName: string): void {
      this.subscriber.unsubscribe(eventName);
    }

    destroy(): void {
      this.subscriber.stop();
      if (super.destroy) {
        super.destroy();
      }
    }
  };
}