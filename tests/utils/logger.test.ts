// Tests for src/utils/logger.ts. Console, storage and network sinks are observed through spies.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Logger, { LoggerUtils, LogLevel, logger as defaultLogger, type LogEntry, type LoggerConfig } from '@/utils/logger';

/** A logger with every side-effecting sink off unless explicitly enabled. */
function quietLogger(config: Partial<LoggerConfig> = {}): Logger {
  return new Logger({ enableConsole: false, enableStorage: false, enableRemote: false, ...config });
}

function silenceConsole() {
  return {
    debug: vi.spyOn(console, 'debug').mockImplementation(() => undefined),
    info: vi.spyOn(console, 'info').mockImplementation(() => undefined),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => undefined),
    error: vi.spyOn(console, 'error').mockImplementation(() => undefined),
  };
}

const messages = (entries: LogEntry[]) => entries.map(e => e.message);
/** Makes crypto.getRandomValues deterministic so session ids are reproducible. */
const fixRandomValues = () =>
  vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(<T extends ArrayBufferView>(array: T): T => {
    if (array instanceof Uint8Array) array.fill(0x5a);
    return array;
  });

const storageKey = (entry: LogEntry) => `logger_entries_${entry.sessionId!}`;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('levels', () => {
  it('drops messages below the configured level', () => {
    const log = quietLogger({ level: LogLevel.WARN });
    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e');
    log.fatal('f');
    expect(log.getEntries().map(e => LogLevel[e.level])).toEqual(['WARN', 'ERROR', 'FATAL']);
  });

  it('defaults to INFO', () => {
    const log = quietLogger();
    log.debug('hidden');
    log.info('shown');
    expect(messages(log.getEntries())).toEqual(['shown']);
  });

  it('setLevel changes filtering and records the change', () => {
    const log = quietLogger();
    log.setLevel(LogLevel.DEBUG);
    log.debug('now visible');
    expect(messages(log.getEntries())).toEqual(['Log level changed to DEBUG', 'now visible']);
    expect(log.getEntries()[0]!.category).toBe('system');
  });
});

describe('entry shape', () => {
  it('records category, data, session and source', () => {
    const log = quietLogger();
    log.info('hello', { a: 1 }, 'user');
    const [entry] = log.getEntries();
    expect(entry).toMatchObject({ message: 'hello', category: 'user', data: { a: 1 }, level: LogLevel.INFO });
    expect(entry!.id).toMatch(/^log_/);
    expect(entry!.sessionId).toMatch(/^session_\d+_[0-9a-f]{32}$/);
    expect(typeof entry!.source).toBe('string');
  });

  it('derives session ids from the CSPRNG, not Math.random', () => {
    const random = vi.spyOn(Math, 'random');
    const getRandomValues = vi.spyOn(globalThis.crypto, 'getRandomValues');
    const a = quietLogger();
    const b = quietLogger();
    a.info('x');
    b.info('y');
    expect(random).not.toHaveBeenCalled();
    expect(getRandomValues).toHaveBeenCalled();
    expect(a.getEntries()[0]!.sessionId).not.toBe(b.getEntries()[0]!.sessionId);
  });

  it('serialises Error objects for error and fatal, keeping the stack trace', () => {
    const log = quietLogger();
    const err = new TypeError('bad input');
    log.error('failed', err);
    log.fatal('dead', err, 'system');
    const [e1, e2] = log.getEntries();

    expect(e1).toMatchObject({ category: 'error', level: LogLevel.ERROR, stackTrace: err.stack });
    expect(e1!.data).toEqual({ name: 'TypeError', message: 'bad input', stack: err.stack });
    expect(e2).toMatchObject({ category: 'system', level: LogLevel.FATAL });
  });

  it('passes non-Error payloads through unchanged', () => {
    const log = quietLogger();
    log.error('failed', { code: 7 });
    log.fatal('dead', 'string reason');
    const [e1, e2] = log.getEntries();
    expect(e1!.data).toEqual({ code: 7 });
    expect(e1!.stackTrace).toBeUndefined();
    expect(e2!.data).toBe('string reason');
  });

  it('userAction and systemEvent use their dedicated categories', () => {
    const log = quietLogger();
    log.userAction('click', 'u42', { button: 'save' });
    log.systemEvent('boot');
    const [action, event] = log.getEntries();
    expect(action).toMatchObject({ message: 'User action: click', userId: 'u42', category: 'user' });
    expect(event).toMatchObject({ message: 'System event: boot', category: 'system' });
  });

  it('performance entries carry the duration', () => {
    const log = quietLogger();
    log.performance('render', 12.5);
    expect(log.getEntries()[0]).toMatchObject({
      category: 'performance',
      performance: { duration: 12.5, memory: 0 },
    });
  });

  it('startTimer logs the elapsed time and the memory delta', () => {
    const now = vi.spyOn(performance, 'now');
    now.mockReturnValueOnce(100).mockReturnValueOnce(130);
    const log = quietLogger({ level: LogLevel.DEBUG });

    const stop = log.startTimer('load');
    stop();

    const [timer, memory] = log.getEntries();
    expect(timer).toMatchObject({ message: "Timer 'load' completed", performance: { duration: 30 } });
    expect(memory).toMatchObject({ level: LogLevel.DEBUG, message: "Memory delta for 'load': 0KB" });
  });
});

