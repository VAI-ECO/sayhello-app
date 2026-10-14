import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import PhoneInput from "react-native-phone-number-input";
import { useAuth } from "../../../Context/AuthContext";
import HangoutService from "../../../Services/HangoutService";
import Header from "../../../Component/Header";
import axios from "axios";
import BusinessService from "../../../Services/BusinessService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomePhoneInput from "../../../Component/CustomePhoneInput";
import Loader from "../../../Component/Loader";
import userService from "../../../Services/userService";
import Icon from "react-native-vector-icons/Entypo";
import { ApiKey } from "@env";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { createBusiness } from "../../../features/business/businessSlice";
import Toast from "react-native-toast-message";
import i18n from "../../../Context/i18n";
const statesData = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
];

const EnterData = () => {
  const { user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { businessInfo, isBusinessId } = route.params;
  const [streetAddress, setStreetAddress] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [contact, setContact] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [phone_number, setPhoneNumber] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const [storeBusinessDetails, setStoreBusinessDetails] = useState(null);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidZipCode, setIsValidZipcode] = useState(true);
  const [isValidName, setIsValidName] = useState(true);
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    // resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      name: isBusinessId ? name : "",
      address: isBusinessId ? streetAddress : "",
      phone_number: isBusinessId ? phone_number : "",
      email: isBusinessId ? email : "",
      contactname: isBusinessId ? contact : "",
      city: isBusinessId ? city : "",
      state: isBusinessId ? state : "",
      zipcode: isBusinessId ? zipcode : "",
    },
  });

  // useEffect(() => {
  //   const getStoreBusinessDetails = async () => {
  //     let result = await AsyncStorage.getItem("BusinessDetails");
  //     console.log("results are: ", result)
  //     if (result) {
  //       let parse_result = JSON.parse(result);
  //       console.log("parse_result:", parse_result.address);
  //       if (isBusinessId) {
  //         setName(parse_result?.name);
  //         setStreetAddress(parse_result?.address);
  //         setPhoneNumber(parse_result?.phone.split("-").join(""));
  //         setFormattedValue(parse_result?.phone);
  //         setEmail(parse_result?.email);
  //         setContact(parse_result?.contactName);
  //         setCity(parse_result?.city);
  //         setZipcode(parse_result?.zipcode);
  //         setState(parse_result?.state);
  //         setBusinessId(parse_result?.businessId);
  //         setValue("name", parse_result?.name);
  //         setValue("address", parse_result?.address);
  //         setValue("phone_number", parse_result?.phone.split("-").join(""));
  //         setValue("email", parse_result?.email);
  //         setValue("contactname", parse_result?.contactName);
  //         setValue("city", parse_result?.city);
  //         setValue("state", parse_result?.state);
  //         setValue("zipcode", parse_result?.zipcode);
  //       }

  //       console.log("BusinessDetails: ", parse_result?.name);
  //       setStoreBusinessDetails(parse_result);
  //     }
  //   };

  //   getStoreBusinessDetails();
  // }, [isBusinessId]);

  // useEffect(() => {
  //   const getLocation = async ({ lat, lng }) => {
  //     try {
  //       const res = await axios.post(
  //         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${ApiKey}`
  //       );

  //       const addressComponents = res.data?.results?.[0]?.address_components;

  //       let city = "";
  //       let state = "";
  //       let zipcode = "";

  //       if (addressComponents) {
  //         addressComponents.forEach((component) => {
  //           if (component.types.includes("locality")) {
  //             city = component.long_name;
  //           }
  //           if (component.types.includes("administrative_area_level_1")) {
  //             state = component.short_name;
  //           }
  //           if (component.types.includes("postal_code")) {
  //             zipcode = component.long_name;
  //           }
  //         });
  //         setCity(city);
  //         setState(state);
  //         setZipcode(zipcode);
  //       } else {
  //         console.log("No address components found.");
  //       }
  //     } catch (error) {
  //       console.log("Error getting location", error);
  //     }
  //   };

  //   if (businessInfo) {
  //     setName(businessInfo.name);
  //     setStreetAddress(businessInfo.formatted_address);
  //     getLocation(businessInfo?.geometry?.location);
  //   }
  // }, [businessInfo]);

  useEffect(() => {
    const getBusinessDetails = async () => {
      let details = null;
  
      // 1. Priority to businessInfo from route (selected from search screen)
      if (businessInfo) {
        details = {
          ...businessInfo,
          address: businessInfo.formatted_address,
          name: businessInfo.name,
          geometry: businessInfo.geometry,
        };
  
        // Reverse geocode lat/lng to city, state, zip
        const loc = businessInfo?.geometry?.location;
        if (loc?.lat && loc?.lng) {
          try {
            const res = await axios.post(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.lat},${loc.lng}&key=${ApiKey}`
            );
            const components = res.data?.results?.[0]?.address_components;
  
            components?.forEach((component) => {
              if (component.types.includes("locality")) {
                details.city = component.long_name;
              }
              if (component.types.includes("administrative_area_level_1")) {
                details.state = component.short_name;
              }
              if (component.types.includes("postal_code")) {
                details.zipcode = component.long_name;
              }
            });
          } catch (err) {
            console.log("Failed to reverse geocode:", err);
          }
        }
  
        // Save to AsyncStorage for fallback reuse
        await AsyncStorage.setItem("BusinessDetails", JSON.stringify(details));
      }
  
      // 2. If nothing passed, fallback to AsyncStorage
      if (!details) {
        const result = await AsyncStorage.getItem("BusinessDetails");
        if (result) {
          details = JSON.parse(result);
        }
      }
  
      // 3. Set values if details found
      if (details) {
        console.log("Prefilling with:", details);
        setName(details.name || "");
        setStreetAddress(details.address || "");
        setPhoneNumber(details.phone?.split("-").join("") || "");
        setFormattedValue(details.phone || "");
        setEmail(details.email || "");
        setContact(details.contactName || "");
        setCity(details.city || "");
        setZipcode(details.zipcode || "");
        setState(details.state || "");
        setBusinessId(details.businessId || "");
        setStoreBusinessDetails(details);
  
        // Set values in form
        setValue("name", details.name || "");
        setValue("address", details.address || "");
        setValue("phone_number", details.phone?.split("-").join("") || "");
        setValue("email", details.email || "");
        setValue("contactname", details.contactName || "");
        setValue("city", details.city || "");
        setValue("state", details.state || "");
        setValue("zipcode", details.zipcode || "");
      }
    };
  
    getBusinessDetails();
  }, []);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("* Business name is required"),
    address: Yup.string().required("* Address is required"),
    phone_number: Yup.string()
      .required("* Phone number is required")
      .min(12, "Phone number must be at least 10 digits"),
    email: Yup.string().email("Invalid email").required("* Email is required"),
    contactname: Yup.string().required("* Contact Name is required"),
    city: Yup.string().required("* City is required"),
    state: Yup.string().required("* State is required"),
    zipcode: Yup.string().required("* Zip Code is required"),
  });

  const handleNameChange = (text) => {
    if (text.length > 0) {
      setErrorMsg("");
    }
    setName(text);
    setIsValidName(text.length > 0);
  };

  const handleEmailChange = (text) => {
    if (text.length > 0) {
      setErrorMsg("");
    }
    setEmail(text);
    setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text));
  };
  const handleStreetAddressChange = (text) => {
    if (text.length > 0) {
      setErrorMsg("");
    }
    setStreetAddress(text.trim());
    setIsValidAddress(text.length > 0);
  };

  const handleCityChange = (text) => {
    if (text.length > 0) {
      setErrorMsg("");
    }
    setCity(text.trim());
  };

  const handleStateChange = (value) => {
    if (value.length > 0) {
      setErrorMsg("");
    }
    setState(value);
    setShowDropdown(false);
  };

  const handleZipcodeChange = (text) => {
    if (text.length > 0) {
      setErrorMsg("");
    }
    setZipcode(text);
    setIsValidZipcode(/^\d{5}$/.test(text));
  };

  const handleContactChange = (text) => {
    if (text.length > 0) {
      setErrorMsg("");
    }
    setContact(text);
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

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handelSubmitDetails = async (values) => {
    setIsLoading(true);
    console.log("clicked");
    userService
      .checkEmailExists(values.email)
      .then(async (res) => {
        console.log("checkEmailExists response:", res);

        if (res?.exists) {
          console.log(`Email already exists: ${email}`);
          Toast.show({
            type: "error",
            text1: "Email already exists",
          });
          setIsLoading(false);
        } else {
          const body = {
            name: values.name,
            address: values.address,
            city: values.city,
            state: values.state,
            zipcode: values.zipcode,
            phone: values.phone_number,
            email: values.email,
            contactName: values.contactname,
            businessId,
          };

          dispatch(createBusiness(body))
            .then(async (response) => {
              const res = response?.payload;

              console.log("Business created successfully", res);

              await AsyncStorage.setItem(
                "BusinessCatagory",
                JSON.stringify(res)
              );

              navigation.navigate("BusinessCatagory");
              setIsLoading(false);
            })
            .catch((err) => {
              console.error("Error creating business", err);
              Toast.show({
                type: "error",
                text1: `Something went wrong`,
                autoHide: true,
                visibilityTime: 5000,
              });
            })
            .finally(() => {
              setIsLoading(false);
            });

          // try {
          //   const res = await BusinessService.createBusiness(body);

          //   console.log("Business created successfully", res);

          //   await AsyncStorage.setItem("BusinessCatagory", JSON.stringify(res));

          //   navigation.navigate("BusinessCatagory");
          //   setIsLoading(false);
          // } catch (err) {
          //   console.error("Error creating business", err);
          //   Toast.show({
          //     type: "error",
          //     text1: `Something went wrong`,
          //     autoHide: true,
          //     visibilityTime: 5000,
          //   });
          // } finally {
          //   setIsLoading(false);
          // }
        }
      })
      .catch((err) => {
        console.error("Error on checkEmailExists:", err);
        setIsLoading(false);
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
        >
          <View style={styles.container}>
            {/* <Header title="" /> */}
            <Image
              source={require("../../../assets/busniessicon.png")}
              style={styles.orglogo}
              resizeMode="contain"
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.flex1}
            >
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formContainer}>
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.businessName")}
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("global.enterBusinessName")}
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
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  )}
                  {/* {errorMsg && isValidName ? <Text style={{ color: 'red' }}>{errorMsg}</Text> : null} */}
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.address")}
                  </Text>
                  <Controller
                    control={control}
                    name="address"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("global.address")}
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
                  {errors.address && (
                    <Text style={styles.errorText}>
                      {errors.address.message}
                    </Text>
                  )}
                  {/* {errorMsg && isValidAddress ? <Text style={{ color: 'red' }}>{errorMsg}</Text> : null} */}
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
                            // keyboardType="numeric"
                            placeholderTextColor="#7C7C7C"
                          />
                        )}
                      />
                      {errors.state && (
                        <Text style={styles.errorText}>
                          {errors.state.message}
                        </Text>
                      )}
                      {showDropdown && (
                        <FlatList
                          data={statesData}
                          renderItem={({ item }) => (
                            <TouchableWithoutFeedback
                              onPress={() => handleStateChange(item.value)}
                            >
                              <Text
                                allowFontScaling={false}
                                style={styles.stateItem}
                              >
                                {item.label}
                              </Text>
                            </TouchableWithoutFeedback>
                          )}
                          keyExtractor={(item) => item.value}
                          style={styles.flatList}
                        />
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
                            keyboardType="numeric"
                            placeholderTextColor="#7C7C7C"
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
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.enterBusinessPhone")}
                  </Text>
                  <View style={styles.inputFieldd}>
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
                  </View>
                  {errors.phone_number && (
                    <Text style={[styles.errorText, { marginTop: 10 }]}>
                      {errors.phone_number.message}
                    </Text>
                  )}
                  <Text
                    allowFontScaling={false}
                    style={{
                      marginBottom: 5,
                      color: "#000",
                      fontWeight: "600",
                      fontSize: 14,
                      fontFamily: "Roboto-Regular",
                      marginTop: 10,
                    }}
                  >
                    {i18n.t("global.enterBusinessEmail")}
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
                  {/* {errorMsg ? <Text style={{ color: 'red' }}>{errorMsg}</Text> : null} */}
                  {!isValidEmail && (
                    <Text style={styles.errorText}>
                      {i18n.t("global.Pleaseenteravalidemailaddress")}
                    </Text>
                  )}
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.enterContactName")}
                  </Text>
                  <Controller
                    control={control}
                    name="contactname"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("global.enterContactName")}
                        style={styles.inputField}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCorrect={false}
                        placeholderTextColor="#7C7C7C"
                      />
                    )}
                  />
                  {errors.contactname && (
                    <Text style={styles.errorText}>
                      {errors.contactname.message}
                    </Text>
                  )}
                  {/* {errorMsg ? <Text style={{ color: 'red' }}>{errorMsg}</Text> : null} */}
                </View>
              </ScrollView>
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  {!isKeyboardOpen && (
                    <TouchableOpacity
                      onPress={handleSubmit(handelSubmitDetails)}
                      disabled={isLoading}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        position: "absolute",
                        alignItems: "center",
                        alignSelf: "center",
                        bottom: 10,
                      }}
                    >
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.buton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <TouchableOpacity
                          onPress={handleSubmit(handelSubmitDetails)}
                          disabled={isLoading}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={styles.textbtn}
                            >
                              {i18n.t("global.next")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </KeyboardAvoidingView>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default EnterData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    paddingTop: 55,
  },

  formContainer: {
    flex: 1,
    // paddingVertical: 15,
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
    height: 40,
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
    width: "95%",
    height: 50,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
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
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    top: -4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    alignSelf: "center",

    width: "100%", // Ensures footer takes the full width
    paddingVertical: 20,
  },
  buttonContainer: {
    width: "45%", // Sets each button to take half the width of the footer with some space between
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
  // errorText: {
  //   color: "red",
  //   fontSize: 14,
  //   marginTop: 5,
  // },
});
