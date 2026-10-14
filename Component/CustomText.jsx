import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomText = ({ children, style, ...props }) => {
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'YourFontFamily', // Replace with your font family, e.g., 'Roboto', 'Arial', etc.
    fontSize: 16,                  // Default font size
    color: '#000',                 // Default color, change as needed
    fontWeight: 'normal',          // Default font weight
  },
});

export default CustomText;