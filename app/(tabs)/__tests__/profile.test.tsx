/**
 * PROFILE SCREEN TESTS
 *
 * Tests navigation to Icebreakers from Profile tab.
 *
 * RNTL v14: All operations async, use imported screen.
 */

import { render, screen, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../profile';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile screen with header', async () => {
    await render(<ProfileScreen />);

    expect(screen.getByText('You')).toBeTruthy();
  });

  it('shows Icebreakers menu item', async () => {
    await render(<ProfileScreen />);

    expect(screen.getByText('Icebreakers')).toBeTruthy();
  });

  it('navigates to Icebreakers screen when tapped', async () => {
    await render(<ProfileScreen />);

    const icebreakerLink = screen.getByTestId('profile-icebreakers-link');
    await fireEvent.press(icebreakerLink);

    expect(mockPush).toHaveBeenCalledWith('/profile/icebreakers');
  });

  it('Icebreakers link is pressable', async () => {
    await render(<ProfileScreen />);

    const icebreakerLink = screen.getByTestId('profile-icebreakers-link');
    expect(icebreakerLink).toBeTruthy();
  });
});
