// File: tests/mini-projects/decorator-driven-di.test.ts
//
// Exercises the real decorator-driven DI mini-project: the Container
// (registration, scopes, auto-wiring, child containers, cycle detection) and
// the decorators in Container.ts / Inject.ts (constructor, property, lazy,
// optional, named, multi, factory and conditional injection; lifecycle hooks).
//
// Note: the project compiles with `useDefineForClassFields`, under which a
// plain class field (`dep!: T`) is defined on the instance and shadows the
// accessor a legacy property decorator installs on the prototype. Property
// injection therefore has to be declared with `declare` fields, as below.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  Container,
  container as globalContainer,
  InjectParam,
  InjectProperty,
  Service,
  Singleton,
} from '@/mini-projects/decorator-driven-di/Container';
import {
  AutoBind,
  callPostConstruct,
  callPreDestroy,
  ConditionalInject,
  Inject,
  InjectAll,
  InjectFactory,
  Injectable,
  LazyInject,
  Named,
  OptionalInject,
  PostConstruct,
  PreDestroy,
  Scoped,
  TOKENS,
} from '@/mini-projects/decorator-driven-di/Inject';

interface GlobalWithContainer {
  __DI_CONTAINER__?: Container;
}

const globalScope = globalThis as GlobalWithContainer;

class Logger {
  readonly lines: string[] = [];
  log(message: string): void {
    this.lines.push(message);
  }
}

class Config {
  constructor(readonly apiUrl = 'https://api.test') {}
}

afterEach(() => {
  globalContainer.clear();
  delete globalScope.__DI_CONTAINER__;
});

describe('Container registration and resolution', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  it('resolves factory registrations as transient by default', () => {
    let created = 0;
    container.register('counter', () => ({ id: ++created }));

    const a = container.resolve<{ id: number }>('counter');
    const b = container.resolve<{ id: number }>('counter');

    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
    expect(a).not.toBe(b);
  });

  it('caches singletons and creates them lazily', () => {
    const factory = vi.fn(() => new Logger());
    container.registerSingleton('logger', factory);

    expect(factory).not.toHaveBeenCalled();
    expect(container.getServiceInfo()).toEqual([{ token: 'logger', singleton: true, hasInstance: false }]);

    const first = container.resolve<Logger>('logger');
    const second = container.resolve<Logger>('logger');

    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(container.getServiceInfo()).toEqual([{ token: 'logger', singleton: true, hasInstance: true }]);
  });

  it('supports symbol tokens and fluent chaining', () => {
    const result = container
      .registerSingletonClass(TOKENS.LOGGER, Logger)
      .registerClass(TOKENS.CONFIG, Config)
      .register('n', () => 1, { singleton: true });

    expect(result).toBe(container);
    expect(container.resolve(TOKENS.LOGGER)).toBeInstanceOf(Logger);
    expect(container.resolve(TOKENS.CONFIG)).not.toBe(container.resolve(TOKENS.CONFIG));
    expect(container.getRegisteredTokens()).toEqual([TOKENS.LOGGER, TOKENS.CONFIG, 'n']);
    expect(container.has(TOKENS.CONFIG)).toBe(true);
    expect(container.has('missing')).toBe(false);
  });

  it('throws a descriptive error for unknown tokens', () => {
    expect(() => container.resolve('nope')).toThrow('Service not registered: nope');
    expect(() => container.resolve(Symbol('Ghost'))).toThrow('Service not registered: Symbol(Ghost)');
  });

  it('re-registering a token replaces the previous registration', () => {
    container.register('value', () => 'old');
    container.register('value', () => 'new');
    expect(container.resolve('value')).toBe('new');
  });

  it('clear() drops registrations and cached instances', () => {
    container.registerSingleton('a', () => ({}));
    container.resolve('a');

    container.clear();

    expect(container.getRegisteredTokens()).toEqual([]);
    expect(container.getServiceInfo()).toEqual([]);
    expect(() => container.resolve('a')).toThrow();
  });

  it('exposes injection metadata through static helpers', () => {
    const target = {};
    expect(Container.getInjectMetadata(target)).toEqual([]);
    Container.setInjectMetadata(target, ['a', TOKENS.LOGGER]);
    expect(Container.getInjectMetadata(target)).toEqual(['a', TOKENS.LOGGER]);
  });
});

