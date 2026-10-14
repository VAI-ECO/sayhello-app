import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import Header from "../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { useAuth } from "../../Context/AuthContext";
import userService from "../../Services/userService";
import Loader from "../../Component/Loader";
import Toast from "react-native-toast-message";
import i18n from "../../Context/i18n";

const AmbassadorInfoSecond = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const from4 = router?.params?.from4;
  const businessInfo = router?.params?.businessInfo;

  const detailsParams = router?.params?.details;
  const businessId = router?.params?.businessId;

  console.log(from, from2, from3, from4, pathname, businessId, businessInfo, detailsParams, "p5");

  const [isLoading, setIsLoading] = useState(false);

  const handelSMSSend = (phone, id) => {
    setIsLoading(true);

    let bbody = {
      phoneNumber: phone,
      bussinessId: id,
    };
    userService
      .sendSMSTOBussiness(bbody)
      .then((res) => {
        navigation.navigate("Home");
        setIsLoading(false);
        Toast.show({
          type: "success",
          text1: "SMS sent successfully",
        });
      })
      .catch((err) => {
        setIsLoading(false);
        Toast.show({
          type: "error",
          text1: "Something went wrong",
        });
      });
  };

  const handelEmailSend = (email, id) => {
    setIsLoading(true);
    let bbody = {
      email: email,
      bussinessId: id,
    };
    userService
      .sendAmbEmail(bbody)
      .then((res) => {
        navigation.navigate("Home");
        setIsLoading(false);
        Toast.show({
          type: "success",
          text1: "Email sent successfully",
        });
      })
      .catch((err) => {
        setIsLoading(false);
        Toast.show({
          type: "error",
          text1: "Something went wrong",
        });
      });
  };

  const handleBack = () => {
    navigation.navigate(from4, { from: from, from2: from2,from3:from3, businessInfo: businessInfo, businessId: businessId });
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.main}>
        <ImageBackground
          source={require("../../assets/ImageBackground.jpg")}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <Header title="" handleBack={handleBack} />
            <Image
              source={require("../../assets/busniessicon.png")}
              style={styles.orglogo}
              resizeMode="contain"
            />
            {isLoading ? (
              <Loader />
            ) : (
              <>
                <View style={styles.textContainer}>
                  <Text allowFontScaling={false} style={styles.titleText}>
                    {i18n.t("AmbassadorInfoSecond.title")}
                  </Text>
                  <Text allowFontScaling={false} style={styles.referalCode}>
                    {detailsParams?.user?.referalCode}
                  </Text>
                  <Text allowFontScaling={false} style={styles.detailText}>
                    {i18n.t("global.hello")} {detailsParams?.businessName}{" "}
                    {i18n.t("AmbassadorInfoSecond.detail")}
                  </Text>
                  <Text allowFontScaling={false} style={styles.titleText}>
                    {i18n.t("global.hello")} {detailsParams?.businessName}
                  </Text>
                  <Text allowFontScaling={false} style={styles.businessId}>
                    {detailsParams?.businessId}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <LinearGradient
                    colors={["#338AFF", "#00EDB4"]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.2, y: 0.6 }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        handelEmailSend(
                          detailsParams?.email,
                          detailsParams?.businessId
                        )
                      }
                    >
                      <View style={styles.buttonContent}>
                        <Text allowFontScaling={false} style={styles.textbtn}>
                          {i18n.t("global.email")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </LinearGradient>
                  <LinearGradient
                    colors={["#338AFF", "#00EDB4"]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.2, y: 0.6 }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        handelSMSSend(
                          detailsParams?.phone,
                          detailsParams?.businessId
                        )
                      }
                    >
                      <View style={styles.buttonContent}>
                        <Text allowFontScaling={false} style={styles.textbtn}>
                          {i18n.t("global.phone")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default AmbassadorInfoSecond;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageBackground: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    top: 0,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 45,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 7,
  },
  textContainer: {
    paddingTop: 30,
    alignItems: "center",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
  },
  referalCode: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 15,
  },
  detailText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
    marginHorizontal: 24,
  },
  businessId: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 8,
  },
  button: {
    width: "40%",
    height: 45,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textbtn: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
});
