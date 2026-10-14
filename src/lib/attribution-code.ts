/**
 * Attribution codes (ambassador, influencer, organization) share one namespace; MONEY Part 5: "Confusables normalised — O/0, I/1".
 * Case never matters (RULES §25.3). Mirrors the API's normalizeAttributionCode (api/src/lib/attribution-code.ts, migration 325):
 * only those two pairs are mapped. The server is the authority; this only lets a screen recognise a person's own code.
 */
export function normalizeAttributionCode(code: string): string {
  return code.toLowerCase().replace(/0/g, 'o').replace(/1/g, 'i');
}

/** True when two spellings are the same code under the namespace rules. */
export function sameAttributionCode(a: string, b: string): boolean {
  return normalizeAttributionCode(a) === normalizeAttributionCode(b);
}
