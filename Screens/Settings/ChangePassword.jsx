import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  ImageBackground,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../../Component/Header";
import { useAuth } from "../../Context/AuthContext";
import userService from "../../Services/userService";
import Loader from "../../Component/Loader";
import i18n from "../../Context/i18n";

const ChangePassword = () => {
  const { user, signOut } = useAuth();

  const [newpassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handelChangePass = () => {
    if (newpassword !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Please make sure the passwords match."
      );
      return;
    }
    setLoading(true);
    let bodys = {
      email: user?.user?.email,
      oldPassword: oldPassword,
      newPassword: newpassword,
    };

    userService
      .changePassword(bodys)
      .then((res) => {
        console.log("password changed");
        setLoading(false);
        signOut();
      })
      .catch((err) => {
        setLoading(false);
        console.log("error in change passowrd: ", err);
      });
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ImageBackground
          source={require("../../assets/imagebackgroung.jpg")}
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
            <View style={{ paddingTop: 30, paddingHorizontal: 22 }}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
              >
                <Text
                  style={{
                    marginBottom: 6,
                    color: "#707070",
                    fontWeight: "400",
                    fontSize: 17,
                    fontFamily: "Inter-Regular",
                  }}
                >
                  {i18n.t("global.currentPassword")}
                </Text>
                <View style={styles.inputField}>
                  <AntDesign name="lock" size={26} color="#3C2828" />
                  <TextInput
                    placeholder={i18n.t("global.entercurrentpassword")}
                    style={styles.inputfieldinner}
                    secureTextEntry={true}
                    value={oldPassword}
                    onChangeText={(text) => setOldPassword(text)}
                    placeholderTextColor="#3C2828"
                  />
                </View>
              </KeyboardAvoidingView>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
              >
                <Text
                  style={{
                    marginBottom: 6,
                    color: "#707070",
                    fontWeight: "400",
                    fontSize: 17,
                    fontFamily: "Inter-Regular",
                  }}
                >
                  {i18n.t("global.newPassword")}
                </Text>
                <View style={styles.inputField}>
                  <AntDesign name="lock" size={26} color="#3C2828" />
                  <TextInput
                    placeholder={i18n.t("global.enternewpassword")}
                    style={styles.inputfieldinner}
                    value={newpassword}
                    secureTextEntry={true}
                    onChangeText={(text) => setPassword(text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoCompleteType="email"
                    placeholderTextColor="#3C2828"
                  />
                </View>
              </KeyboardAvoidingView>

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
              >
                <Text
                  style={{
                    marginBottom: 6,
                    color: "#707070",
                    fontWeight: "400",
                    fontSize: 17,
                    fontFamily: "Inter-Regular",
                  }}
                >
                  {i18n.t("global.ConfrimPassword")}
                </Text>
                <View style={styles.inputField}>
                  <AntDesign name="lock" size={26} color="#3C2828" />
                  <TextInput
                    placeholder={i18n.t("global.enterconfirmpassword")}
                    style={styles.inputfieldinner}
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={(text) => setConfirmPassword(text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoCompleteType="email"
                    placeholderTextColor="#3C2828"
                  />
                </View>
              </KeyboardAvoidingView>
            </View>
            {isKeyboardOpen ? null : (
              <View
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 10,
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
                    onPress={handelChangePass}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        fontFamily: "Inter-Regular",
                        color: "#fff",
                      }}
                    >
                      {loading ? <Loader /> : "Change Password"}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  inputField: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    marginBottom: 18,
    alignSelf: "center",
    alignItems: "center",
    paddingLeft: 13,
  },
  inputfieldinner: {
    flex: 1,
    height: 62,
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    fontSize: 16,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#3C2828",
    paddingLeft: 10,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
  },
});
