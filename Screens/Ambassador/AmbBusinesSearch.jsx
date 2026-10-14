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
  FlatList,
  ToastAndroid,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { debounce } from "lodash";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import haversine from "haversine-distance";

import Header from "../../Component/Header";
import BusinessService from "../../Services/BusinessService";
import i18n from "../../Context/i18n";

const AmbBusinesSearch = () => {
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const clearform = router?.params?.clearform;

  const [data, setData] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [businessList, setBusinessList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardOpen(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardOpen(false));
    if (clearform) {
      setData("");
      setBusinessList([]);
    }
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [router]);

  // Obtain ambassador's current GPS on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'App needs location permission to verify your presence.'
        );
        return;
      }
      try {
        const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        setUserCoords(coords);
      } catch (e) {
        console.log(e);
        Alert.alert('Error', 'Unable to fetch location.');
      }
    })();
  }, []);

  const SearchBusiness = async (searchTerm) => {
    try {
      BusinessService.searchBusiness(searchTerm)
        .then((response) => {
          setBusinessList(response);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const debouncedSearch = debounce((value) => {
    if (value.length >= 3) {
      SearchBusiness(value);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(data);
    return () => debouncedSearch.cancel();
  }, [data]);

  const handleInputChange = (value) => {
    setIsLoading(true);
    setData(value);
  };

  const handleSelect = (item) => {
    if (!userCoords) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Waiting for GPS…', ToastAndroid.SHORT);
      } else {
        Alert.alert('Waiting for GPS…');
      }
      return;
    }
    const bizCoords = {
      latitude: item.geometry.location.lat,
      longitude: item.geometry.location.lng,
    };
    const dist = haversine(userCoords, bizCoords);
    if (dist <= 100) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Location verified ✅', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Location verified');
      }
      navigation.navigate("AmbBusinesEnterData", {
        businessInfo: item,
        from,
        from2: pathname,
        clearFormAutofill: true,
      });
    } else {
      const msg = `You’re ${Math.round(dist)} m away—move closer to verify.`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.LONG);
      } else {
        Alert.alert('Too far from business', msg);
      }
    }
  };

  const handleBack = () => navigation.navigate(from);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require("../../assets/ImageBackground.jpg")}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : null}
          >
            <View style={styles.container}>
              <Header title="" handleBack={handleBack} />
              <Image
                source={require("../../assets/busniessicon.png")}
                style={styles.orglogo}
                resizeMode="contain"
              />
              <View style={styles.contentContainer}>
                <Text style={styles.label} allowFontScaling={false}>
                  {i18n.t("global.enterBusinessName")}
                </Text>
                <TextInput
                  placeholder={i18n.t("global.enterBusinessName")}
                  style={styles.inputField}
                  value={data}
                  onChangeText={handleInputChange}
                  placeholderTextColor="#000"
                />

                <FlatList
                  data={businessList}
                  keyExtractor={(item) => item.place_id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.detailsContainer}
                      onPress={() => handleSelect(item)}
                    >
                      <View style={styles.innerContainer}>
                        <View style={styles.businessTextContainer}>
                          <Text style={styles.businessName} allowFontScaling={false}>
                            {item.name}
                          </Text>
                          <Text style={styles.businessAddress} allowFontScaling={false}>
                            {item.formatted_address.length > 60
                              ? `${item.formatted_address.substring(0, 60)}...`
                              : item.formatted_address}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  style={styles.flatList}
                />

                {businessList.length > 0 && (
                  <ScrollView>
                    <View style={styles.noBusinessContainer}>
                      <Text style={styles.dontSeeText} allowFontScaling={false}>
                        {i18n.t("global.dontseeit")}
                      </Text>
                      <LinearGradient
                        colors={["#F01717", "#F01717"]}
                        style={styles.clickButton}
                      >
                        <TouchableOpacity
                          style={styles.centerContent}
                          onPress={() =>
                            navigation.navigate("AmbBusinesEnterData", {
                              businessInfo: null,
                              from,
                              from2: pathname,
                              clearform: true,
                            })
                          }
                        >
                          <Text style={styles.clickHereText} allowFontScaling={false}>
                            {i18n.t("global.clickHere")}
                          }</Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                  </ScrollView>
                )}

                {!isKeyboardOpen && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("AmbBusinesEnterData", {
                        businessInfo: null,
                        from,
                        from2: pathname,
                        clearform: true,
                      })
                    }
                  >
                    <View style={styles.btnContainer}>
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.button}
                      >
                        <Text style={styles.textBtn} allowFontScaling={false}>
                          {i18n.t("global.next")}
                        </Text>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default AmbBusinesSearch;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 45,
  },
  orglogo: {
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 7,
  },
  contentContainer: {
    paddingTop: 10,
    paddingHorizontal: 25,
    flex: 1,
  },
  label: {
    marginBottom: 6,
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
    fontFamily: "Roboto-Regular",
  },
  inputField: {
    width: "100%",
    height: 53,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    marginBottom: 10,
    borderWidth: 1,
    paddingLeft: 20,
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "400",
    color: "#000000",
  },
  flatList: {
    width: "100%",
    height: 310,
  },
  detailsContainer: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000000",
    marginBottom: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  businessTextContainer: {
    marginLeft: 10,
  },
  businessName: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
  businessAddress: {
    fontSize: 14,
    fontWeight: "300",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },
  noBusinessContainer: {
    paddingTop: 20,
  },
  dontSeeText: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Roboto-Bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 5,
  },
  clickButton: {
    width: "30%",
    height: 35,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 70,
  },
  clickHereText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter-Regular",
    color: "#fff",
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  textBtn: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
