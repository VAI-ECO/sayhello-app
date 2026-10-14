/**
 * Loads the open hello for an encounter screen from the server and reloads it
 * when the screen regains focus. The id comes from the `helloId` route param
 * or, failing that, the hello opened from the Hellos list this session.
 *
 * `gone` is true when the server no longer returns the hello (404/403). Screens
 * leave quietly then: the app never explains non-acceptance (§10.21).
 */

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { NavigationContext } from 'expo-router/react-navigation';
import { getHello, type EncounterHello } from '../api/hellos';
import { getActiveHelloId, setActiveHelloId } from '../state/active-hello';

export function useEncounterHello() {
  const params = useLocalSearchParams<{ helloId?: string }>();
  const helloId = (typeof params?.helloId === 'string' && params.helloId) || getActiveHelloId();
  const navigation = useContext(NavigationContext);
  const [hello, setHello] = useState<EncounterHello | null>(null);
  const [loading, setLoading] = useState(Boolean(helloId));
  const [error, setError] = useState<string | null>(null);
  const [gone, setGone] = useState(!helloId);
  const mounted = useRef(true);
  const gen = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const reload = useCallback(async () => {
    if (!helloId) return null;
    setActiveHelloId(helloId);
    const mine = ++gen.current;
    setError(null);
    const res = await getHello(helloId);
    if (!mounted.current || mine !== gen.current) return null;
    setLoading(false);
    if (res.error) {
      if (res.error.status === 404 || res.error.status === 403) setGone(true);
      else setError(res.error.message);
      return null;
    }
    const next = res.data?.hello ?? null;
    setHello(next);
    setGone(!next);
    return next;
  }, [helloId]);

  useEffect(() => { void reload(); }, [reload]);

  useEffect(() => {
    if (!navigation) return;
    return navigation.addListener('focus', () => { void reload(); });
  }, [navigation, reload]);

  return { helloId, hello, setHello, loading, error, gone, reload };
}