describe('getEntries filters', () => {
  it('filters by minimum level, category, user, date range and limit', () => {
    vi.useFakeTimers();
    const log = quietLogger({ level: LogLevel.DEBUG });

    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    log.debug('early debug', undefined, 'a');
    vi.setSystemTime(new Date('2026-01-02T00:00:00Z'));
    log.warn('mid warn', undefined, 'b');
    log.userAction('act', 'u1');
    vi.setSystemTime(new Date('2026-01-03T00:00:00Z'));
    log.error('late error');

    expect(messages(log.getEntries({ level: LogLevel.WARN }))).toEqual(['mid warn', 'late error']);
    expect(messages(log.getEntries({ category: 'b' }))).toEqual(['mid warn']);
    expect(messages(log.getEntries({ userId: 'u1' }))).toEqual(['User action: act']);
    expect(
      messages(log.getEntries({ startDate: new Date('2026-01-02T00:00:00Z'), endDate: new Date('2026-01-02T23:59:59Z') }))
    ).toEqual(['mid warn', 'User action: act']);
    expect(messages(log.getEntries({ limit: 2 }))).toEqual(['User action: act', 'late error']);
  });

  it('returns a copy that callers cannot use to mutate the log', () => {
    const log = quietLogger();
    log.info('a');
    log.getEntries().pop();
    expect(log.getEntries()).toHaveLength(1);
  });

  it('keeps only the newest maxStorageEntries in memory', () => {
    const log = quietLogger({ maxStorageEntries: 3 });
    for (let i = 0; i < 5; i++) log.info(`m${i}`);
    expect(messages(log.getEntries())).toEqual(['m2', 'm3', 'm4']);
  });
});

describe('filters', () => {
  it('addFilter rejects entries and removeFilter restores them', () => {
    const log = quietLogger();
    const noSecrets = (e: LogEntry) => !e.message.includes('secret');
    log.addFilter(noSecrets);
    log.info('secret token');
    log.info('public');
    log.removeFilter(noSecrets);
    log.removeFilter(noSecrets); // second removal is a no-op
    log.info('secret again');
    expect(messages(log.getEntries())).toEqual(['public', 'secret again']);
  });

  it('a throwing filter lets the entry through and warns', () => {
    const { warn } = silenceConsole();
    const log = quietLogger({
      filters: [
        () => {
          throw new Error('broken filter');
        },
      ],
    });
    log.info('still logged');
    expect(messages(log.getEntries())).toEqual(['still logged']);
    expect(warn).toHaveBeenCalledWith('Logger filter error:', expect.any(Error));
  });

  it('LoggerUtils filter factories select by user, time range and severity', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T00:00:00Z'));

    const byUser = quietLogger({ filters: [LoggerUtils.createUserFilter('u1')] });
    byUser.userAction('x', 'u1');
    byUser.userAction('y', 'u2');
    expect(messages(byUser.getEntries())).toEqual(['User action: x']);

    const inRange = quietLogger({
      filters: [LoggerUtils.createTimeRangeFilter(new Date('2026-02-01'), new Date('2026-04-01'))],
    });
    inRange.info('in range');
    vi.setSystemTime(new Date('2026-05-01T00:00:00Z'));
    inRange.info('too late');
    expect(messages(inRange.getEntries())).toEqual(['in range']);

    const errorsOnly = quietLogger({ filters: [LoggerUtils.createErrorFilter()] });
    errorsOnly.warn('w');
    errorsOnly.error('e');
    errorsOnly.fatal('f');
    expect(messages(errorsOnly.getEntries())).toEqual(['e', 'f']);
  });
});

