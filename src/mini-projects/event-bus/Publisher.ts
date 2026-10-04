// File: mini-projects/event-bus/Publisher.ts

import { type EventBus } from './EventBus';

/** Acknowledgment payload sent back by subscribers on `<event>:ack`. */
export interface Acknowledgment {
  subscriber: string;
  success: boolean;
  error?: Error;
}

export interface PublisherOptions {
  namespace?: string;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableBatching?: boolean;
  batchSize?: number;
  batchTimeout?: number;
}

export interface PublishOptions {
  priority?: 'low' | 'normal' | 'high';
  delay?: number;
  retry?: boolean;
  maxRetries?: number;
  persistent?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  eventId: string;
  timestamp: Date;
  error?: Error;
  retryCount?: number;
}

export interface QueuedEvent {
  id: string;
  eventName: string;
  data: unknown;
  options: PublishOptions;
  timestamp: Date;
  retryCount: number;
  /** Settles the pending `publish()` promise once a batched event is flushed. */
  resolve?: (result: PublishResult) => void;
}

/** Acknowledgment request carried inside a payload published via `publishWithAck`. */
interface AckRequest {
  _requireAck: true;
  _ackEventName: string;
}

function isAckRequest(data: unknown): data is AckRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as Partial<AckRequest>)._requireAck === true &&
    typeof (data as Partial<AckRequest>)._ackEventName === 'string'
  );
}

export class Publisher {
  private eventBus: EventBus;
  private options: Required<PublisherOptions>;
  private eventQueue: QueuedEvent[] = [];
  private batchQueue: QueuedEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private eventIdCounter = 0;

  constructor(eventBus: EventBus, options: PublisherOptions = {}) {
    this.eventBus = eventBus;
    this.options = {
      namespace: options.namespace ?? '',
      enableRetry: options.enableRetry ?? true,
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      enableBatching: options.enableBatching ?? false,
      batchSize: options.batchSize ?? 10,
      batchTimeout: options.batchTimeout ?? 100
    };

    // Start processing queue
    this.startProcessing();
  }

  /**
   * Publish an event immediately
   */
  async publish<T = unknown>(
    eventName: string,
    data?: T,
    options: PublishOptions = {}
  ): Promise<PublishResult> {
    const eventId = this.generateEventId();
    const fullEventName = this.getFullEventName(eventName);
    const publishOptions = { ...options };

    try {
      // Handle delayed publishing
      if (publishOptions.delay && publishOptions.delay > 0) {
        return this.scheduleEvent(fullEventName, data, publishOptions);
      }

      // Handle batched publishing
      if (this.options.enableBatching && !publishOptions.priority) {
        return this.queueForBatch(eventId, fullEventName, data, publishOptions);
      }

      // Handle immediate publishing
      await this.emitEvent(fullEventName, data, publishOptions);

      return {
        success: true,
        eventId,
        timestamp: new Date()
      };
    } catch (error) {
      if (this.shouldRetry(publishOptions, 0)) {
        return this.queueForRetry(eventId, fullEventName, data, publishOptions, error as Error);
      }

      return {
        success: false,
        eventId,
        timestamp: new Date(),
        error: error as Error
      };
    }
  }

  /**
   * Publish multiple events in a transaction-like manner
   */
  async publishBatch<T = unknown>(
    events: Array<{
      eventName: string;
      data?: T;
      options?: PublishOptions;
    }>
  ): Promise<PublishResult[]> {
    const results: PublishResult[] = [];
    const errors: Error[] = [];

    for (const event of events) {
      try {
        const result = await this.publish(event.eventName, event.data, {
          ...event.options,
          retry: false // Disable retry for batch operations
        });
        results.push(result);

        if (!result.success) {
          errors.push(result.error ?? new Error(`Failed to publish event "${event.eventName}"`));
        }
      } catch (error) {
        const eventId = this.generateEventId();
        results.push({
          success: false,
          eventId,
          timestamp: new Date(),
          error: error as Error
        });
        errors.push(error as Error);
      }
    }

    // If any events failed and rollback is enabled, emit rollback event
    if (errors.length > 0) {
      await this.eventBus.emit('publisher:batch:failed', {
        results,
        errors,
        timestamp: new Date()
      });
    }

    return results;
  }

