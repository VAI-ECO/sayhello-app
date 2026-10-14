/**
 * BOTTOM SAFE AREA + KEYBOARD for the safety actions (Block, Report). Neither screen is inside a SafeAreaView, and the
 * Android build draws edge-to-edge (android/gradle.properties edgeToEdgeEnabled=true), so a pinned primary action with a
 * fixed 26pt bottom padding could sit under a 48dp navigation bar. The padding is now the design value as a floor, grown
 * to the real inset. Report also has a multiline field low in a ScrollView above its pinned Send button, so its form sits
 * in the shared keyboard-avoiding view.
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BlockScreen from '../../app/block';
import ReportScreen from '../../app/report';
import { ThemeProvider } from '../../src/theme';

// Keep KeyboardAvoidingView's props observable (see src/components/__tests__/KeyboardAware.test.tsx).
jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => {
  const { View: MockView } = require('react-native');
  return { __esModule: true, default: (props: Record<string, unknown>) => <MockView {...props} testID="kav" /> };
});

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));
jest.mock('../../src/api/client', () => ({ api: { post: jest.fn() } }));

const metrics = (bottom: number) => ({
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom },
});
const inside = (bottom: number, ui: React.ReactElement) => (
  <SafeAreaProvider initialMetrics={metrics(bottom)}>
    <ThemeProvider>{ui}</ThemeProvider>
  </SafeAreaProvider>
);

beforeEach(() => {
  mockParams = { userId: 'user-123', name: 'Marco', gender: 'male', type: 'hello', id: 'hello-123' };
});

describe('Block footer', () => {
  it('clears a 48dp Android navigation bar', async () => {
    await render(inside(48, <BlockScreen />));
    expect(screen.getByTestId('block-footer')).toHaveStyle({ paddingBottom: 48 });
  });
  it('keeps the designed 26pt where there is no inset', async () => {
    await render(inside(0, <BlockScreen />));
    expect(screen.getByTestId('block-footer')).toHaveStyle({ paddingBottom: 26 });
  });
  it('is a layout-only change: the confirm action is still there', async () => {
    await render(inside(34, <BlockScreen />));
    expect(screen.getByTestId('block-confirm')).toBeOnTheScreen();
  });
});

describe('Report footer and form', () => {
  it('clears a 48dp Android navigation bar', async () => {
    await render(inside(48, <ReportScreen />));
    expect(screen.getByTestId('report-footer')).toHaveStyle({ paddingBottom: 48 });
  });
  it('keeps the designed 26pt where there is no inset', async () => {
    await render(inside(0, <ReportScreen />));
    expect(screen.getByTestId('report-footer')).toHaveStyle({ paddingBottom: 26 });
  });
  it('keeps the form and the Send button inside an enabled keyboard-avoiding view', async () => {
    await render(inside(0, <ReportScreen />));
    expect(screen.getByTestId('kav')).toHaveProp('enabled', true);
    expect(screen.getByTestId('report-submit')).toBeOnTheScreen();
  });
});
