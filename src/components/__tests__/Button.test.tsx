/**
 * BUTTON TESTS
 */

import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../theme';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Button title="Test Button" onPress={() => {}} />
      </ThemeProvider>
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPress} />
      </ThemeProvider>
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <Button title="Test Button" onPress={onPress} disabled />
      </ThemeProvider>
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <ThemeProvider>
        <Button title="Test Button" onPress={() => {}} loading />
      </ThemeProvider>
    );

    expect(queryByText('Test Button')).toBeNull();
    expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
  });
});
