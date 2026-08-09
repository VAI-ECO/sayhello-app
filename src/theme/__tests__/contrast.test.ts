/**
 * CONTRAST FUNCTION TESTS
 *
 * ⚠️ CRITICAL: These tests prove all 8 pickable identity colors
 * meet WCAG AA contrast requirements (4.5:1).
 *
 * Blush is the lightest color and the one that breaks with white text.
 * If Blush passes, everything passes.
 */

import { describe, it, expect } from '@jest/globals';
import { Colors, PickableColors } from '../tokens';
import { getContrastColors, getContrastRatio } from '../contrast';

describe('Contrast Function', () => {
  describe('WCAG AA Compliance (4.5:1 minimum)', () => {
    /**
     * ⚠️ THE CRITICAL TEST
     * All eight pickable colors must pass WCAG AA with the returned foreground/background.
     * This is not asserting on literals - it calls the real contrast calculation.
     */
    it.each(PickableColors)('should meet WCAG AA for %s', (color) => {
      const result = getContrastColors(color);

      expect(result.meetsWCAG_AA).toBe(true);
      expect(result.contrastRatio).toBeGreaterThanOrEqual(4.5);

      // Log actual values for verification
      console.log(`${color}:`, {
        foreground: result.foreground,
        background: result.background,
        ratio: result.contrastRatio.toFixed(2),
      });
    });

    /**
     * Blush - THE PROBLEM COLOR
     * Light pink that fails with white text
     */
    it('should handle Blush with darkened variant', () => {
      const result = getContrastColors(Colors.Blush);

      // Blush should use a darkened background
      expect(result.background).not.toBe(Colors.Blush);

      // Should use Chalk (white) foreground on the darkened background
      expect(result.foreground).toBe(Colors.Chalk);

      // Must meet WCAG AA
      expect(result.contrastRatio).toBeGreaterThanOrEqual(4.5);
      expect(result.meetsWCAG_AA).toBe(true);
    });

    /**
     * Amber - BORDERLINE COLOR
     * Needs testing to ensure it passes
     */
    it('should handle Amber correctly', () => {
      const result = getContrastColors(Colors.Amber);

      // Amber may need darkening
      expect(result.contrastRatio).toBeGreaterThanOrEqual(4.5);
      expect(result.meetsWCAG_AA).toBe(true);
    });
  });

  describe('Contrast Ratio Calculation', () => {
    /**
     * Test known contrast ratios to verify calculation is correct
     * Ink (#1F1E1C) on Chalk (#FFFFFF) should be ~16.66:1
     * (Ink is not pure black, so it's less than the theoretical max of 21:1)
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
      const ratio = getContrastRatio(Colors.HelloBlue, Colors.HelloBlue);
      expect(ratio).toBeCloseTo(1, 1);
    });
  });

  describe('Foreground Selection', () => {
    /**
     * Dark colors should use Chalk (white) foreground
     */
    it('should use Chalk foreground for dark colors', () => {
      const darkColors = [Colors.Midnight, Colors.Plum, Colors.Fern];

      darkColors.forEach((color) => {
        const result = getContrastColors(color);
        expect(result.foreground).toBe(Colors.Chalk);
      });
    });

    /**
     * Light colors should use Ink (black) foreground OR Chalk on darkened background
     */
    it('should handle light colors appropriately', () => {
      const result = getContrastColors(Colors.Blush);

      // Blush should either use Ink, or Chalk on a darkened background
      if (result.background === Colors.Blush) {
        expect(result.foreground).toBe(Colors.Ink);
      } else {
        // If background is darkened, Chalk should work
        expect(result.foreground).toBe(Colors.Chalk);
      }

      // Either way, must meet WCAG AA
      expect(result.meetsWCAG_AA).toBe(true);
    });
  });

  describe('Signal Red Collision', () => {
    /**
     * ⚠️ KNOWN ISSUE: Signal Red is both an identity color and the error color
     * This test documents the collision but does not solve it
     */
    it('should note Signal Red can be both identity and error', () => {
      const result = getContrastColors(Colors.SignalRed);

      // Signal Red should still be usable as an identity color
      expect(result.meetsWCAG_AA).toBe(true);

      // Document the collision in test output
      console.warn('⚠️ Signal Red collision: This color is used for both identity and errors');
    });
  });

  describe('Background Variants', () => {
    /**
     * Test that darkened variants are actually darker than originals
     */
    it('should produce darker variants for light colors', () => {
      const result = getContrastColors(Colors.Blush);

      if (result.background !== Colors.Blush) {
        // Background was darkened
        // We can't directly compare hex darkness, but we can verify
        // that the contrast ratio with Chalk improved
        const originalContrast = getContrastRatio(Colors.Chalk, Colors.Blush);
        const darkenedContrast = getContrastRatio(Colors.Chalk, result.background);

        expect(darkenedContrast).toBeGreaterThan(originalContrast);
      }
    });
  });
});

describe('Integration: Theme System', () => {
  /**
   * Verify that the theme system provides complete, usable values
   * for all pickable colors
   */
  it('should provide complete ContrastResult for all colors', () => {
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
});
