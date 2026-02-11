/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useDataFetch - Simple SWR-style data fetching hook
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Stale-while-revalidate pattern
 * - Request deduplication
 * - Automatic cleanup on unmount
 * - No infinite loops (stable dependencies)
 * - Safe state updates after unmount
 * 
 * Usage:
 * const { data, error, isLoading, isValidating, mutate } = useDataFetch(
 *   'cache-key',
 *   () => fetch('/api/data').then(r => r.json()),
 *   { cacheTime: 5 * 60 * 1000 }
 * );
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Cache storage (in-memory for session, localStorage for persistence)
const memoryCache = new Map();

// Helper: Get from localStorage cache
const getLocalCache = (key, cacheTime) => {
  if (!key) return null;
  try {
    const cached = localStorage.getItem(`swr_${key}`);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < cacheTime) {
      return data;
    }
  } catch {
    // Cache read failed
  }
  return null;
};

// Helper: Set to localStorage cache
const setLocalCache = (key, data) => {
  if (!key || data === undefined) return;
  try {
    localStorage.setItem(`swr_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // Cache write failed (quota exceeded, etc.)
  }
};

/**
 * @param {string|null} key - Cache key (null to disable fetching)
 * @param {Function} fetcher - Async function that returns data
 * @param {Object} options - Configuration
 * @param {number} options.cacheTime - How long to keep cache valid (ms)
 * @param {boolean} options.revalidateOnMount - Revalidate when component mounts
 * @param {boolean} options.revalidateOnFocus - Revalidate when window gains focus
 */
export function useDataFetch(key, fetcher, options = {}) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    revalidateOnMount = true,
    revalidateOnFocus = true,
  } = options;

  // State
  const [data, setData] = useState(() => {
    // Initialize with cached data if available
    if (key) {
      return memoryCache.get(key) ?? getLocalCache(key, cacheTime) ?? null;
    }
    return null;
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(!data);
  const [isValidating, setIsValidating] = useState(false);

  // Refs for cleanup and deduplication
  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);
  const keyRef = useRef(key);
  const fetcherRef = useRef(fetcher);

  // Update refs when deps change (avoid stale closures)
  useEffect(() => {
    keyRef.current = key;
    fetcherRef.current = fetcher;
  }, [key, fetcher]);

  // Core fetch function
  const doFetch = useCallback(async (isBackground = false) => {
    const currentKey = keyRef.current;
    const currentFetcher = fetcherRef.current;
    
    if (!currentKey || !currentFetcher) return;

    // Generate unique fetch ID to handle race conditions
    const fetchId = ++fetchIdRef.current;

    if (isBackground) {
      setIsValidating(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await currentFetcher();

      // Only update if this is still the latest fetch and component is mounted
      if (fetchId === fetchIdRef.current && mountedRef.current) {
        setData(result);
        setError(null);
        
        // Update caches
        memoryCache.set(currentKey, result);
        setLocalCache(currentKey, result);
      }
    } catch (err) {
      if (fetchId === fetchIdRef.current && mountedRef.current) {
        setError(err);
        console.error(`[useDataFetch] Error fetching "${currentKey}":`, err);
      }
    } finally {
      if (fetchId === fetchIdRef.current && mountedRef.current) {
        setIsLoading(false);
        setIsValidating(false);
      }
    }
  }, []);

  // Manual revalidation
  const mutate = useCallback((newData) => {
    if (newData !== undefined) {
      // Optimistic update
      setData(newData);
      if (keyRef.current) {
        memoryCache.set(keyRef.current, newData);
        setLocalCache(keyRef.current, newData);
      }
    } else {
      // Revalidate from server
      doFetch(true);
    }
  }, [doFetch]);

  // Initial fetch on mount
  useEffect(() => {
    mountedRef.current = true;

    if (key && revalidateOnMount) {
      // If we have cached data, do background revalidation
      const cachedData = memoryCache.get(key) ?? getLocalCache(key, cacheTime);
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        doFetch(true); // Background revalidation
      } else {
        doFetch(false); // Full load
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, [key]); // Only re-run when key changes

  // Revalidate on focus (optional)
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        doFetch(true);
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [revalidateOnFocus, doFetch]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export default useDataFetch;
