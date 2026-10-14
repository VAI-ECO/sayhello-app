import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import ConnectionHeader from "../../Component/ConnectionHeader";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "../../Context/AuthContext";
import userService from "../../Services/userService";
import i18n from "../../Context/i18n";

const referralData = [
  {
    icon: require("../../assets/hanfref.png"),
    name: "Harry’s Hot Chicke",
    address: "879 main street",
    city: "Shaboygan Wi 58293",
    timeLeft: "36:45",
  },
  {
    icon: require("../../assets/hangicint.png"),
    name: "Harry’s Hot Chicke",
    address: "879 main street",
    city: "Shaboygan Wi 58293",
    timeLeft: "36:45",
  },
  {
    icon: require("../../assets/visticon.png"),
    name: "Harry’s Hot Chicke",
    address: "879 main street",
    city: "Shaboygan Wi 58293",
    timeLeft: "36:45",
  },
];

const MySignups = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;

  console.log(from, pathname, "p2");

  const [details, setDetails] = useState([]);

  const getDetails = () => {
    userService
      .getUserRefereal(user?.user?.referalCode)
      .then((res) => {
        console.log(res);
        setDetails(res);
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
    }, [navigation])
  );

  const handleBack = () => {
    navigation.navigate(from);
  };
  const renderReferralItem = (item, index) => (
    <View key={index} style={styles.detailsContainer}>
      <View style={styles.innerContainer}>
        {item.user_type === "individual" && (
          <Image
            style={styles.icon}
            source={require("../../assets/hanfref.png")}
          />
        )}
        {item.user_type === "organization" && (
          <Image
            style={styles.icon}
            source={require("../../assets/hanfref.png")}
          />
        )}
        {item.user_type === "group" && (
          <Image
            style={styles.icon}
            source={require("../../assets/hanfref.png")}
          />
        )}

        {item.user_type === "business" && (
          <Image
            style={styles.icon}
            source={require("../../assets/hangicint.png")}
          />
        )}

        <View style={styles.textContainer}>
          <Text allowFontScaling={false} style={styles.nameText}>
            {item.username}
          </Text>
          {/* <Text allowFontScaling={false} style={styles.categoryText}>
            {item.address}
          </Text>
          <Text allowFontScaling={false} style={styles.categoryText}>
            {item.city}
          </Text> */}
        </View>
        <View style={styles.timeContainer}>
          {/* <Text allowFontScaling={false} style={styles.nameText}>
            Time left
          </Text>
          <Text allowFontScaling={false} style={styles.categoryText}>
            {item.timeLeft}
          </Text> */}
        </View>
        <AntDesign name="idcard" size={30} color="black" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ConnectionHeader handleBack={handleBack} />
          <View style={styles.gradientContainer}>
            <LinearGradient
              colors={["#F7CC7F", "#F60F0F"]}
              style={styles.hangoutBox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innerText}>
                {i18n.t("global.mySignups")}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.headerText}>
            <HeaderTextWithIcon
              iconSource={require("../../assets/hanfref.png")}
              text="Member Referrals"
            />
            <HeaderTextWithIcon
              iconSource={require("../../assets/hangicint.png")}
              text="Business Request"
            />
            <HeaderTextWithIcon
              iconSource={require("../../assets/visticon.png")}
              text="Visited Unsigned"
            />
          </View>
          {details.map(renderReferralItem)}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const HeaderTextWithIcon = ({ iconSource, text }) => (
  <View style={styles.headerItem}>
    <Image style={styles.headerIcon} source={iconSource} />
    <Text allowFontScaling={false} style={styles.text}>
      {text}
    </Text>
  </View>
);

export default MySignups;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 46,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gradientContainer: {
    paddingTop: 10,
  },
  hangoutBox: {
    width: "90%",
    padding: 14,
    paddingHorizontal: 22,
    marginHorizontal: 22,
    borderRadius: 15,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  innerText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
  headerText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  headerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  headerIcon: {
    resizeMode: "contain",
    height: 20,
    width: 20,
    marginRight: 2,
  },
  text: {
    fontSize: 12,
    fontFamily: "Roboto-Bold",
    color: "#000000",
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
    justifyContent: "flex-start",
  },
  icon: {
    resizeMode: "contain",
    height: 33,
    width: 33,
  },
  textContainer: {
    marginLeft: 5,
    flex: 1,
  },
  timeContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#262627",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },
});
