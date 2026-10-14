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
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import PhoneInput from "react-native-phone-number-input";
import { useAuth } from "../../Context/AuthContext";
import Header from "../../Component/Header";
import axios from "axios";
import AppConfig from "../../AppConfig";
import BusinessService from "../../Services/BusinessService";
import Toast from "react-native-toast-message";
import CustomePhoneInput from "../../Component/CustomePhoneInput";
import i18n from "../../Context/i18n";
import Loader from "../../Component/Loader";
import { ApiKey } from '@env';

const statesData = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
];

const AmbBusinesEnterData = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const clearform = router?.params?.clearform;
  const clearFormAutofill = router?.params?.clearFormAutofill;
  const businessInfo = router?.params?.businessInfo;

  console.log(from, from2, pathname, clearform, clearFormAutofill, businessInfo, "p3");

  // console.log("businessInfo", JSON.stringify(businessInfo));

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

  const [isValidEmail, setIsValidEmail] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    if (clearform) {
      setPhoneNumber(" ");
      setStreetAddress("");
      setCity("");
      setName("");
      setEmail("");
      setState("");
      setContact("");
      setZipcode("");
    }
    if (clearFormAutofill) {
      setPhoneNumber(" ");
      setContact("");
      setEmail("");
    }
  }, [router]);

  useEffect(() => {
    const getLocation = async ({ lat, lng }) => {
      try {
        const res = await axios.post(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${ApiKey}`
        );

        const addressComponents = res.data?.results?.[0]?.address_components;

        let city = "";
        let state = "";
        let zipcode = "";

        if (addressComponents) {
          addressComponents.forEach((component) => {
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
            if (component.types.includes("administrative_area_level_1")) {
              state = component.short_name;
            }
            if (component.types.includes("postal_code")) {
              zipcode = component.long_name;
            }
          });
          setCity(city);
          setState(state);
          setZipcode(zipcode);
        } else {
          console.log("No address components found.");
        }
      } catch (error) {
        console.log("Error getting location", error);
      }
    };

    if (businessInfo) {
      setName(businessInfo.name);
      setStreetAddress(businessInfo.formatted_address);
      getLocation(businessInfo?.geometry?.location);
    }
  }, [businessInfo]);

  const handleStreetAddressChange = (text) => {
    setStreetAddress(text.trim());
  };

  const handleCityChange = (text) => {
    setCity(text.trim());
  };

  const handleStateChange = (value) => {
    setState(value);
    setShowDropdown(false);
  };

  const handleZipcodeChange = (text) => {
    setZipcode(text.trim());
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

  const handleValidation = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        Toast.show({
          type: "error",
          text1: `Please enter your ${key}`,
          autoHide: true,
          visibilityTime: 5000,
        });
        return false;
      }
    }
    return true;
  };

  const handelSubmitDetails = async () => {
    setIsLoading(true);

    if (!phone_number) {
      Toast.show({
        type: "error",
        text1: "Please enter phone number",
        autoHide: true,
        visibilityTime: 2000,
      });

      setIsLoading(false);
      return;
    }

    const fields = {
      name,
      address: streetAddress,
      city,
      state,
      zipcode,
      "phone number": phone_number,
      email,
      "contact name": contact,
    };

    if (!handleValidation(fields)) {
      setIsLoading(false);
      return;
    }

    const bodyDetails = {
      details: {
        name: name,
        address: streetAddress,
        city: city,
        state: state,
        zipcode: zipcode,
        phone: formattedValue,
        email: email,
        contactName: contact,
      },
      ambassadorId: user?.user?._id,
    };

    try {
      const res = await BusinessService.suggestBusinessAmbinsdaor(bodyDetails);
      console.log("Business created successfully", res);
      if (res?.message) {
        console.log("message exits");

        navigation.navigate("AmbassadorInfo", {
          details: res,
          from: from,
          from2: from2,
          from3: pathname,
          clearform: true,
          clearFormAutofill: clearFormAutofill,
          businessInfo: businessInfo
        });
      } else {
        console.log("message nott exits");
        navigation.navigate("AmbBusinesPostImage", {
          details: res,
          from: from,
          from2: from2,
          from3: pathname,
          clearform: true,
          clearFormAutofill: clearFormAutofill,
          businessInfo: businessInfo
        });
      }
    } catch (err) {
      console.error("Error creating business", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([getLocation(businessInfo?.geometry?.location)]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    navigation.navigate(from2, { from: from });
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.main}>
        <ImageBackground
          source={require("../../assets/ImageBackground.jpg")}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <Header title="" />
            <Image
              source={require("../../assets/busniessicon.png")}
              style={styles.orglogo}
              resizeMode="contain"
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.flex1}
            >
              <ScrollView>
                <View style={styles.formContainer}>
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.businessName")} 
                  </Text>
                  <TextInput
                    allowFontScaling={false}
                    placeholder="Enter Business Name"
                    style={styles.inputField}
                    value={name}
                    onChangeText={(text) => setName(text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#7C7C7C"
                  />
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.address")}
                  </Text>
                  <TextInput
                    allowFontScaling={false}
                    placeholder="Enter Street Address"
                    style={styles.inputField}
                    value={streetAddress}
                    onChangeText={handleStreetAddressChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#7C7C7C"
                  />
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text allowFontScaling={false} style={styles.label}>
                        {i18n.t("global.city")}
                      </Text>
                      <TextInput
                        allowFontScaling={false}
                        placeholder="City"
                        style={styles.inputField}
                        value={city}
                        onChangeText={handleCityChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#7C7C7C"
                      />
                    </View>
                    <View style={styles.column}>
                      <Text allowFontScaling={false} style={styles.label}>
                        {i18n.t("global.state")}
                      </Text>
                      <TextInput
                        allowFontScaling={false}
                        placeholder="State"
                        style={styles.inputField}
                        value={state}
                        onChangeText={handleStateChange}
                        // keyboardType="numeric"
                        placeholderTextColor="#7C7C7C"
                      />
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
                      <TextInput
                        allowFontScaling={false}
                        placeholder="Zipcode"
                        style={styles.inputField}
                        value={zipcode}
                        onChangeText={handleZipcodeChange}
                        keyboardType="numeric"
                        placeholderTextColor="#7C7C7C"
                      />
                    </View>
                  </View>
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.enterBusinessPhone")}
                  </Text>
                  <View style={styles.inputFieldd}>
                    <CustomePhoneInput
                      value={phone_number}
                      onChangeText={setPhoneNumber}
                      placeholder="Enter phone number"
                    />
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={styles.emailLabel}
                  >
                    {i18n.t("global.enterBusinessEmail")}
                  </Text>
                  <TextInput
                    allowFontScaling={false}
                    placeholder="Enter email"
                    style={[
                      styles.inputField,
                      !isValidEmail && styles.inputError,
                    ]}
                    value={email}
                    onChangeText={handleEmailChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#7C7C7C"
                  />
                  {!isValidEmail && (
                    <Text style={styles.errorText}>
                      {i18n.t("global.pleaseEnterValidEmail")}
                    </Text>
                  )}
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.enterContactName")}
                  </Text>
                  <TextInput
                    allowFontScaling={false}
                    placeholder="Enter Contact Name"
                    style={styles.inputField}
                    value={contact}
                    onChangeText={(text) => setContact(text)}
                    autoCorrect={false}
                    placeholderTextColor="#7C7C7C"
                  />
                </View>
              </ScrollView>
              {!isKeyboardOpen && (
                <TouchableOpacity
                  onPress={handelSubmitDetails}
                  disabled={isLoading}
                  style={styles.touchableOpacity}
                >
                  <LinearGradient
                    colors={["#338AFF", "#00EDB4"]}
                    style={styles.buton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.2, y: 0.6 }}
                  >
                    <TouchableOpacity
                      onPress={handelSubmitDetails}
                      disabled={isLoading}
                    >
                      <View         
                      >
                        {isLoading ? (
                          <Loader />
                        ) : (
                          <>
                            <Text
                              allowFontScaling={false}
                              style={styles.textbtn}
                            >
                              {i18n.t("global.submit")}
                            </Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </KeyboardAvoidingView> 
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
    // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    //   <SafeAreaView style={styles.main}>
    //     <ScrollView
    //       contentContainerStyle={{ flexGrow: 1 }}
    //       refreshControl={
    //         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} />
    //       }
    //     >
    //       <ImageBackground
    //         source={require("../../assets/ImageBackground.jpg")}
    //         style={styles.imageBackground}
    //         resizeMode="cover"
    //       >
    //         <View style={styles.container}>
    //           <Header title="" handleBack={handleBack} />
    //           <Image
    //             source={require("../../assets/busniessicon.png")}
    //             style={styles.orglogo}
    //             resizeMode="contain"
    //           />
    //           <KeyboardAvoidingView
    //             behavior={Platform.OS === "ios" ? "padding" : "height"}
    //             style={styles.flex1}
    //           >
    //             <ScrollView
    //               contentContainerStyle={{ paddingBottom: 20 }} // Add bottom padding to make sure content is visible
    //               keyboardShouldPersistTaps="handled" // Ensure taps are handled even when the keyboard is open
    //             >
    //               <View style={styles.formContainer}>
    //                 <Text allowFontScaling={false} style={styles.label}>
    //                   {i18n.t("global.businessName")}
    //                 </Text>
    //                 <TextInput
    //                   allowFontScaling={false}
    //                   placeholder="Enter Business Name"
    //                   style={styles.inputField}
    //                   value={name}
    //                   onChangeText={(text) => setName(text)}
    //                   autoCapitalize="none"
    //                   autoCorrect={false}
    //                   placeholderTextColor="#7C7C7C"
    //                 />
    //                 <Text allowFontScaling={false} style={styles.label}>
    //                   {i18n.t("global.address")}
    //                 </Text>
    //                 <TextInput
    //                   allowFontScaling={false}
    //                   placeholder="Enter Street Address"
    //                   style={styles.inputField}
    //                   value={streetAddress}
    //                   onChangeText={handleStreetAddressChange}
    //                   autoCapitalize="none"
    //                   autoCorrect={false}
    //                   placeholderTextColor="#7C7C7C"
    //                 />
    //                 <View style={styles.row}>
    //                   <View style={styles.column}>
    //                     <Text allowFontScaling={false} style={styles.label}>
    //                       {i18n.t("global.city")}
    //                     </Text>
    //                     <TextInput
    //                       allowFontScaling={false}
    //                       placeholder="City"
    //                       style={styles.inputField}
    //                       value={city}
    //                       onChangeText={handleCityChange}
    //                       autoCapitalize="none"
    //                       autoCorrect={false}
    //                       placeholderTextColor="#7C7C7C"
    //                     />
    //                   </View>
    //                   <View style={styles.column}>
    //                     <Text allowFontScaling={false} style={styles.label}>
    //                       {i18n.t("global.state")}
    //                     </Text>
    //                     <TextInput
    //                       allowFontScaling={false}
    //                       placeholder="State"
    //                       style={styles.inputField}
    //                       value={state}
    //                       onChangeText={handleStateChange}
    //                       placeholderTextColor="#7C7C7C"
    //                     />
    //                     {showDropdown && (
    //                       <FlatList
    //                         data={statesData}
    //                         renderItem={({ item }) => (
    //                           <TouchableWithoutFeedback
    //                             onPress={() => handleStateChange(item.value)}
    //                           >
    //                             <Text
    //                               allowFontScaling={false}
    //                               style={styles.stateItem}
    //                             >
    //                               {item.label}
    //                             </Text>
    //                           </TouchableWithoutFeedback>
    //                         )}
    //                         keyExtractor={(item) => item.value}
    //                         style={styles.flatList}
    //                       />
    //                     )}
    //                   </View>

    //                   <View style={styles.column}>
    //                     <Text allowFontScaling={false} style={styles.label}>
    //                       {i18n.t("global.zipcode")}
    //                     </Text>
    //                     <TextInput
    //                       allowFontScaling={false}
    //                       placeholder="Zipcode"
    //                       style={styles.inputField}
    //                       value={zipcode}
    //                       onChangeText={handleZipcodeChange}
    //                       keyboardType="numeric"
    //                       placeholderTextColor="#7C7C7C"
    //                     />
    //                   </View>
    //                 </View>
    //                 <Text allowFontScaling={false} style={styles.label}>
    //                   {i18n.t("global.enterBusinessPhone")}
    //                 </Text>
    //                 <View style={styles.inputFieldd}>
    //                   <CustomePhoneInput
    //                     value={phone_number}
    //                     onChangeText={setPhoneNumber}
    //                     placeholder="Enter phone number"
    //                     editable={true}
    //                   />
    //                 </View>
    //                 <Text
    //                   allowFontScaling={false}
    //                   style={styles.emailLabel}
    //                 >
    //                   {i18n.t("global.enterBusinessEmail")}
    //                 </Text>
    //                 <TextInput
    //                   allowFontScaling={false}
    //                   placeholder="Enter email"
    //                   style={[
    //                     styles.inputField,
    //                     !isValidEmail && styles.inputError,
    //                   ]}
    //                   value={email}
    //                   onChangeText={handleEmailChange}
    //                   autoCapitalize="none"
    //                   autoCorrect={false}
    //                   placeholderTextColor="#7C7C7C"
    //                 />
    //                 {!isValidEmail && (
    //                   <Text style={styles.errorText}>
    //                     {i18n.t("global.pleaseEnterValidEmail")}
    //                   </Text>
    //                 )}
    //                 <Text allowFontScaling={false} style={styles.label}>
    //                   {i18n.t("global.enterContactName")}
    //                 </Text>
    //                 <TextInput
    //                   allowFontScaling={false}
    //                   placeholder="Enter Contact Name"
    //                   style={styles.inputField}
    //                   value={contact}
    //                   onChangeText={(text) => setContact(text)}
    //                   autoCorrect={false}
    //                   placeholderTextColor="#7C7C7C"
    //                 />
    //               </View>
    //             </ScrollView>
    //             {!isKeyboardOpen && (
    //               <TouchableOpacity
    //                 onPress={handelSubmitDetails}
    //                 disabled={isLoading}
    //                 style={styles.touchableOpacity}
    //               >
    //                 <LinearGradient
    //                   colors={["#338AFF", "#00EDB4"]}
    //                   style={styles.buton}
    //                   start={{ x: 0, y: 0 }}
    //                   end={{ x: 1.2, y: 0.6 }}
    //                 >
    //                   <TouchableOpacity
    //                     onPress={handelSubmitDetails}
    //                     disabled={isLoading}
    //                   >
    //                     <View>
    //                       {isLoading ? (
    //                         <Loader />
    //                       ) : (
    //                         <>
    //                           <Text
    //                             allowFontScaling={false}
    //                             style={styles.textbtn}
    //                           >
    //                             {i18n.t("global.submit")}
    //                           </Text>
    //                         </>
    //                       )}
    //                     </View>
    //                   </TouchableOpacity>
    //                 </LinearGradient>
    //               </TouchableOpacity>
    //             )}
    //           </KeyboardAvoidingView>
    //         </View>
    //       </ImageBackground>
    //     </ScrollView>
    //   </SafeAreaView>
    // </TouchableWithoutFeedback>

  );
};

export default AmbBusinesEnterData;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    paddingTop: 45,
  },
  imageBackground: {
    position: "absolute",
    right: 0,
    bottom: 0,
    flex: 1,
    left: 0,
    top: 0,
  },

  formContainer: {
    flex: 1,
    paddingVertical: 15,
    marginHorizontal: 20,
  },
  label: {
    marginBottom: 5,
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  emailLabel: {
    marginBottom: 5,
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginTop: 10,
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
    height: 40,
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
    width: 100,
    height: 100,
    borderRadius: 7,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    top: -4,
  },
  touchableOpacity: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 5,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
