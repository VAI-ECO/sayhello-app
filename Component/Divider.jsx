import { StyleSheet, Text, View } from "react-native";
import React from "react";

const Divider = () => {
  return <View style={styles.divider}></View>;
};

export default Divider;

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: "#EBEBEB",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 18,
  },
});
