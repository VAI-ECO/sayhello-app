/**
 * IDENTITY COLOR THEMING SYSTEM
 *
 * ⚠️ ARCHITECTURAL PIECE - cannot be retrofitted
 *
 * Every user picks an identity color at signup. This provider makes that color
 * available throughout the app. Waverly, nudges, pins, and markers all render
 * in the user's chosen color.
 *
 * ⚠️ TWO PEOPLE RUNNING THE SAME FLOW SEE DIFFERENT COLORS
 * Never hardcode Hello Blue as "the app color."
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Colors, PickableColors, type IdentityColor } from './tokens';
import { getContrastColors, type ContrastResult } from './contrast';

interface ThemeContextValue {
  /**
   * The user's chosen identity color
   */
  identityColor: IdentityColor;

  /**
   * Contrast-safe colors for the current identity
   */
  contrast: ContrastResult;

  /**
   * Update the user's identity color
   * This re-themes the entire app instantly
   */
  setIdentityColor: (color: IdentityColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Initial identity color
   * Defaults to Purple if not provided (used before login)
   */
  initialColor?: IdentityColor;
}

export function ThemeProvider({ children, initialColor = Colors.Purple }: ThemeProviderProps) {
  const [identityColor, setIdentityColor] = useState<IdentityColor>(initialColor);
  const [contrast, setContrast] = useState<ContrastResult>(() => getContrastColors(initialColor));

  // Recalculate contrast when identity color changes
  useEffect(() => {
    setContrast(getContrastColors(identityColor));
  }, [identityColor]);

  const value: ThemeContextValue = {
    identityColor,
    contrast,
    setIdentityColor,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access the current theme
 *
 * @example
 * function MyComponent() {
 *   const { identityColor, contrast } = useTheme();
 *   return (
 *     <View style={{ backgroundColor: contrast.background }}>
 *       <Text style={{ color: contrast.foreground }}>Hello</Text>
 *     </View>
 *   );
 * }
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Export all theme utilities for convenience
 */
export { Colors, PickableColors, type IdentityColor } from './tokens';
export { getContrastColors, getContrastRatio, isLightColor } from './contrast';
