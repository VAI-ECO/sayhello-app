import React from 'react';
import { AppState } from 'react-native';
import { render, screen, fireEvent, act, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { useCameraPermissions } from 'expo-camera';
import { ThemeProvider } from '../../../src/theme';
import { checkInHootza, getHootza } from '../../../src/api/hootzas';
import CheckInScreen from '../../../app/(hootzas)/[id]/check-in';
import HostModePromptScreen from '../../../app/(hootzas)/[id]/host-mode-prompt';

jest.mock('expo-router', () => ({ useLocalSearchParams: jest.fn(), useRouter: jest.fn() }));
jest.mock('expo-router/react-navigation', () => ({ useIsFocused: jest.fn() }));
jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
  CameraView: (props: unknown) => require('react').createElement(require('react-native').View, props),
}));
jest.mock('../../../src/api/hootzas');
const replace = jest.fn();
const requestPermission = jest.fn();
const checkin = checkInHootza as jest.Mock;
const permissions = useCameraPermissions as jest.Mock;
const originalAppState = AppState.currentState;
beforeEach(() => {
  jest.resetAllMocks();
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  (useRouter as jest.Mock).mockReturnValue({ replace, back: jest.fn() });
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'hz-1', code: 'HOST-CODE' });
  (useIsFocused as jest.Mock).mockReturnValue(true);
  permissions.mockReturnValue([{ granted: true, canAskAgain: true }, requestPermission]);
  (getHootza as jest.Mock).mockResolvedValue({ data: { hootza: { title: 'Trivia', host: { fullName: 'Ray' }, status: 'live' } } });
  checkin.mockResolvedValue({ data: { checkin: { id: 'checked-1' }, hostModeRequested: false } });
});
afterEach(() => { AppState.currentState = originalAppState; jest.restoreAllMocks(); });

it('does not open the camera or ask permission until a tap', async () => {
  await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  expect(requestPermission).not.toHaveBeenCalled();
  expect(screen.queryByTestId('check-in-camera')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByText('Scan with camera'));
  expect(screen.getByTestId('check-in-camera')).toBeOnTheScreen();
});

it('retains manual entry when camera permission is denied', async () => {
  permissions.mockReturnValue([{ granted: false, canAskAgain: true }, requestPermission]);
  requestPermission.mockResolvedValue({ granted: false, canAskAgain: false });
  await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  await fireEvent.press(screen.getByText('Scan with camera'));
  expect(requestPermission).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/Camera access is off/)).toBeOnTheScreen();
  await fireEvent.changeText(screen.getByTestId('check-in-code-input'), ' HOST-CODE ');
  await fireEvent.press(screen.getByTestId('check-in-submit'));
  expect(checkin).toHaveBeenCalledWith('hz-1', 'HOST-CODE', false);
  expect(replace).toHaveBeenCalledWith('/(hootzas)/hz-1');
});

it('starts scanning after permission is explicitly granted', async () => {
  permissions.mockReturnValue([{ granted: false, canAskAgain: true }, requestPermission]);
  requestPermission.mockImplementation(async () => {
    const granted = { granted: true, canAskAgain: true };
    permissions.mockReturnValue([granted, requestPermission]);
    return granted;
  });
  await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  await fireEvent.press(screen.getByText('Scan with camera'));
  expect(requestPermission).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('check-in-camera')).toBeOnTheScreen();
});

it('ignores a late scan callback after Stop camera', async () => {
  await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  await fireEvent.press(screen.getByText('Scan with camera'));
  const scanned = screen.getByTestId('check-in-camera').props.onBarcodeScanned;
  await fireEvent.press(screen.getByText('Stop camera'));
  await act(async () => { scanned({ type: 'qr', data: 'LATE-CODE' }); });
  expect(checkin).not.toHaveBeenCalled();
  expect(screen.queryByTestId('check-in-camera')).not.toBeOnTheScreen();
});

it('stops scanning immediately when the app backgrounds', async () => {
  await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  await fireEvent.press(screen.getByText('Scan with camera'));
  const scanned = screen.getByTestId('check-in-camera').props.onBarcodeScanned;
  const change = jest.mocked(AppState.addEventListener).mock.calls[0][1];
  await act(async () => { change('background'); scanned({ type: 'qr', data: 'LATE-CODE' }); });
  expect(screen.queryByTestId('check-in-camera')).not.toBeOnTheScreen();
  expect(checkin).not.toHaveBeenCalled();
});

it('does not treat a response without a check-in record as success', async () => {
  checkin.mockResolvedValue({ data: { hostModeRequested: false } });
  await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  await fireEvent.changeText(screen.getByTestId('check-in-code-input'), 'HOST-CODE');
  await fireEvent.press(screen.getByTestId('check-in-submit'));
  expect(screen.getByRole('alert')).toHaveTextContent('Check-in could not be confirmed. Please try again.');
  expect(replace).not.toHaveBeenCalled();
});

