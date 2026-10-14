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
import React, { useEffect, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import PhoneInput from "react-native-phone-number-input";
import OrganizationService from "../../../Services/OrganizationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BusinessService from "../../../Services/BusinessService";
import CustomePhoneInput from "../../../Component/CustomePhoneInput";
import Toast from "react-native-toast-message";
import Loader from "../../../Component/Loader";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const BusinesSummary = () => {
  const router = useRoute();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const navigation = useNavigation();
  const [formattedValue, setFormattedValue] = useState("");
  const [businessDetails, setBusinessDetails] = useState(null);

  const [phone_number, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [isValidEmail, setIsValidEmail] = useState(true);

  // Email validation function
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setIsValidEmail(validateEmail(text));
  };

  useEffect(() => {
    const getBusinessDetailsFromLocalSorage = async () => {
      let result = await AsyncStorage.getItem(`BusinessCatagory`);
      let parse_result = JSON.parse(result);

      console.log("parse_result", parse_result);
      setBusinessDetails(parse_result);

      BusinessService.GetBusinessDetails(parse_result?.businessId)
        .then((res) => {
          console.log("Business Details: ", res);
          let name = res.contactName.split(" ");

          setPhoneNumber(res.phone);
          setFirstName(name[0]);
          setLastName(name[1]);
          setLocation(res.address);
          setCategory(res.businessCategory);
          setEmail(res.email);
          setDescription(res.description);
          setValue("firstname", name[0]);
          setValue("lastname", name[1]);
          setValue("email", res.email);
          setValue("contactno", res.phone);
          setValue("location", res.address);
          setValue("category", res.businessCategory);
          setValue("description", res.description);
        })
        .catch((err) => console.log("Error: ", err));
    };
    getBusinessDetailsFromLocalSorage();
  }, []);

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

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const validationSchema = Yup.object().shape({
    firstname: Yup.string().required("* First Name is required"),
    lastname: Yup.string().required("* Last Name is required"),
    location: Yup.string().required("* Location is required"),
    category: Yup.string().required("* Category is required"),
    contactno: Yup.string()
      .required("* Phone Number is required")
      .min(12, "Phone number must be at least 10 digits"),
    email: Yup.string().required("* Email is required").email("Invalid email"),
    description: Yup.string().required("* Description is required"),
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
      firstname: "",
      lastname: "",
      location: "",
      category: "",
      contactno: "",
      email: "",
      description: "",
    },
  });

  const handleNext = async (values) => {
    setIsLoading(true);

    let body = {
      phone_number: values.contactno,
      firstName: values.firstname || "",
      lastName: values.lastname || "",
      location: values.location || "",
      category: values.category || "",
      email: values.email || "",
      description: values.description || "",
      businessDetails: businessDetails || "",
      businessId: businessDetails?.business?.businessId,
    };

    await AsyncStorage.setItem(`VerifyBusinessDetails`, JSON.stringify(body));
    console.log(
      "businessDetails?.business?.businessId==========>",
      businessDetails?.businessId
    );

    BusinessService.updateBussinessDetails(body)
      .then((res) => {
        console.log("res on updateBussinessDetails: ", res);
        setIsLoading(false);
        navigation.navigate("BusCongratulation");
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("error on updateBussinessDetails: ", err);
      });
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
                marginTop: 10,
                paddingHorizontal: 20,
                marginBottom: 20,
              }}
            >
              {i18n.t("global.reviewYourBusinessInfo")}
            </Text>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
              keyboardShouldPersistTaps="handled"
            >
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
                          autoCorrect={false}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
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
                  {i18n.t("global.location")}
                </Text>
                <Controller
                  control={control}
                  name="location"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      allowFontScaling={false}
                      placeholder={i18n.t("global.enterLocation")}
                      style={styles.inputField}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor="#7C7C7C"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.location && (
                  <Text style={styles.errorText}>
                    {errors.location.message}
                  </Text>
                )}
                <Text allowFontScaling={false} style={styles.label}>
                  {i18n.t("global.category")}
                </Text>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      allowFontScaling={false}
                      placeholder={i18n.t("global.category")}
                      style={styles.inputField}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor="#7C7C7C"
                      editable={false}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.category && (
                  <Text style={styles.errorText}>
                    {errors.category.message}
                  </Text>
                )}
                <Text allowFontScaling={false} style={styles.label}>
                  {i18n.t("global.phoneNumber")}
                </Text>
                <View style={styles.inputFieldd}>
                  {/* <PhoneInput
                    defaultValue={phone_number}
                    defaultCode="US"
                    placeholder={phone_number || "Phone Number"}
                    layout="first"
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                    }}
                    onChangeFormattedText={(text) => {
                      setFormattedValue(text);
                    }}
                    containerStyle={styles.phoneInputContainer}
                    textContainerStyle={styles.phoneInputTextContainer}
                  /> */}
                  <Controller
                    control={control}
                    name="contactno"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomePhoneInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={i18n.t("global.enterphonenumber")}
                        editable={true}
                      />
                    )}
                    editable={true}
                  />
                </View>
                {errors.contactno && (
                  <Text style={styles.errorText}>
                    {errors.contactno.message}
                  </Text>
                )}

                <Text
                  allowFontScaling={false}
                  style={{
                    marginTop: 5,
                    color: "#000",
                    fontWeight: "600",
                    fontSize: 14,
                    fontFamily: "Roboto-Regular",
                    marginBottom: 5,
                  }}
                >
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
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
                <Text
                  allowFontScaling={false}
                  style={{
                    color: "#000",
                    fontWeight: "600",
                    fontSize: 14,
                    fontFamily: "Roboto-Regular",
                    marginBottom: 5,
                  }}
                >
                  {i18n.t("global.description")}
                </Text>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      allowFontScaling={false}
                      placeholder={i18n.t("global.enterdescription")}
                      style={{
                        ...styles.inputFielddd,
                        fontSize: 16,
                        fontFamily: "Roboto-Regular",
                        fontWeight: "400",
                        color: "#7C7C7C",
                        paddingLeft: 18,
                        paddingRight: 18,
                      }}
                      placeholderTextColor="#7C7C7C"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline={true}
                      textInputAccessoryViewID={"none"}
                    />
                  )}
                />
                {errors.description && (
                  <Text style={styles.errorText}>
                    {errors.description.message}
                  </Text>
                )}
              </View>
            </ScrollView>
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
                      onPress={handleSubmit(handleNext)}
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
                        {i18n.t("global.verify")}
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

