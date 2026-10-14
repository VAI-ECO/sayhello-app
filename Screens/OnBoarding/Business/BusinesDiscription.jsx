import {
  Text,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  TextInput,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../../../Component/Header";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BusinessService from "../../../Services/BusinessService";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Entypo";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const BusinesDiscription = () => {
  const [data, setData] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const navigation = useNavigation();
  const [businessDetails, setBusinessDetails] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [storeBusinessDetails, setStoreBusinessDetails] = useState(null);
  const [errorMsg, setErrrorMsg] = useState("");

  useEffect(() => {
    const getStoreBusinessDetails = async () => {
      let result = await AsyncStorage.getItem("BusinessDetails");
      let parse_result = JSON.parse(result);

      setData(parse_result?.description);

      setStoreBusinessDetails(parse_result);
    };

    getStoreBusinessDetails();
  }, []);

  useEffect(() => {
    const getBusinessDetailsFromLocalSorage = async () => {
      let result = await AsyncStorage.getItem(`BusinessCatagory`);

      setBusinessDetails(JSON.parse(result));
    };
    getBusinessDetailsFromLocalSorage();
  }, []);

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

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleDataChange = (text) => {
    setData(text);
    if (text.length > 0) {
      setErrrorMsg("");
    }
  };

  const validationSchema = Yup.object().shape({
    description: Yup.string().required("* Description is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      description: "",
    },
  });

  const handleNext = (values) => {
    setIsLoading(true);

    let body = {
      description: values.description,
    };

    console.log("businessDeails", businessDetails?.businessId);
    BusinessService.updateBusinessDescription(businessDetails?.businessId, body)
      .then((res) => {
        console.log(res);
        navigation.navigate("BusinesName");
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error: ", err);
        setIsLoading(false);
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
            {/* <Header title="" /> */}
            <Image
              source={require("../../../assets/busniessicon.png")}
              style={styles.orglogo}
              resizeMode="contain"
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Roboto-Bold",
                fontSize: 17,
                fontWeight: "400",
                color: "#000000",
                marginTop: 15,
                textAlign: "center",
              }}
            >
              {i18n.t("global.description")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Roboto-Bold",
                fontSize: 15,
                fontWeight: "400",
                color: "#000000",
                paddingHorizontal: 24,
                marginTop: 20,
              }}
            >
              {i18n.t("global.tellUsAboutYourBusiness")}
            </Text>
            <View
              style={{
                paddingTop: 15,
                paddingHorizontal: 24,
                flex: 1,
              }}
            >
              <Controller
                name="description"
                control={control}
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    allowFontScaling={false}
                    placeholder={i18n.t("global.enterdescription")}
                    style={{
                      ...styles.inputField,
                      fontSize: 16,
                      fontFamily: "Roboto-Regular",
                      fontWeight: "400",
                      color: "#7C7C7C",
                      paddingLeft: 18,
                      paddingRight: 18,
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
            </View>
            {isLoading ? (
              <Loader />
            ) : (
              <>
                {isKeyboardOpen ? null : (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      position: "absolute",
                      alignItems: "center",
                      alignSelf: "center",
                      bottom: 20,
                    }}
                  >
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
                      onPress={handleSubmit(handleNext)}
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
              </>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BusinesDiscription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
  },
  circlecontainer: {
    width: 85,
    height: 85,
    borderRadius: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputField: {
    width: "100%",
    height: 90,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
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
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
});
