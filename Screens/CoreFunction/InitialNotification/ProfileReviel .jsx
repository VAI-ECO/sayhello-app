import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  BackHandler,
} from "react-native";
import moment from "moment";
import React, { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useAuth } from "../../../Context/AuthContext";
import i18n from "../../../Context/i18n";

const ProfileReviel = () => {
  const { endNotificationFlow } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const name = route?.name;
  const latestNearbyData = route?.params?.latestNearbyData;

  console.log( name,latestNearbyData, "p2");


  console.log("route?.params ali: ", latestNearbyData);

  
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        endNotificationFlow();
        return true;
      }
    );

    return () => {
      backHandler.remove(); // Cleanup when the component unmounts
    };
  }, []);

  const goBack = () => {
    endNotificationFlow();
  };

  const handleSelfiButton = () => {
    console.log("hadning the user id: ", latestNearbyData?._id);
    navigation.navigate("TakeSelfi", {
      seconduserid: latestNearbyData?._id,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
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
              <View
                style={{
                  paddingHorizontal: 22,
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity onPress={goBack}>
                  <Image
                    style={{
                      width: 35,
                      height: 35,
                      resizeMode: "cover",
                    }}
                    source={require("../../../assets/btnbtn.png")}
                  />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      fontFamily: "Roboto-Regular",
                      marginRight: 20,
                    }}
                  >
                    {i18n.t("global.profile")}
                  </Text>
                </View>
              </View>
              {latestNearbyData?.profileUrl === "" ? (
                <Image
                  source={require("../../../assets/profileimage.png")}
                  style={styles.image}
                />
              ) : (
                <Image
                  source={{ uri: latestNearbyData?.profileUrl }}
                  style={styles.image}
                />
              )}
              {/* <Image
                source={{ uri: latestNearbyData?.profileUrl }}
                style={styles.image}
              /> */}
              <View style={styles.maincontainer}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("QRScan", {
                      latestNearbyData: latestNearbyData && latestNearbyData,
                    })
                  }
                >
                  <View style={styles.innercinatiner}>
                    <MaterialCommunityIcons
                      name="line-scan"
                      size={33}
                      color="black"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  // onPress={() =>
                  //   navigation.navigate("QRScan", {
                  //     latestNearbyData: latestNearbyData && latestNearbyData,
                  //   })
                  // }
                  onPress={() =>
                    navigation.navigate("QRScreen", {
                      latestNearbyData: latestNearbyData && latestNearbyData,
                      from4:name,
                    })
                  }
                >
                  <Image
                    style={styles.imagelike}
                    source={require("../../../assets/like.png")}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("OpenChat", {
                      userDetails: latestNearbyData && latestNearbyData,
                      from4:name,
                      latestNearbyData:latestNearbyData
                    })
                  }
                >
                  <View style={styles.innercinatiner}>
                    <MaterialCommunityIcons
                      name="message-text"
                      size={35}
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
              {/* <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity onPress={handleSelfiButton}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Entypo
                        name="chevron-small-left"
                        size={28}
                        color="#fff"
                      />
                      <Text allowFontScaling={false}
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          fontFamily: "Roboto-Regular",
                          color: "#fff",
                          textAlign: "center",
                        }}
                      >
                        TakeSelfie
                      </Text>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </View> */}
              <View style={styles.calenderbox}>
                <View>
                  <Text allowFontScaling={false} style={styles.nametext}>
                    {latestNearbyData && latestNearbyData?.username}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <FontAwesome5 name="calendar-alt" size={20} color="#338AFF" />
                  <Text allowFontScaling={false} style={styles.datetext}>
                    {moment(latestNearbyData && latestNearbyData?.dob).format(
                      "DD/MM/YYYY"
                    )}{" "}
                    Y/o
                  </Text>
                </View>
              </View>
              <Text
                allowFontScaling={false}
                style={{
                  color: "#666666",
                  fontSize: 18,
                  fontWeight: "600",
                  fontFamily: "Roboto-Regular",
                  paddingHorizontal: 22,
                }}
              >
                {latestNearbyData && latestNearbyData?.currentProfession}
              </Text>
              <View style={{ paddingHorizontal: 22, paddingTop: 1 }}>
                <Text allowFontScaling={false} style={styles.abouttext}>
                  About
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: "#000000B2",
                    fontSize: 16,
                    fontWeight: "400",
                    fontFamily: "Roboto-Regular",
                    lineHeight: 24,
                    marginBottom: 15,
                  }}
                >
                  {latestNearbyData && latestNearbyData?.aboutme}
                </Text>
                <Text allowFontScaling={false} style={styles.abouttext}>
                  {i18n.t("global.matchingInterest")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingTop: 15,
                  flexWrap: "wrap",
                }}
              >
                {latestNearbyData &&
                  latestNearbyData?.matchedInterests?.map((interest, index) => (
                    <View
                      key={interest.id || index}
                      style={[styles.interestescontainer, styles.centerContent]}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons
                          name="checkmark-done-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text allowFontScaling={false} style={styles.innertext}>
                          {interest}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
              <View style={{ paddingHorizontal: 22, paddingTop: 10 }}>
                <Text allowFontScaling={false} style={styles.abouttext}>
                  {latestNearbyData && latestNearbyData?.username}’s{" "}
                  {i18n.t("global.otherInterest")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingTop: 15,
                  flexWrap: "wrap",
                }}
              >
                {latestNearbyData &&
                  latestNearbyData?.userInterests?.map((interest, index) => (
                    <View
                      key={interest.id || index}
                      style={[styles.otherinterestesbox, styles.centerContent]}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons
                          name="checkmark-done-outline"
                          size={16}
                          color="#338AFF"
                        />
                        <Text allowFontScaling={false} style={styles.othertext}>
                          {interest?.name}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileReviel;

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
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  datetext: {
    marginLeft: 8,
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
  },
  calenderbox: {
    flexDirection: "row",
    paddingHorizontal: 22,
    paddingTop: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  nametext: {
    color: "black",
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Roboto-Regular",
    textAlign: "center",
  },
  abouttext: {
    color: "black",
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Roboto-Regular",
  },
  interestescontainer: {
    backgroundColor: "#338AFF",
    height: 45,
    width: "29%",
    borderRadius: 7,
    marginBottom: 10,
  },
  innertext: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
  },
  otherinterestesbox: {
    backgroundColor: "#fff",
    height: 45,
    width: "29%",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#338AFF",
    marginBottom: 10,
  },
  othertext: {
    color: "#338AFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "30%",
    borderRadius: 6,
    alignSelf: "center",
    paddingVertical: 3,
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
    marginTop: -10,
    marginBottom: 10,
  },
});
