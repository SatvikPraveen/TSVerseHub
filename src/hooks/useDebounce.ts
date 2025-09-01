// File: src/hooks/useDebounce.ts

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that debounces a value with a specified delay
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  dependencies: React.DependencyList = []
): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay, ...dependencies]
  );

  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedCallback, cancelDebounce];
}

/**
 * Hook for debounced search functionality
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  initialQuery: string = '',
  delay: number = 300
): {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  isSearching: boolean;
  error: string | null;
} {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFunction]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
  };
}

/**
 * Hook for debounced input validation
 */
export function useDebouncedValidation<T>(
  value: T,
  validator: (value: T) => string | null,
  delay: number = 300
): {
  error: string | null;
  isValidating: boolean;
} {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    setIsValidating(true);
    
    const validationError = validator(debouncedValue);
    setError(validationError);
    setIsValidating(false);
  }, [debouncedValue, validator]);

  return { error, isValidating };
}