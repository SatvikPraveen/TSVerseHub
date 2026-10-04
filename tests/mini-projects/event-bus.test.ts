// File: tests/mini-projects/event-bus.test.ts
//
// Exercises the real event-bus mini-project modules: EventBus (core pub/sub,
// once, metrics, namespaces, typed buses), Publisher (immediate / delayed /
// batched publishing, retries, acknowledgements, mixin) and Subscriber
// (filters, transforms, throttle / debounce, error strategies, decorator and
// mixin).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTypedEventBus,
  EventBus,
  globalEventBus,
  NamespacedEventBus,
  type EventBusErrorEvent,
  type EventHandler,
} from '@/mini-projects/event-bus/EventBus';
import {
  createNamespacedPublisher,
  createPublisher,
  Publisher,
  withPublisher,
  type Acknowledgment,
  type PublisherOptions,
  type PublishResult,
} from '@/mini-projects/event-bus/Publisher';
import {
  createNamespacedSubscriber,
  createSubscriber,
  Subscribe,
  Subscriber,
  withSubscriber,
  type SubscriberOptions,
} from '@/mini-projects/event-bus/Subscriber';

/** The envelope a Publisher wraps every payload in before emitting. */
interface Envelope<T = unknown> {
  payload: T;
  metadata: Record<string, unknown> & { publishedAt: Date; priority: string };
}