describe('constructor injection with @Inject', () => {
  class UserService {
    constructor(
      @Inject(TOKENS.LOGGER) readonly logger: Logger,
      @Inject(TOKENS.CONFIG) readonly config: Config
    ) {}
  }

  let container: Container;

  beforeEach(() => {
    container = new Container()
      .registerSingletonClass(TOKENS.LOGGER, Logger)
      .registerSingleton(TOKENS.CONFIG, () => new Config('https://injected'))
      .registerClass(TOKENS.USER_SERVICE, UserService);
  });

  it('records parameter tokens by position', () => {
    expect(Container.getInjectMetadata(UserService)).toEqual([TOKENS.LOGGER, TOKENS.CONFIG]);
  });

  it('injects resolved dependencies into the constructor', () => {
    const service = container.resolve<UserService>(TOKENS.USER_SERVICE);

    expect(service.logger).toBe(container.resolve(TOKENS.LOGGER));
    expect(service.config.apiUrl).toBe('https://injected');
  });

  it('creates a new transient instance each time while sharing singleton dependencies', () => {
    const a = container.resolve<UserService>(TOKENS.USER_SERVICE);
    const b = container.resolve<UserService>(TOKENS.USER_SERVICE);

    expect(a).not.toBe(b);
    expect(a.logger).toBe(b.logger);
  });

  it('autoWire builds unregistered classes from their metadata', () => {
    const wired = container.autoWire(UserService);
    expect(wired).toBeInstanceOf(UserService);
    expect(wired.logger).toBeInstanceOf(Logger);
  });

  it('fails with the missing token when a dependency is not registered', () => {
    const bare = new Container().registerClass('svc', UserService);
    expect(() => bare.resolve('svc')).toThrow('Service not registered: Symbol(Logger)');
  });

  it('resolves deep dependency graphs', () => {
    class Repository {
      constructor(@Inject('db') readonly db: { name: string }) {}
    }
    class Controller {
      constructor(@Inject('repo') readonly repo: Repository, @Inject(TOKENS.LOGGER) readonly logger: Logger) {}
    }
    container.registerSingleton('db', () => ({ name: 'memory' })).registerClass('repo', Repository);

    const controller = container.autoWire(Controller);

    expect(controller.repo.db.name).toBe('memory');
    expect(controller.logger).toBeInstanceOf(Logger);
  });
});

describe('circular dependencies', () => {
  it('reports a descriptive error instead of overflowing the stack', () => {
    class A {
      constructor(@Inject('B') readonly b: unknown) {}
    }
    class B {
      constructor(@Inject('A') readonly a: unknown) {}
    }
    const container = new Container().registerClass('A', A).registerClass('B', B);

    expect(() => container.resolve('A')).toThrow('Circular dependency detected: A -> B -> A');
  });

  it('detects self-dependencies and leaves the container usable afterwards', () => {
    class Self {
      constructor(@Inject('self') readonly self: unknown) {}
    }
    const container = new Container().registerClass('self', Self).register('ok', () => 'fine');

    expect(() => container.resolve('self')).toThrow('Circular dependency detected: self -> self');
    expect(container.resolve('ok')).toBe('fine');
    expect(() => container.resolve('self')).toThrow('Circular dependency detected');
  });

  it('allows the same dependency to appear more than once in a non-circular graph', () => {
    class Left {
      constructor(@Inject('shared') readonly shared: object) {}
    }
    class Right {
      constructor(@Inject('shared') readonly shared: object) {}
    }
    class Root {
      constructor(@Inject('left') readonly left: Left, @Inject('right') readonly right: Right) {}
    }
    const container = new Container()
      .registerSingleton('shared', () => ({}))
      .registerClass('left', Left)
      .registerClass('right', Right);

    const root = container.autoWire(Root);

    expect(root.left.shared).toBe(root.right.shared);
  });
});

describe('child containers', () => {
  it('inherit registrations and already-created singletons without leaking back', () => {
    const parent = new Container().registerSingletonClass('logger', Logger).register('value', () => 'parent');
    const parentLogger = parent.resolve('logger');

    const child = parent.createChild();
    child.register('value', () => 'child');
    child.register('only-child', () => true);

    expect(child.resolve('logger')).toBe(parentLogger);
    expect(child.resolve('value')).toBe('child');
    expect(parent.resolve('value')).toBe('parent');
    expect(parent.has('only-child')).toBe(false);
  });

  it('creates independent singletons for registrations not yet resolved in the parent', () => {
    const parent = new Container().registerSingleton('lazy', () => ({}));
    const child = parent.createChild();

    expect(child.resolve('lazy')).not.toBe(parent.resolve('lazy'));
  });
});

