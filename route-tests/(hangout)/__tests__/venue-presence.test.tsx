import React from 'react';
import { AppState, Linking } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { useCameraPermissions } from 'expo-camera';
import { ThemeProvider } from '../../../src/theme';
import { getMyVenuePresence, leaveVenuePresence, scanVenueCode } from '../../../src/api/venue-presence';
import VenuePresenceScreen from '../../../app/(hangout)/directory/here';

// RULES §9 / W-052: the member scan screen. The API is faked at its boundary; the camera is a plain view. Nothing here reads a position.
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('expo-router/react-navigation', () => ({ useIsFocused: jest.fn() }));
jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
  CameraView: (props: unknown) => require('react').createElement(require('react-native').View, props),
}));
jest.mock('../../../src/api/venue-presence');

const back = jest.fn();
const requestPermission = jest.fn();
const scanApi = scanVenueCode as jest.Mock;
const mineApi = getMyVenuePresence as jest.Mock;
const leaveApi = leaveVenuePresence as jest.Mock;
const permissions = useCameraPermissions as jest.Mock;
const originalAppState = AppState.currentState;

const done = { data: { presence: { venue: { id: 'hh-1', name: 'The Foxhole' }, expiresAt: '2026-10-03T12:00:00.000Z', hereCount: 3 } } };

const mountScreen = () => render(<ThemeProvider><VenuePresenceScreen /></ThemeProvider>);

beforeEach(() => {
  jest.resetAllMocks();
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  (useRouter as jest.Mock).mockReturnValue({ back });
  (useIsFocused as jest.Mock).mockReturnValue(true);
  permissions.mockReturnValue([{ granted: true, canAskAgain: true }, requestPermission]);
  mineApi.mockResolvedValue({ data: { presence: null } });
  scanApi.mockResolvedValue(done);
  leaveApi.mockResolvedValue({ data: { left: true } });
});
afterEach(() => { AppState.currentState = originalAppState; jest.restoreAllMocks(); });

it('does not open the camera or ask permission until a tap', async () => {
  await mountScreen();
  expect(requestPermission).not.toHaveBeenCalled();
  expect(screen.queryByTestId('presence-camera')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  expect(screen.getByTestId('presence-camera')).toBeOnTheScreen();
});

it('sends a scanned code once and shows the venue, a past-tense count and how long the member is counted — nothing about anyone else', async () => {
  await mountScreen();
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  const scanned = screen.getByTestId('presence-camera').props.onBarcodeScanned;
  await act(async () => {
    scanned({ type: 'qr', data: ' SAYHELLO-HH:abc ' });
    scanned({ type: 'qr', data: ' SAYHELLO-HH:abc ' }); // two events in one frame
  });
  expect(scanApi).toHaveBeenCalledTimes(1);
  expect(scanApi).toHaveBeenCalledWith('SAYHELLO-HH:abc');
  expect(await screen.findByTestId('presence-done-title')).toHaveTextContent("You're here at The Foxhole.");
  expect(screen.getByTestId('presence-count')).toHaveTextContent('3 scanned in here lately.');
  expect(screen.getByText(/Counted as here until/)).toBeOnTheScreen();
  expect(screen.queryByTestId('presence-camera')).not.toBeOnTheScreen();
  // §9.6/§21.1: a count, never a roster, a name or a distance (§8.12).
  const text = JSON.stringify(screen.toJSON());
  expect(text).not.toMatch(/roster|miles|feet|metres|meters|yards/i);
});

it('ignores anything that is not a QR, and a late scan after Stop camera', async () => {
  await mountScreen();
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  const scanned = screen.getByTestId('presence-camera').props.onBarcodeScanned;
  await act(async () => { scanned({ type: 'code128', data: 'X' }); scanned({ type: 'qr', data: '   ' }); });
  expect(scanApi).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText('Stop camera'));
  await act(async () => { scanned({ type: 'qr', data: 'LATE' }); });
  expect(scanApi).not.toHaveBeenCalled();
  expect(screen.queryByTestId('presence-camera')).not.toBeOnTheScreen();
});

it('stops scanning at once when the app backgrounds or the screen loses focus', async () => {
  const { rerender } = await mountScreen();
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  const scanned = screen.getByTestId('presence-camera').props.onBarcodeScanned;
  const change = jest.mocked(AppState.addEventListener).mock.calls[0][1];
  await act(async () => { change('background'); scanned({ type: 'qr', data: 'LATE' }); });
  expect(scanApi).not.toHaveBeenCalled();
  expect(screen.queryByTestId('presence-camera')).not.toBeOnTheScreen();
  await act(async () => { change('active'); });
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  expect(screen.getByTestId('presence-camera')).toBeOnTheScreen();
  (useIsFocused as jest.Mock).mockReturnValue(false);
  await rerender(<ThemeProvider><VenuePresenceScreen /></ThemeProvider>);
  expect(screen.queryByTestId('presence-camera')).not.toBeOnTheScreen();
});

