import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

import VerifyTab from "../../../Component/VerifyTab";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import AuthServices from "../../../Services/authService";
// import { useAuth } from ".../../../Context/AuthContext";

import Toast from "react-native-toast-message";
import HoostaHeader from "../../../Component/HoostaHeader ";
import Loader from "../../../Component/Loader";
import { useAuth } from "../../../Context/AuthContext";
import i18n from "../../../Context/i18n";

const HoostaVerify = () => {
  const { user } = useAuth();
  const router = useRoute();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
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


  const handleInputChange = (index, value) => {
    if (!isNaN(value) && index >= 0 && index < otp.length) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < otp.length - 1 && value !== "") {
        otpInputRefs.current[index + 1]?.focus();
      }
    }

    if (value === "" && index >= 0) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === "Backspace" && index > 0 && !otp[index]) {
      otpInputRefs.current[index - 1].focus();
    } else if (index < 4 && key !== "Backspace" && otp[index]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handelSubmitNavigte = () => {
    setLoading(true);
    const otpString = otp.join("");

    if (!/^\d{6}$/.test(otpString) || !user?.user?.email) {
      Toast.show({
        type: "error",
        text1: "Please enter OTP",
        autoHide: true,
        visibilityTime: 5000,
      });
      setLoading(false);
      return;
    }

    const body = {
      email: user?.user?.email,
      verificationCode: otpString,
    };

    AuthServices.VerifyPhone(body)
      .then((res) => {
        console.log(res);
        if (res.message === "Phone number verified successfully") {
          navigation.navigate("HoostaScan", {
            hoostaId: router?.params?.hoostaId,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Invalid OTP",
            autoHide: true,
            visibilityTime: 5000,
          });
        }
        setLoading(false);
        setOtp(["", "", "", "", "", ""]);
        // setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        Toast.show({
          type: "error",
          text1: "Invalid OTP",
          autoHide: true,
          visibilityTime: 5000,
        });
        setLoading(false);
      });

    // navigation.navigate("Congratulations", {
    //   eventId: router?.params?.eventId,
    // });
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
            <HoostaHeader />
            <Text allowFontScaling={false} style={styles.headerText}>
              {i18n.t("global.verifyandPost")}
            </Text>
            <VerifyTab />
            <TouchableOpacity>
              <View style={styles.verifybox}>
                <Text allowFontScaling={false} style={styles.sendText}>
                  {i18n.t("global.sendVerification")}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.otpContainer}>
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
            </View>

            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
            >
              <TouchableOpacity
                // onPress={handelSubmitNavigte}
                onPress={handelSubmitNavigte}
                // disabled={isLoading}
                disabled={!/^\d{6}$/.test(otp.join("")) || isLoading}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isLoading ? (
                  <Loader />
                ) : (
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      fontFamily: "Inter-Regular",
                      color: "#fff",
                    }}
                  >
                    {i18n.t("global.postMeetUp")}
                  </Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginTop: 25,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  otpInput: {
    width: 47,
    height: 63,
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#EDF5F4",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: 24,
  },
  verifybox: {
    backgroundColor: "#7C7C7C",
    paddingVertical: 8,
    width: "66%",
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  sendText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    position: "absolute",
    bottom: 5,
  },
});

export default HoostaVerify;
