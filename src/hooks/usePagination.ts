import { useState, useCallback, useMemo } from 'react';
import { PaginationParams, PaginatedResponse } from '@/types/utils';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSort?: string;
  initialSortOrder?: 'asc' | 'desc';
}

interface UsePaginationResult<T> extends PaginationParams {
  items: T[];
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setLimit: (limit: number) => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  updateItems: (response: PaginatedResponse<T>) => void;
}

export function usePagination<T>({
  initialPage = 1,
  initialLimit = 10,
  initialSort = '',
  initialSortOrder = 'asc',
}: UsePaginationOptions = {}): UsePaginationResult<T> {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 1, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const updateItems = useCallback((response: PaginatedResponse<T>) => {
    setItems(response.items);
    setTotal(response.total);
  }, []);

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    items,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setLimit,
    setSortBy,
    setSortOrder,
    updateItems,
  };
}