export default BusinesSummary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
  },

  formContainer: {
    flex: 1,
    // padding: 20,
    // paddingVertical: 5,
    marginHorizontal: 20,
    marginBottom: 80,
  },
  label: {
    marginBottom: 5,
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  inputField: {
    height: 42,
    borderRadius: 6,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#7C7C7C",
    paddingLeft: 10,
    marginBottom: 12,
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
  flex1: {
    flex: 1,
  },
  stateContainer: {
    borderColor: "#000000",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#EDF5F4",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  stateItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  flatList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "##EDF5F4",
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  direction: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    paddingTop: 5,
    marginBottom: 5,
  },
  selectedStateText: {
    color: "#7C7C7C",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
  },
  defaultStateText: {
    color: "#7C7C7C",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
  },
  inputFieldd: {
    width: "100%",
    height: 100,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    marginBottom: 15,
    alignSelf: "center",
    borderWidth: 1,
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
  phoneInputContainer: {
    width: "100%",
    backgroundColor: "#EDF5F4",
  },
  phoneInputTextContainer: {
    borderLeftWidth: 0.5,
    backgroundColor: "#EDF5F4",
  },
  inputFieldd: {
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#7C7C7C",
    borderBottomWidth: 1,
    // height: 60,
  },
  inputFielddd: {
    width: "100%",
    height: 70,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    alignSelf: "center",
    borderWidth: 1,
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 5,
  },
});
