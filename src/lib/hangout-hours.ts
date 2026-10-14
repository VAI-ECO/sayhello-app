/**
 * Hello Hangout hours (SN-16 "When you're open. Shows on your page.").
 * Hours are entered by the business as HH:MM per weekday (§17.7 — entered, never
 * inferred). "Open now" is evaluated on the device in the viewer's local time
 * (§17.17), which assumes the viewer is in the Hello Hangout's time zone — the
 * server stores no venue time zone. A close earlier than the open runs past
 * midnight (e.g. 16:00–02:00).
 */

import { DAYS, type Day, type DayHours, type Hours } from '../api/directory';

const JS_DAY_TO_KEY: Day[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function isOpenAt(day: DayHours | undefined, minute: number, previousDay?: DayHours): { open: boolean; closesAt?: string } {
  if (day && !day.closed && day.open && day.close) {
    const o = minutes(day.open);
    const c = minutes(day.close);
    if (c > o ? minute >= o && minute < c : minute >= o) return { open: true, closesAt: day.close };
  }
  // Yesterday's hours that run past midnight.
  if (previousDay && !previousDay.closed && previousDay.open && previousDay.close) {
    const o = minutes(previousDay.open);
    const c = minutes(previousDay.close);
    if (c <= o && minute < c) return { open: true, closesAt: previousDay.close };
  }
  return { open: false };
}

/** null when the business has not published hours. */
export function openState(hours: Hours | null | undefined, now = new Date()): { open: boolean; closesAt?: string } | null {
  if (!hours || Object.keys(hours).length === 0) return null;
  const key = JS_DAY_TO_KEY[now.getDay()];
  const prevKey = JS_DAY_TO_KEY[(now.getDay() + 6) % 7];
  return isOpenAt(hours[key], now.getHours() * 60 + now.getMinutes(), hours[prevKey]);
}

/** "4:00 PM" from "16:00", in the device locale. */
export function clock(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function emptyHours(): Hours {
  return Object.fromEntries(DAYS.map((d) => [d, { closed: true, open: null, close: null }])) as Hours;
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
export function isValidClock(value: string | null | undefined): boolean {
  return Boolean(value && HHMM.test(value));
}
