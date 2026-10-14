import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Keyboard,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";

const ThankYouBus = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  // const router = useRoute();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardOpen(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardOpen(false);
      }
    );

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../../../assets/ImageBackground.jpg")}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          flex: 1,
          left: 0,
          top: 0,
        }}
        resizeMode="cover"
      >
        <Image
          style={styles.image}
          source={require("../../../assets/newlogosyhello.jpeg")}
        />
        <Image
          style={{
            width: 130,
            height: 100,
            resizeMode: "contain",
            alignSelf: "center",
          }}
          source={require("../../../assets/Say Hello.png")}
        />
        <Text allowFontScaling={false} style={styles.Text}>
          {i18n.t("BusinesPhoto.textthree")}
        </Text>

        {isKeyboardOpen ? null : (
          <LinearGradient
            colors={["#338AFF", "#00EDB4"]}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.2, y: 0.6 }}
          >
            <TouchableOpacity
              onPress={() =>
                // navigation.navigate("AlsBusiness", {
                //   orgData: router?.params?.orgData,
                // })
                navigation.navigate("AlsBusiness")
              }
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  fontFamily: "Inter-Regular",
                  color: "#fff",
                }}
              >
                {i18n.t("global.beyondHello")}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ThankYouBus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // paddingTop: 45,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 190,
    height: 190,
    top: 50,
    marginBottom: 90,
  },
  Text: {
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: "Roboto-Bold",
    lineHeight: 22,
    color: "#000000",
    paddingTop: 50,
    marginHorizontal: 22,
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    bottom: 20,
    position: "absolute",
  },
});
import i18n from "../../../Context/i18n";
