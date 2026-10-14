import * as WebTokenStore from '../token-store.web';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.has(key) ? this.values.get(key)! : null; }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
  removeItem(key: string) { this.values.delete(key); }
}

const original = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');

function installSessionStorage(value: unknown) {
  Object.defineProperty(globalThis, 'sessionStorage', { value, configurable: true, writable: true });
}

afterEach(() => {
  if (original) Object.defineProperty(globalThis, 'sessionStorage', original);
  else delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
});

describe('web session token store', () => {
  it('round-trips the token through sessionStorage and removes it', async () => {
    const storage = new MemoryStorage();
    installSessionStorage(storage);

    expect(await WebTokenStore.getToken('auth_token')).toBeNull();
    await WebTokenStore.setToken('auth_token', 'signed-session');
    expect(storage.getItem('auth_token')).toBe('signed-session');
    expect(await WebTokenStore.getToken('auth_token')).toBe('signed-session');

    await WebTokenStore.deleteToken('auth_token');
    expect(storage.getItem('auth_token')).toBeNull();
  });

  it('rejects when sessionStorage is unavailable, like a failed Keychain write', async () => {
    installSessionStorage(undefined);

    await expect(WebTokenStore.setToken('auth_token', 'signed-session')).rejects.toThrow('sessionStorage unavailable');
    await expect(WebTokenStore.getToken('auth_token')).rejects.toThrow('sessionStorage unavailable');
  });

  it('rejects when the browser refuses the write', async () => {
    installSessionStorage({
      getItem: () => null,
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: () => undefined,
    });

    await expect(WebTokenStore.setToken('auth_token', 'signed-session')).rejects.toThrow('QuotaExceededError');
  });
});
