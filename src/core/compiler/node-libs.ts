/**
 * Library provider for Node environments. Reads `lib.*.d.ts` from the
 * installed `typescript` package. Kept in a separate module so that browser
 * bundles never import `node:fs`.
 *
 * @module core/compiler/node-libs
 */

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import type { LibProvider } from './virtual-host';

const cache = new Map<string, string | undefined>();

/** Resolve the directory of the `typescript` package's bundled lib files. */
export function resolveTypeScriptLibDirectory(): string {
  const require = createRequire(import.meta.url);
  return dirname(require.resolve('typescript'));
}

/** A memoised {@link LibProvider} backed by the local `typescript` install. */
export function createNodeLibProvider(libDirectory: string = resolveTypeScriptLibDirectory()): LibProvider {
  return (fileName) => {
    const key = `${libDirectory}:${fileName}`;
    if (cache.has(key)) return cache.get(key);
    const fullPath = join(libDirectory, fileName);
    const text = existsSync(fullPath) ? readFileSync(fullPath, 'utf8') : undefined;
    cache.set(key, text);
    return text;
  };
}