it('submits a scanned code once, without implicit Host Mode consent', async () => {
  let resolve!: (value: unknown) => void;
  checkin.mockImplementation(() => new Promise(done => { resolve = done; }));
  await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  await fireEvent.press(screen.getByText('Scan with camera'));
  const camera = screen.getByTestId('check-in-camera');
  // Capture the native callback to simulate two events in the same frame.
  const scanned = camera.props.onBarcodeScanned;
  await act(async () => {
    scanned({ type: 'qr', data: 'HOST-CODE' });
    scanned({ type: 'qr', data: 'HOST-CODE' });
  });
  expect(checkin).toHaveBeenCalledTimes(1);
  expect(checkin).toHaveBeenCalledWith('hz-1', 'HOST-CODE', false);
  expect(screen.queryByTestId('check-in-camera')).not.toBeOnTheScreen();
  expect(replace).not.toHaveBeenCalled();
  await act(async () => { resolve({ data: { checkin: { id: 'checked-1' }, hostModeRequested: true } }); });
  expect(replace).toHaveBeenCalledWith({ pathname: '/(hootzas)/[id]/host-mode-prompt', params: { id: 'hz-1', code: 'HOST-CODE' } });
});

it('keeps a failed scan value available for retry', async () => {
  checkin.mockResolvedValueOnce({ error: { message: 'Network unavailable' } })
    .mockResolvedValueOnce({ data: { checkin: { id: 'checked-1' }, hostModeRequested: false } });
  await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  await fireEvent.press(screen.getByText('Scan with camera'));
  await fireEvent(screen.getByTestId('check-in-camera'), 'barcodeScanned', { type: 'qr', data: 'HOST-CODE' });
  expect(screen.getByRole('alert')).toHaveTextContent('Network unavailable');
  expect(screen.getByTestId('check-in-code-input')).toHaveDisplayValue('HOST-CODE');
  expect(replace).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByTestId('check-in-submit'));
  expect(replace).toHaveBeenCalledWith('/(hootzas)/hz-1');
});

it('unmounts the camera when the route loses focus', async () => {
  const { rerender } = await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  await fireEvent.press(screen.getByText('Scan with camera'));
  expect(screen.getByTestId('check-in-camera')).toBeOnTheScreen();
  (useIsFocused as jest.Mock).mockReturnValue(false);
  await rerender(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  expect(screen.queryByTestId('check-in-camera')).not.toBeOnTheScreen();
});

it('handles camera mount failure without losing manual check-in', async () => {
  await render(<ThemeProvider><CheckInScreen /></ThemeProvider>);
  await fireEvent.press(screen.getByText('Scan with camera'));
  await fireEvent(screen.getByTestId('check-in-camera'), 'mountError', { message: 'camera unavailable' });
  expect(screen.getByRole('alert')).toHaveTextContent(/camera could not open/);
  expect(screen.queryByTestId('check-in-camera')).not.toBeOnTheScreen();
  expect(screen.getByTestId('check-in-code-input')).toBeOnTheScreen();
});

it.each([true, false])('saves explicit Host Mode choice %s and stays on failure before retrying', async accept => {
  checkin.mockResolvedValueOnce({ error: { message: 'Choice not saved' } })
    .mockResolvedValueOnce({ data: { checkin: { id: 'checked-1' }, hostModeRequested: true } });
  await render(<ThemeProvider><HostModePromptScreen /></ThemeProvider>);
  const button = await screen.findByTestId(accept ? 'host-mode-accept' : 'host-mode-decline');
  await fireEvent.press(button);
  expect(checkin).toHaveBeenLastCalledWith('hz-1', 'HOST-CODE', accept);
  expect(screen.getByRole('alert')).toHaveTextContent('Choice not saved');
  expect(replace).not.toHaveBeenCalled();
  await fireEvent.press(button);
  expect(replace).toHaveBeenCalledWith('/(hootzas)/hz-1');
  expect(replace).not.toHaveBeenCalledWith('/(hootzas)/hz-1/host-mode-window');
});

it('loads the host identity again after a failed prompt load', async () => {
  (getHootza as jest.Mock).mockResolvedValueOnce({ error: { message: 'Offline' } })
    .mockResolvedValueOnce({ data: { hootza: { title: 'Trivia', host: { fullName: 'Ray' } } } });
  await render(<ThemeProvider><HostModePromptScreen /></ThemeProvider>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
  expect(screen.queryByTestId('host-mode-accept')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByText('Try again'));
  expect(await screen.findByText("Ray, who's hosting, is asking")).toBeOnTheScreen();
});

it('disables both choices while the Host Mode response is saving', async () => {
  let resolve!: (value: unknown) => void;
  checkin.mockImplementation(() => new Promise(done => { resolve = done; }));
  await render(<ThemeProvider><HostModePromptScreen /></ThemeProvider>);
  const accept = await screen.findByTestId('host-mode-accept');
  // Native responder events let the request remain pending while we inspect
  // the UI; fireEvent awaits the async onPress handler's returned promise.
  await userEvent.setup().press(accept);
  expect(screen.getByTestId('host-mode-accept')).toBeDisabled();
  expect(screen.getByTestId('host-mode-decline')).toBeDisabled();
  await fireEvent.press(screen.getByTestId('host-mode-decline'));
  expect(checkin).toHaveBeenCalledTimes(1);
  await act(async () => { resolve({ data: { checkin: { id: 'checked-1' }, hostModeRequested: true } }); });
  expect(replace).toHaveBeenCalledWith('/(hootzas)/hz-1');
});
