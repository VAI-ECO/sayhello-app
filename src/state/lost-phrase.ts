/**
 * Waverly's lost-connection line for a Hello (RULES 10.23, 12.2-12.3). The server picks it; this phone holds it only so
 * the closing screen can show it once. In memory; blames the technology, never the person, never a distance.
 */
const phrases = new Map<string, string>();

export function setLostPhrase(helloId: string, phrase: string | null | undefined): void {
  if (phrase && phrase.trim()) phrases.set(helloId, phrase);
}

export function takeLostPhrase(helloId: string | null | undefined): string | null {
  if (!helloId) return null;
  const p = phrases.get(helloId) ?? null;
  phrases.delete(helloId);
  return p;
}
