/**
 * BUTTON TESTS
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../theme';

describe('Button', () => {
  it('allows its container to grow with Dynamic Type instead of fixing its height', async () => {
    await render(<ThemeProvider><Button title="A longer accessible action" onPress={() => {}} /></ThemeProvider>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ minHeight: 56 });
    expect(button).not.toHaveStyle({ height: 56 });
  });

  it('renders correctly', async () => {
    await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPress} />
      </ThemeProvider>
    );

    await fireEvent.press(screen.getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPress} disabled />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');

    // Assert disabled STATE
    expect(button.props.accessibilityState.disabled).toBe(true);

    // Assert disabled BEHAVIOR
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', async () => {
    await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={() => {}} loading />
      </ThemeProvider>
    );

    expect(screen.queryByText('Test Button')).toBeNull(); // No text when loading
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('sets accessibilityState.busy when loading', async () => {
    await render(
      <ThemeProvider>
        <Button title="Test Button" onPress={() => {}} loading />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button.props.accessibilityState.busy).toBe(true);
  });
});
