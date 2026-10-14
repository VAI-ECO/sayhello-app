/**
 * HOST MODE DISPLAY CALCULATIONS
 *
 * Timer logic using server time offset and window close time.
 * Progress is clamped 0..1.
 */

export interface HostModeTimer {
  /** Minutes remaining, rounded up (e.g., 9.1 min -> 10 min) */
  minutesLeft: number;
  /** Progress fraction 0..1, clamped */
  progress: number;
  /** Whether the window has expired based on local time */
  expired: boolean;
}

/**
 * Calculate server time offset from client time
 * @param serverTime ISO timestamp from server
 * @returns milliseconds to add to Date.now() to get server time
 */
export function calculateServerOffset(serverTime: string): number {
  return new Date(serverTime).getTime() - Date.now();
}

/**
 * Get current server time using offset
 * @param serverOffset milliseconds offset from calculateServerOffset
 * @returns current server time in milliseconds
 */
export function getCurrentServerTime(serverOffset: number): number {
  return Date.now() + serverOffset;
}

/**
 * Calculate Host Mode timer state
 * @param windowClosesAt ISO timestamp when window closes, or null
 * @param windowLengthMinutes configured window duration
 * @param serverOffset milliseconds offset from calculateServerOffset
 * @returns timer state, or null if window not open
 */
export function calculateHostModeTimer(
  windowClosesAt: string | null,
  windowLengthMinutes: number,
  serverOffset: number
): HostModeTimer | null {
  if (!windowClosesAt) return null;

  const closesAtMs = new Date(windowClosesAt).getTime();
  const nowMs = getCurrentServerTime(serverOffset);
  const msRemaining = closesAtMs - nowMs;

  // Window expired
  if (msRemaining <= 0) {
    return {
      minutesLeft: 0,
      progress: 1,
      expired: true,
    };
  }

  const windowLengthMs = windowLengthMinutes * 60 * 1000;
  const msElapsed = windowLengthMs - msRemaining;

  // Clamp progress to 0..1
  const progress = Math.max(0, Math.min(1, msElapsed / windowLengthMs));

  // Round minutes up: 9.1 min -> 10 min
  const minutesLeft = Math.ceil(msRemaining / 60000);

  return {
    minutesLeft,
    progress,
    expired: false,
  };
}

/**
 * Check if a window close time is in the past
 * A backend response reporting open with an already-expired timestamp
 * cannot reset the countdown.
 * @param windowClosesAt ISO timestamp or null
 * @param serverOffset milliseconds offset
 * @returns true if timestamp is in the past
 */
export function isWindowExpired(
  windowClosesAt: string | null,
  serverOffset: number
): boolean {
  if (!windowClosesAt) return true;
  const closesAtMs = new Date(windowClosesAt).getTime();
  const nowMs = getCurrentServerTime(serverOffset);
  return closesAtMs <= nowMs;
}
