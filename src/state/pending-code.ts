/**
 * A code the user has just found free on "That one is taken" and wants to take: handed to the
 * Pick-a-code screen so they do not retype it. In-memory only; read once, then cleared.
 */

let pending: string | null = null;

export function setPendingCode(code: string | null): void {
  pending = code && code.trim() ? code.trim() : null;
}

export function takePendingCode(): string | null {
  const value = pending;
  pending = null;
  return value;
}
