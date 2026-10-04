/**
 * The TSVerseHub curriculum.
 *
 * Eight modules ordered by a prerequisite DAG. Every sample is compiled by
 * `npm run research:verify` (and by the unit tests) against the strict option
 * set in `core/compiler`, so a TypeScript upgrade that changes a diagnostic
 * or an inference result fails the build instead of silently teaching
 * something false.
 *
 * Diagnostic codes referenced below:
 *   TS2322 type not assignable · TS2345 argument not assignable
 *   TS2339 property does not exist · TS2367 comparison appears unintentional
 *   TS2344 type does not satisfy constraint · TS2741 property missing
 *   TS2532 object possibly undefined · TS2684 'this' context not assignable
 *   TS1241 decorator signature unresolved · TS2554 expected N arguments
 *   TS2307 cannot find module · TS2300 duplicate identifier · TS2353 excess property
 *   TS2375 exactOptionalPropertyTypes violation
 *
 * @module core/curriculum/registry
 */

import type { ConceptModule, Curriculum } from './schema';

export type ModuleId =
  | 'basics'
  | 'generics'
  | 'advanced-types'
  | 'namespaces-modules'
  | 'tsconfig'
  | 'patterns'
  | 'decorators'
  | 'compiler-api';

const handbook = (slug: string, title: string) => ({ title, url: `https://www.typescriptlang.org/docs/handbook/2/${slug}.html` });

const basics: ConceptModule<ModuleId> = {
  id: 'basics',
  title: 'Foundations: types, narrowing and structural typing',
  summary: 'Primitive and object types, type aliases vs. interfaces, literal types, unions and control-flow narrowing.',
  difficulty: 'beginner',
  estimatedMinutes: 90,
  prerequisites: [],
  objectives: [
    { id: 'b1', statement: 'Explain structural (shape-based) assignability.', level: 'understand' },
    { id: 'b2', statement: 'Use discriminated unions and narrowing to write exhaustive code.', level: 'apply' },
    { id: 'b3', statement: 'Predict which diagnostic a given assignment produces.', level: 'analyze' },
  ],
  samples: [
    {
      id: 'structural-assignability',
      title: 'Extra properties are fine through an alias, not in a fresh literal',
      code: `interface Point { x: number; y: number }
const p3 = { x: 1, y: 2, z: 3 };
const p: Point = p3; // structural: ok
export const q: Point = { x: 1, y: 2, z: 3 }; // fresh object literal: excess property check
export { p };`,
      expectation: { kind: 'errors', codes: [2353] },
    },
    {
      id: 'discriminated-union-exhaustive',
      title: 'Exhaustiveness via never',
      code: `type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number };
export function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.r ** 2;
    case 'square': return shape.s ** 2;
    default: {
      const unreachable: never = shape;
      return unreachable;
    }
  }
}`,
      expectation: { kind: 'compiles' },
    },
    {
      id: 'missing-case',
      title: 'A missing case is a compile error, not a runtime surprise',
      code: `type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number } | { kind: 'tri'; b: number; h: number };
export function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.r ** 2;
    case 'square': return shape.s ** 2;
    default: {
      const unreachable: never = shape;
      return unreachable;
    }
  }
}`,
      expectation: { kind: 'errors', codes: [2322] },
    },
    {
      id: 'const-narrowing',
      title: 'Literal inference with const and as const',
      code: `const mode = 'dark';
let mutable = 'dark';
const tuple = [1, 'two'] as const;
export const out = { mode, mutable, tuple };`,
      expectation: { kind: 'compiles' },
      typeAssertions: [
        { line: 1, column: 7, expected: '"dark"' },
        { line: 2, column: 5, expected: 'string' },
        { line: 3, column: 7, expected: 'readonly [1, "two"]' },
      ],
    },
  ],
  references: [handbook('everyday-types', 'Everyday Types'), handbook('narrowing', 'Narrowing')],
};

