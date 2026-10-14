/**
 * INTERNATIONALIZATION SYSTEM
 *
 * Simple i18n matching the backend's approach.
 * All user-facing strings go through this layer.
 */

import { en, type Translations } from './en';

let currentLocale: Translations = en;

export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = currentLocale;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Missing translation key: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation key is not a string: ${key}`);
    return key;
  }

  if (!params) {
    return value;
  }

  // Simple template replacement: {{key}} -> value
  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() ?? '';
  });
}

export { en };