it.each([
  ['unknown_code', "That isn't a Say Hello place code."],
  ['venue_not_active', "This place isn't open to scan right now."],
  ['not_eligible', "Scanning isn't available for this account."],
  ['venue_presence_unavailable', "Scanning here isn't available yet."],
  ['something_else', "That didn't go through. Check your connection and try again."],
])('says plainly what happened on %s and lets the member scan again', async (code, words) => {
  scanApi.mockResolvedValueOnce({ error: { code, message: 'x', status: 400 } }).mockResolvedValueOnce(done);
  await mountScreen();
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  await fireEvent(screen.getByTestId('presence-camera'), 'barcodeScanned', { type: 'qr', data: 'CODE' });
  expect(await screen.findByTestId('presence-error')).toHaveTextContent(words);
  expect(screen.queryByTestId('presence-done')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  await fireEvent(screen.getByTestId('presence-camera'), 'barcodeScanned', { type: 'qr', data: 'CODE' });
  expect(await screen.findByTestId('presence-done')).toBeOnTheScreen();
});

it('handles a response with no presence as a failure, not as success', async () => {
  scanApi.mockResolvedValue({ data: {} });
  await mountScreen();
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  await fireEvent(screen.getByTestId('presence-camera'), 'barcodeScanned', { type: 'qr', data: 'CODE' });
  expect(await screen.findByTestId('presence-error')).toBeOnTheScreen();
  expect(screen.queryByTestId('presence-done')).not.toBeOnTheScreen();
});

it('is honest when camera permission is off: says so, offers Settings, and nothing else breaks (limited mode)', async () => {
  permissions.mockReturnValue([{ granted: false, canAskAgain: false }, requestPermission]);
  requestPermission.mockResolvedValue({ granted: false, canAskAgain: false });
  const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  await mountScreen();
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  expect(screen.getByTestId('presence-error')).toHaveTextContent('Camera access is off. Turn it on in Settings to scan the code.');
  await fireEvent.press(screen.getByTestId('presence-open-settings'));
  expect(openSettings).toHaveBeenCalled();
  expect(scanApi).not.toHaveBeenCalled();
});

it('handles a camera that fails to open', async () => {
  await mountScreen();
  await fireEvent.press(screen.getByTestId('presence-open-camera'));
  await fireEvent(screen.getByTestId('presence-camera'), 'mountError', { message: 'camera unavailable' });
  expect(screen.getByTestId('presence-error')).toHaveTextContent('The camera could not open. Try again.');
  expect(screen.queryByTestId('presence-camera')).not.toBeOnTheScreen();
});

it('shows where the member is already counted as here (read from the server) and lets them leave', async () => {
  mineApi.mockResolvedValue({ data: { presence: { venue: { id: 'hh-1', name: 'The Foxhole' }, expiresAt: '2026-10-03T12:00:00.000Z' } } });
  await mountScreen();
  expect(await screen.findByTestId('presence-current')).toHaveTextContent(/You're counted as here at The Foxhole until/);
  await fireEvent.press(screen.getByTestId('presence-leave'));
  expect(leaveApi).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('presence-current')).not.toBeOnTheScreen();
  expect(screen.queryByTestId('presence-leave')).not.toBeOnTheScreen();
});

it('keeps the current presence when leaving fails', async () => {
  mineApi.mockResolvedValue({ data: { presence: { venue: { id: 'hh-1', name: 'The Foxhole' }, expiresAt: '2026-10-03T12:00:00.000Z' } } });
  leaveApi.mockResolvedValue({ error: { message: 'offline' } });
  await mountScreen();
  await fireEvent.press(await screen.findByTestId('presence-leave'));
  expect(await screen.findByTestId('presence-error')).toBeOnTheScreen();
  expect(screen.getByTestId('presence-current')).toBeOnTheScreen();
});

it('says nothing about presence when the server has none or cannot answer', async () => {
  mineApi.mockResolvedValue({ error: { message: 'offline' } });
  await mountScreen();
  await screen.findByTestId('presence-open-camera');
  expect(screen.queryByTestId('presence-current')).not.toBeOnTheScreen();
});
