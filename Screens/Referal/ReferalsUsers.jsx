import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import ConnectionHeader from "../../Component/ConnectionHeader";
import DiscountService from "../../Services/DiscountService";
import { useAuth } from "../../Context/AuthContext";
import userService from "../../Services/userService";
import moment from "moment";
import i18n from "../../Context/i18n";

const ReferalsUsers = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [visibleImageId, setVisibleImageId] = useState(null);

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
    }, [navigation])
  );

  const toggleImageVisibility = (id) => {
    setVisibleImageId((prevId) => (prevId === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConnectionHeader />
      <View style={{ paddingTop: 10 }}>
        <LinearGradient
          colors={["#F7CC7F", "#F60F0F"]}
          style={styles.hangoutbox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text allowFontScaling={false} style={styles.innertext}>
            {i18n.t("global.signedHangouts")}
          </Text>
        </LinearGradient>
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 20 }}>
        {details &&
          details?.map((data) => (
            <View key={data?._id} style={styles.detailscontainer}>
              <View style={styles.innerContainer}>
                <Image
                  style={styles.icon}
                  source={require("../../assets/hosstsa.png")}
                />

                <View style={{ marginLeft: 5, flex: 1 }}>
                  <Text allowFontScaling={false} style={styles.nameText}>
                    {data?.businessName}
                  </Text>

                  <Text allowFontScaling={false} style={styles.categoryText}>
                    {moment(data.rewardedAt).format("M/D/YY")}
                  </Text>

                  <Text allowFontScaling={false} style={styles.categoryText}>
                    {moment(data.rewardedAt).add(1, "years").format("M/D/YY")}
                  </Text>
                </View>
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReferalsUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 46,
  },
  hangoutbox: {
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
  innertext: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
  detailscontainer: {
    borderRadius: 16,
    marginHorizontal: 22,
    borderColor: "#000000",
    marginBottom: 10,
    borderWidth: 1,
    padding: 5,
    backgroundColor: "#D9D9D9",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 5,
  },
  mainicon: {
    width: 55,
    height: 55,
    resizeMode: "cover",
    alignSelf: "center",
    marginRight: 10,
    borderRadius: 10,
  },
  appleinercontainer: {
    backgroundColor: "#F30A0A",
    height: 35,
    width: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 8,
    marginHorizontal: 5,
    marginBottom: 5,
  },

  nameText: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#262627",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },

  textbtn: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
  },
  icon: {
    resizeMode: "contain",
    height: 50,
    width: 50,
  },
  postButtonContainer: {
    width: "100%",
    padding: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 22,
  },
  postbtn: {
    width: "100%",
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
  },
});
