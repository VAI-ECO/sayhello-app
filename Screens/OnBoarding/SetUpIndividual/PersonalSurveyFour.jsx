import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import Header from "../../../Component/Header";
import { Fontisto, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../Context/AuthContext";
import userService from "../../../Services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Loader from "../../../Component/Loader";
import i18n from "../../../Context/i18n";

const PersonalSurveyFour = () => {
  const navigation = useNavigation();
  const { user, signIn } = useAuth();
  const [about, setAbout] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [savedData, setSavedData] = useState({});
  const modalRef = useRef();
  const [user_info, setUser_info] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

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

  const questions = [
    "31. What's your favorite childhood memory?",
    "32. What's something you're looking forward to in the future?",
    "33. What's the best concert you've ever been to?",
    "34. What's your favorite way to relax?",
    "35. Do you have any favorite quotes from movies or TV shows?",
    "36. What's your favorite type of cocktail?",
    "37. Do you have any favorite comedians or funny TV shows?",
    "38. What's the most adventurous thing you've ever done?",
    "39. What's something most people don't know about you?",
    "40. What's your favorite hobby?",
  ];

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };
  const transformData = (data) => {
    const transformedData = {};
    questions.forEach((question, index) => {
      const questionNumber = question.split(".")[0]; // Extract the question number
      if (data[question]) {
        transformedData[`question${questionNumber}`] = data[question];
      }
    });
    return transformedData;
  };
  const handelNext = () => {
    setIsLoading(true);

    const transformedData = transformData(savedData);

    const data = {
      userId: user_info?._id,
      questions: transformedData,
    };

    userService
      .updateUserQuestions(data)
      .then(async (res) => {
        console.log("ressss: ", res);
        await signIn(user_info?.email, user_info?.epassword);
        Toast.show({
          type: "success",
          text1: "Welcome 👋",
          autoHide: true,
          visibilityTime: 1000,
        });
        if (user) {
          navigation.navigate("Main");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const handleAddPress = (text) => {
    if (savedData[text]) {
      const newData = { ...savedData };
      delete newData[text];
      setSavedData(newData);
    } else {
      setQuestionText(text);
      setModalVisible(true);
    }
  };

  const handleSave = () => {
    setSavedData({ ...savedData, [questionText]: about });
    setModalVisible(false);
    setAbout("");
  };

  return (
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
          {/* <Header title="Add some more Information" /> */}
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 15,
              fontWeight: "700",
              fontFamily: "Roboto-Regular",
              color: "#000000",
              alignSelf: "center",
            }}
          >
            {i18n.t("global.completedSurveyText")}
          </Text>
          <ScrollView style={{ paddingTop: 30, paddingHorizontal: 22 }}>
            {questions.map((question, index) => (
              <View key={index}>
                <Text allowFontScaling={false} style={styles.questionheading}>
                  {question}
                </Text>
                {savedData[question] ? (
                  <TouchableOpacity
                    style={{
                      ...styles.savedatabox,
                      backgroundColor: "#338AFF",
                    }}
                    onPress={() => handleAddPress(question)}
                  >
                    <Text allowFontScaling={false} style={styles.savetext}>
                      {savedData[question]}
                    </Text>
                    <TouchableOpacity
                      style={styles.closeIconInButton}
                      onPress={() => handleAddPress(question)}
                    >
                      <AntDesign name="closecircle" size={20} color="#00D9A5" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.addbtn}
                    onPress={() => handleAddPress(question)}
                  >
                    <Text allowFontScaling={false} style={styles.addtext}>
                      {i18n.t("global.add")}
                    </Text>
                  </TouchableOpacity>
                )}
                {index !== questions.length - 1 && (
                  <View style={styles.divider}></View>
                )}
              </View>
            ))}
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Inter-Regular",
                color: "#fff",
                marginBottom: 20,
              }}
            >
              {i18n.t("global.next")}
            </Text>
          </ScrollView>
          <>
            <View style={styles.buttonContainer}>
              {isLoading ? (
                <Loader />
              ) : (
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={handelNext}
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
            </View>
          </>
        </View>
      </ImageBackground>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <View style={styles.modalContainer} ref={modalRef}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeIcon} onPress={toggleModal}>
                <Fontisto name="close-a" size={16} color="black" />
              </TouchableOpacity>
              <View style={{ paddingTop: 0 }}>
                <Text allowFontScaling={false} style={styles.questionheading}>
                  {questionText}
                </Text>
              </View>
              <TextInput
                allowFontScaling={false}
                placeholder="Text here..."
                style={{
                  ...styles.inputField,
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  fontWeight: "400",
                  color: "#999999",
                  height: 100,
                  textAlignVertical: "top",
                  paddingTop: 5,
                  paddingLeft: 20,
                }}
                value={about}
                onChangeText={(text) => setAbout(text)}
                placeholderTextColor="#999999"
              />
              <>
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.savebutton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={handleSave}
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
                      {i18n.t("global.save")}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default PersonalSurveyFour;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  questionheading: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },
  addbtn: {
    backgroundColor: "#00D9A5",
    width: 70,
    padding: 2,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 8,
  },
  savedatabox: {
    width: 238,
    padding: 10,
    justifyContent: "center",
    borderRadius: 5,
    marginTop: 18,
    marginBottom: 8,
  },
  addtext: {
    fontSize: 18,
    fontWeight: "400",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    alignSelf: "center",
  },
  savetext: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Roboto-Regular",
    color: "#fff",
  },
  closeIconInButton: {
    position: "absolute",
    top: -13,
    right: -10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 8,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  closeIcon: {
    position: "absolute",
    top: 18,
    right: 20,
  },
  inputField: {
    width: "100%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    alignSelf: "center",
    marginTop: 15,
  },
  savebutton: {
    width: "100%",
    height: "15%",
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 30,
  },
  button: {
    width: "95%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    margin: 20,
  },
  divider: {
    borderBottomColor: "#D9D9D9",
    borderBottomWidth: 0.6,
    marginBottom: 8,
    marginTop: 8,
  },
  buttonContainer: {
    width: "95%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
