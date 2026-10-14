import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';

class WebErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Only show error boundary on web
    if (Platform.OS === 'web') {
      return { hasError: true, error };
    }
    // On native, let it bubble up
    throw error;
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught by boundary:', error, errorInfo);
    // Log to console for debugging
    if (Platform.OS === 'web') {
      console.warn('Web preview error - this screen may not be fully functional');
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && Platform.OS === 'web') {
      return (
        <View style={styles.container}>
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>⚠️ Web Preview Notice</Text>
            <Text style={styles.errorText}>
              This screen isn't fully available in web preview.
            </Text>
            <Text style={styles.errorSubtext}>
              Some features require a native mobile device.
            </Text>
            <Text style={styles.errorDetail}>
              Error: {this.state.error?.message || 'Unknown error'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleReset}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Wrap children in try-catch for extra safety on web
    if (Platform.OS === 'web') {
      try {
        return this.props.children;
      } catch (error) {
        console.error('Render error caught:', error);
        return null;
      }
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff9800',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WebErrorBoundary;
