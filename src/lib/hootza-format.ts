/**
 * Hootza date/time formatting — no distance copy (§8.12).
 */

export function formatHootzaTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = start.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day} · ${formatClock(start)}–${formatClock(end)}`;
}

export function formatClock(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const h = hours % 12 || 12;
  if (minutes === 0) return `${h}${ampm}`;
  return `${h}:${minutes.toString().padStart(2, '0')}${ampm}`;
}

export function formatVenueTypeLabel(venueType: 'public_place' | 'private_residence'): string {
  return venueType === 'public_place' ? 'publicPlace' : 'privateResidence';
}

export function formatCentsAsDollars(cents: number): string {
  if (cents % 100 === 0) return `$${cents / 100}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
