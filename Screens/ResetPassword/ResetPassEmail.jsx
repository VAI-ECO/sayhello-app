import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  ImageBackground,
  Image,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import userService from "../../Services/userService";
import Toast from "react-native-toast-message";
import Loader from "../../Component/Loader";
import i18n from "../../Context/i18n";

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [email, setEmail] = useState("");
  const navigation = useNavigation();
  const emailInputRef = useRef(null);
  const usernameInputRef = useRef(null);

  const handleEmailChange = (text) => {
    const trimmedEmail = text.trim();
    setIsValidEmail(validateEmail(text));
    setEmail(trimmedEmail.toLowerCase());
  };

  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handelSubmit = () => {
    let body = {
      email: email,
    };

    setLoading(true);

    userService
      .emailForogotPass(body)
      .then((res) => {
        console.log("Ress: ", res);
        setLoading(false);
        setEmail("");
        navigation.navigate("ResetPassOtpEmail", {
          details: email,
        });
      })
      .catch((err) => {
        setLoading(false);
        setEmail("");
        Toast.show({
          type: "error",
          text1: "Email Not Found!",
          autoHide: true,
          visibilityTime: 1000,
        });
        console.log("error on emailForogotPass: ", err);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : null}
          style={{ flex: 1 }}
        >
          <ImageBackground
            source={require("../../assets/ImageBackground.jpg")}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.contentContainer}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                }}
              >
                <TouchableOpacity
                  onPress={goBack}
                  style={{
                    width: "14%",
                    justifyContent: "flex-start",
                  }}
                >
                  <Image
                    style={{
                      width: 35,
                      height: 35,
                      resizeMode: "contain",
                    }}
                    source={require("../../assets/btnbtn.png")}
                  />
                </TouchableOpacity>
              </View>
              <Text allowFontScaling={false} style={styles.heading}>
                {i18n.t("global.enterEmail")}
              </Text>
              <Text allowFontScaling={false} style={styles.description}>
                {i18n.t("global.pleaseenteryour mailand wewillsendverificationcode")}
              </Text>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputField}>
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.email")}
                  </Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="alternate-email"
                      size={26}
                      color="#3C2828"
                    />
                    <TextInput
                      allowFontScaling={false}
                      style={[
                        styles.inputField,
                        !isValidEmail && styles.inputError,
                      ]}
                      value={email}
                      onChangeText={handleEmailChange}
                      placeholder={i18n.t("global.enterEmail")}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoCompleteType="email"
                      placeholderTextColor="#3C2828"
                      returnKeyType="next"
                      ref={emailInputRef}
                      onSubmitEditing={() => usernameInputRef.current?.focus()}
                      paddingLeft={10}
                    />
                  </View>
                  {!isValidEmail && (
                    <Text style={styles.errorText}>
                      {i18n.t("global.Pleaseenteravalidemailaddress")}
                    </Text>
                  )}
                </View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={() => handelSubmit()}
                    disabled={loading}
                    style={styles.buttonTouchable}
                  >
                    <Text allowFontScaling={false} style={styles.buttonText}>
                      {loading ? <Loader /> : "Send OTP"}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </ImageBackground>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 45,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    // paddingBottom: 10,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 97,
    height: 97,
  },
  inputField: {
    marginBottom: 7,
  },
  label: {
    marginBottom: 5,
    color: "#707070",
    fontWeight: "400",
    fontSize: 17,
    fontFamily: "Inter-Regular",
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 55,
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    fontSize: 15,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#3C2828",
    paddingLeft: 10,
  },
  phoneInputContainer: {
    width: "100%",
    backgroundColor: "#F6F6F6",
    borderRadius: 3,
  },
  phoneInputTextContainer: {
    borderLeftWidth: 0.5,
    backgroundColor: "#F6F6F6",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 7,
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
  },
  buttonTouchable: {
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
  heading: {
    color: "black",
    fontWeight: "400",
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    paddingHorizontal: 22,
    marginTop: 20,
  },
  description: {
    color: "#000000",
    fontWeight: "400",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    paddingHorizontal: 22,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    marginTop: 10,
    color: "red",
    fontSize: 14,
  },
});

const phoneInputStyles = StyleSheet.create({
  placeholder: {
    color: "#3C2828",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});

export default SignUp;
