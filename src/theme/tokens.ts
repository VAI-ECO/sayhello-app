/**
 * SAY HELLO DESIGN TOKENS
 *
 * ⚠️ THE TWELVE - pickable identity colors
 * No greys invented on the fly, no opacity hacks producing new hues.
 * Neutrals derive from Ink and Chalk only.
 */

export const Colors = {
  // THE TWELVE - Pickable identity colors
  Coral: '#F4511E',
  Orange: '#FB8C00',
  Yellow: '#FDD835',
  Emerald: '#00A05A',
  Slate: '#546E7A',
  Cyan: '#00ACC1',
  Blue: '#1E88E5',
  Purple: '#8E24AA',
  Magenta: '#D81B60',
  DeepNavy: '#0B1F5C',
  Brown: '#6B3F1D',
  Black: '#101010',

  // FIXED COLORS - never pickable, never take user's color
  Fern: '#4F8C36', // Hangout, money, completion
  Plum: '#6A4A9C', // Holla
  HelloBlue: '#2E6FD1', // Hootza, brand
  SignalRed: '#C63A2C', // Error only
  Ink: '#1F1E1C', // Text, neutrals
  Chalk: '#FFFFFF', // Background, text on dark
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
 * PICKABLE IDENTITY COLORS - THE TWELVE
 * Ink and Chalk are NOT pickable - they are text and ground only.
 */
export type IdentityColor =
  | typeof Colors.Coral
  | typeof Colors.Orange
  | typeof Colors.Yellow
  | typeof Colors.Emerald
  | typeof Colors.Slate
  | typeof Colors.Cyan
  | typeof Colors.Blue
  | typeof Colors.Purple
  | typeof Colors.Magenta
  | typeof Colors.DeepNavy
  | typeof Colors.Brown
  | typeof Colors.Black;

export const PickableColors: readonly IdentityColor[] = [
  Colors.Coral,
  Colors.Orange,
  Colors.Yellow,
  Colors.Emerald,
  Colors.Slate,
  Colors.Cyan,
  Colors.Blue,
  Colors.Purple,
  Colors.Magenta,
  Colors.DeepNavy,
  Colors.Brown,
  Colors.Black,
] as const;

export const ColorNames: Record<IdentityColor, string> = {
  [Colors.Coral]: 'Coral',
  [Colors.Orange]: 'Orange',
  [Colors.Yellow]: 'Yellow',
  [Colors.Emerald]: 'Emerald',
  [Colors.Slate]: 'Slate',
  [Colors.Cyan]: 'Cyan',
  [Colors.Blue]: 'Blue',
  [Colors.Purple]: 'Purple',
  [Colors.Magenta]: 'Magenta',
  [Colors.DeepNavy]: 'Deep Navy',
  [Colors.Brown]: 'Brown',
  [Colors.Black]: 'Black',
};
