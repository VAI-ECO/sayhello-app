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
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import AuthServices from "../../../Services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppConfig from "../../../AppConfig";
import { useLocation } from "../../../Context/LocationContext";
import Toast from "react-native-toast-message";
import axios from "axios";
import BusinessService from "../../../Services/BusinessService";
import { MaterialIcons, AntDesign, Feather } from "@expo/vector-icons";
import Loader from "../../../Component/Loader";
import requests from "../../../Services/httpservice";
import { useDispatch, useSelector } from "react-redux";
import { handleSignUp } from "../../../features/auth/authSlice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const BusPassword = () => {
  const router = useRoute();
  const dispatch = useDispatch();

  const { location } = useLocation();
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [VerifyPassword, setVerifyPassword] = useState("");
  const [results, setResults] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const [verifyBusinessDetails, setVerifyBusinessDetails] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  useEffect(() => {
    const getBusinessDetailsFromLocalSorage = async () => {
      let result = await AsyncStorage.getItem(`VerifyBusinessDetails`);
      let parse_result = JSON.parse(result);
      setVerifyBusinessDetails(parse_result);
    };
    getBusinessDetailsFromLocalSorage();
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

  const validationSchema = Yup.object().shape({
    password: Yup.string().required("* Password is required"),
    confirmpassword: Yup.string().required("* Verify Password is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      password: "",
      confirmpassword: "",
    },
  });

  const handleNext = async (values) => {
    setLoading(true);
    if (values.password !== values.confirmpassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match!",
        autoHide: true,
        visibilityTime: 1000,
      });
      setLoading(false);
    } else {
      let name = verifyBusinessDetails?.businessDetails?.contactName.split(" ");
      let body = {
        language: "English",
        firstname: name[0],
        lastname: name[1],
        user_type: "business",
        phonenumber: verifyBusinessDetails?.businessDetails?.phone,
        email: verifyBusinessDetails?.businessDetails?.email,
        username: name[0] + " " + name[1],
        password: values.password,
        parentReferal: "",
      };

      // AuthServices.SignUp(body)
      dispatch(handleSignUp(body))
        .then(async (response) => {
          const res = response?.payload;

          console.log("signup response", res);
          message = res.message;
          console.log("response signup", res);
          if (message === "This email is already in use.") {
            console.log("helloooo------>");
            setLoading(false);
            setMessageText(message);
          } else if (message === "User registered successfully") {
            let body = {
              email: res.user?.email,
              latitude: location.coords.latitude || 0.0,
              longitude: location.coords.longitude || 0.0,
            };

            let bodSubmit = {
              userId: res.user?._id,
              businessId: verifyBusinessDetails?.businessDetails?.businessId,
            };

            await BusinessService.assignBusiness(bodSubmit)
              .then((res) => {
                console.log("REsdsd: ", res);
              })
              .catch((err) => {
                console.log("Error: ", err);
              });

            await requests
              .post(`${AppConfig.ApiUrl}api/v1/users/saveLocation`, body)
              .then((res) => console.log(res))
              .catch((err) => console.log(err));

            const user = res.user;
            AsyncStorage.setItem("user_info", JSON.stringify(user));
            console.log("==================>", router?.params?.businessId);

            navigation.navigate("BusOTP");
            // navigation.navigate("BusOTP", {
            //   orgData: res,
            //   businessId: router?.params?.businessId,
            // });
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log("==============>", err.message);
          Toast.show({
            type: "error",
            text1: "Something went wrong. Please try again later.",
            autoHide: true,
            visibilityTime: 1000,
          });
          setLoading(false);
        });
    }
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
          resizeMode="cover"
        >
          <View style={styles.container}>
            {/* <Header title="" /> */}
            <Image
              source={require("../../../assets/busniessicon.png")}
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
              {i18n.t("global.setPassword")}
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
                        placeholder={i18n.t("global.EnterPassword")}
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
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
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
                        placeholder={i18n.t("global.enterverifyPassword")}
                        style={styles.inputfieldinner}
                        secureTextEntry={true}
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
                {errors.confirmpassword && (
                  <Text style={styles.errorText}>
                    {errors.confirmpassword.message}
                  </Text>
                )}
              </KeyboardAvoidingView>
            </View>

            <>
              {isKeyboardOpen ? null : (
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.buton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={handleSubmit(handleNext)}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    // disabled={loading}
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
                      {loading ? <Loader /> : "Signup"}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BusPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
  },
  circlecontainer: {
    width: 85,
    height: 85,
    borderRadius: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
