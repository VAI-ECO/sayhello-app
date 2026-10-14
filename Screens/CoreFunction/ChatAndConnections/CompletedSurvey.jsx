import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../../Component/Header";
import OpenChat from "../../../Component/OpenChat";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import userService from "../../../Services/userService";
import i18n from "../../../Context/i18n";
const CompletedSurvey = () => {
  const navigation = useNavigation();
  const [userquestions, setUserQuestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const route = useRoute();
  const name = route?.name;
  const userDetails = route?.params?.userDetails;
  const from = route?.params?.from;
  console.log(from, name, userDetails, "p2")

  const getUserQuestion = () => {
    userService
      .getUserSavedQuestions(userDetails?._id)
      .then((res) => {
        console.log("asdasdadadasdas111", res);
        const data = res;
        setUserQuestions(data);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  const handelNext = () => {
    if (userDetails?.LoveRelation) {
      navigation.navigate("SurveyQuestion", { userDetails: userDetails, from: from, from2: name });
    } else if (userDetails?.BusinessRelation) {
      navigation.navigate("Survey", { userDetails: userDetails, from: from, from3: name });
    } else {
      navigation.navigate("OpenChat", { userDetails: userDetails, from: from, from4: name });
    }
  };

  useEffect(() => {
    if (route.params) {
      getUserQuestion();
    }
  }, [route.params]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      Promise.all([getUserQuestion()])
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    navigation.navigate(from)
  }

  return (
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
              <Header title="" handleBack={handleBack} />
              <TouchableOpacity
                onPress={() => {
                  navigation.openDrawer();
                }}
              >
                <Ionicons
                  name="menu"
                  size={28}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handelNext}>
              <Text allowFontScaling={false} style={styles.nexttext}>
                {i18n.t("global.next")}
              </Text>
            </TouchableOpacity>
            <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: "#000000",
                  fontWeight: "bold",
                  fontSize: 22,
                  fontFamily: "Roboto-Regular",
                  marginBottom: 4,
                }}
              >
                {i18n.t("global.information")}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: "#666666",
                  fontWeight: "400",
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  marginBottom: 30,
                }}
              >
                {i18n.t("global.completedSurveyText")}
              </Text>
            </View>
            <ScrollView>
              {userquestions?.questions?.map((item, index) => (
                <View key={index}>
                  <OpenChat item={item} />
                </View>
              ))}
            </ScrollView>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompletedSurvey;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  image: {
    resizeMode: "cover",
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
  headrecontainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 22,
  },
});
