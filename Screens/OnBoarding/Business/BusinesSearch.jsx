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
} from "react-native";
import React, { useEffect, useState } from "react";
import { debounce } from "lodash";

import { LinearGradient } from "expo-linear-gradient";
import { Entypo } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Header from "../../../Component/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BusinessService from "../../../Services/BusinessService";
import Loader from "../../../Component/Loader";
import Icon from "react-native-vector-icons/Entypo";
import i18n from "../../../Context/i18n";

const BusinesSearch = () => {
  const route = useRoute();
  const [data, setData] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [businessList, setBusinessList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigation = useNavigation();

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
    if (value.length > 0) {
      setError("");
    }
  };

  const handleSelect = async(item) => {
    console.log("Select business", item);
    await AsyncStorage.setItem("BusinessDetails", JSON.stringify(item));
    navigation.navigate("EnterData", {
      businessInfo: item,
    });

    setData("");
  };

  const handleSubmit = () => {
    if (data.trim() === "") {
      setError("* Business name is required");
    } else {
      navigation.navigate("EnterData", {
        businessInfo: null,
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ImageBackground
          source={require("../../../assets/ImageBackground.jpg")}
          style={{
            flex: 1,
          }}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : null}
          >
            <View style={styles.container}>
              <>
                {/* <Header title="" /> */}
                <Image
                  source={require("../../../assets/busniessicon.png")}
                  style={styles.orglogo}
                  resizeMode="contain"
                />
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
                  {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
                  {isLoading ? (
                    <Loader />
                  ) : (
                    <>
                      <FlatList
                        data={businessList}
                        keyExtractor={(item) => item?.place_id}
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
                                    fontFamily: "Roboto-Regular",
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
                          height: 350,
                        }}
                      />
                      {businessList.length > 0 && (
                        <ScrollView>
                          <View style={{}}>
                            <Text
                              allowFontScaling={false}
                              style={{
                                fontSize: 16,
                                fontWeight: "900",
                                fontFamily: "Roboto-Bold",
                                color: "#000000",
                                textAlign: "center",
                                marginBottom: 8,
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
                                  navigation.navigate("EnterData", {
                                    businessInfo: null,
                                  })
                                }
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "400",
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
              </>
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
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
                  <Text allowFontScaling={false} style={styles.textbtn}>
                    {i18n.t("global.back")}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
              >
                <View style={styles.buttonContent}>
                  <Text allowFontScaling={false} style={styles.textbtn}>
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
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BusinesSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 55,
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
    marginBottom: 7,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: 10,
    paddingVertical: 17,
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
    bottom: 10,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
  },
  clickbutton: {
    width: "30%",
    height: 35,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 15,
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
});
