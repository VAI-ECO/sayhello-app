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
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const BusinessQuestion = () => {
  const [user_info, setUser_info] = useState(null);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("user_info");
      if (value !== null) {
        // value previously stored
        const new_val = JSON.parse(value);
        setUser_info(new_val);
      }
    } catch (e) {
      // error reading value
      console.log("e", e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };
  const [loading, setLoading] = useState(false);
  const [profession, setProfession] = useState("");
  const [skill, setSkill] = useState("");
  const [industry, setIndustry] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);

  const isFormField = profession && industry && selectedInterests;

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

  const validationSchema = Yup.object().shape({
    profession: Yup.string().required("* Profession is required"),
    industry: Yup.string().required("* Industry Info is required"),
    interests: Yup.array().min(1, "* At least one Interest is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      profession: "",
      industry: "",
      interests: [],
    },
  });

  const handleInterestSelect = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(
        selectedInterests.filter((item) => item !== interest)
      );
      setValue(
        "interests",
        selectedInterests.filter((item) => item !== interest)
      );
    } else {
      setSelectedInterests([...selectedInterests, interest]);
      setValue("interests", [...selectedInterests, interest]);
    }
    clearErrors("interests");
  };

  const handelBussinesInfoSave = (values) => {
    console.log("hello how are you");
    setLoading(true);
    console.log("user ino is: ", user_info);
    const data = {
      email: user_info?.email,
      interestedInBusiness: true,
      currentProfession: values.profession,
      briefIndustry: values.industry,
      skills: "",
      businessTypes: values.interests,
    };
    userService
      .saveBussinessDetails(data)
      .then((res) => {
        setLoading(false);
        console.log("res:", res);
        navigation.navigate("PersonalSurvey");
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
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 20,
                fontWeight: "300",
                fontFamily: "Inter-Regular",
                color: "#000000",
                alignSelf: "center",
              }}
            >
              {i18n.t("global.tellusaboutyour")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 20,
                fontWeight: "300",
                fontFamily: "Inter-Regular",
                color: "#000000",
                alignSelf: "center",
              }}
            >
              {i18n.t("global.businessInterest")}
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

                  <Controller
                    control={control}
                    name="profession"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder="Type here..."
                        style={{
                          ...styles.inputField,
                          fontSize: 16,
                          fontFamily: "Roboto-Regular",
                          fontWeight: "400",
                          color: "#A7A7A8",
                          paddingLeft: 20,
                        }}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholderTextColor="#A7A7A8"
                      />
                    )}
                  />
                  {errors.profession && (
                    <Text style={styles.errorText}>
                      {errors.profession.message}
                    </Text>
                  )}
                </KeyboardAvoidingView>
              </KeyboardAvoidingView>
              {/* <KeyboardAvoidingView
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
                    What specific skills or experties do you offer in your
                    field?
                  </Text>
                  <TextInput
                    allowFontScaling={false}
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
              </KeyboardAvoidingView> */}
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
                  {i18n.t("global.describeIndustry")}
                </Text>

                <Controller
                  control={control}
                  name="industry"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      allowFontScaling={false}
                      placeholder="Write here..."
                      style={{
                        ...styles.inputField,
                        fontSize: 16,
                        fontFamily: "Roboto-Regular",
                        fontWeight: "400",
                        color: "#A7A7A8",
                        paddingLeft: 20,
                        height: 90,
                        paddingRight: 20,
                      }}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor="#A7A7A8"
                      multiline={true}
                    />
                  )}
                />
                {errors.industry && (
                  <Text style={styles.errorText}>
                    {errors.industry.message}
                  </Text>
                )}
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
                              allowFontScaling={false}
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
                  {errors.interests && (
                    <Text style={styles.errorText}>
                      {errors.interests.message}
                    </Text>
                  )}
                </View>
              </View>
            </>

            <>
              {!isKeyboardOpen ? (
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={handleSubmit(handelBussinesInfoSave)}
                    // disabled={!isFormField || loading}
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
              ) : null}
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
    bottom: 20,
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});