describe('console sink', () => {
  it('routes each level to the matching console method', () => {
    const spies = silenceConsole();
    const log = new Logger({ enableStorage: false, level: LogLevel.DEBUG });
    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e');
    log.fatal('f');

    expect(spies.debug).toHaveBeenCalledTimes(1);
    expect(spies.info).toHaveBeenCalledTimes(1);
    expect(spies.warn).toHaveBeenCalledTimes(1);
    expect(spies.error).toHaveBeenCalledTimes(2);
  });

  it('formats timestamp, padded level and category, user, data and performance', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T10:00:00Z'));
    Object.defineProperty(performance, 'memory', { value: { usedJSHeapSize: 4096 }, configurable: true });
    try {
      const { info } = silenceConsole();
      const log = new Logger({ enableStorage: false });
      log.userAction('save', 'u9', { id: 1 });
      log.performance('paint', 3.14159);

      const [first, second] = info.mock.calls.map(call => String(call[0]));
      expect(first).toBe(
        '[2026-07-01T10:00:00.000Z] INFO  [user      ] User action: save (User: u9)\nData: {\n  "id": 1\n}'
      );
      expect(second).toContain('[performance] paint\nPerformance: 3.14ms, Memory: 4KB');
    } finally {
      Reflect.deleteProperty(performance, 'memory');
    }
  });

  it('uses a custom console formatter when configured', () => {
    const { info } = silenceConsole();
    const log = new Logger({
      enableStorage: false,
      formatters: { console: e => `>> ${e.message}`, storage: e => e.message, remote: e => e },
    });
    log.info('custom');
    expect(info).toHaveBeenCalledWith('>> custom');
  });
});

describe('storage sink', () => {
  it('persists entries to localStorage under the session key, capped at maxStorageEntries', () => {
    const log = new Logger({ enableConsole: false, maxStorageEntries: 2 });
    log.info('one');
    log.info('two');
    log.info('three');

    const key = storageKey(log.getEntries()[0]!);
    const stored = JSON.parse(localStorage.getItem(key)!) as LogEntry[];
    expect(stored.map(e => e.message)).toEqual(['two', 'three']);
  });

  it('reloads persisted entries for the same session with Date timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-02T00:00:00Z'));
    fixRandomValues(); // makes the session id reproducible

    const first = new Logger({ enableConsole: false });
    first.warn('persisted');
    const second = new Logger({ enableConsole: false });

    const [restored] = second.getEntries();
    expect(restored?.message).toBe('persisted');
    expect(restored?.timestamp).toBeInstanceOf(Date);
    expect(restored?.timestamp.toISOString()).toBe('2026-02-02T00:00:00.000Z');
  });

  it('survives corrupt stored data and storage write failures', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-02T00:00:00Z'));
    fixRandomValues();
    const { warn } = silenceConsole();

    const probe = new Logger({ enableConsole: false });
    probe.info('probe');
    localStorage.setItem(storageKey(probe.getEntries()[0]!), '{not json');

    const log = new Logger({ enableConsole: false });
    expect(log.getEntries()).toEqual([]);
    expect(warn).toHaveBeenCalledWith('Failed to load stored logs:', expect.any(SyntaxError));

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    log.info('still in memory');
    expect(messages(log.getEntries())).toEqual(['still in memory']);
    expect(warn).toHaveBeenCalledWith('Failed to store log entry:', expect.any(Error));
  });

  it('clear empties memory and removes the persisted session', () => {
    const log = new Logger({ enableConsole: false });
    log.info('x');
    const key = storageKey(log.getEntries()[0]!);
    expect(localStorage.getItem(key)).not.toBeNull();

    log.clear();
    expect(log.getEntries()).toEqual([]);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('writes nothing when storage is disabled', () => {
    const log = quietLogger();
    log.info('x');
    log.clear();
    expect(localStorage.length).toBe(0);
  });
});

describe('remote sink', () => {
  it('POSTs the remote-formatted entry with browser context', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const log = quietLogger({ enableRemote: true, remoteEndpoint: 'https://logs.example.test/ingest' });

    log.warn('ship it', { n: 1 });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://logs.example.test/ingest');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body).toMatchObject({ message: 'ship it', data: { n: 1 }, environment: 'browser', url: window.location.href });
    expect(body.userAgent).toBe(navigator.userAgent);
  });

  it('does not send without an endpoint or when disabled', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    quietLogger({ enableRemote: true }).info('no endpoint');
    quietLogger({ remoteEndpoint: 'https://x.test' }).info('disabled');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('warns instead of throwing when the request fails', async () => {
    const { warn } = silenceConsole();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const log = quietLogger({ enableRemote: true, remoteEndpoint: 'https://x.test' });

    log.info('lost');
    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith('Failed to send log to remote endpoint:', expect.any(TypeError))
    );
    expect(messages(log.getEntries())).toEqual(['lost']);
  });
});

