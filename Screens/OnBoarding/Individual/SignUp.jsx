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
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AuthServices from "../../../Services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useLocation } from "../../../Context/LocationContext";
import AppConfig from "../../../AppConfig";
import CustomePhoneInput from "../../../Component/CustomePhoneInput";
import { BackHandler, Platform } from "react-native";
import i18n from "../../../Context/i18n";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Loader from "../../../Component/Loader";
import requests from "../../../Services/httpservice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useRoute } from "@react-navigation/native";

const SignUp = () => {
  const route = useRoute();

  // console.log(route?.params?.screen,"codes");

  const [loading, setLoading] = useState(false);
  const { location } = useLocation();
  const navigation = useNavigation();
  const [referalCode, setReferalCode] = useState("");
  const [language, setLanguage] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (Platform.OS === "android") {
        return false;
      } else {
        navigation.goBack();
        return true;
      }
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
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

  // Refs for each input field
  const lastNameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const value = await AsyncStorage.getItem("selected_language");
        if (value) {
          const trimmedValue = value.trim().replace(/^"(.*)"$/, "$1");
          setLanguage(trimmedValue);
        }
      } catch (e) {
        console.error("Error reading selected_language:", e);
      }
    };
    fetchData();
  }, []);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("* First name is required"),
    lastname: Yup.string().required("* Last name is required"),
    phone_number: Yup.string()
      .required("* Phone number is required")
      .matches(
        /^\+\d{1,4}\d{10}$/,
        "* Phone number must include a country code and be 10 digits long"
      ),
    // .min(12, "* Phone number must be at least 10 digits"),
    email: Yup.string().email("Invalid email").required("* Email is required"),
    username: Yup.string().required("* Username is required"),
    password: Yup.string().required("* Password is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      name: "",
      lastname: "",
      phone_number: "",
      email: "",
      username: "",
      password: "",
      referalCode: route?.params?.screen || "",
      // referalCode: "",
    },
  });

  const handleSignUp = async (values) => {
    console.log("values --->", values);
    Keyboard.dismiss();
    setLoading(true);

    if (!language) {
      Toast.show({
        type: "error",
        text1: "Please select a language!",
        autoHide: true,
        visibilityTime: 5000,
      });
      setLoading(false);
      return;
    }

    const body = {
      ...values,
      language,
      user_type: "individual",
      phonenumber: values.phone_number,
      parentReferal: values.referalCode,
    };

    try {
      const res = await AuthServices.IndividualSignUp(body);
      console.log("signup sceen res", res);
      const { user, message, token } = res;

      // await AsyncStorage.setItem("authToken", JSON.stringify(token));
      const locationBody = {
        email: user?.email,
        latitude: location?.coords?.latitude,
        longitude: location?.coords?.longitude,
      };
      await requests.post(
        `${AppConfig.ApiUrl}api/v1/users/saveLocation`,
        locationBody
      );
      await AsyncStorage.setItem("user_info", JSON.stringify(user));
      navigation.navigate("OtpScreen");
      setLoading(false);
    } catch (err) {
      console.error("Full error:", err);
      console.error("Response data:", err?.response?.data);
      // console.error("Error while sign up", err.response.data.message);
      Toast.show({
        type: "error",
        text1:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
        autoHide: true,
        visibilityTime: 5000,
      });
      setLoading(false);
    }
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            style={{ flex: 1 }}
          >
            <View style={styles.contentContainer}>
              {/* <Header title="Signup" /> */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  style={styles.image}
                  source={require("../../../assets/signuplog.png")}
                />
                <>
                  <View style={styles.inputField}>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.firstName")}
                    </Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="person-circle-sharp"
                        size={26}
                        color="#3C2828"
                      />
                      <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            placeholder="Enter first name"
                            placeholderTextColor="#3C2828"
                            returnKeyType="next"
                            onSubmitEditing={() =>
                              lastNameInputRef.current?.focus()
                            }
                          />
                        )}
                      />
                    </View>
                    {errors.name && (
                      <Text style={styles.errorText}>
                        {errors.name.message}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputField}>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.lastName")}
                    </Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="person-circle-sharp"
                        size={26}
                        color="#3C2828"
                      />
                      <Controller
                        control={control}
                        name="lastname"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            placeholder="Enter last name"
                            placeholderTextColor="#3C2828"
                            returnKeyType="next"
                            ref={lastNameInputRef}
                            onSubmitEditing={() =>
                              emailInputRef.current?.focus()
                            }
                          />
                        )}
                      />
                    </View>
                    {errors.lastname && (
                      <Text style={styles.errorText}>
                        {errors.lastname.message}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputField}>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.phoneNumber")}
                    </Text>
                    <Controller
                      control={control}
                      name="phone_number"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomePhoneInput
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                          placeholder="Enter phone number"
                          placeholderTextColor="#3C2828"
                          editable={true}
                        />
                      )}
                    />
                    {errors.phone_number && (
                      <Text style={styles.errorText}>
                        {errors.phone_number.message}
                      </Text>
                    )}
                  </View>

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
                      <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            placeholder="Enter email"
                            style={styles.input}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor="#7C7C7C"
                          />
                        )}
                      />
                    </View>
                    {errors.email && (
                      <Text style={styles.errorText}>
                        {errors.email.message}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputField}>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.username")}
                    </Text>
                    <View style={styles.inputContainer}>
                      <AntDesign name="idcard" size={24} color="#3C2828" />
                      <Controller
                        control={control}
                        name="username"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            style={styles.input}
                            allowFontScaling={false}
                            placeholder=" Enter username"
                            placeholderTextColor="#3C2828"
                            returnKeyType="next"
                            ref={usernameInputRef}
                            onSubmitEditing={() =>
                              passwordInputRef.current?.focus()
                            }
                          />
                        )}
                      />
                    </View>
                    {errors.username && (
                      <Text style={styles.errorText}>
                        {errors.username.message}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputField}>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.referralCodeOptional")}
                    </Text>
                    <View style={styles.inputContainer}>
                      <AntDesign name="codesquareo" size={24} color="#3C2828" />
                      <Controller
                        control={control}
                        name="referalCode"
                        defaultValue={referalCode}
                        render={({ field }) => (
                          <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            value={field.value}
                            onChangeText={
                              field.onChange
                              // (text) => {
                              //   setReferalCode(text)
                              //   onChange()
                              // }
                            }
                            onBlur={field.onBlur}
                            placeholder="Enter referal code"
                            placeholderTextColor="#3C2828"
                            returnKeyType="next"
                          />
                        )}
                      />
                    </View>
                    {errors.referalCode && (
                      <Text style={styles.errorText}>
                        {errors.referalCode.message}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputField}>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.password")}
                    </Text>
                    <View style={styles.inputContainer}>
                      <AntDesign name="lock" size={26} color="#3C2828" />
                      <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            secureTextEntry={true}
                            placeholder="Enter password"
                            placeholderTextColor="#3C2828"
                            returnKeyType="done"
                            ref={passwordInputRef}
                          />
                        )}
                      />
                    </View>
                    {errors.password && (
                      <Text style={styles.errorText}>
                        {errors.password.message}
                      </Text>
                    )}
                  </View>
                </>
              </ScrollView>
              {isKeyboardOpen ? null : (
                <View style={styles.buttonContainer}>
                  <LinearGradient
                    colors={["#338AFF", "#00EDB4"]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.2, y: 0.6 }}
                  >
                    <TouchableOpacity
                      onPress={handleSubmit(handleSignUp)}
                      disabled={loading}
                      style={styles.buttonTouchable}
                      type="submit"
                    >
                      <Text allowFontScaling={false} style={styles.buttonText}>
                        {loading ? <Loader /> : "Signup"}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ImageBackground>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
    paddingTop: 45,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    width: wp("28%"),
    height: hp("8.5%"),
    // width: 90,
    // height: 80,
  },
  inputField: {
    marginBottom: 5,
    // backgroundColor: 'black'
  },
  label: {
    marginBottom: 5,
    color: "#707070",
    fontWeight: "400",
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 11,
  },
  input: {
    flex: 1,
    height: 55,
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    fontSize: 15,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#3C2828",
    paddingLeft: 13,
    overflow: "hidden",
  },

  buttonContainer: {
    alignItems: "center",
    marginBottom: 20,
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
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "purple",
    fontSize: 14,
    marginTop: 5,
  },
});

export default SignUp;
