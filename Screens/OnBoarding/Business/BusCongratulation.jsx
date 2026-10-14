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
  TextInput,
  ScrollView,
} from "react-native";
import React from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import i18n from "../../../Context/i18n";

const BusCongratulation = () => {
  const navigation = useNavigation();
  // const router = useRoute();

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
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* <Header title="" /> */}
              <Image
                style={{
                  width: "90%",

                  resizeMode: "contain",
                  alignSelf: "center",
                }}
                source={require("../../../assets/businfo.png")}
              />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Bold",
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 10,
                  color: "#000000",
                  textAlign: "center",
                }}
              >
                {i18n.t("global.congratulations")}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Regular",
                  fontSize: 15,
                  fontWeight: "400",
                  textAlign: "center",
                  color: "#000000",
                  marginHorizontal: 22,
                  lineHeight: 22,
                }}
              >
                {i18n.t("BusCongratulation.text")}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Bold",
                  fontSize: 20,
                  fontWeight: "900",
                  marginBottom: 10,
                  color: "#000000",
                  textAlign: "center",
                  marginTop: 15,
                }}
              >
                {i18n.t("global.helloHangoutBenefits")}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Regular",
                  fontSize: 12,
                  fontWeight: "400",
                  marginBottom: 10,
                  color: "#000000",
                  textAlign: "center",
                  marginHorizontal: 22,
                  lineHeight: 18,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Roboto-bold",
                    fontSize: 14,
                    fontWeight: "900",
                  }}
                >
                  {i18n.t("BusCongratulation.textone")}
                </Text>

                {i18n.t("BusCongratulation.texttwo")}
              </Text>
              <View
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 5,
                  width: "90%",
                }}
              >
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={
                      () => navigation.navigate("BusPassword")
                      // navigation.navigate("BusPassword", {
                      //   businessId: router?.params?.businessId,
                      // })
                    }
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
                        {i18n.t("global.itsTimeToSayHello")}
                      </Text>
                    </>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BusCongratulation;

const styles = StyleSheet.create({
  container: {
    paddingTop: 55,
    flex: 1,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
});
