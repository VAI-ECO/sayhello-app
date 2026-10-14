/**
 * AMBASSADOR "MY CODE" — top safe area. The screen is a bare dark View + ScrollView with no wrapper and no drawn
 * status-bar area, so its back button used to start under the clock on a notched phone. It now clears the real top
 * inset and is unchanged (0pt) where there is none.
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MyCodeScreen from '../../../app/ambassador/my-code';
import * as ambassadorApi from '../../../src/api/ambassador';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
  useFocusEffect: (cb: () => void) => {
    const R = require('react');
    R.useEffect(() => { cb(); }, []);
  },
}));

const metrics = (top: number) => ({
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top, left: 0, right: 0, bottom: 0 },
});

beforeEach(() => {
  jest.spyOn(ambassadorApi, 'getAmbassadorMe').mockResolvedValue({ data: { me: { ambassadorCode: 'ABC123' } } } as never);
});
afterEach(() => jest.restoreAllMocks());

describe('MyCodeScreen top inset', () => {
  it('clears a Dynamic Island sized top inset', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics(59)}>
        <MyCodeScreen />
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('my-code-status-spacer')).toHaveStyle({ height: 59 });
    expect(await screen.findByTestId('my-code-value')).toBeOnTheScreen();
  });

  it('adds nothing where there is no inset or provider (layout unchanged)', async () => {
    await render(<MyCodeScreen />);
    expect(screen.getByTestId('my-code-status-spacer')).toHaveStyle({ height: 0 });
    expect(await screen.findByTestId('my-code-value')).toBeOnTheScreen();
  });
});
