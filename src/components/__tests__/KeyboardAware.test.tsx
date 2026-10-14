import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { KeyboardAware, keyboardBehavior } from '../KeyboardAware';
import { ScreenContainer } from '../ScreenContainer';
import { SubScreen } from '../account/SubScreen';

// Render the keyboard-avoiding view as a plain View that keeps its props, so behavior/enabled are observable.
jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => {
  const { View: MockView } = require('react-native');
  return { __esModule: true, default: (props: Record<string, unknown>) => <MockView {...props} testID="kav" /> };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, back: jest.fn(), replace: jest.fn() }),
}));

describe('keyboardBehavior', () => {
  it('pads on iOS and leaves Android to the window resize mode', () => {
    expect(keyboardBehavior('ios')).toBe('padding');
    expect(keyboardBehavior('android')).toBeUndefined();
    expect(keyboardBehavior('web')).toBeUndefined();
  });
});

describe('KeyboardAware', () => {
  it('renders its children inside a keyboard-avoiding view', async () => {
    await render(<KeyboardAware><Text>Inside</Text></KeyboardAware>);
    expect(screen.getByText('Inside')).toBeOnTheScreen();
    expect(screen.getByTestId('kav')).toHaveProp('enabled', true);
  });

  it('forwards the vertical offset', async () => {
    await render(<KeyboardAware verticalOffset={64}><View /></KeyboardAware>);
    expect(screen.getByTestId('kav')).toHaveProp('keyboardVerticalOffset', 64);
  });
});

describe('shared shells keep form fields reachable', () => {
  it('ScreenContainer wraps its content in an enabled keyboard-avoiding view by default', async () => {
    await render(
      <ScreenContainer>
        <TextInput aria-label="Name" />
      </ScreenContainer>,
    );
    expect(screen.getByLabelText('Name')).toBeOnTheScreen();
    expect(screen.getByTestId('kav')).toHaveProp('enabled', true);
  });

  it('ScreenContainer can opt out', async () => {
    await render(
      <ScreenContainer keyboardAvoiding={false}>
        <Text>Plain</Text>
      </ScreenContainer>,
    );
    expect(screen.getByTestId('kav')).toHaveProp('enabled', false);
  });

  it('SubScreen back control is at least 44 x 44 and its form sits in a keyboard-avoiding view', async () => {
    await render(
      <SubScreen title="Edit profile">
        <TextInput aria-label="Display name" />
      </SubScreen>,
    );
    expect(screen.getByTestId('subscreen-back')).toHaveStyle({ minWidth: 44, minHeight: 44 });
    expect(screen.getByTestId('kav')).toHaveProp('enabled', true);
    expect(screen.getByLabelText('Display name')).toBeOnTheScreen();
  });
});