const generics: ConceptModule<ModuleId> = {
  id: 'generics',
  title: 'Generics: parametric polymorphism and constraints',
  summary: 'Generic functions, classes and interfaces, constraints with extends, defaults, and inference from arguments.',
  difficulty: 'beginner',
  estimatedMinutes: 120,
  prerequisites: ['basics'],
  objectives: [
    { id: 'g1', statement: 'Write generic functions whose type parameters are inferred from arguments.', level: 'apply' },
    { id: 'g2', statement: 'Constrain type parameters with extends and keyof.', level: 'apply' },
    { id: 'g3', statement: 'Diagnose constraint violations from TS2344 and TS2345.', level: 'analyze' },
  ],
  samples: [
    {
      id: 'keyof-constraint',
      title: 'Property access constrained by keyof',
      code: `export function pluck<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
const user = { id: 1, name: 'Ada' };
export const name = pluck(user, 'name');`,
      expectation: { kind: 'compiles' },
      typeAssertions: [{ line: 3, column: 14, expected: 'string' }],
    },
    {
      id: 'keyof-violation',
      title: 'An unknown key is rejected at the call site',
      code: `export function pluck<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
export const v = pluck({ id: 1 }, 'missing');`,
      expectation: { kind: 'errors', codes: [2345] },
    },
    {
      id: 'generic-constraint-on-type-argument',
      title: 'Explicit type arguments must satisfy constraints',
      code: `type Boxed<T extends object> = { value: T };
export type Bad = Boxed<string>;`,
      expectation: { kind: 'errors', codes: [2344] },
    },
    {
      id: 'inference-from-return-position',
      title: 'Inference flows from callbacks',
      code: `export function mapValues<T extends object, R>(obj: T, fn: (v: T[keyof T]) => R): Record<keyof T, R> {
  const out = {} as Record<keyof T, R>;
  for (const key of Object.keys(obj) as (keyof T)[]) out[key] = fn(obj[key]);
  return out;
}
export const lengths = mapValues({ a: 'x', b: 'yz' }, (s) => s.length);`,
      expectation: { kind: 'compiles' },
      typeAssertions: [{ line: 6, column: 14, expected: '{ a: number; b: number; }' }],
    },
  ],
  references: [handbook('generics', 'Generics')],
};

const advancedTypes: ConceptModule<ModuleId> = {
  id: 'advanced-types',
  title: 'Advanced types: conditional, mapped and template-literal types',
  summary: 'Type-level computation: distributive conditionals, infer, key remapping, template-literal pattern matching and recursion limits.',
  difficulty: 'advanced',
  estimatedMinutes: 240,
  prerequisites: ['generics'],
  objectives: [
    { id: 'a1', statement: 'Implement utility types with conditional and mapped types.', level: 'create' },
    { id: 'a2', statement: 'Predict distribution over unions and how to suppress it.', level: 'analyze' },
    { id: 'a3', statement: 'Reason about recursion depth and tail-call elimination for conditional types.', level: 'evaluate' },
  ],
  samples: [
    {
      id: 'distributive-conditional',
      title: 'Distribution over naked type parameters',
      code: `type ToArray<T> = T extends unknown ? T[] : never;
type NoDistribute<T> = [T] extends [unknown] ? T[] : never;
export const a: ToArray<string | number> = [1];
export const b: NoDistribute<string | number> = [1, 'x'];`,
      expectation: { kind: 'compiles' },
      typeAssertions: [
        { line: 3, column: 14, expected: 'string[] | number[]' },
        { line: 4, column: 14, expected: '(string | number)[]' },
      ],
    },
    {
      id: 'infer-return-type',
      title: 'Extracting types with infer',
      code: `type Ret<F> = F extends (...args: never[]) => infer R ? R : never;
type Awaited2<T> = T extends Promise<infer U> ? Awaited2<U> : T;
declare function load(): Promise<Promise<{ id: number }>>;
export const r: Awaited2<Ret<typeof load>> = { id: 1 };`,
      expectation: { kind: 'compiles' },
    },
    {
      id: 'key-remapping',
      title: 'Key remapping with as and template literals',
      code: `type Getters<T> = { [K in keyof T & string as \`get\${Capitalize<K>}\`]: () => T[K] };
type UserGetters = Getters<{ id: number; name: string }>;
export const g: UserGetters = { getId: () => 1, getName: () => 'x' };
export const bad: UserGetters = { getId: () => 1 };`,
      expectation: { kind: 'errors', codes: [2741] },
    },
    {
      id: 'template-literal-parse',
      title: 'Template-literal types as parsers',
      code: `type Params<R extends string> = R extends \`\${string}:\${infer P}/\${infer Rest}\` ? P | Params<\`/\${Rest}\`> : R extends \`\${string}:\${infer P}\` ? P : never;
export const params: Record<Params<'/users/:userId/posts/:postId'>, string> = { userId: '1', postId: '2' };`,
      expectation: { kind: 'compiles' },
    },
    {
      id: 'tail-recursive-conditional',
      title: 'Tail-recursive conditional types reach the higher depth limit',
      code: `type Repeat<V, N extends number, Acc extends unknown[] = []> = Acc['length'] extends N ? Acc : Repeat<V, N, [...Acc, V]>;
export type Deep = Repeat<0, 900>;
export const n: Deep['length'] = 900;`,
      expectation: { kind: 'compiles' },
    },
  ],
  references: [
    handbook('conditional-types', 'Conditional Types'),
    handbook('mapped-types', 'Mapped Types'),
    handbook('template-literal-types', 'Template Literal Types'),
  ],
};

