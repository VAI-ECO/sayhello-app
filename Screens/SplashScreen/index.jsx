import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Animated,
  ImageBackground,
} from "react-native";

const RevealImage = ({ source, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
    Animated.timing(translateY, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacity,
        transform: [{ translateY: translateY }],
      }}
    >
      <Image source={source} style={style} />
    </Animated.View>
  );
};

const SplashScreenComponent = () => {
  const [text, setText] = useState("");
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    const text = "Say Hello";
    setText(text);
    setLetters(text.split(""));
  }, []);

  return (
    <LinearGradient
      colors={["#338AFF", "#CCCCCC"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <RevealImage
        source={require("../../assets/splashmap.png")}
        style={{ resizeMode: "contain", width: 400, height: 300 }}
      />
      <RevealImage
        source={require("../../assets/hangnewsay.png")}
        style={styles.handwavingimage}
      />
      <View style={styles.textContainer}>
        {letters.map((letter, index) => (
          <Animated.View
            key={index}
            style={{
              opacity: new Animated.Value(0),
              transform: [
                {
                  translateY: new Animated.Value(100),
                },
              ],
            }}
          >
            <Text allowFontScaling={false} style={styles.text}>
              {letter}
            </Text>
          </Animated.View>
        ))}
      </View>
    </LinearGradient>
  );
};

export default SplashScreenComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row", // Ensure text appears in a row
    width: "80%", // Ensure the container has enough width
    justifyContent: "center", // Center the text horizontally
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 5, // Add spacing between letters if needed
    // fontFamily: "Dreaming",
    color: "#fff",
  },
  handwavingimage: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  imageBackground: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    top: -60,
  },
});
