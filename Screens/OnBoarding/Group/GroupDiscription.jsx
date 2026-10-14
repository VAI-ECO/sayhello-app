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
import * as DocumentPicker from "expo-document-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import GroupService from "../../../Services/GroupService";
import { UploadDocument } from "../../../Context/helper";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import i18n from "../../../Context/i18n";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

const GroupDiscription = () => {
  // const router = useRoute();

  const GroupData = useSelector((state) => state?.group?.groupData);
  console.log(GroupData?._id, "group data");

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState("");
  const [document, setDocument] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const navigation = useNavigation();

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",

    });
    if (result?.assets?.[0]) {
      setDocument(result);
      setValue("document", result, { shouldValidate: true })
    }
  };

  const validationSchema = Yup.object().shape({
    description: Yup.string().required("* Description is required"),
    document: Yup.mixed().required("* Document is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      description: "",
      document: null
    },
  });

  const handleNext = async (values) => {
    setIsLoading(true);

    let result = await UploadDocument(document?.assets?.[0]);
    if (document?.assets?.[0] && !result?.response_body?.Location) {
      setIsLoading(false);
      Toast.show({ type: "error", text1: "Document upload failed. Please try again." });
      return;
    }
    // console.log("Result: ", router);
    // GroupService.createDescription(router?.params?.groupId, {
    GroupService.createDescription(GroupData?._id, {
      description: values.description,

      // description: data,
      pdfUrl: result?.response_body
        ? result?.response_body?.Location
        : "",
    })
      .then((res) => {
        navigation.navigate("GroupSocial");
        // navigation.navigate("GroupSocial", {
        //   groupId: router?.params?.groupId,
        // });
        setData("");
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error:", err);
        Toast.show({
          type: "error",
          text1: err.message,
          autoHide: true,
        });
        setIsLoading(false);
      });
  };

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
              source={require("../../../assets/Group.png")}
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
              {i18n.t("global.tellUsAboutYourGroup")}

            </Text>
            <View
              style={{
                paddingTop: 15,
                paddingHorizontal: 24,
                flex: 1,
              }}
            >
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    allowFontScaling={false}
                    placeholder=""
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
              {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Bold",
                  fontSize: 15,
                  fontWeight: "400",
                  color: "#000000",
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                {" "}
                {i18n.t("global.uploadGroupDocuments")}
              </Text>

              <Controller
                control={control}
                name="document"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TouchableOpacity
                    style={{ width: "20%", alignSelf: "center" }}
                    onPress={pickDocument}
                  >
                    <Image
                      style={{
                        width: 140,
                        height: 130,
                        resizeMode: "contain",
                        alignSelf: "center",
                      }}
                      source={require("../../../assets/uplodedpdf.png")}
                    />
                  </TouchableOpacity>
                )}
              />
              {errors.document && (
                <Text style={styles.errorText}>{errors.document.message}</Text>
              )}

              {document && (
                <View style={{ flexDirection: "row", marginTop: 10 }}>
                  <Text style={{ color: "#000000", fontSize: 16 }}>
                    {document?.assets?.[0]?.name}
                  </Text>
                </View>
              )}
            </View>

            <>
              {isKeyboardOpen ? null : (
                <TouchableOpacity
                  onPress={handleSubmit(handleNext)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    position: "absolute",
                    alignItems: "center",
                    alignSelf: "center",
                    bottom: 20,
                  }}
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
                        {isLoading ? <Loader /> :
                          <Text
                            allowFontScaling={false}
                            style={styles.textbtn}
                          >
                            {i18n.t("global.next")}
                          </Text>
                        }
                      </View>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default GroupDiscription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
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
    width: "94%",
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
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
});
