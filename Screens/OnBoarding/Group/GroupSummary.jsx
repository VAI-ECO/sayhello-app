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
import React, { useEffect, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import PhoneInput from "react-native-phone-number-input";
import GroupService from "../../../Services/GroupService";
import CustomePhoneInput from "../../../Component/CustomePhoneInput";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import userService from "../../../Services/userService";
import i18n from "../../../Context/i18n";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

const GroupSummary = () => {
  // const router = useRoute();

  const GroupData = useSelector((state) => state?.group?.groupData);
  console.log(GroupData?._id, "group data3");

  const [title, setTitle] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const navigation = useNavigation();
  const [phone_number, setPhoneNumber] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [data, setData] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [isValidEmail, setIsValidEmail] = useState(true);

  console.log("email", email);
  console.log("isValidEmail", isValidEmail);

  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setIsValidEmail(validateEmail(text));
  };

  const goBack = () => {
    navigation.goBack();
  };

  const getOrdDetails = () => {
    // GroupService.getDetails(router?.params?.groupId)
    GroupService.getDetails(GroupData?._id)
      .then((res) => {
        console.log("Asdasdasdas: ", res.description);
        setName(res?.name);
        setTitle(res?.title);
        setEmail(res?.email);
        setFirstName(res?.firstname + " " + res?.lastname);
        setData(res?.description);
        setValue("name", res?.name || "");
        setValue("contactname", res?.firstname + " " + res?.lastname || "");
        setValue("location", res?.address || "");
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("* Name is required"),
    contactname: Yup.string().required("* Contact Name is required"),
    contactno: Yup.string().required("* Phone Number is required").min(12, "Phone number must be at least 10 digits"),
    email: Yup.string().required("* Email is required").email("Invalid email"),
    description: Yup.string().required("* Description is required"),
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
      name: "",
      contactname: "",
      contactno: "",
      email: "",
      description: "",
    },
  });

  const handelUpdate = (values) => {
    setIsLoading(true);

    userService
      .checkEmailExists(values.email)
      .then((res) => {
        if (res?.exists) {
          Toast.show({
            type: "error",
            text1: "Email already exists",
            autoHide: true,
            visibilityTime: 5000,
          });
          setIsLoading(false);
        } else {
          userService
            .checkPhoneNumberExists(values.contactno)
            .then((resPhone) => {
              console.log("resPhone: ", resPhone);
              if (resPhone?.exists) {
                Toast.show({
                  type: "error",
                  text1: "Phone Number already exists",
                  autoHide: true,
                  visibilityTime: 5000,
                });
                setIsLoading(false);
              } else {
                const datas = {
                  firstname: values.contactname,
                  lastname: values.name,
                  location: "",
                  phone: values.contactno,
                  email: values.email,
                  description: values.description,
                };
                // GroupService.updateSummarys(router?.params?.groupId, datas)
                GroupService.updateSummarys(GroupData?._id, datas)
                  .then((res) => {
                    console.log(res, "review group update")
                    navigation.navigate("GroupPassword");
                    // navigation.navigate("GroupPassword", {
                    //   groupId: router?.params?.groupId,
                    // });
                    setIsLoading(false);
                  })
                  .catch((err) => {
                    setIsLoading(false);
                    console.log("error ali: ", err);
                  });
              }
            })
            .catch((errPhone) => {
              console.log("ErrorPhone: ", errPhone);
            });
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("Error on cheack email: ", err);
      });
  };

  useEffect(() => {
    getOrdDetails();
  }, [GroupData?._id]);
  // }, [router]);

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
                marginTop: 10,
                paddingHorizontal: 20,
                marginBottom: 20,
              }}
            >
              {i18n.t("global.reviewYourGroup")}
            </Text>
            <ScrollView>
              <View style={styles.formContainer}>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.name")}
                    </Text>
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          allowFontScaling={false}
                          placeholder="Enter Name"
                          style={styles.inputField}
                          value={value || name}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCorrect={false}
                          placeholderTextColor="#7C7C7C"
                        />
                      )}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                  </View>

                  <View style={styles.column}>
                    <Text allowFontScaling={false} style={styles.label}>
                      {i18n.t("global.enterContactName")}
                    </Text>
                    <Controller
                      control={control}
                      name="contactname"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          allowFontScaling={false}
                          placeholder="Enter Contact name"
                          style={styles.inputField}
                          value={value || firstName}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholderTextColor="#7C7C7C"
                        />
                      )}
                    />
                    {errors.contactname && <Text style={styles.errorText}>{errors.contactname.message}</Text>}
                  </View>
                </View>

                <Text allowFontScaling={false} style={styles.label}>
                  {i18n.t("global.phoneNumber")}
                </Text>
                <View style={styles.inputFieldd}>
                  <Controller
                    control={control}
                    name="contactno"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomePhoneInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter phone number"
                        editable={true}
                      />
                    )}
                  />
                </View>
                {errors.contactno && <Text style={styles.errorText}>{errors.contactno.message}</Text>}

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
                      placeholder="Enter email"
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
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                {/* {!isValidEmail && (
                  <Text style={styles.errorText}>
                    {i18n.t("global.pleaseEnterValidEmail")}
                  </Text>
                )} */}
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
                      placeholder="Enter Directions"
                      style={{
                        ...styles.inputFielddd,
                        fontSize: 16,
                        fontFamily: "Roboto-Regular",
                        fontWeight: "400",
                        color: "#7C7C7C",
                        paddingLeft: 18,
                        paddingRight: 18,
                      }}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor="#7C7C7C"
                      multiline={true}
                      textInputAccessoryViewID={"none"}
                    />
                  )}
                />
                {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
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
                      onPress={handleSubmit(handelUpdate)}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      disabled={!isValidEmail}
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
                        {i18n.t("global.next")}
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

export default GroupSummary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
  },

  formContainer: {
    flex: 1,
    // padding: 20,
    paddingVertical: 5,
    marginHorizontal: 20,
    marginBottom: 80
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
    height: 90,
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
    height: 80,
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
    top: -4,
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
