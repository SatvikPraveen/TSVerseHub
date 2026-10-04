// File: mini-projects/event-bus/Subscriber.ts

import { type EventBus, type EventHandler, type EventSubscription } from './EventBus';

export interface SubscriberOptions {
  namespace?: string;
  autoStart?: boolean;
  enableMetrics?: boolean;
  errorStrategy?: 'ignore' | 'retry' | 'deadletter';
  maxRetries?: number;
  retryDelay?: number;
  deadLetterQueue?: string;
}

/**
 * Per-subscription options. `T` is the raw event payload and `U` the payload
 * the handler receives (identical unless a `transform` is supplied).
 */
export interface SubscriptionOptions<T = unknown, U = T> {
  once?: boolean;
  priority?: number;
  filter?: (data: T) => boolean;
  transform?: (data: T) => U;
  retry?: boolean;
  maxRetries?: number;
  deadLetterQueue?: string;
}

export interface SubscriptionConfig<T = unknown, U = T> {
  eventName: string;
  handler: EventHandler<U>;
  options?: SubscriptionOptions<T, U>;
}

/** Optional acknowledgment request carried inside an event payload. */
interface AckRequest {
  _requireAck?: unknown;
  _ackEventName?: unknown;
}

/** Retry bookkeeping carried inside a re-emitted payload. */
interface RetryEnvelope {
  _retryCount?: unknown;
}

/** Subscription metadata recorded on a prototype by the `@Subscribe` decorator. */
interface DecoratedSubscription {
  eventName: string;
  handler: EventHandler<unknown>;
  options?: SubscriptionOptions;
  methodName: string;
}

