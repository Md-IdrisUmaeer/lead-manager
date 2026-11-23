import { useCallback, useEffect, useState } from 'react';
import { getStats } from '../api/leads';
import { isAbortError } from '../api/client';

export default function useStats() {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, stats: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    getStats(controller.signal)
      .then((res) => setResult({ key: reloadCount, stats: res.data, error: null }))
      .catch((err) => {
        if (isAbortError(err)) return;
        setResult({ key: reloadCount, stats: null, error: err });
      });
    return () => controller.abort();
  }, [reloadCount]);

  const refetch = useCallback(() => setReloadCount((c) => c + 1), []);

  return {
    stats: result.stats,
    loading: result.key !== reloadCount,
    error: result.error,
    refetch,
  };
}
