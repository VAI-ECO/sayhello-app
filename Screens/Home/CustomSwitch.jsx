import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

const CustomSwitch = ({ value, onValueChange, ApiFunction, resetState }) => {
  const [isActive, setIsActive] = useState(value);

  useEffect(() => {
    if (resetState !== null) {
      setIsActive(resetState);
    }
  }, [resetState]);

  const toggleSwitch = () => {
    if (isActive) {
      ApiFunction(false);
    }
    else {
      ApiFunction(true);
    }
    // setIsActive(!isActive);
    // onValueChange && onValueChange(!isActive);
    // ApiFunction(!isActive);
  };

  return (
    <TouchableOpacity
      style={[styles.switchContainer, isActive && styles.activeSwitch]}
      onPress={toggleSwitch}
    >
      <View style={[styles.track, isActive && styles.activeTrack]} />
      <View style={[styles.thumb, isActive && styles.disactiveThumb]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: 43,
    height: 24,
    backgroundColor: "#00EDB4",
    borderRadius: 23,
    justifyContent: "center",
    padding: 2,
    marginLeft: 30,
  },
  activeSwitch: {
    backgroundColor: "blue",
  },
  activeTrack: {
    backgroundColor: "fff",
  },
  thumb: {
    width: 19,
    height: 19,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginLeft: 5,
    justifyContent: "center",
    position: "absolute",
  },
  disactiveThumb: {
    backgroundColor: "#fff",
    width: 19,
    height: 19,
    borderRadius: 15,
    right: 5,
  },
});

export default CustomSwitch;
