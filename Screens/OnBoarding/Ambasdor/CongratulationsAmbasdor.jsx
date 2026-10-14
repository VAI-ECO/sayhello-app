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
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../../Context/AuthContext";
import Toast from "react-native-toast-message";
import i18n from "../../../Context/i18n";

const CongratulationsAmbasdor = () => {
  const { user, signIn } = useAuth();

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [user_info, setUser_info] = useState(null);

  useEffect(() => {
    const GetUserInfo = async () => {
      let result = await AsyncStorage.getItem("user_info");

      console.log(result);

      if (result) {
        const new_val = JSON.parse(result);
        setUser_info(new_val);
      }
    };

    GetUserInfo();
  }, []);

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

  const handelClick = async () => {
    // let user_info = await AsyncStorage.getItem("user_info");

    console.log("user_info", user_info);

    navigation.navigate("PersonalInfo");

  };
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
            // width: 130,
            height: 70,
            resizeMode: "contain",
            alignSelf: "center",
          }}
          source={require("../../../assets/SayHello new text.png")}
        />
        <Text allowFontScaling={false} style={styles.Text}>
          {i18n.t("global.individualCongratulationText")}
        </Text>

        {isKeyboardOpen ? null : (
          <LinearGradient
            colors={["#338AFF", "#00EDB4"]}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.2, y: 0.6 }}
          >
            <TouchableOpacity
              onPress={handelClick}
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
                {i18n.t("global.setup")}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

export default CongratulationsAmbasdor;

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
    marginBottom: 80,
  },
  Text: {
    fontSize: 16,
    fontWeight: "600",
    // textAlign: "center",
    fontFamily: "Roboto-Bold",
    lineHeight: 22,
    color: "#000000",
    paddingTop: 50,
    marginHorizontal: 30,
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    bottom: 30,
    position: "absolute",
  },
});
