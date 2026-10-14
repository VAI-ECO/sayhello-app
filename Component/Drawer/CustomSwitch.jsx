import React from "react";
import {
  Pressable,
  View,
  Animated,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import Loader from "../Loader";

const defaultStyles = {
  bgColor: "#0100ff",
  headColor: "#ffffff",
};

const activeStyles = {
  bgColor: "#00c4ff",
  headColor: "#444D56",
};

const CustomSwitch = (props) => {
  const { value, onValueChange, isLoading } = props;
  const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    // Update the animated value when the value prop changes
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 300, // Adjust the animation duration
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 28], // Adjust the distance of the switch head
  });

  const currentStyles = value ? activeStyles : defaultStyles;

  return (
    <>
      {isLoading ? (
        <View>
          <Loader />
        </View>
      ) : (
        <Pressable onPress={onValueChange} style={styles.pressable}>
          <View
            style={[
              styles.background,
              { backgroundColor: currentStyles.bgColor },
            ]}
          >
            <View style={styles.innerContainer}>
              <Animated.View
                style={{
                  transform: [{ translateX }],
                }}
              >
                <View
                  style={[
                    styles.head,
                    { backgroundColor: currentStyles.headColor },
                  ]}
                />
              </Animated.View>
            </View>
          </View>
        </Pressable>
      )}
    </>
  );
};

export default CustomSwitch;

const styles = StyleSheet.create({
  pressable: {
    width: 56,
    height: 29,
    borderRadius: 16,
  },
  background: {
    borderRadius: 16,
    flex: 1,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  head: {
    width: 24,
    height: 24,
    borderRadius: 100,
  },
});
