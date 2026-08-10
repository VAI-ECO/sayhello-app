/**
 * THEME TOKENS TESTS
 */

import { Colors, PickableColors, ColorNames } from '../tokens';

describe('Theme Tokens', () => {
  it('has exactly 10 pickable colors', () => {
    expect(PickableColors.length).toBe(10);
  });

  it('includes THE TEN colors', () => {
    const requiredColors = [
      Colors.Orange,
      Colors.Yellow,
      Colors.Emerald,
      Colors.Slate,
      Colors.Cyan,
      Colors.Purple,
      Colors.Magenta,
      Colors.DeepNavy,
      Colors.Brown,
      Colors.Black,
    ];

    requiredColors.forEach((color) => {
      expect(PickableColors).toContain(color);
    });
  });

  it('has correct hex codes', () => {
    expect(Colors.Orange).toBe('#FB8C00');
    expect(Colors.Yellow).toBe('#FDD835');
    expect(Colors.Emerald).toBe('#00893F');
    expect(Colors.Slate).toBe('#546E7A');
    expect(Colors.Cyan).toBe('#00ACC1');
    expect(Colors.Purple).toBe('#8E24AA');
    expect(Colors.Magenta).toBe('#D81B60');
    expect(Colors.DeepNavy).toBe('#0B1F5C');
    expect(Colors.Brown).toBe('#6B3F1D');
    expect(Colors.Black).toBe('#101010');
  });

  it('has color names for all pickable colors', () => {
    PickableColors.forEach((color) => {
      expect(ColorNames[color]).toBeTruthy();
      expect(typeof ColorNames[color]).toBe('string');
    });
  });
});