describe('global registration decorators', () => {
  it('@Service and @Singleton register classes in the global container', () => {
    @Service('global:transient')
    class Transient {}

    @Singleton('global:singleton')
    class Single {}

    expect(globalContainer.resolve('global:transient')).toBeInstanceOf(Transient);
    expect(globalContainer.resolve('global:transient')).not.toBe(globalContainer.resolve('global:transient'));
    expect(globalContainer.resolve('global:singleton')).toBeInstanceOf(Single);
    expect(globalContainer.resolve('global:singleton')).toBe(globalContainer.resolve('global:singleton'));
  });

  it('@Injectable(token) registers the class in the global container', () => {
    @Injectable('global:injectable')
    class Widget {}

    expect(globalContainer.has('global:injectable')).toBe(true);
    expect(globalContainer.resolve('global:injectable')).toBeInstanceOf(Widget);
  });

  it('@Injectable() without a token only returns the class', () => {
    const before = globalContainer.getRegisteredTokens().length;

    @Injectable()
    class Plain {}

    expect(new Plain()).toBeInstanceOf(Plain);
    expect(globalContainer.getRegisteredTokens()).toHaveLength(before);
  });

  it('@Injectable registers into the container installed on globalThis when present', () => {
    const custom = new Container();
    globalScope.__DI_CONTAINER__ = custom;

    @Injectable('custom:injectable')
    class Gadget {}

    expect(custom.resolve('custom:injectable')).toBeInstanceOf(Gadget);
  });
});

