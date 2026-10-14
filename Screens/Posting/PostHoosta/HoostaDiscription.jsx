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
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import meetupService from "../../../Services/meetupService";
import HoostaHeader from "../../../Component/HoostaHeader ";
import HoostaService from "../../../Services/HoostaService";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const HoostaDiscription = () => {
  const navigation = useNavigation();
  const Hoosta = useSelector((state) => state?.hoosta?.hoostaData?.hoosta);
  console.log(Hoosta?._id, "hoosta2");
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const from4 = router?.params?.from4;
  const clearform = router?.params?.clearform;

  console.log(from, from2, from3, from4, pathname, "p5");

  const [data, setData] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChecked = () => {
    setChecked(!checked);
  };

  useEffect(() => {
    if (clearform) {
      reset({
        description: "",
      });
    }
  }, [router]);

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
    description: Yup.string().required("* Description is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      description: "",
    },
  });

  const handleNext = (values) => {
    setIsLoading(true);

    const submitData = {
      description: values.description,
      rsvp: true,
    };
    // HoostaService.updateDescription(router?.params?.hoostaId, submitData)
    HoostaService.updateDescription(Hoosta?._id, submitData)
      .then((res) => {
        console.log("res of the upadte location: ", res);
        setIsLoading(false);
        // navigation.navigate("HoostaPhoto", {
        //   hoostaId: router?.params?.hoostaId,
        // });
        const params = {
          from: from,
          from2: from2,
          from3,
          from3,
          from4: from4,
          from5: pathname,
          clearform: true,
        };
        navigation.navigate("HoostaPhoto", params);
        setData("");
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("error: ", err);
      });
  };

  const handleBack = () => {
    navigation.navigate(from4, { from: from, from2: from2, from3: from3 });
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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : null}
          >
            <View style={styles.container}>
              <HoostaHeader handleBack={handleBack} />

              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  fontFamily: "Roboto-Regular",
                  color: "#262627",
                  textAlign: "center",
                }}
              >
                {i18n.t("global.describeYourHootsa")}
              </Text>

              <View
                style={{
                  paddingTop: 25,
                  paddingHorizontal: 25,
                  flex: 1,
                }}
              >
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      allowFontScaling={false}
                      placeholder={i18n.t("global.describeYourHootsa")}
                      style={{
                        ...styles.inputField,
                        fontSize: 14,
                        fontFamily: "Roboto-Regular",
                        fontWeight: "400",
                        color: "#7C7C7C",
                        paddingLeft: 18,
                        paddingRight: 18,
                        paddingLeft: 18,
                        paddingRight: 18,
                        textAlignVertical: "top",
                        paddingTop: 10,
                      }}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor="#7C7C7C"
                      multiline={true}
                      textInputAccessoryViewID={"none"}
                    />
                  )}
                />
                {errors.description && (
                  <Text style={styles.errorText}>
                    {errors.description.message}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={toggleChecked}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F7A491",
                    borderRadius: 5,
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: "#262627",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "25%",
                      marginLeft: 25,
                    }}
                  >
                    {checked && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#262627",
                        }}
                      />
                    )}
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 18,
                      fontWeight: "900",
                      fontFamily: "Roboto-Regular",
                      color: "#262627",
                    }}
                  >
                    {i18n.t("global.enableRSVP")}
                  </Text>
                </TouchableOpacity>

                {isLoading ? (
                  <>
                    <View style={styles.btncontainer}>
                      <ActivityIndicator size={50} color="#0000ff" />
                    </View>
                  </>
                ) : (
                  <>
                    {isKeyboardOpen ? null : (
                      <TouchableOpacity
                        onPress={handleSubmit(handleNext)}
                        style={styles.btncontainer}
                      >
                        <LinearGradient
                          colors={["#338AFF", "#00EDB4"]}
                          style={styles.buton}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1.2, y: 0.6 }}
                        >
                          <TouchableOpacity onPress={handleSubmit(handleNext)}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
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
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HoostaDiscription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  inputField: {
    width: "100%",
    height: 150,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    alignSelf: "center",
    borderWidth: 1,
    marginBottom: 10,
  },
  buton: {
    width: "100%",
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
  btncontainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 20,
  },
});
