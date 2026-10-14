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
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import PhoneInput from "react-native-phone-number-input";
import ProfileHeader from "../../Component/ProfileHeader";
import HangoutHeader from "../../Component/HangoutHeader";
import { LinearGradient } from "expo-linear-gradient";
import BusinessService from "../../Services/BusinessService";
import { useAuth } from "../../Context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import CustomePhoneInput from "../../Component/CustomePhoneInput";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../Context/i18n";

const EnterData = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const iAmHearData =
    useSelector((state) => {
      const results = state?.hangout?.iAmHearData?.results;
      return results && results.length > 0 ? results[0] : {};
    }) || {};

  console.log(iAmHearData, "data is this ");
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const clearform = router?.params?.clearform;
  const clearFormAutofill = router?.params?.clearFormAutofill;
  const fromsecond = router?.params?.fromsecond;
  const businessName = router?.params?.businessName;

  console.log(
    from,
    from2,
    pathname,
    fromsecond,
    clearform,
    clearFormAutofill,
    businessName,
    "p33"
  );

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [phone_number, setPhoneNumber] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [contactName, setContactName] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [isValidEmail, setIsValidEmail] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleBack = () => {
    if (fromsecond) {
      navigation.navigate(fromsecond, { from: from, from2: from2 });
    } else {
      navigation.navigate(from2, { from: from });
    }
  };

  useEffect(() => {
    if (clearform) {
      setValue("name", "");
      setValue("phone_number", " ");
      setValue("email", "");
      setValue("state", "");
      setValue("city", "");
      setValue("zip_code", "");
      setValue("category", "");
      setValue("address", "");
    }
    if (clearFormAutofill) {
      setValue("name", "");
      setValue("phone_number", " ");
      setValue("email", "");
    }
  }, [router]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const [dropdownItems, setDropdownItems] = useState([]);

  const getAllCategories = () => {
    BusinessService.getAllBusinessCategories()
      .then((res) => {
        const result = res?.categories;
        let new_data = [];

        for (let i = 0; i < result.length; i++) {
          let element = result[i];

          let obj = element?.name;

          new_data.push(obj);
        }

        new_data.push("Others");

        setDropdownItems(new_data);
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  const handleItemSelect = (item) => {
    if (item === "Others") {
      setShowModal(true);
    } else {
      setSelectedItem(item);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (Object.keys(iAmHearData).length > 0) {
      setAddress(iAmHearData.formatted_address);
      setValue("address", iAmHearData.formatted_address);
      iAmHearData.address_components.forEach((component) => {
        const types = component.types;

        if (types.includes("locality")) {
          setCity(component?.long_name || "");
          setValue("city", component?.long_name);
        }

        if (types.includes("administrative_area_level_1")) {
          setState(component?.short_name || "");
          setValue("state", component?.short_name);
        }

        if (types.includes("postal_code")) {
          setZipCode(component?.long_name || "");
          setValue("zip_code", component?.long_name);
        }
      });
    }
  }, [iAmHearData]);

  useEffect(() => {
    setName(businessName);
    setValue("business_name", businessName);
  }, [businessName]);

  const validationSchema = Yup.object().shape({
    business_name: Yup.string().required("* Business Name is required"),
    phone_number: Yup.string()
      .required("* Phone Number is required")
      .min(12, "Phone number must be at least 10 digits"),
    state: Yup.string().required("* State is required"),
    city: Yup.string().required("* City is required"),
    zip_code: Yup.string().required("* Zip Code is required"),
    email: Yup.string()
      .required("* Email is required")
      .email("* Invalid Email"),
    name: Yup.string().required("* Name is required"),
    category: Yup.string().required("* Category is required"),
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
      business_name: "",
      phone_number: "",
      state: "",
      city: "",
      zip_code: "",
      email: "",
      name: "",
      category: "",
      address: "",
    },
  });

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

  const handleNext = async (values) => {
    setIsLoading(true);

    const body = {
      details: {
        name: values.business_name,
        address: values.address,
        city: values.city,
        state: values.state,
        zipcode: values.zip_code,
        phone: values.phone_number,
        email: values.email,
        contactName: values.name,
      },
      ambassadorId: user?.user?._id,
    };

    console.log("body", JSON.stringify(body));

    try {
      const res = await BusinessService.suggestBusinessAmbinsdaor(body);

      console.log("Business created successfully", res);

      await AsyncStorage.setItem("HangoutInformation", JSON.stringify(res));

      navigation.navigate("HelloAmbassador", {
        from: from,
        from2: from2,
        from3: pathname,
        businessName: businessName,
        fromsecond: fromsecond,
      });
      // setName("");
      // setEmail("");
      // setPhoneNumber("");
      // setFormattedValue("");
      // setContactName("");
      // setAddress("");
      // setCity("");
      // setState("");
      // setZipCode("");
    } catch (err) {
      console.error("Error creating business", err);
    } finally {
      setIsLoading(false);
      // setName("");
      // setEmail("");
      // setPhoneNumber("");
      // setFormattedValue("");
      // setContactName("");
      // setAddress("");
      // setCity("");
      // setState("");
      // setZipCode("");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([getAllCategories()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };
  console.log(address, state, city, zipCode, "dataa2");

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} />
          }
        > */}
        <ImageBackground
          source={require("../../assets/ImageBackground.jpg")}
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
            <ProfileHeader handleBack={handleBack} />
            <HangoutHeader />
            <Text allowFontScaling={false} style={styles.infoText}>
              {i18n.t("HangoutDetaile.text")}
            </Text>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View style={styles.formContainer}>
                <View style={{ backgroundColor: "#D9D9D9" }}>
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.businessName")}
                  </Text>
                  <Controller
                    control={control}
                    name="business_name"
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
                  {errors.business_name && (
                    <Text style={styles.errorText}>
                      {errors.business_name.message}
                    </Text>
                  )}

                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.EnterBusinessPhone")}
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
                    <Text style={{ ...styles.errorText, marginTop: 10 }}>
                      {errors.phone_number.message}
                    </Text>
                  )}
                  <View style={{ flexDirection: "row", marginHorizontal: 20 }}>
                    <View>
                      <Text
                        allowFontScaling={false}
                        style={{
                          marginBottom: 5,
                          color: "#000",
                          fontWeight: "600",
                          fontSize: 14,
                          fontFamily: "Roboto-Regular",
                          marginTop: 15,
                          marginHorizontal: 3,
                        }}
                      >
                        {i18n.t("global.enterState")}
                      </Text>
                      <Controller
                        control={control}
                        name="state"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            placeholder={i18n.t("global.enterBusinessName")}
                            style={{
                              height: 55,
                              width: wp("40%"),
                              borderRadius: 6,
                              backgroundColor: "#EDF5F4",
                              fontSize: 14,
                              fontFamily: "Roboto-Regular",
                              fontWeight: "600",
                              color: "#7C7C7C",
                              paddingLeft: 10,
                              marginBottom: 12,
                              borderWidth: 1,
                            }}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor="#7C7C7C"
                          />
                        )}
                      />
                      {errors.state && (
                        <Text style={styles.errorText}>
                          {errors.state.message}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text
                        allowFontScaling={false}
                        style={{
                          marginBottom: 5,
                          color: "#000",
                          fontWeight: "600",
                          fontSize: 14,
                          fontFamily: "Roboto-Regular",
                          marginTop: 15,
                          marginHorizontal: 15,
                        }}
                      >
                        {i18n.t("global.enterCity")}
                      </Text>
                      <Controller
                        control={control}
                        name="city"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            placeholder={i18n.t("global.enterBusinessName")}
                            style={{
                              height: 55,
                              width: wp("38%"),
                              borderRadius: 6,
                              backgroundColor: "#EDF5F4",
                              fontSize: 14,
                              fontFamily: "Roboto-Regular",
                              fontWeight: "600",
                              color: "#7C7C7C",
                              paddingLeft: 10,
                              marginBottom: 12,
                              borderWidth: 1,
                              marginLeft: 10,
                            }}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
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
                  </View>
                  <View>
                    <Text allowFontScaling={false} style={styles.emailLabel}>
                      {i18n.t("global.enterZipcode")}
                    </Text>
                    <Controller
                      control={control}
                      name="zip_code"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          allowFontScaling={false}
                          placeholder={i18n.t("global.enterZipcode")}
                          style={{
                            height: 55,
                            borderRadius: 6,
                            backgroundColor: "#EDF5F4",
                            fontSize: 14,
                            fontFamily: "Roboto-Regular",
                            fontWeight: "600",
                            color: "#7C7C7C",
                            paddingLeft: 10,
                            marginBottom: 12,
                            borderWidth: 1,
                            // marginRight: 20,
                            marginHorizontal: 15,
                          }}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor="#7C7C7C"
                        />
                      )}
                    />
                    {errors.zip_code && (
                      <Text style={styles.errorText}>
                        {errors.zip_code.message}
                      </Text>
                    )}
                  </View>
                  <Text allowFontScaling={false} style={styles.emailLabel}>
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
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#7C7C7C"
                      />
                    )}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}

                  <Text allowFontScaling={false} style={styles.emailLabel}>
                    {i18n.t("global.enterName")}
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("global.enterName")}
                        style={{
                          height: 55,
                          borderRadius: 6,
                          backgroundColor: "#EDF5F4",
                          fontSize: 14,
                          fontFamily: "Roboto-Regular",
                          fontWeight: "600",
                          color: "#7C7C7C",
                          paddingLeft: 10,
                          marginBottom: 12,
                          borderWidth: 1,
                          marginHorizontal: 15,
                        }}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#7C7C7C"
                      />
                    )}
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  )}

                  <Controller
                    name="category"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <Text
                          allowFontScaling={false}
                          style={styles.headerText}
                        >
                          {i18n.t("global.businessCategory")}
                        </Text>
                        <TouchableOpacity
                          style={styles.selectContainer}
                          onPress={toggleDropdown}
                        >
                          <Text
                            allowFontScaling={false}
                            style={styles.selectText}
                          >
                            {value || "Please Select"}
                          </Text>
                          <View style={styles.dropdownIcon}>
                            <AntDesign
                              name="caretdown"
                              size={18}
                              color="#fff"
                            />
                          </View>
                        </TouchableOpacity>
                        {showDropdown && (
                          <ScrollView
                            style={styles.dropdownContainer}
                            nestedScrollEnabled={true}
                          >
                            {dropdownItems.map((item) => (
                              <TouchableOpacity
                                key={item}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  onChange(item);
                                  handleItemSelect(item);
                                }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={styles.dropdownText}
                                >
                                  {item}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                        {errors.category && (
                          <Text style={styles.errorText}>
                            {errors.category.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>
              </View>
              {isLoading ? (
                <ActivityIndicator size="large" />
              ) : (
                <>
                  {!isKeyboardOpen && (
                    <>
                      <Text
                        allowFontScaling={false}
                        style={styles.thankYouText}
                      >
                        {i18n.t("HangoutDetaile.textone")}
                      </Text>
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.buton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <TouchableOpacity
                          onPress={handleSubmit(handleNext)}
                          style={styles.buttonContent}
                        >
                          <Text
                            allowFontScaling={false}
                            style={styles.buttonText}
                          >
                            {i18n.t("global.thankYou")}
                          </Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </ImageBackground>
        {/* </ScrollView> */}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default EnterData;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
    marginHorizontal: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 6,
  },
  label: {
    marginBottom: 5,
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginHorizontal: 15,
    marginTop: 5,
  },
  inputField: {
    height: 55,
    borderRadius: 6,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#7C7C7C",
    paddingLeft: 10,
    marginBottom: 12,
    borderWidth: 1,
    marginHorizontal: 15,
  },
  flex1: {
    flex: 1,
  },
  phoneInputContainer: {
    width: "100%",
    backgroundColor: "#EDF5F4",
  },
  phoneInputTextContainer: {
    borderLeftWidth: 1,
    backgroundColor: "#EDF5F4",
  },
  inputFieldd: {
    borderRadius: 6,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#7C7C7C",
    borderWidth: 1.2,
    marginHorizontal: 15,
  },
  emailLabel: {
    marginBottom: 5,
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginTop: 8,
    marginHorizontal: 15,
  },
  headerText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginHorizontal: 20,
    marginBottom: 8,
  },
  selectContainer: {
    height: 55,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#7C7C7C",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#1895F0",
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: "#7C7C7C",
  },
  dropdownIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: "100%",
    backgroundColor: "#1895F0",
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownContainer: {
    maxHeight: 150, // Fixed height to enable scrolling
    marginTop: 5,
    marginBottom: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 2,
    marginHorizontal: 20,
    borderRadius: 5,
  },
  dropdownText: {
    fontSize: 16,
    paddingLeft: 20,
  },
  thankYouText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginHorizontal: 20,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
    marginTop: 25,
    marginBottom: 30,
  },
  buton: {
    width: "90%",
    height: 50,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 10,
  },
  buttonContent: {
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
    marginLeft: 20,
    marginBottom: 10,
  },
});
