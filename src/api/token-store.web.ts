/**
 * Session token storage — web build.
 *
 * expo-secure-store has no web implementation (its web module is empty, so every
 * call throws). A browser has no Keychain; sessionStorage is the narrowest store
 * that survives a page reload: it is scoped to this origin and this tab, and is
 * gone when the tab closes. Never localStorage, never AsyncStorage.
 *
 * Failures reject, exactly like the native store, so the client's existing
 * "a failed write leaves no session" handling applies unchanged.
 */

function store(): Storage {
  const s = globalThis.sessionStorage;
  if (!s) throw new Error('sessionStorage unavailable');
  return s;
}

export async function getToken(key: string): Promise<string | null> {
  return store().getItem(key);
}

export async function setToken(key: string, value: string): Promise<void> {
  store().setItem(key, value);
}

export async function deleteToken(key: string): Promise<void> {
  store().removeItem(key);
}