/** Lets a test wait for the microtask queue to drain without advancing timers. */
const flushMicrotasks = async (): Promise<void> => {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
};

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('subscribe / emit / off', () => {
    it('delivers payloads to every subscriber of an event', async () => {
      const first = vi.fn();
      const second = vi.fn();
      bus.on<{ id: number }>('user:created', first);
      bus.on<{ id: number }>('user:created', second);

      await bus.emit('user:created', { id: 1 });

      expect(first).toHaveBeenCalledWith({ id: 1 });
      expect(second).toHaveBeenCalledWith({ id: 1 });
    });

    it('does not deliver to unrelated events', async () => {
      const handler = vi.fn();
      bus.on('a', handler);

      await bus.emit('b', 1);

      expect(handler).not.toHaveBeenCalled();
    });

    it('unsubscribes through the returned subscription and through off()', async () => {
      const viaSubscription = vi.fn();
      const viaOff = vi.fn();
      const subscription = bus.on('evt', viaSubscription);
      bus.on('evt', viaOff);

      subscription.unsubscribe();
      bus.off('evt', viaOff);
      await bus.emit('evt');

      expect(viaSubscription).not.toHaveBeenCalled();
      expect(viaOff).not.toHaveBeenCalled();
      expect(bus.hasListeners('evt')).toBe(false);
      expect(bus.getEventNames()).toEqual([]);
    });

    it('ignores off() for handlers that were never registered', () => {
      expect(() => bus.off('nothing', () => undefined)).not.toThrow();
    });

    it('rejects empty event names and non-function handlers', async () => {
      expect(() => bus.on('', () => undefined)).toThrow('Event name must be a non-empty string');
      expect(() => bus.on('   ', () => undefined)).toThrow('Event name must be a non-empty string');
      expect(() => bus.on('ok', 'nope' as unknown as EventHandler)).toThrow('Event handler must be a function');
      expect(() => bus.emitSync('')).toThrow('Event name must be a non-empty string');
      await expect(bus.emit('')).rejects.toThrow('Event name must be a non-empty string');
    });

    it('enforces the maxListeners limit per event', () => {
      const limited = new EventBus({ maxListeners: 2 });
      limited.on('evt', () => undefined);
      limited.on('evt', () => undefined);

      expect(() => limited.on('evt', () => undefined)).toThrow(
        'Maximum number of listeners (2) exceeded for event "evt"'
      );
      // Other events are unaffected
      expect(() => limited.on('other', () => undefined)).not.toThrow();
    });

    it('awaits async handlers before resolving emit()', async () => {
      const order: string[] = [];
      bus.on('evt', async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        order.push('handler');
      });

      await bus.emit('evt');
      order.push('after-emit');

      expect(order).toEqual(['handler', 'after-emit']);
    });

    it('emitSync invokes handlers synchronously without awaiting async ones', () => {
      const sync = vi.fn();
      const asyncHandler = vi.fn(async () => undefined);
      bus.on('evt', sync);
      bus.on('evt', asyncHandler);

      bus.emitSync('evt', 'x');

      expect(sync).toHaveBeenCalledWith('x');
      expect(asyncHandler).toHaveBeenCalledWith('x');
    });
  });

  describe('once', () => {
    it('fires exactly once and is then removed', async () => {
      const handler = vi.fn();
      bus.once('evt', handler);
      expect(bus.getListenerCount('evt')).toBe(1);

      await bus.emit('evt', 1);
      await bus.emit('evt', 2);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(1);
      expect(bus.getListenerCount('evt')).toBe(0);
      expect(bus.getEventNames()).toEqual([]);
    });

    it('can be cancelled before it fires', async () => {
      const handler = vi.fn();
      bus.once('evt', handler).unsubscribe();

      await bus.emit('evt');

      expect(handler).not.toHaveBeenCalled();
      expect(bus.hasListeners('evt')).toBe(false);
    });

    it('works with emitSync too', () => {
      const handler = vi.fn();
      bus.once('evt', handler);

      bus.emitSync('evt');
      bus.emitSync('evt');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('counts once and regular listeners together', () => {
      bus.on('evt', () => undefined);
      bus.once('evt', () => undefined);

      expect(bus.getListenerCount('evt')).toBe(2);
      expect(bus.getEventNames()).toEqual(['evt']);
    });
  });

  describe('error handling', () => {
    it('isolates a throwing handler, still calls the others and reports via the error event', async () => {
      const failing = vi.fn(() => {
        throw new Error('boom');
      });
      const healthy = vi.fn();
      const errorEvents: EventBusErrorEvent[] = [];

      bus.on('evt', failing);
      bus.on('evt', healthy);
      bus.on<EventBusErrorEvent>('error', event => {
        errorEvents.push(event);
      });

      await bus.emit('evt', 'data');

      expect(healthy).toHaveBeenCalledWith('data');
      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0]!.eventName).toBe('evt');
      expect(errorEvents[0]!.error).toBeInstanceOf(Error);
      expect(errorEvents[0]!.handler).toBe(failing);
      expect(errorEvents[0]!.timestamp).toBeInstanceOf(Date);
    });

    it('reports rejected async handlers and still resolves emit()', async () => {
      const errorHandler = vi.fn();
      bus.on('evt', async () => {
        throw new Error('async boom');
      });
      bus.on('error', errorHandler);

      await expect(bus.emit('evt')).resolves.toBeUndefined();

      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(bus.getEventMetrics('evt')?.errorCount).toBe(1);
    });

    it('reports errors from once handlers under emit and emitSync', async () => {
      const errorHandler = vi.fn();
      bus.on('error', errorHandler);

      bus.once('a', () => {
        throw new Error('once sync');
      });
      bus.emitSync('a');

      bus.once('b', async () => {
        throw new Error('once async');
      });
      await bus.emit('b');

      expect(errorHandler).toHaveBeenCalledTimes(2);
    });

    it('swallows errors thrown inside error handlers', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      bus.on('evt', () => {
        throw new Error('first');
      });
      bus.on('error', () => {
        throw new Error('error handler failed');
      });

      await expect(bus.emit('evt')).resolves.toBeUndefined();
      expect(consoleError).toHaveBeenCalledWith('[EventBus] Error in error handler:', expect.any(Error));
    });
  });

  describe('metrics', () => {
    it('tracks listener count, emit count, errors and last emitted time', async () => {
      const handler = vi.fn();
      bus.on('evt', handler);
      bus.on('evt', () => {
        throw new Error('fail');
      });

      expect(bus.getEventMetrics('evt')).toMatchObject({
        eventName: 'evt',
        emitCount: 0,
        lastEmitted: null,
        listenerCount: 2,
        errorCount: 0,
      });

      await bus.emit('evt');
      bus.emitSync('evt');

      const metrics = bus.getEventMetrics('evt')!;
      expect(metrics.emitCount).toBe(2);
      expect(metrics.errorCount).toBe(2);
      expect(metrics.lastEmitted).toBeInstanceOf(Date);
      expect(bus.getMetrics()).toEqual([metrics]);
    });

    it('returns null for unknown events and can be cleared', async () => {
      expect(bus.getEventMetrics('nope')).toBeNull();
      await bus.emit('evt');
      expect(bus.getMetrics()).toHaveLength(1);

      bus.clearMetrics();

      expect(bus.getMetrics()).toEqual([]);
    });

    it('records nothing when metrics are disabled', async () => {
      const quiet = new EventBus({ enableMetrics: false });
      quiet.on('evt', () => undefined);
      await quiet.emit('evt');

      expect(quiet.getMetrics()).toEqual([]);
      expect(quiet.getEventMetrics('evt')).toBeNull();
    });

    it('logs lifecycle messages when logging is enabled', async () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const loud = new EventBus({ enableLogging: true });
      const handler = () => {
        throw new Error('x');
      };

      loud.on('evt', handler);
      loud.once('evt', () => undefined);
      await loud.emit('evt', 1);
      loud.emitSync('evt');
      loud.off('evt', handler);
      loud.removeAllListeners('evt');
      loud.removeAllListeners();

      expect(log.mock.calls.map(call => call[0])).toEqual([
        '[EventBus] Subscribed to event: evt',
        '[EventBus] Subscribed once to event: evt',
        '[EventBus] Emitting event: evt',
        '[EventBus] Emitting sync event: evt',
        '[EventBus] Unsubscribed from event: evt',
        '[EventBus] Removed all listeners for event: evt',
        '[EventBus] Removed all listeners for all events',
      ]);
      expect(error).toHaveBeenCalledWith('[EventBus] Error in handler for event "evt":', expect.any(Error));
    });
  });

  describe('removeAllListeners', () => {
    it('removes regular and once listeners for a single event', async () => {
      const a = vi.fn();
      const b = vi.fn();
      bus.on('a', a);
      bus.once('a', a);
      bus.on('b', b);

      bus.removeAllListeners('a');
      await bus.emit('a');
      await bus.emit('b');

      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledTimes(1);
      expect(bus.getEventMetrics('a')?.listenerCount).toBe(0);
    });

    it('removes everything, including metrics, when called without an event', () => {
      bus.on('a', () => undefined);
      bus.once('b', () => undefined);

      bus.removeAllListeners();

      expect(bus.getEventNames()).toEqual([]);
      expect(bus.getMetrics()).toEqual([]);
    });
  });

  describe('NamespacedEventBus', () => {
    it('prefixes every event with the namespace', async () => {
      const ns = bus.createNamespace('auth');
      const handler = vi.fn();
      ns.on('login', handler);

      expect(ns).toBeInstanceOf(NamespacedEventBus);
      expect(bus.getEventNames()).toEqual(['auth:login']);
      expect(ns.hasListeners('login')).toBe(true);
      expect(ns.getListenerCount('login')).toBe(1);

      await ns.emit('login', { user: 'a' });
      await bus.emit('auth:login', { user: 'b' });
      await bus.emit('login', { user: 'c' });

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, { user: 'a' });
      expect(handler).toHaveBeenNthCalledWith(2, { user: 'b' });
    });

    it('supports once, off and emitSync', () => {
      const ns = bus.createNamespace('ns');
      const once = vi.fn();
      const regular = vi.fn();
      ns.once('evt', once);
      ns.on('evt', regular);

      ns.emitSync('evt', 1);
      ns.off('evt', regular);
      ns.emitSync('evt', 2);

      expect(once).toHaveBeenCalledTimes(1);
      expect(regular).toHaveBeenCalledTimes(1);
      expect(ns.hasListeners('evt')).toBe(false);
    });

    it('removes listeners only within its namespace', () => {
      const ns = bus.createNamespace('ns');
      ns.on('a', () => undefined);
      ns.on('b', () => undefined);
      bus.on('other', () => undefined);

      ns.removeAllListeners('a');
      expect(bus.getEventNames()).toEqual(['ns:b', 'other']);

      ns.removeAllListeners();
      expect(bus.getEventNames()).toEqual(['other']);
    });
  });

  describe('createTypedEventBus', () => {
    interface Events extends Record<string, unknown> {
      'count': number;
      'greet': { name: string };
    }

    it('routes typed events to the matching handlers', async () => {
      const typed = createTypedEventBus<Events>();
      const count = vi.fn<(n: number) => void>();
      const greet = vi.fn<(g: { name: string }) => void>();
      typed.on('count', count);
      typed.once('greet', greet);

      await typed.emit('count', 1);
      typed.emitSync('count', 2);
      await typed.emit('greet', { name: 'Ada' });
      await typed.emit('greet', { name: 'Grace' });

      expect(count.mock.calls).toEqual([[1], [2]]);
      expect(greet).toHaveBeenCalledTimes(1);
      expect(greet).toHaveBeenCalledWith({ name: 'Ada' });

      typed.off('count', count);
      await typed.emit('count', 3);
      expect(count).toHaveBeenCalledTimes(2);
    });
  });

  it('exposes a shared global bus instance', async () => {
    const handler = vi.fn();
    const subscription = globalEventBus.on('global:test', handler);
    await globalEventBus.emit('global:test', 42);
    subscription.unsubscribe();

    expect(handler).toHaveBeenCalledWith(42);
    expect(globalEventBus.hasListeners('global:test')).toBe(false);
  });
});

