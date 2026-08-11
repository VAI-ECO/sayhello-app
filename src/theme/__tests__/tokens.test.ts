/**
 * THEME TOKENS TESTS
 *
 * Asserts every design token matches the exact values from the design handoff.
 */

import { Colors, PickableColors, ColorNames, Typography, Spacing, Radius } from '../tokens';

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

  describe('Fixed Role Colors', () => {
    it('matches Hello Blue exactly', () => {
      expect(Colors.HelloBlue).toBe('#2E6FD1');
    });

    it('matches Fern exactly', () => {
      expect(Colors.Fern).toBe('#4F8C36');
    });

    it('matches Plum exactly', () => {
      expect(Colors.Plum).toBe('#6A4A9C');
    });

    it('matches Amber exactly', () => {
      expect(Colors.Amber).toBe('#CE8527');
    });

    it('matches Signal Red exactly', () => {
      expect(Colors.SignalRed).toBe('#C63A2C');
    });

    it('matches Midnight exactly', () => {
      expect(Colors.Midnight).toBe('#1E2B63');
    });

    it('matches Ink exactly', () => {
      expect(Colors.Ink).toBe('#1F1E1C');
    });

    it('matches Chalk exactly', () => {
      expect(Colors.Chalk).toBe('#FFFFFF');
    });
  });

  describe('Neutrals', () => {
    it('matches Bone exactly', () => {
      expect(Colors.Bone).toBe('#F7F6F4');
    });

    it('matches Line exactly', () => {
      expect(Colors.Line).toBe('#E2DFDB');
    });

    it('matches Hairline exactly', () => {
      expect(Colors.Hairline).toBe('#F1EFEC');
    });

    it('matches Muted exactly', () => {
      expect(Colors.Muted).toBe('#7C776F');
    });

    it('matches Faint exactly', () => {
      expect(Colors.Faint).toBe('#A7A29B');
    });

    it('matches Canvas exactly', () => {
      expect(Colors.Canvas).toBe('#EFEDEA');
    });
  });

  describe('Typography', () => {
    it('has Assistant as UI font', () => {
      expect(Typography.fontFamily.ui).toBe('Assistant');
    });

    it('has Dreaming as brand font', () => {
      expect(Typography.fontFamily.brand).toBe('Dreaming');
    });

    it('has correct font weights', () => {
      expect(Typography.fontWeight.light).toBe(300);
      expect(Typography.fontWeight.regular).toBe(400);
      expect(Typography.fontWeight.semibold).toBe(600);
      expect(Typography.fontWeight.bold).toBe(700);
      expect(Typography.fontWeight.extrabold).toBe(800);
    });

    it('has correct type scale', () => {
      expect(Typography.fontSize.display).toBe(32);
      expect(Typography.fontSize.title).toBe(28);
      expect(Typography.fontSize.heading).toBe(21);
      expect(Typography.fontSize.subhead).toBe(19);
      expect(Typography.fontSize.body).toBe(16);
      expect(Typography.fontSize.label).toBe(15);
      expect(Typography.fontSize.caption).toBe(13);
      expect(Typography.fontSize.micro).toBe(12);
    });

    it('has correct letter spacing', () => {
      expect(Typography.letterSpacing.display).toBe(-0.025);
      expect(Typography.letterSpacing.heading).toBe(-0.015);
      expect(Typography.letterSpacing.body).toBe(0);
    });
  });

  describe('Spacing', () => {
    it('matches spacing scale exactly', () => {
      expect(Spacing.xs).toBe(4);
      expect(Spacing.sm).toBe(6);
      expect(Spacing.md).toBe(8);
      expect(Spacing.lg).toBe(10);
      expect(Spacing.xl).toBe(12);
      expect(Spacing['2xl']).toBe(14);
      expect(Spacing['3xl']).toBe(18);
      expect(Spacing['4xl']).toBe(22);
      expect(Spacing['5xl']).toBe(26);
      expect(Spacing['6xl']).toBe(30);
      expect(Spacing['7xl']).toBe(34);
      expect(Spacing['8xl']).toBe(40);
    });
  });

  describe('Radius', () => {
    it('matches radius values exactly', () => {
      expect(Radius.chip).toBe(12);
      expect(Radius.card).toBe(16);
      expect(Radius.sheet).toBe(24);
      expect(Radius.pill).toBe(28);
      expect(Radius.avatar).toBe(9999);
    });
  });
});
