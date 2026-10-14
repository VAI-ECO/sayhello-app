import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  Platform,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import HangoutHeader from "../../Component/HangoutHeader";
import ProfileHeader from "../../Component/ProfileHeader";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";
import { useLocation } from "../../Context/LocationContext";
import AppConfig from "../../AppConfig";
const ApiKey = AppConfig.ApiKey;
import { useDispatch } from "react-redux";
import { getIAmHear } from "../../features/hangout/hangoutSlice";
import i18n from "../../Context/i18n";

const HangoutLocation = () => {
  const { location } = useLocation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const clearform = router?.params?.clearform;

  const businessName = router?.params?.businessName;

  console.log(from, from2, pathname, clearform, businessName, "p3");

  const [data, setData] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (businessName) {
      setData(businessName);
    }
    if (clearform) {
      setData("");
    }
  }, [router]);

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


  const handleIamhere = async () => {
    setIsLoading(true);
    const apiKey = ApiKey;
    console.log("apiKey", apiKey);
    // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location?.coords?.latitude},${location?.coords?.longitude}&key=${apiKey}`;

    const body = {
      latitude: location?.coords?.latitude,
      longitude: location?.coords?.longitude,
      apiKey: apiKey,
    };

    dispatch(getIAmHear(body))
      .unwrap()
      .then(() => {
        navigation.navigate("HangoutDetaile", {
          businessName: data,
          from: from,
          from2: from2,
          fromsecond: pathname,
          clearform: true,
        });
        setIsLoading(false);
      })
      .catch((error) => {
      console.log("Error:", error);
      setIsLoading(false);
      });

    //   try {
    //     // const response = await axios.get(url);
    //     // const results = response.data.results[0];
    //     console.log(results,"result is this")
    //     if (results) {
    //       // Get formatted address
    //       const formattedAddress = results.formatted_address;

    //       // Extract the components for city, state, and zip code
    //       let city = "";
    //       let state = "";
    //       let zipCode = "";

    //       results.address_components.forEach((component) => {
    //         const types = component.types;

    //         if (types.includes("locality")) {
    //           city = component.long_name;
    //         }

    //         if (types.includes("administrative_area_level_1")) {
    //           state = component.short_name;
    //         }

    //         if (types.includes("postal_code")) {
    //           zipCode = component.long_name;
    //         }
    //       });

    //       console.log("Formatted Address:", formattedAddress);
    //       console.log("City:", city);
    //       console.log("State:", state);
    //       console.log("Zip Code:", zipCode);

    //       // Set the formatted address (or any other component as needed)
    //       setRouteLocaion(formattedAddress);

    //       // Optionally, navigate to another screen with the extracted data
    //       navigation.navigate("HangoutDetaile", {
    //         businessName: data,
    //         formatted_address: formattedAddress,
    //         city: city,
    //         state: state,
    //         zipCode: zipCode,
    //       });
    //       setIsLoading(false);
    //     }
    //   } catch (error) {
    //     console.log("Error:", error);
    //     setIsLoading(false);
    //   }
  };

  const handleIamNotThere = () => {
    navigation.navigate("HangoutDetaile", {
      businessName: data,
      from: from,
      from2: from2,
      fromsecond: pathname,
      clearform: true,
    });
  };

  const handleBack = () => {
    navigation.navigate(from2, { from: from });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : null}
          >
            <View style={styles.container}>
              <ProfileHeader handleBack={handleBack} />
              <HangoutHeader />
              {isLoading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" />
                </View>
              ) : (
                <View
                  style={{
                    paddingTop: 10,
                    paddingHorizontal: 25,
                    flex: 1,
                  }}
                >
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.businessName")}
                  </Text>
                  <TextInput
                    allowFontScaling={false}
                    placeholder={i18n.t("global.enterBusinessName")}
                    style={{
                      ...styles.inputField,
                      fontSize: 14,
                      fontFamily: "Roboto-Regular",
                      fontWeight: "400",
                      color: "#000000",
                      paddingLeft: 20,
                    }}
                    value={data}
                    onChangeText={(text) => setData(text)}
                    placeholderTextColor="#000000"
                  />
                  <TouchableOpacity
                    style={{ width: "20%", alignSelf: "center" }}
                    onPress={() => handleIamhere()}
                  >
                    <Image
                      style={{
                        resizeMode: "contain",
                        alignSelf: "center",
                        width: wp(50),
                      }}
                      source={require("../../assets/here.png")}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ width: "20%", alignSelf: "center" }}
                    onPress={handleIamNotThere}
                  >
                    <Image
                      style={{
                        resizeMode: "contain",
                        alignSelf: "center",
                        width: wp(50),
                      }}
                      source={require("../../assets/there.png")}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HangoutLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  inputField: {
    width: "100%",
    height: 53,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    marginBottom: 20,
    alignSelf: "center",
    borderWidth: 1,
  },
  label: {
    marginBottom: 6,
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
    fontFamily: "Roboto-Regular",
  },
});
