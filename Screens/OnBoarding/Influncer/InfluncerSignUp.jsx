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
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AuthServices from "../../../Services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useLocation } from "../../../Context/LocationContext";
import AppConfig from "../../../AppConfig";
import CustomePhoneInput from "../../../Component/CustomePhoneInput";
import Loader from "../../../Component/Loader";
import requests from "../../../Services/httpservice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const InfluncerSignUp = () => {
  const [loading, setLoading] = useState(false);
  const { location } = useLocation();
  const navigation = useNavigation();
  const [language, setLanguage] = useState(null);
  // Refs for each input field
  const lastNameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("selected_language");

      if (value !== null) {
        const trimmedValue = value.trim().replace(/^"(.*)"$/, "$1");
        setLanguage(trimmedValue);
      }
    } catch (e) {
      console.log("Error reading selected_language from AsyncStorage:", e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("* First name is required"),
    lastname: Yup.string().required("* Last name is required"),
    phone_number: Yup.string()
      .required("* Phone number is required")
      .min(12, "Phone number must be at least 10 digits"),
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
    },
  });

  const handleSignUp = async (values) => {
    console.log("values", values);
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

    let body = {
      ...values,
      language,
      user_type: "influencer",
      phonenumber: values.phone_number,
      parentReferal: "",
    };

    AuthServices.IndividualSignUp(body)
      .then(async (res) => {
        console.log("response signup", res);
        const user = res.user;
        const message = res.message;
        // await AsyncStorage.setItem("authToken",JSON.stringify(res.token));

        if (message === "This email is already in use.") {
          setLoading(false);
          Toast.show({ type: "error", text1: message });
        } else if (message === "User registered successfully") {
          let body = {
            email: res.user?.email,
            latitude: location?.coords?.latitude,
            longitude: location?.coords?.longitude,
          };

          await requests
            .post(`${AppConfig.ApiUrl}api/v1/users/saveLocation`, body)
            .then(async (res) => {
              console.log(res);
              console.log("User registered successfully", user);
              await AsyncStorage.setItem("user_info", JSON.stringify(user));
              navigation.navigate("InfluncerOtpScreen");
              setLoading(false);
            })
            .catch((err) => {
              console.log("saveLocation error", err);
              setLoading(false);
            });
        }
      })
      .catch((err) => {
        console.log(err);
        Toast.show({
          type: "error",
          text1: err.message,
          autoHide: true,
          visibilityTime: 5000,
        });
        setLoading(false);
      });
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
                <LinearGradient
                  colors={["#A033FF", "#CCCCCC"]}
                  style={styles.circlecontainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image
                    style={styles.image}
                    source={require("../../../assets/inflincer.png")}
                  />
                </LinearGradient>

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
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder={i18n.t("global.enterfirstname")}
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
                    <Text style={styles.errorText}>{errors.name.message}</Text>
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
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder={i18n.t("global.enterlastname")}
                          placeholderTextColor="#3C2828"
                          returnKeyType="next"
                          ref={lastNameInputRef}
                          onSubmitEditing={() => emailInputRef.current?.focus()}
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
                    {" "}
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
                        placeholder={i18n.t("global.enterphonenumber")}
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
                          placeholder={i18n.t("global.enterEmail")}
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
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </View>

                <View style={styles.inputField}>
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.username")}
                  </Text>
                  <View style={styles.inputContainer}>
                    <AntDesign name="idcard" size={26} color="#3C2828" />
                    <Controller
                      control={control}
                      name="username"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          allowFontScaling={false}
                          style={styles.input}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                          placeholder={i18n.t("global.Enterusername")}
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
                          placeholder={i18n.t("global.EnterPassword")}
                          placeholderTextColor="#3C2828"
                          secureTextEntry={true}
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
              </ScrollView>

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
                  >
                    <Text allowFontScaling={false} style={styles.buttonText}>
                      {loading ? <Loader /> : "Signup"}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ImageBackground>
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
    paddingTop: 55,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
  },
  inputField: {
    marginBottom: 5,
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
    paddingHorizontal: 12,
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
    color: "red",
    fontSize: 14,
    marginTop: 5,
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
});

export default InfluncerSignUp;
