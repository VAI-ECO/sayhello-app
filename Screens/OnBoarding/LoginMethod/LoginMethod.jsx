import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
  Button,
  ScrollView,
} from "react-native";
import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, AntDesign, Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../Context/AuthContext";
import Checkbox from "expo-checkbox";
import { LanguageContext } from "../../../Context/LanguageContext";
import i18n from "../../../Context/i18n";
import Loader from "../../../Component/Loader";
import CustomText from "../../../Component/CustomText";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import Fontisto from "@expo/vector-icons/Fontisto";
import CountryLanguageModal from "../../../Component/CountryLanguageModal";

const LoginMethod = () => {
  const { changeLanguage } = useContext(LanguageContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();
  const [rememberMe, setRememberMe] = useState(false);
  const { user, signIn } = useAuth();

  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const passwordInputRef = useRef(null);

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
    email: Yup.string()
      .required("* Email is required")
      .email("* Invalid email"),
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
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const signedIn = await signIn(values.email, values.password);
      // await getData();
      if (signedIn?.user?._id) {
        Toast.show({
          type: "success",
          text1: "Welcome 👋",
          autoHide: true,
          visibilityTime: 1000,
        });
        // setPassword("");
        // setEmail("");
        setLoading(false);

        // AuthProvider switches the root navigator after persisting the session.
      }
    } catch (error) {
      // setPassword("");
      // setEmail("");
      Toast.show({
        type: "error",
        text1: "Incorrect Email and Password",
        autoHide: true,
        // visibilityTime: 1000,
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleCountryLanguageSelect = (country, language) => {
    console.log("Selected:", country, language);
    changeLanguage(language.toLowerCase());
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
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  style={styles.image}
                  source={require("../../../assets/logo.png")}
                />

                <TouchableOpacity
                  onPress={handleOpenModal}
                  style={styles.iconWrapper}
                >
                  <Fontisto name="world" size={35} color="black" />
                </TouchableOpacity>

                <CountryLanguageModal
                  visible={isModalVisible}
                  onClose={handleCloseModal}
                  onSelect={handleCountryLanguageSelect}
                />
              </View>
              <CustomText
                allowFontScaling={false}
                style={{
                  fontSize: 26,
                  color: "#000000",
                  fontWeight: "400",
                  fontFamily: "Inter-Regular",
                  textAlign: "center",
                  marginBottom: 15,
                }}
              >
                {i18n.t("global.loginWithEmail")}
              </CustomText>
              {/* <Button
              title="Switch to English"
              onPress={() => changeLanguage("en")}
            />
            <Button
              title="Switch to Spanish"
              onPress={() => changeLanguage("es")}
            /> */}
              <View>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "padding"}
                >
                  <View style={styles.inputField}>
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
                          placeholder="Enter email address"
                          style={styles.inputfieldinner}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="email-address"
                          autoCompleteType="email"
                          placeholderTextColor="#3C2828"
                          onSubmitEditing={() =>
                            passwordInputRef.current &&
                            passwordInputRef.current.focus()
                          }
                        />
                      )}
                    />
                  </View>
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </KeyboardAvoidingView>
              </View>
              <View>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "padding"}
                >
                  <View style={styles.inputField}>
                    <AntDesign name="lock" size={26} color="#3C2828" />
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          allowFontScaling={false}
                          placeholder="Enter password"
                          style={styles.inputfieldinner}
                          secureTextEntry={!isPasswordVisible}
                          onBlur={onBlur}
                          value={value}
                          onChangeText={onChange}
                          placeholderTextColor="#3C2828"
                          ref={passwordInputRef}
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
              </View>
              <View
                style={{
                  alignSelf: "center",
                  width: "100%",
                  marginTop: 5,
                  marginBottom: 5,
                }}
              >
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={handleSubmit(handleLogin)}
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
                      {loading ? <Loader /> : "LogIn"}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
              <View
                style={{
                  alignSelf: "center",
                  width: "100%",
                  marginTop: 5,
                  marginBottom: 5,
                }}
              >
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Selectedlanguage")}
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
                      {i18n.t("global.signUp")}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 15,
                  marginBottom: 15,
                  marginHorizontal: 5,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Checkbox
                    style={{
                      borderRadius: 4,
                      borderColor: "#00EDB4",
                      marginRight: 3,
                      width: 18,
                      height: 18,
                    }}
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    color={rememberMe ? "#338AFF" : undefined}
                  />
                  <TouchableWithoutFeedback
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: "#707070",
                        fontWeight: "400",
                        fontSize: 15,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {i18n.t("global.rememberMe")}
                    </Text>
                  </TouchableWithoutFeedback>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("ResetPassword");
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: "#707070",
                      fontWeight: "400",
                      fontSize: 15,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    {i18n.t("global.forgotpassword")}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* <Text
                allowFontScaling={false}
                style={{
                  fontSize: 26,
                  color: "#000000",
                  fontWeight: "400",
                  fontFamily: "Inter-Regular",
                  textAlign: "center",
                }}
              >
                OR
              </Text> */}
              {/* <TouchableOpacity
              style={{ marginTop: 15, width: "100%" }}
              // onPress={SignInGoogle}
            >
              <View style={styles.googlecontainer}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <View style={styles.googleinercontainer}>
                    <View style={styles.appleinercontainer}>
                      <Image
                        style={{ resizeMode: "cover", width: 25, height: 25 }}
                        source={require("../../../assets/google.png")}
                      />
                    </View>
                  </View>
                  <Text allowFontScaling={false}
                    style={{
                      paddingLeft: 30,
                      fontSize: 18,
                      color: "#000000",
                      fontWeight: "bold",
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    Login with Google
                  </Text>
                </View>
              </View>
            </TouchableOpacity> */}
              <View
                style={{
                  paddingTop: 60,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 18,
                    color: "#6C6C6C",
                    fontFamily: "Inter-Regular",
                    fontWeight: "400",
                  }}
                >
                  {i18n.t("global.dontthaveanaccount")}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Selectedlanguage")}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 20,
                      color: "#000000",
                      fontWeight: "bold",
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    {i18n.t("global.signUp")}
                  </Text>
                </TouchableOpacity>
              </View>
              {!isKeyboardOpen && (
                <View
                  style={{
                    marginTop: "auto",
                    textAlign: "center",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#000000",
                        fontWeight: "400",
                        fontFamily: "Inter-Regular",
                        textAlign: "center",
                      }}
                    >
                      {i18n.t("global.byprocedding")}{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Linking.openURL(
                          `https://www.sayhello.world/privacy-policy`
                        );
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#338AFF",
                          fontWeight: "400",
                          fontFamily: "Inter-Regular",
                          textAlign: "center",
                          textDecorationLine: "underline",
                          textDecorationColor: "#338AFF",
                        }}
                      >
                        {i18n.t("global.privacyPolicy")}
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#000000",
                        fontWeight: "400",
                        fontFamily: "Inter-Regular",
                        textAlign: "center",
                      }}
                    >
                      {" "}
                      and{" "}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL(
                        `https://www.sayhello.world/terms-and-condition`
                      );
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#338AFF",
                        fontWeight: "400",
                        fontFamily: "Inter-Regular",
                        textAlign: "center",
                        textDecorationLine: "underline",
                        textDecorationColor: "#338AFF",
                        marginBottom: 25,
                      }}
                    >
                      {i18n.t("global.termsAndConditions")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LoginMethod;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
  },
  image: {
    width: 200,
    height: 150,
    top: 70,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 90,
  },
  phoneemailcontainer: {
    backgroundColor: "#01569E",
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  googlecontainer: {
    padding: 9,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  googleinercontainer: {
    backgroundColor: "#fff",
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  applecontainer: {
    padding: 9,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  appleinercontainer: {
    backgroundColor: "#CCCCCC",
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  inputField: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    marginBottom: 15,
    alignSelf: "center",
    alignItems: "center",
    paddingLeft: 13,
    borderWidth: 1,
    borderColor: "#000000",
    paddingRight: 10,
  },
  inputfieldinner: {
    flex: 1,
    height: 59,
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
    height: 58,
    borderRadius: 10,
    alignSelf: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
  },
  iconWrapper: {
    position: "absolute",
    top: 50,
    right: "1%",
  },
});
