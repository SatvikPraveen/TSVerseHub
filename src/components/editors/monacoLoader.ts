// File location: src/components/editors/monacoLoader.ts

import { loader } from '@monaco-editor/react';

/**
 * The monaco-editor release the editor loads at runtime.
 *
 * @monaco-editor/react does not bundle Monaco: its loader fetches the AMD build
 * from jsDelivr, and by default it picks whatever version that loader release
 * hard-codes (0.55.1 for @monaco-editor/loader 1.7.0), independent of the
 * `monaco-editor` dependency the types are compiled against. Pinning the CDN
 * path keeps the runtime and the types on the same release; a unit test fails
 * when this constant drifts from the installed package.
 */
export const MONACO_VERSION = '0.57.0';

export const MONACO_VS_PATH = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`;

let configured = false;

/** Point the Monaco loader at {@link MONACO_VS_PATH}; idempotent. */
export const configureMonacoLoader = (): void => {
  if (configured) return;
  configured = true;
  loader.config({ paths: { vs: MONACO_VS_PATH } });
};
