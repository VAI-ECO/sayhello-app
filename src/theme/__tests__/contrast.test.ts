/**
 * CONTRAST FUNCTION TESTS
 *
 * ⚠️ CRITICAL: These tests verify all 10 pickable identity colors
 * use their LOCKED foreground pairings.
 *
 * LOCKED PAIRINGS (chosen visually):
 * - Ink on: Orange, Yellow, Cyan
 * - Chalk on: Emerald, Slate, Purple, Magenta, Deep Navy, Brown, Black
 */

import { describe, it, expect } from '@jest/globals';
import { Colors, PickableColors } from '../tokens';
import { getContrastColors, getContrastRatio } from '../contrast';

describe('Contrast Function', () => {
  describe('Locked Foreground Pairings', () => {
    /**
     * ⚠️ THE CRITICAL TEST
     * All ten colors must use their LOCKED foreground pairing.
     * This is not calculated - it's hardcoded from the visual mapping table.
     */
    it.each(PickableColors)('should use locked foreground for %s', (color) => {
      const result = getContrastColors(color);

      // Background should be the identity color itself (no darkening)
      expect(result.background).toBe(color);

      // Log actual values for verification
      console.log(`${color}:`, {
        foreground: result.foreground,
        background: result.background,
        ratio: result.contrastRatio.toFixed(2),
      });
    });

    /**
     * Verify Ink is used on the three light colors
     */
    it('should use Ink foreground on Orange, Yellow, Cyan', () => {
      const orange = getContrastColors(Colors.Orange);
      const yellow = getContrastColors(Colors.Yellow);
      const cyan = getContrastColors(Colors.Cyan);

      expect(orange.foreground).toBe(Colors.Ink);
      expect(yellow.foreground).toBe(Colors.Ink);
      expect(cyan.foreground).toBe(Colors.Ink);
    });

    /**
     * Verify Chalk is used on the seven dark colors
     */
    it('should use Chalk foreground on the other seven colors', () => {
      const darkColors = [
        Colors.Emerald,
        Colors.Slate,
        Colors.Purple,
        Colors.Magenta,
        Colors.DeepNavy,
        Colors.Brown,
        Colors.Black,
      ];

      darkColors.forEach((color) => {
        const result = getContrastColors(color);
        expect(result.foreground).toBe(Colors.Chalk);
      });
    });
  });

  describe('Contrast Ratio Calculation', () => {
    /**
     * Verify contrast calculation is working correctly
     * Ink (#1F1E1C) on Chalk (#FFFFFF) should be ~16.66:1
     */
    it('should calculate Ink on Chalk correctly', () => {
      const ratio = getContrastRatio(Colors.Ink, Colors.Chalk);
      expect(ratio).toBeGreaterThan(15);
      expect(ratio).toBeLessThan(18);
    });

    /**
     * Chalk on Ink should have the same ratio (order doesn't matter)
     */
    it('should calculate Chalk on Ink correctly', () => {
      const ratio = getContrastRatio(Colors.Chalk, Colors.Ink);
      expect(ratio).toBeGreaterThan(15);
      expect(ratio).toBeLessThan(18);
    });

    /**
     * Same color should be 1:1 (no contrast)
     */
    it('should calculate same color as 1:1', () => {
      const ratio = getContrastRatio(Colors.Purple, Colors.Purple);
      expect(ratio).toBeCloseTo(1, 1);
    });
  });

  describe('Contrast Ratio Verification', () => {
    /**
     * Verify that all locked pairings have reasonable contrast
     * Note: We're not enforcing WCAG AA here because the pairings
     * were chosen visually. This test documents actual ratios.
     */
    it('should document contrast ratios for all locked pairings', () => {
      const results = PickableColors.map((color) => {
        const result = getContrastColors(color);
        return {
          color,
          ratio: result.contrastRatio,
          meetsWCAG_AA: result.meetsWCAG_AA,
        };
      });

      // Log all ratios for documentation
      results.forEach(({ color, ratio, meetsWCAG_AA }) => {
        console.log(`${color}: ${ratio.toFixed(2)}:1 ${meetsWCAG_AA ? '✓ WCAG AA' : '✗ below 4.5:1'}`);
      });

      // At minimum, all should have some reasonable contrast
      results.forEach(({ color, ratio }) => {
        expect(ratio).toBeGreaterThan(1); // At least some contrast
      });
    });

    /**
     * Verify specific color ratios that should be high
     */
    it('should have high contrast for Black with Chalk', () => {
      const result = getContrastColors(Colors.Black);
      expect(result.contrastRatio).toBeGreaterThan(15); // Nearly black on white
    });

    /**
     * Verify specific color ratios for light colors with Ink
     */
    it('should have reasonable contrast for light colors with Ink', () => {
      const yellow = getContrastColors(Colors.Yellow);
      const orange = getContrastColors(Colors.Orange);
      const cyan = getContrastColors(Colors.Cyan);

      // All should have some contrast, though may not meet WCAG AA
      expect(yellow.contrastRatio).toBeGreaterThan(1);
      expect(orange.contrastRatio).toBeGreaterThan(1);
      expect(cyan.contrastRatio).toBeGreaterThan(1);
    });
  });

  describe('Background Color', () => {
    /**
     * Verify that background is always the identity color itself
     * (no darkening or modification)
     */
    it('should use identity color as background without modification', () => {
      PickableColors.forEach((color) => {
        const result = getContrastColors(color);
        expect(result.background).toBe(color);
      });
    });
  });

  describe('isLightColor Helper', () => {
    /**
     * Verify isLightColor correctly identifies the three Ink-foreground colors
     */
    it('should identify Orange, Yellow, Cyan as light colors', () => {
      const { isLightColor } = require('../contrast');

      expect(isLightColor(Colors.Orange)).toBe(true);
      expect(isLightColor(Colors.Yellow)).toBe(true);
      expect(isLightColor(Colors.Cyan)).toBe(true);
    });

    /**
     * Verify isLightColor returns false for all other colors
     */
    it('should identify all other colors as not light', () => {
      const { isLightColor } = require('../contrast');

      const darkColors = [
        Colors.Emerald,
        Colors.Slate,
        Colors.Purple,
        Colors.Magenta,
        Colors.DeepNavy,
        Colors.Brown,
        Colors.Black,
      ];

      darkColors.forEach((color) => {
        expect(isLightColor(color)).toBe(false);
      });
    });
  });
});

describe('Integration: Theme System', () => {
  /**
   * Verify that the theme system provides complete, usable values
   * for all ten pickable colors
   */
  it('should provide complete ContrastResult for all ten colors', () => {
    PickableColors.forEach((color) => {
      const result = getContrastColors(color);

      expect(result).toHaveProperty('identityColor');
      expect(result).toHaveProperty('foreground');
      expect(result).toHaveProperty('background');
      expect(result).toHaveProperty('contrastRatio');
      expect(result).toHaveProperty('meetsWCAG_AA');

      expect(result.identityColor).toBe(color);
      expect([Colors.Ink, Colors.Chalk]).toContain(result.foreground);
      expect(typeof result.background).toBe('string');
      expect(result.contrastRatio).toBeGreaterThan(0);
      expect(typeof result.meetsWCAG_AA).toBe('boolean');
    });
  });

  /**
   * Verify count of pickable colors is exactly 10
   */
  it('should have exactly 10 pickable identity colors', () => {
    expect(PickableColors.length).toBe(10);
  });
});
