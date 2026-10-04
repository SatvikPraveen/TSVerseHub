import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loader } from '@monaco-editor/react';
import { describe, expect, it, vi } from 'vitest';

import { configureMonacoLoader, MONACO_VERSION, MONACO_VS_PATH } from '@/components/editors/monacoLoader';

/** monaco-editor's "exports" map hides package.json, so read it from disk. */
const installedMonacoVersion = (): string => {
  const path = resolve(process.cwd(), 'node_modules/monaco-editor/package.json');
  const manifest = JSON.parse(readFileSync(path, 'utf8')) as { version: string };
  return manifest.version;
};

describe('Monaco loader configuration', () => {
  it('loads the same monaco-editor release the editor is typed against', () => {
    expect(MONACO_VERSION).toBe(installedMonacoVersion());
    expect(MONACO_VS_PATH).toBe(`https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`);
  });

  it('configures the loader once', () => {
    const config = vi.spyOn(loader, 'config').mockImplementation(() => undefined);
    configureMonacoLoader();
    configureMonacoLoader();
    expect(config).toHaveBeenCalledTimes(1);
    expect(config).toHaveBeenCalledWith({ paths: { vs: MONACO_VS_PATH } });
  });
});
