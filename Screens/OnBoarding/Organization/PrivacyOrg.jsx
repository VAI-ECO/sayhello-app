import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";

import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import Loader from "../../../Component/Loader";

const PrivacyIndividual = () => {
  const navigation = useNavigation();
  const [acceptTermsAndCondition, setAcceptTermsAndCondition] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAgreePress = () => {
    setAcceptTermsAndCondition(!acceptTermsAndCondition);
  };

  const handleKeepGoing = () => {
    if (acceptTermsAndCondition === true) {
      navigation.navigate("OrganizationName");
    } else {
      Toast.show({
        type: "error",
        text1: "Please agree to the terms and conditions",
        autoHide: true,
        visibilityTime: 5000,
      });
    }
  };

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
        resizeMode="cover"
      >
        <ScrollView>
          <View style={styles.container}>
            <Header title="Privacy" />
            <View style={{ paddingTop: 20, paddingHorizontal: 22 }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: "#666666",
                  fontSize: 16,
                  fontWeight: "400",
                  lineHeight: 24,
                  marginBottom: 20,
                  fontFamily: "Roboto-Regular",
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Id
                diam maecenas ultricies mi eget mauris pharetra. Massa massa
                ultricies mi quis hendrerit dolor. Faucibus ornare suspendisse
                sed nisi lacus sed viverra.
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: "#666666",
                  fontSize: 16,
                  fontWeight: "400",
                  lineHeight: 24,
                  marginBottom: 20,
                  fontFamily: "Roboto-Regular",
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Id
                diam maecenas ultricies mi eget mauris pharetra. Massa massa
                ultricies mi quis hendrerit dolor. Faucibus ornare suspendisse
                sed nisi lacus sed viverra.
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: "#666666",
                  fontSize: 16,
                  fontWeight: "400",
                  lineHeight: 24,
                  marginBottom: 20,
                  fontFamily: "Roboto-Regular",
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Id
                diam maecenas ultricies mi eget mauris pharetra. Massa massa
                ultricies mi quis hendrerit dolor. Faucibus ornare suspendisse
                sed nisi lacus sed viverra.
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 22,
              paddingTop: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Checkbox
                style={{
                  borderRadius: 4,
                  borderColor: "#00EDB4",
                  marginRight: 3,
                  width: 18,
                  height: 18,
                }}
                value={acceptTermsAndCondition}
                onValueChange={setAcceptTermsAndCondition}
                color={acceptTermsAndCondition ? "#338AFF" : ""}
              />
            </View>
            <TouchableOpacity onPress={handleAgreePress}>
              <Text
                allowFontScaling={false}
                style={{
                  color: "#666666",
                  fontSize: 16,
                  fontWeight: "400",
                  fontFamily: "Roboto-Regular",
                  marginLeft: 20,
                }}
              >
                I agree to the terms and conditions
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={() => handleKeepGoing()}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <>
                <Loader />
              </>
            ) : (
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
                  Keep going
                </Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default PrivacyIndividual;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    position: "absolute",
    bottom: 15,
  },
});
