/**
 * SAY HELLO DESIGN TOKENS
 *
 * ⚠️ THE TEN, EXACT - NO OTHER COLORS EXIST
 * No greys invented on the fly, no opacity hacks producing new hues.
 * Neutrals derive from Ink and Chalk only.
 *
 * DEAD COLORS (bugs if they appear):
 * #5BD12B · #F5B301 · #FF7BAC
 */

export const Colors = {
  HelloBlue: '#2E6FD1',
  Midnight: '#1E2B63',
  SignalRed: '#C63A2C',
  Amber: '#CE8527',
  Blush: '#E3A2B4',
  Fuchsia: '#C03B80',
  Fern: '#4F8C36',
  Plum: '#6A4A9C',
  Ink: '#1F1E1C',
  Chalk: '#FFFFFF',
} as const;

/**
 * FIXED MEANINGS - never overridden by user's identity color:
 * - Fern: Hello Hangout, money, completion
 * - Plum: Holla
 * - HelloBlue: Hootza, the brand itself
 * - SignalRed: error, and nothing else on that screen
 */
export const FixedColors = {
  hangout: Colors.Fern,
  holla: Colors.Plum,
  hootza: Colors.HelloBlue,
  error: Colors.SignalRed,
  brand: Colors.HelloBlue,
} as const;

/**
 * PICKABLE IDENTITY COLORS
 * Eight colors users can choose as their identity.
 * Ink and Chalk are NOT pickable - they are text and ground only.
 */
export type IdentityColor =
  | typeof Colors.HelloBlue
  | typeof Colors.Midnight
  | typeof Colors.SignalRed
  | typeof Colors.Amber
  | typeof Colors.Blush
  | typeof Colors.Fuchsia
  | typeof Colors.Fern
  | typeof Colors.Plum;

export const PickableColors: readonly IdentityColor[] = [
  Colors.HelloBlue,
  Colors.Midnight,
  Colors.SignalRed,
  Colors.Amber,
  Colors.Blush,
  Colors.Fuchsia,
  Colors.Fern,
  Colors.Plum,
] as const;

export const ColorNames: Record<IdentityColor, string> = {
  [Colors.HelloBlue]: 'Hello Blue',
  [Colors.Midnight]: 'Midnight',
  [Colors.SignalRed]: 'Signal Red',
  [Colors.Amber]: 'Amber',
  [Colors.Blush]: 'Blush',
  [Colors.Fuchsia]: 'Fuchsia',
  [Colors.Fern]: 'Fern',
  [Colors.Plum]: 'Plum',
};
