// Tests for src/hooks/useLocalStorage.ts.
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearLocalStorageKey,
  useLocalStorage,
  useLocalStorageArray,
  useLocalStorageObject,
} from '@/hooks/useLocalStorage';

function dispatchStorage(key: string, newValue: string | null) {
  act(() => {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    expect(result.current[0]).toBe('init');
    expect(localStorage.getItem('k')).toBeNull();
  });

  it('reads an existing JSON value', () => {
    localStorage.setItem('k', JSON.stringify({ a: 1 }));
    const { result } = renderHook(() => useLocalStorage('k', { a: 0 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it('falls back to the initial value and warns on corrupt data', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.setItem('k', '{oops');
    const { result } = renderHook(() => useLocalStorage('k', 7));
    expect(result.current[0]).toBe(7);
    expect(warn).toHaveBeenCalledWith('Error reading localStorage key "k":', expect.any(SyntaxError));
  });

  it('persists direct and functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    act(() => result.current[1](prev => prev * 2));
    expect(result.current[0]).toBe(10);
    expect(localStorage.getItem('count')).toBe('10');
  });

  it('applies several functional updates in one batch cumulatively, like useState (regression)', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => {
      result.current[1](p => p + 1);
      result.current[1](p => p + 1);
      result.current[1](p => p + 1);
    });
    expect(result.current[0]).toBe(3);
    expect(localStorage.getItem('count')).toBe('3');
  });

  it('warns but keeps in-memory state when persisting fails', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const { result } = renderHook(() => useLocalStorage('k', 'a'));
    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');
    expect(warn).toHaveBeenCalledWith('Error setting localStorage key "k":', expect.any(Error));
  });

  it('syncs with storage events from other tabs for its own key only', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { result } = renderHook(() => useLocalStorage('k', 'a'));

    dispatchStorage('k', JSON.stringify('from-other-tab'));
    expect(result.current[0]).toBe('from-other-tab');

    dispatchStorage('other', JSON.stringify('ignored'));
    dispatchStorage('k', null);
    expect(result.current[0]).toBe('from-other-tab');

    dispatchStorage('k', 'not json');
    expect(result.current[0]).toBe('from-other-tab');
    expect(warn).toHaveBeenCalledWith('Error parsing localStorage change for key "k":', expect.any(SyntaxError));
  });

  it('functional updates build on a value received from another tab', () => {
    const { result } = renderHook(() => useLocalStorage('n', 0));
    dispatchStorage('n', '40');
    act(() => result.current[1](p => p + 2));
    expect(result.current[0]).toBe(42);
  });

  it('stops listening after unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useLocalStorage('k', 1));
    unmount();
    expect(remove).toHaveBeenCalledWith('storage', expect.any(Function));
  });
});

describe('useLocalStorageObject', () => {
  type Prefs = { theme: string; size: number };
  const isPrefs = (v: unknown): v is Prefs =>
    typeof v === 'object' && v !== null && typeof (v as Prefs).theme === 'string' && typeof (v as Prefs).size === 'number';
  const initial: Prefs = { theme: 'light', size: 12 };

  it('accepts stored data that passes the validator', () => {
    localStorage.setItem('prefs', JSON.stringify({ theme: 'dark', size: 14 }));
    const { result } = renderHook(() => useLocalStorageObject('prefs', initial, isPrefs));
    expect(result.current[0]).toEqual({ theme: 'dark', size: 14 });
  });

  it('rejects data that fails the validator', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.setItem('prefs', JSON.stringify({ theme: 3 }));
    const { result } = renderHook(() => useLocalStorageObject('prefs', initial, isPrefs));
    expect(result.current[0]).toEqual(initial);
    expect(warn).toHaveBeenCalledWith('Invalid data in localStorage for key "prefs". Using initial value.');
  });

  it('uses the initial value for missing or corrupt data and works without a validator', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { result: missing } = renderHook(() => useLocalStorageObject('none', initial));
    expect(missing.current[0]).toEqual(initial);

    localStorage.setItem('bad', '{');
    const { result: corrupt } = renderHook(() => useLocalStorageObject('bad', initial));
    expect(corrupt.current[0]).toEqual(initial);
    expect(warn).toHaveBeenCalled();

    act(() => missing.current[1]({ theme: 'x', size: 1 }));
    expect(JSON.parse(localStorage.getItem('none')!)).toEqual({ theme: 'x', size: 1 });
  });
});

describe('useLocalStorageArray', () => {
  it('defaults to an empty array and appends', () => {
    const { result } = renderHook(() => useLocalStorageArray<string>('list'));
    expect(result.current[0]).toEqual([]);
    act(() => result.current[1](prev => [...prev, 'a']));
    act(() => result.current[1](prev => [...prev, 'b']));
    expect(JSON.parse(localStorage.getItem('list')!)).toEqual(['a', 'b']);
  });
});

describe('clearLocalStorageKey', () => {
  it('removes the key', () => {
    localStorage.setItem('gone', '1');
    clearLocalStorageKey('gone');
    expect(localStorage.getItem('gone')).toBeNull();
  });

  it('warns instead of throwing when storage is unavailable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(() => clearLocalStorageKey('x')).not.toThrow();
    expect(warn).toHaveBeenCalledWith('Error clearing localStorage key "x":', expect.any(Error));
  });
});
