/**
 * One read, four honest states: loading → ready | error, with a retry, pull-to-refresh and a
 * reload every time the screen regains focus. A stale answer never overwrites a newer one.
 * `fetcher` returns the API client's `{ data?, error? }` (a missing response counts as an error).
 */

import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

type Reply<T> = { data?: T; error?: { message: string; code?: string } } | undefined;

export function useLoader<T>(fetcher: () => Promise<Reply<T>>) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<T | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loadId = useRef(0);
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;

  const load = useCallback(async (asRefresh = false) => {
    const id = ++loadId.current;
    if (asRefresh) setRefreshing(true);
    let res: Reply<T>;
    try {
      res = await fetchRef.current();
    } catch {
      res = undefined;
    }
    if (id !== loadId.current) return;
    setRefreshing(false);
    if (!res || res.error || res.data === undefined) {
      setErrorCode(res?.error?.code ?? null);
      setState('error');
      return;
    }
    setData(res.data);
    setErrorCode(null);
    setState('ready');
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const retry = useCallback(() => { setState('loading'); void load(); }, [load]);
  const onRefresh = useCallback(() => { void load(true); }, [load]);
  return { state, data, errorCode, refreshing, retry, onRefresh, reload: load };
}
