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
  Image,
  RefreshControl,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Feather } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import userService from "../../../Services/userService";
import { useAuth } from "../../../Context/AuthContext";
import i18n from "../../../Context/i18n";

const { width, height } = Dimensions.get("window");
const marginBottom = width <= 360 ? height * 0.001 : width < 768 ? height * 0.001 : height * 0.001;
const marginTop = width <= 360 ? height * 0.002 : width < 768 ? height * 0.01 : height * 0.01

const SurveyQuestion = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const userDetails = route.params.userDetails;
  const name = route?.name;
  const from = route?.params?.from;
  const from2 = route?.params?.from2;

  console.log(from,from2,name,userDetails, "p3")
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [select, setSelect] = useState("");
  const [selecttext, setSelectText] = useState("");
  const [data, setData] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handelNext = () => {
    if (userDetails?.BusinessRelation) {
      navigation.navigate("Survey", { userDetails: userDetails, from: from, from2: from2, from3: name });
    } else {
      navigation.navigate("Home");
    }
  };

  const grabDatingInfo = () => {
    userService
      .getUserDatingDetails(userDetails?._id)
      .then((res) => {
        setText(res?.idealRealtionDesc);
        setSelect(res?.lookingFor);
        setData(res?.perfectDateDescription);
        setSelectText(res?.preferCommunication);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      grabDatingInfo();
    }, [navigation])
  );

  const goBack = () => {
    navigation.goBack();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([grabDatingInfo()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };
  const handleBack = () => {
    navigation.navigate(from2, { from: from, userDetails: userDetails })
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} />
          }
        >
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
              <View style={styles.headrecontainer}>
                <TouchableOpacity onPress={handleBack ? handleBack : goBack}>
                  <Image
                    style={{
                      width: 35,
                      height: 35,
                      resizeMode: "contain",
                    }}
                    source={require("../../../assets/btnbtn.png")}
                  />
                </TouchableOpacity>
                <Image
                  style={{
                    width: 35,
                    height: 35,
                    resizeMode: "contain",
                    // alignSelf: "center",
                  }}
                  source={require("../../../assets/heartcircule.png")}
                />
                <Entypo name="menu" size={26} color="black" />
              </View>
              <TouchableOpacity onPress={handelNext}>
                <Text allowFontScaling={false} style={styles.nexttext}>
                  {i18n.t("global.next")}
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  paddingTop: 15,
                  paddingHorizontal: 20,
                  flex: 1,
                }}
              >
                <ScrollView>
                  <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                  >
                    {/* <Text
                      allowFontScaling={false}
                      style={{
                        marginBottom: 10,
                        color: "#000000",
                        fontWeight: "800",
                        fontSize: 16,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {i18n.t("global.describeIdealRelationship")}
                    </Text>
                    <TextInput
                      allowFontScaling={false}
                      editable={false}
                      placeholder="Text here..."
                      style={{
                        ...styles.inputField,
                        fontSize: 16,
                        fontFamily: "Roboto-Regular",
                        fontWeight: "400",
                        color: "#A7A7A8",
                        height: 120,
                        textAlignVertical: "top",
                        paddingTop: 5,
                        paddingLeft: 20,
                      }}
                      value={text}
                      placeholderTextColor="#A7A7A8"
                    /> */}
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: "#707070",
                        fontWeight: "600",
                        fontSize: 17,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {i18n.t("global.areYouLookingFor")}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={{
                        marginBottom: 10,
                        color: "#338AFF",
                        fontWeight: "600",
                        fontSize: 14,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {i18n.t("global.lookingForText")}
                    </Text>
                    <View
                      style={{
                        ...styles.inputField,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <TextInput
                        allowFontScaling={false}
                        editable={false}
                        placeholder="Select..."
                        style={{
                          width: "90%",
                          fontSize: 16,
                          fontFamily: "Roboto-Regular",
                          fontWeight: "900",
                          color: "#999999",
                          paddingLeft: 20,
                        }}
                        value={select}
                        placeholderTextColor="#999999"
                      />
                      <Feather name="arrow-down" size={20} color="#000000" />
                    </View>

                    <Text
                      allowFontScaling={false}
                      style={{
                        marginBottom: 10,
                        color: "#707070",
                        fontWeight: "600",
                        fontSize: 17,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {i18n.t("global.perfectDateDay")}
                    </Text>
                    <TextInput
                      allowFontScaling={false}
                      editable={false}
                      placeholder="Text here..."
                      style={{
                        ...styles.inputField,
                        fontSize: 16,
                        fontFamily: "Roboto-Regular",
                        fontWeight: "400",
                        color: "#A7A7A8",
                        height: 120,
                        textAlignVertical: "top",
                        paddingTop: 5,
                        paddingLeft: 20,
                      }}
                      value={data}
                      placeholderTextColor="#A7A7A8"
                    />

                    <Text
                      allowFontScaling={false}
                      style={{
                        color: "#707070",
                        fontWeight: "400",
                        fontSize: 17,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {i18n.t("global.communicationPreference")}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={{
                        marginBottom: 10,
                        color: "#338AFF",
                        fontWeight: "600",
                        fontSize: 14,
                        fontFamily: "Inter-Regular",
                      }}
                    >
                      {i18n.t("global.communicationExamples")}
                    </Text>
                    <View
                      style={{
                        ...styles.inputField,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <TextInput
                        allowFontScaling={false}
                        editable={false}
                        placeholder="Select..."
                        style={{
                          width: "90%",
                          fontSize: 16,
                          fontFamily: "Roboto-Regular",
                          fontWeight: "900",
                          color: "#000000",
                          paddingLeft: 20,
                        }}
                        value={selecttext}
                        placeholderTextColor="#000000"
                      />
                      <Feather name="arrow-down" size={20} color="#000000" />
                    </View>
                  </KeyboardAvoidingView>
                </ScrollView>
              </View>
            </View>
          </ImageBackground>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SurveyQuestion;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  headrecontainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: marginBottom,
    marginTop: marginTop,
  },
  inputField: {
    width: "100%",
    height: 60,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    marginBottom: 22,
    alignSelf: "center",
  },
  nexttext: {
    color: "#333333",
    fontWeight: "400",
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    textAlign: "right",
    marginHorizontal: 22,
    paddingTop: 15,
  },
});
