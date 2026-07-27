import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Keyboard,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { BackHandler, Platform } from "react-native";
import i18n from "../../../Context/i18n";

const InfluncerIntro = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const backAction = () => {
      if (Platform.OS === "android") {
        return false; // Prevent Android hardware back button from navigating back
      } else {
        navigation.goBack(); // Handle iOS navigation logic
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
  return (
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
      >
        <ScrollView>
          <View style={styles.container}>
            {/* <Header title="" /> */}
            <Image
              style={{
                width: "90%",
                resizeMode: "contain",
                alignSelf: "center",
              }}
              source={require("../../../assets/imageinflulecer.png")}
            />

            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Stay Dreaming",
                fontSize: 50,
                fontWeight: "600",
                color: "#000000",
                textAlign: "center",
              }}
            >
              {i18n.t("global.helloInfluencers")}
            </Text>
            <Image
              style={{
                resizeMode: "contain",
                alignSelf: "center",
              }}
              source={require("../../../assets/influlencerlog.png")}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Roboto-Regular",
                fontSize: 16,
                fontWeight: "900",
                color: "#000000",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              {i18n.t("InfluncerIntro.text")}
            </Text>
            <Text allowFontScaling={false} style={styles.text}>
              {i18n.t("InfluncerIntro.textone")}
            </Text>
            <Text allowFontScaling={false} style={styles.headingtext}>
              {i18n.t("InfluncerIntro.texttwo")}
            </Text>
            <Text allowFontScaling={false} style={styles.text}>
              {i18n.t("InfluncerIntro.textthree")}
            </Text>
            <Text allowFontScaling={false} style={styles.headingtext}>
              {i18n.t("global.WhySayHello")}
            </Text>
            <Text allowFontScaling={false} style={styles.text}>
              {i18n.t("InfluncerIntro.textfour")}
            </Text>

            <View
              style={{
                alignSelf: "center",
                width: "90%",
                bottom: 0,
                marginBottom: 5,
                marginTop: 35,
              }}
            >
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate("InfluncerSignUp")}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <>
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        fontFamily: "Inter-Regular",
                        color: "#fff",
                      }}
                    >
                      {i18n.t("global.createMyProfile")}
                    </Text>
                  </>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default InfluncerIntro;

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
  },
  text: {
    fontFamily: "Roboto-Regular",
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
    marginHorizontal: 20,
    lineHeight: 20,
    textAlign: "center",
  },
  headingtext: {
    fontFamily: "Roboto-Regular",
    fontSize: 15,
    fontWeight: "900",
    color: "#000000",
    marginHorizontal: 20,
    lineHeight: 20,
    textAlign: "center",
  },
});
