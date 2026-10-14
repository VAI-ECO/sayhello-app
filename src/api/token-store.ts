/**
 * Session token storage — native (iOS / Android).
 *
 * Keychain / Keystore via expo-secure-store. Never AsyncStorage.
 * The web build resolves token-store.web.ts instead (Metro platform extension).
 */

import * as SecureStore from 'expo-secure-store';

export function getToken(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export function setToken(key: string, value: string): Promise<void> {
  return SecureStore.setItemAsync(key, value);
}

export function deleteToken(key: string): Promise<void> {
  return SecureStore.deleteItemAsync(key);
}
