/**
 * A key that names ONE attempt (a checkout, a stand request). The server returns the order that key already made,
 * so a retry or double tap never files a second one. It only has to be unique per account, not secret, and
 * must match the server's pattern: 8-100 characters of letters, digits and _ . : -
 */
export function newIdempotencyKey(): string {
  const part = () => Math.random().toString(36).slice(2, 12).padEnd(10, '0');
  return `${Date.now().toString(36)}-${part()}${part()}`;
}
