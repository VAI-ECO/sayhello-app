/**
 * Incoming links (sayhello://..., universal links) are rewritten to the real route tree before the router sees them.
 * Logic lives in src/lib/deep-links.ts (unit tested).
 */
import { resolveDeepLink } from '../src/lib/deep-links';

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    return resolveDeepLink(path) ?? '/';
  } catch {
    return '/';
  }
}
