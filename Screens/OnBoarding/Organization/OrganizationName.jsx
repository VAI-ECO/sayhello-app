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
import OrganizationService from "../../../Services/OrganizationService";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import { BackHandler } from "react-native";
import Icon from "react-native-vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { createOrganization } from "../../../features/organization/organizationSlice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const statesData = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
];

const OrganizationName = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastname] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [zipCode, setZipCode] = useState("");

  const [language, setLanguage] = useState(null);

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

  const handleCityChange = (text) => {
    setCity(text);
  };

  const validationSchema = Yup.object().shape({
    orgname: Yup.string().required("* Organization name is required"),
    orgAddress: Yup.string().required("* Organization Address is required"),
    city: Yup.string().required("* City is required"),
    state: Yup.string().required("* State is required"),
    zipcode: Yup.string().required("* Zip Code is required"),
    firstname: Yup.string().required("* First name is required"),
    lastname: Yup.string().required("* Last name is required"),
    title: Yup.string().required("* Title is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      orgname: "",
      orgAddress: "",
      city: "",
      state: "",
      zipcode: "",
      firstname: "",
      lastname: "",
      title: "",
    },
  });

  const handelNext = (values) => {
    setIsLoading(true);

    // if (
    //   !name ||
    //   !city ||
    //   !state ||
    //   !address ||
    //   !firstName ||
    //   !lastName ||
    //   !title ||
    //   !zipCode
    // ) {
    //   Toast.show({
    //     type: "error",
    //     text1: "Please fill all Details!",
    //     autoHide: true,
    //     visibilityTime: 5000,
    //   });
    //   setIsLoading(false);
    //   return;
    // }

    let body = {
      name: values.orgname,
      city: values.city,
      state: values.state,
      address: values.orgAddress,
      firstname: values.firstname,
      lastname: values.lastname,
      title: values.title,
      zipcode: values.zipcode,
      language: language,
    };
    // OrganizationService.createOrganization({
    //   name: name,
    //   city: city,
    //   state: state,
    //   address: address,
    //   firstname: firstName,
    //   lastname: lastName,
    //   title: title,
    //   zipcode: zipCode,
    //   language: language,
    // })
    dispatch(createOrganization(body))
      .then((res) => {
        const response = res?.payload;
        console.log(
          "response of tjhe organziation is: ",
          res?.payload,
          response._id
        );
        //  AsyncStorage.setItem("authToken",JSON.stringify(response.token));
        navigation.navigate("OrgDiscription");
        setName("");
        setAddress("");
        setTitle("");
        setFirstName("");
        setLastname("");
        setCity("");
        setState("");
        setZipCode("");
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("error: ", err);
        setIsLoading(false);
      });
  };

  const handleStateChange = (value) => {
    setState(value);
    setShowDropdown(false);
  };

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
  useEffect(() => {
    const backAction = () => {
      // Handle the back button press here
      return false; // Prevent default behavior (exit the app)
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the event listener on component unmount
  }, [navigation]);

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
                    marginTop: 10,
                    marginHorizontal: 22,
                  }}
                >
                  {i18n.t("global.organizationName")}
                </Text>
                <View
                  style={{
                    paddingTop: 15,
                    marginHorizontal: 22,
                  }}
                >
                  <Controller
                    control={control}
                    name="orgname"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("global.enterOrganizationname")}
                        style={{
                          ...styles.inputField,
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
                        // multiline={true}
                        textInputAccessoryViewID={"none"}
                      />
                    )}
                  />
                  {errors.orgname && (
                    <Text style={styles.errorText}>
                      {errors.orgname.message}
                    </Text>
                  )}
                </View>

                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Roboto-Bold",
                    fontSize: 17,
                    fontWeight: "400",
                    color: "#000000",
                    marginTop: 20,
                    marginHorizontal: 22,
                  }}
                >
                  {i18n.t("global.OrganizationAddress")}
                </Text>
                <View
                  style={{
                    paddingTop: 15,
                    marginHorizontal: 22,
                  }}
                >
                  <Controller
                    control={control}
                    name="orgAddress"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("global.enterOrganizationaddress")}
                        style={{
                          ...styles.inputField,
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
                        // multiline={true}
                        textI
                      />
                    )}
                  />
                  {errors.orgAddress && (
                    <Text style={styles.errorText}>
                      {errors.orgAddress.message}
                    </Text>
                  )}
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Roboto-Bold",
                    fontSize: 17,
                    fontWeight: "400",
                    color: "#000000",
                    marginTop: 10,
                    marginBottom: 10,
                    marginHorizontal: 22,
                  }}
                >
                  {i18n.t("global.Organizationlocation")}
                </Text>
                <View style={{ marginHorizontal: 22 }}>
                  <View style={styles.formContainer}>
                    <View style={styles.row}>
                      <View style={styles.column}>
                        <Text allowFontScaling={false} style={styles.label}>
                          {i18n.t("global.city")}
                        </Text>
                        <Controller
                          control={control}
                          name="city"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              allowFontScaling={false}
                              placeholder={i18n.t("global.city")}
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
                        {errors.city && (
                          <Text style={styles.errorText}>
                            {errors.city.message}
                          </Text>
                        )}
                      </View>
                      <View style={styles.column}>
                        <Text allowFontScaling={false} style={styles.label}>
                          {i18n.t("global.state")}
                        </Text>
                        <Controller
                          control={control}
                          name="state"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              allowFontScaling={false}
                              placeholder={i18n.t("global.state")}
                              style={styles.inputField}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              autoCapitalize="none"
                              autoCorrect={false}
                              placeholderTextColor="#7C7C7C"
                              // keyboardType="numeric"
                            />
                          )}
                        />
                        {errors.state && (
                          <Text style={styles.errorText}>
                            {errors.state.message}
                          </Text>
                        )}
                      </View>
                      <View style={styles.column}>
                        <Text allowFontScaling={false} style={styles.label}>
                          {i18n.t("global.zipcode")}
                        </Text>
                        <Controller
                          control={control}
                          name="zipcode"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              allowFontScaling={false}
                              placeholder={i18n.t("global.zipcode")}
                              style={styles.inputField}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              autoCapitalize="none"
                              autoCorrect={false}
                              placeholderTextColor="#7C7C7C"
                              keyboardType="numeric"
                              maxLength={10}
                            />
                          )}
                        />
                        {errors.zipcode && (
                          <Text style={styles.errorText}>
                            {errors.zipcode.message}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: "Roboto-Bold",
                      fontSize: 17,
                      fontWeight: "400",
                      color: "#000000",
                      marginTop: 10,
                      marginBottom: 8,
                    }}
                  >
                    {i18n.t("global.OrganizationContact")}
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
                  </View>
                </View>
              </View>
              {isLoading ? (
                <Loader size={"large"} />
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
                        onPress={handleSubmit(handelNext)}
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
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default OrganizationName;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
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
    paddingVertical: 8,
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
  button: {
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