  /**
   * Schedule an event to be published later
   */
  async scheduleEvent<T = unknown>(
    eventName: string,
    data?: T,
    options: PublishOptions = {}
  ): Promise<PublishResult> {
    const eventId = this.generateEventId();
    const delay = options.delay ?? 0;

    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await this.emitEvent(eventName, data, options);
          resolve({
            success: true,
            eventId,
            timestamp: new Date()
          });
        } catch (error) {
          if (this.shouldRetry(options, 0)) {
            const retryResult = await this.queueForRetry(
              eventId,
              eventName,
              data,
              options,
              error as Error
            );
            resolve(retryResult);
          } else {
            resolve({
              success: false,
              eventId,
              timestamp: new Date(),
              error: error as Error
            });
          }
        }
      }, delay);
    });
  }

  /**
   * Publish and wait for acknowledgment from subscribers
   */
  async publishWithAck<T = unknown>(
    eventName: string,
    data?: T,
    timeout: number = 5000
  ): Promise<{
    result: PublishResult;
    acknowledgments: Acknowledgment[];
  }> {
    const ackEventName = `${eventName}:ack`;
    const acknowledgments: Acknowledgment[] = [];

    // Set up acknowledgment listener
    const ackPromise = new Promise<void>((resolve, reject) => {
      const ackTimeout = setTimeout(() => {
        this.eventBus.off(ackEventName, ackHandler);
        reject(new Error('Acknowledgment timeout'));
      }, timeout);

      const ackHandler = (ackData: Acknowledgment) => {
        acknowledgments.push(ackData);
        clearTimeout(ackTimeout);
        this.eventBus.off(ackEventName, ackHandler);
        resolve();
      };

      this.eventBus.on(ackEventName, ackHandler);
    });

    // Publish the event
    const result = await this.publish(eventName, {
      ...data,
      _requireAck: true,
      _ackEventName: ackEventName
    });

    try {
      await ackPromise;
    } catch {
      // Timeout or other error
    }

    return { result, acknowledgments };
  }

  /**
   * Get publisher statistics
   */
  getStats(): {
    queueLength: number;
    batchQueueLength: number;
    isProcessing: boolean;
    totalPublished: number;
    totalFailed: number;
  } {
    return {
      queueLength: this.eventQueue.length,
      batchQueueLength: this.batchQueue.length,
      isProcessing: this.isProcessing,
      totalPublished: this.eventIdCounter,
      totalFailed: 0 // Could track this if needed
    };
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.eventQueue.length = 0;
    this.batchQueue.length = 0;
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Stop the publisher and clear resources
   */
  destroy(): void {
    this.isProcessing = false;
    this.clearQueue();
  }

  private async emitEvent<T = unknown>(
    eventName: string,
    data?: T,
    options: PublishOptions = {}
  ): Promise<void> {
    // Acknowledgment markers set by `publishWithAck` must stay visible at the
    // top level of the envelope, which is what subscribers inspect.
    const ackRequest = isAckRequest(data)
      ? { _requireAck: data._requireAck, _ackEventName: data._ackEventName }
      : {};

    const eventData = {
      ...ackRequest,
      payload: data,
      metadata: {
        ...options.metadata,
        publishedAt: new Date(),
        priority: options.priority ?? 'normal'
      }
    };

    await this.eventBus.emit(eventName, eventData);

    // Emit publish event for monitoring
    await this.eventBus.emit('publisher:event:published', {
      eventName,
      options,
      timestamp: new Date()
    });
  }

  private queueForBatch(
    eventId: string,
    eventName: string,
    data: unknown,
    options: PublishOptions
  ): Promise<PublishResult> {
    return new Promise((resolve) => {
      const queuedEvent: QueuedEvent = {
        id: eventId,
        eventName,
        data,
        options,
        timestamp: new Date(),
        retryCount: 0,
        resolve
      };

      this.batchQueue.push(queuedEvent);

      // Start batch timer if not already running
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch();
        }, this.options.batchTimeout);
      }

      // Process batch if size limit reached
      if (this.batchQueue.length >= this.options.batchSize) {
        this.processBatch();
      }
    });
  }

  private async processBatch(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue.length = 0;

    // Group events by name for efficient processing
    const eventGroups = new Map<string, QueuedEvent[]>();
    
    for (const event of batch) {
      const group = eventGroups.get(event.eventName);
      if (group) {
        group.push(event);
      } else {
        eventGroups.set(event.eventName, [event]);
      }
    }

    // Process each group
    for (const [eventName, events] of eventGroups) {
      try {
        // Emit batch event
        await this.eventBus.emit(`${eventName}:batch`, {
          events: events.map(e => ({
            id: e.id,
            data: e.data,
            metadata: e.options.metadata
          })),
          count: events.length,
          timestamp: new Date()
        });

        // Resolve all promises in this batch
        for (const event of events) {
          if (event.resolve) {
            event.resolve({
              success: true,
              eventId: event.id,
              timestamp: new Date()
            });
          }
        }
      } catch (error) {
        // Handle batch failure
        for (const event of events) {
          if (event.resolve) {
            event.resolve({
              success: false,
              eventId: event.id,
              timestamp: new Date(),
              error: error as Error
            });
          }
        }
      }
    }
  }

  private async queueForRetry(
    eventId: string,
    eventName: string,
    data: unknown,
    options: PublishOptions,
    error: Error
  ): Promise<PublishResult> {
    const queuedEvent: QueuedEvent = {
      id: eventId,
      eventName,
      data,
      options,
      timestamp: new Date(),
      retryCount: 0
    };

    this.eventQueue.push(queuedEvent);

    return {
      success: false,
      eventId,
      timestamp: new Date(),
      error,
      retryCount: 0
    };
  }

  private shouldRetry(options: PublishOptions, currentRetries: number): boolean {
    if (!this.options.enableRetry || options.retry === false) {
      return false;
    }

    const maxRetries = options.maxRetries ?? this.options.maxRetries;
    return currentRetries < maxRetries;
  }

  private startProcessing(): void {
    this.isProcessing = true;
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.isProcessing) {
      if (this.eventQueue.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      const event = this.eventQueue.shift();
      if (!event) continue;
      
      try {
        await this.emitEvent(event.eventName, event.data, event.options);
        
        // Emit successful retry event
        await this.eventBus.emit('publisher:retry:success', {
          eventId: event.id,
          eventName: event.eventName,
          retryCount: event.retryCount,
          timestamp: new Date()
        });
      } catch (error) {
        event.retryCount++;
        
        if (this.shouldRetry(event.options, event.retryCount)) {
          // Add back to queue for retry with delay
          setTimeout(() => {
            if (this.isProcessing) {
              this.eventQueue.push(event);
            }
          }, this.options.retryDelay * Math.pow(2, event.retryCount - 1)); // Exponential backoff
        } else {
          // Emit failed event
          await this.eventBus.emit('publisher:retry:failed', {
            eventId: event.id,
            eventName: event.eventName,
            retryCount: event.retryCount,
            error: error as Error,
            timestamp: new Date()
          });
        }
      }
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${++this.eventIdCounter}`;
  }

  private getFullEventName(eventName: string): string {
    return this.options.namespace 
      ? `${this.options.namespace}:${eventName}`
      : eventName;
  }
}

// Utility functions for common publishing patterns

/**
 * Create a publisher with common configuration
 */
export function createPublisher(eventBus: EventBus, options: PublisherOptions = {}): Publisher {
  return new Publisher(eventBus, options);
}

/**
 * Create a namespaced publisher
 */
export function createNamespacedPublisher(
  eventBus: EventBus, 
  namespace: string, 
  options: Omit<PublisherOptions, 'namespace'> = {}
): Publisher {
  return new Publisher(eventBus, { ...options, namespace });
}

/**
 * Mixin for adding publishing capabilities to classes
 */
export function withPublisher<T extends new (...args: never[]) => object>(Base: T, eventBus: EventBus) {
  // TypeScript only allows `class extends <type parameter>` when that parameter is
  // constrained to `new (...args: any[]) => object`. Widening the concrete base
  // constructor to `unknown[]` instead keeps the mixin free of `any`; the precise
  // constructor signature is restored on the returned class below.
  const WidenedBase = Base as unknown as new (...args: unknown[]) => object;

  class Published extends WidenedBase {
    protected publisher: Publisher;

    constructor(...args: unknown[]) {
      super(...args);
      this.publisher = new Publisher(eventBus);
    }

    protected async publish<U = unknown>(
      eventName: string, 
      data?: U, 
      options?: PublishOptions
    ): Promise<PublishResult> {
      return this.publisher.publish(eventName, data, options);
    }

    protected async publishBatch<U = unknown>(
      events: Array<{
        eventName: string;
        data?: U;
        options?: PublishOptions;
      }>
    ): Promise<PublishResult[]> {
      return this.publisher.publishBatch(events);
    }
  }

  type Mixed = (new (...args: ConstructorParameters<T>) => InstanceType<T> & Published) &
    Omit<T, 'prototype'>;

  return Published as unknown as Mixed;
}