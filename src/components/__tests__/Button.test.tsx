/**
 * BUTTON TESTS
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../theme';

describe('Button', () => {
  it('renders correctly', async () => {
    const screen = await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPress} />
      </ThemeProvider>
    );

    fireEvent.press(screen.getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPress} disabled />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');

    // Assert disabled STATE
    expect(button.props.accessibilityState.disabled).toBe(true);

    // Assert disabled BEHAVIOR
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', async () => {
    const screen = await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={() => {}} loading />
      </ThemeProvider>
    );

    expect(screen.queryByText('Test Button')).toBeNull(); // No text when loading
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('sets accessibilityState.busy when loading', async () => {
    const screen = await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={() => {}} loading />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button.props.accessibilityState.busy).toBe(true);
  });
});
