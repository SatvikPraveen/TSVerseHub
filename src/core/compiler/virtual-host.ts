/**
 * In-memory compiler host for the TypeScript Compiler API.
 *
 * The host serves source files from a map and library declaration files from
 * a pluggable {@link LibProvider}, so the same analysis code runs unchanged in
 * Node (libraries read from the `typescript` package) and in the browser
 * (libraries fetched or bundled). Nothing here touches the filesystem.
 *
 * @module core/compiler/virtual-host
 */

import * as ts from 'typescript';

/** A source file to be compiled, addressed by a virtual absolute path. */
export interface VirtualFile {
  /** Virtual path, e.g. `/index.ts`. Paths are normalised to start with `/`. */
  readonly path: string;
  readonly text: string;
}

/**
 * Supplies the text of a library declaration file by its bare file name
 * (e.g. `lib.es2020.d.ts`). Return `undefined` when unavailable; the compiler
 * then reports a missing-lib diagnostic rather than crashing.
 */
export type LibProvider = (fileName: string) => string | undefined;

export interface VirtualHostOptions {
  readonly files: readonly VirtualFile[];
  readonly compilerOptions: ts.CompilerOptions;
  readonly libs: LibProvider;
}

/** Directory in which library files are assumed to live. */
export const LIB_DIRECTORY = '/__lib__/';

export const normalizePath = (path: string): string => {
  const unixPath = path.replace(/\\/g, '/');
  return unixPath.startsWith('/') ? unixPath : `/${unixPath}`;
};

const isLibFile = (fileName: string): boolean => fileName.startsWith(LIB_DIRECTORY) || /(^|\/)lib\.[\w.]*d\.ts$/.test(fileName);

const libBaseName = (fileName: string): string => fileName.slice(fileName.lastIndexOf('/') + 1);

/**
 * Create a {@link ts.CompilerHost} backed entirely by memory.
 *
 * Source files are cached per host instance; the host is cheap to create and
 * intended to be discarded after one program. Library files are also cached
 * so that repeated analyses with the same provider do not re-parse `lib.d.ts`.
 */
/**
 * Parsed library files shared across hosts and programs.
 *
 * `lib.*.d.ts` text never changes within a process, yet every program used to
 * re-parse it (lib.dom.d.ts alone is ~1.9 MB). TypeScript supports reusing a
 * SourceFile across programs; its language service does the same through
 * its document registry. Entries are keyed by file name and parse options and
 * validated against the text, so a provider that serves different text for
 * the same name (another TypeScript version) never receives a stale tree.
 */
const libSourceFileCache = new Map<string, ts.SourceFile>();

const parseOptionsKey = (languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions): string =>
  typeof languageVersionOrOptions === 'object'
    ? `${languageVersionOrOptions.languageVersion}:${String(languageVersionOrOptions.impliedNodeFormat ?? '')}:${String(languageVersionOrOptions.setExternalModuleIndicator ? 'm' : '')}`
    : String(languageVersionOrOptions);

const getLibSourceFile = (
  fileName: string,
  text: string,
  languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
): ts.SourceFile => {
  const key = `${fileName}|${parseOptionsKey(languageVersionOrOptions)}`;
  const cached = libSourceFileCache.get(key);
  if (cached && cached.text === text) return cached;
  const sourceFile = ts.createSourceFile(fileName, text, languageVersionOrOptions, true);
  libSourceFileCache.set(key, sourceFile);
  return sourceFile;
};

/** Number of parsed library files currently shared; exposed for tests and diagnostics. */
export const sharedLibSourceFileCount = (): number => libSourceFileCache.size;

export function createVirtualHost(options: VirtualHostOptions): ts.CompilerHost & { readonly outputs: Map<string, string> } {
  const files = new Map<string, string>();
  for (const file of options.files) {
    files.set(normalizePath(file.path), file.text);
  }
  const sourceFileCache = new Map<string, ts.SourceFile>();
  const outputs = new Map<string, string>();
  const target = options.compilerOptions.target ?? ts.ScriptTarget.ES2020;

  const readText = (fileName: string): string | undefined => {
    const normalized = normalizePath(fileName);
    const fromFiles = files.get(normalized);
    if (fromFiles !== undefined) return fromFiles;
    if (isLibFile(normalized)) return options.libs(libBaseName(normalized));
    return undefined;
  };

  return {
    outputs,
    fileExists: (fileName) => readText(fileName) !== undefined,
    readFile: (fileName) => readText(fileName),
    getSourceFile: (fileName, languageVersionOrOptions) => {
      const normalized = normalizePath(fileName);
      const cached = sourceFileCache.get(normalized);
      if (cached) return cached;
      const text = readText(normalized);
      if (text === undefined) return undefined;
      const parseOptions = languageVersionOrOptions ?? target;
      const sourceFile =
        !files.has(normalized) && isLibFile(normalized)
          ? getLibSourceFile(normalized, text, parseOptions)
          : ts.createSourceFile(normalized, text, parseOptions, true);
      sourceFileCache.set(normalized, sourceFile);
      return sourceFile;
    },
    getDefaultLibFileName: (compilerOptions) => `${LIB_DIRECTORY}${ts.getDefaultLibFileName(compilerOptions)}`,
    getDefaultLibLocation: () => LIB_DIRECTORY,
    writeFile: (fileName, text) => {
      outputs.set(normalizePath(fileName), text);
    },
    getCurrentDirectory: () => '/',
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    directoryExists: (directory) => {
      const normalized = normalizePath(directory).replace(/\/?$/, '/');
      if (normalized === '/' || normalized === LIB_DIRECTORY) return true;
      for (const path of files.keys()) {
        if (path.startsWith(normalized)) return true;
      }
      return false;
    },
    getDirectories: () => [],
  };
}

/**
 * Library provider backed by a static map, suitable for browsers where lib
 * files are bundled or fetched ahead of time.
 */
export const createStaticLibProvider = (libs: Readonly<Record<string, string>>): LibProvider => (fileName) => libs[fileName];
