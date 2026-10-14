/**
 * Deep links and push-tap targets, resolved to the CURRENT route tree (see ROUTES-REPORT):
 *   /admin/*  /ambassador/*  /influencer/*  /store/*  /org/*  /home (tabs)  /entry (auth)  /hellos  /chat?helloId=
 *   /r/:code (creator link)  /claim?token= (owner claim)  /:hootzaId (Hootza page)
 * Accepts sayhello://..., https://sayhello.world/..., an APP_URL page, or a bare path, including the old
 * group-style paths ("/(admin)/payouts", "/(tabs)") that earlier links and notifications may still carry.
 * Pure functions: no router, no network.
 */
import { LINK_HOST } from './creator-link';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE = /^[a-zA-Z0-9]{1,40}$/;

/** First path segments a push payload or link may open. Anything else is dropped (no open redirect into the app). */
export const SAFE_ROOTS = new Set([
  'admin', 'ambassador', 'influencer', 'store', 'org', 'home', 'hellos', 'points', 'map', 'profile', 'claim', 'r', 'join', 'chat',
]);

/** Single segments that are real screens, never a creator code, when a link is https://sayhello.world/<segment>. */
const RESERVED_SEGMENTS = new Set([
  ...SAFE_ROOTS, 'entry', 'front-door', 'other-paths', 'accepted', 'arrow', 'block', 'report', 'privacy', 'terms', 'support', 'legal',
  'signup', 'billing', 'dashboard', 'photos', 'posts', 'edit', 'hours', 'category', 'preview', 'redeem', 'create',
]);

const GROUP_ALIAS: Record<string, string> = {
  '(admin)': 'admin', '(ambassador)': 'ambassador', '(influencer)': 'influencer', '(store)': 'store',
  '(organization)': '', '(tabs)': 'home',
};

export interface ParsedLink { segments: string[]; query: string; scheme: string | null; host: string | null }

export function parseLink(input: string): ParsedLink | null {
  if (typeof input !== 'string') return null;
  let rest = input.trim();
  if (!rest) return null;
  let scheme: string | null = null;
  let host: string | null = null;
  const m = rest.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/);
  if (m) {
    scheme = m[1].toLowerCase();
    rest = m[2];
    // sayhello://r/CODE -> host is really the first path segment; https hosts are dropped.
    if (scheme === 'https' || scheme === 'http') {
      const slash = rest.indexOf('/');
      host = (slash === -1 ? rest : rest.slice(0, slash)).toLowerCase();
      rest = slash === -1 ? '' : rest.slice(slash);
    } else if (scheme !== 'sayhello' && scheme !== 'exp') {
      return null;
    }
  }
  if (rest.startsWith('//')) return null; // protocol-relative: never an in-app path
  const hash = rest.indexOf('#');
  if (hash !== -1) rest = rest.slice(0, hash);
  const q = rest.indexOf('?');
  const query = q === -1 ? '' : rest.slice(q + 1);
  const path = q === -1 ? rest : rest.slice(0, q);
  const segments = path.split('/').filter(Boolean);
  if (segments.some((s) => s === '..' || s === '.')) return null;
  return { segments, query, scheme, host };
}

function withQuery(path: string, query: string): string {
  return query ? `${path}?${query}` : path;
}

function queryParam(query: string, key: string): string | null {
  for (const part of query.split('&')) {
    const [k, v = ''] = part.split('=');
    if (k === key) { try { return decodeURIComponent(v); } catch { return null; } }
  }
  return null;
}

/** The in-app path (with query) for a link, or null when it is not something this app opens. "/" for an empty link. */
export function resolveDeepLink(input: string): string | null {
  const link = parseLink(input);
  if (!link) return null;
  let { segments } = link;
  const { query, host, scheme } = link;
  // Old group-style paths -> real URL prefixes.
  segments = segments.flatMap((s) => {
    if (s in GROUP_ALIAS) return GROUP_ALIAS[s] ? [GROUP_ALIAS[s]] : [];
    if (/^\(.+\)$/.test(s)) return [];
    return [s];
  });
  // "/home/home" can come from "(tabs)/home".
  if (segments[0] === 'home' && segments[1] === 'home') segments = ['home', ...segments.slice(2)];
  if (segments.length === 0) return '/';
  const [first, second] = segments;

  // Creator links: /r/:code, /join?code=, and https://sayhello.world/<code>.
  if (first === 'r' && second && CODE.test(second)) return withQuery(`/r/${second}`, query);
  if (first === 'join') {
    const code = queryParam(query, 'code');
    if (code && CODE.test(code)) {
      const forWhom = queryParam(query, 'for');
      return forWhom && /^[a-z]+$/.test(forWhom) ? `/r/${code}?to=${forWhom}` : `/r/${code}`;
    }
    return null;
  }
  // Owner claim: APP_URL/claim?token=... (or /claim/<token>).
  if (first === 'claim') {
    const token = second ?? queryParam(query, 'token');
    return token && /^[A-Za-z0-9_-]{8,}$/.test(token) ? `/claim?token=${token}` : '/claim';
  }
  // Org pages.
  if ((first === 'org' || first === 'organization' || first === 'orgs') && segments.length > 1) {
    return withQuery(`/org/${segments.slice(1).join('/')}`, query);
  }
  if (first === 'org') return '/org';
  // Hootza pages: /<uuid>, /hootza/<uuid>, /hootzas/<uuid>, /h/<uuid> (+ sub-screens such as /chat).
  if (UUID.test(first)) return withQuery(`/${segments.join('/')}`, query);
  if (['hootza', 'hootzas', 'h'].includes(first) && second && UUID.test(second)) {
    return withQuery(`/${segments.slice(1).join('/')}`, query);
  }
  // sayhello.world/<code> (a bare creator code) - universal links only, and never a real screen name.
  if (host === LINK_HOST && segments.length === 1 && CODE.test(first) && !RESERVED_SEGMENTS.has(first.toLowerCase())) {
    return `/r/${first}`;
  }
  // Group-prefixed auth: /(auth)/entry -> /entry is covered by the group strip above.
  if (scheme === 'sayhello' || scheme === 'exp' || scheme === null || host === LINK_HOST || host !== null) {
    return withQuery(`/${segments.join('/')}`, query);
  }
  return null;
}

/** For a push payload's `path`/`url`: only paths under a known surface are followed. */
export function resolveSafePushPath(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const resolved = resolveDeepLink(input);
  if (!resolved || resolved === '/') return null;
  const first = resolved.split(/[/?]/).filter(Boolean)[0] ?? '';
  return SAFE_ROOTS.has(first) || UUID.test(first) ? resolved : null;
}

/**
 * Where a tapped notification goes. The server sends { kind } (hello_reveal, hello_nudge, chat_message, cancelled, changed) and
 * may add helloId / hootzaId / path; a payload path wins, then the kind, then /home.
 */
export function pathForNotification(data: unknown): string {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const explicit = resolveSafePushPath(d.path) ?? resolveSafePushPath(d.url);
  if (explicit) return explicit;
  const helloId = typeof d.helloId === 'string' && UUID.test(d.helloId) ? d.helloId : null;
  const hootzaId = typeof d.hootzaId === 'string' && UUID.test(d.hootzaId) ? d.hootzaId : null;
  switch (d.kind) {
    case 'hello_reveal': return helloId ? `/hellos/${helloId}` : '/hellos';
    case 'hello_nudge': return '/home';
    case 'chat_message': return helloId ? `/chat?helloId=${helloId}` : '/hellos';
    case 'cancelled':
    case 'changed': return hootzaId ? `/${hootzaId}` : '/home';
    default: return '/home';
  }
}
