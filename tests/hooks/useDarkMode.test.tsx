// Tests for src/hooks/useDarkMode.ts. Observes the DOM side effects and localStorage.
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDarkMode } from '@/hooks/useDarkMode';

const STORAGE_KEY = 'tsversehub-theme';
const root = () => document.documentElement;
const metaColor = () => document.querySelector('meta[name="theme-color"]')?.getAttribute('content');

function mockSystemPreference(prefersDark: boolean) {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: prefersDark,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener,
        removeEventListener,
        dispatchEvent: () => false,
      }) as MediaQueryList
  );
  return { addEventListener, removeEventListener };
}

function pressShortcut(init: KeyboardEventInit) {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'L', bubbles: true, cancelable: true, ...init }));
  });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  root().classList.remove('dark');
  root().style.removeProperty('--theme-mode');
  document.head.innerHTML = '';
});

describe('useDarkMode', () => {
  it('defaults to system mode and follows a light system preference', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.theme).toBe('system');
    expect(result.current.isDark).toBe(false);
    expect(result.current.isDarkMode).toBe(false);
    expect(root().classList.contains('dark')).toBe(false);
    expect(root().style.getPropertyValue('--theme-mode')).toBe('light');
    expect(metaColor()).toBe('#ffffff');
  });

  it('follows a dark system preference in system mode', () => {
    mockSystemPreference(true);
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(true);
    expect(root().classList.contains('dark')).toBe(true);
  });

  it('an explicit light theme overrides a dark system preference', () => {
    mockSystemPreference(true);
    const { result } = renderHook(() => useDarkMode('light'));
    expect(result.current.isDark).toBe(false);
  });

  it('setTheme applies the dark class, meta colour and persists the choice', () => {
    const { result } = renderHook(() => useDarkMode('light'));
    act(() => result.current.setTheme('dark'));

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
    expect(root().classList.contains('dark')).toBe(true);
    expect(root().style.getPropertyValue('--theme-mode')).toBe('dark');
    expect(metaColor()).toBe('#1f2937');
    expect(document.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('"dark"');
  });

  it('restores a persisted theme', () => {
    localStorage.setItem(STORAGE_KEY, '"dark"');
    const { result } = renderHook(() => useDarkMode('light'));
    expect(result.current.theme).toBe('dark');
  });

  it('toggleTheme cycles light -> dark -> system -> light', () => {
    const { result } = renderHook(() => useDarkMode('light'));
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      act(() => result.current.toggleTheme());
      seen.push(result.current.theme);
    }
    expect(seen).toEqual(['dark', 'system', 'light']);
  });

  it('swaps the favicon when one is present', () => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = '/favicon.ico';
    document.head.appendChild(link);

    const { result } = renderHook(() => useDarkMode('light'));
    expect(link.getAttribute('href')).toBe('/favicon.ico');
    act(() => result.current.setTheme('dark'));
    expect(link.getAttribute('href')).toBe('/favicon-dark.ico');
  });

  it('Ctrl/Cmd+Shift+L toggles the theme; other combos do not', () => {
    const { result } = renderHook(() => useDarkMode('light'));

    pressShortcut({ ctrlKey: true, shiftKey: true });
    expect(result.current.theme).toBe('dark');
    pressShortcut({ metaKey: true, shiftKey: true });
    expect(result.current.theme).toBe('system');

    pressShortcut({ ctrlKey: true });
    pressShortcut({ shiftKey: true });
    expect(result.current.theme).toBe('system');
  });

  it('removes the keyboard listener on unmount', () => {
    const { result, unmount } = renderHook(() => useDarkMode('light'));
    unmount();
    pressShortcut({ ctrlKey: true, shiftKey: true });
    expect(result.current.theme).toBe('light');
  });

  it('subscribes to system changes only while in system mode', () => {
    const media = mockSystemPreference(false);
    const { result } = renderHook(() => useDarkMode('system'));
    expect(media.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    act(() => result.current.setTheme('dark'));
    expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
