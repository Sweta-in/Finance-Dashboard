import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { searchRecords, type SearchApiResponse, type SearchResultItem } from '../api/search';

/**
 * Custom hook for debounced global search.
 * - 300ms debounce before firing API call
 * - Minimum 2 characters to trigger search
 * - Uses React Query for caching and deduplication
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the query by 300ms
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  const { data, isLoading, isFetching } = useQuery<SearchApiResponse>({
    queryKey: queryKeys.SEARCH(debouncedQuery),
    queryFn: () => searchRecords({ q: debouncedQuery, size: 8 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 10_000,
    gcTime: 60_000,
  });

  return {
    query,
    setQuery,
    results: (data?.results ?? []) as SearchResultItem[],
    totalCount: data?.totalCount ?? 0,
    isLoading: isLoading && debouncedQuery.length >= 2,
    isFetching,
    isActive: debouncedQuery.length >= 2,
  };
}
