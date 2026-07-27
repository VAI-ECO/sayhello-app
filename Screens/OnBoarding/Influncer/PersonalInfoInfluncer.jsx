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
  Modal,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../../../Component/Header";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AuthServices from "../../../Services/authService";
import { useAuth } from "../../../Context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppConfig from "../../../AppConfig";
import CustomDatePicker from "../../../Component/CustomeDatePicker";
import Toast from "react-native-toast-message";
import Loader from "../../../Component/Loader";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import LocationPermissionModal from "../../../Component/LocationPermissionModal";
import i18n from "../../../Context/i18n";

function generateRandomName(extension = "png") {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const randomName = `${timestamp}_${randomString}.${extension}`;
  return randomName;
}

const PersonalInfoInfluncer = () => {
  const { user } = useAuth();

  const [isLoading, setIsloading] = useState(false);

  const navigation = useNavigation();
  const [date, setDate] = useState(null);
  const [about, setAbout] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [nickname, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showStoragePermissionModal, setShowStoragePermissionModal] =
    useState(false);
  const [user_info, setUser_info] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const aboutRef = useRef(null);
  const nicknameRef = useRef(null);

  const validationSchema = Yup.object().shape({
    dob: Yup.string().required("* Date of Birth is required"),
    aboutMe: Yup.string().required("* About me is required"),
    nickname: Yup.string().required("* Nickname is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      dob: "",
      aboutMe: "",
      nickname: "",
    },
  });

  const handleCompleteProfile = async (values) => {
    setIsloading(true);
    let name = generateRandomName("png");
    let image = null;
    console.log("profileImage", profileImage?.uri);

    if (profileImage?.uri) {
      const formData = new FormData();
      formData.append("file", {
        uri: profileImage?.uri,
        name: name,
        type: "image/jpg",
      });
      await axios
        .post(`${AppConfig.ApiUrl}api/v1/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(
            "Image uploaded successfully",
            res?.data?.response_body?.Location
          );

          let image_url = res?.data?.response_body?.Location;

          const body = {
            email: user_info?.email,
            dob: moment(date).format("YYYY-MM-DD"),
            aboutMe: values.aboutMe,
            nickname: values.nickname,
            profileUrl: image_url,
          };

          AuthServices.SavePersonalInfo(body)
            .then((res) => {
              console.log(res);
              setIsloading(false);
              navigation.navigate("AlsInfluncer");
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          setIsloading(false);
          console.log(err);
        });
    } else {
      const body = {
        email: user_info?.email,
        dob: moment(date).format("YYYY-MM-DD"),
        aboutMe: values.aboutMe,
        nickname: values.nickname,
        profileUrl: "",
      };
      AuthServices.SavePersonalInfo(body)
        .then((res) => {
          console.log(res);
          setIsloading(false);
          navigation.navigate("AlsInfluncer");
        })
        .catch((err) => {
          setIsloading(false);
          console.log(err);
        });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === "ios");
    setDate(currentDate);
    setDatePickerOpen(false);
    console.log("Selected Date:", currentDate);
  };

  useFocusEffect(
    React.useCallback(() => {
      const requestPermission = async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          setShowStoragePermissionModal(true);
          // Alert.alert(
          //   "Permission Required",
          //   "Please grant permission to access the camera roll to upload images."
          // );
        }
      };

      requestPermission();
    }, [])
  );

  const handleImagePicker = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log("pickerResult", pickerResult);

    if (!pickerResult.cancelled) {
      setProfileImage(pickerResult.assets[0]);
      console.log(pickerResult.assets[0]);
    }
  };
  const handleDateSelected = (date) => {
    console.log("date", date);
    setValue("dob", date);
    setDate(date);
  };
  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem("user_info");
        if (value !== null) {
          const new_val = JSON.parse(value);
          setUser_info(new_val);
        }
      } catch (e) {
        console.log("Error reading value:", e);
      }
    };
    getData();
  }, []);

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

  const handlePermissionClose = () => {
    setShowStoragePermissionModal(false);
  };

  const handlePermissionConfirm = async () => {
    setShowStoragePermissionModal(false);
  };

  return (
    <>
      {showStoragePermissionModal ? (
        <LocationPermissionModal
          visible={showStoragePermissionModal}
          onClose={handlePermissionClose}
          onConfirm={handlePermissionConfirm}
        />
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            style={{ flex: 1 }}
          >
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
                  {/* <Header title="" /> */}
                  <Image
                    style={styles.image}
                    source={require("../../../assets/infologo.png")}
                  />
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      paddingLeft: 20,
                      fontFamily: "Roboto-Regular",
                      paddingLeft: 20,
                      paddingTop: 10,
                    }}
                  >
                    {i18n.t("global.Personalinfo")}
                  </Text>

                  <View
                    style={{
                      paddingTop: 15,
                      flex: 1,
                    }}
                  >
                    <ScrollView
                      style={{ flex: 1 }}
                      contentContainerStyle={styles.scrollContainer}
                      showsVerticalScrollIndicator={false}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{
                          marginBottom: 5,
                          color: "#707070",
                          fontWeight: "400",
                          fontSize: 15,
                          fontFamily: "Inter-Regular",
                        }}
                      >
                        {i18n.t("global.DateofBirth")}
                      </Text>
                      <TouchableOpacity
                        style={styles.inputFieldd}
                        onPress={() => setShowPicker(true)}
                      >
                        <AntDesign name="calendar" size={26} color="#3C2828" />
                        <Controller
                          control={control}
                          name="dob"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              allowFontScaling={false}
                              placeholder="(dd-mm-yy)"
                              style={styles.inputfieldinner}
                              editable={false}
                              // value={date ? moment(date).format("DD-MM-YYYY") : ""}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholderTextColor="#A7A7A8"
                            />
                          )}
                        />
                      </TouchableOpacity>
                      {errors.dob && (
                        <Text style={styles.errorText}>
                          {errors.dob.message}
                        </Text>
                      )}

                      {showPicker && (
                        <View style={styles.modalContainer}>
                          <CustomDatePicker
                            onDateSelected={handleDateSelected}
                            setModalVisible={setShowPicker}
                            isModalVisible={showPicker}
                          />
                        </View>
                      )}

                      <Text
                        allowFontScaling={false}
                        style={{
                          marginBottom: 5,
                          color: "#707070",
                          fontWeight: "600",
                          fontSize: 15,
                          fontFamily: "Inter-Regular",
                        }}
                      >
                        {i18n.t("global.Aboutme")}
                      </Text>
                      <Controller
                        control={control}
                        name="aboutMe"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            ref={aboutRef}
                            onSubmitEditing={() => nicknameRef.current.focus()}
                            placeholder={i18n.t("global.Texthere")}
                            style={{
                              ...styles.inputField,
                              fontSize: 15,
                              fontFamily: "Roboto-Regular",
                              fontWeight: "400",
                              color: "#A7A7A8",
                              height: 55,
                              paddingLeft: 15,
                              paddingRight: 15,
                            }}
                            value={value}
                            // onChangeText={(text) => setAbout(text)}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholderTextColor="#A7A7A8"
                            multiline={true}
                            textInputAccessoryViewID={"none"}
                          />
                        )}
                      />
                      {errors.aboutMe && (
                        <Text style={styles.errorText}>
                          {errors.aboutMe.message}
                        </Text>
                      )}

                      <Text
                        allowFontScaling={false}
                        style={{
                          marginBottom: 5,
                          color: "#707070",
                          fontWeight: "600",
                          fontSize: 15,
                          fontFamily: "Inter-Regular",
                        }}
                      >
                        {i18n.t("global.NickName")}
                      </Text>

                      <Controller
                        control={control}
                        name="nickname"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            ref={nicknameRef}
                            placeholder={i18n.t("global.Enteryournickname")}
                            style={{
                              ...styles.inputField,
                              fontSize: 15,
                              fontFamily: "Roboto-Regular",
                              fontWeight: "400",
                              color: "#A7A7A8",
                              paddingLeft: 15,
                            }}
                            value={value}
                            // onChangeText={(text) => setName(text)}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholderTextColor="#A7A7A8"
                          />
                        )}
                      />
                      {errors.nickname && (
                        <Text style={styles.errorText}>
                          {errors.nickname.message}
                        </Text>
                      )}

                      <Text
                        allowFontScaling={false}
                        style={{
                          marginBottom: 5,
                          color: "#707070",
                          fontWeight: "600",
                          fontSize: 15,
                          fontFamily: "Inter-Regular",
                        }}
                      >
                        {i18n.t("global.ProfilePic")}
                      </Text>
                      <TouchableOpacity
                        onPress={handleImagePicker}
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          height: 57,
                          backgroundColor: "#F6F6F6",
                        }}
                      >
                        <Text
                          allowFontScaling={false}
                          style={{
                            borderRadius: 5,
                            fontSize: 15,
                            fontFamily: "Roboto-Regular",
                            fontWeight: "400",
                            color: "#A7A7A8",
                            paddingLeft: 15,
                          }}
                        >
                          {i18n.t("global.SelectProfilePic")}
                        </Text>
                      </TouchableOpacity>

                      {profileImage && (
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: "Roboto-Regular",
                            fontWeight: "400",
                            paddingLeft: 15,
                            marginTop: 10,
                          }}
                        >
                          {profileImage.fileName}
                        </Text>
                      )}
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
                        disabled={isLoading}
                        onPress={handleSubmit(handleCompleteProfile)}
                        // onPress={() => navigation.navigate("GeneralInterest")}
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
                          {isLoading ? (
                            <>
                              <Loader />
                            </>
                          ) : (
                            <>Complete Profile</>
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
      )}
    </>
  );
};

export default PersonalInfoInfluncer;

const styles = StyleSheet.create({
  container: {
    paddingTop: 55,
    flex: 1,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 190,
    height: 150,
    top: -8,
  },
  inputField: {
    width: "100%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    marginBottom: 10,
    alignSelf: "center",
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
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
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    marginBottom: 8,
    alignSelf: "center",
    alignItems: "center",
    paddingLeft: 13,
  },
  inputfieldinner: {
    flex: 1,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#A7A7A8",
    paddingLeft: 10,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});
