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
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";
import { Entypo } from "@expo/vector-icons";
import { debounce } from "lodash";
import { useNavigation, useRoute } from "@react-navigation/native";
import HangoutHeader from "../../Component/HangoutHeader";
import ProfileHeader from "../../Component/ProfileHeader";
import Loader from "../../Component/Loader";
import BusinessService from "../../Services/BusinessService";
import axios from "axios";
import { ApiKey } from "@env";
// import { ApiKey } from '@env';
import { getIAmHear } from "../../features/hangout/hangoutSlice";
import { useDispatch } from "react-redux";
import i18n from "../../Context/i18n";

const HangoutSearch = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const clearform = router?.params?.clearform;

  console.log(from, pathname, clearform, "p2");

  const [data, setData] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [businessList, setBusinessList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userMeetups, SetUserMeetups] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      setData("");
      setBusinessList([]);
    }

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [router]);

  const SearchBusiness = async (searchTerm) => {
    setIsLoading(true); // Start loader
    try {
      const response = await BusinessService.searchBusiness(searchTerm);
      setBusinessList(response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const handleInputChange = (value) => {
    setData(value);
    if (value.length >= 3) {
      SearchBusiness(value);
    } else {
      setBusinessList([]); // Clear list if input is less than 3 characters
    }
  };

  const handleSelect = async (item) => {
    console.log("Select business", item);
    setLoading(true);

    // console.log("item", JSON.stringify);

    // const apiKey = ApiKey;
    // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${item?.geometry?.location?.lat},${item?.geometry?.location?.lng}&key=${apiKey}`;

    // const apiKey = ApiKey;
    const body = {
      latitude: item?.geometry?.location?.lat,
      longitude: item?.geometry?.location?.lng,
      // apiKey: apiKey
    };

    dispatch(getIAmHear(body))
      .then(() => {
        navigation.navigate("HangoutDetaile", {
          businessName: item?.name,
          from: from,
          from2: pathname,
          clearFormAutofill: true,
        });
        setLoading(false);
      })
      .catch(error)(() => {
      console.log("Error:", error);
      setIsLoading(false);
    });
  };

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   try {
  //     await Promise.all([SearchBusiness(data)]);
  //   } catch (error) {
  //     console.error("Error refreshing data:", error);
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };0

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([SearchBusiness(data)]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    navigation.navigate(from);
  };

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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : null}
          >
            <View style={styles.container}>
              <ProfileHeader handleBack={handleBack} />
              <HangoutHeader />

              <View
                style={{
                  paddingTop: 10,
                  paddingHorizontal: 25,
                  flex: 1,
                }}
              >
                <Text allowFontScaling={false} style={styles.label}>
                  {i18n.t("global.enterBusinessName")}
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
                  onChangeText={(text) => handleInputChange(text)}
                  placeholderTextColor="#000000"
                />
                {isLoading ? (
                  <Loader />
                ) : (
                  <>
                    <FlatList
                      data={businessList}
                      keyExtractor={(item) => item?.place_id}
                      contentContainerStyle={{ flexGrow: 1 }}
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      scrollEnabled
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.detailscontainer}
                          onPress={() => handleSelect(item)}
                        >
                          <View style={styles.innerContainer}>
                            <View style={{ marginLeft: 10 }}>
                              <Text
                                allowFontScaling={false}
                                style={{
                                  fontSize: 16,
                                  fontWeight: "bold",
                                  fontFamily: "Roboto-Bold",
                                  color: "#000000",
                                }}
                              >
                                {item?.name}
                              </Text>

                              <Text
                                allowFontScaling={false}
                                style={{
                                  fontSize: 14,
                                  fontWeight: "300",
                                  fontFamily: "Roboto-Regular",
                                  color: "#000000",
                                }}
                              >
                                {item?.formatted_address.length > 60
                                  ? `${item?.formatted_address.substring(
                                      0,
                                      60
                                    )}...`
                                  : item?.formatted_address}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                      style={{
                        width: "100%",
                        height: 310,
                      }}
                    />
                    {businessList.length > 0 && (
                      <ScrollView>
                        <View style={{ paddingTop: 20 }}>
                          <Text
                            allowFontScaling={false}
                            style={{
                              fontSize: 16,
                              fontWeight: "900",
                              fontFamily: "Roboto-Bold",
                              color: "#000000",
                              textAlign: "center",
                              marginBottom: 5,
                            }}
                          >
                            {i18n.t("global.dontseeit")}
                          </Text>
                          <LinearGradient
                            colors={["#F01717", "#F01717"]}
                            style={styles.clickbutton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1.2, y: 0.6 }}
                          >
                            <TouchableOpacity
                              style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onPress={() =>
                                navigation.navigate("HangoutLocation", {
                                  businessName: null,
                                  from: from,
                                  from2: pathname,
                                  clearform: true,
                                })
                              }
                            >
                              <Text
                                allowFontScaling={false}
                                style={{
                                  fontSize: 16,
                                  fontWeight: "700",
                                  fontFamily: "Inter-Regular",
                                  color: "#fff",
                                }}
                              >
                                {i18n.t("global.clickHere")}
                              </Text>
                            </TouchableOpacity>
                          </LinearGradient>
                        </View>
                      </ScrollView>
                    )}
                  </>
                )}
              </View>
              {loading ? (
                <Loader />
              ) : (
                <>
                  {isKeyboardOpen ? null : (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("HangoutLocation", {
                          businessName: null,
                          from: from,
                          from2: pathname,
                          clearform: true,
                        })
                      }
                      style={styles.btncontainer}
                    >
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.buton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("HangoutLocation", {
                              businessName: null,
                              from: from,
                              from2: pathname,
                              clearform: true,
                            })
                          }
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              marginLeft: 10,
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
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
        {/* </ScrollView> */}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HangoutSearch;

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
    marginBottom: 10,
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
  textbtn: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  label: {
    marginBottom: 6,
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
    fontFamily: "Roboto-Regular",
  },
  detailscontainer: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000000",
    marginBottom: 10,
    padding: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  detailImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 6,
    marginTop: 6,
  },
  seecontainer: {
    width: "100%",
    height: 53,
    backgroundColor: "#EDF5F4",
    marginBottom: 15,
    borderWidth: 1,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: "center",
    alignSelf: "center",
  },
  btncontainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 8,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 7,
  },
  clickbutton: {
    width: "30%",
    height: 35,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 70,
  },
});
