import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLocation } from "../../../Context/LocationContext";
import { useAuth } from "../../../Context/AuthContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import userService from "../../../Services/userService";
import i18n from "../../../Context/i18n";

const InitialNotification = () => {
  const { nearbyData } = useLocation();
  const route = useRoute();
  const { startNotificationFlow, addIdToNotRightNow, user } = useAuth();
  const latestNearBy = route?.params?.latestNearBy;

  // console.log("latestNearBy", latestNearBy);

  const navigation = useNavigation();

  const [latestNearbyData, setLatestNearbyData] = useState();

  useEffect(() => {
    if (latestNearBy) {
      setLatestNearbyData(latestNearBy);
    }
  }, [latestNearBy]);

  // let latestNearbyData = nearbyData[0];

  // console.log("latestNearbyData", latestNearbyData);

  const handelNavigation = () => {
    startNotificationFlow();
    userService
      .getIndividualRules()
      .then((res) => {
        console.log("res: ", res?.pointsForAcceptingHelloInvitation);
        userService
          .addDrawingEntries(
            user?.user?._id,
            res?.pointsForAcceptingHelloInvitation
          )
          .then((res) => {
            console.log("res: ", res);
            navigation.navigate("ProfileReviel", {
              latestNearbyData: latestNearbyData,
            });
          })
          .catch((err) => {
            console.log("Err on addDrawingEntries: ", err);
            navigation.navigate("ProfileReviel", {
              latestNearbyData: latestNearbyData,
            });
          });
      })
      .catch((err) => {
        console.log("err on fetching rukes: ", err);
        navigation.navigate("ProfileReviel", {
          latestNearbyData: latestNearbyData,
        });
      });
  };

  const handleNotRightNow = () => {
    if (latestNearbyData && latestNearbyData._id) {
      addIdToNotRightNow(latestNearbyData._id);
    }
    navigation.navigate("Main");
  };

  return (
    <>
      <LinearGradient
        colors={["#338AFF", "#00EDB4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.2, y: 0.6 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.screen}>
          <Image
            style={styles.image}
            source={require("../../../assets/Its time to.png")}
          />
          <TouchableOpacity onPress={handelNavigation}>
            {/* <ImageBackground
              source={require("../../../assets/elipes.png")}
              style={styles.imageBackground}
              resizeMode="contain"
            > */}
            <Image
              style={styles.handwavingimage}
              source={require("../../../assets/hangnewsay.png")}
            />
            {/* </ImageBackground> */}
          </TouchableOpacity>
          <Image
            style={styles.saytext}
            source={require("../../../assets/Say Hellonew.png")}
          />
        </SafeAreaView>
        <View style={styles.button}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleNotRightNow}
          >
            <Text allowFontScaling={false} style={styles.buttonText}>
              {i18n.t("global.notRightNow")}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
};

export default InitialNotification;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  image: {
    width: 280,
    height: 280,
    resizeMode: "contain",
  },
  imageBackground: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    top: -60,
  },
  handwavingimage: {
    // width: wp(80),
    height: hp(25),
    resizeMode: "contain",
    top: -50,
  },
  saytext: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    top: 10,
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 12,
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#338AFF",
  },
});
