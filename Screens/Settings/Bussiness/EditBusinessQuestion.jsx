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
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Feather } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import userService from "../../../Services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../../Context/AuthContext";

const BusinessQuestion = () => {

    const { user, updateUser } = useAuth();


  const [user_info, setUser_info] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profession, setProfession] = useState("");
  const [skill, setSkill] = useState("");
  const [industry, setIndustry] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem("user_info");
        if (value !== null) {
          const new_val = JSON.parse(value);
          console.log("new_val: ", new_val);
          setUser_info(new_val);
          setProfession(new_val?.currentProfession);
          setSkill(new_val?.skills);
          setIndustry(new_val?.briefIndustry);
          setSelectedInterests(new_val?.businessTypes);
        }
      } catch (e) {
        console.log("Error reading value:", e);
      }
    };
    getData();
  }, []);

  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };

  const handleInterestSelect = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(
        selectedInterests.filter((item) => item !== interest)
      );
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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

  const handelBussinesInfoSave = () => {
    setLoading(true);
    let userId = user?.user?._id;
    console.log("user ino is: ", user_info);
    const data = {
      currentProfession: profession,
      briefIndustry: industry,
      skills: skill,
      businessTypes: selectedInterests,
    };
    userService
      .updateBusinessQuestionsForEdit(userId, data)
      .then((res) => {
        setLoading(false);
        const updates = {
          currentProfession: res.user.currentProfession,
          briefIndustry: res.user.briefIndustry,
          skills: res.user.skills,
          businessTypes: res.user.businessTypes,
        };
        updateUser(updates);
        navigation.navigate("MySettings", { screen: "SettingScreen" });
      })
      .catch((err) => {
        setLoading(false);
        console.log("err:", err);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ImageBackground
          source={require("../../../assets/imagebackgroung.jpg")}
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
            <Text
              style={{
                fontSize: 20,
                fontWeight: "300",
                fontFamily: "Inter-Regular",
                color: "#000000",
                alignSelf: "center",
              }}
            >
              Tell us about your
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "300",
                fontFamily: "Inter-Regular",
                color: "#000000",
                alignSelf: "center",
              }}
            >
              Business Interest
            </Text>
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
                    style={{
                      marginBottom: 10,
                      color: "#707070",
                      fontWeight: "600",
                      fontSize: 16,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    What is your current profession
                  </Text>
                  <TextInput
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
                    onChangeText={(text) => setProfession(text)}
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
                    style={{
                      marginBottom: 10,
                      color: "#707070",
                      fontWeight: "600",
                      fontSize: 16,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    What specific skills or experties do you offer in your
                    field?
                  </Text>
                  <TextInput
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
                    onChangeText={(text) => setSkill(text)}
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
                    style={{
                      marginBottom: 10,
                      color: "#707070",
                      fontWeight: "600",
                      fontSize: 16,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    Briefly describe your industry
                  </Text>
                  <TextInput
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
                    onChangeText={(text) => setIndustry(text)}
                    placeholderTextColor="#A7A7A8"
                    multiline={true}
                    textInputAccessoryViewID={"none"}
                  />
                </KeyboardAvoidingView>
              </KeyboardAvoidingView>
            </View>
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingTop: 18,
                }}
              >
                <View>
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
                      <TouchableWithoutFeedback
                        key={interest}
                        onPress={() => handleInterestSelect(interest)}
                      >
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
                              style={{
                                color: selectedInterests.includes(interest)
                                  ? "#fff"
                                  : "#000000",
                                fontFamily: "Inter-Regular",
                                fontWeight: "400",
                                fontSize: 12,
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
              </View>
            </>

            <>
              {isKeyboardOpen ? null : (
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      handelBussinesInfoSave();
                    }}
                    // onPress={() => navigation.navigate("PersonalSurvey")}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        fontFamily: "Inter-Regular",
                        color: "#fff",
                      }}
                    >
                      Update
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BusinessQuestion;

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
    padding: 10,
    borderWidth: 1,
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
    bottom: 5,
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
    fontSize: 12,
  },
  headrecontainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 22,
  },
});
