import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  TextInput,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

import { MaterialIcons, Entypo } from "@expo/vector-icons";
import BusinessService from "../../../Services/BusinessService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Entypo";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const BusinesName = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [titleSecond, setTitleSecond] = useState("");
  const [firstNameSecond, setFirstNameSecond] = useState("");
  const [lastNameSecond, setLastnameSecond] = useState("");
  const [emailSecond, setEmailSecond] = useState("");

  const [businessDetails, setBusinessDetails] = useState(null);

  const [storeBusinessDetails, setStoreBusinessDetails] = useState(null);

  useEffect(() => {
    const getStoreBusinessDetails = async () => {
      let result = await AsyncStorage.getItem("BusinessDetails");
      let parse_result = JSON.parse(result);

      // setData(parse_result?.description);
      setTitle(parse_result?.contacts[0]?.title);
      setFirstName(parse_result?.contacts[0]?.firstname);
      setLastname(parse_result?.contacts[0]?.lastname);
      setEmail(parse_result?.contacts[0]?.email);
      setTitleSecond(parse_result?.contacts[1]?.title);
      setFirstNameSecond(parse_result?.contacts[1]?.firstname);
      setLastnameSecond(parse_result?.contacts[1]?.lastname);
      setEmailSecond(parse_result?.contacts[1]?.email);

      setStoreBusinessDetails(parse_result);
    };

    getStoreBusinessDetails();
  }, []);

  useEffect(() => {
    const getBusinessDetailsFromLocalSorage = async () => {
      let result = await AsyncStorage.getItem(`BusinessCatagory`);

      setBusinessDetails(JSON.parse(result));
    };
    getBusinessDetailsFromLocalSorage();
  }, []);

  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidEmailTwo, setIsValidEmailTwo] = useState(true);

  // Email validation function
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setIsValidEmail(validateEmail(text));
  };
  const handleEmailChangeTwo = (text) => {
    setEmailSecond(text);
    setIsValidEmailTwo(validateEmail(text));
  };

  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
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

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const validationSchema = Yup.object().shape({
    firstname: Yup.string().required("* First name is required"),
    lastname: Yup.string().required("* Last name is required"),
    title: Yup.string().required("* Title is required"),
    email: Yup.string()
      .required("* Email is required")
      .email("* Invalid email"),
    firstnameSecond: Yup.string().required("* First name is required"),
    lastnameSecond: Yup.string().required("* Last name is required"),
    titleSecond: Yup.string().required("* Title is required"),
    emailSecond: Yup.string()
      .required("* Email is required")
      .email("* Invalid email"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      firstname: "",
      lastname: "",
      title: "",
      email: "",
      firstnameSecond: "",
      lastnameSecond: "",
      titleSecond: "",
      emailSecond: "",
    },
  });

  const handleNext = (values) => {
    setIsLoading(true);

    try {
      let body = {
        contacts: [
          {
            firstname: values.firstname,
            lastname: values.lastname,
            title: values.title,
            email: values.email,
          },
          {
            firstname: values.firstnameSecond,
            lastname: values.lastnameSecond,
            title: values.titleSecond,
            email: values.emailSecond,
          },
        ],
      };

      console.log("body ---->", body);

      BusinessService.CreateBusinessService(businessDetails?.businessId, body)
        .then((res) => {
          console.log("Business Persons added successfully!");
          navigation.navigate("BusinesSummary");
          setIsLoading(false);
        })
        .catch((err) => console.log("Error: ", err));
    } catch (error) {
      console.log("Error in submitting the form", error);
      setIsLoading(false);
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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={styles.container}>
                {/* <Header title="" /> */}
                <Image
                  source={require("../../../assets/busniessicon.png")}
                  style={styles.orglogo}
                  resizeMode="contain"
                />
                <View style={styles.formContainer}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: "Roboto-Bold",
                      fontSize: 17,
                      fontWeight: "400",
                      color: "#000000",
                      marginTop: 10,
                      marginBottom: 8,
                      marginHorizontal: 10,
                    }}
                  >
                    {i18n.t("global.hangoutContact")}
                  </Text>
                  <View style={styles.formContainer}>
                    <View style={styles.row}>
                      <View style={styles.column}>
                        <Text allowFontScaling={false} style={styles.label}>
                          {i18n.t("global.firstName")}
                        </Text>
                        <Controller
                          control={control}
                          name="firstname"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              allowFontScaling={false}
                              placeholder={i18n.t("global.enterfirstname")}
                              style={styles.inputField}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              autoCorrect={false}
                              placeholderTextColor="#7C7C7C"
                            />
                          )}
                        />
                        {errors.firstname && (
                          <Text style={styles.errorText}>
                            {errors.firstname.message}
                          </Text>
                        )}
                      </View>
                      <View style={styles.column}>
                        <Text allowFontScaling={false} style={styles.label}>
                          {i18n.t("global.lastName")}
                        </Text>
                        <Controller
                          control={control}
                          name="lastname"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              allowFontScaling={false}
                              placeholder={i18n.t("global.enterlastname")}
                              style={styles.inputField}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholderTextColor="#7C7C7C"
                            />
                          )}
                        />
                        {errors.lastname && (
                          <Text style={styles.errorText}>
                            {errors.lastname.message}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.title")}
                    </Text>
                    <Controller
                      control={control}
                      name="title"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          allowFontScaling={false}
                          placeholder={i18n.t("global.EnterTitle")}
                          style={styles.inputField}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor="#7C7C7C"
                        />
                      )}
                    />
                    {errors.title && (
                      <Text style={styles.errorText}>
                        {errors.title.message}
                      </Text>
                    )}
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.email")}
                    </Text>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          allowFontScaling={false}
                          placeholder={i18n.t("global.enterEmail")}
                          style={[
                            styles.inputField,
                            !isValidEmail && styles.inputError,
                          ]}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor="#7C7C7C"
                        />
                      )}
                    />
                    {errors.email && (
                      <Text style={styles.errorText}>
                        {errors.email.message}
                      </Text>
                    )}
                    {!isValidEmail && (
                      <Text style={styles.errorText}>
                        {i18n.t("global.Pleaseenteravalidemailaddress")}
                      </Text>
                    )}
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontFamily: "Roboto-Bold",
                        fontSize: 17,
                        fontWeight: "400",
                        color: "#000000",
                        marginBottom: 8,
                        marginTop: 10,
                      }}
                    >
                      {i18n.t("global.hangoutContact")}
                    </Text>
                    <View style={styles.row}>
                      <View style={styles.column}>
                        <Text allowFontScaling={false} style={styles.label}>
                          {i18n.t("global.enterfirstname")}
                        </Text>
                        <Controller
                          control={control}
                          name="firstnameSecond"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              allowFontScaling={false}
                              placeholder={i18n.t("global.enterfirstname")}
                              style={styles.inputField}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              autoCorrect={false}
                              placeholderTextColor="#7C7C7C"
                            />
                          )}
                        />
                        {errors.firstnameSecond && (
                          <Text style={styles.errorText}>
                            {errors.firstnameSecond.message}
                          </Text>
                        )}
                      </View>
                      <View style={styles.column}>
                        <Text allowFontScaling={false} style={styles.label}>
                          {i18n.t("global.lastName")}
                        </Text>
                        <Controller
                          control={control}
                          name="lastnameSecond"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              allowFontScaling={false}
                              placeholder={i18n.t("global.enterlastname")}
                              style={styles.inputField}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholderTextColor="#7C7C7C"
                            />
                          )}
                        />
                        {errors.lastnameSecond && (
                          <Text style={styles.errorText}>
                            {errors.lastnameSecond.message}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.title")}
                    </Text>
                    <Controller
                      control={control}
                      name="titleSecond"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          allowFontScaling={false}
                          placeholder={i18n.t("global.EnterTitle")}
                          style={styles.inputField}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor="#7C7C7C"
                        />
                      )}
                    />
                    {errors.titleSecond && (
                      <Text style={styles.errorText}>
                        {errors.titleSecond.message}
                      </Text>
                    )}
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.email")}
                    </Text>
                    <Controller
                      control={control}
                      name="emailSecond"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          allowFontScaling={false}
                          placeholder={i18n.t("global.enterEmail")}
                          style={[
                            styles.inputField,
                            !isValidEmailTwo && styles.inputError,
                          ]}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor="#7C7C7C"
                        />
                      )}
                    />
                    {errors.emailSecond && (
                      <Text style={styles.errorText}>
                        {errors.emailSecond.message}
                      </Text>
                    )}
                  </View>
                </View>
                {isLoading ? (
                  <Loader />
                ) : (
                  <>
                    {isKeyboardOpen ? null : (
                      <View style={styles.footer}>
                        <TouchableOpacity
                          onPress={() => navigation.goBack()}
                          style={styles.buttonContainer}
                        >
                          <LinearGradient
                            colors={["#338AFF", "#00EDB4"]}
                            style={styles.button}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1.2, y: 0.6 }}
                          >
                            <View style={styles.buttonContent}>
                              <Icon
                                name="chevron-left"
                                size={25}
                                color="#fff"
                                style={{ paddingTop: 3 }}
                              />
                              <Text
                                allowFontScaling={false}
                                style={styles.textbtn}
                              >
                                {i18n.t("global.back")}
                              </Text>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={handleSubmit(handleNext)}
                          style={styles.buttonContainer}
                        >
                          <LinearGradient
                            colors={["#338AFF", "#00EDB4"]}
                            style={styles.button}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1.2, y: 0.6 }}
                          >
                            <View style={styles.buttonContent}>
                              <Text
                                allowFontScaling={false}
                                style={styles.textbtn}
                              >
                                {i18n.t("global.next")}
                              </Text>
                              <Icon
                                name="chevron-right"
                                size={25}
                                color="#fff"
                                style={{ paddingTop: 3 }}
                              />
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BusinesName;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
    // marginHorizontal: 22,
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
    width: "95%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    alignSelf: "center",
    borderWidth: 1,
  },
  formContainer: {
    flex: 1,
    paddingVertical: 1,
    marginHorizontal: 10,
  },
  label: {
    marginBottom: 5,
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  inputField: {
    height: 40,
    borderRadius: 6,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#7C7C7C",
    paddingLeft: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  buton: {
    width: "90%",
    height: 50,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    alignSelf: "center",
    width: "100%",
    paddingVertical: 20,
  },
  buttonContainer: {
    width: "45%",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textbtn: {
    color: "white",
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    fontSize: 17,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
});
