import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import ProfileHeader from "../../Component/ProfileHeader";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ImageSlider from "../Home/ImageSlider";

const DrawingPrizes = () => {
  const [images, setImages] = useState([
    "https://sayhelloapp.s3.ap-southeast-2.amazonaws.com/prize1.png",
    "https://sayhelloapp.s3.ap-southeast-2.amazonaws.com/prize2.png",
    "https://sayhelloapp.s3.ap-southeast-2.amazonaws.com/prize3.png",
    "https://sayhelloapp.s3.ap-southeast-2.amazonaws.com/prize4.png",
  ]);
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
        <ScrollView>
          <View style={styles.container}>
            <ProfileHeader />
            <Image
              source={require("../../assets/price.png")}
              style={styles.orglogo}
              resizeMode="contain"
            />
            <Image
              source={require("../../assets/Drawings & Prizes.png")}
              style={{
                resizeMode: "contain",
                alignSelf: "center",
                width: wp(83),
                top: -7,
              }}
              resizeMode="contain"
            />
            <ImageSlider images={images} />

            <Text style={styles.Title}>Giveaways & Future Rewards </Text>
            <Text style={styles.sectionTitle}>
              Exciting Rewards Await – Stay Tuned!
            </Text>
            <Text style={styles.text}>
              We’re thrilled to share that exciting giveaways will be coming
              your way after our beta phase concludes. Amazing rewards,
              exclusive experiences, and more surprises are in store!
            </Text>
            <Text style={styles.Titletwo}>General Conditions:</Text>
            <Text style={styles.text}>
              This contest is in no way sponsored, endorsed, administered by, or
              associated with Apple Inc .By participating, you agree to release
              and hold harmless Apple Inc. from any and all liability.
            </Text>
            <Text style={styles.Titletwo}>Stay Connected for Updates:</Text>
            <Text style={styles.text}>Download and explore.</Text>
            <Text style={styles.text}>
              Be among the first to know when our giveaway goes live!
            </Text>
            <Text style={styles.Titletwo}>Check Back for Details:</Text>
            <Text style={styles.text}>
              Prize information, eligibility, and participation rules will be
              shared closer to the launch date.
            </Text>
            <Text style={styles.Titletwo}>
              No purchase necessary. Void where prohibited.
            </Text>
            <Text style={styles.text}>
              Keep the focus on future rewards after beta testing.{"\n"}
              Ensure official rules are published before launching the giveaway.
              {"\n"}
              Avoid mentioning specific unconfirmed prizes until they are
              finalized. Avoid mandatory user actions tied to prize eligibility
              (e.g., "Take a Selfie").
            </Text>
          </View>
        </ScrollView>
        <Text></Text>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default DrawingPrizes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: hp("8%"),
    width: wp("90%"),
    top: -15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 5,
  },
  Title: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Roboto-Bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    lineHeight: 18,
    marginHorizontal: 20,
  },
  Titletwo: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Roboto-Bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 5,
    marginTop: 10,
  },
});