const namespacesModules: ConceptModule<ModuleId> = {
  id: 'namespaces-modules',
  title: 'Modules, namespaces and declaration merging',
  summary: 'ES module semantics in TypeScript, declaration files, module augmentation and the interaction between namespaces and merging.',
  difficulty: 'intermediate',
  estimatedMinutes: 90,
  prerequisites: ['basics'],
  objectives: [
    { id: 'm1', statement: 'Distinguish type-only from value imports and their emit.', level: 'understand' },
    { id: 'm2', statement: 'Augment third-party module types safely.', level: 'apply' },
  ],
  samples: [
    {
      id: 'declaration-merging',
      title: 'Interfaces merge, type aliases do not',
      code: `interface Config { host: string }
interface Config { port: number }
export const c: Config = { host: 'localhost', port: 8080 };`,
      expectation: { kind: 'compiles' },
    },
    {
      id: 'alias-duplicate',
      title: 'Duplicate type alias is an error',
      code: `type Config = { host: string };
type Config = { port: number };
export const c: Config = { host: 'x' };`,
      expectation: { kind: 'errors', codes: [2300] },
    },
    {
      id: 'namespace-value-and-type',
      title: 'Namespaces hold both values and types',
      code: `export namespace Geometry {
  export interface Vec { x: number; y: number }
  export const origin: Vec = { x: 0, y: 0 };
  export function add(a: Vec, b: Vec): Vec { return { x: a.x + b.x, y: a.y + b.y }; }
}
export const v = Geometry.add(Geometry.origin, { x: 1, y: 1 });`,
      expectation: { kind: 'compiles' },
      typeAssertions: [{ line: 6, column: 14, expected: 'Geometry.Vec' }],
    },
    {
      id: 'unresolved-module',
      title: 'Unresolved imports are diagnosed at compile time',
      code: `import { thing } from 'does-not-exist';
export const t = thing;`,
      expectation: { kind: 'errors', codes: [2307] },
    },
  ],
  references: [handbook('modules', 'Modules'), { title: 'Declaration Merging', url: 'https://www.typescriptlang.org/docs/handbook/declaration-merging.html' }],
};

const tsconfig: ConceptModule<ModuleId> = {
  id: 'tsconfig',
  title: 'Compiler configuration and strictness',
  summary: 'What each strict flag checks, module resolution strategies, project references and how options change diagnostics.',
  difficulty: 'intermediate',
  estimatedMinutes: 75,
  prerequisites: ['namespaces-modules'],
  objectives: [
    { id: 't1', statement: 'Map a diagnostic to the flag that enables it.', level: 'analyze' },
    { id: 't2', statement: 'Choose a module resolution strategy for a given toolchain.', level: 'evaluate' },
  ],
  samples: [
    {
      id: 'no-unchecked-indexed-access',
      title: 'noUncheckedIndexedAccess adds undefined to index results',
      code: `const xs: number[] = [1, 2, 3];
export const first: number = xs[0];`,
      expectation: { kind: 'errors', codes: [2322] },
    },
    {
      id: 'no-unchecked-indexed-access-off',
      title: 'The same code compiles with the flag disabled',
      code: `const xs: number[] = [1, 2, 3];
export const first: number = xs[0];`,
      expectation: { kind: 'compiles' },
      compilerOptions: { noUncheckedIndexedAccess: false },
    },
    {
      id: 'strict-null-checks',
      title: 'strictNullChecks catches possibly-undefined access',
      code: `const map = new Map<string, { n: number }>();
export const n = map.get('k').n;`,
      expectation: { kind: 'errors', codes: [2532] },
    },
    {
      id: 'exact-optional',
      title: 'exactOptionalPropertyTypes distinguishes missing from undefined',
      code: `interface Opts { retries?: number }
export const o: Opts = { retries: undefined };`,
      expectation: { kind: 'errors', codes: [2375] },
      compilerOptions: { exactOptionalPropertyTypes: true },
    },
  ],
  references: [{ title: 'TSConfig Reference', url: 'https://www.typescriptlang.org/tsconfig' }],
};

