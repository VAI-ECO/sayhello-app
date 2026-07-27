import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  TextInput,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";

import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons, AntDesign, Feather } from "@expo/vector-icons";
import GroupService from "../../../Services/GroupService";
import AuthServices from "../../../Services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import i18n from "../../../Context/i18n";
import { handleSignUp } from "../../../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

const GroupPassword = () => {
  // const router = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const GroupData = useSelector((state) => state?.group?.groupData);
  console.log(GroupData?._id, "group data4");

  const [password, setPassword] = useState("");
  const [VerifyPassword, setVerifyPassword] = useState("");
  const [results, setResults] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    password: Yup.string().required("* Password is required"),
    confirmpassword: Yup.string().required("* Confirm Password is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      password: "",
      confirmpassword: ""
    },
  });

  const handelSignup = (values) => {

    if (values.confirmpassword !== values.password) {
      Toast.show({
        type: "error",
        text1: "Passwords not same!",
        text2: "Passwords does not match!",
        autoHide: true,
        visibilityTime: 5000,
      });
      return;
    }

    setIsLoading(true);

    // GroupService.getDetails(router?.params?.groupId)
    GroupService.getDetails(GroupData?._id)
      .then((response) => {
        console.log("Res of rog details: ", response);
        let bodyData = {
          language: "en",
          firstname: response?.firstname,
          lastname: response?.lastname,
          user_type: "group",
          phonenumber: response?.phone,
          email: response?.email,
          username: response?.name,
          password: values.password,
          parentReferal: "",
        };
        // AuthServices.SignUp(bodyData)
        dispatch(handleSignUp(bodyData))
          .then(async (response) => {
            const res = response?.payload;
            console.log("aaaa: ", res);
            await AsyncStorage.setItem("user_info", JSON.stringify(res));
            GroupService.assignUserID({
              // groupId: router?.params?.groupId,
              groupId: GroupData?._id,
              userId: res?.user?._id,
            })
              .then((res) => {
                navigation.navigate("GroupImage",{
                    password: password,
                  }
                );
                // navigation.navigate("GroupImage", {
                //   groupId: router?.params?.groupId,
                // });
                setIsLoading(false);
                setPassword("");
                setVerifyPassword("");

                console.log("resssssss of assign userid: ", res);
              })
              .catch((err) => {
                console.log("err of user id");
                setIsLoading(false);
              });
          })
          .catch((err) => {
            console.log("Error in signuop: ", err);
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.log("Error of getdetails: ", err);
        setIsLoading(false);
      });
  };

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
          resizeMode="cover"
        >
          <View style={styles.container}>
            {/* <Header title="" /> */}
            <Image
              source={require("../../../assets/Group.png")}
              style={styles.orglogo}
              resizeMode="contain"
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Roboto-Bold",
                fontSize: 17,
                fontWeight: "400",
                color: "#000000",
                marginTop: 20,
                paddingHorizontal: 20,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {i18n.t("global.groupsetPassword")}
            </Text>
            <View style={{ paddingTop: 10, paddingHorizontal: 22 }}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    marginBottom: 5,
                    color: "#000",
                    fontWeight: "600",
                    fontSize: 16,
                    fontFamily: "Roboto-Regular",
                  }}
                >
                  {i18n.t("global.password")}
                </Text>
                <View style={styles.inputField}>
                  <AntDesign name="lock" size={26} color="#3C2828" />
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder="Enter Password"
                        style={styles.inputfieldinner}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!isPasswordVisible}
                        placeholderTextColor="#3C2828"
                      />
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Feather
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={24}
                      color="#3C2828"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
              </KeyboardAvoidingView>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    marginBottom: 5,
                    color: "#000",
                    fontWeight: "600",
                    fontSize: 16,
                    fontFamily: "Roboto-Regular",
                  }}
                >
                  {i18n.t("global.verifyPassword")}
                </Text>
                <View style={styles.inputField}>
                  <AntDesign name="lock" size={26} color="#3C2828" />
                  <Controller
                    control={control}
                    name="confirmpassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder="Enter Verify Passwor"
                        style={styles.inputfieldinner}
                        secureTextEntry={!isPasswordVisible}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholderTextColor="#3C2828"
                      />
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Feather
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={24}
                      color="#3C2828"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmpassword && <Text style={styles.errorText}>{errors.confirmpassword.message}</Text>}
              </KeyboardAvoidingView>
            </View>

            {isLoading ? (
              <Loader />
            ) : (
              <>
                {isKeyboardOpen ? null : (
                  <LinearGradient
                    colors={["#338AFF", "#00EDB4"]}
                    style={styles.buton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.2, y: 0.6 }}
                  >
                    <TouchableOpacity
                      onPress={handleSubmit(handelSignup)}
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
                        {i18n.t("global.submit")}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                )}
              </>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default GroupPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
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
    borderWidth: 1.1,
    paddingRight: 10,
  },
  inputfieldinner: {
    flex: 1,
    height: 55,
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    fontSize: 16,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#3C2828",
    paddingLeft: 10,
  },

  buton: {
    width: "90%",
    height: 50,
    borderRadius: 6,
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
  },
  textbtn: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 5,
  },
});