describe('Publisher', () => {
  let bus: EventBus;
  const publishers: Publisher[] = [];

  const makePublisher = (options?: PublisherOptions) => {
    const publisher = createPublisher(bus, options);
    publishers.push(publisher);
    return publisher;
  };

  beforeEach(() => {
    bus = new EventBus();
  });

  afterEach(() => {
    while (publishers.length > 0) publishers.pop()!.destroy();
    vi.useRealTimers();
  });

  describe('publish', () => {
    it('wraps the payload in an envelope with metadata and resolves successfully', async () => {
      const publisher = makePublisher();
      const received: Envelope<{ id: number }>[] = [];
      bus.on<Envelope<{ id: number }>>('order:created', data => {
        received.push(data);
      });

      const result = await publisher.publish('order:created', { id: 7 }, { metadata: { source: 'test' } });

      expect(result.success).toBe(true);
      expect(result.eventId).toMatch(/^evt_\d+_1$/);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(received).toHaveLength(1);
      expect(received[0]!.payload).toEqual({ id: 7 });
      expect(received[0]!.metadata).toMatchObject({ source: 'test', priority: 'normal' });
      expect(received[0]!.metadata.publishedAt).toBeInstanceOf(Date);
    });

    it('emits a monitoring event for every publish', async () => {
      const publisher = makePublisher();
      const monitor = vi.fn();
      bus.on('publisher:event:published', monitor);

      await publisher.publish('x', 1, { priority: 'high' });

      expect(monitor).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: 'x', options: { priority: 'high' } })
      );
    });

    it('prefixes events with the publisher namespace', async () => {
      const publisher = createNamespacedPublisher(bus, 'shop');
      publishers.push(publisher);
      const handler = vi.fn();
      bus.on('shop:checkout', handler);

      await publisher.publish('checkout', { total: 10 });

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ payload: { total: 10 } }));
    });

    it('returns a failed result without queuing when retry is disabled', async () => {
      const publisher = makePublisher({ enableRetry: false });
      vi.spyOn(bus, 'emit').mockRejectedValueOnce(new Error('transport down'));

      const result = await publisher.publish('x', 1);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('transport down');
      expect(result.retryCount).toBeUndefined();
      expect(publisher.getStats().queueLength).toBe(0);
    });

    it('queues a failed publish for retry and reports success once it goes through', async () => {
      vi.useFakeTimers();
      const publisher = makePublisher({ retryDelay: 10 });
      const original = bus.emit.bind(bus);
      let failuresLeft = 1;
      vi.spyOn(bus, 'emit').mockImplementation(async (eventName, data) => {
        if (eventName === 'flaky' && failuresLeft > 0) {
          failuresLeft--;
          throw new Error('flaky failure');
        }
        return original(eventName, data);
      });
      const delivered = vi.fn();
      const retrySuccess = vi.fn();
      bus.on('flaky', delivered);
      bus.on('publisher:retry:success', retrySuccess);

      const result = await publisher.publish('flaky', 'payload');
      expect(result).toMatchObject({ success: false, retryCount: 0 });
      expect(result.error?.message).toBe('flaky failure');
      expect(publisher.getStats().queueLength).toBe(1);

      await vi.advanceTimersByTimeAsync(150);

      expect(delivered).toHaveBeenCalledWith(expect.objectContaining({ payload: 'payload' }));
      expect(retrySuccess).toHaveBeenCalledWith(
        expect.objectContaining({ eventId: result.eventId, eventName: 'flaky', retryCount: 0 })
      );
      expect(publisher.getStats().queueLength).toBe(0);
    });

    it('gives up after maxRetries with exponential back-off and emits retry:failed', async () => {
      vi.useFakeTimers();
      const publisher = makePublisher({ maxRetries: 2, retryDelay: 10 });
      const original = bus.emit.bind(bus);
      vi.spyOn(bus, 'emit').mockImplementation(async (eventName, data) => {
        if (eventName === 'doomed') throw new Error('always fails');
        return original(eventName, data);
      });
      const retryFailed = vi.fn();
      bus.on('publisher:retry:failed', retryFailed);

      const result = await publisher.publish('doomed', 1);
      expect(result.success).toBe(false);

      // 100ms poll -> attempt 1 fails -> 10ms back-off -> poll -> attempt 2 fails -> exhausted
      await vi.advanceTimersByTimeAsync(500);

      expect(retryFailed).toHaveBeenCalledTimes(1);
      expect(retryFailed).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: 'doomed', retryCount: 2, error: expect.any(Error) })
      );
    });

    it('honours per-publish maxRetries over the publisher default', async () => {
      const publisher = makePublisher({ maxRetries: 3 });
      vi.spyOn(bus, 'emit').mockRejectedValueOnce(new Error('nope'));

      const result = await publisher.publish('x', 1, { maxRetries: 0 });

      expect(result.success).toBe(false);
      expect(result.retryCount).toBeUndefined();
      expect(publisher.getStats().queueLength).toBe(0);
    });
  });

  describe('delayed publishing', () => {
    it('schedules the emit after the requested delay', async () => {
      vi.useFakeTimers();
      const publisher = makePublisher();
      const handler = vi.fn();
      bus.on('later', handler);

      const pending = publisher.publish('later', 'soon', { delay: 50 });
      await vi.advanceTimersByTimeAsync(49);
      expect(handler).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      const result = await pending;

      expect(handler).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
    });

    it('reports delayed failures, queuing for retry when allowed', async () => {
      vi.useFakeTimers();
      const publisher = makePublisher({ retryDelay: 1 });
      vi.spyOn(bus, 'emit').mockRejectedValue(new Error('late failure'));

      const retried = publisher.scheduleEvent('x', 1, { delay: 5 });
      const notRetried = publisher.scheduleEvent('x', 1, { delay: 5, retry: false });
      await vi.advanceTimersByTimeAsync(5);

      await expect(retried).resolves.toMatchObject({ success: false, retryCount: 0 });
      await expect(notRetried).resolves.toMatchObject({ success: false });
      expect((await notRetried).retryCount).toBeUndefined();
    });
  });

  describe('batching', () => {
    it('flushes queued events together as a :batch event when the batch size is reached', async () => {
      const publisher = makePublisher({ enableBatching: true, batchSize: 2, batchTimeout: 10_000 });
      const batches: Array<{ events: Array<{ id: string; data: unknown; metadata?: unknown }>; count: number }> = [];
      bus.on<(typeof batches)[number]>('metric:batch', batch => {
        batches.push(batch);
      });

      const results = await Promise.all([
        publisher.publish('metric', 1, { metadata: { unit: 'ms' } }),
        publisher.publish('metric', 2),
      ]);

      expect(results.every(result => result.success)).toBe(true);
      expect(batches).toHaveLength(1);
      expect(batches[0]!.count).toBe(2);
      expect(batches[0]!.events.map(event => event.data)).toEqual([1, 2]);
      expect(batches[0]!.events[0]!.metadata).toEqual({ unit: 'ms' });
      expect(publisher.getStats().batchQueueLength).toBe(0);
    });

    it('flushes a partial batch when the timeout elapses', async () => {
      vi.useFakeTimers();
      const publisher = makePublisher({ enableBatching: true, batchSize: 10, batchTimeout: 100 });
      const batch = vi.fn();
      bus.on('metric:batch', batch);

      const pending = publisher.publish('metric', 'only');
      expect(publisher.getStats().batchQueueLength).toBe(1);

      await vi.advanceTimersByTimeAsync(100);
      await expect(pending).resolves.toMatchObject({ success: true });
      expect(batch).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }));
    });

    it('bypasses batching for prioritised events', async () => {
      const publisher = makePublisher({ enableBatching: true, batchTimeout: 10_000 });
      const direct = vi.fn();
      bus.on('urgent', direct);

      const result = await publisher.publish('urgent', 1, { priority: 'high' });

      expect(result.success).toBe(true);
      expect(direct).toHaveBeenCalledTimes(1);
      expect(publisher.getStats().batchQueueLength).toBe(0);
    });

    it('fails every event of a batch whose :batch emit rejects', async () => {
      const publisher = makePublisher({ enableBatching: true, batchSize: 2 });
      vi.spyOn(bus, 'emit').mockRejectedValue(new Error('batch down'));

      const results = await Promise.all([publisher.publish('m', 1), publisher.publish('m', 2)]);

      expect(results.map(result => result.success)).toEqual([false, false]);
      expect(results[0]!.error?.message).toBe('batch down');
    });

    it('clearQueue drops pending batches and cancels the timer', async () => {
      vi.useFakeTimers();
      const publisher = makePublisher({ enableBatching: true, batchTimeout: 50 });
      const batch = vi.fn();
      bus.on('m:batch', batch);

      void publisher.publish('m', 1);
      publisher.clearQueue();
      await vi.advanceTimersByTimeAsync(200);

      expect(batch).not.toHaveBeenCalled();
      expect(publisher.getStats()).toMatchObject({ queueLength: 0, batchQueueLength: 0 });
    });
  });

  describe('publishBatch', () => {
    it('publishes every event in order and reports per-event results', async () => {
      const publisher = makePublisher();
      const seen: string[] = [];
      bus.on<Envelope<string>>('a', data => {
        seen.push(`a:${data.payload}`);
      });
      bus.on<Envelope<string>>('b', data => {
        seen.push(`b:${data.payload}`);
      });

      const results = await publisher.publishBatch([
        { eventName: 'a', data: '1' },
        { eventName: 'b', data: '2' },
      ]);

      expect(seen).toEqual(['a:1', 'b:2']);
      expect(results).toHaveLength(2);
      expect(results.every(result => result.success)).toBe(true);
      expect(publisher.getStats().totalPublished).toBe(2);
    });

    it('never queues retries for batch members and emits publisher:batch:failed on any failure', async () => {
      const publisher = makePublisher();
      const original = bus.emit.bind(bus);
      vi.spyOn(bus, 'emit').mockImplementation(async (eventName, data) => {
        if (eventName === 'bad') throw new Error('bad event');
        return original(eventName, data);
      });
      const batchFailed = vi.fn();
      bus.on('publisher:batch:failed', batchFailed);

      const results = await publisher.publishBatch([{ eventName: 'good' }, { eventName: 'bad' }]);

      expect(results.map(result => result.success)).toEqual([true, false]);
      expect(publisher.getStats().queueLength).toBe(0);
      expect(batchFailed).toHaveBeenCalledTimes(1);
      const failure = batchFailed.mock.calls[0]![0] as { results: PublishResult[]; errors: Error[] };
      expect(failure.errors).toHaveLength(1);
      expect(failure.errors[0]!.message).toBe('bad event');
      expect(failure.results).toHaveLength(2);
    });
  });

  describe('publishWithAck', () => {
    it('collects the acknowledgement a Subscriber sends back', async () => {
      const publisher = makePublisher();
      const subscriber = createSubscriber(bus);
      const handler = vi.fn();
      subscriber.subscribe({ eventName: 'job', handler });

      const { result, acknowledgments } = await publisher.publishWithAck('job', { task: 'build' }, 200);

      expect(result.success).toBe(true);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ task: 'build' }) }));
      expect(acknowledgments).toHaveLength(1);
      expect(acknowledgments[0]).toMatchObject({ success: true, subscriber: expect.stringMatching(/^sub_/) });
      subscriber.stop();
    });

    it('resolves with a failed acknowledgement when the subscriber handler throws', async () => {
      const publisher = makePublisher();
      const subscriber = createSubscriber(bus, { errorStrategy: 'ignore' });
      subscriber.subscribe({
        eventName: 'job',
        handler: () => {
          throw new Error('cannot process');
        },
      });

      const { acknowledgments } = await publisher.publishWithAck('job', { task: 'x' }, 200);

      expect(acknowledgments).toHaveLength(1);
      expect(acknowledgments[0]).toMatchObject({ success: false, error: 'cannot process' });
      subscriber.stop();
    });

    it('times out gracefully when nobody acknowledges', async () => {
      vi.useFakeTimers();
      const publisher = makePublisher();
      const pending = publisher.publishWithAck('silent', { a: 1 }, 30);
      await vi.advanceTimersByTimeAsync(30);

      const { result, acknowledgments } = await pending;

      expect(result.success).toBe(true);
      expect(acknowledgments).toEqual([]);
      expect(bus.hasListeners('silent:ack')).toBe(false);
    });

    it('accepts manual acknowledgements on the :ack channel', async () => {
      const publisher = makePublisher();
      bus.on<Envelope<{ _ackEventName: string }>>('manual', async data => {
        const ack: Acknowledgment = { subscriber: 'manual-worker', success: true };
        await bus.emit(data.payload._ackEventName, ack);
      });

      const { acknowledgments } = await publisher.publishWithAck('manual', { id: 1 }, 200);

      expect(acknowledgments).toEqual([{ subscriber: 'manual-worker', success: true }]);
    });
  });

  describe('stats and lifecycle', () => {
    it('reports queue lengths, processing state and the number of events issued', async () => {
      const publisher = makePublisher();
      expect(publisher.getStats()).toEqual({
        queueLength: 0,
        batchQueueLength: 0,
        isProcessing: true,
        totalPublished: 0,
        totalFailed: 0,
      });

      await publisher.publish('a');
      await publisher.publish('b');

      expect(publisher.getStats().totalPublished).toBe(2);

      publisher.destroy();
      expect(publisher.getStats().isProcessing).toBe(false);
    });
  });

  describe('withPublisher mixin', () => {
    it('adds publishing capabilities to an existing class while preserving its constructor', async () => {
      class Counter {
        constructor(public readonly start: number) {}
        next(): number {
          return this.start + 1;
        }
      }
      const PublishingCounter = withPublisher(Counter, bus);

      class Reporter extends PublishingCounter {
        async report(): Promise<PublishResult> {
          return this.publish('counter:next', this.next());
        }
        async reportMany(): Promise<PublishResult[]> {
          return this.publishBatch([{ eventName: 'counter:a' }, { eventName: 'counter:b' }]);
        }
        shutdown(): void {
          this.publisher.destroy();
        }
      }

      const handler = vi.fn();
      bus.on('counter:next', handler);
      const reporter = new Reporter(41);

      expect(reporter).toBeInstanceOf(Counter);
      expect(reporter.start).toBe(41);
      const result = await reporter.report();
      const many = await reporter.reportMany();
      reporter.shutdown();

      expect(result.success).toBe(true);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ payload: 42 }));
      expect(many).toHaveLength(2);
    });
  });
});

