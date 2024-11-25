import { useLoading } from '@/context/LoadingContext';

interface LoadingContextType {
  setIsLoading: (isLoading: boolean) => void;
}

interface FetchOptions {
  timeout?: number;
}

export const createFetchData = (loadingContext: LoadingContextType) => {
  return async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    const { setIsLoading } = loadingContext;
    const { timeout = 5000 } = options;

    setIsLoading(true);
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Fetch error:', error.message);
      } else {
        console.error('Fetch error:', error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
};

export const useFetchData = () => {
  const loadingContext = useLoading() as LoadingContextType;

  if (!loadingContext || typeof loadingContext.setIsLoading !== 'function') {
    throw new Error('Loading context is not properly initialized');
  }

  return createFetchData(loadingContext);
};