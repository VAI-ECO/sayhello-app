/**
 * What's Happening at phone width: the featured Tonight card plus the compact rows (the jest window is a tablet,
 * so the other feed tests exercise the card grid; this one keeps the phone layout covered).
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../../src/theme';
import * as feedApi from '../../../src/api/feed';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() })),
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = jest.requireActual('react') as typeof import('react');
    useEffect(cb, [cb]);
  },
}));
jest.mock('../../../src/api/feed');
jest.mock('../../../src/api/hellos');
jest.mock('../../../src/api/points');
jest.mock('../../../src/api/map');

import WhatsHappeningScreen from '../../../app/(tabs)/home';
import * as hellosApi from '../../../src/api/hellos';
import * as pointsApi from '../../../src/api/points';
import * as mapApi from '../../../src/api/map';

it('draws the featured Tonight card and compact rows, not the card grid, on a phone', async () => {
  (hellosApi.getHellos as jest.Mock).mockResolvedValue({ data: { hellos: [] } });
  (hellosApi.getNudgeCap as jest.Mock).mockResolvedValue({ data: { atCap: false } });
  (pointsApi.getPointsBalance as jest.Mock).mockResolvedValue({ data: { balance: 1, drawingEntries: 1 } });
  (mapApi.getOpenToHellos as jest.Mock).mockResolvedValue({ data: { open: false, updatedAt: null, discoveryActive: false } });
  const base = { type: 'hootza', venueType: 'public_place', locationName: 'Bell St', startTime: new Date().toISOString(), host: { id: 'h', fullName: 'Host' }, rsvpCount: 2, checkinCount: 0, createdAt: new Date().toISOString() };
  (feedApi.getFeed as jest.Mock).mockResolvedValue({
    data: { view: 'today', count: 2, items: [{ ...base, id: 'a', title: 'Trivia', isTonight: true }, { ...base, id: 'b', title: 'Brunch', isTonight: false }] },
  });
  await render(<ThemeProvider><WhatsHappeningScreen /></ThemeProvider>);
  await waitFor(() => expect(screen.getByText('Trivia')).toBeTruthy());
  expect(screen.getByText('Tonight')).toBeTruthy();
  expect(screen.getByText('Brunch')).toBeTruthy();
  expect(screen.queryByTestId('feed-grid')).toBeNull();
});
