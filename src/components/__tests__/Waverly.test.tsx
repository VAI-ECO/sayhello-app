import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Waverly } from '../Waverly';
import { Colors, ThemeProvider } from '../../theme';

describe('original Waverly mark', () => {
  it('renders the preserved artwork in the identity color, not an emoji', async () => {
    await render(<ThemeProvider initialColor={Colors.Purple}><Waverly /></ThemeProvider>);
    const mark = screen.getByRole('image', { name: 'Waverly, the Hello hand' });
    expect(mark.props.source).toEqual(require('../../../assets/waverly-mark-white.png'));
    expect(mark).toHaveStyle({ tintColor: Colors.Purple });
    expect(screen.queryByText('👋')).toBeNull();
  });

  it('honors an explicit contrast-color override', async () => {
    await render(<ThemeProvider><Waverly color={Colors.Chalk} /></ThemeProvider>);
    expect(screen.getByRole('image')).toHaveStyle({ tintColor: Colors.Chalk });
  });
});