describe('property injection', () => {
  it('@InjectProperty resolves from the global container on every access', () => {
    globalContainer.register('clock', () => ({ now: Math.random() }));

    class Consumer {
      @InjectProperty('clock') declare clock: { now: number };
    }
    const consumer = new Consumer();

    expect(consumer.clock).toHaveProperty('now');
    expect(consumer.clock).not.toBe(consumer.clock); // transient: re-resolved per access
  });

  it('documents that a non-declare field shadows the injected accessor', () => {
    globalContainer.register('shadowed', () => 'injected');

    class Shadowed {
      @InjectProperty('shadowed') value!: string;
    }

    expect(new Shadowed().value).toBeUndefined();
  });

  it('@LazyInject resolves once on first access and caches per instance', () => {
    const factory = vi.fn(() => new Logger());
    globalContainer.register('lazy-logger', factory);

    class Consumer {
      @LazyInject('lazy-logger') declare logger: Logger;
    }
    const a = new Consumer();
    const b = new Consumer();

    expect(factory).not.toHaveBeenCalled();
    expect(a.logger).toBe(a.logger);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(b.logger).not.toBe(a.logger);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('@LazyInject prefers the container installed on globalThis and can be overridden by assignment', () => {
    const custom = new Container().registerSingleton('cfg', () => new Config('https://custom'));
    globalScope.__DI_CONTAINER__ = custom;

    class Consumer {
      @LazyInject('cfg') declare config: Config;
    }
    const consumer = new Consumer();
    expect(consumer.config.apiUrl).toBe('https://custom');

    const replacement = new Config('https://manual');
    consumer.config = replacement;
    expect(consumer.config).toBe(replacement);

    const fresh = new Consumer();
    fresh.config = replacement; // setter before first access
    expect(fresh.config).toBe(replacement);
  });

  it('@LazyInject surfaces resolution errors on access, not construction', () => {
    class Consumer {
      @LazyInject('missing') declare dep: unknown;
    }
    const consumer = new Consumer();
    expect(() => consumer.dep).toThrow('Service not registered: missing');
  });

  it('@InjectFactory exposes a function that resolves a fresh instance per call', () => {
    let created = 0;
    globalContainer.register('job', () => ({ id: ++created }));

    class Scheduler {
      @InjectFactory<{ id: number }>('job') declare createJob: () => { id: number };
    }
    const scheduler = new Scheduler();

    expect(created).toBe(0);
    expect(scheduler.createJob().id).toBe(1);
    expect(scheduler.createJob().id).toBe(2);
  });
});

describe('parameter decorators', () => {
  it('@OptionalInject falls back to the default when the token is not registered', () => {
    class Mailer {
      constructor(
        @Inject(TOKENS.LOGGER) readonly logger: Logger,
        @OptionalInject('smtp-host', 'localhost') readonly host: string,
        @OptionalInject('retries') readonly retries?: number
      ) {}
    }
    const container = new Container().registerSingletonClass(TOKENS.LOGGER, Logger);

    const mailer = container.autoWire(Mailer);

    expect(mailer.logger).toBeInstanceOf(Logger);
    expect(mailer.host).toBe('localhost');
    expect(mailer.retries).toBeUndefined();

    container.register('smtp-host', () => 'mail.example.com').register('retries', () => 3);
    const configured = container.autoWire(Mailer);
    expect(configured.host).toBe('mail.example.com');
    expect(configured.retries).toBe(3);
  });

  it('@OptionalInject does not make sibling @Inject parameters optional', () => {
    class Mixed {
      constructor(@Inject('required') readonly required: unknown, @OptionalInject('optional', 1) readonly optional: number) {}
    }

    expect(() => new Container().autoWire(Mixed)).toThrow('Service not registered: required');
  });

  it('@InjectAll resolves the "<token>[]" collection registration', () => {
    class PluginHost {
      constructor(@InjectAll('plugin') readonly plugins: string[]) {}
    }
    const container = new Container().register('plugin[]', () => ['a', 'b']);

    expect(Container.getInjectMetadata(PluginHost)).toEqual(['plugin[]']);
    expect(container.autoWire(PluginHost).plugins).toEqual(['a', 'b']);
  });

  it('@Named resolves the "<token>:<name>" registration', () => {
    const namedDb = (name: string) => Named(name)('db');
    class Reports {
      constructor(@namedDb('primary') readonly primary: string, @namedDb('replica') readonly replica: string) {}
    }
    const container = new Container().register('db:primary', () => 'p').register('db:replica', () => 'r');

    const reports = container.autoWire(Reports);
    expect([reports.primary, reports.replica]).toEqual(['p', 'r']);
  });

  it('@ConditionalInject picks the token when the decorator is evaluated', () => {
    class Feature {
      constructor(
        @ConditionalInject('fast', () => true, 'slow') readonly a: string,
        @ConditionalInject('fast', () => false, 'slow') readonly b: string,
        @ConditionalInject('fast', () => false) readonly c: string
      ) {}
    }

    expect(Container.getInjectMetadata(Feature)).toEqual(['fast', 'slow', 'fast']);
    const container = new Container().register('fast', () => 'F').register('slow', () => 'S');
    const feature = container.autoWire(Feature);
    expect([feature.a, feature.b, feature.c]).toEqual(['F', 'S', 'F']);
  });

  it('@InjectParam records tokens for method parameters on the prototype', () => {
    class Handler {
      handle(@InjectParam('req') _req: unknown, @InjectParam(TOKENS.LOGGER) _logger: unknown): void {}
    }

    expect(Container.getInjectMetadata(Handler.prototype)).toEqual(['req', TOKENS.LOGGER]);
  });
});

describe('class decorators and helpers', () => {
  it('@Scoped marks the injection scope on the constructor', () => {
    @Scoped('singleton')
    class Cache {}

    @Scoped()
    class Request {}

    expect((Cache as typeof Cache & { _injectionScope?: string })._injectionScope).toBe('singleton');
    expect((Request as typeof Request & { _injectionScope?: string })._injectionScope).toBe('transient');
  });

  it('@AutoBind keeps `this` for detached methods and caches the bound function per instance', () => {
    class Counter {
      count = 0;

      @AutoBind
      increment(): number {
        return ++this.count;
      }
    }
    const a = new Counter();
    const b = new Counter();
    const detached = a.increment;

    detached();
    detached();

    expect(a.count).toBe(2);
    expect(a.increment).toBe(a.increment);
    expect(b.increment).not.toBe(a.increment);
    expect(b.increment()).toBe(1);
  });
});

describe('lifecycle hooks', () => {
  it('callPostConstruct and callPreDestroy run the decorated methods in declaration order', () => {
    const calls: string[] = [];

    class Connection {
      @PostConstruct
      open(): void {
        calls.push('open');
      }

      @PostConstruct
      warmUp(): void {
        calls.push(`warmUp:${this instanceof Connection}`);
      }

      @PreDestroy
      close(): void {
        calls.push('close');
      }
    }

    const connection = new Connection();
    expect(calls).toEqual([]);

    callPostConstruct(connection);
    callPreDestroy(connection);

    expect(calls).toEqual(['open', 'warmUp:true', 'close']);
  });

  it('is a no-op for classes without hooks', () => {
    expect(() => {
      callPostConstruct({});
      callPreDestroy(new Logger());
    }).not.toThrow();
  });

  it('works with container-built instances', () => {
    class Service {
      ready = false;
      constructor(@Inject('cfg') readonly config: Config) {}

      @PostConstruct
      init(): void {
        this.ready = this.config.apiUrl.startsWith('https');
      }
    }
    const container = new Container().register('cfg', () => new Config()).registerClass('svc', Service);

    const service = container.resolve<Service>('svc');
    callPostConstruct(service);

    expect(service.ready).toBe(true);
  });

  it('keeps subclass hooks out of the base class and runs inherited hooks once', () => {
    const calls: string[] = [];

    class Base {
      @PostConstruct
      init(): void {
        calls.push('base.init');
      }

      @PreDestroy
      dispose(): void {
        calls.push('base.dispose');
      }
    }

    class Derived extends Base {
      @PostConstruct
      extra(): void {
        calls.push('derived.extra');
      }

      @PostConstruct
      override init(): void {
        calls.push('derived.init');
      }
    }

    callPostConstruct(new Base());
    expect(calls).toEqual(['base.init']);

    calls.length = 0;
    callPostConstruct(new Derived());
    expect(calls).toEqual(['derived.init', 'derived.extra']);

    calls.length = 0;
    callPreDestroy(new Derived());
    expect(calls).toEqual(['base.dispose']);
  });
});
