import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Image,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../Component/Header";
import i18n from "../../Context/i18n";

const ResetPassword = () => {
  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <ImageBackground
          source={require("../../assets/ImageBackground.jpg")}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            flex: 1,
            left: 0,
            top: 0,
          }}
        >
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                }}
              >
                <TouchableOpacity
                  onPress={goBack}
                  style={{
                    width: "14%",
                    justifyContent: "flex-start",
                  }}
                >
                  <Image
                    style={{
                      width: 35,
                      height: 35,
                      resizeMode: "contain",
                    }}
                    source={require("../../assets/btnbtn.png")}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ width: "30%", alignItems: "center" }}>
                <Image
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain"
                />
              </View>
            </View>
            <TouchableWithoutFeedback
              onPress={() => {
                Keyboard.dismiss();
              }}
            >
              <View style={styles.container}>
                <Text allowFontScaling={false} style={styles.heading}>
                  {i18n.t("global.resetPassword")}
                </Text>
                <Text allowFontScaling={false} style={styles.description}>
                  {i18n.t("global.selectverificationmethodndwewillsendverificationcode")}
                </Text>

                <TouchableOpacity
                  style={styles.methodContainer}
                  onPress={() => {
                    navigation.navigate("ResetPassEmail");
                  }}
                >
                  <View>
                    <FontAwesome name="envelope" size={24} color="#484848" />
                  </View>
                  <View>
                    <Text
                      allowFontScaling={false}
                      style={styles.methodContainerText}
                    >
                      {i18n.t("global.email")}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.methodContainerDescription}
                    >
                      {i18n.t("global.sendOTPonyouremail")}
                    </Text>
                  </View>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.methodContainer}
                  onPress={() => {
                    navigation.navigate("ResetPassPhone");
                  }}
                >
                  <View>
                    <FontAwesome name="envelope" size={24} color="#484848" />
                  </View>
                  <View>
                    <Text
                      allowFontScaling={false}
                      style={styles.methodContainerText}
                    >
                      Phone
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.methodContainerDescription}
                    >
                      Send OTP on your phone
                    </Text>
                  </View>
                </TouchableOpacity> */}
              </View>
            </TouchableWithoutFeedback>
          </>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#C7E8E3",
    alignItems: "center",
    // paddingTop: 40,
  },
  container: {
    paddingHorizontal: 20,
  },
  heading: {
    fontFamily: "Inter-Regular",
    fontSize: 20,
    color: "#000000",
  },
  description: {
    color: "#000000",
    fontWeight: "400",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  methodContainer: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#45B29F",
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
    gap: 20,
  },
  methodContainerText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#484848",
  },
  methodContainerDescription: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#484848",
  },
});
