// Tests for src/hooks/useDebounce.ts (fake timers throughout).
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useDebounce,
  useDebouncedCallback,
  useDebouncedSearch,
  useDebouncedValidation,
} from '@/hooks/useDebounce';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebounce', () => {
  it('returns the initial value immediately and updates only after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } });
    expect(result.current).toBe('a');

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('b');
  });

  it('collapses rapid changes into the last value', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), { initialProps: { value: 0 } });
    for (let i = 1; i <= 5; i++) {
      rerender({ value: i });
      act(() => vi.advanceTimersByTime(50));
    }
    expect(result.current).toBe(0);
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe(5);
  });

  it('restarts the timer when the delay changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'x', delay: 100 },
    });
    rerender({ value: 'y', delay: 100 });
    act(() => vi.advanceTimersByTime(50));
    rerender({ value: 'y', delay: 500 });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('x');
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe('y');
  });
});

describe('useDebouncedCallback', () => {
  it('invokes once with the latest arguments after the delay', () => {
    const fn = vi.fn((_a: string, _b: number) => undefined);
    const { result } = renderHook(() => useDebouncedCallback(fn, 200));
    const [debounced] = result.current;

    debounced('first', 1);
    act(() => vi.advanceTimersByTime(100));
    debounced('second', 2);
    act(() => vi.advanceTimersByTime(199));
    expect(fn).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second', 2);
  });

  it('cancel prevents the pending call', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 200));
    result.current[0]();
    result.current[1]();
    result.current[1](); // cancelling twice is harmless
    act(() => vi.advanceTimersByTime(500));
    expect(fn).not.toHaveBeenCalled();
  });

  it('calls the latest callback without changing the debounced identity', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 100), { initialProps: { cb: first } });
    const debounced = result.current[0];

    debounced();
    rerender({ cb: second });
    expect(result.current[0]).toBe(debounced);
    act(() => vi.advanceTimersByTime(100));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('drops the pending call on unmount', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 100));
    result.current[0]();
    unmount();
    act(() => vi.advanceTimersByTime(200));
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('useDebouncedSearch', () => {
  it('searches the debounced query and exposes results', async () => {
    const search = vi.fn((q: string) => Promise.resolve([`${q}-1`, `${q}-2`]));
    const { result } = renderHook(() => useDebouncedSearch(search, '', 300));
    expect(result.current.results).toEqual([]);
    expect(search).not.toHaveBeenCalled();

    act(() => result.current.setQuery('ts'));
    expect(result.current.query).toBe('ts');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('ts');
    expect(result.current.results).toEqual(['ts-1', 'ts-2']);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('reports isSearching while the search is pending', async () => {
    let resolve: (v: string[]) => void = () => undefined;
    const search = vi.fn(() => new Promise<string[]>(r => (resolve = r)));
    const { result } = renderHook(() => useDebouncedSearch(search, 'q', 10));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(result.current.isSearching).toBe(true);

    await act(async () => {
      resolve(['done']);
      await Promise.resolve();
    });
    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toEqual(['done']);
  });

  it('surfaces errors and clears results', async () => {
    const failing = vi.fn(() => Promise.reject(new Error('backend down')));
    const { result } = renderHook(() => useDebouncedSearch(failing, 'x', 50));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(result.current.error).toBe('backend down');
    expect(result.current.results).toEqual([]);
  });

  it('uses a generic message for non-Error rejections', async () => {
    const failing = vi.fn(async (): Promise<string[]> => {
      await Promise.resolve();
      throw 'plain string';
    });
    const { result } = renderHook(() => useDebouncedSearch(failing, 'x', 50));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(result.current.error).toBe('Search failed');
  });

  it('skips blank queries and resets state', async () => {
    const search = vi.fn((q: string) => Promise.resolve([q]));
    const { result } = renderHook(() => useDebouncedSearch(search, 'abc', 20));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });
    expect(result.current.results).toEqual(['abc']);

    act(() => result.current.setQuery('   '));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(result.current.results).toEqual([]);
  });
});

describe('useDebouncedValidation', () => {
  const validator = (v: string) => (v.length < 3 ? 'Too short' : null);

  it('validates the debounced value', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValidation(v, validator, 200), {
      initialProps: { v: 'ab' },
    });
    expect(result.current).toEqual({ error: 'Too short', isValidating: false });

    rerender({ v: 'abcd' });
    expect(result.current.error).toBe('Too short');
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toEqual({ error: null, isValidating: false });
  });

  it('defaults to a 300ms delay', () => {
    const spy = vi.fn(validator);
    const { rerender } = renderHook(({ v }) => useDebouncedValidation(v, spy), { initialProps: { v: 'a' } });
    rerender({ v: 'abc' });
    act(() => vi.advanceTimersByTime(299));
    expect(spy).not.toHaveBeenCalledWith('abc');
    act(() => vi.advanceTimersByTime(1));
    expect(spy).toHaveBeenLastCalledWith('abc');
  });
});
