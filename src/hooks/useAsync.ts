import { useState, useCallback } from 'react';
import { AsyncState, ApiError } from '@/types/utils';

interface UseAsyncOptions<T> {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
}

interface UseAsyncResult<T> extends AsyncState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: ApiError | null) => void;
}

export function useAsync<T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: options.initialData ?? null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFn(...args);
        setState({ data, loading: false, error: null });
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        const apiError = error as ApiError;
        setState({ data: null, loading: false, error: apiError });
        options.onError?.(apiError);
        throw apiError;
      } finally {
        options.onSettled?.();
      }
    },
    [asyncFn, options]
  );

  const reset = useCallback(() => {
    setState({
      data: options.initialData ?? null,
      loading: false,
      error: null,
    });
  }, [options.initialData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

// Utility function to retry failed operations
export function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): () => Promise<T> {
  return async () => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError;
  };
}

// Utility function to debounce async operations
export function debounceAsync<T>(
  fn: (...args: any[]) => Promise<T>,
  wait: number
): (...args: any[]) => Promise<T> {
  let timeout: NodeJS.Timeout;
  let resolver: ((value: T) => void) | null = null;
  let rejecter: ((reason: any) => void) | null = null;
  let lastPromise: Promise<T> | null = null;

  return (...args: any[]) => {
    if (lastPromise) {
      return lastPromise;
    }

    lastPromise = new Promise<T>((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });

    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      try {
        const result = await fn(...args);
        resolver?.(result);
      } catch (error) {
        rejecter?.(error);
      } finally {
        lastPromise = null;
        resolver = null;
        rejecter = null;
      }
    }, wait);

    return lastPromise;
  };
}
