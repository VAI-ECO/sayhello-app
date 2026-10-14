import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import Header from "../../../Component/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../../Context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "../../../Context/i18n";

const QRScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();

  const { latestNearbyData } = route.params;

  console.log("latestNearbyDatav", latestNearbyData);

  let id = user?.user?._id;

  const [msg, seMsg] = useState([
    { data: "raheel mubarik", mode: "raheel@Vrox.co.uk" },
  ]);

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
        <ScrollView contentContainerStyle={{ flexGrow: 1 ,  paddingBottom: 150 }}>
          <View style={styles.container}>
            <Header title="" />

            {latestNearbyData?.profileUrl !== "" ? (
              <Image
                source={{ uri: latestNearbyData?.profileUrl }}
                style={styles.image}
              />
            ) : (
              <Image
                source={require("../../../assets/profileimage.png")}
                style={styles.image}
              />
            )}

            <View style={styles.maincontainer}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("QRScan", {
                    latestNearbyData: latestNearbyData && latestNearbyData,
                  })}
              >
              <View style={styles.innercinatiner}>
                <MaterialCommunityIcons
                  name="line-scan"
                  size={28}
                  color="black"
                />
              </View>
              </TouchableOpacity>
              <TouchableOpacity>
              <Image
                style={styles.imagelike}
                source={require("../../../assets/like.png")}
              />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("OpenChat", {
                    userDetails: latestNearbyData && latestNearbyData,
                  })
                }            >
              <View style={styles.innercinatiner}>
                <MaterialCommunityIcons
                  name="message-text"
                  size={30}
                  color="#8A2387"
                />
              </View>
              </TouchableOpacity>
            </View>
            <View style={styles.textcontainer}>
                <Text allowFontScaling={false} style={styles.textmain}>
                  {i18n.t("global.scan")}
                </Text>
                <Text allowFontScaling={false} style={styles.textmain}>
                  {i18n.t("global.qrCode")}
                </Text>
                <Text allowFontScaling={false} style={styles.textmain}>
                  {i18n.t("global.find")}
                </Text>
              </View>
            <Text allowFontScaling={false} style={styles.nametext}>
              {/* {latestNearbyData?.firstname} {latestNearbyData?.lastname} */}
              {user?.user?.firstname} {user?.user?.lastname}
            </Text>
            <View
              style={{
                alignItems: "center",
                paddingTop: 20,
                width: "100%",
                height: 200,
              }}
            >
              <QRCode
                value={id}
                color="#000000"
                size={250}
                logo={require("../../../assets/qr/hand.png")}
                logoBackgroundColor="#fff"
                logoBorderRadius={5}
                logoSize={40}
              />
            </View>
          </View>
        </ScrollView>
        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
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
              {i18n.t("global.goHome")}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default QRScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  image: {
    width: "90%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 20,
    alignSelf: "center",
    paddingHorizontal: 22,
    marginTop: 40,
    top: -17,
  },
  imagelike: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 100,
    height: 100,
  },
  maincontainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "-16%",
  },
  innercinatiner: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textcontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: "25%",
  },
  textmain: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginTop: -8,
  },
  nametext: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    marginHorizontal: 25,
    paddingTop: 25,
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
