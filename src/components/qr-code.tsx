import { Component, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

class QrBoundary extends Component<{ children: ReactNode; fallback: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <Text accessibilityRole="alert" style={{ color: '#000000' }}>{this.props.fallback}</Text>
      : this.props.children;
  }
}

/** Local-only encoding: the token is never sent to an image/QR service. */
export function ScannableCode({ value, size, label, fallback }: {
  value: string; size: number; label: string; fallback: string;
}) {
  return (
    <QrBoundary key={value} fallback={fallback}>
      <View accessible accessibilityRole="image" accessibilityLabel={label}>
        <QRCode
          value={value}
          size={size}
          color="#000000"
          backgroundColor="#FFFFFF"
          // At least four modules, even for the smallest 21-module symbol.
          quietZone={size * 4 / 21}
          ecl="M"
          testID="scannable-code"
        />
      </View>
    </QrBoundary>
  );
}
