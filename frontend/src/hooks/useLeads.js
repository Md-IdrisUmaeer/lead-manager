import { useCallback, useEffect, useState } from 'react';
import { listLeads } from '../api/leads';
import { isAbortError } from '../api/client';
import useDebounce from './useDebounce';

const INITIAL_QUERY = {
  search: '',
  status: '',
  sort: 'createdAt',
  order: 'desc',
  page: 1,
  limit: 10,
};

// List state + query state. `loading` is derived: true while the latest
// result doesn't belong to the current request yet.
export default function useLeads() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, leads: null, pagination: null, error: null });

  // The input updates instantly; only the debounced value hits the API.
  const search = useDebounce(query.search, 300).trim();
  const { status, sort, order, page, limit } = query;
  const requestKey = [search, status, sort, order, page, limit, reloadCount].join('|');

  useEffect(() => {
    // Each fetch aborts the previous one, so a slow old response
    // never overwrites a newer one.
    const controller = new AbortController();
    const key = [search, status, sort, order, page, limit, reloadCount].join('|');

    listLeads({ search, status, sort, order, page, limit }, controller.signal)
      .then((res) => setResult({ key, leads: res.data, pagination: res.pagination, error: null }))
      .catch((err) => {
        if (isAbortError(err)) return;
        // Keep the previous rows; the page decides how to show the error.
        setResult((prev) => ({ ...prev, key, error: err }));
      });

    return () => controller.abort();
  }, [search, status, sort, order, page, limit, reloadCount]);

  const setSearch = useCallback((value) => setQuery((q) => ({ ...q, search: value, page: 1 })), []);
  const setStatus = useCallback((value) => setQuery((q) => ({ ...q, status: value, page: 1 })), []);
  const setPage = useCallback((value) => setQuery((q) => ({ ...q, page: value })), []);
  const clearFilters = useCallback(() => setQuery((q) => ({ ...q, search: '', status: '', page: 1 })), []);
  const refetch = useCallback(() => setReloadCount((c) => c + 1), []);

  // Same field flips the order; a new field starts ascending.
  const setSort = useCallback(
    (field) =>
      setQuery((q) =>
        q.sort === field
          ? { ...q, order: q.order === 'asc' ? 'desc' : 'asc', page: 1 }
          : { ...q, sort: field, order: 'asc', page: 1 }
      ),
    []
  );

  return {
    leads: result.leads,
    pagination: result.pagination,
    loading: result.key !== requestKey,
    error: result.error,
    query,
    // Filters actually applied to the current results (debounced search).
    hasFilters: Boolean(search || status),
    setSearch,
    setStatus,
    setSort,
    setPage,
    clearFilters,
    refetch,
  };
}
