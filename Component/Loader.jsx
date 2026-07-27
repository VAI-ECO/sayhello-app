import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const Loader = ({ size, color }) => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size={size || "large"} color={color || "#0000ff"} />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loader;
