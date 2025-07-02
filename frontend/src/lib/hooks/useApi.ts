import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../api/apiService';
import type { ApiResponse } from '../../types/api';

interface UseApiOptions {
  immediate?: boolean;
  dependencies?: any[];
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function useApi<T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = true, dependencies = [] } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success) {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
          success: true
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.message || response.error || 'Request failed',
          success: false
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        success: false
      });
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...dependencies]);

  return {
    ...state,
    execute,
    reset,
    refetch: execute
  };
}

// Specialized hooks for common operations
export function useStaff() {
  return useApi(() => apiService.getStaff());
}

export function useStaffStats() {
  return useApi(() => apiService.getStaffStats());
}

export function useRestaurantVerifications() {
  return useApi(() => apiService.getRestaurantVerifications());
}

// Hook for paginated data
export function usePaginatedApi<T = any>(
  apiCall: (params: any) => Promise<ApiResponse<T>>,
  initialParams: any = {}
) {
  const [params, setParams] = useState(initialParams);
  const [allData, setAllData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  const { data, loading, error, execute } = useApi(
    () => apiCall(params),
    { immediate: false, dependencies: [params] }
  );

  useEffect(() => {
    execute();
  }, [execute]);

  useEffect(() => {
    if (data) {
      setAllData(Array.isArray(data) ? data : []);
      // Update pagination if available in response
    }
  }, [data]);

  const updateParams = useCallback((newParams: Partial<typeof params>) => {
    setParams((prev: typeof params) => ({ ...prev, ...newParams }));
  }, []);

  const goToPage = useCallback((page: number) => {
    updateParams({ page });
  }, [updateParams]);

  const search = useCallback((searchTerm: string) => {
    updateParams({ search: searchTerm, page: 1 });
  }, [updateParams]);

  const sort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateParams({ sortBy, sortOrder, page: 1 });
  }, [updateParams]);

  return {
    data: allData,
    loading,
    error,
    pagination,
    params,
    updateParams,
    goToPage,
    search,
    sort,
    refetch: execute
  };
} 