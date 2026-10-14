// Stub for native-only modules on web
// This allows the app to bundle for web without errors from native modules
import React from 'react';

// Export empty object as default
export default {};

// Placeholder component that renders a visible box
const Placeholder = ({ children, type = 'component', style }) => {
  const placeholderStyle = {
    backgroundColor: '#f0f0f0',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100px',
    ...style,
  };

  const textStyle = {
    color: '#666',
    fontSize: '14px',
    textAlign: 'center',
  };

  return (
    <div style={placeholderStyle}>
      <div style={textStyle}>
        {children || `📱 ${type} (web preview)`}
      </div>
    </div>
  );
};

// Export common React Native component stubs with placeholders
export const View = ({ children, style }) => (
  <div style={style}>{children}</div>
);

export const Text = ({ children, style }) => (
  <span style={style}>{children}</span>
);

export const TouchableOpacity = ({ children, onPress, style }) => (
  <div onClick={onPress} style={{ ...style, cursor: 'pointer' }}>
    {children}
  </div>
);

export const Button = ({ title, onPress }) => (
  <button onClick={onPress}>{title}</button>
);

// Maps placeholder
export const MapView = ({ children, style }) => (
  <Placeholder type="Map" style={style}>
    🗺️ Map View
  </Placeholder>
);

export const Marker = () => null;
export const PROVIDER_GOOGLE = 'google';

// Camera placeholder
export const Camera = ({ style }) => (
  <Placeholder type="Camera" style={style}>
    📷 Camera
  </Placeholder>
);

export const CameraView = ({ style }) => (
  <Placeholder type="Camera" style={style}>
    📷 Camera View
  </Placeholder>
);

// Phone number input placeholder
export const PhoneInput = ({ style, value, onChangeText, onChangeFormattedText }) => (
  <Placeholder type="Phone Input" style={style}>
    📞 Phone Number Input
    {value && <div style={{ marginTop: '8px', fontSize: '12px' }}>{value}</div>}
  </Placeholder>
);

// Country picker placeholder
export const CountryPicker = ({ style }) => (
  <Placeholder type="Country Picker" style={style}>
    🌍 Country Picker
  </Placeholder>
);

// Export common native module stubs
export const StripeProvider = ({ children }) => <>{children}</>;

export const CardField = ({ style }) => (
  <Placeholder type="Card Input" style={style}>
    💳 Stripe Card Field
  </Placeholder>
);

export const useStripe = () => ({
  createPaymentMethod: async () => ({
    paymentMethod: { id: 'web_preview_pm' },
    error: null,
  }),
  confirmPayment: async () => ({
    paymentIntent: { id: 'web_preview_pi', status: 'succeeded' },
    error: null,
  }),
});

export const useConfirmPayment = () => ({
  confirmPayment: async () => ({
    paymentIntent: { id: 'web_preview_pi', status: 'succeeded' },
    error: null,
  }),
});

// Export any other common patterns
export const create = () => ({});
export const usePermissions = () => [{ granted: true }, async () => ({ granted: true })];

// Add common React Native exports that might be needed
export { Placeholder };
