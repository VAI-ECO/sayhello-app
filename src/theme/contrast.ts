/**
 * CONTRAST UTILITIES
 *
 * ⚠️ FOREGROUND MAPPING IS HARDCODED, NOT CALCULATED
 *
 * LOCKED PAIRINGS (chosen visually):
 * - Ink #1F1E1C on: Orange, Yellow, Cyan
 * - Chalk #FFFFFF on: Emerald, Slate, Purple, Magenta, Deep Navy, Brown, Black
 *
 * The contrast calculation exists only as a verification check.
 * If it disagrees with this table, the table wins.
 */

import { Colors, type IdentityColor } from './tokens';

/**
 * LOCKED FOREGROUND MAPPING
 * These pairings were chosen visually and are not negotiable.
 */
const FOREGROUND_MAP: Record<IdentityColor, typeof Colors.Ink | typeof Colors.Chalk> = {
  [Colors.Orange]: Colors.Ink,
  [Colors.Yellow]: Colors.Ink,
  [Colors.Cyan]: Colors.Ink,
  [Colors.Emerald]: Colors.Chalk,
  [Colors.Slate]: Colors.Chalk,
  [Colors.Purple]: Colors.Chalk,
  [Colors.Magenta]: Colors.Chalk,
  [Colors.DeepNavy]: Colors.Chalk,
  [Colors.Brown]: Colors.Chalk,
  [Colors.Black]: Colors.Chalk,
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate relative luminance (WCAG formula)
 */
function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastResult {
  /**
   * The identity color as provided
   */
  identityColor: IdentityColor;

  /**
   * Foreground color for text (Ink or Chalk)
   * ⚠️ LOCKED - comes from FOREGROUND_MAP, not calculation
   */
  foreground: typeof Colors.Ink | typeof Colors.Chalk;

  /**
   * Background color (always the identity color itself)
   */
  background: string;

  /**
   * Contrast ratio between foreground and background
   */
  contrastRatio: number;

  /**
   * Whether this combination meets WCAG AA (4.5:1)
   */
  meetsWCAG_AA: boolean;
}

/**
 * Given an identity color, return the LOCKED foreground pairing
 * and verify contrast ratio.
 *
 * ⚠️ Foreground is hardcoded from FOREGROUND_MAP.
 * ⚠️ Background is always the identity color itself (no darkening).
 * ⚠️ Contrast calculation is for verification only.
 */
export function getContrastColors(identityColor: IdentityColor): ContrastResult {
  // Use the identity color directly as background
  const background = identityColor;

  // Get the LOCKED foreground from the map
  const foreground = FOREGROUND_MAP[identityColor];

  // Calculate contrast ratio for verification
  const contrastRatio = getContrastRatio(foreground, background);

  return {
    identityColor,
    foreground,
    background,
    contrastRatio,
    meetsWCAG_AA: contrastRatio >= 4.5,
  };
}

/**
 * Check if a color is considered "light" (uses Ink foreground)
 * Based on the LOCKED mapping table
 */
export function isLightColor(color: IdentityColor): boolean {
  return FOREGROUND_MAP[color] === Colors.Ink;
}

/**
 * Darken a color by multiplying each RGB channel by 0.72
 * Used for nudge screen ground color
 *
 * @param color - Hex color to darken
 * @returns Darkened hex color
 */
export function darkenColor(color: string): string {
  const rgb = hexToRgb(color);
  const darkened = {
    r: Math.round(rgb.r * 0.72),
    g: Math.round(rgb.g * 0.72),
    b: Math.round(rgb.b * 0.72),
  };
  return `#${darkened.r.toString(16).padStart(2, '0')}${darkened.g.toString(16).padStart(2, '0')}${darkened.b.toString(16).padStart(2, '0')}`;
}
