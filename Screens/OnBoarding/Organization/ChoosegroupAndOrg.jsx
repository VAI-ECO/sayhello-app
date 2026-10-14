import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  ImageBackground,
  Image,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import i18n from "../../../Context/i18n";

const ChoosegroupAndOrg = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            style={{ flex: 1 }}
          >
            <View style={styles.contentContainer}>
              <Header title="" />
              <View
                style={{
                  flexDirection: "row",
                  marginVertical: 20,
                  alignSelf: "center",
                }}
              >
                <Image
                  style={styles.image}
                  source={require("../../../assets/org.png")}
                />
                <Image
                  style={styles.image}
                  source={require("../../../assets/grup.png")}
                />
              </View>
              <Text allowFontScaling={false} style={styles.label}>
                {i18n.t("ChoosegroupAndOrg.Welcometo")}
              </Text>
              <Text allowFontScaling={false} style={styles.hello}>
                {i18n.t("global.hello")}
              </Text>
              <Text allowFontScaling={false} style={styles.hello}>
                {i18n.t("ChoosegroupAndOrg.OrganizationsGroups")}
              </Text>
              <Image
                style={{
                  // width: 130,
                  // height: 100,
                  height: hp("10%"),
                  resizeMode: "contain",
                  alignSelf: "center",
                  marginTop: "15%",
                }}
                source={require("../../../assets/Say Hello.png")}
              />
              <View
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
                  <TouchableOpacity
                    onPress={() => navigation.navigate("OrganizationName")}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="business"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 10 }}
                      />
                      <Text allowFontScaling={false} style={styles.textbtn}>
                        {i18n.t("global.Organization")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.buton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={() => navigation.navigate("GroupName")}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name="account-group"
                        size={24}
                        color="#fff"
                        style={{ marginRight: 10 }}
                      />
                      <Text allowFontScaling={false} style={styles.textbtn}>
                        {i18n.t("global.group")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ChoosegroupAndOrg;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 45,
  },
  image: {
    resizeMode: "contain",
    // width: 180,
    // height: 180,
    // width: wp('28%'),
    height: hp("18%"),
    borderRadius: 8,
  },
  label: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "Roboto-Bold",
    textAlign: "center",
    marginBottom: 10,
  },
  hello: {
    color: "#000000",
    fontSize: 24,
    fontWeight: "400",
    fontFamily: "Roboto-Bold",
    textAlign: "center",
    marginBottom: 10,
  },
  buton: {
    width: "40%",
    height: 45,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  textbtn: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
});
