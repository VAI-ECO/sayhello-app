import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Header from "../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import i18n from "../../Context/i18n";

const AmbassadorInfo = () => {
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const clearform = router?.params?.clearform;
  const clearFormAutofill = router?.params?.clearFormAutofill;
  const businessInfo = router?.params?.businessInfo ;

  const detailsParams = router?.params?.details?.business || router?.params?.details;

  console.log(from, from2, from3, pathname, clearform, clearFormAutofill, businessInfo, "p4");
  console.log(detailsParams,"details")
  const navigation = useNavigation();

  const handleBack = () => {
    const params = {
      from: from,
      from2: from2,
      businessInfo: businessInfo
    }
    navigation.navigate(from3, params);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Header title="" handleBack={handleBack} />
        <Image
          source={require("../../assets/busniessicon.png")}
          style={styles.orglogo}
          resizeMode="contain"
        />
        <View style={styles.infoContainer}>
          <Text allowFontScaling={false} style={styles.title}>
            {i18n.t("AmbassadorInfo.title")}
          </Text>
          <Text allowFontScaling={false} style={styles.businessId}>
            {detailsParams?.businessId}
          </Text>
          <Text allowFontScaling={false} style={styles.detailsText}>
            {i18n.t("global.hello")} {detailsParams?.businessName}{" "}
            {i18n.t("AmbassadorInfo.detail")}
            {detailsParams?.protectedUntil} {i18n.t("global.hours")}
          </Text>
          <Text allowFontScaling={false} style={styles.greetingText}>
            {i18n.t("global.hello")} {detailsParams?.businessName}
          </Text>
          <Text allowFontScaling={false} style={styles.businessId}>
            {detailsParams?.businessId}
          </Text>
        </View>
        {detailsParams?.message === "Business is under protection" && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={styles.homeButtonContainer}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
            >
              <TouchableOpacity>
                <View style={styles.homeButton} onPress={() => navigation.navigate("Home")}>
                  <Text allowFontScaling={false} style={styles.buttonText}>
                    {i18n.t("global.home")}
                  </Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default AmbassadorInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 45,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 7,
  },
  infoContainer: {
    paddingTop: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
  },
  businessId: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 15,
  },
  detailsText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
    marginHorizontal: 24,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 25,
  },
  homeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 8,
  },
  button: {
    width: "95%",
    height: 50,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
});




