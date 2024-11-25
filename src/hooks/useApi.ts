import { useState, useCallback } from 'react';
import { ApiResponse, AsyncState, ApiError } from '@/types/utils';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  headers?: HeadersInit;
}

interface ApiRequestConfig extends Omit<RequestInit, 'body'> {
  params?: Record<string, string> | undefined;
  body?: BodyInit | null;
}

export function useApi<T>(baseUrl: string, options: UseApiOptions = {}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const buildUrl = useCallback((endpoint: string, params?: Record<string, string>) => {
    const url = new URL(`${baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }, [baseUrl]);

  const handleResponse = async <R>(response: Response): Promise<ApiResponse<R>> => {
    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = new Error(data.error?.message || 'An error occurred') as ApiError;
      error.code = data.error?.code || 'UNKNOWN_ERROR';
      error.statusCode = response.status;
      error.details = data.error?.details;
      throw error;
    }

    return data;
  };

  const request = useCallback(async <R = T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<R>> => {
    const { params, headers: configHeaders, ...restConfig } = config;
    
    setState({ ...state, loading: true, error: null });

    try {
      const response = await fetch(buildUrl(endpoint, params), {
        headers: {
          'Content-Type': 'application/json',
          ...configHeaders,
        },
        ...restConfig,
      });

      const data = await handleResponse<R>(response);
      
      setState({
        data: data.data as T,
        loading: false,
        error: null,
      });

      options.onSuccess?.(data);
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      setState({ ...state, data: null, loading: false, error: apiError });

      options.onError?.(apiError);
      throw apiError;
    }
  }, [buildUrl, options, state]);

  const get = useCallback(<R = T>(
    endpoint: string,
    params?: Record<string, string>
  ) => {
    return request<R>(endpoint, { method: 'GET', params });
  }, [request]);

  const post = useCallback(<R = T>(
    endpoint: string,
    body: unknown,
    params?: Record<string, string>
  ) => {
    return request<R>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : null,
      params,
    });
  }, [request]);

  const put = useCallback(<R = T>(
    endpoint: string,
    body: unknown,
    params?: Record<string, string>
  ) => {
    return request<R>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : null,
      params,
    });
  }, [request]);

  const del = useCallback(<R = T>(
    endpoint: string,
    params?: Record<string, string>
  ) => {
    return request<R>(endpoint, {
      method: 'DELETE',
      params,
    });
  }, [request]);

  return {
    state,
    get,
    post,
    put,
    del,
  };
}
