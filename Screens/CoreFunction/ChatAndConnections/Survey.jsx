import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  ImageBackground,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Feather } from "@expo/vector-icons";

import { useNavigation, useRoute } from "@react-navigation/native";
import userService from "../../../Services/userService";
import { useAuth } from "../../../Context/AuthContext";
import i18n from "../../../Context/i18n";

const { width, height } = Dimensions.get("window");
const marginBottom = width <= 360 ? height * 0.001 : width < 768 ? height * 0.001 : height * 0.001;
const marginTop = width <= 360 ? height * 0.002 : width < 768 ? height * 0.01 : height * 0.01

const Survey = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const name = route?.name;
  const from = route?.params?.from;
  const from2 = route?.params?.from2;
  const from3 = route?.params?.from3;
  const userDetails = route.params.userDetails;

  console.log(from, from2, from3, name, userDetails, "p4");

  const handelNextButton = () => {
    navigation.navigate("OpenChat", { userDetails: userDetails, from: from, from2: from2, from3: from3, from4: name });
  };

  const getDetails = () => {
    userService
      .getUserBussinessDetails(`${userDetails?._id}`)
      .then((res) => {
        setProfession(res.currentProfession);
        setIndustry(res.briefIndustry);
        setSkill(res?.skills);
        setSelectedInterests(res.businessTypes);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  useEffect(() => {
    getDetails();
  }, []);

  const goBack = () => {
    navigation.goBack();
  };
  const [profession, setProfession] = useState("");
  const [skill, setSkill] = useState("");
  const [industry, setIndustry] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState("Networking");
  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
  };
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
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

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([getDetails()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };
  const handleBack = () => {
    navigation.navigate(from3, { from: from,from2: from2, userDetails: userDetails })
  }

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
            <View style={styles.headrecontainer}>
              <TouchableOpacity onPress={handleBack ? handleBack : goBack}>
                <Image
                  style={{
                    width: 35,
                    height: 35,
                    resizeMode: "contain",
                  }}
                  source={require("../../../assets/btnbtn.png")}
                />
              </TouchableOpacity>
              <Image
                style={{
                  width: 35,
                  height: 35,
                  resizeMode: "contain",
                  // alignSelf: "center",
                }}
                source={require("../../../assets/busnisesbag.png")}
              />
              <Entypo name="menu" size={26} color="black" />
            </View>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} />
              }
            >
              {/* <View style={{ height: "50%" }}> */}
              <View
                style={{
                  paddingTop: 25,
                  paddingHorizontal: 20,
                }}
              >
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                  <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        marginBottom: 10,
                        color: "#707070",
                        fontWeight: "600",
                        fontSize: 16,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {i18n.t("global.currentProfession")}
                    </Text>
                    <TextInput
                      allowFontScaling={false}
                      editable={false}
                      placeholder="Type here..."
                      style={{
                        ...styles.inputField,
                        fontSize: 16,
                        fontFamily: "Roboto-Regular",
                        fontWeight: "400",
                        color: "#A7A7A8",
                        paddingLeft: 20,
                      }}
                      value={profession}
                      placeholderTextColor="#A7A7A8"
                    />
                  </KeyboardAvoidingView>
                </KeyboardAvoidingView>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                  <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        marginBottom: 10,
                        color: "#707070",
                        fontWeight: "600",
                        fontSize: 16,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {i18n.t("global.Whatspecificskills")}
                    </Text>
                    <TextInput
                      allowFontScaling={false}
                      editable={false}
                      placeholder="Enter..."
                      style={{
                        ...styles.inputField,
                        fontSize: 16,
                        fontFamily: "Roboto-Regular",
                        fontWeight: "400",
                        color: "#A7A7A8",
                        paddingLeft: 20,
                      }}
                      value={skill}
                      placeholderTextColor="#A7A7A8"
                    />
                  </KeyboardAvoidingView>
                </KeyboardAvoidingView>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                  <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        marginBottom: 10,
                        color: "#707070",
                        fontWeight: "600",
                        fontSize: 16,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {" "}
                      {i18n.t("global.describeIndustry")}
                    </Text>
                    <TextInput
                      allowFontScaling={false}
                      editable={false}
                      placeholder="Write here..."
                      style={{
                        ...styles.inputField,
                        fontSize: 16,
                        fontFamily: "Roboto-Regular",
                        fontWeight: "400",
                        color: "#A7A7A8",
                        paddingLeft: 20,
                        height: 90,
                        paddingLeft: 20,
                        paddingRight: 20,
                      }}
                      value={industry}
                      placeholderTextColor="#A7A7A8"
                      multiline={true}
                      textInputAccessoryViewID={"none"}
                    />
                  </KeyboardAvoidingView>
                </KeyboardAvoidingView>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: height * 0.1
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  {[
                    "Networking",
                    "Mentorship",
                    "Collaboration",
                  ].map((interest) => (
                    <TouchableWithoutFeedback key={interest}>
                      <View style={{ width: "32%", marginBottom: 20 }}>
                        <LinearGradient
                          colors={
                            selectedInterests.includes(interest)
                              ? ["#338AFF", "#00EDB4"]
                              : ["#fff", "#fff"]
                          }
                          style={[
                            styles.questionbox,
                            selectedInterests.includes(interest)
                              ? { borderRadius: 10, borderColor: "#fff" }
                              : null,
                          ]}
                        >
                          <Text
                            allowFontScaling={false}
                            style={{
                              color: selectedInterests.includes(interest)
                                ? "#fff"
                                : "#000000",
                              fontFamily: "Inter-Regular",
                              fontWeight: "400",
                              fontSize: 13,
                            }}
                          >
                            {interest}
                          </Text>
                        </LinearGradient>
                        {selectedInterests.includes(interest) && (
                          <View style={styles.checkcontainer}>
                            <Feather name="check" size={15} color="#fff" />
                          </View>
                        )}
                      </View>
                    </TouchableWithoutFeedback>
                  ))}
                </View>
              </View>

              {isKeyboardOpen ? null : (
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={handelNextButton}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
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

            </ScrollView>

          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Survey;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  inputField: {
    width: "100%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    marginBottom: 22,
    alignSelf: "center",
  },
  questionbox: {
    padding: 12,
    borderWidth: 0.8,
    borderColor: "#000000",
    backgroundColor: "#fff",
    alignItems: "center",
    borderRadius: 10,
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    position: "absolute",
    bottom: height * 0.01,
  },
  checkcontainer: {
    position: "absolute",
    top: -8,
    right: -5,
    backgroundColor: "#338AFE",
    height: 20,
    width: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  questionText: {
    fontFamily: "your-chosen-font-family",
    fontSize: 16,
  },
  headrecontainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: marginBottom,
    marginTop: marginTop,
  },
});
