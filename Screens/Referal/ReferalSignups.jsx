import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import ConnectionHeader from "../../Component/ConnectionHeader";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "../../Context/AuthContext";
import userService from "../../Services/userService";
import moment from "moment";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import i18n from "../../Context/i18n";

const ReferalSignups = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;

  console.log(from, pathname, "p2");

  const [details, setDetails] = useState([]);

  const getDetails = () => {
    userService
      .getReferalRewards(user?.user?._id)
      .then((res) => {
        console.log(res?.rewards);
        setDetails(res?.rewards);
      })
      .catch((err) => {
        console.log("Err on getReferalRewards: ", err);
      });
  };

  const addOneYear = (date) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + 1);
    return newDate.toDateString(); // Format as desired
  };

  useFocusEffect(
    React.useCallback(() => {
      getDetails();
    }, [router])
  );

  const handleBack = () => {
    navigation.navigate(from);
  };

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
          <ConnectionHeader handleBack={handleBack} />
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.gradientWrapper}>
              <LinearGradient
                colors={["#F7CC7F", "#F60F0F"]}
                style={styles.hangoutBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.innerText}>
                  {i18n.t("global.signedHangouts")}
                </Text>
              </LinearGradient>
            </View>

            {details.map((signup, index) => (
              <View key={index} style={styles.detailsContainer}>
                <View style={styles.innerContainer}>
                  <AntDesign name="idcard" size={30} color="black" />
                  <View style={styles.textContainer}>
                    <Text style={styles.nameText}>{signup?.businessName}</Text>
                    <Text style={styles.extraText}>
                      {signup?.businessAddress}
                    </Text>
                    <Text style={styles.extraText}>{signup?.businessCity}</Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <Text style={styles.nameText}>
                      {i18n.t("global.signed")}
                    </Text>
                    <Text style={styles.extraText}>
                      {" "}
                      {moment(signup.rewardedAt).format("M/D/YY")}{" "}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.nameText}>
                      {i18n.t("global.renewal")}
                    </Text>
                    <Text style={styles.extraText}>
                      {moment(signup.rewardedAt)
                        .add(1, "years")
                        .format("M/D/YY")}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ReferalSignups;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 46,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  gradientWrapper: {
    paddingTop: 10,
  },
  hangoutBox: {
    width: "90%",
    padding: 14,
    marginHorizontal: 22,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  innerText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000",
  },
  detailsContainer: {
    marginHorizontal: 22,
    padding: 10,
    backgroundColor: "#D9D9D9",
    borderRadius: 6,
    marginBottom: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  dateContainer: {
    flex: 1,
    marginLeft: 10,
  },
  nameText: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#262627",
  },

  extraText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000",
  },
});
