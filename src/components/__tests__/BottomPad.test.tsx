import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { bottomPad, useBottomPad } from '../StatusBarSpacer';

// Pinned actions clear the home indicator and the Android navigation bar (the app draws edge-to-edge:
// android/gradle.properties edgeToEdgeEnabled=true).
const withInsets = (bottom: number) =>
  function InsetsProvider({ children }: { children: React.ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom } }}>
        {children}
      </SafeAreaProvider>
    );
  };

describe('bottomPad', () => {
  it('keeps the design padding as a floor and grows to a larger inset', () => {
    expect(bottomPad(0, 30)).toBe(30);
    expect(bottomPad(34, 38)).toBe(38);
    expect(bottomPad(34, 30)).toBe(34);
    expect(bottomPad(48, 26)).toBe(48);
  });
});

describe('useBottomPad', () => {
  it('grows to the real bottom inset', async () => {
    const { result } = await renderHook(() => useBottomPad(30), { wrapper: withInsets(34) });
    expect(result.current).toBe(34);
  });
  it('keeps the design padding when the inset is smaller', async () => {
    const { result } = await renderHook(() => useBottomPad(38), { wrapper: withInsets(34) });
    expect(result.current).toBe(38);
  });
  it('returns the design padding with no SafeAreaProvider', async () => {
    const { result } = await renderHook(() => useBottomPad(26));
    expect(result.current).toBe(26);
  });
});
