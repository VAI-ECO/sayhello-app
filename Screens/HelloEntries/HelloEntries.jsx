import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import ProfileHeader from "../../Component/ProfileHeader";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "../../Context/i18n";

const HelloEntries = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
        <View style={styles.container}>
          <ProfileHeader />
          <Image
            style={styles.image}
            source={require("../../assets/newlogosyhello.jpeg")}
          />
          <Image
            style={styles.handwavingimage}
            source={require("../../assets/Say Hellotext new.png")}
          />
          <Image
            style={styles.saytext}
            source={require("../../assets/Congratulations! You have received.png")}
          />
          <Text allowFontScaling={false} style={styles.Text}>
            50 {i18n.t("global.entries")}
          </Text>
        </View>

        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity>
            <Text allowFontScaling={false} style={styles.buttonText}>
            {i18n.t("global.notRightNow")}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default HelloEntries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
  },
  handwavingimage: {
    height: hp(19),
    width: wp(70),
    resizeMode: "contain",
    alignSelf: "center",
  },
  saytext: {
    height: hp(14),
    resizeMode: "contain",
    alignSelf: "center",
  },
  Text: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#338AFF",
    textAlign: "center",
    paddingTop: wp(10),
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 15,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#fff",
    textAlign: "center",
  },
});
