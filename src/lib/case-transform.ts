/**
 * CASE TRANSFORMATION UTILITIES
 *
 * Backend returns snake_case from Postgres.
 * App uses camelCase conventions.
 *
 * This transform layer runs on ALL API requests/responses.
 *
 * ⚠️ KEYS THAT MUST NOT BE TRANSFORMED:
 * - User-generated text (already in values, not keys)
 * - i18n translation keys (not in API responses)
 * - Enum values that match database values exactly
 * - IDs that are used in URLs (already strings, not objects)
 */

/**
 * Convert snake_case to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Check if a value is a plain object (not Date, Array, null, etc.)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

/**
 * Transform object keys from snake_case to camelCase (recursive)
 *
 * Used on API responses before returning to app code.
 */
export function keysToCamel<T = unknown>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamel(item)) as T;
  }

  if (!isPlainObject(obj)) {
    return obj as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = keysToCamel(value);
  }

  return result as T;
}

/**
 * Transform object keys from camelCase to snake_case (recursive)
 *
 * Used on request bodies before sending to API.
 */
export function keysToSnake<T = unknown>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnake(item)) as T;
  }

  if (!isPlainObject(obj)) {
    return obj as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = keysToSnake(value);
  }

  return result as T;
}
