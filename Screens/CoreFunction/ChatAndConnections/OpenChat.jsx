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
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import i18n from "../../../Context/i18n";

const OpenChat = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const name = route?.name;
  const from = route?.params?.from;
  const from2 = route?.params?.from2;
  const from3 = route?.params?.from3;
  const from4 = route?.params?.from4;
  const userDetails = route.params.userDetails;
  const latestNearbyData = route?.params?.latestNearbyData;
  console.log(from, from2, from3, from4, name, userDetails, "p5");

  const handelNotRigthNow = () => {
    navigation.navigate("Home");
  };

  const handeClickGif = () => {
    navigation.navigate("Chat", {
      userDetails: userDetails?._id,
      userName: userDetails?.firstname,
      profileUrl: userDetails?.profileUrl,
    });
  };

  const handleBack = () => {
    navigation.navigate(from4, { from: from, from2: from2, from3: from3, userDetails: userDetails,latestNearbyData:latestNearbyData })
  }

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
        <View style={styles.container}>
          <Header title="" handleBack={handleBack} />
          {userDetails?.profileUrl === "" ? (
            <Image
              source={require("../../../assets/profileimage.png")}
              style={styles.image}
            />
          ) : (
            <Image
              source={{ uri: userDetails?.profileUrl }}
              style={styles.image}
            />
          )}

          <Text allowFontScaling={false} style={styles.basetext}>
            {i18n.t("global.openChatOneText")} {userDetails?.firstname}.{" "}
            {i18n.t("global.openChatSecondText")}
          </Text>
          <TouchableOpacity
            onPress={handeClickGif}
            style={{ width: "15%", alignSelf: "center" }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              style={styles.imagehandGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
            >
              <Image
                style={styles.imagehand}
                source={require("../../../assets/newlogosyhello.jpeg")}
              />
            </LinearGradient>
          </TouchableOpacity>
          <Image
            style={{ resizeMode: "cover", alignSelf: "center" }}
            source={require("../../../assets/Say Hello (1).png")}
          />
          <LinearGradient
            colors={["#338AFF", "#00EDB4"]}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.2, y: 0.6 }}
          >
            <TouchableOpacity
              onPress={handelNotRigthNow}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  fontFamily: "Inter-Regular",
                  color: "#fff",
                }}
              >
                {i18n.t("global.notRightNow")}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default OpenChat;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  image: {
    width: "90%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 20,
    alignSelf: "center",
    paddingHorizontal: 22,
    marginTop: 20,
  },
  basetext: {
    color: "#000000",
    fontWeight: "400",
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
    lineHeight: 24,
    marginHorizontal: 22,
    marginTop: 15,
    marginBottom: 20,
  },
  imagehand: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    borderRadius: 7,
  },
  imagehandGradient: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    backgroundColor: "black",
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 7,
    marginBottom: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    position: "absolute",
    bottom: 7,
  },
});
