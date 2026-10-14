/**
 * What a Connections row says about a hello beyond the name (DESIGN-BRIEF-11 req. 5: selfie, first name, the date,
 * the pin location). Only revealed hellos carry a place or date the viewer may see (§10.6, §10.41): before reveal the
 * API sends neither, and this returns null so a row never shows an empty or invented line. No status, no "declined"
 * wording, nothing that reveals a decision (brief req. 1).
 */
import { t } from '../i18n';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Same day wording as the points list: weekday within a week, otherwise "Oct 3". */
export function connectionDay(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return now - d.getTime() < WEEK_MS
    ? d.toLocaleDateString(undefined, { weekday: 'long' })
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function connectionPlaceDay(
  hello: { revealedAt?: string | null; locationName?: string | null },
  now: number = Date.now(),
): string | null {
  if (!hello.revealedAt) return null;
  const day = connectionDay(hello.revealedAt, now);
  if (hello.locationName && day) return t('encounter.connections.placeDay', { place: hello.locationName, day });
  return hello.locationName || day || null;
}

/** First letter for the colour circle shown when there is no selfie (it may have been removed on request; the pin stays). */
export function connectionInitial(displayName: string | null | undefined): string {
  const first = (displayName ?? '').trim().charAt(0);
  return first ? first.toUpperCase() : '';
}
