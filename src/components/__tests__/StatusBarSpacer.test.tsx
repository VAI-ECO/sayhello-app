import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBarSpacer, topSpacerHeight } from '../StatusBarSpacer';

const metrics = (top: number) => ({
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top, left: 0, right: 0, bottom: 0 },
});

describe('topSpacerHeight', () => {
  it('keeps the drawn design height as a floor', () => {
    expect(topSpacerHeight(0, 44)).toBe(44);
    expect(topSpacerHeight(24, 44)).toBe(44);
  });
  it('grows to a taller real inset (notch / Dynamic Island)', () => {
    expect(topSpacerHeight(59, 44)).toBe(59);
    expect(topSpacerHeight(47, 46)).toBe(47);
  });
});

describe('StatusBarSpacer', () => {
  it('renders the design height when the inset is smaller', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics(20)}>
        <StatusBarSpacer height={46} testID="spacer" />
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('spacer')).toHaveStyle({ height: 46 });
  });

  it('falls back to the design height when no SafeAreaProvider is present', async () => {
    await render(<StatusBarSpacer height={46} testID="spacer" />);
    expect(screen.getByTestId('spacer')).toHaveStyle({ height: 46 });
  });

  it('renders the real inset when it is taller than the design height', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics(59)}>
        <StatusBarSpacer testID="spacer" />
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('spacer')).toHaveStyle({ height: 59 });
  });
});
