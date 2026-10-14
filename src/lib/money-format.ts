/**
 * Money formatting — amounts from API are integer cents.
 */

export function formatCents(cents: number): string {
  if (cents % 100 === 0) return `$${cents / 100}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatCentsSigned(cents: number): string {
  const prefix = cents < 0 ? '−' : '';
  return `${prefix}${formatCents(Math.abs(cents))}`;
}