const patterns: ConceptModule<ModuleId> = {
  id: 'patterns',
  title: 'Typed design patterns',
  summary: 'Classic patterns expressed with precise types: builders that track state, typed event emitters, strategy with discriminated unions, mixins.',
  difficulty: 'intermediate',
  estimatedMinutes: 150,
  prerequisites: ['advanced-types'],
  objectives: [
    { id: 'p1', statement: 'Encode protocol state in the type of a builder.', level: 'create' },
    { id: 'p2', statement: 'Type an event emitter so payloads match event names.', level: 'apply' },
  ],
  samples: [
    {
      id: 'typed-emitter',
      title: 'Event payloads keyed by event name',
      code: `type Events = { login: { user: string }; logout: undefined };
class Emitter<E extends Record<string, unknown>> {
  private handlers: { [K in keyof E]?: Array<(payload: E[K]) => void> } = {};
  on<K extends keyof E>(event: K, handler: (payload: E[K]) => void): void {
    (this.handlers[event] ??= []).push(handler);
  }
  emit<K extends keyof E>(event: K, payload: E[K]): void {
    this.handlers[event]?.forEach((h) => h(payload));
  }
}
export const bus = new Emitter<Events>();
bus.on('login', (p) => p.user.toUpperCase());
bus.emit('login', { user: 'ada' });
bus.emit('login', { user: 42 });`,
      expectation: { kind: 'errors', codes: [2322] },
    },
    {
      id: 'state-tracking-builder',
      title: 'A builder whose build() is only callable once required fields are set',
      code: `type Req = { host: string; port: number };
// Missing tracks the keys not yet provided. A phantom property makes the
// type parameter structurally visible, otherwise all Builder<X> are identical.
class Builder<Missing extends keyof Req = keyof Req> {
  declare readonly __missing?: Missing;
  private data: Partial<Req> = {};
  host(h: string): Builder<Exclude<Missing, 'host'>> { this.data.host = h; return this as Builder<Exclude<Missing, 'host'>>; }
  port(p: number): Builder<Exclude<Missing, 'port'>> { this.data.port = p; return this as Builder<Exclude<Missing, 'port'>>; }
  build(this: Builder<never>): Req { return this.data as Req; }
}
export const ok = new Builder().host('h').port(1).build();
export const notYet = new Builder().host('h').build();`,
      expectation: { kind: 'errors', codes: [2684] },
    },
    {
      id: 'mixin',
      title: 'Constrained mixin constructors',
      code: `type Ctor<T = {}> = new (...args: any[]) => T;
function Timestamped<TBase extends Ctor>(Base: TBase) {
  return class extends Base { readonly createdAt = new Date(); };
}
class Entity { constructor(readonly id: string) {} }
const Stamped = Timestamped(Entity);
export const e = new Stamped('e1');
export const when: Date = e.createdAt;
export const id: string = e.id;`,
      expectation: { kind: 'compiles' },
    },
  ],
  references: [handbook('mixins', 'Mixins'), { title: 'Design Patterns (Gamma et al., 1994)', url: 'https://en.wikipedia.org/wiki/Design_Patterns' }],
};

