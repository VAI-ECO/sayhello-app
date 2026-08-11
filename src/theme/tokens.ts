/**
 * SAY HELLO DESIGN TOKENS
 *
 * ⚠️ THE TEN - pickable identity colors
 * No greys invented on the fly, no opacity hacks producing new hues.
 * Neutrals derive from Ink and Chalk only.
 */

export const Colors = {
  // THE TEN - Pickable identity colors
  Orange: '#FB8C00',
  Yellow: '#FDD835',
  Emerald: '#00893F',
  Slate: '#546E7A',
  Cyan: '#00ACC1',
  Purple: '#8E24AA',
  Magenta: '#D81B60',
  DeepNavy: '#0B1F5C',
  Brown: '#6B3F1D',
  Black: '#101010',

  // FIXED COLORS - never pickable, never take user's color
  Fern: '#4F8C36', // Hangout, money, completion
  Plum: '#6A4A9C', // Holla
  HelloBlue: '#2E6FD1', // Hootza, brand
  Amber: '#CE8527', // Points, prizes, rewards
  SignalRed: '#C63A2C', // Error only
  Midnight: '#1E2B63', // Gradient stop
  Ink: '#1F1E1C', // Text, neutrals
  Chalk: '#FFFFFF', // Background, text on dark

  // NEUTRALS - derived from Ink and Chalk only
  Bone: '#F7F6F4', // Section fills, inset cards, disabled
  Line: '#E2DFDB', // Borders and dividers
  Hairline: '#F1EFEC', // Row separators inside grouped lists
  Muted: '#7C776F', // Body copy, secondary text
  Faint: '#A7A29B', // Labels, meta, placeholder
  Canvas: '#EFEDEA', // Surface behind phone/desktop frame, map ground
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
 * PICKABLE IDENTITY COLORS - THE TEN
 * Ink and Chalk are NOT pickable - they are text and ground only.
 */
export type IdentityColor =
  | typeof Colors.Orange
  | typeof Colors.Yellow
  | typeof Colors.Emerald
  | typeof Colors.Slate
  | typeof Colors.Cyan
  | typeof Colors.Purple
  | typeof Colors.Magenta
  | typeof Colors.DeepNavy
  | typeof Colors.Brown
  | typeof Colors.Black;

export const PickableColors: readonly IdentityColor[] = [
  Colors.Orange,
  Colors.Yellow,
  Colors.Slate,
  Colors.Cyan,
  Colors.Purple,
  Colors.Magenta,
  Colors.DeepNavy,
  Colors.Brown,
  Colors.Black,
  Colors.Emerald,
] as const;

export const ColorNames: Record<IdentityColor, string> = {
  [Colors.Orange]: 'Orange',
  [Colors.Yellow]: 'Yellow',
  [Colors.Emerald]: 'Emerald',
  [Colors.Slate]: 'Slate',
  [Colors.Cyan]: 'Cyan',
  [Colors.Purple]: 'Purple',
  [Colors.Magenta]: 'Magenta',
  [Colors.DeepNavy]: 'Deep Navy',
  [Colors.Brown]: 'Brown',
  [Colors.Black]: 'Black',
};

/**
 * TYPOGRAPHY TOKENS
 */
export const Typography = {
  // Font families
  fontFamily: {
    ui: 'Assistant',
    brand: 'Dreaming',
  },
  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  // Type scale (px)
  fontSize: {
    display: 32,
    title: 28,
    heading: 21,
    subhead: 19,
    body: 16,
    label: 15,
    caption: 13,
    micro: 12,
  },
  // Letter spacing (em)
  letterSpacing: {
    display: -0.025, // at 32px
    heading: -0.015, // at 21px
    body: 0, // at body size
  },
} as const;

/**
 * SPACING SCALE (px)
 */
export const Spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 14,
  '3xl': 18,
  '4xl': 22,
  '5xl': 26,
  '6xl': 30,
  '7xl': 34,
  '8xl': 40,
} as const;

/**
 * BORDER RADIUS (px)
 */
export const Radius = {
  chip: 12,
  card: 16,
  sheet: 24,
  pill: 28,
  avatar: 9999,
} as const;
