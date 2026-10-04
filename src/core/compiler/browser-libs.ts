/**
 * Library provider for browsers. The `lib.*.d.ts` files of the installed
 * `typescript` package are exposed through Vite's `import.meta.glob` as
 * lazily loaded chunks; only the files a program can reach are fetched.
 *
 * The {@link LibProvider} contract is synchronous, so loading happens up front
 * in the async {@link createBrowserLibProvider} factory: it loads the requested
 * root libraries plus everything they reach through
 * `/// <reference lib="..." />` directives, then returns a provider over the
 * loaded text. No `node:` imports; the module is safe for workers and pages.
 *
 * @module core/compiler/browser-libs
 */

import { createStaticLibProvider, type LibProvider } from './virtual-host';

/** Bare file names of the libraries the kernel's strict defaults reference. */
export const DEFAULT_BROWSER_LIBS: readonly string[] = Object.freeze(['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts']);

export interface BrowserLibProviderOptions {
  /**
   * Root libraries to load, as bare file names (`lib.es2020.d.ts`) or
   * tsconfig-style names (`ES2020`, `DOM.Iterable`). Their transitive
   * `/// <reference lib>` dependencies are loaded as well.
   * Defaults to {@link DEFAULT_BROWSER_LIBS}.
   */
  readonly libs?: readonly string[];
  /** Load every bundled library file instead of only the reachable ones. */
  readonly preloadAll?: boolean;
}

export interface BrowserLibStats {
  /** Bare file names currently held in memory, sorted. */
  readonly files: readonly string[];
  /** Total UTF-16 length of the loaded text. */
  readonly characters: number;
}

type LibLoader = () => Promise<string>;

const LIB_GLOB_PREFIX = '/node_modules/typescript/lib/';

/**
 * Lazy loaders keyed by bare file name. The glob literal must stay inline so
 * Vite can rewrite it at build time; each entry becomes its own chunk.
 */
const loaders: ReadonlyMap<string, LibLoader> = new Map(
  Object.entries(import.meta.glob<string>('/node_modules/typescript/lib/lib.*.d.ts', { query: '?raw', import: 'default' })).map(
    ([path, load]) => [path.startsWith(LIB_GLOB_PREFIX) ? path.slice(LIB_GLOB_PREFIX.length) : path.slice(path.lastIndexOf('/') + 1), load] as const,
  ),
);

/** Loaded library text shared by every provider this module hands out. */
const loadedText: Record<string, string> = {};
const inFlight = new Map<string, Promise<string | undefined>>();
const providers = new Map<string, Promise<LibProvider>>();

const TSCONFIG_ALIASES: Readonly<Record<string, string>> = { es6: 'es2015', es7: 'es2016' };

/**
 * Map a tsconfig-style library name (`ES2020`, `DOM.Iterable`, `es6`) or a
 * bare file name to the bare file name the compiler host asks for.
 */
export function toLibFileName(name: string): string {
  const trimmed = name.trim();
  if (/^lib\..*\.d\.ts$/i.test(trimmed)) return trimmed.toLowerCase();
  const lower = trimmed.toLowerCase();
  return `lib.${TSCONFIG_ALIASES[lower] ?? lower}.d.ts`;
}

const REFERENCE_LIB = /^\s*\/\/\/\s*<reference\s+lib\s*=\s*["']([^"']+)["']\s*\/>/gm;

/** Extract the targets of `/// <reference lib="..." />` directives as bare file names. */
export function parseLibReferences(text: string): string[] {
  const references: string[] = [];
  for (const match of text.matchAll(REFERENCE_LIB)) {
    const target = match[1];
    if (target !== undefined) references.push(toLibFileName(target));
  }
  return references;
}

/** Bare file names of every library that can be loaded. */
export function availableBrowserLibs(): string[] {
  return [...loaders.keys()].sort();
}

const loadOne = (fileName: string): Promise<string | undefined> => {
  const cached = loadedText[fileName];
  if (cached !== undefined) return Promise.resolve(cached);
  const pending = inFlight.get(fileName);
  if (pending) return pending;
  const loader = loaders.get(fileName);
  if (!loader) return Promise.resolve(undefined);
  const promise = loader().then(
    (text) => {
      loadedText[fileName] = text;
      inFlight.delete(fileName);
      return text;
    },
    (error: unknown) => {
      inFlight.delete(fileName);
      throw error;
    },
  );
  inFlight.set(fileName, promise);
  return promise;
};

/**
 * Load the given root libraries and their transitive references, breadth
 * first. Unknown names are skipped; the compiler later reports them as
 * missing rather than this loader throwing.
 */
export async function loadBrowserLibs(roots: readonly string[]): Promise<string[]> {
  const seen = new Set<string>();
  let frontier = [...new Set(roots.map(toLibFileName))];
  while (frontier.length > 0) {
    for (const name of frontier) seen.add(name);
    const texts = await Promise.all(frontier.map(loadOne));
    const next = new Set<string>();
    for (const text of texts) {
      if (text === undefined) continue;
      for (const reference of parseLibReferences(text)) {
        if (!seen.has(reference)) next.add(reference);
      }
    }
    frontier = [...next];
  }
  return [...seen].filter((name) => loadedText[name] !== undefined).sort();
}

/** What is currently held in memory, for diagnostics and the playground UI. */
export function browserLibStats(): BrowserLibStats {
  const files = Object.keys(loadedText).sort();
  return { files, characters: files.reduce((sum, name) => sum + (loadedText[name]?.length ?? 0), 0) };
}

/**
 * Create a synchronous {@link LibProvider} for the browser.
 *
 * Memoised per root set: repeated calls with the same options share one load.
 * All providers read from one shared map, so text loaded for one option set is
 * never fetched twice.
 */
export function createBrowserLibProvider(options: BrowserLibProviderOptions = {}): Promise<LibProvider> {
  const roots = options.preloadAll ? availableBrowserLibs() : [...(options.libs ?? DEFAULT_BROWSER_LIBS)].map(toLibFileName).sort();
  const key = options.preloadAll ? '*' : roots.join('|');
  const existing = providers.get(key);
  if (existing) return existing;
  const created = loadBrowserLibs(roots).then(
    () => createStaticLibProvider(loadedText),
    (error: unknown) => {
      providers.delete(key);
      throw error;
    },
  );
  providers.set(key, created);
  return created;
}
