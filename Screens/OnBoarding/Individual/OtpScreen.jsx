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
} from "react-native";
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Header from "../../../Component/Header";
import AuthServices from "../../../Services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../../Context/AuthContext";
import Toast from "react-native-toast-message";
import i18n from "../../../Context/i18n";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Loader from "../../../Component/Loader";

const OtpScreen = () => {
  const { user } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);
  const navigation = useNavigation();
  const [user_info, setUser_info] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isOtpFilled, setIsOtpFilled] = useState(false);
  const [error, setShowError] = useState(false);

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

  useEffect(() => {
    const filled = otp.every((d) => d !== "");
    setIsOtpFilled(filled);
    if (filled && error) {
      setShowError(false);
    }
  }, [otp]);

  // const handleInputChange = (index, value) => {
  //   if (!isNaN(value) && index < otp.length) {
  //     const newOtp = [...otp];
  //     newOtp[index] = value;
  //     setOtp(newOtp);
  //     setIsOtpFilled(newOtp.every((digit) => digit !== ""));
  //     if (index < otp.length - 1 && value !== "") {
  //       otpInputRefs.current[index + 1]?.focus();
  //     }
  //   }

  //   if (value === "" && index >= 0) {
  //     const newOtp = [...otp];
  //     newOtp[index] = value;
  //     setOtp(newOtp);

  //     if (index > 0) {
  //       otpInputRefs.current[index - 1]?.focus();
  //     }
  //   }
  // };

  const handleInputChange = (index, value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }
    if (digits.length > 1) {
      const newOtp = [...otp];
      const split = digits.split("").slice(0, otp.length - index);
      split.forEach((d, i) => {
        newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const next = Math.min(otp.length - 1, index + split.length);
      otpInputRefs.current[next]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digits;
    setOtp(newOtp);
    if (index < otp.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = () => {
    if (!isOtpFilled) {
      setShowError(true);
      return
    }
    setLoading(true);
    const otpString = otp.join("");

    const body = {
      email: user_info?.email,
      verificationCode: otpString,
    };

    console.log("bopdy", body)

    AuthServices.VerifyPhone(body)
      .then((res) => {
        console.log(res);
        if (res.message === "Phone number verified successfully") {
          navigation.navigate("CongratulationsIndividual");
        } else {
          Toast.show({
            type: "error",
            text1: "Invalid OTP",
            autoHide: true,
            visibilityTime: 5000,
          });
          setOtp(["", "", "", "", "", ""]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        console.log("dsadasdas");

        Toast.show({
          type: "error",
          text1: "Invalid OTP",
          autoHide: true,
          visibilityTime: 5000,
        });
        setOtp(["", "", "", "", "", ""]);
        setLoading(false);
      });
  };

  const handleSendAgaing = () => {
    let body = {
      email: user_info.email,
    };
    AuthServices.ResendSms(body)
      .then((res) => {
        console.log(res);
        Toast.show({
          type: "success",
          text1: res?.message,
          autoHide: true,
          visibilityTime: 5000,
        });
      })
      .catch((err) => {
        console.log(err);
        Toast.show({
          type: "error",
          text1: "Something went wrong!",
          autoHide: true,
          visibilityTime: 5000,
        });
      });
  };

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
          <View style={styles.container}>
            <Header title="" />
            <Image
              style={{
                // width: 130,
                // height: 120,
                width: wp("28%"),
                height: hp("10%"),
                resizeMode: "contain",
                alignSelf: "center",
              }}
              source={require("../../../assets/Say Hello.png")}
            />
            <View style={{ marginTop: 55 }}>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Regular",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginLeft: 26,
                  color: "#000000",
                  marginBottom: 10,
                }}
              >
                {i18n.t("global.verificationCode")}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Regular",
                  fontSize: 14,
                  fontWeight: "400",
                  marginHorizontal: 26,
                  color: "#666666",
                }}
              >
                {i18n.t("global.verificationCodeSent")}
              </Text>
            </View>
            {/* <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  allowFontScaling={false}
                  key={index}
                  style={styles.otpInput}
                  maxLength={1}
                  keyboardType="numeric"
                  value={digit}
                  onChangeText={(value) => handleInputChange(index, value)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace") {
                      handleInputChange(index - 1, "");
                      otpInputRefs.current[index - 1]?.focus();
                    }
                  }}
                  ref={(ref) => (otpInputRefs.current[index] = ref)}
                />
              ))}
            </View> */}
             <View style={styles.otpContainer}>
                          {otp.map((digit, index) => (
                            <TextInput
                              key={index}
                              style={styles.otpInput}
                              keyboardType="number-pad"
                              value={digit}
                              onChangeText={value => handleInputChange(index, value)}
                              onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === "Backspace" && !digit) {
                                  // if already empty, jump back
                                  otpInputRefs.current[Math.max(0, index - 1)]?.focus();
                                }
                              }}
                              ref={ref => (otpInputRefs.current[index] = ref)}
                            />
                          ))}
                        </View>
            {error && <Text style={styles.errorText}>* OTP is required</Text>}
            {isKeyboardOpen ? null : (
              <View
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 13,
                  width: "90%",
                }}
              >
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    // disabled={loading}

                    // disabled={otp.join("") === "" || loading}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader />
                      </>
                    ) : (
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
                          {i18n.t("global.submit")}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>

                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    top: -20,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: "Roboto-Regular",
                      fontSize: 14,
                      fontWeight: "400",
                      color: "#888888",
                    }}
                  >
                    {i18n.t("global.didntReceiveTheCode")}
                  </Text>
                  <TouchableOpacity onPress={() => handleSendAgaing()}>
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontFamily: "Roboto-Regular",
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#069FF8",
                      }}
                    >
                      {i18n.t("global.sendAgain")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  otpInput: {
    width: 50,
    height: 65,
    borderWidth: 1.2,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#EDF5F4",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: 24,
    overflow: "hidden",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 35,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
    marginLeft: 20
  },
});
