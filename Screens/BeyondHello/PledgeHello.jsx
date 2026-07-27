import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Linking,
  ImageBackground,
} from "react-native";
import React from "react";
import ProfileHeader from "../../Component/ProfileHeader";
import { LinearGradient } from "expo-linear-gradient";
import BeyondHeaderersec from "../../Component/BeyondHeaderersec";
import i18n from "../../Context/i18n";

const PledgeHello = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/ImageBackground.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <ProfileHeader />
          <LinearGradient
            colors={["#EAE3376B", "#EAE3376B"]}
            style={styles.circlecontainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0 }}
          >
            <Image
              style={styles.icon}
              source={require("../../assets/hnadheart.png")}
            />
            <Text allowFontScaling={false} style={styles.innertext}>
              {i18n.t("global.beyondHello")}
            </Text>
          </LinearGradient>
          <View style={styles.topNegativeMargin}>
            <View style={styles.headerRow}>
              <Image
                style={styles.adobeStock}
                source={require("../../assets/AdobeStock.png")}
              />
              <Image
                style={styles.adobe}
                source={require("../../assets/Adobe.png")}
              />
            </View>
            <BeyondHeaderersec />
            <Text allowFontScaling={false} style={styles.comingSoonText}>
              {i18n.t("global.comingSoon")}
            </Text>
            <Image
              style={styles.beyondHelloImage}
              source={require("../../assets/Beyond Hello.png")}
            />
            <Text allowFontScaling={false} style={styles.pledgeText}>
              {i18n.t("global.pledgeText")}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
  
};

export default PledgeHello;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    top: 0,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  icon: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 45,
    height: 45,
  },
  circlecontainer: {
    width: 95,
    height: 95,
    borderRadius: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  innertext: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
  topNegativeMargin: {
    top: -100,
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  adobeStock: {
    resizeMode: "contain",
    alignSelf: "center",
    height: "65%",
  },
  adobe: {
    resizeMode: "contain",
    alignSelf: "center",
    width: "33%",
  },
  comingSoonText: {
    fontFamily: "Roboto-Bold",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 20,
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
  },
  beyondHelloImage: {
    height: 37,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  pledgeText: {
    fontFamily: "Roboto-Regular",
    fontSize: 17,
    fontWeight: "400",
    color: "#000000",
    paddingLeft: 20,
    lineHeight: 22,
  },
});