interface SubscriptionHost {
  _subscriptions?: DecoratedSubscription[];
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Returns the ack event name when the payload asks for an acknowledgment. */
function getAckEventName(data: unknown): string | null {
  if (!isObjectLike(data)) return null;
  const { _requireAck, _ackEventName } = data as AckRequest;
  return _requireAck && typeof _ackEventName === 'string' && _ackEventName ? _ackEventName : null;
}

function getRetryCount(data: unknown): number {
  if (!isObjectLike(data)) return 0;
  const { _retryCount } = data as RetryEnvelope;
  return typeof _retryCount === 'number' ? _retryCount : 0;
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
  subscribe<T = unknown, U = T>(config: SubscriptionConfig<T, U>): EventSubscription {
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
    const wrappedHandler = this.createWrappedHandler<T, U>(fullEventName, handler, options);

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
  subscribeToMultiple<T = unknown>(
    eventNames: string[],
    handler: EventHandler<T>,
    options?: SubscriptionOptions<T>
  ): EventSubscription[] {
    return eventNames.map(eventName => 
      this.subscribe<T>({ eventName, handler, options })
    );
  }

  /**
   * Subscribe to events matching a pattern
   */
  subscribeToPattern<T = unknown>(
    pattern: RegExp,
    handler: EventHandler<T>,
    options?: SubscriptionOptions<T>
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
  subscribeFiltered<T = unknown>(
    eventName: string,
    filter: (data: T) => boolean,
    handler: EventHandler<T>,
    options?: SubscriptionOptions<T>
  ): EventSubscription {
    return this.subscribe<T>({
      eventName,
      handler,
      options: { ...options, filter }
    });
  }

  /**
   * Create a transformed subscription
   */
  subscribeTransformed<T = unknown, U = unknown>(
    eventName: string,
    transform: (data: T) => U,
    handler: EventHandler<U>,
    options?: SubscriptionOptions<T, U>
  ): EventSubscription {
    return this.subscribe<T, U>({
      eventName,
      handler,
      options: { ...options, transform }
    });
  }

  /**
   * Create a throttled subscription
   */
  subscribeThrottled<T = unknown>(
    eventName: string,
    handler: EventHandler<T>,
    throttleMs: number,
    options?: SubscriptionOptions<T>
  ): EventSubscription {
    let lastExecution = 0;
    
    const throttledHandler: EventHandler<T> = (data) => {
      const now = Date.now();
      if (now - lastExecution >= throttleMs) {
        lastExecution = now;
        return handler(data);
      }
    };

    return this.subscribe<T>({
      eventName,
      handler: throttledHandler,
      options
    });
  }

  /**
   * Create a debounced subscription
   */
  subscribeDebounced<T = unknown>(
    eventName: string,
    handler: EventHandler<T>,
    debounceMs: number,
    options?: SubscriptionOptions<T>
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

    return this.subscribe<T>({
      eventName,
      handler: debouncedHandler,
      options
    });
  }

  private createWrappedHandler<T, U>(
    eventName: string,
    handler: EventHandler<U>,
    options: SubscriptionOptions<T, U> = {}
  ): EventHandler<T> {
    return async (data: T) => {
      if (!this.isActive) return;

      const startTime = Date.now();

      try {
        // Apply filter if provided
        if (options.filter && !options.filter(data)) {
          return;
        }

        // Apply transform if provided; without one the handler receives the
        // raw payload (U defaults to T for callers that omit `transform`).
        const processedData: U = options.transform
          ? options.transform(data)
          : (data as unknown as U);

        // Call the actual handler
        await handler(processedData);

        // Update metrics
        if (this.options.enableMetrics) {
          this.updateSuccessMetrics(eventName, Date.now() - startTime);
        }

        // Send acknowledgment if required
        const ackEventName = getAckEventName(data);
        if (ackEventName) {
          await this.eventBus.emit(ackEventName, {
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

  private async handleError<T, U>(
    eventName: string,
    error: Error,
    data: T,
    options: SubscriptionOptions<T, U> = {}
  ): Promise<void> {
    // Update error metrics
    if (this.options.enableMetrics) {
      this.updateErrorMetrics(eventName);
    }

    // Send error acknowledgment if required
    const ackEventName = getAckEventName(data);
    if (ackEventName) {
      await this.eventBus.emit(ackEventName, {
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

  private async handleRetry<T, U>(
    eventName: string,
    error: Error,
    data: T,
    options: SubscriptionOptions<T, U> = {}
  ): Promise<void> {
    const maxRetries = options.maxRetries ?? this.options.maxRetries;
    const currentRetries = getRetryCount(data);

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

  private async sendToDeadLetter<T>(
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

  private emit(eventName: string, data: unknown): void {
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
export function Subscribe(eventName: string, options?: SubscriptionOptions) {
  return function(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod: EventHandler<unknown> = descriptor.value;
    const host = target as SubscriptionHost;

    // Store subscription metadata
    if (!host._subscriptions) {
      host._subscriptions = [];
    }
    
    host._subscriptions.push({
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
export function withSubscriber<T extends new (...args: never[]) => { destroy?(): void }>(
  Base: T, 
  eventBus: EventBus,
  options?: SubscriberOptions
) {
  // TypeScript only allows `class extends <type parameter>` when that parameter is
  // constrained to `new (...args: any[]) => object`. Widening the concrete base
  // constructor to `unknown[]` instead keeps the mixin free of `any`; the precise
  // constructor signature is restored on the returned class below.
  const WidenedBase = Base as unknown as new (...args: unknown[]) => { destroy?(): void };

  class Subscribed extends WidenedBase {
    protected subscriber: Subscriber;

    constructor(...args: unknown[]) {
      super(...args);
      this.subscriber = new Subscriber(eventBus, options);
      this.autoSubscribe();
    }

    private autoSubscribe(): void {
      const subscriptions = (this as SubscriptionHost)._subscriptions || [];
      
      for (const sub of subscriptions) {
        this.subscriber.subscribe({
          eventName: sub.eventName,
          handler: sub.handler.bind(this),
          options: sub.options
        });
      }
    }

    protected subscribe(config: SubscriptionConfig): EventSubscription {
      return this.subscriber.subscribe(config);
    }

    protected unsubscribe(eventName: string): void {
      this.subscriber.unsubscribe(eventName);
    }

    override destroy(): void {
      this.subscriber.stop();
      super.destroy?.();
    }
  }

  type Mixed = (new (...args: ConstructorParameters<T>) => InstanceType<T> & Subscribed) &
    Omit<T, 'prototype'>;

  return Subscribed as unknown as Mixed;
}