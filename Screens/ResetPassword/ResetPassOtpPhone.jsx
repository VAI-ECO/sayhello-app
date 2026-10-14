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
import Header from "../../Component/Header";
import Loader from "../../Component/Loader";
import i18n from "../../Context/i18n";

const ResetPassOtpPhone = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
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
        >
          <View style={styles.container}>
            <Header title="" />
            <Image
              style={{
                width: 130,
                height: 100,
                resizeMode: "contain",
                alignSelf: "center",
              }}
              source={require("../../assets/Say Hello.png")}
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
                  fontSize: 16,
                  fontWeight: "400",
                  marginHorizontal: 26,
                  color: "#666666",
                }}
              >
                {i18n.t("global.verificationCodeSent")}
              </Text>
            </View>
      
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
            {isKeyboardOpen ? null : (
              <View
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 5,
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
                    onPress={() => navigation.navigate("ChangePass")}
                    disabled={loading}
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
                  <TouchableOpacity>
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

export default ResetPassOtpPhone;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    // backgroundColor: "red",
  },
  otpInput: {
    width: 50,
    height: 65,
    borderWidth: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#EDF5F4",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: 24,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
});
