import React, { useEffect, useState, useRef } from "react";
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
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../../Component/Header";
import { useNavigation } from "@react-navigation/native";
import AuthServices from "../../Services/authService";
import { useAuth } from "../../Context/AuthContext";
import moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import Loader from "../../Component/Loader";
import i18n from "../../Context/i18n";

function generateRandomName(extension = "png") {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7); // Generate a random string
  const randomName = `${timestamp}_${randomString}.${extension}`; // Combine timestamp, random string, and extension
  return randomName;
}

const EditPersonalInfo = () => {
  const { user, updateUser } = useAuth();

  const [isLoading, setIsloading] = useState(false);

  const [date, setDate] = useState(new Date());

  const [showPicker, setShowPicker] = useState(false);

  const navigation = useNavigation();
  const [about, setAbout] = useState("");
  const [nickname, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const [user_info, setUser_info] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const aboutRef = useRef(null);
  const nicknameRef = useRef(null);
  const usernameRef = useRef(null);
  const phoneInputRef = useRef(null);

  const handleSubmit = async () => {
    setIsloading(true);

    let USERID = user?.user?._id;
    const body = {
      dob: date,
      aboutme: about,
      nickname: nickname,
      username: username,
      phonenumber: phone_number,
    };
    AuthServices.updatePersonalInfor(USERID, body)
      .then((res) => {
        setIsloading(false);
        const updates = {
          aboutme: res.aboutme,
          nickname: res.nickname,
          dob: res.dob,
          username: res.username,
          phonenumber: res.phonenumber,
        };
        updateUser(updates);
        navigation.navigate("MySettings", { screen: "SettingScreen" });
      })
      .catch((err) => {
        setIsloading(false);
        console.log("error of updating the persona infor: ", err);
      });
  };

  console.log("formattedValue: ", formattedValue);
  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");
    setDate(selectedDate || new Date()); // Ensure selectedDate is a Date object
    setDatePickerOpen(false);
    console.log("Selected Date:", selectedDate);
  };

  useEffect(() => {
    if (user?.user) {
      setUser_info(user?.user);
      setDate(user?.user?.dob);
      setAbout(user?.user?.aboutme);
      setName(user?.user?.nickname);
      setUsername(user?.user?.username);
      setFormattedValue(user?.user?.phonenumber);
      setPhoneNumber(user?.user?.phonenumber);
    }
  }, [user]);

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

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ImageBackground
            source={require("../../assets/imagebackgroung.jpg")}
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
              <Header title="" />
              <Image
                style={styles.image}
                source={require("../../assets/infologo.png")}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  fontFamily: "Roboto-Regular",
                  paddingLeft: 20,
                  paddingTop: 5,
                }}
              >
                {i18n.t("global.Personalinfo")}
              </Text>

              <View
                style={{
                  paddingTop: 10,
                  flex: 1,
                }}
              >
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text
                    style={{
                      marginBottom: 5,
                      color: "#707070",
                      fontWeight: "400",
                      fontSize: 17,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    {i18n.t("global.DateofBirth")}
                  </Text>
                  <TouchableOpacity
                    style={styles.inputFieldd}
                    onPress={() => setShowPicker(true)}
                  >
                    <AntDesign name="calendar" size={24} color="#3C2828" />
                    <TextInput
                      placeholder="(dd-mm-yy)"
                      style={styles.inputfieldinner}
                      editable={false}
                      value={date ? moment(date).format("DD-MM-YYYY") : ""}
                      placeholderTextColor="#A7A7A8"
                    />
                  </TouchableOpacity>

                  {showPicker && (
                    <View style={styles.modalContainer}>
                      <DateTimePicker
                        mode="date"
                        display="spinner"
                        value={date ? new Date(date) : new Date()}
                        onChange={handleDateChange}
                      />
                    </View>
                  )}

                  <Text
                    style={{
                      marginBottom: 5,
                      color: "#707070",
                      fontWeight: "600",
                      fontSize: 16,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    {i18n.t("global.Aboutme")}
                  </Text>
                  <TextInput
                    ref={aboutRef}
                    onSubmitEditing={() => nicknameRef.current.focus()}
                    placeholder={i18n.t("global.Texthere")}
                    style={{
                      ...styles.inputField,
                      fontSize: 16,
                      fontFamily: "Roboto-Regular",
                      fontWeight: "400",
                      color: "#A7A7A8",
                      height: 85,
                      paddingLeft: 20,
                      paddingRight: 20,
                    }}
                    value={about}
                    onChangeText={(text) => setAbout(text)}
                    placeholderTextColor="#A7A7A8"
                    multiline={true}
                    textInputAccessoryViewID={"none"}
                  />

                  <Text
                    style={{
                      marginBottom: 5,
                      color: "#707070",
                      fontWeight: "600",
                      fontSize: 16,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    {i18n.t("global.NickName")}
                  </Text>
                  <TextInput
                    ref={nicknameRef}
                    placeholder={i18n.t("global.entername")}
                    style={{
                      ...styles.inputField,
                      fontSize: 16,
                      fontFamily: "Roboto-Regular",
                      fontWeight: "400",
                      color: "#A7A7A8",
                      paddingLeft: 20,
                    }}
                    value={nickname}
                    onChangeText={(text) => setName(text)}
                    placeholderTextColor="#A7A7A8"
                  />

                  <Text
                    style={{
                      marginBottom: 5,
                      color: "#707070",
                      fontWeight: "600",
                      fontSize: 16,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    {i18n.t("global.username")}
                  </Text>
                  <TextInput
                    ref={usernameRef}
                    placeholder={i18n.t("global.Enterusername")}
                    style={{
                      ...styles.inputField,
                      fontSize: 16,
                      fontFamily: "Roboto-Regular",
                      fontWeight: "400",
                      color: "#A7A7A8",
                      paddingLeft: 20,
                    }}
                    value={username}
                    onChangeText={(text) => setUsername(text)}
                    placeholderTextColor="#A7A7A8"
                  />

                  <Text
                    style={{
                      marginBottom: 5,
                      color: "#707070",
                      fontWeight: "600",
                      fontSize: 16,
                      fontFamily: "Inter-Regular",
                    }}
                  >
                    {i18n.t("global.phoneNumber")}
                  </Text>

                  <TextInput
                    ref={phoneInputRef}
                    placeholder={i18n.t("global.enterphonenumber")}
                    style={{
                      ...styles.inputField,
                      fontSize: 16,
                      fontFamily: "Roboto-Regular",
                      fontWeight: "400",
                      color: "#A7A7A8",
                      paddingLeft: 20,
                    }}
                    value={phone_number}
                    onChangeText={(text) => setPhoneNumber(text)}
                    placeholderTextColor="#A7A7A8"
                  />
                </ScrollView>
              </View>
              {isKeyboardOpen ? null : (
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={[styles.button]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={handleSubmit}
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
                      {isLoading ? (
                        <>
                          <Loader />
                        </>
                      ) : (
                        <>Save</>
                      )}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>
          </ImageBackground>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default EditPersonalInfo;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 160,
    height: 110,
    top: -6,
  },
  inputField: {
    width: "100%",
    height: 53,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    marginBottom: 6,
    alignSelf: "center",
  },
  button: {
    width: "90%",
    height: 48,
    borderRadius: 10,
    alignSelf: "center",
    position: "absolute",
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  inputFieldd: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    marginBottom: 6,
    alignSelf: "center",
    alignItems: "center",
    paddingLeft: 13,
  },
  inputfieldinner: {
    flex: 1,
    height: 53,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#A7A7A8",
    paddingLeft: 10,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    flexGrow: 1,
  },
  phoneInputContainer: {
    width: "100%",
    backgroundColor: "#F6F6F6",
    borderRadius: 3,
  },
  phoneInputTextContainer: {
    borderLeftWidth: 0.5,
    backgroundColor: "#F6F6F6",
  },
});

const phoneInputStyles = StyleSheet.create({
  placeholder: {
    color: "#3C2828",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});
