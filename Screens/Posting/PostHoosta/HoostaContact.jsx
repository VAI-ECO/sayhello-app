import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  ImageBackground,
  Platform,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import HoostaHeader from "../../../Component/HoostaHeader ";
import HoostaLocation from "./HoostaLocation";
import HoostaService from "../../../Services/HoostaService";
import PhoneInput from "react-native-phone-number-input";
import CustomePhoneInput from "../../../Component/CustomePhoneInput";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const HoostaContact = () => {
  // const router = useRoute();
  const Hoosta = useSelector((state) => state?.hoosta?.hoostaData?.hoosta);
  console.log(Hoosta?._id, "hoosta4");
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const from4 = router?.params?.from4;
  const from5 = router?.params?.from5;
  const from6 = router?.params?.from6;
  const clearform = router?.params?.clearform;

  console.log(
    from,
    from2,
    from3,
    from4,
    from5,
    from6,
    pathname,
    clearform,
    "p7"
  );
  // const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [phone_number, setPhoneNumber] = useState("");
  const phoneInput = useRef(null); // Ref for PhoneInput component

  // console.log("phone_number", JSON);

  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleStreetAddressChange = (text) => {
    setStreetAddress(text.trim());
    setIsValidEmail(validateEmail(text));
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

    if (clearform) {
      reset({
        name: "",
        contact: "",
        email: "",
        phone_number: " ",
      });
    }

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [router]);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("* Name is required"),
    contact: Yup.string().required("* Contact Name is required"),
    email: Yup.string()
      .required("* Email is required")
      .email("* Invalid email"),
    phone_number: Yup.string()
      .required("* Phone Number is required")
      .min(12, "Phone number must be at least 10 digits"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      phone_number: "",
    },
  });

  const handleNext = (values) => {
    setIsLoading(true);

    const body = {
      eventId: Hoosta?._id,
      organization: values.name,
      contactName: values.contact,
      email: values.email,
      phone: values.phone_number,
    };

    HoostaService.updateContact(Hoosta?._id, body)
      .then((res) => {
        console.log("ali here: ", res);
        const params = {
          from: from,
          from2: from2,
          from3,
          from3,
          from4: from4,
          from5: from5,
          from6: from6,
          from7: pathname,
          clearform: true,
        };
        navigation.navigate("HoostaReview", params);
        setIsLoading(false);
        setName("");
        setContact("");
        setStreetAddress("");
        setPhoneNumber("");
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const handleBack = () => {
    const params = {
      from: from,
      from2: from2,
      from3: from3,
      from4: from4,
      from5: from5,
    };
    navigation.navigate(from6, params);
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
            <HoostaHeader handleBack={handleBack} />
            <Text allowFontScaling={false} style={styles.headerText}>
              {i18n.t("global.enterContact")}
            </Text>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.formContainer}>
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.enterName")}
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("global.enterName")}
                        style={styles.inputField}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCorrect={false}
                        placeholderTextColor="#000000"
                      />
                    )}
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  )}
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.nameofContact")}
                  </Text>
                  <Controller
                    control={control}
                    name="contact"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("global.enterContact")}
                        style={styles.inputField}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCorrect={false}
                        placeholderTextColor="#000000"
                      />
                    )}
                  />
                  {errors.contact && (
                    <Text style={styles.errorText}>
                      {errors.contact.message}
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
                        autoCorrect={false}
                        autoCompleteType="email"
                        placeholderTextColor="#000000"
                      />
                    )}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.phoneNumber")}
                  </Text>
                  <Controller
                    control={control}
                    name="phone_number"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomePhoneInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={i18n.t("global.enterphonenumber")}
                        editable={true}
                      />
                    )}
                  />
                  {/* <PhoneInput
                ref={phoneInput}
                defaultValue={phone_number}
                containerStyle={styles.phoneInputContainer}
                textInputStyle={{
                  backgroundColor: "#F6F6F6",
                }}
                textContainerStyle={styles.phoneInputTextContainer}
                placeholder={phone_number || "Phone Number"}
                defaultCode="US"
                layout="first"
                onChangeText={(text) => {
                  setPhoneNumber(text);
                }}
                onChangeFormattedText={(text) => {
                  setFormattedValue(text);
                }}
              /> */}
                </View>
                {errors.phone_number && (
                  <Text style={{ ...styles.errorText, marginLeft: 20 }}>
                    {errors.phone_number.message}
                  </Text>
                )}
              </ScrollView>
            </KeyboardAvoidingView>

            {isLoading ? (
              <>
                <View style={styles.btncontainer}>
                  <ActivityIndicator size={50} color="#0000ff" />
                </View>
              </>
            ) : (
              <>
                {isKeyboardOpen ? null : (
                  <TouchableOpacity
                    style={styles.btncontainer}
                    onPress={handleSubmit(handleNext)}
                  >
                    <LinearGradient
                      colors={["#338AFF", "#00EDB4"]}
                      style={styles.buton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1.2, y: 0.6 }}
                    >
                      <TouchableOpacity onPress={handleSubmit(handleNext)}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.textbtn}>
                            {i18n.t("global.next")}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HoostaContact;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    paddingTop: 5,
    // marginBottom: 5,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    marginBottom: 5,
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
    fontFamily: "Roboto-Regular",
  },
  inputField: {
    height: 45,
    borderRadius: 6,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#000000",
    paddingLeft: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
  },
  buton: {
    width: "95%",
    height: 50,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  textbtn: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  btncontainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 8,
  },
  phoneInputTextContainer: {
    // borderLeftWidth: 0.3,
    backgroundColor: "#F6F6F6",
  },
  phoneInputContainer: {
    width: "100%",
    backgroundColor: "#F6F6F6",
    borderRadius: 3,
    borderRadius: 6,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#000000",
    paddingLeft: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    top: -10,
  },
});
