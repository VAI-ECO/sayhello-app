/**
 * A Discount's own dates (§17.6, §17.7), typed by the business as YYYY-MM-DD in
 * its local calendar. Start is the start of that local day, end is the end of it.
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function dayToIso(value: string, edge: 'start' | 'end'): string | null {
  if (!DATE.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = edge === 'start' ? new Date(y, m - 1, d, 0, 0, 0, 0) : new Date(y, m - 1, d, 23, 59, 59, 0);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date.toISOString();
}

export function isoToDay(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
