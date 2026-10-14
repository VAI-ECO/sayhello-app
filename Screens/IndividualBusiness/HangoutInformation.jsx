import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  Platform,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import HangoutHeader from "../../Component/HangoutHeader";
import ProfileHeader from "../../Component/ProfileHeader";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "../../Context/i18n";

const HangoutInformation = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const navigation = useNavigation();

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
  const handleSubmit = () => {
    navigation.navigate("HelloAmbassador");
    console.log("hi");
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ImageBackground
          source={require("../../assets/ImageBackground.jpg")}
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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : null}
          >
            <View style={styles.container}>
              <ProfileHeader />
              <HangoutHeader />
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                {i18n.t("global.googleAPIInformation")}
              </Text>
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={styles.buton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
              >
                <TouchableOpacity
                  style={styles.buttonContent}
                  onPress={handleSubmit}
                >
                  <Text allowFontScaling={false} style={styles.buttonText}>
                    {i18n.t("global.thankYou")}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HangoutInformation;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  inputField: {
    width: "100%",
    height: 53,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    marginBottom: 20,
    alignSelf: "center",
    borderWidth: 1,
  },
  label: {
    marginBottom: 6,
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
    fontFamily: "Roboto-Regular",
  },
  buton: {
    width: "90%",
    height: 50,
    borderRadius: 6,
    alignSelf: "center",
    position: "absolute",
    bottom: 10,
  },
  buttonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#fff",
  },
});
