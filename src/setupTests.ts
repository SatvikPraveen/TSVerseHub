import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// jsdom does not implement matchMedia; the theme hook depends on it.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

// jsdom does not implement DragEvent; provide a minimal MouseEvent-based one
// so drag-and-drop code can be exercised in tests.
if (typeof window !== 'undefined' && typeof globalThis.DragEvent === 'undefined') {
  class DragEventPolyfill extends MouseEvent implements DragEvent {
    readonly dataTransfer: DataTransfer | null;

    constructor(type: string, init: DragEventInit = {}) {
      super(type, init);
      this.dataTransfer = init.dataTransfer ?? null;
    }
  }

  Object.defineProperty(globalThis, 'DragEvent', {
    writable: true,
    configurable: true,
    value: DragEventPolyfill,
  });
}