describe('metrics', () => {
  it('summarises counts, error rate and recent activity', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T00:00:00Z'));
    const log = quietLogger({ level: LogLevel.DEBUG });
    log.debug('d', undefined, 'a');
    log.info('i', undefined, 'a');
    log.warn('w', undefined, 'b');
    vi.setSystemTime(new Date('2026-04-01T00:00:30Z'));
    log.error('e');

    const m = log.getMetrics();
    expect(m.totalLogs).toBe(4);
    expect(m.byLevel).toEqual({
      [LogLevel.DEBUG]: 1,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 1,
      [LogLevel.ERROR]: 1,
      [LogLevel.FATAL]: 0,
    });
    expect(m.byCategory).toEqual({ a: 2, b: 1, error: 1 });
    expect(m.errorRate).toBe(25);
    expect(m.averageLogsPerMinute).toBe(4);
    expect(m.sessionDuration).toBe(30);
    expect(m.lastActivity.toISOString()).toBe('2026-04-01T00:00:30.000Z');
  });

  it('caches for a minute and invalidates on new entries', () => {
    vi.useFakeTimers();
    const log = quietLogger();
    log.info('a');
    const first = log.getMetrics();
    expect(log.getMetrics()).toBe(first);

    log.info('b');
    const second = log.getMetrics();
    expect(second).not.toBe(first);
    expect(second.totalLogs).toBe(2);

    vi.advanceTimersByTime(61_000);
    const third = log.getMetrics();
    expect(third).not.toBe(second);
    expect(third.averageLogsPerMinute).toBe(0);
  });

  it('reports a zero error rate and the start time when empty', () => {
    const log = quietLogger();
    const m = log.getMetrics();
    expect(m.totalLogs).toBe(0);
    expect(m.errorRate).toBe(0);
    expect(m.lastActivity).toBeInstanceOf(Date);
  });
});

describe('export', () => {
  it('exports JSON, CSV (with quote escaping) and text', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T00:00:00Z'));
    const log = quietLogger();
    log.userAction('say "hi"', 'u1');
    log.warn('plain');

    const json = JSON.parse(log.export('json')) as Array<{ message: string }>;
    expect(json.map(e => e.message)).toEqual(['User action: say "hi"', 'plain']);

    const csv = log.export('csv').split('\n');
    expect(csv[0]).toBe('timestamp,level,category,message,userId,sessionId');
    expect(csv[1]).toMatch(/^2026-06-01T00:00:00\.000Z,INFO,user,"User action: say ""hi""",u1,session_/);
    expect(csv[2]).toMatch(/,WARN,general,"plain",,session_/);

    const txt = log.export('txt', { level: LogLevel.WARN });
    expect(txt).toBe('[2026-06-01T00:00:00.000Z] WARN  [general   ] plain');
  });

  it('rejects unknown formats', () => {
    expect(() => quietLogger().export('xml' as unknown as 'json')).toThrow('Unsupported export format: xml');
  });
});

describe('configuration', () => {
  it('updateConfig applies new settings and records the change', () => {
    const log = quietLogger();
    log.updateConfig({ level: LogLevel.ERROR });
    log.warn('dropped');
    log.error('kept');
    expect(messages(log.getEntries())).toEqual(['kept']);

    const relaxed = quietLogger();
    relaxed.updateConfig({ maxStorageEntries: 10 });
    expect(relaxed.getEntries()[0]).toMatchObject({ message: 'Logger configuration updated', category: 'system' });
  });
});

describe('LoggerUtils', () => {
  it('parses level names case-insensitively, defaulting to INFO', () => {
    expect(LoggerUtils.parseLogLevel('warn')).toBe(LogLevel.WARN);
    expect(LoggerUtils.parseLogLevel('FATAL')).toBe(LogLevel.FATAL);
    expect(LoggerUtils.parseLogLevel('verbose')).toBe(LogLevel.INFO);
  });

  it('never returns the enum reverse-mapping string for numeric input (regression)', () => {
    expect(LoggerUtils.parseLogLevel('0')).toBe(LogLevel.INFO);
    expect(typeof LoggerUtils.parseLogLevel('3')).toBe('number');
  });

  it('maps levels to display classes', () => {
    expect(LoggerUtils.formatLogLevel(LogLevel.FATAL)).toContain('font-bold');
    expect(LoggerUtils.formatLogLevel(LogLevel.DEBUG)).toBe('text-gray-500');
    expect(LoggerUtils.formatLogLevel(99 as LogLevel)).toBe('text-gray-600');
  });

  it('the TypeScript logger hides editor noise outside development', () => {
    silenceConsole();
    const prod = LoggerUtils.createTypeScriptLogger();
    prod.info('keystroke', undefined, 'editor');
    prod.info('compiled', undefined, 'compilation');
    expect(messages(prod.getEntries())).toEqual(['compiled']);

    vi.stubEnv('NODE_ENV', 'development');
    const dev = LoggerUtils.createTypeScriptLogger();
    dev.info('keystroke', undefined, 'editor');
    expect(messages(dev.getEntries())).toContain('keystroke');
  });

  it('exports a ready-made default logger instance', () => {
    expect(defaultLogger).toBeInstanceOf(Logger);
  });
});
