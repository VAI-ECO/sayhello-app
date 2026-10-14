/**
 * A Creator's link is `sayhello.world/<code>` (the delivered host, Signup Flows / SN-08). Attribution
 * is always the CODE itself; a tag after "?" only says where a tap came from. Codes carry credit,
 * never price (§2.10). Whether the host resolves to the app or the store is the website's job.
 */

export const LINK_HOST = 'sayhello.world';

export function creatorLinkText(code: string): string {
  return `${LINK_HOST}/${code}`;
}

export function creatorLinkUrl(code: string): string {
  return `https://${creatorLinkText(code)}`;
}
