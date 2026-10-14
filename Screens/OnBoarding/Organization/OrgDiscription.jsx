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
import { useNavigation, useRoute } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import OrganizationService from "../../../Services/OrganizationService";
import { UploadDocument } from "../../../Context/helper";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Entypo";
import { useSelector } from "react-redux";

import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const OrgDescription = () => {
  // const router = useRoute();
  const OrganizationData = useSelector(
    (state) => state?.organization?.organizationData
  );
  console.log(OrganizationData?._id, "data org");

  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [document, setDocument] = useState(null);
  const navigation = useNavigation();

  const validationSchema = Yup.object().shape({
    description: Yup.string().required("* Description is required"),
    document: Yup.mixed().required("* Document is required"),
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
      description: "",
      document: null,
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
    console.log("ali");
    console.log("Result: ", result?.response_body?.Location);

    // OrganizationService.createDescription(router?.params?.orgId, {
    OrganizationService.createDescription(OrganizationData?._id, {
      description: values.description,
      pdfUrl: result?.response_body
        ? result?.response_body?.Location
        : "",
    })
      .then((res) => {
        console.log("Res: ", res);
        navigation.navigate("OrgSocial");
        // navigation.navigate("OrgSocial", {
        //   orgId: router?.params?.orgId,
        // });
        setData("");

        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error:", err);
        setIsLoading(false);
      });
  };

  const goBack = () => {
    navigation.goBack();
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (result?.assets?.[0]) {
      setDocument(result);
      setValue("document", result, { shouldValidate: true });
    }
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
              source={require("../../../assets/orglogo.png")}
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
              {i18n.t("global.tellusaboutyourOrganization")}
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
                    placeholder={i18n.t("global.tellusaboutyourOrganization")}
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
                {i18n.t("global.uploadOrganizationDocuments")}
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
            </View>
            <>
              {isLoading ? (
                <>
                  <Loader />
                </>
              ) : (
                <>
                  {isKeyboardOpen ? null : (
                    <View
                      style={{
                        flex: 0.5,
                        flexDirection: "row",
                        justifyContent: "space-around",
                        alignItems: "center",
                        paddingBottom: 40,
                        margin: 20,
                      }}
                    >
                      <TouchableOpacity
                        onPress={goBack}
                        style={{ width: "45%" }}
                      >
                        <LinearGradient
                          colors={["#338AFF", "#00EDB4"]}
                          style={styles.button}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1.2, y: 0.6 }}
                        >
                          <Icon
                            name="chevron-left"
                            size={25}
                            color="#fff"
                            style={{ paddingTop: 3 }}
                          />
                          <Text allowFontScaling={false} style={styles.textbtn}>
                            {i18n.t("global.back")}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleSubmit(handleNext)}
                        style={{ width: "45%" }}
                      >
                        <LinearGradient
                          colors={["#338AFF", "#00EDB4"]}
                          style={styles.button}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1.2, y: 0.6 }}
                        >
                          <Text allowFontScaling={false} style={styles.textbtn}>
                            {i18n.t("global.next")}
                          </Text>
                          <Icon
                            name="chevron-right"
                            size={25}
                            color="#fff"
                            style={{ paddingTop: 3 }}
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default OrgDescription;

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
  button: {
    height: 50,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
    flexDirection: "row",
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
});
