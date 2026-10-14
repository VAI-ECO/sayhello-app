import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../../Component/Header";
import Romanticcomponent from "../../../Component/Romanticcomponent";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AuthServices from "../../../Services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomeDropDown from "../../../Component/CustomeDropDown";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const lookingForData = [
  { label: "Long Term", value: "long term" },
  { label: "Casual Dating", value: "casual dating" },
  { label: "Friendship", value: "friendship" },
];

const communicateData = [
  { label: "Single", value: "single" },
  { label: "Marriage", value: "marriage" },
  { label: "Divorce", value: "divorce" },
  { label: "I'd rather not say", value: "prefer_not_to_say" },
];

const RomanticQuestion = () => {
  const navigation = useNavigation();
  const [user_info, setUser_info] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectGender, setSelectGender] = useState("");
  const [selectOrientation, setSelectOrientation] = useState("");
  const [subGender, setSubGender] = useState("");
  const [subOrientation, setSubOrientation] = useState("");
  const [lookingFor, setLookingFor] = useState(null);
  const [perfectDateDescription, setPerfectDateDescription] = useState("");
  const [preferCommunication, setPreferCommunication] = useState("");
  const [idealRealtionDesc, setIdealRealtionDesc] = useState("");
  const [openModelOne, setOpenModelOne] = useState(false);
  const [openModelTwo, setOpenModelTwo] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [maritalStatus, setMaritalStatus] = useState("");
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [isSelectingFrom, setIsSelectingFrom] = useState(true);

  const ageOptions = Array.from({ length: 83 }, (_, i) => (i + 18).toString());
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("user_info");
      if (value !== null) {
        const new_val = JSON.parse(value);
        setUser_info(new_val);
      }
    } catch (e) {
      console.log("e", e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const validationSchema = Yup.object().shape({
    selectGender: Yup.string().required("* Gender is required"),
    subGender: Yup.string().required("* Gender is required"),
    maritalStatus: Yup.string().required("* Marital Status is required"),
    ageFrom: Yup.string().required("* Age From is required"),
    ageTo: Yup.string().required("* Age To is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    register,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      selectGender: "",
      subGender: "",
      ageFrom: "",
      ageTo: "",
      maritalStatus: "",
    },
  });

  React.useEffect(() => {
    register("ageFrom", { required: "Age From is required" });
    register("ageTo", { required: "Age To is required" });
  }, [register]);

  const handleNext = () => {
    setLoading(true);
    const body = {
      userId: user_info?._id,
      gender: subGender === "" ? selectGender : subGender,
      orientation: subOrientation === "" ? selectOrientation : subOrientation,
      lookingFor: lookingFor,
      perfectDateDescription: perfectDateDescription,
      preferCommunication: preferCommunication,
      idealRealtionDesc: idealRealtionDesc,
      interestedAgeRangeFrom: ageFrom,
      interestedAgeRangeTo: ageTo,
      maritalStatus: maritalStatus,
    };

    console.log("body", body);

    AuthServices.SaveDatingInfo(body)
      .then((res) => {
        console.log(res);
        navigation.navigate("BusinesInfo");
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ImageBackground
          source={require("../../../assets/ImageBackground.jpg")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={styles.container}>
                <Header title="" />

                <Text allowFontScaling={false} style={styles.text}>
                  {i18n.t("global.tellusaboutyour")}{" "}
                </Text>
                <Text allowFontScaling={false} style={styles.text}>
                  {i18n.t("GeneralInterest.romanticIntere")}
                </Text>
                <Text allowFontScaling={false} style={styles.amtext}>
                  {i18n.t("global.iama")}
                </Text>
                {errors.selectGender && (
                  <Text style={styles.errorText}>
                    {errors.selectGender.message}
                  </Text>
                )}
                <Controller
                  control={control}
                  name="selectGender"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Romanticcomponent
                      name="gender"
                      select={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      selectSub={setSubGender}
                      selectSubO={setSubOrientation}
                      setSelect={setSelectGender}
                      openModel={openModelOne}
                      setOpenModel={setOpenModelOne}
                    />
                  )}
                />

                <Text allowFontScaling={false} style={styles.Lookingtext}>
                  {i18n.t("global.lookingfora")}
                </Text>
                {errors.subGender && (
                  <Text style={styles.errorText}>
                    {errors.subGender.message}
                  </Text>
                )}
                <Controller
                  control={control}
                  name="subGender"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Romanticcomponent
                      name="orientation"
                      select={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      selectSub={setSubGender}
                      selectSubO={setSubOrientation}
                      setSelect={setSelectOrientation}
                      openModel={openModelTwo}
                      setOpenModel={setOpenModelTwo}
                    />
                  )}
                />

                <View style={styles.formContainer}>
                  <Text allowFontScaling={false} style={styles.labelText}>
                    {i18n.t("global.ageRange")}
                  </Text>
                  <View style={styles.ageRangeContainer}>
                    <Text allowFontScaling={false} style={styles.ageButtonText}>
                      {i18n.t("global.from")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setIsSelectingFrom(true);
                        setShowAgeModal(true);
                      }}
                      style={styles.ageButton}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.ageButtonText}
                      >
                        {ageFrom || "Select Age"}
                      </Text>
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={styles.ageButtonText}>
                      To
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setIsSelectingFrom(false);
                        setShowAgeModal(true);
                      }}
                      style={styles.ageButton}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.ageButtonText}
                      >
                        {ageTo || "Select Age"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {errors.ageFrom && (
                    <Text style={styles.errorText}>
                      {errors.ageFrom.message}
                    </Text>
                  )}
                  {errors.ageTo && (
                    <Text style={styles.errorText}>{errors.ageTo.message}</Text>
                  )}

                  <Modal visible={showAgeModal} transparent={true}>
                    <View style={styles.modalContainer}>
                      <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                          {i18n.t("global.selectAge")}
                        </Text>
                        <ScrollView style={styles.scrollView}>
                          {ageOptions.map((age) => (
                            <TouchableOpacity
                              key={age}
                              onPress={async () => {
                                const field = isSelectingFrom
                                  ? "ageFrom"
                                  : "ageTo";
                                setValue(field, age);
                                if (ageFrom === "") {
                                  setAgeFrom(age);
                                  await trigger("ageFrom");
                                } else {
                                  setAgeTo(age);
                                  await trigger("ageTo");
                                }
                                setShowAgeModal(false);
                              }}
                              style={styles.ageOption}
                            >
                              <Text style={styles.ageOptionText}>{age}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        <TouchableOpacity
                          onPress={() => setShowAgeModal(false)}
                          style={styles.closeButton}
                        >
                          <Text style={styles.closeButtonText}>
                            {i18n.t("global.closed")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>

                  <Text
                    allowFontScaling={false}
                    style={{
                      marginBottom: 10,
                      color: "#707070",
                      fontWeight: "600",
                      fontSize: 17,
                      fontFamily: "Inter-Regular",
                      marginTop: 15,
                    }}
                  >
                    {i18n.t("GeneralInterest.Whatisyourcurrentstatus")}
                  </Text>

                  <Controller
                    control={control}
                    name="maritalStatus"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomeDropDown
                        value={value}
                        onBlur={onBlur}
                        onChange={onChange}
                        setValue={setMaritalStatus}
                        data={communicateData}
                      />
                    )}
                  />
                  {errors.maritalStatus && (
                    <Text style={styles.errorText}>
                      {errors.maritalStatus.message}
                    </Text>
                  )}
                  {/* <Text allowFontScaling={false} style={styles.labelText}>
                    {i18n.t("global.describeIdealRelationship")}
                  </Text>

                  <TextInput
                    allowFontScaling={false}
                    placeholder="Enter briefly describe"
                    style={styles.inputField}
                    value={idealRealtionDesc}
                    onChangeText={(text) => setIdealRealtionDesc(text)}
                    placeholderTextColor="#A7A7A8"
                    multiline={true}
                  /> */}
                  <LinearGradient
                    colors={["#338AFF", "#00EDB4"]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.2, y: 0.6 }}
                  >
                    <TouchableOpacity
                      onPress={handleSubmit(handleNext)}
                      disabled={loading}
                      style={styles.buttonContent}
                    >
                      <Text allowFontScaling={false} style={styles.buttonText}>
                        {loading ? <Loader /> : "Next"}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                  <Text></Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default RomanticQuestion;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    flex: 1,
    left: 0,
    top: 0,
  },
  text: {
    fontSize: 20,
    fontWeight: "300",
    fontFamily: "Inter-Regular",
    color: "#000000",
    alignSelf: "center",
  },
  amtext: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#000000",
    alignSelf: "center",
    paddingTop: 35,
  },
  Lookingtext: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#000000",
    alignSelf: "center",
    paddingTop: 30,
  },
  formContainer: {
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  labelText: {
    marginBottom: 10,
    color: "#707070",
    fontWeight: "600",
    fontSize: 17,
    fontFamily: "Inter-Regular",
  },
  subLabelText: {
    marginBottom: 10,
    color: "#338AFF",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  inputField: {
    width: "100%",
    height: 80,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    marginBottom: 22,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    fontWeight: "400",
    color: "#A7A7A8",
  },
  button: {
    height: 50,
    width: "100%",
    borderRadius: 5,
    marginTop: 20,
  },
  buttonContent: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-Regular",
  },
  inputFieldrange: {
    width: "48%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    marginBottom: 22,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    fontWeight: "400",
    color: "#A7A7A8",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "40%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  ageRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  ageOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  ageOptionText: {
    fontSize: 16,

    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#338AFF",
    paddingHorizontal: 25,
    padding: 4,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  scrollView: {
    maxHeight: 300,
    width: "100%",
  },
  ageButton: {
    width: "40%",
    height: 45,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
  ageButtonText: {
    color: "#A7A7A8",
    fontSize: 16,
    alignSelf: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 10,
  },
});
