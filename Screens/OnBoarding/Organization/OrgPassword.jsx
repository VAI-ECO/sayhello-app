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
import AuthServices from "../../../Services/authService";
import OrganizationService from "../../../Services/OrganizationService";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { handleSignUp } from "../../../features/auth/authSlice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const OrgPassword = () => {
  // const router = useRoute();
  const dispatch = useDispatch();

  const OrganizationData = useSelector(
    (state) => state?.organization?.organizationData
  );
  console.log(OrganizationData?._id, "data org4");

  const navigation = useNavigation();
  const [results, setResults] = useState(null);
  const [password, setPassword] = useState("");
  const [VerifyPassword, setVerifyPassword] = useState("");
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
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      password: "",
      confirmpassword: "",
    },
  });

  const handelSignup = (values) => {
    if (values.confirmpassword !== values.password) {
      // Alert.alert("Passwords not same!", "Passwords does not match!");

      Toast.show({
        type: "error",
        text1: "Passwords not same",
        text1: "Passwords does not match",
        autoHide: true,
        visibilityTime: 5000,
      });

      return;
    }

    setIsLoading(true);

    // OrganizationService.getDetails(router?.params?.orgId)
    OrganizationService.getDetails(OrganizationData?._id)
      .then((response) => {
        console.log("Res of rog details: ", response);
        let body = {
          language: "en",
          firstname: response?.firstname,
          lastname: response?.lastname,
          user_type: "organization",
          phonenumber: response?.phone,
          email: response?.email,
          username: response?.name,
          password: values.password,
          parentReferal: "",
        };
        // AuthServices.SignUp(body)
        dispatch(handleSignUp(body))
          .then((response) => {
            const res = response?.payload;
            console.log("res of the user is: ", res);
            OrganizationService.assignUserID({
              // organizationId: router?.params?.orgId,
              organizationId: OrganizationData?._id,
              userId: res?.user?._id,
            })
              .then((res) => {
                // const res = response?.payload;

                console.log("res of the user2 is : ", res);

                navigation.navigate("OrgPhoto", {
                  // orgId: router?.params?.orgId,
                  // orgId: OrganizationData?._id,
                  // orgData: res,
                  password: values.password,
                });
                // navigation.navigate("OrgPhoto", {
                //   orgId: router?.params?.orgId,
                //   orgId: OrganizationData?._id,
                //   orgData: res,
                //   password: password,
                // });
                setPassword("");
                setVerifyPassword("");
                console.log("resssssss of assign userid: ", res);
                setIsLoading(false);
              })
              .catch((err) => {
                console.log("err of user id");
                setIsLoading(false);
              });
          })
          .catch((err) => {
            console.log("Error: ", err);
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
              source={require("../../../assets/orglogo.png")}
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
              {i18n.t("global.setOrganizationPassword")}
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
                {errors.confirmpassword && (
                  <Text style={styles.errorText}>
                    {errors.confirmpassword.message}
                  </Text>
                )}
              </KeyboardAvoidingView>
            </View>
            {/* <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Roboto-Regular",
                fontSize: 16,
                fontWeight: "400",
                color: "#888888",
                marginTop: 20,
                paddingHorizontal: 24,
                marginTop: 50,
                textAlign: "center",
              }}
            >
              Check your organization contact Email for verification code
            </Text> */}
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

export default OrgPassword;

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