describe('Subscriber', () => {
  let bus: EventBus;
  const subscribers: Subscriber[] = [];

  const makeSubscriber = (options?: SubscriberOptions) => {
    const subscriber = createSubscriber(bus, options);
    subscribers.push(subscriber);
    return subscriber;
  };

  beforeEach(() => {
    bus = new EventBus();
  });

  afterEach(() => {
    while (subscribers.length > 0) subscribers.pop()!.stop();
    vi.useRealTimers();
  });

  describe('subscribe / unsubscribe', () => {
    it('receives events and tracks its subscriptions', async () => {
      const subscriber = makeSubscriber();
      const handler = vi.fn();

      const subscription = subscriber.subscribe<{ id: number }>({ eventName: 'user:created', handler });
      await bus.emit('user:created', { id: 1 });

      expect(handler).toHaveBeenCalledWith({ id: 1 });
      expect(subscriber.isSubscribed('user:created')).toBe(true);
      expect(subscriber.getSubscriptions()).toEqual(['user:created']);

      subscription.unsubscribe();
      await bus.emit('user:created', { id: 2 });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(subscriber.isSubscribed('user:created')).toBe(false);
      expect(bus.hasListeners('user:created')).toBe(false);
    });

    it('refuses duplicate subscriptions to the same event', () => {
      const subscriber = makeSubscriber();
      subscriber.subscribe({ eventName: 'evt', handler: () => undefined });

      expect(() => subscriber.subscribe({ eventName: 'evt', handler: () => undefined })).toThrow(
        'Already subscribed to event: evt'
      );
    });

    it('supports once subscriptions', async () => {
      const subscriber = makeSubscriber();
      const handler = vi.fn();
      subscriber.subscribe({ eventName: 'evt', handler, options: { once: true } });

      await bus.emit('evt', 1);
      await bus.emit('evt', 2);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('subscribes to multiple events and to events matching a pattern', async () => {
      const subscriber = makeSubscriber();
      bus.on('order:created', () => undefined);
      bus.on('order:paid', () => undefined);
      bus.on('user:created', () => undefined);
      const multi = vi.fn();
      const pattern = vi.fn();

      subscriber.subscribeToMultiple(['a', 'b'], multi);
      const subscriptions = subscriber.subscribeToPattern(/^order:/, pattern);

      await bus.emit('a', 1);
      await bus.emit('b', 2);
      await bus.emit('order:paid', 3);
      await bus.emit('user:created', 4);

      expect(multi.mock.calls).toEqual([[1], [2]]);
      expect(subscriptions).toHaveLength(2);
      expect(pattern).toHaveBeenCalledTimes(1);
      expect(pattern).toHaveBeenCalledWith(3);
    });

    it('unsubscribeAll removes every subscription, including events whose names contain ":"', async () => {
      const subscriber = makeSubscriber();
      const handler = vi.fn();
      subscriber.subscribe({ eventName: 'user:created', handler });
      subscriber.subscribe({ eventName: 'plain', handler });

      subscriber.unsubscribeAll();
      await bus.emit('user:created');
      await bus.emit('plain');

      expect(handler).not.toHaveBeenCalled();
      expect(subscriber.getSubscriptions()).toEqual([]);
      expect(bus.getEventNames()).not.toContain('user:created');
    });

    it('unsubscribing an unknown event is a no-op', () => {
      const subscriber = makeSubscriber();
      expect(() => subscriber.unsubscribe('nothing')).not.toThrow();
    });
  });

  describe('namespaces', () => {
    it('prefixes subscriptions with the namespace', async () => {
      const subscriber = createNamespacedSubscriber(bus, 'shop');
      subscribers.push(subscriber);
      const handler = vi.fn();
      subscriber.subscribe({ eventName: 'checkout', handler });

      await bus.emit('shop:checkout', 1);
      await bus.emit('checkout', 2);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(subscriber.isSubscribed('checkout')).toBe(true);
      expect(subscriber.getSubscriptions()).toEqual(['shop:checkout']);
      expect(subscriber.getEventMetrics('checkout')?.eventName).toBe('shop:checkout');

      subscriber.unsubscribeAll();
      expect(subscriber.getSubscriptions()).toEqual([]);
      expect(bus.hasListeners('shop:checkout')).toBe(false);
    });
  });

  describe('lifecycle', () => {
    it('does not process events until started when autoStart is false', async () => {
      const subscriber = makeSubscriber({ autoStart: false });
      const handler = vi.fn();
      subscriber.subscribe({ eventName: 'evt', handler });

      await bus.emit('evt', 1);
      expect(handler).not.toHaveBeenCalled();

      subscriber.start();
      await bus.emit('evt', 2);
      expect(handler).toHaveBeenCalledWith(2);
    });

    it('announces its lifecycle on the bus', () => {
      const started = vi.fn();
      const stopped = vi.fn();
      const subscribed = vi.fn();
      const unsubscribed = vi.fn();
      bus.on('subscriber:started', started);
      bus.on('subscriber:stopped', stopped);
      bus.on('subscriber:subscribed', subscribed);
      bus.on('subscriber:unsubscribed', unsubscribed);

      const subscriber = makeSubscriber();
      subscriber.subscribe({ eventName: 'evt', handler: () => undefined, options: { priority: 1 } });
      subscriber.start(); // idempotent
      subscriber.stop();
      subscriber.stop(); // idempotent

      expect(started).toHaveBeenCalledTimes(1);
      expect(started).toHaveBeenCalledWith({ subscriberId: expect.stringMatching(/^sub_/) });
      expect(subscribed).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: 'evt', options: { priority: 1 } })
      );
      expect(unsubscribed).toHaveBeenCalledWith(expect.objectContaining({ eventName: 'evt' }));
      expect(stopped).toHaveBeenCalledTimes(1);
      expect(subscriber.getSubscriptions()).toEqual([]);
    });
  });

  describe('filters and transforms', () => {
    it('only calls the handler when the filter passes', async () => {
      const subscriber = makeSubscriber();
      const handler = vi.fn();
      subscriber.subscribeFiltered<number>('n', value => value % 2 === 0, handler);

      await bus.emit('n', 1);
      await bus.emit('n', 2);
      await bus.emit('n', 3);
      await bus.emit('n', 4);

      expect(handler.mock.calls).toEqual([[2], [4]]);
      expect(subscriber.getEventMetrics('n')?.processedCount).toBe(2);
    });

    it('passes the transformed payload to the handler', async () => {
      const subscriber = makeSubscriber();
      const handler = vi.fn();
      subscriber.subscribeTransformed<{ first: string; last: string }, string>(
        'person',
        person => `${person.first} ${person.last}`,
        handler
      );

      await bus.emit('person', { first: 'Ada', last: 'Lovelace' });

      expect(handler).toHaveBeenCalledWith('Ada Lovelace');
    });

    it('combines filter and transform through subscribe options', async () => {
      const subscriber = makeSubscriber();
      const handler = vi.fn();
      subscriber.subscribe<number, string>({
        eventName: 'n',
        handler,
        options: { filter: n => n > 0, transform: n => `#${n}` },
      });

      await bus.emit('n', -1);
      await bus.emit('n', 5);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('#5');
    });
  });

  describe('throttle and debounce', () => {
    it('throttles handler invocations to one per window', async () => {
      vi.useFakeTimers();
      const subscriber = makeSubscriber();
      const handler = vi.fn();
      subscriber.subscribeThrottled<number>('tick', handler, 100);

      await bus.emit('tick', 1);
      await bus.emit('tick', 2);
      await vi.advanceTimersByTimeAsync(100);
      await bus.emit('tick', 3);

      expect(handler.mock.calls).toEqual([[1], [3]]);
    });

    it('debounces so only the last payload within the window is handled', async () => {
      vi.useFakeTimers();
      const subscriber = makeSubscriber();
      const handler = vi.fn();
      subscriber.subscribeDebounced<number>('type', handler, 50);

      await bus.emit('type', 1);
      await vi.advanceTimersByTimeAsync(20);
      await bus.emit('type', 2);
      await vi.advanceTimersByTimeAsync(20);
      await bus.emit('type', 3);
      expect(handler).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(50);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(3);
    });
  });

  describe('metrics', () => {
    it('tracks processed and error counts with timing', async () => {
      const subscriber = makeSubscriber({ errorStrategy: 'ignore' });
      let shouldFail = false;
      subscriber.subscribe({
        eventName: 'evt',
        handler: () => {
          if (shouldFail) throw new Error('fail');
        },
      });

      expect(subscriber.getEventMetrics('evt')).toMatchObject({
        eventName: 'evt',
        processedCount: 0,
        errorCount: 0,
        lastProcessed: null,
        lastError: null,
        averageProcessingTime: 0,
      });

      await bus.emit('evt');
      shouldFail = true;
      await bus.emit('evt');

      const metrics = subscriber.getEventMetrics('evt')!;
      expect(metrics.processedCount).toBe(1);
      expect(metrics.errorCount).toBe(1);
      expect(metrics.lastProcessed).toBeInstanceOf(Date);
      expect(metrics.lastError).toBeInstanceOf(Date);
      expect(metrics.averageProcessingTime).toBeGreaterThanOrEqual(0);
      expect(subscriber.getMetrics()).toEqual([metrics]);

      subscriber.clearMetrics();
      expect(subscriber.getMetrics()).toEqual([]);
      expect(subscriber.getEventMetrics('evt')).toBeNull();
    });

    it('records nothing when metrics are disabled', async () => {
      const subscriber = makeSubscriber({ enableMetrics: false, errorStrategy: 'ignore' });
      subscriber.subscribe({
        eventName: 'evt',
        handler: () => {
          throw new Error('x');
        },
      });

      await bus.emit('evt');

      expect(subscriber.getMetrics()).toEqual([]);
    });
  });

  describe('error strategies', () => {
    it('"ignore" only emits subscriber:error', async () => {
      const subscriber = makeSubscriber({ errorStrategy: 'ignore' });
      const errorEvent = vi.fn();
      const deadLetter = vi.fn();
      bus.on('subscriber:error', errorEvent);
      bus.on('dead-letter', deadLetter);
      subscriber.subscribe({
        eventName: 'evt',
        handler: () => {
          throw new Error('ignored');
        },
      });

      await bus.emit('evt', { n: 1 });

      expect(errorEvent).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: 'evt', data: { n: 1 }, error: expect.any(Error) })
      );
      expect(deadLetter).not.toHaveBeenCalled();
    });

    it('"deadletter" forwards the failure to the configured dead-letter queue', async () => {
      const subscriber = makeSubscriber({ errorStrategy: 'deadletter', deadLetterQueue: 'dlq' });
      const deadLetter = vi.fn();
      bus.on('dlq', deadLetter);
      subscriber.subscribe({
        eventName: 'evt',
        handler: () => {
          throw new Error('cannot handle');
        },
      });

      await bus.emit('evt', { n: 1 });

      expect(deadLetter).toHaveBeenCalledWith(
        expect.objectContaining({
          originalEvent: 'evt',
          data: { n: 1 },
          error: expect.objectContaining({ message: 'cannot handle', name: 'Error' }),
          subscriberId: expect.stringMatching(/^sub_/),
        })
      );
    });

    it('"retry" re-emits on the :retry channel with exponential back-off, then dead-letters', async () => {
      vi.useFakeTimers();
      const subscriber = makeSubscriber({ errorStrategy: 'retry', maxRetries: 2, retryDelay: 10 });
      const retry = vi.fn();
      const deadLetter = vi.fn();
      bus.on('evt:retry', retry);
      bus.on('dead-letter', deadLetter);
      subscriber.subscribe({
        eventName: 'evt',
        handler: () => {
          throw new Error('still failing');
        },
      });

      await bus.emit('evt', { n: 1 });
      await flushMicrotasks();
      expect(retry).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(10);
      expect(retry).toHaveBeenCalledTimes(1);
      expect(retry).toHaveBeenCalledWith({ n: 1, _retryCount: 1, _originalError: 'still failing' });

      // Simulate the retry channel feeding back into the handler
      await bus.emit('evt', retry.mock.calls[0]![0]);
      await vi.advanceTimersByTimeAsync(20); // 10 * 2^1
      expect(retry).toHaveBeenCalledTimes(2);
      expect(retry.mock.calls[1]![0]).toMatchObject({ _retryCount: 2 });

      // Retries exhausted: the next failure goes to the dead-letter queue instead
      await bus.emit('evt', retry.mock.calls[1]![0]);
      await flushMicrotasks();
      expect(deadLetter).toHaveBeenCalledTimes(1);
      expect(deadLetter).toHaveBeenCalledWith(expect.objectContaining({ originalEvent: 'evt' }));
    });

    it('honours per-subscription maxRetries', async () => {
      vi.useFakeTimers();
      const subscriber = makeSubscriber({ errorStrategy: 'retry', maxRetries: 5, retryDelay: 1 });
      const deadLetter = vi.fn();
      bus.on('dead-letter', deadLetter);
      subscriber.subscribe({
        eventName: 'evt',
        handler: () => {
          throw new Error('x');
        },
        options: { maxRetries: 0 },
      });

      await bus.emit('evt', {});
      await flushMicrotasks();

      expect(deadLetter).toHaveBeenCalledTimes(1);
    });
  });

  describe('acknowledgements', () => {
    it('acknowledges payloads that carry an ack request', async () => {
      const subscriber = makeSubscriber();
      const ack = vi.fn();
      bus.on('job:ack', ack);
      subscriber.subscribe({ eventName: 'job', handler: () => undefined });

      await bus.emit('job', { _requireAck: true, _ackEventName: 'job:ack', task: 1 });
      await bus.emit('job', { task: 2 });

      expect(ack).toHaveBeenCalledTimes(1);
      expect(ack).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('@Subscribe decorator and withSubscriber mixin', () => {
    it('auto-subscribes decorated methods, binds them to the instance and tears down on destroy()', async () => {
      const baseDestroy = vi.fn();

      class Service {
        public received: string[] = [];
        constructor(public readonly name: string) {}
        destroy(): void {
          baseDestroy();
        }
      }

      const SubscribedService = withSubscriber(Service, bus, { errorStrategy: 'ignore' });

      class Worker extends SubscribedService {
        @Subscribe('task:created')
        onTask(data: { id: number }): void {
          this.received.push(`${this.name}:${data.id}`);
        }

        @Subscribe('task:done', { filter: (data: unknown) => (data as { ok: boolean }).ok })
        onDone(data: { ok: boolean }): void {
          this.received.push(`done:${String(data.ok)}`);
        }

        listen(eventName: string, handler: (data: unknown) => void): void {
          this.subscribe({ eventName, handler });
        }

        stopListening(eventName: string): void {
          this.unsubscribe(eventName);
        }
      }

      const worker = new Worker('w1');
      expect(worker).toBeInstanceOf(Service);
      expect(worker.name).toBe('w1');

      await bus.emit('task:created', { id: 1 });
      await bus.emit('task:done', { ok: false });
      await bus.emit('task:done', { ok: true });

      const manual = vi.fn();
      worker.listen('manual', manual);
      await bus.emit('manual', 'x');
      worker.stopListening('manual');
      await bus.emit('manual', 'y');

      expect(worker.received).toEqual(['w1:1', 'done:true']);
      expect(manual).toHaveBeenCalledTimes(1);
      expect(bus.hasListeners('task:created')).toBe(true);

      worker.destroy();

      expect(baseDestroy).toHaveBeenCalledTimes(1);
      expect(bus.hasListeners('task:created')).toBe(false);
      expect(bus.hasListeners('task:done')).toBe(false);

      await bus.emit('task:created', { id: 2 });
      expect(worker.received).toEqual(['w1:1', 'done:true']);
    });

    it('destroy() works for bases without their own destroy method', () => {
      class Plain {}
      const Mixed = withSubscriber(Plain, bus);
      const instance = new Mixed();

      expect(() => instance.destroy()).not.toThrow();
    });
  });
});
