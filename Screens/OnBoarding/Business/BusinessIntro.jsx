import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Keyboard,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import BusinessService from "../../../Services/BusinessService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../../../Component/Loader";
import { BackHandler } from "react-native";
import Toast from "react-native-toast-message";
import i18n from "../../../Context/i18n";

const BusinessIntro = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState(["", "", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);
  const [isOtpFilled, setIsOtpFilled] = useState(false);

  const [user_info, setUser_info] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [error, setShowError] = useState(false);

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

  const handleInputChange = (index, value) => {
    // Convert input to uppercase
    const upperCaseValue = value.toUpperCase();

    if (index < otp.length) {
      const newOtp = [...otp];
      newOtp[index] = upperCaseValue;
      setOtp(newOtp);

      setIsOtpFilled(newOtp.every((digit) => digit !== ""));
      // Focus the next input field if the current one is filled
      if (index < otp.length - 1 && upperCaseValue !== "") {
        otpInputRefs.current[index + 1]?.focus();
      }
    }

    // Handle empty value (backspace)
    if (upperCaseValue === "" && index >= 0) {
      const newOtp = [...otp];
      newOtp[index] = upperCaseValue;
      setOtp(newOtp);

      // Focus the previous input field if backspace is pressed
      if (index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleGetBusinessDetails = async () => {
    if (!isOtpFilled) {
      setShowError(true);
      return;
    }
    let business_id = otp.join("");
    setLoading(true);

    console.log("Business ID:", business_id);

    // GV6DW58

    await BusinessService.GetBusinessDetailsVerify(business_id)
      .then(async (res) => {
        await AsyncStorage.setItem(`BusinessDetails`, JSON.stringify(res));

        navigation.navigate("EnterData", {
          businessInfo: null,
          isBusinessId: true,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.log("err:", err.message);
        if (err.response?.status === 404 && err.response?.data?.error) {
          Toast.show({
            type: "error",
            text1: err.response.data.error,
          });
        }

        setLoading(false);
      });
  };
  useEffect(() => {
    const backAction = () => {
      if (Platform.OS === "android") {
        return false; // Prevent Android hardware back button from navigating back
      } else {
        navigation.goBack(); // Handle iOS navigation logic
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : null}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={styles.container}>
                <Image
                  style={{
                    width: "90%",
                    resizeMode: "contain",
                    alignSelf: "center",
                  }}
                  source={require("../../../assets/businfo.png")}
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Roboto-Bold",
                    fontSize: 18,
                    fontWeight: "600",
                    top: -30,
                    color: "#000000",
                    textAlign: "center",
                  }}
                >
                  {i18n.t("BusinessIntro.text")}
                </Text>
                <Image
                  style={{
                    resizeMode: "contain",
                    alignSelf: "center",
                    marginTop: -20,
                  }}
                  source={require("../../../assets/hangouts.png")}
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Roboto-Regular",
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#000000",
                    marginHorizontal: 22,
                    lineHeight: 20,
                    textAlign: "center",
                  }}
                >
                  {i18n.t("BusinessIntro.textone")}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Roboto-Regular",
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#000000",
                    marginHorizontal: 22,
                    lineHeight: 20,
                    textAlign: "center",
                  }}
                >
                  {i18n.t("BusinessIntro.textthree")}
                </Text>
                <View style={styles.otpContainer}>
                  {otp &&
                    otp?.map((digit, index) => (
                      <TextInput
                        allowFontScaling={false}
                        key={index}
                        style={styles.otpInput}
                        maxLength={1}
                        keyboardType="default"
                        value={digit}
                        onChangeText={(value) =>
                          handleInputChange(index, value)
                        }
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === "Backspace") {
                            handleInputChange(index - 1, "");
                            otpInputRefs.current[index - 1]?.focus();
                          }
                        }}
                        ref={(ref) => (otpInputRefs.current[index] = ref)}
                      />
                    ))}
                </View>
                {error && (
                  <Text style={styles.errorText}>* OTP is required</Text>
                )}
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    {isKeyboardOpen ? null : (
                      <View
                        style={{
                          alignSelf: "center",
                          width: "45%",
                          marginBottom: 8,
                        }}
                      >
                        <LinearGradient
                          colors={["#338AFF", "#00EDB4"]}
                          style={styles.button}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1.2, y: 0.6 }}
                        >
                          <TouchableOpacity
                            onPress={handleGetBusinessDetails}
                            style={{
                              flex: 1,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            // disabled={!isOtpFilled}
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
                              {i18n.t("global.verify")}
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>
                    )}
                  </>
                )}

                {isKeyboardOpen ? null : (
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: "Roboto-Regular",
                      fontSize: 15,
                      fontWeight: "500",
                      color: "#000000",
                      textAlign: "center",
                      lineHeight: 20,
                      marginBottom: 5,
                      padding: 12,
                    }}
                  >
                    {i18n.t("BusinessIntro.texttwo")}
                  </Text>
                )}

                {isKeyboardOpen ? null : (
                  <View
                    style={{
                      alignSelf: "center",
                      width: "48%",
                    }}
                  >
                    <LinearGradient
                      colors={["#338AFF", "#00EDB4"]}
                      style={styles.button}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1.2, y: 0.6 }}
                    >
                      <TouchableOpacity
                        onPress={() => navigation.navigate("BusinesSearch")}
                        disabled={loading}
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <>
                          <Text
                            allowFontScaling={false}
                            style={{
                              fontSize: 18,
                              fontWeight: "bold",
                              fontFamily: "Inter-Regular",
                              color: "#fff",
                            }}
                          >
                            {i18n.t("global.createMyProfile")}
                          </Text>
                        </>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BusinessIntro;

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
  },
  button: {
    width: "100%",
    height: 43,
    borderRadius: 10,
    alignSelf: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 1.1,
    borderRadius: 10,
    backgroundColor: "#EDF5F4",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: 24,
    marginBottom: 13,
    overflow: "hidden",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 20,
  },
});