const decorators: ConceptModule<ModuleId> = {
  id: 'decorators',
  title: 'Decorators and metadata',
  summary: 'Legacy (experimental) decorators, their evaluation order, metadata registries, and the differences from TC39 decorators.',
  difficulty: 'advanced',
  estimatedMinutes: 120,
  prerequisites: ['patterns'],
  objectives: [
    { id: 'd1', statement: 'Describe decorator evaluation order across kinds.', level: 'understand' },
    { id: 'd2', statement: 'Implement a method decorator that preserves the decorated signature.', level: 'create' },
  ],
  samples: [
    {
      id: 'method-decorator-signature',
      title: 'A logging decorator typed with PropertyDescriptor',
      code: `function Log(_target: object, key: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (this: unknown, ...args: unknown[]) {
    console.log(String(key), args);
    return original.apply(this, args);
  };
  return descriptor;
}
export class Calc {
  @Log
  add(a: number, b: number): number { return a + b; }
}`,
      expectation: { kind: 'compiles' },
    },
    {
      id: 'decorator-disabled',
      title: 'Without experimentalDecorators, legacy decorator usage is rejected',
      code: `function Dec(_t: object, _k: string | symbol, d: PropertyDescriptor): PropertyDescriptor { return d; }
export class C {
  @Dec
  m(): void {}
}`,
      expectation: { kind: 'errors', codes: [1241] },
      compilerOptions: { experimentalDecorators: false },
    },
    {
      id: 'class-decorator-returns-subclass',
      title: 'Class decorators may replace the constructor',
      code: `function Sealed<T extends new (...args: any[]) => object>(ctor: T): T {
  return class extends ctor { readonly sealed = true as const; };
}
@Sealed
export class Service {}
export const s = new Service();`,
      expectation: { kind: 'compiles' },
    },
  ],
  references: [{ title: 'Decorators (legacy)', url: 'https://www.typescriptlang.org/docs/handbook/decorators.html' }, { title: 'TC39 Decorators proposal', url: 'https://github.com/tc39/proposal-decorators' }],
};

const compilerApi: ConceptModule<ModuleId> = {
  id: 'compiler-api',
  title: 'The Compiler API: programs, checkers and transformers',
  summary: 'Creating programs with custom hosts, walking the AST, querying the type checker, and writing transformers.',
  difficulty: 'expert',
  estimatedMinutes: 240,
  prerequisites: ['advanced-types', 'tsconfig'],
  objectives: [
    { id: 'c1', statement: 'Construct a Program against an in-memory host.', level: 'apply' },
    { id: 'c2', statement: 'Use the type checker to answer questions a syntax walk cannot.', level: 'analyze' },
    { id: 'c3', statement: 'Write a transformer that preserves source positions.', level: 'create' },
  ],
  samples: [
    {
      id: 'ast-shape',
      title: 'Nodes are discriminated by SyntaxKind',
      code: `// A faithful subset of the Compiler API surface, declared inline so the
// sample is self-contained inside the virtual host.
declare namespace ts {
  enum SyntaxKind { ExportKeyword = 95, FunctionDeclaration = 262 }
  interface Node { readonly kind: SyntaxKind; readonly modifiers?: readonly Node[] }
  interface FunctionDeclaration extends Node { readonly kind: SyntaxKind.FunctionDeclaration; readonly name?: Node }
  function isFunctionDeclaration(node: Node): node is FunctionDeclaration;
}
export function isExportedFunction(node: ts.Node): boolean {
  return ts.isFunctionDeclaration(node) && (node.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}`,
      expectation: { kind: 'compiles' },
    },
    {
      id: 'arity-error',
      title: 'Compiler API functions have precise arities',
      code: `declare namespace ts {
  enum ScriptTarget { ES2022 = 9, Latest = 99 }
  interface SourceFile { readonly fileName: string; readonly text: string }
  function createSourceFile(fileName: string, sourceText: string, languageVersion: ScriptTarget, setParentNodes?: boolean): SourceFile;
}
export const sf = ts.createSourceFile('a.ts', 'let x = 1;');`,
      expectation: { kind: 'errors', codes: [2554] },
    },
  ],
  references: [{ title: 'Using the Compiler API', url: 'https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API' }],
};

export const curriculum: Curriculum<ModuleId> = {
  version: '1.0.0',
  modules: [basics, generics, advancedTypes, namespacesModules, tsconfig, patterns, decorators, compilerApi],
};

export const moduleById = (id: ModuleId): ConceptModule<ModuleId> => {
  const found = curriculum.modules.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown module '${id}'`);
  return found;
};
